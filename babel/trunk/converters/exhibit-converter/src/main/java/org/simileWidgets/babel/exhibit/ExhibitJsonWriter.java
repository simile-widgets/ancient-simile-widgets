package org.simileWidgets.babel.exhibit;

import info.aduna.iteration.CloseableIteration;

import java.io.OutputStream;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TreeSet;

import org.apache.commons.lang.NotImplementedException;
import org.openrdf.model.BNode;
import org.openrdf.model.Literal;
import org.openrdf.model.Resource;
import org.openrdf.model.Statement;
import org.openrdf.model.URI;
import org.openrdf.model.Value;
import org.openrdf.model.impl.URIImpl;
import org.openrdf.model.vocabulary.RDF;
import org.openrdf.model.vocabulary.RDFS;
import org.openrdf.model.vocabulary.XMLSchema;
import org.openrdf.sail.Sail;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;
import org.simileWidgets.babel.BabelWriter;
import org.simileWidgets.babel.GenericType;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.simileWidgets.babel.util.IndentWriter;
import org.simileWidgets.babel.util.JSObject;
import org.simileWidgets.babel.util.Util;


public class ExhibitJsonWriter implements BabelWriter {

	protected Abbreviation m_typeAbbr = new Abbreviation(false);
	protected Abbreviation m_propertyAbbr = new Abbreviation(true);
	protected Abbreviation m_itemAbbr = new Abbreviation(false);
	
	protected Map<String, Property> m_properties = new HashMap<String, Property>();
	protected Map<String, Type> m_types = new HashMap<String, Type>();
	
	public String getDescription(Locale locale) {
		return "Exhibit JSON Writer";
	}

	public String getLabel(Locale locale) {
		return "Exhibit JSON Writer";
	}

	public SemanticType getSemanticType() {
		return GenericType.s_singleton;
	}

	public SerializationFormat getSerializationFormat() {
		return ExhibitJsonFormat.s_singleton;
	}
	
	public boolean takesWriter() {
		return true;
	}
	
	public void write(OutputStream outputStream, Sail sail, Properties properties, Locale locale) throws Exception {
		throw new NotImplementedException();
	}

	public void write(Writer writer, Sail sail, Properties properties, Locale locale) throws Exception {
		JSObject result = new JSObject();
		
		SailConnection connection = sail.getConnection();
		try {
			internalWrite(connection, result, locale);
			
			IndentWriter indentWriter = new IndentWriter(writer);
			
			JSObject.writeObject(indentWriter, result);
			indentWriter.close();
		} finally {
			connection.close();
		}
	}
	
