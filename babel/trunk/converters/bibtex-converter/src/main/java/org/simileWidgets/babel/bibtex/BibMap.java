/*
 *  (c) Copyright The SIMILE Project 2003-2008. All rights reserved.
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.simileWidgets.babel.util.Util;


/**
 * @author matsakis
 * @author dfhuynh
 */

@SuppressWarnings("unchecked")
final public class BibMap extends HashMap {

    private static final long serialVersionUID = -6088386205750299855L;
	
	private char hashdelim = '\u0000';
	private String type;
	private String key;
	private String uri;
	
	public void setType(String type){
	    this.type = type;
	}
	public String getType(){
	    return type;
	}

	public void setKey(String key){
	    this.key = key;
	}
	public String getKey(){
	    return key;
	}
	
	public String getURI(){
	    return uri;
	}

	/** 
	 * Creates a hash of a bibtex record suitable for use as a unique
	 * identifier.  This hash is invariant to: permutations in the
	 * order of fields, capitalization variation in the keys of
	 * fields, choice of field value delimiters, and whitespace
	 * between fields in the record. 
	 */
	public String createURI(){	
		// Concatenate the type and key, terminated by a null character
		StringBuffer sb = new StringBuffer(512);
		sb.append(type);
		sb.append(hashdelim);
		sb.append(key);
		sb.append(hashdelim);

		// Concatenate the fields, in alphabetical order, terminated by null
		List keys = new ArrayList(size());
		for(Iterator keyset = keySet().iterator(); keyset.hasNext(); ){
			String key = (String) keyset.next();
			if(!key.equals("crossref"))	
				keys.add(key);
		}
		Collections.sort(keys);

		for(int i=0; i<keys.size(); i++){
			String key = (String) keys.get(i);
			sb.append(key);
			sb.append(hashdelim);
			sb.append((String) get(key));
			sb.append(hashdelim);
		}
		uri = "urn:" + Util.computeMD5(sb.toString());
		return uri;
	}
	
	/** 
	 * Some strings in the map are enclosed in brackets {} because they
	 * were strings in the original bibtex.  This method removes those
	 * brackets indiscriminately. 
	 */
	public void normalizeStrings(){
		Iterator keyset = keySet().iterator();
		while(keyset.hasNext()){
			Object key = keyset.next();
			String value = (String) get(key);
			if(value.startsWith("{"))
				put(key, value.substring(1,value.length()-1));
		}
	}
}

