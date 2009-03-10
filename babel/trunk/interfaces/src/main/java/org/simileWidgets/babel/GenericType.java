package org.simileWidgets.babel;

import java.util.Locale;

/**
 * @author dfhuynh
 *
 */
public class GenericType implements SemanticType {
	final static public GenericType s_singleton = new GenericType();
	
	protected GenericType() {
		// nothing
	}

	public String getDescription(Locale locale) {
		return "Generic RDF";
	}

	public String getLabel(Locale locale) {
		return "Generic RDF";
	}
}
