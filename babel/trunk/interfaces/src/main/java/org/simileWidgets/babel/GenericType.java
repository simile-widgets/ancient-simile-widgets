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

	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.type.SemanticType#getDescription(java.util.Locale)
	 */
	public String getDescription(Locale locale) {
		return "Generic RDF";
	}

	/* (non-Javadoc)
	 * @see edu.mit.simile.babel.type.SemanticType#getLabel(java.util.Locale)
	 */
	public String getLabel(Locale locale) {
		return "Generic RDF";
	}
}