	protected void internalWrite(SailConnection connection, JSObject result, Locale locale) throws SailException {
		List<JSObject> items = new ArrayList<JSObject>();
		Map<Resource, URI> itemToType = new HashMap<Resource, URI>();
		
        /*
         *  Try to abbreviate items
         */
        CloseableIteration<? extends Statement, SailException> statements =
            connection.getStatements(null, RDF.TYPE, null, true);
        try {
            while (statements.hasNext()) {
                Statement statement = statements.next();
                Value typeV = statement.getObject();
                if (RDF.SEQ.equals(typeV)) {
                    continue;
                }
                
                Resource subject = statement.getSubject();
                itemToType.put(subject, (URI) statement.getObject());
                
                /*
                 *  The other properties
                 */
                CloseableIteration<? extends Statement, SailException> propertyStatements =
                    connection.getStatements(subject, null, null, true);
                try {
                    while (propertyStatements.hasNext()) {
                        Statement propertyStatement = propertyStatements.next();
                        URI predicate = propertyStatement.getPredicate();
                        Value object = propertyStatement.getObject();
                        
                        if (predicate.equals(ExhibitOntology.ID)) {
                            m_itemAbbr.forceAbbreviation(subject, valueToString(object));
                        } else {
                        	// abbreviate the predicate
                        	predicateToID(predicate, connection);
                        }
                    }
                } finally {
                    propertyStatements.close();
                }
            }
        } finally {
            statements.close();
        }
            
		/*
		 * 	Process items
		 */
        for (Resource subject : itemToType.keySet()) {
			URI type = itemToType.get(subject);
			String typeID = typeToID(type, connection);
			if (typeID == null) {
				continue;
			} else {
				Type t = m_types.get(typeID);
				if (t == null) {
					t = new Type();
					m_types.put(typeID, t);
				}
			}
			
			String id = m_itemAbbr.resourceToID(subject);
			String label = guessLabel(subject, connection);
			if (id == null) {
				id = m_itemAbbr.abbreviateResource(subject, label);
			}
			JSObject itemO = new JSObject();
			
			/*
			 *  The must-have properties
			 */
			itemO.put("type", typeID);
			itemO.put("label", label);
			if (!label.equals(id)) {
				itemO.put("id", id);
			}
			if (subject instanceof URI && !((URI) subject).getNamespace().startsWith("http://127.0.0.1/")) {
				itemO.put("uri", ((URI) subject).toString());
			}
			
			/*
			 *  The other properties
			 */
			CloseableIteration<? extends Statement, SailException> propertyStatements =
				connection.getStatements(subject, null, null, true);
			try {
				while (propertyStatements.hasNext()) {
					Statement propertyStatement = propertyStatements.next();
					URI predicate = propertyStatement.getPredicate();
					Value object = propertyStatement.getObject();
					
					String propertyID = predicateToID(predicate, connection);
					if (propertyID != null) {
						if (object instanceof Resource && 
							RDF.SEQ.equals(extract((Resource) object, RDF.TYPE, null, connection))) {
							
							int x = 1;
							Value v;
							while ((v = extract(
											(Resource) object, 
											new URIImpl(RDF.NAMESPACE + "_" + x++), 
											null, 
											connection)) != null) {
								
								putJSObjectProperty(itemO, propertyID, v, itemToType, connection);
							}
						} else {
							putJSObjectProperty(itemO, propertyID, object, itemToType, connection);
						}
					}
				}
			} finally {
				propertyStatements.close();
			}
			
			items.add(itemO);
		}
		result.put("items", items);
		
		/*
		 * 	Process types
		 */
		JSObject typesO = new JSObject();
		for (String id : m_typeAbbr.m_idToResource.keySet()) {
			JSObject typeO = new JSObject();
            String uri = m_typeAbbr.m_idToResource.get(id);
            if (uri != null && !uri.startsWith("http://127.0.0.1/")) {
                typeO.put("uri", uri);
            }
            
			Type type = m_types.get(id);
			if (type.m_label != null) {
				typeO.put("label", type.m_label);
			}
			if (type.m_pluralLabel != null) {
				typeO.put("pluralLabel", type.m_pluralLabel);
			}
			
            if (!typeO.isEmpty()) {
                typesO.put(id, typeO);
            }
		}
        if (!typesO.isEmpty()) {
            result.put("types", typesO);
        }
        
		/*
		 * 	Process properties
		 */
		JSObject propertiesO = new JSObject();
		for (String id : m_propertyAbbr.m_idToResource.keySet()) {
			JSObject propertyO = new JSObject();
            String uri = m_propertyAbbr.m_idToResource.get(id);
            if (uri != null && !uri.startsWith("http://127.0.0.1/")) {
                propertyO.put("uri", uri);
            }
            
			Property property = m_properties.get(id);
			
			double threshold = property.m_total * 3.0 / 4;
			
			if (property.m_items >= threshold) {
				propertyO.put("valueType", "item");
			} else if (property.m_numbers >= threshold) {
				propertyO.put("valueType", "number");
			} else if (property.m_dates >= threshold) {
				propertyO.put("valueType", "date");
			} else if (property.m_booleans >= threshold) {
				propertyO.put("valueType", "boolean");
			} else if (property.m_urls >= threshold) {
				propertyO.put("valueType", "url");
			}
			
			if (property.m_label != null) {
				propertyO.put("label", property.m_label);
			} 
			if (property.m_pluralLabel != null) {
				propertyO.put("pluralLabel", property.m_pluralLabel);
			}
			if (property.m_reverseLabel != null) {
				propertyO.put("reverseLabel", property.m_reverseLabel);
			}
			if (property.m_reversePluralLabel != null) {
				propertyO.put("reversePluralLabel", property.m_reversePluralLabel);
			}
			if (property.m_groupingLabel != null) {
				propertyO.put("groupingLabel", property.m_groupingLabel);
			}
			if (property.m_reverseGroupingLabel != null) {
				propertyO.put("reverseGroupingLabel", property.m_reverseGroupingLabel);
			}
			
            if (!propertyO.isEmpty()) {
                propertiesO.put(id, propertyO);
            }
		}
        if (!propertiesO.isEmpty()) {
            result.put("properties", propertiesO);
        }
	}
	
