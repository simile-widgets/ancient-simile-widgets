package org.simileWidgets.babel;

import java.util.Locale;

/**
 * @author dfhuynh
 *
 */
public interface SemanticType {
	/**
	 * @param locale
	 * @return
	 */
	public String getLabel(Locale locale);
	
	/**
	 * @param locale
	 * @return
	 */
	public String getDescription(Locale locale);
}
