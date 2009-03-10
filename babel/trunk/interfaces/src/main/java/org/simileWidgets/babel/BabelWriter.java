package org.simileWidgets.babel;

import java.io.OutputStream;
import java.io.Writer;
import java.util.Locale;
import java.util.Properties;

import org.openrdf.sail.Sail;

public interface BabelWriter {
	public String getLabel(Locale locale);
	public String getDescription(Locale locale);
	
	public SemanticType getSemanticType();
	public SerializationFormat getSerializationFormat();
	
	public boolean takesWriter();
	
	public void write(Writer writer, Sail sail, Properties properties, Locale locale) throws Exception;
	public void write(OutputStream outputStream, Sail sail, Properties properties, Locale locale) throws Exception;
}
