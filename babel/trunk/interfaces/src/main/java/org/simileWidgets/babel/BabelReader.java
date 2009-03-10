package org.simileWidgets.babel;

import java.io.InputStream;
import java.io.Reader;
import java.util.Locale;
import java.util.Properties;

import org.openrdf.sail.Sail;

public interface BabelReader {
	public String getLabel(Locale locale);
	public String getDescription(Locale locale);
	
	public SemanticType getSemanticType();
	public SerializationFormat getSerializationFormat();
	
	public void read(Reader reader, Sail sail, Properties properties, Locale locale) throws Exception;
	public void read(InputStream inputStream, Sail sail, Properties properties, Locale locale) throws Exception;
	
	public boolean takesReader();
}
