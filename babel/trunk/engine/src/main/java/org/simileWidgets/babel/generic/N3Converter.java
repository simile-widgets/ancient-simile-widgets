package org.simileWidgets.babel.generic;

import info.aduna.iteration.CloseableIteration;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.util.Locale;
import java.util.Properties;

import org.apache.commons.lang.NotImplementedException;
import org.openrdf.model.Namespace;
import org.openrdf.model.Statement;
import org.openrdf.rio.RDFHandler;
import org.openrdf.rio.RDFHandlerException;
import org.openrdf.rio.n3.N3Writer;
import org.openrdf.rio.turtle.TurtleParser;
import org.openrdf.sail.Sail;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;
import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.BabelWriter;
import org.simileWidgets.babel.GenericType;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.simileWidgets.babel.format.N3Format;


public class N3Converter implements BabelReader, BabelWriter {

	public String getLabel(Locale locale) {
		return "Serializes generic data to N3";
	}

	public String getDescription(Locale locale) {
		return "Serializes generic data to N3";
	}

	public SemanticType getSemanticType() {
		return GenericType.s_singleton;
	}

	public SerializationFormat getSerializationFormat() {
		return N3Format.s_singleton;
	}

	public boolean takesReader() {
		return true;
	}
	
	public void read(InputStream inputStream, Sail sail, Properties properties, Locale locale) throws Exception {
		throw new NotImplementedException();
	}

	public void read(Reader reader, Sail sail, Properties properties, Locale locale)
			throws Exception {

		SailConnection connection = sail.getConnection();
		try {
			TurtleParser parser = new TurtleParser();
			parser.setRDFHandler(new RDFHandler() {
				SailConnection m_connection;
				
				public void startRDF() throws RDFHandlerException {
					// nothing
				}
			
				public void handleStatement(Statement s) throws RDFHandlerException {
					try {
						m_connection.addStatement(s.getSubject(), s.getPredicate(), s.getObject(), s.getContext());
					} catch (SailException e) {
						throw new RDFHandlerException(e);
					}
				}
			
				public void handleNamespace(String prefix, String name) throws RDFHandlerException {
					try {
						m_connection.setNamespace(prefix, name);
					} catch (SailException e) {
						throw new RDFHandlerException(e);
					}
				}
			
				public void handleComment(String arg0) throws RDFHandlerException {
					// nothing
				}
			
				public void endRDF() throws RDFHandlerException {
					// nothing
				}
				
				public RDFHandler initialize(SailConnection c) {
					m_connection = c;
					return this;
				}
			}.initialize(connection));
			
			parser.parse(reader, properties.getProperty("namespace"));
			
			connection.commit();
		} catch (Exception e) {
			connection.rollback();
			throw e;
		} finally {
			connection.close();
		}
	}

	public boolean takesWriter() {
		return true;
	}
	
	public void write(OutputStream outputStream, Sail sail, Properties properties, Locale locale) throws Exception {
		throw new NotImplementedException();
	}

	public void write(Writer writer, Sail sail, Properties properties, Locale locale)
			throws Exception {
		
		SailConnection connection = sail.getConnection();
		try {
			N3Writer n3Writer = new N3Writer(writer);
			
			n3Writer.startRDF();
				CloseableIteration<? extends Namespace, SailException> n = connection.getNamespaces();
				try {
					while (n.hasNext()) {
						Namespace ns = n.next();
						n3Writer.handleNamespace(ns.getPrefix(), ns.getName());
					}
				} finally {
					n.close();
				}
				
				CloseableIteration<? extends Statement, SailException> i = 
					connection.getStatements(null, null, null, false);
				try {
					while (i.hasNext()) {
						n3Writer.handleStatement(i.next()); 
					}
				} finally {
					i.close();
				}
			n3Writer.endRDF();
		} finally {
			connection.close();
		}
	}

}
