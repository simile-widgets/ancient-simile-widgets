package org.simileWidgets.babel.kml;

import java.util.Locale;

import org.simileWidgets.babel.SerializationFormat;


/**
 * @author dfhuynh
 *
 */
public class KMLFormat implements SerializationFormat {
	final static public KMLFormat s_singleton = new KMLFormat();
	
	protected KMLFormat() {
		// nothing
	}

	public String getLabel(Locale locale) {
		return "KML";
	}
	
	public String getDescription(Locale locale) {
		return "KML";
	}
	
	public String getMimetype() {
		return "application/vnd.google-earth.kml+xml";
	}
}
