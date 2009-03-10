package org.simileWidgets.painter;

import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.geom.Area;
import java.awt.geom.GeneralPath;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.util.Map;

public class MapMarkerShadowRenderer implements IRenderer {
	final static private int s_softEdge = 5;
	
    public BufferedImage render(Map<String, String[]> parameters) throws Exception {
    	/*
    	 * Gather the parameters
    	 */
        String shape = PainterUtilities.getString(parameters, "shape", "square");
        float bodyWidth = PainterUtilities.getFloat(parameters, "width", 20.0f, 1.0f, 100f /* Float.MAX_VALUE */);
        float bodyHeight = PainterUtilities.getFloat(parameters, "height", 20.0f, 1.0f, 100f /* Float.MAX_VALUE */);
        
        boolean pin = PainterUtilities.getBoolean(parameters, "pin", true);
        float pinWidth = PainterUtilities.getFloat(parameters, "pinWidth", 5.0f, 1.0f, 100f /* Float.MAX_VALUE */);
        float pinHeight = PainterUtilities.getFloat(parameters, "pinHeight", 7.0f, 1.0f, 100f /* Float.MAX_VALUE */);
        
        Color color = PainterUtilities.getColor(parameters, "color", Color.BLACK);
        float alpha = PainterUtilities.getFloat(parameters, "alpha", 0.3f, 0.1f, 1.0f);
        
        float shear = PainterUtilities.getFloat(parameters, "shear", 40f, 10f, 80f); // degrees
        float compress = PainterUtilities.getFloat(parameters, "compress", 0.5f, 0.1f, 0.9f); // vertical compression
        
    	/*
    	 * Set up the graphics context and such
    	 */
        int width = (int) Math.ceil(bodyWidth);
        int height = (int) Math.ceil(bodyHeight + (pin ? pinHeight : 0));
        Rectangle2D bodyBounds = new Rectangle2D.Double(s_softEdge, s_softEdge, bodyWidth - s_softEdge * 2, bodyHeight - s_softEdge * 2);
        
        AffineTransform at = new AffineTransform();
        at.translate(0, height);
        at.shear(-Math.tan(shear * Math.PI / 180), 0);
        at.scale(1.0, compress);
        at.translate(0, -height);
        
        width = (int) Math.ceil(at.transform(new Point2D.Double(width, 0), null).getX());
        
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_4BYTE_ABGR);
        
        Graphics2D g2d = (Graphics2D) image.getGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        try {
            GeneralPath body = null;
            if ("circle".equals(shape)) {
                body = MapMarkerUtilities.makeCircleShape(bodyBounds);
            } else {
                body = MapMarkerUtilities.makeSquareShape(bodyBounds);
            }

            /*
             * Construct the overall shape, adding the pin if needed
             */
            GeneralPath path;
            if (pin) {
	            path = new GeneralPath();
	            path.moveTo((float) (bodyBounds.getCenterX() - pinWidth / 2), (float) (bodyBounds.getMaxY() - 2));
	            path.lineTo((float) (bodyBounds.getCenterX() + pinWidth / 2), (float) (bodyBounds.getMaxY() - 2));
	            path.lineTo((float) bodyBounds.getCenterX(), (float) (bodyBounds.getMaxY() + pinHeight - s_softEdge));
	            path.closePath();
	
	            Area area = new Area(path);
	            area.add(new Area(body));
	            
	            path = new GeneralPath();
	            path.append(area.getPathIterator(new AffineTransform()), false);
            } else {
            	path = body;
            }
            
            /*
             * Draw shadow
             */
            g2d.transform(at);
            g2d.setColor(color);
            
            g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, alpha / s_softEdge));
            for (int i = s_softEdge; i > 0; i--) {
                g2d.setStroke(new BasicStroke(i * 2));
                g2d.draw(path);
            }
            
            g2d.clip(path);
            g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC, alpha));
            g2d.fillRect(0, 0, width, height);
        } finally {
            g2d.dispose();
        }
        return image;
    }
}
