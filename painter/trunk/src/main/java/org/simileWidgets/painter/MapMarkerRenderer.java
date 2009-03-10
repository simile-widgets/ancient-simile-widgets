package org.simileWidgets.painter;

import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.font.FontRenderContext;
import java.awt.font.LineMetrics;
import java.awt.geom.AffineTransform;
import java.awt.geom.Area;
import java.awt.geom.GeneralPath;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.net.URL;
import java.util.Map;

import javax.imageio.ImageIO;

public class MapMarkerRenderer implements IRenderer {
    final static private Font s_font = new Font("Arial", Font.BOLD, 12);

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
        
        Color backgroundColor = PainterUtilities.getColor(parameters, "background", Color.WHITE);
        Color foregroundColor = PainterUtilities.getColor(parameters, "foreground", Color.BLACK);
        float alpha = PainterUtilities.getFloat(parameters, "alpha", 0.7f, 0.1f, 1.0f);
        float borderThickness = PainterUtilities.getFloat(parameters, "borderThickness", 1.3f, 1.0f, Float.MAX_VALUE);
        Color borderColor = PainterUtilities.getColor(parameters, "borderColor", Color.BLACK);
        
        String label = PainterUtilities.getString(parameters, "label", "");
        Font font = PainterUtilities.getFont(parameters, "font", s_font);
        
        String iconURL = PainterUtilities.getString(parameters, "icon", null);
        String iconFit = PainterUtilities.getString(parameters, "iconFit", "smaller");
        float iconScale = PainterUtilities.getFloat(parameters, "iconScale", 1.0f, Float.MIN_VALUE, Float.MAX_VALUE);
        float iconX = PainterUtilities.getFloat(parameters, "iconX", 0.0f, Float.NEGATIVE_INFINITY, Float.POSITIVE_INFINITY);
        float iconY = PainterUtilities.getFloat(parameters, "iconY", 0.0f, Float.NEGATIVE_INFINITY, Float.POSITIVE_INFINITY);
        
    	/*
    	 * Set up the graphics context and such
    	 */
        int width = (int) Math.ceil(bodyWidth);
        int height = (int) Math.ceil(bodyHeight + (pin ? pinHeight : 0));
        Rectangle2D bodyBounds = new Rectangle2D.Double(
        	borderThickness, borderThickness, bodyWidth - borderThickness * 2, bodyHeight - borderThickness * 2);
        
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
             * Construct the overall shape, adding the pin if needed
             */
            GeneralPath path;
            if (pin) {
	            path = new GeneralPath();
	            path.moveTo((float) (bodyBounds.getCenterX() - pinWidth / 2), (float) (bodyBounds.getMaxY() - borderThickness * 2));
	            path.lineTo((float) (bodyBounds.getCenterX() + pinWidth / 2), (float) (bodyBounds.getMaxY() - borderThickness * 2));
	            path.lineTo((float) bodyBounds.getCenterX(), (float) (bodyBounds.getMaxY() + pinHeight - borderThickness));
	            path.closePath();
	
	            Area area = new Area(path);
	            area.add(new Area(body));
	            
	            path = new GeneralPath();
	            path.append(area.getPathIterator(new AffineTransform()), false);
            } else {
            	path = body;
            }
            
            /*
             * Fill outline
             */
            g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, alpha));
            g2d.setColor(backgroundColor);
            g2d.fill(path);
            g2d.setComposite(AlphaComposite.SrcOver);
            
            g2d.setClip(path);

            /*
             * Draw image
             */
            if (iconURL != null && iconURL.length() > 0) {
            	try {
            		BufferedImage icon = ImageIO.read(new URL(iconURL));
            		
            		Graphics2D g2d2 = (Graphics2D) g2d.create();
            		g2d2.translate(bodyBounds.getCenterX() + iconX, bodyBounds.getCenterY() + iconY);
                    
                    if (iconFit.equalsIgnoreCase("width")) {
                        float scale = (float) bodyBounds.getWidth() / icon.getWidth();
                        g2d2.scale(scale, scale);
                    } else if (iconFit.equalsIgnoreCase("height")) {
                        float scale = (float) bodyBounds.getHeight() / icon.getHeight();
                        g2d2.scale(scale, scale);
                    } else if (iconFit.equalsIgnoreCase("both") || iconFit.equalsIgnoreCase("larger")) {
                        float scale = (float) Math.min(
                                bodyBounds.getHeight() / icon.getHeight(),
                                bodyBounds.getWidth() / icon.getWidth());
                        
                        g2d2.scale(scale, scale);
                    } else if (iconFit.equalsIgnoreCase("smaller")) {
                        float scale = (float) Math.max(
                                bodyBounds.getHeight() / icon.getHeight(),
                                bodyBounds.getWidth() / icon.getWidth());
                        
                        g2d2.scale(scale, scale);
                    }
                    
            		g2d2.scale(iconScale, iconScale);
            		g2d2.drawImage(icon, (int) (- icon.getWidth()) / 2, (int) (- icon.getHeight()) / 2, null);
            	} catch (Exception e) {
            		// silent
            	}
            }

            /*
             * Draw label
             */
            if (label.length() > 0) {
	            g2d.setFont(font);
	            
	            FontRenderContext frc = g2d.getFontRenderContext();
	            Rectangle2D labelBounds = font.getStringBounds(label, frc);
	            LineMetrics lm = font.getLineMetrics(label, frc);
	            
	            float x = (float) (bodyBounds.getCenterX() - labelBounds.getWidth() / 2);
	            float y = (float) (bodyBounds.getCenterY() + labelBounds.getHeight() / 2 - lm.getDescent());
	
	            g2d.setColor(foregroundColor);
	            g2d.drawString(label, x, y);
            }
            
            /*
             * Draw outline
             */
            g2d.setClip(null);
            g2d.setColor(borderColor);
            g2d.setStroke(new BasicStroke(borderThickness, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            g2d.draw(path);
        } finally {
            g2d.dispose();
        }
        return image;
    }
}
