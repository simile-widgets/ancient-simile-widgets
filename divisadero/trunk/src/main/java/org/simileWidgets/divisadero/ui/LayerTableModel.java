package org.simileWidgets.divisadero.ui;

import javax.swing.table.AbstractTableModel;

import org.simileWidgets.divisadero.Layer;
import org.simileWidgets.divisadero.Project;

public class LayerTableModel extends AbstractTableModel {
	private static final long serialVersionUID = -7680185841852028673L;

	final protected Project _project;
    
    final public static int Column_Visible = 0;
    final public static int Column_Name = 1;
    
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
        case Column_Visible:
            return "V?";
        case Column_Name:
            return "Name";
        }
        return null;
    }

    public Object getValueAt(int rowIndex, int columnIndex) {
        Layer layer = _project.getLayers().get(rowIndex);
        switch (columnIndex) {
        case Column_Visible:
            return new Boolean(layer.isVisible());
        case Column_Name:
            return layer.getName();
        }
        return null;
    }
    
    @Override
    public Class<?> getColumnClass(int columnIndex) {
        switch (columnIndex) {
        case Column_Visible:
            return Boolean.class;
        }
        return String.class;
    }

    @Override
    public boolean isCellEditable(int rowIndex, int columnIndex) {
        return true;//columnIndex == Column_Visible;
    }
    
    @Override
    public void setValueAt(Object value, int rowIndex, int columnIndex) {
    	Layer layer = _project.getLayers().get(rowIndex);
    	switch (columnIndex) {
    	case Column_Visible:
    		layer.setVisible((Boolean) value);
    		break;
    	case Column_Name:
    		layer.setName((String) value);
    		break;
  		default:
   			return;
    	}
    	
    	this.fireTableCellUpdated(rowIndex, columnIndex);
    }
}
