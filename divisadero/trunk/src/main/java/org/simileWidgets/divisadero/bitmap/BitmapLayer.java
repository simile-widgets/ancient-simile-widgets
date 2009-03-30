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
import org.simileWidgets.divisadero.ui.Frame;

abstract public class BitmapLayer extends Layer {
	static protected class Transform {
	    Point2D       offset = new Point2D.Double(); // offset of _pivot relative to canvas's coordinate system
		Point2D       pivot = new Point2D.Double();	// relative to (0,0) of bitmap
	    double        rotation = 0;
	    double        scaleX = 1.0;
	    double        scaleY = 1.0;
	    double		  shear = 0;
	    
	    Point2D[]	    anchors = new Point2D[2];		// relative to _pivot
	    
	    double			opacity = 0.7;
	    Rectangle2D   	crop = null;
	    
	    AffineTransform forward;
	    AffineTransform backward;
	    
	    void cacheTransforms() {
	    	forward = new AffineTransform();
	    	forward.translate(offset.getX(), offset.getY());
	    	
	    	// Do not change the order of these 3 statements
	    	forward.scale(scaleX, scaleY);
	    	forward.rotate(rotation);
	    	forward.shear(shear, 0);
	    	
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
	    	t.shear = this.shear;
	    	
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
    }
    
	protected void load(Project project, Properties properties, String prefix) {
		super.load(project, properties, prefix);
		
		_transform.pivot = Utilities.getPoint2D(properties, prefix + "pivot", _transform.pivot);
		_transform.anchors[0] = Utilities.getPoint2D(properties, prefix + "anchor.0", null);
		_transform.anchors[1] = Utilities.getPoint2D(properties, prefix + "anchor.1", null);
		
		_transform.offset = Utilities.getPoint2D(properties, prefix + "offset", _transform.offset);
		_transform.rotation = Utilities.getDouble(properties, prefix + "rotation", _transform.rotation);
		_transform.scaleX = Utilities.getDouble(properties, prefix + "scaleX", _transform.scaleX);
		_transform.scaleY = Utilities.getDouble(properties, prefix + "scaleY", _transform.scaleY);
		_transform.shear = Utilities.getDouble(properties, prefix + "shear", _transform.shear);
		
		_transform.opacity = Utilities.getDouble(properties, prefix + "opacity", _transform.opacity);
		_transform.crop = Utilities.getRectangle2D(properties, prefix + "crop", null);
		
		_transform.cacheTransforms();
	}
	
	@Override
	public void save(File projectDir, Properties properties, String prefix) {
		super.save(projectDir, properties, prefix);
		
		Utilities.setPoint2D(properties, prefix + "pivot", _transform.pivot);
		Utilities.setPoint2D(properties, prefix + "anchor.0", _transform.anchors[0]);
		Utilities.setPoint2D(properties, prefix + "anchor.1", _transform.anchors[1]);
		
		Utilities.setPoint2D(properties, prefix + "offset", _transform.offset);
		Utilities.setDouble(properties, prefix + "rotation", _transform.rotation);
		Utilities.setDouble(properties, prefix + "scaleX", _transform.scaleX);
		Utilities.setDouble(properties, prefix + "scaleY", _transform.scaleY);
		Utilities.setDouble(properties, prefix + "shear", _transform.shear);
		
		Utilities.setDouble(properties, prefix + "opacity", _transform.opacity);
		Utilities.setRectangle2D(properties, prefix + "crop", _transform.crop);
	}
	
    abstract protected Rectangle2D getBoundary();
    
    protected Rectangle2D getCropBoundary() {
    	return _transform.crop != null ? _transform.crop : getBoundary();
    }

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
    	Point2D		_mouseDown;
    	
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
			 
			return _mode != MODE_READY ||
				within(p, PIVOT_RADIUS, pivotOnScreen) ||
				within(p, ANCHOR_RADIUS, anchor0OnScreen) ||
				within(p, ANCHOR_RADIUS, anchor1OnScreen) ||
				withinBoundary(p, canvasToScreen);
		}
		
