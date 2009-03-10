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

	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.format.SerializationFormat#getLabel(java.util.Locale)
	 */
	public String getLabel(Locale locale) {
		return "RDF/XML";
	}
	
	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.format.SerializationFormat#getDescription(java.util.Locale)
	 */
	public String getDescription(Locale locale) {
		return "RDF/XML";
	}
	
	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.format.SerializationFormat#getMimetype()
	 */
	public String getMimetype() {
		return "application/rdf+xml";
	}
}
