package org.simileWidgets.divisadero.ui;

import java.awt.Point;
import java.io.File;

import javax.swing.JFileChooser;
import javax.swing.event.TableModelEvent;
import javax.swing.event.TableModelListener;
import javax.swing.filechooser.FileFilter;
import javax.swing.table.TableColumn;

import org.simileWidgets.divisadero.Layer;
import org.simileWidgets.divisadero.Project;
import org.simileWidgets.divisadero.bitmap.ImageFileLayer;
import org.simileWidgets.divisadero.bitmap.PdfFileLayer;

public class Frame extends FrameBase {
    private static final long serialVersionUID = -4307794028515768946L;
    
    protected Project           _project;
    protected LayerTableModel   _layerTableModel;
    
    public Frame() {
        super();
        
        _project = new Project(new File("./examples/united-states/"));
        
        _canvas.setProject(_project);
        _rewireLayerTable();
    }
    
    protected void _rewireLayerTable() {
        _layerTableModel = new LayerTableModel(_project);
        _layerTableModel.addTableModelListener(new TableModelListener() {
			@Override
			public void tableChanged(TableModelEvent e) {
				if (e.getType() != TableModelEvent.UPDATE || e.getColumn() != LayerTableModel.Column_Name) {
					_canvas.repaint();
				}
			}
		});
        
        _layerTable.setModel(_layerTableModel);
        _layerTable.setColumnSelectionAllowed(false);
        
        TableColumn visibleColumn = _layerTable.getColumnModel().getColumn(0);
        visibleColumn.setResizable(false);
        visibleColumn.setMaxWidth(32);
        visibleColumn.setMinWidth(32);
        visibleColumn.setWidth(32);
    }

    @Override
    void doNewProject() {
        // TODO Auto-generated method stub
        
    }
    
    @Override
    void doSaveProject() {
    	_project.save();
    }

    @Override
    void doOpenProject() {
        // TODO Auto-generated method stub
        
    }

    @Override
    void doQuit() {
        // TODO Auto-generated method stub
        
    }
    
    @Override
    void doZoomIn() {
        Point center = _canvas.getLastMousePoint();
        if (center == null) {
            center = new Point(_canvas.getWidth() / 2, _canvas.getHeight() / 2);
        }
        _canvas.zoomBy(1, center);
    }
    
    @Override
    void doZoomOut() {
        Point center = _canvas.getLastMousePoint();
        if (center == null) {
            center = new Point(_canvas.getWidth() / 2, _canvas.getHeight() / 2);
        }
        _canvas.zoomBy(-1, center);
    }

    @Override
    void doDeleteSelectedLayers() {
        // TODO Auto-generated method stub
        
    }

    @Override
    void doExport() {
        // TODO Auto-generated method stub
        
    }

    @Override
    void doNewAreaLayer() {
        // TODO Auto-generated method stub
        
    }

    @Override
    void doNewBitmapLayer() {
        JFileChooser fc = new JFileChooser(new File("."));
        fc.setFileSelectionMode(JFileChooser.FILES_ONLY);
        fc.addChoosableFileFilter(new ImageFilter());
        fc.addChoosableFileFilter(new PdfFilter());
        fc.setAcceptAllFileFilterUsed(false);
        
        int r = fc.showOpenDialog(this);
        if (r == JFileChooser.APPROVE_OPTION) {
            File file = fc.getSelectedFile();
            Layer layer;
            
            if (".pdf".equalsIgnoreCase(getExtension(file))) {
                layer = new PdfFileLayer(_project, file.getName(), file);
            } else {
                layer = new ImageFileLayer(_project, file.getName(), file);
            }
            _project.getLayers().add(0, layer);
            
            _layerTable.tableChanged(new TableModelEvent(_layerTableModel, 0));
            _layerTable.getSelectionModel().setSelectionInterval(0, 0);
            _layerTable.getParent().doLayout();
            
            _canvas.repaint();
        }
    }

    @Override
    void doNewLineLayer() {
        // TODO Auto-generated method stub
        
    }

    @Override
    void doHideSelectedLayers(boolean exclusive) {
        // TODO Auto-generated method stub
        
    }

    @Override
    void doShowSelectedLayers(boolean exclusive) {
        // TODO Auto-generated method stub
        
    }

    @Override
    void doToggleSelectedLayers() {
        // TODO Auto-generated method stub
        
    }

    static class ImageFilter extends FileFilter {
        @Override
        public String getDescription() {
            return "Images";
        }
    
        @Override
        public boolean accept(File f) {
            if (f.isDirectory()) {
                return true;
            }

            String extension = getExtension(f);
            if (".tiff".equalsIgnoreCase(extension) ||
                ".tif".equalsIgnoreCase(extension) ||
                ".gif".equalsIgnoreCase(extension) ||
                ".jpeg".equalsIgnoreCase(extension) ||
                ".jpg".equalsIgnoreCase(extension) ||
                ".png".equalsIgnoreCase(extension)) {
                return true;
            }
            return false;
        }
    }
    
    static class PdfFilter extends FileFilter {
        @Override
        public String getDescription() {
            return "PDF (*.pdf)";
        }
    
        @Override
        public boolean accept(File f) {
            if (f.isDirectory()) {
                return true;
            }

            String extension = getExtension(f);
            if (".pdf".equalsIgnoreCase(extension)) {
                return true;
            }
            return false;
        }
    }
    
    static String getExtension(File file) {
        String name = file.getName();
        int dot = name.lastIndexOf('.');
        if (dot > 0) {
            return name.substring(dot);
        }
        return "";
    }
}
