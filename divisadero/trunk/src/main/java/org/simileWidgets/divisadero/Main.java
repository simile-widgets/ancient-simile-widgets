package org.simileWidgets.divisadero;

import javax.swing.JFrame;
import javax.swing.UIManager;

import org.simileWidgets.divisadero.ui.Frame;

public class Main {

    /**
     * @param args
     */
    public static void main(String[] args) {
    	try {
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
		} catch (Exception e) {
		}
    	
        JFrame.setDefaultLookAndFeelDecorated(true);

        Frame frame = new Frame();
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        
        frame.pack();
        frame.setSize(1024, 700);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

}
