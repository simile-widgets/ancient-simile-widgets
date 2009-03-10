package org.simileWidgets.babel.generic;

import info.aduna.iteration.CloseableIteration;

import java.io.OutputStream;
import java.io.Writer;
import java.util.Locale;
import java.util.Properties;

import org.apache.commons.lang.NotImplementedException;
import org.openrdf.model.Literal;
import org.openrdf.model.Statement;
import org.openrdf.model.Value;
import org.openrdf.sail.Sail;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;
import org.simileWidgets.babel.BabelWriter;
import org.simileWidgets.babel.GenericType;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.simileWidgets.babel.format.TextFormat;


public class TextWriter implements BabelWriter {
	
	public String getDescription(Locale locale) {
		return "Text Writer";
	}

	public String getLabel(Locale locale) {
		return "Text Writer";
	}

	public SemanticType getSemanticType() {
		return GenericType.s_singleton;
	}

	public SerializationFormat getSerializationFormat() {
		return TextFormat.s_singleton;
	}
	
	public boolean takesWriter() {
		return true;
	}
	
	public void write(OutputStream outputStream, Sail sail, Properties properties, Locale locale) throws Exception {
		throw new NotImplementedException();
	}

	public void write(Writer writer, Sail sail, Properties properties, Locale locale) throws Exception {
		SailConnection connection = sail.getConnection();
		try {
		    CloseableIteration<? extends Statement, SailException> statements = connection.getStatements(null, null, null, true);
            try {
                while (statements.hasNext()) {
                    Statement s = statements.next();
                    Value object = s.getObject();
                    if (object instanceof Literal) {
                        writer.write(((Literal) object).stringValue());
                        writer.write(' ');
                    }
                }
            } finally {
                statements.close();
            }
		} finally {
			connection.close();
		}
	}
}
