package org.simileWidgets.babel;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
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
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.runtime.RuntimeConstants;
import org.openrdf.sail.Sail;
import org.openrdf.sail.memory.MemoryStore;
import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.BabelWriter;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.util.Util;

import com.oreilly.servlet.multipart.FilePart;
import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.ParamPart;
import com.oreilly.servlet.multipart.Part;


/**
 * @author dfhuynh
 *
 */
public class TranslatorServlet extends HttpServlet {
	final static private long serialVersionUID = 2083937775584527297L;
	final static private Logger s_logger = Logger.getLogger(TranslatorServlet.class);
	
    private VelocityEngine m_ve;
    
    static protected class ResponseInfo {
    	int		m_status = HttpServletResponse.SC_OK;
    	String	m_contentEncoding = "UTF-8";
    	String	m_mimeType = "text/html";
    }
    
    @Override
    public void init() throws ServletException {
        super.init();
        
        try {
            File webapp = new File(getServletContext().getRealPath("/"));
            
            Properties velocityProperties = new Properties();
            velocityProperties.setProperty(
                    RuntimeConstants.FILE_RESOURCE_LOADER_PATH, 
                    new File(new File(webapp, "WEB-INF"), "templates").getAbsolutePath());
            
            m_ve = new VelocityEngine();
            m_ve.init(velocityProperties);
        } catch (Exception e) {
            s_logger.error("Error initializing TranslatorServlet", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
    		throws ServletException, IOException {
    	
        String[] params = StringUtils.splitPreserveAllTokens(request.getQueryString(), '&');
        StringWriter writer = new StringWriter();
		try {
			writeBufferedResponse(response, writer, internalService(request, response, params, writer));
        } catch (Exception e) {
        	returnStackTrace(e, response);
		} finally {
			writer.close();
		}
    }
    
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		
        String[] params = StringUtils.splitPreserveAllTokens(request.getQueryString(), '&');
        StringWriter writer = new StringWriter();
		try {
			writeBufferedResponse(response, writer, internalService(request, response, params, writer));
        } catch (Exception e) {
        	returnStackTrace(e, response);
		} finally {
			writer.close();
		}
	}
	
	protected void writeBufferedResponse(HttpServletResponse response, Writer writer, ResponseInfo responseInfo) throws Exception {
		response.setCharacterEncoding(responseInfo.m_contentEncoding);
		response.setContentType(responseInfo.m_mimeType);
		response.setStatus(responseInfo.m_status);
		
		Writer writer2 = 
			new BufferedWriter(
				new OutputStreamWriter(
					response.getOutputStream(), 
					responseInfo.m_contentEncoding));
		try {
			writer2.write(writer.toString());
		} finally {
			writer2.close();
		}
	}
	
	protected void returnStackTrace(Exception e, HttpServletResponse response) {
    	response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    	response.setCharacterEncoding("UTF-8");
    	
		try {
			PrintWriter printWriter = new PrintWriter(
				new OutputStreamWriter(response.getOutputStream(), "UTF-8"));
			
	        e.printStackTrace(printWriter);
	        
	        printWriter.flush();
	        printWriter.close();
		} catch (Exception e1) {
			s_logger.error("Error returning stack trace", e1);
		}
	}
	
	protected ResponseInfo internalService(
		HttpServletRequest 	request, 
		HttpServletResponse response,
		String[]			params,
		Writer				writer
	) {
		ResponseInfo responseInfo = new ResponseInfo();
		
		List<String>	urls = new ArrayList<String>();
		Properties 		readerProperties = new Properties();
		Properties 		writerProperties = new Properties();
		String			readerName = null;
		String			writerName = null;
		String			mimetype = null;
		
		/*
		 * Parse parameters
		 */
        for (int i = 0; i < params.length; i++) {
            String param = params[i];
            int equalIndex = param.indexOf('=');

            if (equalIndex >= 0) {
                String rawName = param.substring(0, equalIndex);
                String rawValue = param.substring(equalIndex + 1);

                String name = Util.decode(rawName);
                String value = Util.decode(rawValue);

				if (name.startsWith("in-")) {
					readerProperties.setProperty(name.substring(3), value);
				} else if (name.startsWith("out-")) {
					writerProperties.setProperty(name.substring(4), value);
				} else if (name.equals("reader")) {
					readerName = value;
				} else if (name.equals("writer")) {
					writerName = value;
				} else if (name.equals("mimetype")) {
					mimetype = value;
				} else if (name.equals("url")) {
					urls.add(value);
                } else if (name.equals("callback")) {
                    writerProperties.setProperty(name, value);
				}
            }
		}
		
		/*
		 * Instantiate converters
		 */
		if (readerName == null) {
			responseInfo.m_status = HttpServletResponse.SC_BAD_REQUEST;
			writeError(writer, "No reader name in request", null);
			
			return responseInfo;
		} else if (writerName == null) {
			responseInfo.m_status = HttpServletResponse.SC_BAD_REQUEST;
			writeError(writer, "No writer name in request", null);
			
			return responseInfo;
		}
		
		BabelReader babelReader = Babel.getReader(readerName); 
		BabelWriter babelWriter = Babel.getWriter(writerName); 
		if (babelReader == null) {
			responseInfo.m_status = HttpServletResponse.SC_BAD_REQUEST;
			writeError(writer, "No reader of name " + readerName, null);
			
			return responseInfo;
		} else if (babelWriter == null) {
			responseInfo.m_status = HttpServletResponse.SC_BAD_REQUEST;
			writeError(writer, "No writer of name " + writerName, null);
			
			return responseInfo;
		}
		
		/*
		 * Check compatibility
		 */
		SemanticType readerType = babelReader.getSemanticType();
		SemanticType writerType = babelWriter.getSemanticType();
		if (!writerType.getClass().isInstance(readerType)) {
			responseInfo.m_status = HttpServletResponse.SC_BAD_REQUEST;
			writeError(
				writer,
				"Writer " + writerType.getClass().getName() + 
					" cannot take input from reader " + readerType.getClass().getName(), 
				null
			);
			
			return responseInfo;
		}
		
		/*
		 * Read in data, convert, and write result out
		 */
		MemoryStore store = new MemoryStore();
		Locale locale = request.getLocale();
		try {
			store.initialize();
			try {
				readAndConvert(babelReader, store, readerProperties, request, urls, locale);
				
				setContentEncodingAndMimetype(responseInfo, babelWriter, mimetype);
				
				writeResult(babelWriter, store, writerProperties, writer, locale);
			} finally {
				store.shutDown();
			}
		} catch (Throwable e) {
            writeError(writer, e.getLocalizedMessage(), e);
		}
		
		return responseInfo;
	}
	
	protected void readAndConvert(
		BabelReader 		converter,
		Sail				sail,
		Properties			readerProperties,
		HttpServletRequest	request,
		List<String>		urls,
		Locale				locale
	) throws Exception {
		MultipartParser parser = null;
		try {
			parser = new MultipartParser(request, 20 * 1024 * 1024);
		} catch (Exception e) {
			// silent
		}
		
        readerProperties.setProperty("namespace", generateNamespace(request));
		if (parser != null) {
			Part part = null;
			while ((part = parser.readNextPart()) != null) {
	            readerProperties.setProperty("url", "");
	            
				if (part.isFile()) {
					FilePart filePart = (FilePart) part;
					if (converter.takesReader()) {
						Reader reader = new InputStreamReader(filePart.getInputStream());
						try {
							converter.read(reader, sail, readerProperties, locale);
						} finally {
							reader.close();
						}
					} else {
						InputStream inputStream = filePart.getInputStream();
						try {
							converter.read(inputStream, sail, readerProperties, locale);
						} finally {
							inputStream.close();
						}
					}
				} else if (part.isParam()) {
					ParamPart paramPart = (ParamPart) part;
					String paramName = paramPart.getName();
					if (paramName.equals("raw-text")) {
						if (converter.takesReader()) {
							StringReader reader = new StringReader(paramPart.getStringValue());
							try {
								converter.read(reader, sail, readerProperties, locale);
							} finally {
								reader.close();
							}
						}
					} else if (paramName.equals("url")) {
						String url = paramPart.getStringValue();
						if (url.length() > 0) {
							readAndConvertURL(converter, sail, readerProperties, url, locale);
						}
					}
				}
			}
		}
		
		for (String url : urls) {
			if (url.length() > 0) {
				readAndConvertURL(converter, sail, readerProperties, url, locale);
			}
		}
	}
	
	protected void readAndConvertURL(
		BabelReader 		converter,
		Sail				sail,
		Properties			readerProperties,
		String 				url,
		Locale				locale
	) throws Exception {
		URLConnection connection = null;
		
		try {
			connection = new URL(url).openConnection();
			connection.setConnectTimeout(5000);
			connection.connect();
		} catch (Exception e) {
			throw new BabelException("Cannot connect to " + url, e);
		}
		
        readerProperties.setProperty("namespace", makeIntoNamespace(url));
        readerProperties.setProperty("url", url);

        InputStream inputStream = null;
        try {
			inputStream = connection.getInputStream();
        } catch (Exception e) {
			throw new BabelException("Cannot retrieve content from " + url, e);
        }
        
        try {
			if (converter.takesReader()) {
				String encoding = connection.getContentEncoding();
				
				Reader reader = new InputStreamReader(
					inputStream, (encoding == null) ? "ISO-8859-1" : encoding);
							
				converter.read(reader, sail, readerProperties, locale);
			} else {
				converter.read(inputStream, sail, readerProperties, locale);
			}
        } finally {
			inputStream.close();
        }
	}
	
	protected void writeResult(
		BabelWriter 		babelWriter, 
		Sail 				sail, 
		Properties 			writerProperties,
		Writer				writer,
		Locale				locale
	) throws Exception {
		babelWriter.write(writer, sail, writerProperties, locale);
	}
    
    protected void writeError(Writer writer, String message, Throwable e) {
        try {
            VelocityContext vcContext = new VelocityContext();
            
            vcContext.put("message", message);
            vcContext.put("hasException", e != null);
            if (e != null) {
	            vcContext.put("exception", e);
	            
	            {
	                StringWriter stringWriter = new StringWriter();
	                PrintWriter printWriter = new PrintWriter(stringWriter);
	                e.printStackTrace(printWriter);
	                printWriter.close();
	                
	                vcContext.put("stackTrace", stringWriter.toString());
	            }
            }
            m_ve.mergeTemplate("error.vt", vcContext, writer);
        } catch (Throwable e1) {
        	s_logger.error("Failed to write error into response", e1);
        }
    }
    
	protected void setContentEncodingAndMimetype(
			ResponseInfo responseInfo, BabelWriter writer, String mimetype) {
		responseInfo.m_contentEncoding = "UTF-8";
		responseInfo.m_mimeType =
			(mimetype == null || mimetype.equals("default")) ? 
					writer.getSerializationFormat().getMimetype() :
					mimetype;
	}
	
    static protected String generateNamespace(HttpServletRequest request) {
    	return makeIntoNamespace("http://" + request.getRemoteAddr() + "/");
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
