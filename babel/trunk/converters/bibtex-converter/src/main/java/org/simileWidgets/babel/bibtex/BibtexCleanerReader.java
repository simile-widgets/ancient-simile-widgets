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

import java.io.BufferedReader;
import java.io.FilterReader;
import java.io.IOException;
import java.io.Reader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;

/**
 * @author matsakis
 * @author dfhuynh
 * @author stefanom
 */

final public class BibtexCleanerReader extends FilterReader {
    
    static Logger logger = Logger.getLogger(BibtexCleanerReader.class);
    
	// The two possible states a BibtexCleanerReader can be in
	private final int REC = 0;
	private final int CRUD = 1;

	// Local State Variables
	private boolean inIsEmpty, done;
	// Begin processing in the inter-record 'crud'
	private int state = CRUD;
	// the current depth of curly braces '{}'
	private int bracecount = 0;
	// The initial delimiter of the current record
	private char delimiter = (char) 0; 
	// Buffer the current line in buffer
	private final StringBuffer buffer = new StringBuffer();
	// This pattern detects the beginning of a record
	private final Pattern recpattern = Pattern.compile("@\\p{Blank}*\\p{Alpha}+\\p{Blank}*[({]");
	
	
	public BibtexCleanerReader(Reader in) {
		super(in);
		this.in = new BufferedReader(in);
		inIsEmpty = done = false;
	}
	
	// Methods that respect the public interface of a Reader, with a little
	// glue that supports the implementation of this class

	public void reset() throws IOException {
		inIsEmpty = done = false;
		state = CRUD;
		bracecount = 0;
		buffer.delete(0, buffer.length());
		super.reset();
	}

	public void close() throws IOException {
		inIsEmpty = done = true;
		super.close();
	}

	public boolean ready() throws IOException {
		return in.ready() || buffer.length() > 0;
	}
	
	public boolean markSupport() {
	    return false;
	}

	public void mark(int readAheadLimit) {
	    throw new RuntimeException("mark() unsupported on BibtexCleanerReader");
	}
	
	public long skip(long n) throws IOException {
		int count = 0;
		while (count < n && !done) {
			read();
			count++;
		}
		return count;
	}

	public int read(char[] cbuf) throws IOException {
		return read(cbuf, 0, cbuf.length);
	}

	public int read(char[] cbuf, int off, int len) throws IOException {
		int count = 0;
		while (count < len && !done) {
			int c = read();
			if (c != -1) {
				cbuf[off++] = (char) c;
				count++;
			}
		}
		return (done && count == 0) ? -1 : count;
	}
	
	// Consumes characters one at a time from buffer.  When buffer is
	// empty, calls readline() to fill it.  If readline() doesn't add anything
	// else, sets done and returns -1 henceforth.
	public int read() throws IOException {
		if (!done && buffer.length() == 0) {
			readline();
		}
		if (done || buffer.length() == 0) {
			done = true;
			return -1;
		}
		int val = buffer.charAt(0);
		buffer.deleteCharAt(0);
		return val;
	}
	
	// Responsible for augmenting buffer and setting inIsEmpty.  The only
	// method that touches "in" directly.
	private void readline() throws IOException {
		if (inIsEmpty) {
			return;
		}
		String text = ((BufferedReader) in).readLine();
		if (text == null) {
			inIsEmpty = true;
			return;
		}
		StringBuffer line = new StringBuffer(text);

		line = BibtexUtils.escapeUnicode(line);
		
		switch (state) {
			case CRUD: crud(line); break;
			case REC: rec(line);
		}
		buffer.append('\n');
	}

	// Used to scan lines when we're in crud mode.  If the line doesn't
	// contain the beginning of a record, removes everything.  Otherwise,
	// strips the stuff before the record, appends the beginning of the 
	// record to the buffer, and then enters record mode
	private void crud(StringBuffer line) {
		Matcher match = recpattern.matcher(line);
		if (match.find()) {
			String recstart = match.group();
			line.delete(0, line.indexOf(recstart) + recstart.length());
			buffer.append(recstart);
			delimiter = recstart.charAt(recstart.length()-1);
			state = REC;
			bracecount = 0;
			rec(line);
		} else {
			line.delete(0, line.length());
		}
	}
	
	// Used to scan lines when we're in rec mode.  If the line doesn't
	// contain the end of a record, just appends the characters to
	// buffer. Otherwise, add the end to buffer, then strip the stuff
	// afterwards,strips the stuff after the record, appends the beginning
	// of the record to the buffer, and then enters record mode
	
	private void rec(StringBuffer line) {
		boolean closed = false;
		int i = 0;
		while (!closed && i<line.length()) {
			char c = line.charAt(i++);
			if (c == '{') {
				bracecount++;
			} else if (c == '}') {
				bracecount--;
			}
			if ((c == ')' && delimiter == '(' && bracecount == 0) ||
			    (c == '}' && delimiter == '{' && bracecount == -1))
				closed = true;
			}
		if (!closed) {
			buffer.append(line);
			line.delete(0, line.length());
		} else {
			buffer.append(line.substring(0, i));
			line.delete(0, i);
			state = CRUD;
			crud(line);
		}
	}
}
