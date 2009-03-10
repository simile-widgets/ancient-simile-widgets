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

	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.format.SerializationFormat#getLabel(java.util.Locale)
	 */
	public String getLabel(Locale locale) {
		return "Excel";
	}
	
	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.format.SerializationFormat#getDescription(java.util.Locale)
	 */
	public String getDescription(Locale locale) {
		return "Excel files";
	}
	
	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.format.SerializationFormat#getMimetype()
	 */
	public String getMimetype() {
		return "application/vnd.ms-excel";
	}
}
