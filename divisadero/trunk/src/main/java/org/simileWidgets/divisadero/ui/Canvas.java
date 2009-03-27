package org.simileWidgets.divisadero.ui;

import java.awt.Color;
import java.awt.Cursor;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseMotionAdapter;
import java.awt.event.MouseWheelEvent;
import java.awt.event.MouseWheelListener;
import java.awt.geom.AffineTransform;
import java.awt.geom.NoninvertibleTransformException;
import java.awt.geom.Point2D;
import java.util.List;

import javax.swing.JComponent;
import javax.swing.ListSelectionModel;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;
import javax.swing.event.TableModelEvent;
import javax.swing.event.TableModelListener;

import org.simileWidgets.divisadero.Interactor;
import org.simileWidgets.divisadero.Layer;
import org.simileWidgets.divisadero.Project;

public class Canvas extends JComponent implements ListSelectionListener, TableModelListener {
    private static final long serialVersionUID = -5971324417823955056L;
    
    protected Project 				_project;
    protected ListSelectionModel	_layerListSelection;
    protected LayerTableModel		_layerTableModel;

    protected Layer		 _currentLayer;
    protected Interactor _interactor;
    
    protected Point2D _offset = new Point2D.Double();
    protected double  _scale = 1;
    
    protected Point   _lastMousePoint;
    protected Point2D _grabPoint;
    
