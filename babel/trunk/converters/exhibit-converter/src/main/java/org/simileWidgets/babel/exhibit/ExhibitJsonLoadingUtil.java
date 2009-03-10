package org.simileWidgets.babel.exhibit;

import info.aduna.iteration.CloseableIteration;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.codec.net.URLCodec;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.openrdf.model.Literal;
import org.openrdf.model.Resource;
import org.openrdf.model.Statement;
import org.openrdf.model.URI;
import org.openrdf.model.Value;
import org.openrdf.model.impl.LiteralImpl;
import org.openrdf.model.impl.URIImpl;
import org.openrdf.model.vocabulary.OWL;
import org.openrdf.model.vocabulary.RDF;
import org.openrdf.model.vocabulary.RDFS;
import org.openrdf.sail.Sail;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;

public class ExhibitJsonLoadingUtil {
    //final static private Logger s_logger = Logger.getLogger(ExhibitJsonLoadingUtil.class);
    
    static public void loadExhibitDataFile(
        Reader                      baseReader,
        String                      url,
        String                      namespace,
        Map<String, NativeObject>   types,
        Map<String, NativeObject>   properties,
        List<NativeObject>          items
    ) throws IOException {
        ChainingReader reader = new ChainingReader();
        reader.addReader(new StringReader("("));
        reader.addReader(baseReader); 
        reader.addReader(new StringReader(")"));
        
        try {
            Context context = Context.enter();
            Scriptable scope = context.initStandardObjects();
            
            Object o = context.evaluateReader(scope, reader, url, 1, null);
            if (o instanceof NativeObject) {
                NativeObject no = (NativeObject) o;
                
                Object typesO = ScriptableObject.getProperty(no, "types");
                if (typesO instanceof NativeObject) {
                    NativeObject typesNO = (NativeObject) typesO;
                    Object[] propertiesIds = ScriptableObject.getPropertyIds(typesNO);
                    
                    for (Object propertyId : propertiesIds) {
                        String typeID = propertyId.toString();
                        Object typeO = ScriptableObject.getProperty(typesNO, typeID);
                        if (typeO instanceof NativeObject) {
                            types.put(typeID, (NativeObject) typeO);
                        }
                    }
                }

                Object propertiesO = ScriptableObject.getProperty(no, "properties");
                if (propertiesO instanceof NativeObject) {
                    NativeObject propertiesNO = (NativeObject) propertiesO;
                    Object[] propertiesIds = ScriptableObject.getPropertyIds(propertiesNO);
                    
                    for (Object propertyId : propertiesIds) {
                        String propertyID = propertyId.toString();
                        Object propertyO = ScriptableObject.getProperty(propertiesNO, propertyID);
                        if (propertyO instanceof NativeObject) {
                            properties.put(propertyID, (NativeObject) propertyO);
                        }
                    }
                }
                
                Object itemsO = ScriptableObject.getProperty(no, "items");
                if (itemsO instanceof NativeArray) {
                    NativeArray itemsArray = (NativeArray) itemsO;
                    
                    long count = itemsArray.getLength();
                    for (int i = 0; i < count; i++) {
                        Object itemO = itemsArray.get(i, itemsArray);
                        if (itemO instanceof NativeObject) {
                            items.add((NativeObject) itemO);
                        }
                    }
                }
            }
        } finally {
            reader.close();
        }
    }
    
