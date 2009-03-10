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

	public String getLabel(Locale locale) {
		return "Exhibit-embedding Web Page";
	}
	
	public String getDescription(Locale locale) {
		return "Exhibit-embedding Web Page";
	}
	
	public String getMimetype() {
		return "text/html";
	}
}
