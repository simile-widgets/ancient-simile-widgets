package org.simileWidgets.babel.exhibit;

import org.openrdf.model.URI;
import org.openrdf.model.impl.URIImpl;

public abstract class ExhibitOntology {
	public static final String NAMESPACE = "http://simile.mit.edu/2006/11/exhibit#";
	
	public final static URI ITEM = new URIImpl(NAMESPACE + "Item");
	
	public final static URI ID = new URIImpl(NAMESPACE + "id");
	public final static URI ORIGIN = new URIImpl(NAMESPACE + "origin");
	
	public final static URI PLURAL_LABEL = new URIImpl(NAMESPACE + "pluralLabel");
	public final static URI VALUE_TYPE = new URIImpl(NAMESPACE + "valueType");
}
