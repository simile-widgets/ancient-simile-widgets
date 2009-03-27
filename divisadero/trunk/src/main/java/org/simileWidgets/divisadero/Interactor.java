package org.simileWidgets.divisadero;

import java.awt.Graphics2D;
import java.awt.event.MouseEvent;
import java.awt.geom.AffineTransform;

import org.simileWidgets.divisadero.ui.Canvas;

abstract public class Interactor {
    protected boolean _paused;
    
    public void pause() {
        _paused = true;
    }
    
    public void resume() {
        _paused = false;
    }
    
    abstract public void install(Canvas canvas);
    
    abstract public void uninstall();
    
    abstract public boolean hitTest(MouseEvent event, AffineTransform canvasToScreen);
    
    abstract public void paint(Graphics2D g2d, AffineTransform canvasToScreen);
}
