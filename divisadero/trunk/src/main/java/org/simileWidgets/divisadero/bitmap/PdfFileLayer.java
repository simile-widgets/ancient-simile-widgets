package org.simileWidgets.divisadero.bitmap;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.geom.NoninvertibleTransformException;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.util.Properties;

import org.simileWidgets.divisadero.Project;

import com.sun.pdfview.PDFFile;
import com.sun.pdfview.PDFPage;
import com.sun.pdfview.PDFRenderer;

public class PdfFileLayer extends FileBasedBitmapLayer {
    final static float PICAS_PER_INCH = 72;
    final static float PIXELS_PER_INCH = 300;
    
    protected PdfFileLayer(Project project, String name, String key) {
        super(project, name, key);
    }
    
    public PdfFileLayer(Project project, String name, File file) {
        super(project, name, null);
        _file = file;
        
        loadFile();
    }
    
    protected void loadFile() {
    	if (_file == null || !_file.exists()) {
    		return;
    	}
    	
        try {
            ByteBuffer byteBuffer = readFile(_file);
            PDFFile pdfFile = new PDFFile(byteBuffer);
            PDFPage pdfPage = pdfFile.getPage(Math.max(1, Math.min(1, pdfFile.getNumPages())), true);
            
            double pageWidthInPicas = pdfPage.getWidth();
            double pageHeightInPicas = pdfPage.getHeight();
            
            int pageWidthInPixels = (int) (PIXELS_PER_INCH * pageWidthInPicas / PICAS_PER_INCH);
            int pageHeightInPixels = (int) (PIXELS_PER_INCH * pageHeightInPicas / PICAS_PER_INCH);
            
            AffineTransform pageForwardRotate = pdfPage.getInitialTransform(pageWidthInPixels, pageHeightInPixels, null);
            AffineTransform pageBackwardRotate = pageForwardRotate.createInverse();
            
            Rectangle2D contentInPixels = new Rectangle2D.Double(0, 0, pageWidthInPixels, pageHeightInPixels);
            Rectangle2D contentInPicas = pageBackwardRotate.createTransformedShape(contentInPixels).getBounds2D();
            
            Rectangle rect = new Rectangle(0, 0, 
                    (int) contentInPixels.getWidth(), (int) contentInPixels.getHeight());
            
            _image = new BufferedImage(rect.width, rect.height, BufferedImage.TYPE_4BYTE_ABGR);
            
            Graphics2D g2d = (Graphics2D) _image.getGraphics();
            try {
                PDFRenderer renderer = 
                    new PDFRenderer(pdfPage, g2d, rect, contentInPicas, Color.black);
                
                renderer.run();
            } finally {
                g2d.dispose();
            }
        } catch (NoninvertibleTransformException e) {
        } catch (Exception e) {
        }
    }
    
    @Override
    public String getType() {
    	return "pdf";
    }

    @Override
    protected void internalPaint(Graphics2D g2d) {
        if (_image != null) {
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g2d.drawImage(_image, null, 0, 0);
        }
    }

    private static ByteBuffer readFile(File file) throws IOException {
        FileInputStream fis = new FileInputStream(file);  
        FileChannel fc = fis.getChannel();
        try {
            ByteBuffer bb = ByteBuffer.allocate((int) fc.size());
            fc.read(bb);
            
            return bb;
        } finally {
            fc.close();
        }
    }
    
    static public PdfFileLayer load(Project project, Properties properties, String prefix, String key, String name) {
    	PdfFileLayer layer = new PdfFileLayer(project, name, key);
    	layer.load(project, properties, prefix);
    	layer.loadFile();
    	
    	return layer;
    }
}
