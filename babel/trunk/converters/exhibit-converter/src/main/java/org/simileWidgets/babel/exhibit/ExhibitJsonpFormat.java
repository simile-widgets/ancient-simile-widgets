package org.simileWidgets.babel.exhibit;

import java.util.Locale;

import org.simileWidgets.babel.SerializationFormat;


/**
 * @author dfhuynh
 *
 */
public class ExhibitJsonpFormat implements SerializationFormat {
	final static public ExhibitJsonpFormat s_singleton = new ExhibitJsonpFormat();
	
	protected ExhibitJsonpFormat() {
		// nothing
	}

	public String getLabel(Locale locale) {
		return "Exhibit JSONP";
	}
	
	public String getDescription(Locale locale) {
		return "Exhibit JSONP";
	}
	
	public String getMimetype() {
		return "application/jsonp";
	}
}
