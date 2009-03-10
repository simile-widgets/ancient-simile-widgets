package org.simileWidgets.babel.tsv;

import java.io.InputStream;
import java.io.LineNumberReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.codec.net.URLCodec;
import org.apache.commons.lang.NotImplementedException;
import org.apache.commons.lang.StringUtils;
import org.openrdf.model.Resource;
import org.openrdf.model.URI;
import org.openrdf.model.Value;
import org.openrdf.model.impl.LiteralImpl;
import org.openrdf.model.impl.URIImpl;
import org.openrdf.model.vocabulary.RDF;
import org.openrdf.model.vocabulary.RDFS;
import org.openrdf.model.vocabulary.XMLSchema;
import org.openrdf.sail.Sail;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;
import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.GenericType;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.simileWidgets.babel.exhibit.ExhibitOntology;


public class TSVReader implements BabelReader {
	static class Column {
		String		m_name;
		URI			m_uri;
		boolean		m_singleValue = false;
		ValueType	m_valueType = ValueType.Text;
	}
	static class Item {
		String		m_label;
		String		m_id;
		URI			m_type;
		URI			m_uri;
		Map<Column, String>	m_properties = new HashMap<Column, String>();
	}
	static enum ValueType {
		Item,
		Text,
		Number,
		Boolean,
		Date,
		URL
	}
	
	public String getDescription(Locale locale) {
		return "Tab-separated value reader";
	}

	public String getLabel(Locale locale) {
		return "TSV Reader";
	}

	public SemanticType getSemanticType() {
		return GenericType.s_singleton;
	}

