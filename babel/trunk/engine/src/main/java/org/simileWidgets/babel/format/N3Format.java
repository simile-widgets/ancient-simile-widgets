package org.simileWidgets.babel.format;

import java.util.Locale;

import org.simileWidgets.babel.SerializationFormat;


/**
 * @author dfhuynh
 *
 */
public class N3Format implements SerializationFormat {
	final static public N3Format s_singleton = new N3Format();
	
	protected N3Format() {
		// nothing
	}

	public String getLabel(Locale locale) {
		return "N3";
	}
	
	public String getDescription(Locale locale) {
		return "N3";
	}
	
	public String getMimetype() {
		return "application/n3";
	}
}
