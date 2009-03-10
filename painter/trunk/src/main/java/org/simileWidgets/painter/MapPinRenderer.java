package org.simileWidgets.painter;

import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.Shape;
import java.awt.font.FontRenderContext;
import java.awt.geom.GeneralPath;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.util.Map;

public class MapPinRenderer implements IRenderer {
    final static private Font s_font = new Font("Tahoma", Font.PLAIN, 12);

    public BufferedImage render(Map<String, String[]> parameters) throws Exception {
    	/*
    	 * Gather the parameters
    	 */
        int height = Math.round(PainterUtilities.getFloat(parameters, "height", 10.0f, 1.0f, 100f /* Float.MAX_VALUE */));
        int width = Math.round(PainterUtilities.getFloat(parameters, "width", 10.0f, 1.0f, 100f /* Float.MAX_VALUE */));
        
        String shape = PainterUtilities.getString(parameters, "shape", "circle");
        float shapeWidth = PainterUtilities.getFloat(parameters, "shapeWidth", 10.0f, 1.0f, 100f /* Float.MAX_VALUE */);
        float shapeHeight = PainterUtilities.getFloat(parameters, "shapeHeight", 10.0f, 1.0f, 100f /* Float.MAX_VALUE */);
        Color shapeColor = PainterUtilities.getColor(parameters, "shapeColor", Color.RED);
        float shapeAlpha = PainterUtilities.getFloat(parameters, "shapeAlpha", 1.0f, 0.1f, 1.0f);
        
        float borderThickness = PainterUtilities.getFloat(parameters, "borderThickness", 1.3f, 1.0f, Float.MAX_VALUE);
        Color borderColor = PainterUtilities.getColor(parameters, "borderColor", Color.BLACK);
        
        String label = PainterUtilities.getString(parameters, "label", "");
        Font font = PainterUtilities.getFont(parameters, "font", s_font);
        Color textColor = PainterUtilities.getColor(parameters, "textColor", Color.BLACK);
        Color outlineColor = PainterUtilities.getColor(parameters, "outlineColor", Color.WHITE);
        float outlineAlpha = PainterUtilities.getFloat(parameters, "outlineAlpha", 0.5f, 0.1f, 1.0f);
        
    	/*
    	 * Set up the graphics context and such
    	 */
        Rectangle2D bodyBounds = new Rectangle2D.Double(
        	(width - shapeWidth) / 2 + borderThickness, 
            borderThickness, 
            shapeWidth - borderThickness * 2, 
            shapeHeight - borderThickness * 2);
        
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_4BYTE_ABGR);
        
        Graphics2D g2d = (Graphics2D) image.getGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        
        try {
            GeneralPath body = null;
            if ("circle".equals(shape)) {
                body = MapMarkerUtilities.makeCircleShape(bodyBounds);
            } else {
                body = MapMarkerUtilities.makeSquareShape(bodyBounds);
            }

            /*
             * Fill outline
             */
            g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, shapeAlpha));
            g2d.setColor(shapeColor);
            g2d.fill(body);
            g2d.setComposite(AlphaComposite.SrcOver);
            
            /*
             * Draw outline
             */
            g2d.setColor(borderColor);
            g2d.setStroke(new BasicStroke(borderThickness, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            g2d.draw(body);
            
            /*
             * Draw label
             */
            if (label.length() > 0) {
	            g2d.setFont(font);
	            
	            FontRenderContext frc = g2d.getFontRenderContext();
	            Rectangle2D labelBounds = font.getStringBounds(label, frc);
	            
	            float x = (float) (bodyBounds.getCenterX() - labelBounds.getWidth() / 2);
	            float y = (float) (bodyBounds.getMaxY() + labelBounds.getHeight());
                g2d.translate(x, y);
                
                Shape outline = font.createGlyphVector(frc, label).getOutline();
                g2d.setStroke(new BasicStroke(4, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                g2d.setColor(outlineColor);
                g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, outlineAlpha));
                g2d.draw(outline);
                g2d.setComposite(AlphaComposite.SrcOver);
	
	            g2d.setColor(textColor);
	            g2d.drawString(label, 1, 0);
            }
        } finally {
            g2d.dispose();
        }
        return image;
    }
}
