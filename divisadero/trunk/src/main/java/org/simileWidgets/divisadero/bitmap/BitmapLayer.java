package org.simileWidgets.divisadero.bitmap;

import java.awt.AlphaComposite;
import java.awt.Graphics2D;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;

import org.simileWidgets.divisadero.Layer;
import org.simileWidgets.divisadero.Project;

abstract public class BitmapLayer extends Layer {
    Point2D       pivot = new Point2D.Double();
    Point2D       offset = new Point2D.Double();;
    double        rotation = 0;
    double        scaleX = 1.0;
    double        scaleY = 1.0;
    float         opacity = 0.7f;
    Rectangle2D   crop = null;
    
    protected BitmapLayer(Project project, String name) {
        super(project, name);
    }

    @Override
    public void paint(Graphics2D g2d) {
        g2d.translate(offset.getX(), offset.getY());
        g2d.rotate(rotation);
        g2d.scale(scaleX, scaleY);
        g2d.translate(-pivot.getX(), -pivot.getY());
        if (crop != null) {
            g2d.clip(crop);
        }
        g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, opacity));
    }
}
