/*
 * (c) Copyright MIT and contributors 2003-2008. Some rights reserved.
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

package org.simileWidgets.babel.bibtex;

import java.io.InputStream;
import java.io.Reader;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.codec.net.URLCodec;
import org.apache.commons.lang.NotImplementedException;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.openrdf.model.Resource;
import org.openrdf.model.URI;
import org.openrdf.model.Value;
import org.openrdf.model.impl.BNodeImpl;
import org.openrdf.model.impl.LiteralImpl;
import org.openrdf.model.impl.URIImpl;
import org.openrdf.model.vocabulary.RDF;
import org.openrdf.model.vocabulary.RDFS;
import org.openrdf.sail.Sail;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;
import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.simileWidgets.babel.util.ListMap;

/**
 * @author matsakis
 * @author dfhuynh
 */
public final class BibtexReader implements BabelReader {
	final static private Logger s_logger = Logger.getLogger(BibtexReader.class);
	
	final static private String s_namespace = "http://simile.mit.edu/2006/11/bibtex#";
    final static private URI    s_dc_date = new URIImpl("http://purl.org/dc/elements/1.1/date");
	static private long 		s_idGenerator = 0;
	
    final static String s_urlEncoding = "UTF-8";
    final static URLCodec s_codec = new URLCodec();
    
	public String getLabel(Locale locale) {
		return "Bibtex Reader";
	}
	
	public String getDescription(Locale locale) {
		return "Reads bibtex format";
	}
	
	public SemanticType getSemanticType() {
		return BibtexType.s_singleton;
	}
	
	public SerializationFormat getSerializationFormat() {
		return BibtexFormat.s_singleton;
	}

	public String getOutputMimetype() {
		return "text/plain";
	}
	
	public boolean takesReader() {
		return true;
	}
	
	public void read(InputStream inputStream, Sail sail, Properties properties, Locale locale) throws Exception {
		throw new NotImplementedException();
	}

	@SuppressWarnings("unchecked")
    public void read(Reader reader, Sail sail, Properties properties, Locale locale) throws Exception {
		String ourNamespace = properties.getProperty("namespace");
		
		BibtexGrammar parser = new BibtexGrammar(new BibtexCleanerReader(reader));
		parser.parse();
		
		List<BibMap> records = parser.getRecords();
		ListMap keymap = new ListMap();
		preprocess(records, keymap);
		
		/*
		 * Set namespaces
		 */
		SailConnection c = sail.getConnection();
		try {
			c.setNamespace("bibtex", s_namespace);
			c.commit();
		} catch (SailException e) {
			c.rollback();
			c.close();
			throw e;
		}

		/*
		 * Assert as RDF
		 */
		try {
			URI publicationType = new URIImpl(s_namespace + "Publication");
			URI authorType = new URIImpl(s_namespace + "Author");
			URI keyPredicate = new URIImpl(s_namespace + "key");
			URI publicationTypePredicate = new URIImpl(s_namespace + "type");
			
			ListMap processedKeys = new ListMap();
			Map<String, String> authorLastNames = new HashMap<String, String>();
			Map<String, String> authorOriginalNames = new HashMap<String, String>();
			
			for (BibMap rec : records) {
				String URI = rec.getURI();
				String key = rec.getKey();
				if (key == null) {
				    key = URI;
				    s_logger.warn("key is null, using URI as key: " + key);
				}
				
				if (processedKeys.count(key) > 0) {
					s_logger.warn(processedKeys.check(key, URI) ?
						"Found identical entry with key " + key :
						"Found alternate entry with key " + key);
				}
				processedKeys.put(key, URI);
				
				Resource record = new URIImpl(URI);
				
				/*
				 * Assert basic properties
				 */
				c.addStatement(record, RDF.TYPE, publicationType);
				c.addStatement(record, keyPredicate, new LiteralImpl(key));
				c.addStatement(record, publicationTypePredicate, new LiteralImpl(rec.getType()));
				
                /*
                 * Assert the remaining properties of the record
                 */
				try {
					Iterator predicates = rec.keySet().iterator();			
					while (predicates.hasNext()) {
						String p = (String) predicates.next();
						String v = (String) rec.get(p);
						
						if (v == null) {
							continue;
						} else {
							v = BibtexUtils.unescapeUnicode(v).replaceAll("\\s+", " ");;
						}
						
						boolean isMultiple = false;
						if (p.endsWith(":multiple")) {
							isMultiple = true;
							p = p.substring(0, p.length() - ":multiple".length());
						}
						p = URLEncoder.encode(p, "UTF-8");
						
						URIImpl predicate = new URIImpl(s_namespace + p);
						
						/*
						 * Split authors into a sequence.
						 */
						if ("author".equals(p)) {
							List<String> elements = new LinkedList<String>();
							
							String[] segments = StringUtils.splitByWholeSeparator(v, " and ");
							for (int x = 0; x < segments.length; x++) {
								String originalName = segments[x].trim();
								if (originalName.startsWith("and ")) {
									originalName = originalName.substring(4);
								}
								String fullName = originalName;
								String lastName = null;
								
								int comma = fullName.indexOf(',');
								if (comma > 0) {
									lastName = fullName.substring(0, comma).trim();
								} else {
									int space = fullName.lastIndexOf(' ');
									if (space > 0) {
										lastName = fullName.substring(space + 1);
										fullName = lastName + ", " + fullName.substring(0, space).trim();
									} else {
										lastName = fullName;
									}
								}
								
								elements.add(fullName);
								authorLastNames.put(fullName, lastName);
								authorOriginalNames.put(fullName, originalName);
							}
							
							Resource sequence = new BNodeImpl("seq" + s_idGenerator++);
							c.addStatement(sequence, RDF.TYPE, RDF.SEQ);
							c.addStatement(record, predicate, sequence);
							
							int count = 0;
							for (String s : elements) {
								c.addStatement(
									sequence, 
									new URIImpl(RDF.NAMESPACE + "_" + (++count)), 
									new URIImpl(ourNamespace + s_codec.encode(s, s_urlEncoding))
								);
							}
						} else if ("keywords".equals(p) || "tags".equals(p)) {
						    String[] tags = StringUtils.splitByWholeSeparator(v, ",");
						    for (String tag : tags) {
                                tag = tag.trim();
                                Value value = (Value) new LiteralImpl(tag);
                                c.addStatement(record, predicate, value);   
						    }
						} else if (isMultiple) {
							String[] values = StringUtils.splitByWholeSeparator(v, ";");
							for (String v2 : values) {
								v2 = v2.trim();
								Value value = (p.equals("crossref") && keymap.containsKey(v2))
									? (Value) new URIImpl(((BibMap) keymap.get(v2)).getURI())
									: (Value) new LiteralImpl(v2);
								
								c.addStatement(record, predicate, value);	
							}
						} else {
							Value value = (p.equals("crossref") && keymap.containsKey(v))
								? (Value) new URIImpl(((BibMap) keymap.get(v)).getURI())
								: (Value) new LiteralImpl(v);
								
							c.addStatement(record, predicate, value);	
						}
					}
				} catch (UnsupportedEncodingException e) {
					// won't happen, but quiets the compiler
				}
                
                /*
                 * Asserts computed properties
                 */
                String year = (String) rec.get("year");
                if (year != null) {
                    c.addStatement(record, s_dc_date, 
                        new LiteralImpl(combineYearAndMonth(year, (String) rec.get("month"))));   
                }
			}
			
			URIImpl lastNamePredicate = new URIImpl(s_namespace + "last-name");
			URIImpl originalNamePredicate = new URIImpl(s_namespace + "original-name");
			for (String fullName : authorLastNames.keySet()) {
				URI resource = new URIImpl(ourNamespace + s_codec.encode(fullName, s_urlEncoding));
				
				c.addStatement(resource, RDF.TYPE, authorType);
				c.addStatement(resource, RDFS.LABEL, new LiteralImpl(fullName));
				c.addStatement(resource, lastNamePredicate, new LiteralImpl(authorLastNames.get(fullName)));
				c.addStatement(resource, originalNamePredicate, new LiteralImpl(authorOriginalNames.get(fullName)));
			}
			
			c.commit();
		} catch (Exception e) {
			c.rollback();
			throw e;
		} finally {
			c.close();
		}
	}
		
