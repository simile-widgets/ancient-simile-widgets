package org.simileWidgets.babel.jpeg;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.Reader;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import org.apache.commons.codec.net.URLCodec;
import org.apache.commons.lang.NotImplementedException;
import org.openrdf.model.Resource;
import org.openrdf.model.URI;
import org.openrdf.model.Value;
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

import edu.mit.simile.rdfizer.jpeg.ExtractedMetadata;
import edu.mit.simile.rdfizer.jpeg.Extractor;

public class JPEGReader implements BabelReader {

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
		URL
	}
	
	public String getDescription(Locale locale) {
		return "JPEG binary image reader";
	}

	public String getLabel(Locale locale) {
		return "JPEG Reader";
	}

	public SemanticType getSemanticType() {
		return GenericType.s_singleton;
	}

	public SerializationFormat getSerializationFormat() {
		return JPEGFormat.s_singleton;
	}

	public boolean takesReader() {
		return false;
	}
	
	public void read(InputStream inputStream, Sail sail, Properties properties, Locale locale) throws Exception {
		String        namespace = properties.getProperty("namespace");
		String				url = properties.getProperty("url");
		
		if (url.equals("")) {
			url = namespace + "#" + inputStream.hashCode();
		}

		// The underlying JPEG metadata reader does not take the existence of network
		// delays into consideration, so what we end up doing is reading the network
		// input stream into a byte array, then feeding the complete byte array to the
		// metadata reader.
		
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		byte[] buffer = new byte[4096];
		int read = 0;
		while (read != -1) {
			read = inputStream.read(buffer);
			if (read > 0) {
				baos.write(buffer, 0, read);
			}
		}		
		ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());

		ExtractedMetadata metadata = Extractor.extractFromStream(bais, url);
		
		URI item = new URIImpl(url);
		
		Set<String> keys = metadata.getProperties();
		
		SailConnection c = sail.getConnection();
		try {
			c.addStatement(item, RDF.TYPE, new URIImpl(ExtractedMetadata.TYPE));
			c.addStatement(item, RDFS.LABEL, new LiteralImpl(url));
			c.addStatement(item, ExhibitOntology.ID, new LiteralImpl(url));

			for (String prop : keys) {
				List<String> vals = metadata.getValues(prop);
				for (String val : vals) {
					c.addStatement(item, new URIImpl(prop), new LiteralImpl(val));
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
		} else {
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
