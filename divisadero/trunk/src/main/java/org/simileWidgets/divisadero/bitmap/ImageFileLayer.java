package org.simileWidgets.divisadero.bitmap;

import java.awt.Graphics2D;
import java.io.File;

import org.simileWidgets.divisadero.Project;

public class ImageFileLayer extends BitmapLayer {
    protected File _file;
    
    public ImageFileLayer(Project project, String name, File file) {
        super(project, name);
        _file = file;
    }

    @Override
    public void paint(Graphics2D g2d) {
        // TODO Auto-generated method stub

    }

}
