package org.simileWidgets.babel;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.runtime.RuntimeConstants;
import org.simileWidgets.babel.BabelWriter;
import org.simileWidgets.babel.util.Util;


/**
 * @author dfhuynh
 *
 */
public class PreviewServlet extends TranslatorServlet {
	private static final long serialVersionUID = -2862110707968976815L;

	//final static private Logger s_logger = Logger.getLogger(PreviewServlet.class);
	
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
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String template = null;
        
        String[] params = StringUtils.splitPreserveAllTokens(request.getQueryString(), '&');
        for (int i = 0; i < params.length; i++) {
            String param = params[i];
            int equalIndex = param.indexOf('=');

            if (equalIndex >= 0) {
                String name = param.substring(0, equalIndex);
                if ("template".equals(name)) {
                	template = Util.decode(param.substring(equalIndex + 1));
                	break;
                }
            }
        }

        StringWriter writer = new StringWriter();
		try {
			ResponseInfo responseInfo = internalService(request, response, params, writer);
			if (responseInfo.m_status != HttpServletResponse.SC_OK) {
				writeBufferedResponse(response, writer, responseInfo);
			} else {
	            VelocityContext vcContext = new VelocityContext();
		            
	            vcContext.put("data", writer.toString());
	            vcContext.put("utilities", new PreviewUtilities());
		            
	    		response.setCharacterEncoding("UTF-8");
	    		response.setContentType("text/html");
	    		response.setStatus(HttpServletResponse.SC_OK);
	    		
	            m_ve.mergeTemplate(template, vcContext, response.getWriter());
			}
		} catch (Exception e) {
			writeError(writer, "Internal error", e);
		} finally {
			writer.close();
		}
	}
	
	@Override
	protected void setContentEncodingAndMimetype(
			ResponseInfo responseInfo, BabelWriter writer, String mimetype) {
		responseInfo.m_contentEncoding = "UTF-8";
		responseInfo.m_mimeType = "text/html";
	}
}