		protected boolean within(Point2D center, double radius, Point2D test) {
			return Math.abs(test.getX() - center.getX()) <= radius &&
				Math.abs(test.getY() - center.getY()) <= radius;
		}
		
		protected boolean withinBoundary(Point2D p, AffineTransform canvasToScreen) {
			Rectangle2D boundary = getBoundary();
			Point2D topLeft = canvasToScreen.transform(_transform.forward.transform(
					new Point2D.Double(boundary.getMinX(), boundary.getMinY()), null), null);
			Point2D bottomRight = canvasToScreen.transform(_transform.forward.transform(
					new Point2D.Double(boundary.getMaxX(), boundary.getMaxY()), null), null);
			
			return p.getX() >= topLeft.getX() && p.getX() <= bottomRight.getX() &&
				p.getY() >= topLeft.getY() && p.getY() <= bottomRight.getY();
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
					return;
				}
			} else if (within(p, ANCHOR_RADIUS, anchor0OnScreen)) {
				_oldTransform = _transform.dup();
				if (ctrlMeta) {
					_mode = MODE_MOVING_ANCHOR_0;
				} else {
					_mode = MODE_STRETCHING_ANCHOR_0;
				}
				return;
			} else if (within(p, ANCHOR_RADIUS, anchor1OnScreen)) {
				_oldTransform = _transform.dup();
				if (ctrlMeta) {
					_mode = MODE_MOVING_ANCHOR_1;
				} else {
					_mode = MODE_STRETCHING_ANCHOR_1;
				}
				return;
			}
			
			if (withinBoundary(p, canvasToScreen)) {
				_mouseDown = _canvas.getInverseTransform().transform(p, null);
				_mode = MODE_MOVING_LAYER;
				_oldTransform = _transform.dup();
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
				_transform.anchors[0] = keepDistance(ourPoint, null, 10);
				break;
				
			case MODE_MOVING_ANCHOR_1:
				_transform.anchors[1] = keepDistance(ourPoint, null, 10);
				break;
			
			case MODE_STRETCHING_ANCHOR_0:
				reanchor(canvasPoint, _oldTransform.forward.transform(_transform.anchors[1], null));
				break;
				
			case MODE_STRETCHING_ANCHOR_1:
				reanchor(_oldTransform.forward.transform(_transform.anchors[0], null), canvasPoint);
				break;
			
			case MODE_MOVING_LAYER:
				moveLayer(canvasPoint);
				break;
			}
			_canvas.repaint();
		}

		@Override
		public void mouseMoved(MouseEvent e) {
			if (_paused) { return; }
		}
		
		void reanchor(Point2D anchor0OnCanvas, Point2D anchor1OnCanvas) {
			Point2D pivotOnCanvas = _oldTransform.forward.transform(new Point2D.Double(), null);
			
			/*
			 *  For convenience, make anchors on canvas relative to pivot on canvas.
			 */
			//anchor0OnCanvas = keepDistance(anchor0OnCanvas, pivotOnCanvas, 10);
			anchor0OnCanvas.setLocation(
				anchor0OnCanvas.getX() - pivotOnCanvas.getX(),
				anchor0OnCanvas.getY() - pivotOnCanvas.getY());
			
			//anchor1OnCanvas = keepDistance(anchor1OnCanvas, pivotOnCanvas, 10);
			anchor1OnCanvas.setLocation(
				anchor1OnCanvas.getX() - pivotOnCanvas.getX(),
				anchor1OnCanvas.getY() - pivotOnCanvas.getY());
			
			double x1 = _transform.anchors[0].getX(); // should NOT be zero
			double y1 = _transform.anchors[0].getY(); // should be zero
			double x2 = _transform.anchors[1].getX();
			double y2 = _transform.anchors[1].getY();
			
			double x1prime = anchor0OnCanvas.getX();
			double y1prime = anchor0OnCanvas.getY();
			double x2prime = anchor1OnCanvas.getX();
			double y2prime = anchor1OnCanvas.getY();
			
			double a = (x2prime * y1 - x1prime * y2) * (y1prime * y2 - y1 * y2prime);
			double b = (x2prime * y1 - x1prime * y2) * (x2 * y1prime - x1 * y2prime) + (x1 * x2prime - x1prime * x2) * (y1prime * y2 - y1 * y2prime);
			double c = (x1 * x2prime - x1prime * x2) * (x2 * y1prime - x1 * y2prime) - (x2prime * y1 - x1prime * y2) * (y1 * y2prime - y1prime * y2);
			//System.err.println(a + " " + b + " " + c);
			double gamma;
			if (a == 0) {
				gamma = -c / b;
			} else {
				double d = b * b - 4 * a * c;
				if (d < 0) {
					return;
				}
				
				double s1 = (-b + Math.sqrt(d)) / (2 * a);
				double s2 = (-b - Math.sqrt(d)) / (2 * a);
				//System.err.println(s1 + " " + s2);
				gamma = s1 != 0 ? s1 : s2;
			}
			
			
			double theta = Math.atan2(
					x2prime * (x1 + gamma * y1) - x1prime * (x2 + gamma * y2), 
					x2prime * y1 - x1prime * y2);
			if (theta >= Math.PI / 2) {
				theta -= Math.PI;
			} else if (theta <= -Math.PI / 2) {
				theta += Math.PI;
			}
			double cos = Math.cos(theta);
			double sin = Math.sin(theta);
			double alphaX = x1prime / ((x1 + gamma * y1) * cos - y1 * sin);
			double alphaY = y1prime != 0 ? (y1prime / ((x1 + gamma * y1) * sin + y1 * cos)) :
				(y2prime / ((x2 + gamma * y2) * sin + y2 * cos));
			
			_transform.rotation = theta;
			_transform.shear = gamma;
			_transform.scaleX = alphaX;
			_transform.scaleY = alphaY;
			_transform.cacheTransforms();
			
			String s =
				"scaleX: " + round(_transform.scaleX) +
				", scaleY: " + round(_transform.scaleY) +
				", rotation: " + round(_transform.rotation) +
				", shear: " + round(_transform.shear);
			System.err.println(s);
			Frame.theFrame.setStatusText(s);
		}
		
		String round(double d) {
			return Double.toString(Math.round(d * 1000.0) / 1000.0);
		}
		
		void moveLayer(Point2D canvasPoint) {
			_transform.offset.setLocation(new Point2D.Double(
				_oldTransform.offset.getX() + (canvasPoint.getX() - _mouseDown.getX()),
				_oldTransform.offset.getY() + (canvasPoint.getY() - _mouseDown.getY())
			));
			_transform.cacheTransforms();
		}

		
		double computeAngle(Point2D p, Point2D origin) {
			double diffX = (p.getX() - (origin == null ? 0 : origin.getX()));
			double diffY = (p.getY() - (origin == null ? 0 : origin.getY()));
			return Math.atan2(diffY, diffX);
		}
		
		double computeAngle(Point2D p1, Point2D origin1, Point2D p2, Point2D origin2) {
			return computeAngle(p1, origin1) - computeAngle(p2, origin2);
		}
		
		double computeDistance(Point2D p, Point2D origin) {
			double diffX = (p.getX() - (origin == null ? 0 : origin.getX()));
			double diffY = (p.getY() - (origin == null ? 0 : origin.getY()));
			return Math.sqrt(diffX * diffX + diffY * diffY);
		}
		
		double ensureNonZero(double a, double min) {
			return Math.signum(a) * Math.max(min, Math.abs(a));
		}
		
		Point2D keepDistance(Point2D p, Point2D origin, double min) {
			double distance = Math.max(min, computeDistance(p, origin));
			double angle = computeAngle(p, origin);
			double x = origin == null ? 0 : origin.getX();
			double y = origin == null ? 0 : origin.getY();
			
			return new Point2D.Double(x + distance * Math.cos(angle), y + distance * Math.sin(angle));
		}
    }
}
