package org.simileWidgets.painter;

import java.awt.Color;
import java.awt.Font;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

public abstract class PainterUtilities {
    static public Color parseColorCode(String s, Color defaultColor) {
    	if (s != null && s.length() > 0) {
	    	String redS = "00";
	    	String greenS = "00";
	    	String blueS = "00";
	    	
	    	if (s.length() == 6) {
	    		redS = s.substring(0, 2);
	    		greenS = s.substring(2, 4);
	    		blueS = s.substring(4, 6);
	    	} else if (s.length() == 3) {
	    		redS = s.substring(0, 1);
	    		greenS = s.substring(1, 2);
	    		blueS = s.substring(2, 3);
	    		
	    		redS += redS;
	    		greenS += greenS;
	    		blueS += blueS;
	    	}
	        return new Color(
	            Integer.parseInt(redS, 16),
	            Integer.parseInt(greenS, 16),
	            Integer.parseInt(blueS, 16)
	        );
    	} else {
    		return defaultColor;
    	}
    }
    
    static public String getString(Map<String, String[]> parameters, String key, String defaultValue) {
    	String[] a = parameters.get(key);
    	return a != null && a.length > 0 && a[0].length() > 0 ? a[0] : defaultValue;
    }
    
    static public Color getColor(Map<String, String[]> parameters, String key, Color defaultColor) {
    	return parseColorCode(getString(parameters, key, null), defaultColor);
    }
    
    static public float getFloat(Map<String, String[]> parameters, String key, float defaultValue, float min, float max) {
    	String s = getString(parameters, key, null);
    	if (s != null) {
    		try {
    			float f = Float.parseFloat(s);
    			return Math.min(Math.max(f, min), max);
    		} catch (Exception e) {
    			// silent
    		}
    	}
    	return defaultValue;
    }
    
    static public boolean getBoolean(Map<String, String[]> parameters, String key, Boolean defaultValue) {
    	String s = getString(parameters, key, null);
    	return s != null ? "true".equalsIgnoreCase(s) : defaultValue;
    }
    
    static public Font getFont(Map<String, String[]> parameters, String key, Font defaultValue) {
    	String s = getString(parameters, key, null);
    	if (s != null) {
    		int 	style = Font.PLAIN;
    		int		size = defaultValue.getSize();
    		String	name = defaultValue.getFontName();
    		
    		for (String segment : StringUtils.split(s, ',')) {
    			if ("bold".equalsIgnoreCase(segment)) {
    				style |= Font.BOLD;
    			} else if ("italic".equalsIgnoreCase(segment)) {
    				style |= Font.ITALIC;
    			} else {
    				try {
    					size = Integer.parseInt(segment);
    				} catch (Exception e) {
    					name = segment;
    				}
    			}
    		}
    		return new Font(name, style, size);
    	}
    	return defaultValue;
    }
}
