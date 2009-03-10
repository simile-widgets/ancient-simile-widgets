package org.simileWidgets.babel;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.simileWidgets.babel.util.Util;

import com.oreilly.servlet.multipart.MultipartParser;
import com.oreilly.servlet.multipart.ParamPart;
import com.oreilly.servlet.multipart.Part;


/**
 * @author dfhuynh
 *
 */
public class ReflectorServlet extends HttpServlet {
	private static final long serialVersionUID = 9161198437897234044L;

	//final static private Logger s_logger = Logger.getLogger(ReflectorServlet.class);
	
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		
		String mimetype = "text/plain";
		
		/*
		 * Parse parameters
		 */
        String[] params = StringUtils.splitPreserveAllTokens(request.getQueryString(), '&');
        for (int i = 0; i < params.length; i++) {
            String param = params[i];
            int equalIndex = param.indexOf('=');

            if (equalIndex >= 0) {
                String rawName = param.substring(0, equalIndex);
                String rawValue = param.substring(equalIndex + 1);

                String name = Util.decode(rawName);
                String value = Util.decode(rawValue);

				if (name.equals("mimetype")) {
					mimetype = value;
				}
            }
		}
		
		response.setCharacterEncoding("UTF-8");
		response.setContentType(mimetype);
		Writer writer = new BufferedWriter(
			new OutputStreamWriter(response.getOutputStream(), "UTF-8"));
		
		try {
			MultipartParser parser = new MultipartParser(request, 5 * 1024 * 1024);
			
			Part part = null;
			while ((part = parser.readNextPart()) != null) {
				if (part.isParam()) {
					ParamPart paramPart = (ParamPart) part;
					String paramName = paramPart.getName();
					if (paramName.equals("content")) {
						writer.write(paramPart.getStringValue());
					}
				}
			}
		} finally {
			writer.close();
		}
	}
}