	protected String valueToString(Value v) {
		return (v instanceof Literal) ? ((Literal) v).getLabel() :
			((Resource) v).toString();
	}
	
	protected String typeToID(Resource type, SailConnection connection) {
		if (type.equals(RDF.SEQ)) {
			return null;
		}
		return m_typeAbbr.abbreviateResource(type, connection);
	}
	
	protected String predicateToID(URI predicate, SailConnection connection) {
		if (predicate.equals(RDF.TYPE) || predicate.equals(RDFS.LABEL) || predicate.equals(ExhibitOntology.ID)) {
			return null;
		} else if (predicate.equals(ExhibitOntology.ORIGIN)) {
			return "origin";
		} else {
			return m_propertyAbbr.abbreviateResource(predicate, connection);
		}
	}
	
	protected String guessLabel(Resource resource, SailConnection connection) {
		Value rdfsLabel = null;
        try {
            rdfsLabel = extract(resource, RDFS.LABEL, null, connection);
        } catch (SailException e) {
            // silent
        }
        
		if (rdfsLabel instanceof Literal) {
			return ((Literal) rdfsLabel).getLabel();
		}
		
		return (resource instanceof URI) ?
			((URI) resource).getLocalName() :
			((BNode) resource).getID();
	}

	protected void putJSObjectProperty(JSObject o, String propertyID, Value value, Map<Resource, URI> itemToType, SailConnection connection) {
		String objectString = null;
		if (value instanceof Resource) {
			Resource r = (Resource) value;
			if (itemToType.containsKey(r)) {
				objectString = m_itemAbbr.abbreviateResource(r, connection);
			} else {
				/*
				 * Don't try to abbreviate resources not included in this data set.
				 * Otherwise, full URIs will get abbreviated.
				 */
				objectString = r.toString();
			}
		} else {
			objectString = ((Literal) value).getLabel();
		}
		
		Property property = m_properties.get(propertyID);
		if (property == null) {
			property = new Property();
			m_properties.put(propertyID, property);
		}
		
		property.m_total++;
		done: {
			if (value instanceof Resource) {
				property.m_items++;
			} else {
				Literal l = (Literal) value;
				URI datatype = l.getDatatype();
				if (datatype != null) {
					if (datatype.equals(XMLSchema.DATE) || 
						datatype.equals(XMLSchema.DATETIME)) {
						
						property.m_dates++;
					} else if (
							datatype.equals(XMLSchema.LONG) ||
							datatype.equals(XMLSchema.INTEGER) ||
							datatype.equals(XMLSchema.NEGATIVE_INTEGER) ||
							datatype.equals(XMLSchema.NON_NEGATIVE_INTEGER) ||
							datatype.equals(XMLSchema.NON_POSITIVE_INTEGER) ||
							datatype.equals(XMLSchema.POSITIVE_INTEGER) ||
							datatype.equals(XMLSchema.INT)) {
						property.m_numbers++;
						
						putJSObjectProperty(o, propertyID, new Long(objectString));
						break done;
					} else if (datatype.equals(XMLSchema.DECIMAL) || 
						datatype.equals(XMLSchema.FLOAT) ||
						datatype.equals(XMLSchema.DOUBLE)) {
						
						property.m_numbers++;
						
						putJSObjectProperty(o, propertyID, new Double(objectString));
						break done;
					} else if (datatype.equals(XMLSchema.BOOLEAN)) {
						property.m_booleans++;
						
						putJSObjectProperty(o, propertyID, new Boolean(objectString));
						break done;
					} else {
						String label = l.getLabel();
						if (label.startsWith("http://") || 
							label.startsWith("https://") || 
							label.startsWith("ftp://")) {
							property.m_urls++;
						}
					}
				}
			}
			putJSObjectProperty(o, propertyID, objectString);
		}
	}
	
	@SuppressWarnings("unchecked")
	protected void putJSObjectProperty(JSObject o, String name, Object value) {
		Object values = o.get(name);
		if (values == null) {
			o.put(name, value);
		} else if (values instanceof Collection) {
			try {
				((Collection) values).add(value);
			} catch (ClassCastException e) {
				// go back to generic objects if there's a casting issue
				List<Object> l = new ArrayList<Object>((Collection) values);
				l.add(value);
				o.put(name, l);
			}
		} else if (values != value) {
			if (value instanceof Long) {
				Set<Long> l = new TreeSet<Long>();
				l.add((Long) values);
				l.add((Long) value);
				o.put(name, l);	
			} else if (value instanceof Double) {
				Set<Double> l = new TreeSet<Double>();
				l.add((Double) values);
				l.add((Double) value);
				o.put(name, l);					
			} else {
				List<Object> l = new ArrayList<Object>();
				l.add(values);
				l.add(value);
				o.put(name, l);
			}
		}
	}
		
