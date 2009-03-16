package org.simileWidgets.babel.kml;

import java.io.InputStream;
import java.io.Reader;
import java.util.Locale;
import java.util.Properties;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.commons.codec.net.URLCodec;
import org.apache.commons.lang.NotImplementedException;
import org.apache.commons.lang.StringUtils;
import org.openrdf.model.URI;
import org.openrdf.model.impl.LiteralImpl;
import org.openrdf.model.impl.URIImpl;
import org.openrdf.model.vocabulary.RDF;
import org.openrdf.model.vocabulary.RDFS;
import org.openrdf.sail.Sail;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;
import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.GenericType;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.simileWidgets.babel.exhibit.ExhibitOntology;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;


public class KMLReader implements BabelReader {
    public static final String GEO_NAMESPACE = "http://www.simile-widgets.org/2009/03/exhibit-geo#";
    public final static URI PLACEMARK = new URIImpl(GEO_NAMESPACE + "Placemark");
    public final static URI LATLNG = new URIImpl(GEO_NAMESPACE + "latlng");
    public final static URI POLYLINE = new URIImpl(GEO_NAMESPACE + "polyline");
    public final static URI POLYGON = new URIImpl(GEO_NAMESPACE + "polygon");
    
    public String getDescription(Locale locale) {
        return "KML file reader";
    }

    public String getLabel(Locale locale) {
        return "KML Reader";
    }

    public SemanticType getSemanticType() {
        return GenericType.s_singleton;
    }
    
    public SerializationFormat getSerializationFormat() {
        return KMLFormat.s_singleton;
    }

    public boolean takesReader() {
        return false;
    }
    
    public void read(InputStream inputStream, Sail sail, Properties properties, Locale locale) throws Exception {
        Document dom;
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            DocumentBuilder db = dbf.newDocumentBuilder();
            dom = db.parse(inputStream);
        } catch (Exception e) {
            throw e;
        }
        
        Element root = dom.getDocumentElement();
        NodeList placemarkNodes = root.getElementsByTagName("Placemark");
        if (placemarkNodes == null || placemarkNodes.getLength() == 0) {
            return;
        }
        
        SailConnection c = sail.getConnection();
        try {
            String namespace = properties.getProperty("namespace");
            
            for (int i = 0; i < placemarkNodes.getLength(); i++) {
                Element placemarkNode = (Element) placemarkNodes.item(i);
                
                String name = getChildString(placemarkNode, "name", "Placemark " + (i + 1));
                String id = placemarkNode.getAttribute("id");
                if (id == null || id.length() == 0) {
                    id = name;
                }
                
                URI uri = new URIImpl(namespace + encode(id)); 
                
                c.addStatement(uri, RDF.TYPE, PLACEMARK);
                c.addStatement(uri, RDFS.LABEL, new LiteralImpl(name));
                c.addStatement(uri, ExhibitOntology.ID, new LiteralImpl(id));
                
                Element geometryNode = getOneChild(placemarkNode, "Point");
                if (geometryNode != null) {
                    String coordinates = getChildString(geometryNode, "coordinates", null);
                    if (coordinates != null) {
                        c.addStatement(uri, LATLNG, new LiteralImpl(coordinates));
                    }
                }
                
                geometryNode = getOneChild(placemarkNode, "LineString");
                if (geometryNode != null) {
                    String coordinates = getChildString(geometryNode, "coordinates", null);
                    if (coordinates != null) {
                        c.addStatement(uri, POLYLINE, new LiteralImpl(triplesToPairs(coordinates)));
                    }
                }
                
                geometryNode = getOneChild(placemarkNode, "Polygon");
                if (geometryNode != null) {
                    String coordinates = getChildString(geometryNode, "coordinates", null);
                    if (coordinates != null) {
                        c.addStatement(uri, POLYGON, new LiteralImpl(triplesToPairs(coordinates)));
                    }
                }
            }
            c.commit();
        } catch (SailException e) {
            c.rollback();
            throw e;
        } finally {
            c.close();
        }
    }
    
    public void read(Reader reader, Sail sail, Properties properties, Locale locale) throws Exception {
        throw new NotImplementedException();
    }
    
    protected String triplesToPairs(String coordinates) {
        StringBuffer sb = new StringBuffer();
        
        String[] triples = StringUtils.split(coordinates);
        for (String t : triples) {
            String[] triple = StringUtils.split(t, ',');
            
            if (sb.length() > 0) {
                sb.append(';');
            }
            sb.append(triple[0]);
            sb.append(',');
            sb.append(triple[1]);
        }
        return sb.toString();
    }
    
    protected String getChildString(Element elmt, String name, String def) {
        Element child = getOneChild(elmt, name);
        String text = child != null ? child.getTextContent() : null;
        return text != null && text.length() > 0 ? text : def;
    }
    
    protected Element getOneChild(Element elmt, String name) {
        NodeList list = elmt.getElementsByTagName(name);
        return list != null && list.getLength() > 0 ? (Element) list.item(0) : null;
    }
    
    private static final String s_urlEncoding = "UTF-8";
    private static final URLCodec s_codec = new URLCodec();
    
    static String encode(String s) {
        try {
            return s_codec.encode(s, s_urlEncoding);
        } catch (Exception e) {
            throw new RuntimeException("Exception encoding " + s + " with " + s_urlEncoding + " encoding.");
        }
    }
}