	@SuppressWarnings("unchecked")
    private void preprocess(List<BibMap> records, ListMap keymap) {
		/*
		 * fill a map of keys to records, normalizing strings at the same time
		 */ 
		for (BibMap record : records) {
			record.normalizeStrings();
			keymap.put(record.getKey(), record);
		}

		/*
		 * resolve cross-references
		 */
		for (BibMap record : records) {
			String key = record.getKey();
			
			if (record.containsKey("crossref")){
				String crosskey = (String) record.get("crossref");
				
				if (!keymap.containsKey(crosskey)) {
					s_logger.warn("Record " + key + " contains undefined crossref " + crosskey);
 				} else {
					if (keymap.count(crosskey) > 1) {
						s_logger.warn("Ambiguous crossref " + crosskey + " in " + key);
					}
					
					Map ref = (Map) keymap.get(crosskey);
					if (ref.containsKey("crossref")) {
						s_logger.warn("Ignoring nested crossref in " + crosskey + 
								" while resolving crossrefs for " + key);
					}
					
					for (Object rkey : ref.keySet()) {
						if(!record.containsKey(rkey) && !rkey.equals("crossref")) {
							record.put(rkey, ref.get(rkey));
						}
					}
				}
			}
		}

		/*
		 * Mint URIs
		 */ 
		for (BibMap record : records) {
			record.createURI();
		}
	}
    
    final static Map<String, String> s_monthMap = new HashMap<String, String>();
    
    static {
        s_monthMap.put("jan", "01");
        s_monthMap.put("feb", "02");
        s_monthMap.put("mar", "03");
        s_monthMap.put("apr", "04");
        s_monthMap.put("may", "05");
        s_monthMap.put("jun", "06");
        s_monthMap.put("jul", "07");
        s_monthMap.put("aug", "08");
        s_monthMap.put("sep", "09");
        s_monthMap.put("oct", "10");
        s_monthMap.put("nov", "11");
        s_monthMap.put("dec", "12");
    }

    static private String combineYearAndMonth(String year, String month) {
        if (month != null) {
            month = s_monthMap.get(month.substring(0, Math.min(3, month.length())).toLowerCase());
        }
        if (month != null) {
            return year + "-" + month;
        } else {
            return year;
        }
    }
}

