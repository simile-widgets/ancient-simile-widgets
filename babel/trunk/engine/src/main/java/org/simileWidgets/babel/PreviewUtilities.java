package org.simileWidgets.babel;

import org.apache.commons.lang.StringEscapeUtils;

/**
 * @author dfhuynh
 *
 */
public class PreviewUtilities {
	public String escapeJavascript(String s) {
		return StringEscapeUtils.escapeJavaScript(s);
	}
	
	public String escapeHtml(String s) {
		return StringEscapeUtils.escapeHtml(s);
	}
}