    public Canvas() {
        this.setDoubleBuffered(true);
        
        this.addMouseMotionListener(new MouseMotionAdapter() {
            @Override
            public void mouseMoved(MouseEvent e) {
                if (_interactor == null || !_interactor.hitTest(e, getTransform())) {
                    _handleMouseMoved(e);
                }
            }
            @Override
            public void mouseDragged(MouseEvent e) {
                if (_interactor == null || !_interactor.hitTest(e, getTransform())) {
                    _handleMouseDragged(e);
                }
            }
            
        });
        
        this.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseExited(MouseEvent e) {
                _lastMousePoint = null;
                if (_interactor != null) {
                    _interactor.resume();
                }
            }
            @Override
            public void mousePressed(MouseEvent e) {
                if (_interactor == null || !_interactor.hitTest(e, getTransform())) {
                    _handleMousePressed(e);
                }
            }
            @Override
            public void mouseReleased(MouseEvent e) {
                if (_interactor == null || !_interactor.hitTest(e, getTransform())) {
                    _handleMouseReleased(e);
                }
            }
        });
        
        this.addMouseWheelListener(new MouseWheelListener() {
			@Override
			public void mouseWheelMoved(MouseWheelEvent e) {
                //if (_interactor == null || !_interactor.hitTest(e, getTransform())) {
                    _handleMouseWheelMoved(e);
                //}
			}
		});
    }
    
    public void setProject(Project project, ListSelectionModel layerListSelection, LayerTableModel layerTableModel) {
    	if (_layerListSelection != null) {
    		_layerListSelection.removeListSelectionListener(this);
    	}
    	if (_layerTableModel != null) {
    		_layerTableModel.removeTableModelListener(this);
    	}
    	if (_interactor != null) {
    		_interactor.uninstall();
    	}
    	
        _project = project;
        _layerListSelection = layerListSelection;
        _layerListSelection.addListSelectionListener(this);
        _layerTableModel = layerTableModel;
        _layerTableModel.addTableModelListener(this);
        
        _offset = new Point2D.Double();
        _scale = 1;
        _currentLayer = null;
        _interactor = null;
        
        repaint();
    }

    public Project getProject() {
        return _project;
    }
    
    public void setOffset(Point2D offset) {
        this._offset = offset;
    }

    public Point2D getOffset() {
        return _offset;
    }

    public void setScale(double scale) {
        this._scale = scale;
    }

    public double getScale() {
        return _scale;
    }
    
    public AffineTransform getTransform() {
        AffineTransform t = AffineTransform.getTranslateInstance(getOffset().getX(), getOffset().getY());
        t.scale(getScale(), getScale());
        return t;
    }
    
    public AffineTransform getInverseTransform() {
        try {
			return getTransform().createInverse();
		} catch (NoninvertibleTransformException e) {
			return null;
		}
    }
    
    public Point getLastMousePoint() {
        return _lastMousePoint;
    }
    
    public void zoomBy(int levelChange, Point center) {
        try {
            AffineTransform t = getTransform();
            AffineTransform tr = t.createInverse();
            
            Point2D localCenter = tr.transform(center, null);
            
            _scale *= Math.pow(2, levelChange);
            _offset = new Point2D.Double(
                center.x - localCenter.getX() * _scale,
                center.y - localCenter.getY() * _scale
            );
            
            repaint();
        } catch (NoninvertibleTransformException e) {
            e.printStackTrace();
        }
    }

    final static int GRID_SIZE = 100;

    @Override
    public void paint(Graphics g) {
        super.paint(g);
        
        g.setColor(Color.white);
        g.fillRect(0, 0, getWidth(), getHeight());
        
    	AffineTransform t = getTransform();
    	
        if (_project != null) {
	    	Graphics2D g2d = (Graphics2D) g.create();
	    	try {
                g2d.transform(t);
            	paintLayers(g2d);
	        } finally {
	            g2d.dispose();
	        }
	        
        	if (_interactor != null) {
    	    	g2d = (Graphics2D) g.create();
    	    	try {
            		_interactor.paint(g2d, t);
    	        } finally {
    	            g2d.dispose();
    	        }
        	}
    	}
    
    	try {
			AffineTransform t2 = t.createInverse();
			
	    	int width = getWidth();
	    	int height = getHeight();
	    	
			Point2D topLeft = t2.transform(new Point2D.Double(0,0), null);
			Point2D bottomRight = t2.transform(new Point2D.Double(width, height), null);
			
			double xMin = Math.round(topLeft.getX() / GRID_SIZE) * GRID_SIZE;
			double yMin = Math.round(topLeft.getY() / GRID_SIZE) * GRID_SIZE;
			double xMax = Math.round(bottomRight.getX() / GRID_SIZE) * GRID_SIZE;
			double yMax = Math.round(bottomRight.getY() / GRID_SIZE) * GRID_SIZE;
			
			Color c = new Color(192, 192, 224, 64);
			
			for (double x = xMin; x <= xMax; x += GRID_SIZE) {
				int pixelX = (int) t.transform(new Point2D.Double(x, 0), null).getX();
				g.setColor(c);
				g.drawLine(pixelX, 0, pixelX, height);
			}
			
			for (double y = yMin; y <= yMax; y += GRID_SIZE) {
				int pixelY = (int) t.transform(new Point2D.Double(0, y), null).getY();
				g.setColor(c);
				g.drawLine(0, pixelY, width, pixelY);
			}
		} catch (NoninvertibleTransformException e) {
		}
    }
    
    protected void paintLayers(Graphics2D g2d) {

        List<Layer> layers = _project.getLayers();
        for (int i = layers.size() - 1; i >= 0; i--) {
            Layer layer = layers.get(i);
            Graphics2D g2d2 = (Graphics2D) g2d.create();
            try {
                layer.paint(g2d2);
            } finally {
                g2d2.dispose();
            }
        }
    }

    protected void _handleMouseMoved(MouseEvent e) {
        this.setCursor(Cursor.getPredefinedCursor(Cursor.MOVE_CURSOR));
        _lastMousePoint = new Point(e.getX(), e.getY());
    }
    
    protected void _handleMouseDragged(MouseEvent e) {
        if (_lastMousePoint != null) {
            _offset = new Point2D.Double(
                e.getX() - _grabPoint.getX() * _scale,
                e.getY() - _grabPoint.getY() * _scale
            );
            paintImmediately(this.getBounds());
        }
        _lastMousePoint = new Point(e.getX(), e.getY());
    }

    protected void _handleMousePressed(MouseEvent e) {
        if (_interactor != null) {
            _interactor.pause();
        }
        _lastMousePoint = new Point(e.getX(), e.getY());
        _grabPoint = new Point2D.Double(
            (e.getX() - _offset.getX()) / _scale,
            (e.getY() - _offset.getY()) / _scale
        );
    }
    
    protected void _handleMouseReleased(MouseEvent e) {
        if (_interactor != null) {
            _interactor.resume();
        }
    }
    
    protected void _handleMouseWheelMoved(MouseWheelEvent e) {
    	zoomBy(-e.getWheelRotation(), e.getPoint());
    }

	@Override
	public void valueChanged(ListSelectionEvent e) {
		if (_interactor != null) {
			_interactor.uninstall();
			_interactor = null;
		}
		_currentLayer = null;
		
		if (!_layerListSelection.isSelectionEmpty()) {
			if (_layerListSelection.getAnchorSelectionIndex() == _layerListSelection.getLeadSelectionIndex()) {
				int index = _layerListSelection.getAnchorSelectionIndex();
				
				_currentLayer = _project.getLayers().get(index);
				if (_currentLayer.isVisible()) {
					_interactor = _currentLayer.getInteractor(null);
					if (_interactor != null) {
						_interactor.install(this);
					}
				}
			}
		}
		
		repaint();
	}

	@Override
	public void tableChanged(TableModelEvent e) {
		if (_currentLayer != null) {
			if (_interactor != null) {
				_interactor.uninstall();
				_interactor = null;
			}
			
			if (_currentLayer.isVisible()) {
				_interactor = _currentLayer.getInteractor(null);
				if (_interactor != null) {
					_interactor.install(this);
				}
			}
		}
	}
}
