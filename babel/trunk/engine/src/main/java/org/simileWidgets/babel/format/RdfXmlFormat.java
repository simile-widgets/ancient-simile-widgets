package org.simileWidgets.babel.format;

import java.util.Locale;

import org.simileWidgets.babel.SerializationFormat;


/**
 * @author dfhuynh
 *
 */
public class RdfXmlFormat implements SerializationFormat {
	final static public RdfXmlFormat s_singleton = new RdfXmlFormat();
	
	protected RdfXmlFormat() {
		// nothing
	}

	public String getLabel(Locale locale) {
		return "RDF/XML";
	}
	
	public String getDescription(Locale locale) {
		return "RDF/XML";
	}
	
	public String getMimetype() {
		return "application/rdf+xml";
	}
}
