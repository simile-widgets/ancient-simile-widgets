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

package org.simileWidgets.babel.util;

import java.io.*;
import java.util.*;
import java.security.*;

import org.apache.commons.codec.net.URLCodec;

public final class Util {

	public static String join(String[] strings, char separator) {
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < strings.length; i++) {
			if (i > 0) {
				sb.append(separator);
			}
			sb.append(strings[i]);
		}
		return sb.toString();
	}
	
	/**
	 * Computes the MD5 message digest of an <code>InputStream</code>
	 * and returns it as a hexidecimal String. The caller is responsible
	 * for calling the <code>close()</code> method of
	 * <code>message</code>. 
	 * @return A <code>String</code> that is 32
	 * characters long consisting of digits and the lower case alphabetic characters <code>a-f</code>.
	 */
	public static String computeMD5(InputStream message)
		throws IOException {
		int ch;
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		while ((ch = message.read()) != -1) {
			out.write(ch);
		}
		out.close();
		return computeMD5(out.toByteArray());
	}

	/**
	 * Computes the MD5 message digest of a <code>String</code> and
	 * returns it as a hexidecimal String. Since Java strings are
	 * Unicode characters, the string is first encoded into UTF-8, which
	 * defines a unique octet sequence for the string. The returned
	 * <code>String</code> is 32 characters long and alphabetic
	 * characters <code>a-f</code> are lower-case.
	 */
	public static String computeMD5(java.lang.String message) {
		try {
			return computeMD5(message.getBytes("UTF8"));
		} catch (UnsupportedEncodingException e) {
			return null;
		} // won't happen
	}

	/**
	 * Computes the MD5 message digest of a <code>Byte[]</code> and
	 * returns it as a hexidecimal String. The returned
	 * <code>String</code> is 32 characters long and alphabetic
	 * characters <code>a-f</code> are lower-case.
	 */
	public static String computeMD5(byte[] message) {
		try {
			MessageDigest md5 = MessageDigest.getInstance("MD5");
			md5.reset();
			md5.update(message);
			byte[] digest = md5.digest();

			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < digest.length; i++) {
				if ((0xff & digest[i]) < 0x10)
					sb.append('0');
				sb.append(Integer.toHexString(0xff & digest[i]));
			}
			return (sb.toString());
		} catch (NoSuchAlgorithmException e) {
			return null;
		} // won't happen
	}

	//////////////////////////////////////////////////////////////////////
	/** Converts a string into a canonical form for the purpose
	 * embedding into URIs.  Permissible characters are defined in
	 * section 2.2 of RFC 2141,
	 * <a href="http://www.ietf.org/rfc/rfc2141.txt">URN Syntax</a> */
	public static String toURI(String input) {
		try {
			byte[] bytes = input.getBytes("UTF8");
			StringBuffer sb = new StringBuffer(2 * input.length());

			for (int i = 0; i < bytes.length; i++) {
				byte c = bytes[i];
				if ((('a' <= c) && (c <= 'z'))
					|| (('@' <= c) && (c <= 'Z'))
					|| (('0' <= c) && (c <= ';'))
					|| (('\'' <= c) && (c <= '.'))
					|| (c == '$')
					|| (c == '=')
					|| (c == '_')
					|| (c == '!')) {
					sb.append((char) c);
				} else {
					sb.append(((0xff & bytes[i]) < 0x10) ? "%0" : "%");
					sb.append(
						Integer.toHexString(0xff & bytes[i]).toUpperCase());
				}
			}
			return sb.toString();
		} catch (UnsupportedEncodingException e) {
			return null;
		} // won't happen
	}

	//////////////////////////////////////////////////////////////////////
	/** Converts a string into a canonical form for the purpose
	 * embedding into RDF Literals.  Permissible characters are valid
	 * XML characters, which is everything greater than \u0020 in addition 
	 * to: \u0009 or "\t", \u000A or "\n", and \u000D or "\r". */

	public static String toLiteral(String input) {
		boolean good = true;
		int len = input.length();
		for (int i = 0; i < len; i++) {
			int c = (int) input.charAt(i);
			if (c < 0x0020 && c != 0x0009 && c != 0x000a && c != 0x000d)
				good = false;
		}

		if (good)
			return input;

		// Otherwise, we've got a nasty one.
		StringBuffer sb = new StringBuffer(len);
		for (int i = 0; i < len; i++) {
			char c = input.charAt(i);
			if (c >= 0x0020 || c == 0x0009 || c == 0x000a || c == 0x000d)
				sb.append(c);
		}

		return sb.toString();
	}
	

	public static String generateUID() {
		Random rand = new Random();
		StringBuffer sb = new StringBuffer(16);
		for (int i = 0; i < 16; i++)
			sb.append("0123456789ABCDEF".charAt(rand.nextInt(16)));
		return sb.toString();
	}

    final static String s_urlEncoding = "UTF-8";
    final static URLCodec s_codec = new URLCodec();
    
    final static public String decode(String s) {
        try {
            return s_codec.decode(s, s_urlEncoding);
        } catch (Exception e) {
            throw new RuntimeException("Exception decoding " + s + " with " + s_urlEncoding + " encoding.");
        }
    }
    final static public String encode(String s) {
        try {
            return s_codec.encode(s, s_urlEncoding);
        } catch (Exception e) {
            throw new RuntimeException("Exception decoding " + s + " with " + s_urlEncoding + " encoding.");
        }
    }
}