    static public void postProcess(
        Map<String, NativeObject> types, 
        Map<String, NativeObject> properties, 
        List<NativeObject> items, 
        String urlSpec, 
        Sail dataSail, 
        Sail metaSail
    ) throws Exception {
        Map<String, Resource> typeIDToResource = new HashMap<String, Resource>();
        Map<String, Resource> propertyIDToResource = new HashMap<String, Resource>();
        
        String baseURL = _getBaseURL(urlSpec);
        Literal origin = (urlSpec == null || urlSpec.length() == 0) ? null : new LiteralImpl(urlSpec);
        
        SailConnection metaConnection = metaSail.getConnection();
        try {
            for (String typeID : types.keySet()) {
                Resource typeResource = _processType(typeID, types.get(typeID), baseURL, metaConnection);
                if (origin != null) {
                    metaConnection.addStatement(typeResource, ExhibitOntology.ORIGIN, origin);
                }
                
                typeIDToResource.put(typeID, typeResource);
            }
            
            for (String propertyID : properties.keySet()) {
            	if (!propertyID.equals("type") && 
            		!propertyID.equals("label") &&
            		!propertyID.equals("uri") &&
            		!propertyID.equals("id")) {
            		
	                Resource propertyResource = _processProperty(propertyID, properties.get(propertyID), baseURL, metaConnection);
                    if (origin != null) {
                        metaConnection.addStatement(propertyResource, ExhibitOntology.ORIGIN, origin);
                    }
                    
	                propertyIDToResource.put(propertyID, propertyResource);
            	}
            }
            
            metaConnection.commit();
            
            Map<String, String> itemIDToURI = new HashMap<String, String>();
            for (NativeObject itemNO : items) {
                String uri = _getStringProperty(itemNO, "uri");
                if (uri != null) {
                    String id = _getStringProperty(itemNO, "id");
                    if (id == null) {
                        id = _getStringProperty(itemNO, "label");
                    }
                    if (id != null) {
                        itemIDToURI.put(id, uri);
                    }
                }
            }
            
            SailConnection dataConnection = dataSail.getConnection();
            try {
                for (NativeObject itemNO : items) {
                    Resource itemResource = _processItem(itemNO, baseURL, dataConnection, metaConnection, itemIDToURI);
                    if (origin != null) {
                        dataConnection.addStatement(itemResource, ExhibitOntology.ORIGIN, origin);
                    }
                }
                
                dataConnection.commit();
            } catch (Exception e) {
                dataConnection.rollback();
                throw e;
            } finally {
                dataConnection.close();
            }
        } catch (Exception e) {
            metaConnection.rollback();
            throw e;
        } finally {
            metaConnection.close();
        }
    }
    
    static protected Resource _processType(String typeID, NativeObject typeNO, String baseURL, SailConnection sailConnection) throws SailException {
        String label = _getStringProperty(typeNO, "label");
        String pluralLabel = _getStringProperty(typeNO, "pluralLabel");
        String uri = _getStringProperty(typeNO, "uri");
        
        if (label == null) {
            label = typeID;
        }
        if (pluralLabel == null) {
            pluralLabel = label;
        }
        if (uri == null) {
            uri = baseURL + _encode(typeID);
        }
        
        Resource resource = new URIImpl(uri);
        sailConnection.addStatement(resource, RDF.TYPE, OWL.CLASS);
        sailConnection.addStatement(resource, ExhibitOntology.ID, new LiteralImpl(typeID));
        sailConnection.addStatement(resource, RDFS.LABEL, new LiteralImpl(label));
        sailConnection.addStatement(resource, ExhibitOntology.PLURAL_LABEL, new LiteralImpl(pluralLabel));
        
        return resource;
    }

    static protected Resource _processProperty(String propertyID, NativeObject propertyNO, String baseURL, SailConnection sailConnection) throws SailException {
        String label = _getStringProperty(propertyNO, "label");
        String pluralLabel = _getStringProperty(propertyNO, "pluralLabel");
        String uri = _getStringProperty(propertyNO, "uri");
        String valueType = _getStringProperty(propertyNO, "valueType");
        
        if (label == null) {
            label = propertyID;
        }
        if (pluralLabel == null) {
            pluralLabel = label;
        }
        if (valueType == null) {
            valueType = "item";
        }
        
        Resource resource;
        try {
            resource = new URIImpl(uri);
        } catch (Exception e) {
            uri = baseURL + _encode(propertyID);
            resource = new URIImpl(uri);
        }
        
        sailConnection.addStatement(resource, RDF.TYPE, RDF.PROPERTY);
        sailConnection.addStatement(resource, ExhibitOntology.ID, new LiteralImpl(propertyID));
        sailConnection.addStatement(resource, RDFS.LABEL, new LiteralImpl(label));
        sailConnection.addStatement(resource, ExhibitOntology.PLURAL_LABEL, new LiteralImpl(pluralLabel));
        sailConnection.addStatement(resource, ExhibitOntology.VALUE_TYPE, new LiteralImpl(valueType));
        
        return resource;
    }
    
