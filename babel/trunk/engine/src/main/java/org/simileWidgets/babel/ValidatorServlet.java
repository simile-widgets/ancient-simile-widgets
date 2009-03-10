package org.simileWidgets.babel;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
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
import org.mozilla.javascript.CompilerEnvirons;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;
import org.mozilla.javascript.RelaxedJSONException;
import org.mozilla.javascript.RelaxedJSONParser;
import org.simileWidgets.babel.util.Util;

import com.oreilly.servlet.multipart.FilePart;
import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.Part;


/**
 * @author dfhuynh
 *
 */
public class ValidatorServlet extends HttpServlet {
	private static final long serialVersionUID = -5216314675436973678L;
	final static private Logger s_logger = Logger.getLogger(ValidatorServlet.class);

	private VelocityEngine m_ve;
	
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
			e.printStackTrace();
		}
	}
	
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		
        response.setContentType("text/html");
           
		MultipartParser parser = new MultipartParser(request, 5 * 1024 * 1024);
		
		Part part = null;
		while ((part = parser.readNextPart()) != null) {
			if (part.isFile()) {
				FilePart filePart = (FilePart) part;
				Reader reader = new InputStreamReader(filePart.getInputStream());
				try {
					internalHandle(request, response, reader);
				} finally {
					reader.close();
				}
				break;
			}
		}
	}
	
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html");
           
		String url = null;
		String expression = null;
		
		/*
		 * Parse parameters
		 */
        String[] params = StringUtils.splitPreserveAllTokens(request.getQueryString(), '&');
        if (params != null) {
	        for (int i = 0; i < params.length; i++) {
	            String param = params[i];
	            int equalIndex = param.indexOf('=');
	
	            if (equalIndex >= 0) {
	                String rawName = param.substring(0, equalIndex);
	                String rawValue = param.substring(equalIndex + 1);
	
	                String name = Util.decode(rawName);
	                String value = Util.decode(rawValue);
	
					if (name.equals("url")) {
						url = value;
						break;
					} else if (name.equals("expression")) {
						expression = value;
						break;
					}
	            }
			}
        }
        
		/*
		 * Load source from URL if any
		 */
        if (url != null) {
			URLConnection connection = null; 
			try {
				connection = new URL(url).openConnection();
				connection.setConnectTimeout(5000);
				connection.connect();
			} catch (Exception e) {
				s_logger.error(e);
				return;
			}
			
			InputStream inputStream = connection.getInputStream();
			String encoding = connection.getContentEncoding();
			
			Reader reader = new InputStreamReader(
				inputStream, (encoding == null) ? "ISO-8859-1" : encoding);
			try {
				internalHandle(request, response, reader);
			} finally {
				reader.close();
			}
        } else if (expression != null) {
        	internalHandle(request, response, new StringReader(expression));
        } else {
            try {
                VelocityContext vcContext = new VelocityContext();
   	            vcContext.put("hasCode", new Boolean(false));
   	            
	            m_ve.mergeTemplate("validator.vt", vcContext, response.getWriter());
	        } catch (Throwable t) {
	        	throw new ServletException(t);
	        }
        }
	}
	
	protected void internalHandle(
		HttpServletRequest 	request, 
		HttpServletResponse response,
		Reader 				code
	) throws ServletException, IOException {
        MyErrorReporter errorReporter = new MyErrorReporter();
        {
	        Context context = Context.enter();
	        
	        CompilerEnvirons compilerEnv = new CompilerEnvirons();
	        compilerEnv.initFromContext(context);
	        
	        RelaxedJSONParser parser = new RelaxedJSONParser(compilerEnv, errorReporter);
	        parser.check(code, "", 1);
        }
        
        try {
            VelocityContext vcContext = new VelocityContext();
            {
	            StringWriter writer = new StringWriter();
	            
	            vcContext.put("hasCode", new Boolean(true));
	            vcContext.put("hasError", errorReporter.m_errors.size() > 0);
	            vcContext.put("errors", errorReporter.m_errors);
	            
	            writer.close();
            }
            
            m_ve.mergeTemplate("validator.vt", vcContext, response.getWriter());
        } catch (Throwable t) {
        	throw new ServletException(t);
        }
	}
	
	protected class MyErrorReporter implements ErrorReporter {
		public List<RelaxedJSONException> m_errors = new ArrayList<RelaxedJSONException>();
		
		public void error(String message, String sourceName, int line, String lineSource, int lineOffset) {
			m_errors.add(new RelaxedJSONException(message, sourceName, line, lineSource, lineOffset));
		}

		public EvaluatorException runtimeError(String message, String sourceName, int line, String lineSource, int lineOffset) {
			return null;
		}

		public void warning(String message, String sourceName, int line, String lineSource, int lineOffset) {
			m_errors.add(new RelaxedJSONException(message, sourceName, line, lineSource, lineOffset));
		}
	}
}