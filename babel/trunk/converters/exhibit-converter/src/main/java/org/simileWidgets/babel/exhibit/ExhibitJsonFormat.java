package org.simileWidgets.babel.exhibit;

import java.util.Locale;

import org.simileWidgets.babel.SerializationFormat;


/**
 * @author dfhuynh
 */
public class ExhibitJsonFormat implements SerializationFormat {
	final static public ExhibitJsonFormat s_singleton = new ExhibitJsonFormat();
	
	protected ExhibitJsonFormat() {
		// nothing
	}

	public String getLabel(Locale locale) {
		return "Exhibit JSON";
	}
	
	public String getDescription(Locale locale) {
		return "Exhibit JSON";
	}
	
	public String getMimetype() {
		return "application/json";
	}
}