    static protected Resource _processItem(
        NativeObject        itemNO, 
        String              baseURL, 
        SailConnection      dataConnection, 
        SailConnection      metaConnection, 
        Map<String, String> itemIDToURI
    ) throws SailException {
        String id = _getStringProperty(itemNO, "id");
        String label = _getStringProperty(itemNO, "label");
        String uri = _getStringProperty(itemNO, "uri");
        
        if (id == null) {
            if (label == null) {
                throw new InternalError("Missing both label and id");
            } else {
                id = label;
            }
        }
        
        Resource itemResource;
        try {
            itemResource = new URIImpl(uri);
        } catch (Exception e) {
            uri = baseURL + _encode(id);
            itemResource = new URIImpl(uri);
        }
        
        String typeID = _getStringProperty(itemNO, "type");
        Resource type;
        if (typeID == null) {
            type = ExhibitOntology.ITEM;
        } else {
            type = _ensureTypeExists(typeID, baseURL, metaConnection);
        }
        
        dataConnection.addStatement(itemResource, RDF.TYPE, type);
        dataConnection.addStatement(itemResource, ExhibitOntology.ID, new LiteralImpl(id));
        if (label != null) {
            dataConnection.addStatement(itemResource, RDFS.LABEL, new LiteralImpl(label));
        }
        
        Object[] propertiesIds = ScriptableObject.getPropertyIds(itemNO);
        for (Object propertyId : propertiesIds) {
            String propertyID = propertyId.toString();
        	if (!propertyID.equals("type") && 
           		!propertyID.equals("label") &&
           		!propertyID.equals("uri") &&
           		!propertyID.equals("id")) {

	            URI predicate = _ensurePropertyExists(propertyID, baseURL, metaConnection);
	            
	            Object valueO = ScriptableObject.getProperty(itemNO, propertyID);
	            if (valueO instanceof NativeArray) {
	                NativeArray valuesArray = (NativeArray) valueO;
	                
	                long count = valuesArray.getLength();
	                for (int i = 0; i < count; i++) {
	                    Object itemO = valuesArray.get(i, valuesArray);
	                    
	                    _addItemProperty(itemResource, predicate, itemO, 
	                            baseURL, dataConnection, metaConnection, itemIDToURI);
	                }
	            } else {
	                _addItemProperty(itemResource, predicate, valueO, 
	                        baseURL, dataConnection, metaConnection, itemIDToURI);
	            }
        	}
        }
        
        return itemResource;
    }
    
    static protected void _addItemProperty(
        Resource            itemResource, 
        URI                 predicate, 
        Object              valueO, 
        String              baseURL,
        SailConnection      dataConnection,
        SailConnection      metaConnection, 
        Map<String, String> itemIDToURI
    ) throws SailException {
        String valueType = _getObjectString(predicate, ExhibitOntology.VALUE_TYPE, metaConnection);
        Value object = null;
        
        if ("item".equals(valueType)) {
            String id = valueO.toString();
            String uri = itemIDToURI.get(id);
            try {
                object = new URIImpl(uri);
            } catch (Exception e) {
                object = new URIImpl(baseURL + _encode(id));
            }
        } else if (valueO instanceof Double) {
        	double d = ((Double) valueO).doubleValue();
        	if (d != Math.floor(d)) {
                object = new LiteralImpl(valueO.toString()/*, XMLSchema.DOUBLE*/);
        	} else {
        		object = new LiteralImpl(Long.toString(((Double)valueO).longValue())/*, XMLSchema.LONG*/);
        	}
        } else {
            object = new LiteralImpl(valueO.toString());
        }
        
        dataConnection.addStatement(itemResource, predicate, object);
    }
    
