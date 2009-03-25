package org.simileWidgets.divisadero.bitmap;

import java.awt.AlphaComposite;
import java.awt.Graphics2D;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.util.Properties;

import org.simileWidgets.divisadero.Layer;
import org.simileWidgets.divisadero.Project;
import org.simileWidgets.divisadero.Utilities;

abstract public class BitmapLayer extends Layer {
	protected Point2D       _pivot = new Point2D.Double();
    protected Point2D[]	    _anchors = new Point2D[2];
    
    protected Point2D       _offset = new Point2D.Double();
    protected double        _rotation = 0;
    protected double        _scaleX = 1.0;
    protected double        _scaleY = 1.0;
    
    protected double		_opacity = 0.7;
    protected Rectangle2D   _crop = null;
    
    protected BitmapLayer(Project project, String name, String key) {
        super(project, name, key);
    }
    
	protected void load(Project project, Properties properties, String prefix) {
		_pivot = Utilities.getPoint2D(properties, prefix + "pivot", _pivot);
		_anchors[0] = Utilities.getPoint2D(properties, prefix + "anchor.0", null);
		_anchors[1] = Utilities.getPoint2D(properties, prefix + "anchor.1", null);
		
		_offset = Utilities.getPoint2D(properties, prefix + "offset", _offset);
		_rotation = Utilities.getDouble(properties, prefix + "rotation", _rotation);
		_scaleX = Utilities.getDouble(properties, prefix + "scaleX", _scaleX);
		_scaleY = Utilities.getDouble(properties, prefix + "scaleY", _scaleY);
		
		_opacity = Utilities.getDouble(properties, prefix + "opacity", _opacity);
		_crop = Utilities.getRectangle2D(properties, prefix + "opacity", null);
	}

    @Override
    public void paint(Graphics2D g2d) {
    	if (_visible) {
	        g2d.translate(_offset.getX(), _offset.getY());
	        g2d.rotate(_rotation);
	        g2d.scale(_scaleX, _scaleY);
	        g2d.translate(-_pivot.getX(), -_pivot.getY());
	        if (_crop != null) {
	            g2d.clip(_crop);
	        }
	        g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, (float) _opacity));
	        
	        internalPaint(g2d);
    	}
    }
    
    abstract protected void internalPaint(Graphics2D g2d);
}
