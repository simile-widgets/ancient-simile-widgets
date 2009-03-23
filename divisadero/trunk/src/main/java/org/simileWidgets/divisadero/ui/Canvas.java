package org.simileWidgets.divisadero.ui;

import java.awt.Color;
import java.awt.Cursor;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseMotionAdapter;
import java.awt.geom.AffineTransform;
import java.awt.geom.NoninvertibleTransformException;
import java.awt.geom.Point2D;
import java.util.List;

import javax.swing.JComponent;

import org.simileWidgets.divisadero.Interactor;
import org.simileWidgets.divisadero.Layer;
import org.simileWidgets.divisadero.Project;

public class Canvas extends JComponent {
    private static final long serialVersionUID = -5971324417823955056L;
    
    protected Project _project;
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
                if (_interactor == null || !_interactor.hitTest(e.getPoint())) {
                    _handleMouseMoved(e);
                }
            }
            @Override
            public void mouseDragged(MouseEvent e) {
                if (_interactor == null || !_interactor.hitTest(e.getPoint())) {
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
                if (_interactor == null || !_interactor.hitTest(e.getPoint())) {
                    _handleMousePressed(e);
                }
            }
            @Override
            public void mouseReleased(MouseEvent e) {
                if (_interactor == null || !_interactor.hitTest(e.getPoint())) {
                    _handleMouseReleased(e);
                }
            }
        });
    }
    
    public void setProject(Project project) {
        _project = project;
        
        _offset = new Point2D.Double();
        _scale = 1;
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


    @Override
    public void paint(Graphics g) {
        super.paint(g);
        
        g.setColor(Color.white);
        g.fillRect(0, 0, getWidth(), getHeight());
        
        if (_project != null) {
            Graphics2D g2d = (Graphics2D) g.create();
            try {
                paintLayers(g2d);
            } finally {
                g2d.dispose();
            }
        }
    }
    
    protected void paintLayers(Graphics2D g2d) {
        g2d.transform(getTransform());

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
}
