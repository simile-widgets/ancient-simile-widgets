package org.simileWidgets.divisadero.ui;

import javax.swing.table.AbstractTableModel;

import org.simileWidgets.divisadero.Layer;
import org.simileWidgets.divisadero.Project;

public class LayerTableModel extends AbstractTableModel {
    final protected Project _project;
    
    public LayerTableModel(Project project) {
        _project = project;
    }
    
    public int getColumnCount() {
        // visible, name
        return 2;
    }

    public int getRowCount() {
        return _project.getLayers().size();
    }
    
    @Override
    public String getColumnName(int column) {
        switch (column) {
        case 0:
            return "V?";
        case 1:
            return "Name";
        }
        return null;
    }

    public Object getValueAt(int rowIndex, int columnIndex) {
        Layer layer = _project.getLayers().get(rowIndex);
        switch (columnIndex) {
        case 0:
            return new Boolean(layer.isVisible());
        case 1:
            return layer.getName();
        }
        return null;
    }
    
    @Override
    public Class<?> getColumnClass(int columnIndex) {
        switch (columnIndex) {
        case 0:
            return Boolean.class;
        }
        return String.class;
    }

    @Override
    public boolean isCellEditable(int rowIndex, int columnIndex) {
        return columnIndex == 0;
    }
}
