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

import org.apache.log4j.Logger;

public class BibtexUtils {

    static Logger logger = Logger.getLogger(BibtexUtils.class);
    
    public static StringBuffer escapeUnicode(StringBuffer in) {

        StringBuffer out = new StringBuffer(in.length());
        
        for (int i = 0; i < in.length(); i++) {
            char c = in.charAt(i);
            if ((c & 0xFF80) == 0) {
                if (i > 0 && c == 'u' && in.charAt(i-1) == '\\') {
                    out.append('\\');
                }
                out.append(c);
            } else {
                out.append("\\u");
                // append hexadecimal form of c left-padded with 0
                for (int shift = (4 - 1) * 4; shift >= 0; shift -= 4) {
                    int digit = 0xf & (c >> shift);
                    int hc = (digit < 10) ? '0' + digit : 'a' - 10 + digit;
                    out.append((char) hc);
                }                
            }
        }

        return out;
    }
    
    public static String unescapeUnicode(String s) {
        if (s.indexOf("\\u") < 0) { 
            return s;
        }
        
        StringBuffer sb = new StringBuffer(s.length());
        int l = 0;
        int u = s.indexOf("\\u", l);
        while (u >= 0) {
            sb.append(s.substring(l, u));
            if (u > 0 && s.charAt(u-1) != '\\') {
                try {
                    sb.append((char) Integer.parseInt(s.substring(u + 2, u + 6), 16));
                    l = u + 6;
                } catch (Exception e) {
                    logger.info(e);
                    sb.append("\\u");
                    l = u + 2;
                }
            } else {
                sb.append("\\u");
                l = u + 2;
            }
            u = s.indexOf("\\u", l);
        }
        sb.append(s.substring(l));
        
        return sb.toString().replace("\\\\u", "\\u");
    }
    
 }