	public SerializationFormat getSerializationFormat() {
		return TSVFormat.s_singleton;
	}

	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.BabelReader#takesReader()
	 */
	public boolean takesReader() {
		return true;
	}
	
	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.BabelReader#read(java.io.InputStream, org.openrdf.sail.Sail, java.util.Properties, java.util.Locale)
	 */
	public void read(InputStream inputStream, Sail sail, Properties properties, Locale locale) throws Exception {
		throw new NotImplementedException();
	}

	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.BabelReader#read(java.io.Reader, org.openrdf.sail.Sail, java.util.Properties, java.util.Locale)
	 */
	public void read(Reader reader, Sail sail, Properties properties, Locale locale) throws Exception {
		String 				namespace = properties.getProperty("namespace");
		List<Column> 		columns = new ArrayList<Column>();
		int					uriColumn = -1;
		int					idColumn = -1;
		int					labelColumn = -1;
		int					typeColumn = -1;
		
		LineNumberReader 	lineReader = new LineNumberReader(reader);
		String 				line;
		
		/*
		 * Find the header row
		 */
		while ((line = lineReader.readLine()) != null) {
			line = line.trim();
			if (line.length() > 0) {
		        String[] columnSpecs = StringUtils.splitPreserveAllTokens(line, '\t');
				
		        for (int i = 0; i < columnSpecs.length; i++) {
		        	String spec = columnSpecs[i].trim();
		        	Column column = null;
		        	if (spec.length() > 0) {
		        		column = new Column();
		        		
			        	int colon = spec.indexOf(':');
			        	if (colon < 0) {
			        		column.m_name = spec;
			        	} else {
			        		column.m_name = spec.substring(0, colon).trim();
			        		
			        		String[] details = StringUtils.splitPreserveAllTokens(spec.substring(colon + 1), ',');
			        		for (int d = 0; d < details.length; d++) {
			        			String detail = details[d].trim().toLowerCase();
			        			if ("single".equals(detail)) {
			        				column.m_singleValue = true;
			        			} else if ("item".equals(detail)) {
			        				column.m_valueType = ValueType.Item;
			        			} else if ("number".equals(detail)) {
			        				column.m_valueType = ValueType.Number;
			        			} else if ("boolean".equals(detail)) {
			        				column.m_valueType = ValueType.Boolean;
			        			} else if ("date".equals(detail)) {
			        				column.m_valueType = ValueType.Date;
			        			} else if ("url".equals(detail)) {
			        				column.m_valueType = ValueType.URL;
			        			}
			        		}
			        	}
			        	
			        	/*
			        	 * The user might capitalize the column name in all sorts
			        	 * of way. Make sure we are insensitive to the capitalization.
			        	 */
			        	if (column.m_name.equalsIgnoreCase("uri")) {
			        		column.m_name = "uri";
			        		uriColumn = i;
			        	} else if (column.m_name.equalsIgnoreCase("type")) {
			        		column.m_name = "type";
			        		typeColumn = i;
			        	} else if (column.m_name.equalsIgnoreCase("label")) {
			        		column.m_name = "label";
			        		labelColumn = i;
			        	} else if (column.m_name.equalsIgnoreCase("id")) {
			        		column.m_name = "id";
			        		idColumn = i;
			        	} else {
			        		column.m_uri = new URIImpl(namespace + encode(column.m_name));
			        	}
		        	}
		        	columns.add(column);
		        }
		        break;
			}
		}
		
		/*
		 * Try to use the first non-null column as the label column 
		 * if we still haven't found the label column.
		 */
		if (labelColumn < 0) {
			for (int i = 0; i < columns.size(); i++) {
				if (columns.get(i) != null) {
					labelColumn = i;
					break;
				}
			}
		}
		
		if (labelColumn >= 0) {
			Map<String, Item> idToItem = new HashMap<String, Item>();
			
			/*
			 * The first pass will collect all the items and
			 * their properties as well as assign URIs to them.
			 */
			while ((line = lineReader.readLine()) != null) {
				line = line.trim();
				if (line.length() > 0) {
			        String[] fields = StringUtils.splitPreserveAllTokens(line, '\t');
			        String label = fields[labelColumn].trim();
			        if (label == null || label.length() == 0) {
			        	continue;
			        }
			        
			        String id = idColumn < 0 ? label : fields[idColumn].trim();
			        if (id.length() == 0) {
			        	id = label;
			        }
			        
			        String uri = uriColumn < 0 ? null : fields[uriColumn].trim();
			        if (uri == null || uri.length() == 0) {
			        	uri = namespace + encode(id);
			        }

			        String type = typeColumn < 0 ? "Item" : fields[typeColumn].trim();
			        if (type.length() == 0) {
			        	type = "Item";
			        }

			        Item item = idToItem.get(id);
			        if (item == null) {
			        	item = new Item();
				        item.m_id = id;
				        item.m_uri = new URIImpl(uri);
				        item.m_label = label;
				        item.m_type = new URIImpl(namespace + encode(type));
				        
				        idToItem.put(id, item);
			        }
			        
			        for (int f = 0; f < fields.length; f++) {
			        	Column column = columns.get(f);
			        	String field = fields[f].trim();
			        	
			        	if (column != null && column.m_uri != null && field.length() > 0) {
		        			item.m_properties.put(column, field);
			        	}
			        }
				}
			}
				
			SailConnection c = sail.getConnection();
			try {
				for (Item item : idToItem.values()) {
        			c.addStatement(item.m_uri, RDF.TYPE, item.m_type);
        			c.addStatement(item.m_uri, RDFS.LABEL, new LiteralImpl(item.m_label));
                    c.addStatement(item.m_uri, ExhibitOntology.ID, new LiteralImpl(item.m_id));
        			
					for (Column column : item.m_properties.keySet()) {
						if (column.m_uri != null) {
							String field = item.m_properties.get(column);
							if (field != null) {
				        		if (column.m_singleValue) {
				        			addStatement(c, item.m_uri, column.m_uri, field, column.m_valueType, idToItem, namespace);
				        		} else {
							        String[] values = StringUtils.splitPreserveAllTokens(field, ';');
							        for (String value : values) {
							        	addStatement(c, item.m_uri, column.m_uri, value.trim(), column.m_valueType, idToItem, namespace);
							        }
				        		}
							}
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
	}
	
	protected void addStatement(
		SailConnection 		connection, 
		Resource 			subject, 
		URI 				predicate, 
		String 				object, 
		ValueType 			valueType, 
		Map<String, Item> 	idToItem,
		String				namespace
	) throws SailException {
		Value v = null;
		if (valueType == ValueType.Item) {
			Item item = idToItem.get(object);
			if (item != null) {
				v = item.m_uri;
			} else {
				v = new URIImpl(namespace + encode(object));
			}
		} else if (valueType.equals(ValueType.Boolean)) {
			v = new LiteralImpl(
				object.equalsIgnoreCase("true") ? "true" : "false",
				XMLSchema.BOOLEAN
			);
		} else if (valueType.equals(ValueType.Number)) {
			try {
	    	    Long.parseLong(object);
				v = new LiteralImpl(object, XMLSchema.LONG);
				
	    	} catch (NumberFormatException nfe) {
	    		try {
		    	    Double.parseDouble(object);
					v = new LiteralImpl(object, XMLSchema.DOUBLE);
					
		    	} catch (NumberFormatException nfe2) {
	    		}
	    	}
		} else if (valueType.equals(ValueType.Date)) {
			/**
			 * TODO: How do we convert an arbitrary string to an ISO8601 date/time?
			 */
			v = new LiteralImpl(
				object,
				XMLSchema.DATETIME
			);
		}
		
		if (v == null) {
			v = new LiteralImpl(object);
		}
		connection.addStatement(subject, predicate, v);
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
