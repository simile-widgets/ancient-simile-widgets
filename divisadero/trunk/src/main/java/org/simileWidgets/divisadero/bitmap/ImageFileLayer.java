package org.simileWidgets.divisadero.bitmap;

import java.awt.Graphics2D;
import java.io.File;
import java.util.Properties;

import org.simileWidgets.divisadero.Project;

public class ImageFileLayer extends FileBasedBitmapLayer {
    protected File _file;
    
    public ImageFileLayer(Project project, String name, File file) {
        super(project, name, null);
        _file = file;
    }

    @Override
    public String getType() {
    	return "image";
    }
    
    @Override
    protected void internalPaint(Graphics2D g2d) {
        // TODO Auto-generated method stub

    }
    
    static public ImageFileLayer load(Project project, Properties properties, String prefix, String key, String name) {
    	return null;
    }

	@Override
	protected void loadFile() {
		// TODO Auto-generated method stub
		
	}
}
