package org.simileWidgets.babel.bibtex.tests;

import static org.junit.Assert.assertTrue;
import info.aduna.iteration.CloseableIteration;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.util.Locale;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.junit.Test;
import org.openrdf.model.Namespace;
import org.openrdf.model.Statement;
import org.openrdf.rio.n3.N3Writer;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;
import org.openrdf.sail.memory.MemoryStore;
import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.bibtex.BibtexReader;


public class BibtexFormatterTest {

    static Logger logger = Logger.getLogger(BibtexFormatterTest.class);

    String[] files = {
        "allstrings.bib",
        "comments.bib",
        "dups.bib",
        "simple.bib",
        "zotero.bib",
        "main.bib",
        "karger.bib",
        "demaine.bib",
        "endnote.bib",
        "edge_cases.bib"
    };
    
    @Test public void testFormatter() throws Throwable {
        int counter = 0;
        Properties p = new Properties();
        p.setProperty("namespace", "urn:blah:");
        
        for (int i = 0; i < files.length; i++) {
            MemoryStore store = new MemoryStore();

            try {
                logger.info("Formatting: " + files[i]);

                store.initialize();
                
                InputStream stream = this.getClass().getClassLoader().getResourceAsStream(files[i]);
                try {
                    BabelReader reader = new BibtexReader();
                    reader.read(new InputStreamReader(stream, "UTF-8"), store, p, Locale.getDefault());
                } finally {
                    stream.close();
                }

                StringWriter out = new StringWriter();
                SailConnection connection = store.getConnection();
                try {
                    N3Writer n3Writer = new N3Writer(out);
                
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
                    
                    CloseableIteration<? extends Statement, SailException> it = connection.getStatements(null, null, null, false);
                    try {
                        while (it.hasNext()) {
                            n3Writer.handleStatement(it.next()); 
                        }
                    } finally {
                        it.close();
                    }
                    n3Writer.endRDF();
                } finally {
                    connection.close();
                }
                
                //logger.info(out.toString());
            } catch (Throwable e) {
                logger.error(e);
                throw e;
            } finally {
                store.shutDown();
            }
        
            counter++;
        }
        
        assertTrue(counter == files.length);
    }
}
