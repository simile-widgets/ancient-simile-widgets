package org.simileWidgets.babel.tsv;

import java.util.Locale;

import org.simileWidgets.babel.SerializationFormat;


/**
 * @author dfhuynh
 *
 */
public class TSVFormat implements SerializationFormat {
	final static public TSVFormat s_singleton = new TSVFormat();
	
	protected TSVFormat() {
		// nothing
	}

	public String getLabel(Locale locale) {
		return "Tab-Separated Values";
	}
	
	public String getDescription(Locale locale) {
		return "Tab-Separated Values";
	}
	
	public String getMimetype() {
		return "text/plain";
	}
}
