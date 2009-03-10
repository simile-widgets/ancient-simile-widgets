package org.simileWidgets.babel.bibtex.tests;

import static org.junit.Assert.assertTrue;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.apache.log4j.Logger;
import org.junit.Test;
import org.simileWidgets.babel.bibtex.BibtexUtils;


public class BibtexEscapingTest {

    static Logger logger = Logger.getLogger(BibtexEscapingTest.class);
    
    String[] files = {
        "escaping.txt"
    };
    
    @Test public void testParser() throws Exception {
        int read = 0;
        int equal = 0;

        for (int i = 0; i < files.length; i++) {
            logger.info("Testing: " + files[i]);

            InputStream stream = null;
            try {
                stream = this.getClass().getClassLoader().getResourceAsStream(files[i]);
                BufferedReader reader = new BufferedReader(new InputStreamReader(stream, "UTF-8"));
                
                String line;
                while ((line = reader.readLine()) != null) {
                    read++;
                    String escaped = BibtexUtils.escapeUnicode(new StringBuffer(line)).toString();
                    String unescaped = BibtexUtils.unescapeUnicode(escaped);
                    if (line.equals(unescaped)) {
                        equal++;
                    } else {
                        logger.info("      line: " + line);
                        logger.info("   escaped: " + escaped);
                        logger.info(" unescaped: " + unescaped);
                    }
                }

            } catch (Throwable e) {
                e.printStackTrace();
                logger.error(e);
                stream.close();
            }
        }
        
        assertTrue(read == equal);
    }
    
}
