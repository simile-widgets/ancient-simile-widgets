package org.simileWidgets.babel;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.BabelWriter;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.simileWidgets.babel.util.IndentWriter;
import org.simileWidgets.babel.util.JSObject;


public class ConfigServlet extends HttpServlet {

	private static final long serialVersionUID = -3750091194974192970L;

	//final static private Logger s_logger = Logger.getLogger(ConfigServlet.class);

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		
		JSObject config = new JSObject();
		
		Map<Class<? extends SerializationFormat>, SerializationFormat> formats = new HashMap<Class<? extends SerializationFormat>, SerializationFormat>();
		Map<Class<? extends SemanticType>, SemanticType> semanticTypes = new HashMap<Class<? extends SemanticType>, SemanticType>();
		
		List<JSObject> readers = new ArrayList<JSObject>();
		for (String name : Babel.s_readers.keySet()) {
			BabelReader reader = Babel.getReader(name);
			JSObject readerO = new JSObject();
			
			SerializationFormat format = reader.getSerializationFormat();
			SemanticType semanticType = reader.getSemanticType();
			formats.put(format.getClass(), format);
			semanticTypes.put(semanticType.getClass(), semanticType);
			
			readerO.put("name", name);
			readerO.put("format", format.getClass().getName());
			readerO.put("semanticType", semanticType.getClass().getName());
			
			readers.add(readerO);
		}
		config.put("readers", readers);

		List<JSObject> writers = new ArrayList<JSObject>();
		for (String name : Babel.s_writers.keySet()) {
			BabelWriter writer = Babel.getWriter(name);
			JSObject writerO = new JSObject();
			
			SerializationFormat format = writer.getSerializationFormat();
			SemanticType semanticType = writer.getSemanticType();
			formats.put(format.getClass(), format);
			semanticTypes.put(semanticType.getClass(), semanticType);
			
			writerO.put("name", name);
			writerO.put("format", format.getClass().getName());
			writerO.put("semanticType", semanticType.getClass().getName());
			if (Babel.s_previewTemplates.containsKey(name)) {
				writerO.put("previewTemplate", Babel.s_previewTemplates.get(name));
			}
			
			writers.add(writerO);
		}
		config.put("writers", writers);
		
		JSObject formatsO = new JSObject();
		for (Class<? extends SerializationFormat> c : formats.keySet()) {
			SerializationFormat format = formats.get(c);
			
			JSObject formatO = new JSObject();
			formatO.put("name", c.getName());
			formatO.put("label", format.getLabel(null));
			formatO.put("description", format.getDescription(null));
			
			formatsO.put(c.getName(), formatO);
		}
		config.put("formats", formatsO);
		
		JSObject semanticTypesO = new JSObject();
		for (Class<? extends SemanticType> c : semanticTypes.keySet()) {
			SemanticType semanticType = semanticTypes.get(c);
			
			JSObject semanticTypeO = new JSObject();
			semanticTypeO.put("name", c.getName());
			semanticTypeO.put("label", semanticType.getLabel(null));
			semanticTypeO.put("description", semanticType.getDescription(null));
			semanticTypeO.put("supertype", c.getSuperclass().getName());
			
			semanticTypesO.put(c.getName(), semanticTypeO);
		}
		config.put("semanticTypes", semanticTypesO);
		
		IndentWriter writer = new IndentWriter(new OutputStreamWriter(response.getOutputStream()));
		writer.print("var Config = ");
		JSObject.writeObject(writer, config);
		writer.println(";");
		writer.close();
	}
}
