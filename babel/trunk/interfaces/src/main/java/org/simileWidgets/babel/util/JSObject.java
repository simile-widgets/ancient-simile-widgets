package org.simileWidgets.babel.util;

import java.io.IOException;
import java.util.Collection;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.Properties;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;

/**
 * A utility class for encapsulating a Javascript object that can
 * then be pretty-printed out through an IndentWriter.
 * 
 * @author dfhuynh
 */
public class JSObject extends Properties {
    private static final long serialVersionUID = 5864375136126385719L;

    @SuppressWarnings("unchecked")
	static public void writeJSObject(IndentWriter writer, JSObject jso) throws IOException {
        writer.println("{");
        writer.indent();
        {
        	int fieldWidth = 0;
        	
            Enumeration e = jso.propertyNames();
            while (e.hasMoreElements()) {
                String name = (String) e.nextElement();
                fieldWidth = Math.max(fieldWidth, name.length());
            }
            
            fieldWidth += 5;
            
            e = jso.propertyNames();
            while (e.hasMoreElements()) {
                String name = (String) e.nextElement();
                Object value = jso.get(name);
                
                name = "\"" + StringEscapeUtils.escapeJavaScript(name) + "\" : ";
                
                writer.print(StringUtils.rightPad(name, fieldWidth));
                writeObject(writer, value);
                
                if (e.hasMoreElements()) {
                	writer.println(",");
                } else {
                	writer.println();
                }
            }
        }
        writer.unindent();
        writer.print("}");
    }
    
    @SuppressWarnings("unchecked")
	static public void writeObject(IndentWriter writer, Object o) throws IOException {
        if (o instanceof Boolean) {
        	writer.print(((Boolean) o).booleanValue() ? "true" : "false");
        } else if (o instanceof Collection) {
        	writer.println("[");
        	writer.indent();
            {
                Iterator i = ((Collection) o).iterator();
                while (i.hasNext()) {
                    writeObject(writer, i.next());
                    if (i.hasNext()) {
                    	writer.println(",");
                    } else {
                    	writer.println();
                    }
                }
            }
            writer.unindent();
            writer.print("]");
        } else if (o instanceof JSObject) {
            writeJSObject(writer, (JSObject) o);
        } else if (o instanceof String) {
        	writer.print("\"" + StringEscapeUtils.escapeJavaScript(o.toString()) + "\"");
        } else if (o != null) {
        	writer.print(StringEscapeUtils.escapeJavaScript(o.toString()));
        } else {
        	writer.print("null");
        }
    }
}
