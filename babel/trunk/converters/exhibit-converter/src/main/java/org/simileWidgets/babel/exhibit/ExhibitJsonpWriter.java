package org.simileWidgets.babel.exhibit;

import java.io.Writer;
import java.util.Locale;
import java.util.Properties;

import org.openrdf.sail.Sail;
import org.simileWidgets.babel.SerializationFormat;


public class ExhibitJsonpWriter extends ExhibitJsonWriter {
	public String getDescription(Locale locale) {
		return "Exhibit JSONP Writer";
	}

	public String getLabel(Locale locale) {
		return "Exhibit JSONP Writer";
	}

	public SerializationFormat getSerializationFormat() {
		return ExhibitJsonpFormat.s_singleton;
	}
	
	public void write(Writer writer, Sail sail, Properties properties, Locale locale) throws Exception {
		String callback = properties.getProperty("callback");
		if (callback == null || callback.length() == 0) {
			callback = "callback";
		}
		writer.write(callback);
		writer.write("(");
		super.write(writer, sail, properties, locale);
		writer.write(");");
	}
}

