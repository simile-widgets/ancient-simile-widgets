package org.simileWidgets.divisadero;

import java.awt.Point;

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
    
    abstract public boolean hitTest(Point p);
}