	static protected Value extract(Resource subject, URI predicate, Value object, SailConnection connection) throws SailException {
		CloseableIteration<? extends Statement, SailException> statements =
			connection.getStatements(subject, predicate, object, true);
		try {
			while (statements.hasNext()) {
				Statement statement = statements.next();
				if (subject == null) {
					return statement.getSubject();
				} else if (object == null) {
					return statement.getObject();
				} else if (predicate == null) {
					return statement.getPredicate();
				}
				break;
			}
			return null;
		} finally {
			statements.close();
		}
	}
	
	int m_idCount = 0;
	protected class Abbreviation {
		Map<String, String> m_resourceToID = new HashMap<String, String>();
		Map<String, String> m_idToResource = new HashMap<String, String>();
        final boolean m_escapeID;
        
        Abbreviation(boolean escapeID) {
            m_escapeID = escapeID;
        }
        
        public void forceAbbreviation(Resource resource, String id) {
            String resourceString = (resource instanceof URI) ?
                    ((URI) resource).toString() :
                    ((BNode) resource).getID();
                    
            m_idToResource.put(id, resourceString);
            m_resourceToID.put(resourceString, id);
        }
		
		public String resourceToID(Resource resource) {
			if (resource instanceof URI) {
				return m_resourceToID.get(((URI) resource).toString());
			} else {
				return m_resourceToID.get(((BNode) resource).getID());
			}
		}
		
		public String abbreviateResource(Resource resource, SailConnection connection) {
			String id = resourceToID(resource);
			if (id == null) {
				id = abbreviateResource(resource, guessLabel(resource, connection));
			}
			return id;
		}
		
		public String abbreviateResource(Resource resource, String label) {
			String resourceString = (resource instanceof URI) ?
					((URI) resource).toString() :
					((BNode) resource).getID();
			
            if (m_escapeID) {
                label = encodeIDCandidate(label);
            }
            
			if (tryAbbreviate(resourceString, label)) {
				return label;
			}
			
			String localName = Util.decode((resource instanceof URI) ?
					((URI) resource).getLocalName() :
					((BNode) resource).getID());
            localName = encodeIDCandidate(localName);
            
			if (tryAbbreviate(resourceString, localName)) {
				return localName;
			}
			
			String id = localName + "_" + m_idCount++;
			m_idToResource.put(id, resourceString);
			m_resourceToID.put(resourceString, id);
			return id;
		}
        
        private String encodeIDCandidate(String s) {
            return s.replace(' ', '-').replace(':', '-');

        }
		
		private boolean tryAbbreviate(String resourceString, String id) {
			String resourceString2 = m_idToResource.get(id);
			if (resourceString.equals(resourceString2)) {
				return true;
			} else if (resourceString2 == null) { // use label as id
				m_idToResource.put(id, resourceString);
				m_resourceToID.put(resourceString, id);
				
				return true;
			} else {
				return false;
			}
		}
	}
	
	protected class Type {
		String	m_label;
		String	m_pluralLabel;
		
		protected Type() {}
		
		protected Type(String label, String pluralLabel) {
			m_label = label;
			m_pluralLabel = pluralLabel;
		}
	}
	
	protected class Property {
		String	m_label;
		String	m_pluralLabel;
		String	m_reverseLabel;
		String	m_reversePluralLabel;
		String	m_groupingLabel;
		String	m_reverseGroupingLabel;
		
		int		m_total;
		
		int		m_items;
		
		int		m_numbers;
		int		m_dates;
		int		m_booleans;
		int		m_urls;
		
		protected Property() {}
		protected Property(
			String	label,
			String	pluralLabel,
			String	reverseLabel,
			String	reversePluralLabel,
			String	groupingLabel,
			String	reverseGroupingLabel
		) {
			m_label = label;
			m_pluralLabel = pluralLabel;
			m_reverseLabel = reverseLabel;
			m_reversePluralLabel = reversePluralLabel;
			m_groupingLabel = groupingLabel;
			m_reverseGroupingLabel = reverseGroupingLabel;
		}
	}
}
