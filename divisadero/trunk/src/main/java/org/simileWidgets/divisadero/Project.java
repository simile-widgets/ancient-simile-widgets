package org.simileWidgets.divisadero;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

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
    
    protected void loadProject() {
        
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
}
