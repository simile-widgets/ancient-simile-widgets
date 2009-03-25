package org.simileWidgets.divisadero;

import java.awt.Graphics2D;
import java.io.File;
import java.util.Properties;

abstract public class Layer {
    protected final Project _project;
    protected final String  _key;
    
    protected String    _name;
    protected boolean   _dirty;
    protected boolean   _visible = true;
    
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
    
    public void setDirty(boolean dirty) {
        _dirty = dirty;
        if (dirty) {
            _project.setDirty(true);
        }
    }

    public boolean isDirty() {
        return _dirty;
    }

    public boolean isVisible() {
        return _visible;
    }
    
    public void setVisible(boolean visible) {
        _visible = visible;
    }
    
    abstract public String getType();
    abstract public void paint(Graphics2D g2d);
    abstract public void save(File projectDir, Properties properties, String prefix);
}
