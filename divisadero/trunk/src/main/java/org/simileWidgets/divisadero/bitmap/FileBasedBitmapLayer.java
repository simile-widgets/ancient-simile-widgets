package org.simileWidgets.divisadero.bitmap;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Properties;

import org.simileWidgets.divisadero.Interactor;
import org.simileWidgets.divisadero.Project;

abstract public class FileBasedBitmapLayer extends BitmapLayer {
    protected File 			_file;
    protected boolean		_ready;
    protected BufferedImage _image;
    protected Thread		_readyThread;

	protected FileBasedBitmapLayer(Project project, String name, String key, File file) {
		super(project, name, key);
		_file = file;
	}
	
	@Override
	public boolean isReady() {
		return _ready;
	}
	
	public void getReady() {
		if (!_ready && _readyThread == null) {
			_readyThread = new Thread() {
				@Override
				public void run() {
					try {
						loadFile();
					} finally {
						_ready = true;
						_readyThread = null;
						
				        if (_image != null) {
				        	if (_transform.anchors[0] == null) {
				        		_transform.anchors[0] = new Point2D.Double(_image.getWidth(), 0);
				        	}
				        	if (_transform.anchors[1] == null) {
				        		_transform.anchors[1] = new Point2D.Double(0, _image.getHeight());
				        	}
				        	_transform.cacheTransforms();
				        }
				        
						fireLayerReadyEvent();
					}
				}
			};
			_readyThread.start();
		}
	}
	
	@Override
	public Interactor getInteractor(Point2D mousePoint) {
		return _ready ? super.getInteractor(mousePoint) : null;
	}

    @Override
    protected Rectangle2D getBoundary() {
    	if (_image != null) {
    		return new Rectangle2D.Double(
    			-_transform.pivot.getX(), 
    			-_transform.pivot.getY(),
    			_image.getWidth(),
    			_image.getHeight()
    		);
    	} else {
    		return new Rectangle2D.Double();
    	}
    }
    
	@Override
	public void save(File projectDir, Properties properties, String prefix) {
		super.save(projectDir, properties, prefix);
		
		if (_file != null) {
			String filePath = getPath(_file);
			String dirPath = getPath(_project.getDir());
			if (!dirPath.endsWith(File.separator)) {
				dirPath = dirPath + File.separator;
			}
			
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

    @Override
    protected void internalPaint(Graphics2D g2d) {
        if (_image != null) {
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g2d.drawImage(_image, null, 0, 0);
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
