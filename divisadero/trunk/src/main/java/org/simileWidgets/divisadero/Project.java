package org.simileWidgets.divisadero;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.simileWidgets.divisadero.bitmap.ImageFileLayer;
import org.simileWidgets.divisadero.bitmap.PdfFileLayer;

public class Project {
    protected File        _dir;
    protected boolean     _dirty = false;
    protected List<Layer> _layers = new ArrayList<Layer>();
    
    public Project(File dir) {
        _dir = dir;
        if (dir != null) {
            if (dir.exists()) {
                loadProject();
            } else {
                dir.mkdirs();
            }
        }
    }
    
    public List<Layer> getLayers() {
        return _layers;
    }

    public void setDirty(boolean dirty) {
        _dirty = dirty;
    }

    public boolean isDirty() {
        return _dirty;
    }

    public File getDir() {
        return _dir;
    }
    
    public void save() {
        Properties properties = new Properties();
    	
        for (int i = 0; i < _layers.size(); i++) {
        	Layer layer = _layers.get(i);
        	
        	String prefix = "layer." + i +".";
        	properties.put(prefix + "key", layer.getKey());
        	properties.put(prefix + "type", layer.getType());
        	properties.put(prefix + "name", layer.getName());
        	layer.save(_dir, properties, prefix);
        }
        
		try {
	        File projectFile = new File(_dir, "divisadero.properties");
	        OutputStream os = new FileOutputStream(projectFile);
	        try {
	        	properties.store(os, "Divisadero project");
	        } finally {
	        	os.close();
	        }
		} catch (Exception e) {
			e.printStackTrace();
		}
    }

    protected void loadProject() {
        File projectFile = new File(_dir, "divisadero.properties");
        if (!projectFile.exists()) {
        	return;
        }
        
        Properties properties = new Properties();
		try {
	        InputStream is = new FileInputStream(projectFile);
	        try {
	        	properties.load(is);
	        } finally {
	        	is.close();
	        }
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		int i = 0;
		while (true) {
			String prefix = "layer." + i + ".";
			
			String key = properties.getProperty(prefix + "key");
			String type = properties.getProperty(prefix + "type");
			if (key == null || key.length() == 0 || type == null || type.length() == 0) {
				break;
			}
			
			String name = properties.getProperty(prefix + "name", "Layer " + i);
			if ("image".equalsIgnoreCase(type)) {
				_layers.add(ImageFileLayer.load(this, properties, prefix, key, name));
			} else if ("pdf".equalsIgnoreCase(type)) {
				_layers.add(PdfFileLayer.load(this, properties, prefix, key, name));
			} else {
				System.err.println("Failed to load layer of type " + type);
				break;
			}
			
			i++;
		}
    }
}
