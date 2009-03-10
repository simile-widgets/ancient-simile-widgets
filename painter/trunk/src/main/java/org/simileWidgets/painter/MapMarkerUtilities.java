package org.simileWidgets.painter;

import java.awt.geom.Ellipse2D;
import java.awt.geom.GeneralPath;
import java.awt.geom.Rectangle2D;
import java.awt.geom.RoundRectangle2D;

public class MapMarkerUtilities {
    static public GeneralPath makeSquareShape(Rectangle2D shapeBounds) throws Exception {
        double cornerRadius = Math.max(shapeBounds.getWidth() / 2, shapeBounds.getHeight() / 2);
        return new GeneralPath(new RoundRectangle2D.Double(
    		shapeBounds.getMinX(),
    		shapeBounds.getMinY(),
            shapeBounds.getWidth(),
            shapeBounds.getHeight(),
            cornerRadius, 
            cornerRadius
        ));
    }
    
    static public GeneralPath makeCircleShape(Rectangle2D shapeBounds) throws Exception {
        return new GeneralPath(new Ellipse2D.Double(
    		shapeBounds.getMinX(),
    		shapeBounds.getMinY(),
            shapeBounds.getWidth(),
            shapeBounds.getHeight()
        ));
    }
}
