package org.simileWidgets.painter;

import java.awt.image.BufferedImage;
import java.util.Map;

public interface IRenderer {
	public BufferedImage render(Map<String, String[]> parameters) throws Exception;
}
