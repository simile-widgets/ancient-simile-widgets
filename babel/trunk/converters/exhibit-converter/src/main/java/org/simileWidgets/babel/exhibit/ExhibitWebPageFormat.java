package org.simileWidgets.babel.exhibit;

import java.util.Locale;

import org.simileWidgets.babel.SerializationFormat;


/**
 * @author dfhuynh
 *
 */
public class ExhibitWebPageFormat implements SerializationFormat {
	final static public ExhibitWebPageFormat s_singleton = new ExhibitWebPageFormat();
	
	protected ExhibitWebPageFormat() {
		// nothing
	}

	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.format.SerializationFormat#getLabel(java.util.Locale)
	 */
	public String getLabel(Locale locale) {
		return "Exhibit-embedding Web Page";
	}
	
	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.format.SerializationFormat#getDescription(java.util.Locale)
	 */
	public String getDescription(Locale locale) {
		return "Exhibit-embedding Web Page";
	}
	
	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.format.SerializationFormat#getMimetype()
	 */
	public String getMimetype() {
		return "text/html";
	}
}
