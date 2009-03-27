package org.simileWidgets.divisadero.bitmap;

import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.geom.AffineTransform;
import java.awt.geom.NoninvertibleTransformException;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.io.File;
import java.util.Properties;

import org.simileWidgets.divisadero.Interactor;
import org.simileWidgets.divisadero.Layer;
import org.simileWidgets.divisadero.Project;
import org.simileWidgets.divisadero.Utilities;
import org.simileWidgets.divisadero.ui.Canvas;

abstract public class BitmapLayer extends Layer {
	static protected class Transform {
	    Point2D       offset = new Point2D.Double(); // offset of _pivot relative to canvas's coordinate system
		Point2D       pivot = new Point2D.Double();	// relative to (0,0) of bitmap
	    double        rotation = 0;
	    double        scaleX = 1.0;
	    double        scaleY = 1.0;
	    
	    Point2D[]	    anchors = new Point2D[2];		// relative to _pivot
	    
	    double			opacity = 0.7;
	    Rectangle2D   	crop = null;
	    
	    AffineTransform forward;
	    AffineTransform backward;
	    
	    void cacheTransforms() {
	    	forward = new AffineTransform();
	    	forward.translate(offset.getX(), offset.getY());
	    	forward.rotate(rotation);
	    	forward.scale(scaleX, scaleY);
	    	
	    	try {
				backward = forward.createInverse();
			} catch (NoninvertibleTransformException e) {
				e.printStackTrace();
			}
	    }
	    
	    Transform dup() {
	    	Transform t = new Transform();
	    	
	    	t.offset = new Point2D.Double(this.offset.getX(), this.offset.getY());
	    	t.pivot = new Point2D.Double(this.pivot.getX(), this.pivot.getY());
	    	t.rotation = this.rotation;
	    	t.scaleX = this.scaleX;
	    	t.scaleY = this.scaleY;
	    	
	    	t.anchors[0] = new Point2D.Double(this.anchors[0].getX(), this.anchors[0].getY());
	    	t.anchors[1] = new Point2D.Double(this.anchors[1].getX(), this.anchors[1].getY());
	    	
	    	t.opacity = this.opacity;
	    	t.crop = this.crop == null ? null : new Rectangle2D.Double(this.crop.getX(), this.crop.getY(), this.crop.getWidth(), this.crop.getHeight());
	    	
	    	t.cacheTransforms();
	    	return t;
	    }
	}
	
	protected Transform _transform = new Transform();
    
    protected BitmapLayer(Project project, String name, String key) {
        super(project, name, key);
        _transform.anchors[0] = new Point2D.Double(100, 0);
        _transform.anchors[1] = new Point2D.Double(0, 100);
    }
    
	protected void load(Project project, Properties properties, String prefix) {
		_transform.pivot = Utilities.getPoint2D(properties, prefix + "pivot", _transform.pivot);
		_transform.anchors[0] = Utilities.getPoint2D(properties, prefix + "anchor.0", _transform.anchors[0]);
		_transform.anchors[1] = Utilities.getPoint2D(properties, prefix + "anchor.1", _transform.anchors[1]);
		
		_transform.offset = Utilities.getPoint2D(properties, prefix + "offset", _transform.offset);
		_transform.rotation = Utilities.getDouble(properties, prefix + "rotation", _transform.rotation);
		_transform.scaleX = Utilities.getDouble(properties, prefix + "scaleX", _transform.scaleX);
		_transform.scaleY = Utilities.getDouble(properties, prefix + "scaleY", _transform.scaleY);
		
		_transform.opacity = Utilities.getDouble(properties, prefix + "opacity", _transform.opacity);
		_transform.crop = Utilities.getRectangle2D(properties, prefix + "crop", null);
		
		_transform.cacheTransforms();
	}
	
	@Override
	public void save(File projectDir, Properties properties, String prefix) {
		Utilities.setPoint2D(properties, prefix + "pivot", _transform.pivot);
		Utilities.setPoint2D(properties, prefix + "anchor.0", _transform.anchors[0]);
		Utilities.setPoint2D(properties, prefix + "anchor.1", _transform.anchors[1]);
		
		Utilities.setPoint2D(properties, prefix + "offset", _transform.offset);
		Utilities.setDouble(properties, prefix + "rotation", _transform.rotation);
		Utilities.setDouble(properties, prefix + "scaleX", _transform.scaleX);
		Utilities.setDouble(properties, prefix + "scaleY", _transform.scaleY);
		
		Utilities.setDouble(properties, prefix + "opacity", _transform.opacity);
		Utilities.setRectangle2D(properties, prefix + "crop", _transform.crop);
	}
	
