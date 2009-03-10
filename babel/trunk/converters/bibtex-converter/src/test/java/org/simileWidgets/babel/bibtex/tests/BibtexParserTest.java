package org.simileWidgets.babel.bibtex.tests;

import static org.junit.Assert.assertTrue;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.junit.Test;
import org.simileWidgets.babel.bibtex.BibtexCleanerReader;

import edu.mit.simile.babel.bibtex.BibtexGrammar;

public class BibtexParserTest {

    static Logger logger = Logger.getLogger(BibtexParserTest.class);
    
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
    
    int[] records = {
        0,
        1,
        7,
        2,
        169,
        36,
        907,
        317,
        10,
        6
    };

    @Test public void testCleaner() throws Exception {
        int counter = 0;
        for (int i = 0; i < files.length; i++) {
            logger.info("Cleaning: " + files[i]);
            InputStream stream = null;
            try {
                stream = this.getClass().getClassLoader().getResourceAsStream(files[i]);
                BibtexCleanerReader r = new BibtexCleanerReader(
                    new BufferedReader(
                        new InputStreamReader(stream)
                    )
                );
                StringWriter w = new StringWriter();
                IOUtils.copy(r, w);
                w.close();
                //logger.info(w.toString());
                counter++;
            } catch (Exception e) {
                logger.error(e);
                stream.close();
            }
        }
        
        assertTrue(counter == files.length);
    }

    
    @Test public void testParser() throws Exception {
        int counter = 0;
        for (int i = 0; i < files.length; i++) {
            logger.info("Parsing: " + files[i]);
            InputStream stream = null;
            try {
                stream = this.getClass().getClassLoader().getResourceAsStream(files[i]);
                BibtexGrammar p = new BibtexGrammar(
                    new BibtexCleanerReader(
                        new BufferedReader(
                            new InputStreamReader(stream, "UTF-8")
                        )
                    )
                );
                p.parse();
                //p.printout();

                int rec = p.getRecords().size();
                logger.info("Found " + rec + " records");
                if (rec == records[i]) counter++;
            } catch (Throwable e) {
                e.printStackTrace();
                logger.error(e);
                stream.close();
            }
        }
        
        assertTrue(counter == files.length);
    }
    
}
