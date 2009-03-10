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
import org.openrdf.rio.rdfxml.RDFXMLParser;
import org.openrdf.rio.rdfxml.RDFXMLWriter;
import org.openrdf.sail.Sail;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;
import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.BabelWriter;
import org.simileWidgets.babel.GenericType;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.simileWidgets.babel.format.RdfXmlFormat;


public class RdfXmlConverter implements BabelReader, BabelWriter {

	public String getLabel(Locale locale) {
		return "Serializes generic data to RDF/XML";
	}

	public String getDescription(Locale locale) {
		return "Serializes generic data to RDF/XML";
	}

	public SemanticType getSemanticType() {
		return GenericType.s_singleton;
	}

	public SerializationFormat getSerializationFormat() {
		return RdfXmlFormat.s_singleton;
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
			RDFXMLParser parser = new RDFXMLParser();
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
					try {
						m_connection.commit();
					} catch (SailException e) {
						throw new RDFHandlerException(e);
					}
				}
				
				public RDFHandler initialize(SailConnection c) {
					m_connection = c;
					return this;
				}
			}.initialize(connection));
			
			parser.parse(reader, properties.getProperty("namespace"));
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
			RDFXMLWriter rdfWriter = new RDFXMLWriter(writer);
			
			rdfWriter.startRDF();
				CloseableIteration<? extends Namespace, SailException> n = connection.getNamespaces();
				try {
					while (n.hasNext()) {
						Namespace ns = n.next();
						rdfWriter.handleNamespace(ns.getPrefix(), ns.getName());
					}
				} finally {
					n.close();
				}
				
				CloseableIteration<? extends Statement, SailException> i = 
					connection.getStatements(null, null, null, false);
				try {
					while (i.hasNext()) {
						rdfWriter.handleStatement(i.next()); 
					}
				} finally {
					i.close();
				}
			rdfWriter.endRDF();
		} finally {
			connection.close();
		}
	}

}
