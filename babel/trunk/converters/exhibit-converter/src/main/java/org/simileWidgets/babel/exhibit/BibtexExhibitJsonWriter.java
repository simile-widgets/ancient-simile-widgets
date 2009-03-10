package org.simileWidgets.babel.exhibit;

import java.io.Writer;
import java.util.Locale;
import java.util.Properties;
import java.util.ResourceBundle;

import org.openrdf.model.Literal;
import org.openrdf.model.Resource;
import org.openrdf.model.URI;
import org.openrdf.model.Value;
import org.openrdf.model.impl.URIImpl;
import org.openrdf.sail.Sail;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.simileWidgets.babel.bibtex.BibtexType;


public class BibtexExhibitJsonWriter extends ExhibitJsonWriter {
	final static private URI s_title = new URIImpl("http://simile.mit.edu/2006/11/bibtex#title");
	final static private URI s_type = new URIImpl("http://simile.mit.edu/2006/11/bibtex#type");
	
	public String getDescription(Locale locale) {
		return "Bibtex - Exhibit JSON Writer";
	}

	public String getLabel(Locale locale) {
		return "Bibtex - Exhibit JSON Writer";
	}

	public SemanticType getSemanticType() {
		return BibtexType.s_singleton;
	}

	public SerializationFormat getSerializationFormat() {
		return ExhibitJsonFormat.s_singleton;
	}
	
	@Override
	public void write(Writer writer, Sail sail, Properties properties, Locale locale) throws Exception {
		ResourceBundle resources = ResourceBundle.getBundle(
			"edu.mit.simile.babel.exhibit.BibtexExhibitJsonWriter", locale);
		
		m_types.put("Publication", new Type(
			resources.getString("PublicationLabel"),
			resources.getString("PublicationPluralLabel")
		));
		
		m_properties.put("author", new Property(
			resources.getString("authorLabel"),
			resources.getString("authorPluralLabel"),
			resources.getString("authorReverseLabel"),
			resources.getString("authorReversePluralLabel"),
			resources.getString("authorGroupingLabel"),
			resources.getString("authorReverseGroupingLabel")
		));
		m_properties.put("pub-type", new Property(
			resources.getString("pubtypeLabel"),
			resources.getString("pubtypePluralLabel"),
			resources.getString("pubtypeReverseLabel"),
			resources.getString("pubtypeReversePluralLabel"),
			resources.getString("pubtypeGroupingLabel"),
			resources.getString("pubtypeReverseGroupingLabel")
		));
		
		super.write(writer, sail, properties, locale);
	}
	
	protected String predicateToID(URI predicate, SailConnection connection) {
		if (predicate.equals(s_type)) {
			return "pub-type";
		} else if (predicate.equals(s_title)) {
			return null;
		}
		return super.predicateToID(predicate, connection);
	}
	
	protected String guessLabel(Resource resource, SailConnection connection) {
		Value title = null;
        try {
            title = extract(resource, s_title, null, connection);
        } catch (SailException e) {
            // silent
        }
        
		if (title instanceof Literal) {
			return ((Literal) title).getLabel();
		}
		
		return super.guessLabel(resource, connection);
	}
}