    static protected Resource _ensureTypeExists(String typeID, String baseURL, SailConnection sailConnection) throws SailException {
        Resource resource = _getSubject(ExhibitOntology.ID, new LiteralImpl(typeID), sailConnection);
        if (resource == null) {
            String label = typeID;
            String pluralLabel = label;
            String uri = baseURL + _encode(typeID);
            
            resource = new URIImpl(uri);
            sailConnection.addStatement(resource, RDF.TYPE, OWL.CLASS);
            sailConnection.addStatement(resource, ExhibitOntology.ID, new LiteralImpl(typeID));
            sailConnection.addStatement(resource, RDFS.LABEL, new LiteralImpl(label));
            sailConnection.addStatement(resource, ExhibitOntology.PLURAL_LABEL, new LiteralImpl(pluralLabel));
            sailConnection.commit();
        }
        return resource;
    }
    
    static protected URI _ensurePropertyExists(String propertyID, String baseURL, SailConnection sailConnection) throws SailException {
        URI predicate = (URI) _getSubject(ExhibitOntology.ID, new LiteralImpl(propertyID), sailConnection);
        if (predicate == null) {
            String label = propertyID;
            String uri = baseURL + _encode(propertyID);
            
            predicate = new URIImpl(uri);
            sailConnection.addStatement(predicate, RDF.TYPE, OWL.CLASS);
            sailConnection.addStatement(predicate, ExhibitOntology.ID, new LiteralImpl(propertyID));
            sailConnection.addStatement(predicate, RDFS.LABEL, new LiteralImpl(label));
            sailConnection.commit();
        }
        return predicate;
    }
    
    static protected Resource _getSubject(URI predicate, Value object, SailConnection c) throws SailException {
    	CloseableIteration<? extends Statement, SailException> i = c.getStatements(null, predicate, object, true);
        try {
            if (i.hasNext()) {
                return i.next().getSubject();
            } else {
                return null;
            }
        } finally {
            i.close();
        }
    }

    static protected String _getObjectString(Resource subject, URI predicate, SailConnection c) throws SailException {
        Value v = _getObject(subject, predicate, c);
        return v instanceof Literal ? ((Literal) v).getLabel() : null;
    }
    
    static protected Value _getObject(Resource subject, URI predicate, SailConnection c) throws SailException {
		CloseableIteration<? extends Statement, SailException> i = 
			c.getStatements(subject, predicate, null, true);
        try {
            if (i.hasNext()) {
                return i.next().getObject();
            } else {
                return null;
            }
        } finally {
            i.close();
        }
    }

    static protected String _getStringProperty(NativeObject no, String name) {
        Object o = ScriptableObject.getProperty(no, name);
        return o instanceof String ? (String) o : null;
    }


    static protected String _getBaseURL(String url) {
        if (url == null || url.length() == 0) { 
            return "http://127.0.0.1/";
        }
        
        int pound = url.indexOf('#');
        if (pound > 0) {
            return url.substring(0, pound + 1);
        }
        
        int question = url.lastIndexOf('?');
        if (question > 0) {
            url = url.substring(0, question);
        }
        
        if (url.charAt(url.length() - 1) == '/') {
            return url;
        } else {
            return url + "#";
        }
    }
    
    private static final URLCodec codec = new URLCodec();
    static protected String _encode(String s) {
        try {
            return codec.encode(s, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            return s; // should not happen
        }
    }
}