    abstract protected Rectangle2D getBoundary();

    @Override
    public void paint(Graphics2D g2d) {
    	if (_visible) {
	        g2d.transform(_transform.forward);
	        g2d.translate(-_transform.pivot.getX(), -_transform.pivot.getY());
	        if (_transform.crop != null) {
	            g2d.clip(_transform.crop);
	        }
	        g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, (float) _transform.opacity));
	        
	        internalPaint(g2d);
    	}
    }
    
    abstract protected void internalPaint(Graphics2D g2d);
    
    @Override
    public Interactor getInteractor(Point2D mousePoint) {
    	return (mousePoint == null || internalHitTest(mousePoint)) ? new PivotAnchorInteractor() : null;
    }
    
    protected boolean internalHitTest(Point2D mousePoint) {
		Point2D p = _transform.backward.transform(mousePoint, null);
		
		p.setLocation(p.getX() - _transform.pivot.getX(), p.getY() - _transform.pivot.getY());
		
		Rectangle2D r = (_transform.crop != null) ? _transform.crop : getBoundary();
		if (!r.contains(p)) {
			return false;
		}
		return true;
    }
    
    final static protected int MODE_READY = 0;
    final static protected int MODE_MOVING_LAYER = 1;
    final static protected int MODE_MOVING_PIVOT = 2;
    final static protected int MODE_MOVING_ANCHOR_0 = 3;
    final static protected int MODE_MOVING_ANCHOR_1 = 4;
    final static protected int MODE_STRETCHING_ANCHOR_0 = 5;
    final static protected int MODE_STRETCHING_ANCHOR_1 = 6;
    
    protected class PivotAnchorInteractor extends Interactor implements MouseListener, MouseMotionListener {
    	Canvas 		_canvas;
    	int 		_mode = MODE_READY;
    	Transform	_oldTransform;
    	
		@Override
		public boolean hitTest(MouseEvent event, AffineTransform canvasToScreen) {
			if (_paused) { return false; }
			
			Point2D pivotOnScreen = canvasToScreen.transform(
					_transform.forward.transform(new Point2D.Double(), null), null);
			Point2D anchor0OnScreen = canvasToScreen.transform(
					_transform.forward.transform(_transform.anchors[0], null), null);
			Point2D anchor1OnScreen = canvasToScreen.transform(
					_transform.forward.transform(_transform.anchors[1], null), null);
			
			Point2D p = event.getPoint();
			 
			return _mode != MODE_READY || (
				within(p, PIVOT_RADIUS, pivotOnScreen) ||
				within(p, ANCHOR_RADIUS, anchor0OnScreen) ||
				within(p, ANCHOR_RADIUS, anchor1OnScreen));
		}
		
		protected boolean within(Point2D center, double radius, Point2D test) {
			return Math.abs(test.getX() - center.getX()) <= radius &&
				Math.abs(test.getY() - center.getY()) <= radius;
		}

		@Override
		public void install(Canvas canvas) {
			_canvas = canvas;
			_canvas.addMouseListener(this);
			_canvas.addMouseMotionListener(this);
		}

		@Override
		public void uninstall() {
			_canvas.removeMouseListener(this);
			_canvas.removeMouseMotionListener(this);
			_canvas = null;
		}
		
		final static int PIVOT_RADIUS = 10;
		final static int ANCHOR_RADIUS = 6;

		@Override
		public void paint(Graphics2D g2d, AffineTransform canvasToScreen) {
			Point2D pivotOnScreen = canvasToScreen.transform(
					_transform.forward.transform(new Point2D.Double(), null), null);
			Point2D anchor0OnScreen = canvasToScreen.transform(
					_transform.forward.transform(_transform.anchors[0], null), null);
			Point2D anchor1OnScreen = canvasToScreen.transform(
					_transform.forward.transform(_transform.anchors[1], null), null);
			
			g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
			g2d.setPaint(new Color(255, 128, 128));
			g2d.setStroke(new BasicStroke(2));
			g2d.drawLine(
				(int) pivotOnScreen.getX(), 
				(int) pivotOnScreen.getY(),
				(int) anchor0OnScreen.getX(),
				(int) anchor0OnScreen.getY()
			);
			g2d.drawLine(
				(int) pivotOnScreen.getX(), 
				(int) pivotOnScreen.getY(),
				(int) anchor1OnScreen.getX(),
				(int) anchor1OnScreen.getY()
			);
			
			g2d.fillOval(
				(int) pivotOnScreen.getX() - PIVOT_RADIUS, 
				(int) pivotOnScreen.getY() - PIVOT_RADIUS,
				(int) 1 + 2 * PIVOT_RADIUS, 
				(int) 1 + 2 * PIVOT_RADIUS
			);
			
			g2d.fillOval(
				(int) anchor0OnScreen.getX() - ANCHOR_RADIUS, 
				(int) anchor0OnScreen.getY() - ANCHOR_RADIUS,
				1 + 2 * ANCHOR_RADIUS, 
				1 + 2 * ANCHOR_RADIUS
			);
			
			g2d.fillOval(
				(int) anchor1OnScreen.getX() - ANCHOR_RADIUS, 
				(int) anchor1OnScreen.getY() - ANCHOR_RADIUS,
				1 + 2 * ANCHOR_RADIUS, 
				1 + 2 * ANCHOR_RADIUS
			);
		}

		@Override
		public void mouseClicked(MouseEvent e) {
			if (_paused) { return; }
		}

		@Override
		public void mouseEntered(MouseEvent e) {
			if (_paused) { return; }
		}

		@Override
		public void mouseExited(MouseEvent e) {
			if (_paused) { return; }
		}

		@Override
		public void mousePressed(MouseEvent e) {
			if (_paused) { return; }
			
			AffineTransform canvasToScreen = _canvas.getTransform();
			
			Point2D pivotOnScreen = canvasToScreen.transform(
					_transform.forward.transform(new Point2D.Double(), null), null);
			Point2D anchor0OnScreen = canvasToScreen.transform(
					_transform.forward.transform(_transform.anchors[0], null), null);
			Point2D anchor1OnScreen = canvasToScreen.transform(
					_transform.forward.transform(_transform.anchors[1], null), null);
			
			Point2D p = e.getPoint();
			boolean ctrlMeta = (e.getModifiers() & (MouseEvent.CTRL_MASK | MouseEvent.META_MASK)) != 0;
			
			if (within(p, PIVOT_RADIUS, pivotOnScreen)) {
				if (ctrlMeta) {
					_oldTransform = _transform.dup();
					_mode = MODE_MOVING_PIVOT;
				}
			} else if (within(p, ANCHOR_RADIUS, anchor0OnScreen)) {
				_oldTransform = _transform.dup();
				if (ctrlMeta) {
					_mode = MODE_MOVING_ANCHOR_0;
				} else {
					_mode = MODE_STRETCHING_ANCHOR_0;
				}
			} else if (within(p, ANCHOR_RADIUS, anchor1OnScreen)) {
				_oldTransform = _transform.dup();
				if (ctrlMeta) {
					_mode = MODE_MOVING_ANCHOR_1;
				} else {
					_mode = MODE_STRETCHING_ANCHOR_1;
				}
			}
		}

		@Override
		public void mouseReleased(MouseEvent e) {
			if (_paused) { return; }
			
			if (_mode != MODE_READY) {
				_oldTransform = null;
				_mode = MODE_READY;
			}
		}

		@Override
		public void mouseDragged(MouseEvent e) {
			if (_paused) { return; }
			
			AffineTransform screenToCanvas = _canvas.getInverseTransform();
			Point2D canvasPoint = screenToCanvas.transform(e.getPoint(), null);
			Point2D ourPoint = _transform.backward.transform(canvasPoint, null);
			
			switch (_mode) {
			case MODE_MOVING_PIVOT:
				_transform.pivot.setLocation(
					_transform.pivot.getX() + ourPoint.getX(),
					_transform.pivot.getY() + ourPoint.getY());
				_transform.offset = canvasPoint;
				_transform.cacheTransforms();
				break;
				
			case MODE_MOVING_ANCHOR_0:
				_transform.anchors[0] = ourPoint;
				break;
				
			case MODE_MOVING_ANCHOR_1:
				_transform.anchors[1] = ourPoint;
				break;
				
			}
			_canvas.repaint();
		}

		@Override
		public void mouseMoved(MouseEvent e) {
			if (_paused) { return; }
		}
    }
}
