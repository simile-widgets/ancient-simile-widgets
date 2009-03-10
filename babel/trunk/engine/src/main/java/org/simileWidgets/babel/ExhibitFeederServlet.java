package org.simileWidgets.babel;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.openrdf.sail.Sail;
import org.openrdf.sail.memory.MemoryStore;
import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.BabelWriter;
import org.simileWidgets.babel.util.Util;


/**
 * @author dfhuynh
 *
 */
public class ExhibitFeederServlet extends HttpServlet {
    private static final long serialVersionUID = -370492767091187444L;
    final static private Logger s_logger = Logger.getLogger(ExhibitFeederServlet.class);
	
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        Writer writer = new BufferedWriter(
                new OutputStreamWriter(response.getOutputStream(), "UTF-8"));
        try {
            internalDoGet(request, response, writer);
        } finally {
            writer.flush();
            writer.close();
        }
    }
    
    protected void internalDoGet(
        HttpServletRequest  request, 
        HttpServletResponse response,
        Writer              writer
    ) throws ServletException, IOException {
        
        List<String> pageURLs = new ArrayList<String>();
        List<String> dataURLs = new ArrayList<String>();
        
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
    
                    if (name.equals("url")) {
                        pageURLs.add(value);
                    } else if (name.equals("data-url")) {
                        dataURLs.add(value);
                    }
                }
            }
        }
        
        BabelReader dataReader = Babel.getReader("exhibit-json"); 
        BabelReader pageReader = Babel.getReader("exhibit-html"); 
        BabelWriter rssWriter = Babel.getWriter("rss1.0");
        
        Properties readerProperties = new Properties();
        Properties writerProperties = new Properties();
        
        MemoryStore store = new MemoryStore();
        Locale locale = request.getLocale();
        try {
            store.initialize();
            try {
                for (String pageURL : pageURLs) {
                    _readURL(pageURL, readerProperties, pageReader, store);
                }
                for (String dataURL : dataURLs) {
                    _readURL(dataURL, readerProperties, dataReader, store);
                }
                
                String feedURL = "http://www.example.com/";
                if (pageURLs.size() > 0) {
                    feedURL = pageURLs.get(0);
                } else if (dataURLs.size() > 0) {
                    feedURL = dataURLs.get(0);
                }
                writerProperties.setProperty("namespace", makeIntoNamespace(feedURL));
                writerProperties.setProperty("url", feedURL);
                
                response.setCharacterEncoding("UTF-8");
                response.setContentType(rssWriter.getSerializationFormat().getMimetype());
                
                rssWriter.write(writer, store, writerProperties, locale);
            } finally {
                store.shutDown();
            }
        } catch (Exception e) {
            s_logger.error(e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
	}
    
    protected void _readURL(String url, Properties readerProperties, BabelReader babelReader, Sail sail) { 
        try {
            URLConnection connection = new URL(url).openConnection();
            connection.setConnectTimeout(5000);
            connection.connect();
            
            readerProperties.setProperty("namespace", makeIntoNamespace(url));
            readerProperties.setProperty("url", url);

            String encoding = connection.getContentEncoding();
            
            Reader reader = new InputStreamReader(
                connection.getInputStream(), (encoding == null) ? "ISO-8859-1" : encoding);
                        
            try {
                babelReader.read(reader, sail, readerProperties, Locale.getDefault());
            } finally {
                reader.close();
            }
        } catch (Exception e) {
            s_logger.error(e);
            return;
        }
    }
        
    static protected String makeIntoNamespace(String s) {
        if (s.endsWith("#")) {
            return s;
        } else if (s.endsWith("/")) {
            return s;
        } else {
            return s + "#";
        }
    }
}
