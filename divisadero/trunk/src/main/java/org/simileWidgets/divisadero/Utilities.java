package org.simileWidgets.divisadero;

import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.util.Properties;

public class Utilities {

	public static Point2D getPoint2D(Properties properties, String name, Point2D def) {
		String value = properties.getProperty(name);
		if (value != null && value.length() > 0) {
			int comma = value.indexOf(',');
			if (comma > 0) {
				try {
					double x = Double.parseDouble(value.substring(0, comma));
					double y = Double.parseDouble(value.substring(comma + 1));
					
					return new Point2D.Double(x, y);
				} catch (Exception e) {
				}
			}
		}
		return def;
	}

	public static void setPoint2D(Properties properties, String name, Point2D p) {
		String value = p.getX() + "," + p.getY();
		properties.put(name, value);
	}

	public static double getDouble(Properties properties, String name, double def) {
		String value = properties.getProperty(name);
		if (value != null && value.length() > 0) {
			try {
				return Double.parseDouble(value);
			} catch (Exception e) {
			}
		}
		return def;
	}

	public static void setDouble(Properties properties, String name, double d) {
		properties.put(name, Double.toString(d));
	}

	public static Rectangle2D getRectangle2D(Properties properties, String name, Rectangle2D def) {
		String value = properties.getProperty(name);
		if (value != null && value.length() > 0) {
			String[] a = value.split(",");
			if (a.length == 4) {
				try {
					return new Rectangle2D.Double(
						Double.parseDouble(a[0]),
						Double.parseDouble(a[1]),
						Double.parseDouble(a[2]),
						Double.parseDouble(a[3])
					);
				} catch (Exception e) {
				}
			}
		}
		return def;
	}

	public static void setRectangle2D(Properties properties, String name, Rectangle2D r) {
		String value = r.getX() + "," + r.getY() + "," + r.getWidth() + "," + r.getHeight();
		properties.put(name, value);
	}
}
