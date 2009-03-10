package org.simileWidgets.babel.jpeg;

import java.util.Locale;

import org.simileWidgets.babel.SerializationFormat;


/**
 * @author dfhuynh
 *
 */
public class JPEGFormat implements SerializationFormat {
	final static public JPEGFormat s_singleton = new JPEGFormat();
	
	protected JPEGFormat() {
		// nothing
	}

	public String getLabel(Locale locale) {
		return "JPEG";
	}
	
	public String getDescription(Locale locale) {
		return "JPEG (Joint Photographic Experts Group) Image";
	}
	
	public String getMimetype() {
		return "image/jpeg";
	}
}
