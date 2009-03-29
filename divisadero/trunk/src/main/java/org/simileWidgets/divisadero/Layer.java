package org.simileWidgets.divisadero;

import java.awt.Graphics2D;
import java.awt.geom.Point2D;
import java.io.File;
import java.util.HashSet;
import java.util.Set;
import java.util.Properties;

abstract public class Layer {
    protected final Project _project;
    protected final String  _key;
    
    protected String    			_name;
    protected boolean   			_dirty;
    protected boolean   			_visible = true;
    protected Set<LayerListener> 	_listeners = new HashSet<LayerListener>();
    
    protected Layer(Project project, String name, String key) {
        _project = project;
        _name = name;
        _key = key != null ? key : ("l" + Math.round(Math.random() * 1000000));
    }

    public Project getProject() {
        return _project;
    }
    
    public String getKey() {
    	return _key;
    }
    
    public String getName() {
        return _name;
    }

    public void setName(String name) {
        _name = name;
    }
    
    public boolean isDirty() {
        return _dirty;
    }

    public void setDirty(boolean dirty) {
        _dirty = dirty;
        if (dirty) {
            _project.setDirty(true);
        }
    }

    public boolean isVisible() {
        return _visible;
    }
    
    public void setVisible(boolean visible) {
        _visible = visible;
    }
    
    abstract public String getType();
    
    public boolean isReady() {
    	return true;
    }
    
    public void getReady() {
    }
    
    public void addListener(LayerListener listener) {
    	_listeners.add(listener);
    }

    public void removeListener(LayerListener listener) {
    	_listeners.remove(listener);
    }

    abstract public void paint(Graphics2D g2d);
    
	protected void load(Project project, Properties properties, String prefix) {
		_visible = Utilities.getBoolean(properties, prefix + "visible", _visible);
	}
	
    public void save(File projectDir, Properties properties, String prefix) {
		Utilities.setBoolean(properties, prefix + "visible", _visible);
    }
    
    /**
     * @param mousePoint In the coordinate system of the canvas, not of the layer.
     * @return
     */
    abstract public Interactor getInteractor(Point2D mousePoint);
    
    protected void fireLayerReadyEvent() {
    	for (LayerListener listener : new HashSet<LayerListener>(_listeners)) {
    		try {
    			listener.layerReady(this);
    		} catch (Exception e) {
    			e.printStackTrace();
    		}
    	}
    }
}
