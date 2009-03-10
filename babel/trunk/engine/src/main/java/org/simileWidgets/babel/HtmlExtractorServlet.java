package org.simileWidgets.babel;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.namespace.NamespaceContext;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.cyberneko.html.parsers.DOMParser;
import org.simileWidgets.babel.util.Util;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.InputSource;


/**
 * @author dfhuynh
 *
 */
public class HtmlExtractorServlet extends HttpServlet {
    private static final long serialVersionUID = -2779209451300546550L;

    final static private Logger s_logger = Logger.getLogger(HtmlExtractorServlet.class);

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/javascript");
           
		String callback = "callback";
        String url = null;
        String xpath = ".";
        String result = "";
		
		/*
		 * Parse parameters
		 */
        String[] params = StringUtils.splitPreserveAllTokens(request.getQueryString(), '&');
        if (params != null) {
	        for (int i = 0; i < params.length; i++) {
	            String param = params[i];
	            int equalIndex = param.indexOf('=');
	
	            if (equalIndex >= 0) {
	                String rawName = param.substring(0, equalIndex);
	                String rawValue = param.substring(equalIndex + 1);
	
	                String name = Util.decode(rawName);
	                String value = Util.decode(rawValue);
	
					if (name.equals("callback")) {
						callback = value;
					} else if (name.equals("url")) {
						url = value;
                    } else if (name.equals("xpath")) {
                        xpath = value;
					}
	            }
			}
        }
        
		/*
		 * Load source from URL if any
		 */
        if (url != null) {
            InputStream is = null;
            try {
                is = new URL(url).openStream();
            } catch (Exception e) {
                s_logger.error(e);
            }
            
            if (is != null) {
                try {
                    DOMParser parser = new DOMParser();
                    parser.parse(new InputSource(is));
                    
                    Document document = parser.getDocument();
                    
                    XPath xpath1 = XPathFactory.newInstance().newXPath();
                    Node node = (Node) xpath1.evaluate(xpath, document.getDocumentElement(), XPathConstants.NODE);
                    if (node == null) {
                        xpath1.setNamespaceContext(new HtmlNamespaceContext());
                        node = (Node) xpath1.evaluate(xpath, document.getDocumentElement(), XPathConstants.NODE);
                    }
                    
                    if (node != null) {
                        StringWriter        sw = new StringWriter();
                        Transformer         transformer = TransformerFactory.newInstance().newTransformer();
                        
                        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
                        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
                        transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
                        transformer.transform(new DOMSource(node), new StreamResult(sw));
                            
                        result = sw.toString();
                    }
                } catch (Exception e) {
                    s_logger.error(e);
                } finally {
                    is.close();
                }
            }
        }
        
        PrintWriter writer = response.getWriter();
        writer.write(callback + "(\"");
        writer.print(StringEscapeUtils.escapeJavaScript(result));
        writer.write("\")");
	}
    
    static protected class HtmlNamespaceContext implements NamespaceContext {
        final static private String s_xhtml = "http://www.w3.org/1999/xhtml";
        
        public String getNamespaceURI(String prefix) {
            return "h".equals(prefix) ? s_xhtml : null;
        }

        public String getPrefix(String namespaceURI) {
            return s_xhtml.equals(namespaceURI) ? "h" : null;
        }

        public Iterator<String> getPrefixes(String namespaceURI) {
            List<String> l = new ArrayList<String>();
            if (s_xhtml.equals(namespaceURI)) {
                l.add("h");
            }
            return l.iterator();
        }
        
    }
}