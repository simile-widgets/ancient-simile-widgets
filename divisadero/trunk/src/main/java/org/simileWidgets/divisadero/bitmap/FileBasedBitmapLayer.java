package org.simileWidgets.divisadero.bitmap;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Properties;

import org.simileWidgets.divisadero.Project;

abstract public class FileBasedBitmapLayer extends BitmapLayer {
    
    protected File _file;
    protected BufferedImage _image;

	protected FileBasedBitmapLayer(Project project, String name, String key) {
		super(project, name, key);
		// TODO Auto-generated constructor stub
	}

	@Override
	public void save(File projectDir, Properties properties, String prefix) {
		if (_file != null) {
			String filePath = getPath(_file);
			String dirPath = getPath(_project.getDir());
			
			properties.put(prefix + "absoluteFile", filePath);
			if (filePath.indexOf(dirPath) == 0) {
				properties.put(prefix + "relativeFile", filePath.substring(dirPath.length()));
			}
		}
	}

	@Override
	protected void load(Project project, Properties properties, String prefix) {
		super.load(project, properties, prefix);
		
		String relativeFilePath = properties.getProperty(prefix + "relativeFile");
		if (relativeFilePath != null && relativeFilePath.length() > 0) {
			File file = new File(project.getDir(), relativeFilePath);
			if (file.exists()) {
				_file = file;
				return;
			}
		}
		
		String absoluteFilePath = properties.getProperty(prefix + "absoluteFile");
		if (absoluteFilePath != null && absoluteFilePath.length() > 0) {
			File file = new File(absoluteFilePath);
			if (file.exists()) {
				_file = file;
				return;
			}
		}
	}
	
	static protected String getPath(File file) {
		try {
			return file.getCanonicalPath();
		} catch (IOException e) {
			return file.getAbsolutePath();
		}
	}
	
    abstract protected void loadFile();
}
