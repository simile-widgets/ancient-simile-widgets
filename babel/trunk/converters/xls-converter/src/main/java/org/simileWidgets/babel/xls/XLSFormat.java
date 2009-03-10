package org.simileWidgets.babel.xls;

import java.util.Locale;

import org.simileWidgets.babel.SerializationFormat;


/**
 * @author dfhuynh
 *
 */
public class XLSFormat implements SerializationFormat {
	final static public XLSFormat s_singleton = new XLSFormat();
	
	protected XLSFormat() {
		// nothing
	}

	public String getLabel(Locale locale) {
		return "Excel";
	}
	
	public String getDescription(Locale locale) {
		return "Excel files";
	}
	
	public String getMimetype() {
		return "application/vnd.ms-excel";
	}
}
