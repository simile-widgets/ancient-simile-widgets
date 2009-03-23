package org.simileWidgets.divisadero;

import java.awt.Graphics2D;

abstract public class Layer {
    protected final Project _project;
    
    protected String    _name;
    protected boolean   _dirty;
    protected boolean   _visible = true;
    
    protected Layer(Project project, String name) {
        _project = project;
        _name = name;
    }

    public Project getProject() {
        return _project;
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
    
    abstract public void paint(Graphics2D g2d);

    public boolean isVisible() {
        return _visible;
    }
    
    public void setVisible(boolean visible) {
        _visible = visible;
    }
}
