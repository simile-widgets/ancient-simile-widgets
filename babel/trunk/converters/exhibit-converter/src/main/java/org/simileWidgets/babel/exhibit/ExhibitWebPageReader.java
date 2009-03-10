/*
 *  (c) Copyright The SIMILE Project 2003-2004. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 
 * 3. The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

package org.simileWidgets.babel.exhibit;

import java.io.*;
import java.util.*;
import java.net.URL;
import java.net.URLConnection;

import org.apache.commons.lang.NotImplementedException;
import org.cyberneko.html.parsers.DOMParser;
import org.mozilla.javascript.NativeObject;
import org.openrdf.sail.Sail;
import org.openrdf.sail.memory.MemoryStore;
import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.GenericType;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;


/**
 * @author matsakis
 * @author dfhuynh
 *
 */
public final class ExhibitWebPageReader implements BabelReader {
    //final static private Logger s_logger = Logger.getLogger(ExhibitWebPageReader.class);
    
    public String getLabel(Locale locale) {
        return "Exhibit Web Page Reader";
    }
    
    public String getDescription(Locale locale) {
        return "Reads Exhibit data linked from Exhibit-embedding web pages";
    }
    
    public SemanticType getSemanticType() {
        return GenericType.s_singleton;
    }
    
    public SerializationFormat getSerializationFormat() {
        return ExhibitWebPageFormat.s_singleton;
    }

    public boolean takesReader() {
        return true;
    }
    
    public void read(InputStream inputStream, Sail sail, Properties properties, Locale locale) throws Exception {
        throw new NotImplementedException();
    }

    public void read(Reader reader, Sail sail, Properties properties, Locale locale) throws Exception {
        MemoryStore metaStore = new MemoryStore();
        metaStore.initialize();
        try {
            String namespace = properties.getProperty("namespace");
            String url = properties.getProperty("url");
            
            _loadExhibit(reader, url, namespace, sail, metaStore);
        } finally {
            metaStore.shutDown();
        }
    }
    
    
    static protected void _loadExhibit(
        Reader  reader,
        String  url,
        String  namespace,
        Sail    dataSail, 
        Sail    metaSail
    ) throws Exception {
        Map<String, NativeObject> types = new HashMap<String, NativeObject>();
        Map<String, NativeObject> properties = new HashMap<String, NativeObject>();
        List<NativeObject> items = new ArrayList<NativeObject>();
        
        URL baseURL = new URL(url);
        {
            DOMParser parser = new DOMParser();
            parser.parse(new InputSource(reader));
            
            Document document = parser.getDocument();
            NodeList heads = document.getElementsByTagName("head");
            for (int h = 0; h < heads.getLength(); h++) {
                Element head = (Element) heads.item(h);
                
                NodeList links = head.getElementsByTagName("link");
                for (int l = 0; l < links.getLength(); l++) {
                    Element link = (Element) links.item(l);
                    if ("exhibit/data".equals(link.getAttribute("rel"))) {
                        URL linkURL = new URL(baseURL, link.getAttribute("href"));
                        
                        URLConnection urlConnection = linkURL.openConnection();
                        urlConnection.setDefaultUseCaches(false);
                        urlConnection.connect();
                        
                        String contentEncoding = urlConnection.getContentEncoding();
                        
                        Reader dataReader = contentEncoding == null ?
                            new InputStreamReader(urlConnection.getInputStream()) :
                            new InputStreamReader(urlConnection.getInputStream(), contentEncoding); 
                        try {
                            ExhibitJsonLoadingUtil.loadExhibitDataFile(
                                dataReader, linkURL.toExternalForm(), namespace, types, properties, items);
                        } finally {
                            dataReader.close();
                        }
                    }
                }
            }
        }
        
        ExhibitJsonLoadingUtil.postProcess(types, properties, items, url, dataSail, metaSail);
    }
}

