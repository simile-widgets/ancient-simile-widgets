package org.simileWidgets.babel.format;

import java.util.Locale;

import org.simileWidgets.babel.SerializationFormat;


/**
 * @author dfhuynh
 *
 */
public class RSS1p0Format implements SerializationFormat {
	final static public RSS1p0Format s_singleton = new RSS1p0Format();
	
	protected RSS1p0Format() {
		// nothing
	}

	public String getLabel(Locale locale) {
		return "RSS 1.0";
	}
	
	public String getDescription(Locale locale) {
		return "RSS 1.0";
	}
	
	public String getMimetype() {
		return "application/rss+xml";
	}
}
