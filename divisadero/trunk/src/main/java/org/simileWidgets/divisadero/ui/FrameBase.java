package org.simileWidgets.divisadero.ui;

import java.awt.BorderLayout;
import java.awt.CardLayout;
import java.awt.Color;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.util.LinkedList;
import java.util.List;

import javax.swing.JButton;
import javax.swing.JComponent;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSplitPane;
import javax.swing.JTable;
import javax.swing.KeyStroke;
import javax.swing.ListSelectionModel;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableColumnModel;
import javax.swing.table.TableColumn;

import org.simileWidgets.divisadero.ui.ShelfLayout.Direction;

abstract class FrameBase extends JFrame {
    protected Canvas        _canvas;
    protected JSplitPane    _sideBar;
    protected Container     _controlPanel;
    protected List<JPanel>  _controlSubPanels = new LinkedList<JPanel>();
    
    protected JTable        _layerTable;
    protected JButton       _moveUpButton;
    protected JButton       _moveDownButton;
    
    public FrameBase() {
        super("Divisadero");
        
        getContentPane().setLayout(new BorderLayout());
        
        createMenuBar();
        createStatusPanel();
        createContentPanes();
    }
    
    private void createMenuBar() {
        boolean isMac = "Mac OS X".equalsIgnoreCase(System.getProperty("os.name"));
        int metaMask = isMac ? ActionEvent.META_MASK : ActionEvent.CTRL_MASK;
        
        JMenu menu;
        JMenuItem menuItem;
        
        JMenuBar menuBar = new JMenuBar();
        this.setJMenuBar(menuBar);
        
        /*
         *  File Menu
         */
        menu = new JMenu("File");
        menu.setMnemonic(KeyEvent.VK_A);
        menuBar.add(menu);
        
        menuItem = new JMenuItem("New Project");
        menuItem.setMnemonic(KeyEvent.VK_N);
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_N, metaMask));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doNewProject();
            }
        });
        menu.add(menuItem);
        
        menuItem = new JMenuItem("Open Project...");
        menuItem.setMnemonic(KeyEvent.VK_O);
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_O, metaMask));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doOpenProject();
            }
        });
        menu.add(menuItem);
        
        menu.addSeparator();
        
        menuItem = new JMenuItem("Export...");
        menuItem.setMnemonic(KeyEvent.VK_E);
        //menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_O, metaMask));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doExport();
            }
        });
        menu.add(menuItem);

        
        menu.addSeparator();
        
        if (isMac) {
            menuItem = new JMenuItem("Quit");
            menuItem.setMnemonic(KeyEvent.VK_Q);
            menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_Q, ActionEvent.META_MASK));
        } else {
            menuItem = new JMenuItem("Exit");
            menuItem.setMnemonic(KeyEvent.VK_X);
            menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_X, ActionEvent.CTRL_MASK));
        }
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doQuit();
            }
        });
        menu.add(menuItem);
        
        /*
         *  View Menu
         */
        menu = new JMenu("View");
        menu.setMnemonic(KeyEvent.VK_V);
        menuBar.add(menu);
        
        menuItem = new JMenuItem("Zoom In");
        menuItem.setMnemonic(KeyEvent.VK_I);
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_EQUALS, metaMask));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doZoomIn();
            }
        });
        menu.add(menuItem);
        
        menuItem = new JMenuItem("Zoom Out");
        menuItem.setMnemonic(KeyEvent.VK_I);
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_MINUS, metaMask));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doZoomOut();
            }
        });
        menu.add(menuItem);
        
        /*
         *  Layers Menu
         */
        menu = new JMenu("Layers");
        menu.setMnemonic(KeyEvent.VK_L);
        menuBar.add(menu);
        
        menuItem = new JMenuItem("New Bitmap Layer");
        menuItem.setMnemonic(KeyEvent.VK_B);
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_B, metaMask));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doNewBitmapLayer();
            }
        });
        menu.add(menuItem);
        
        menuItem = new JMenuItem("New Line Layer");
        menuItem.setMnemonic(KeyEvent.VK_L);
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_L, metaMask));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doNewLineLayer();
            }
        });
        menu.add(menuItem);
        
        menuItem = new JMenuItem("New Area Layer");
        menuItem.setMnemonic(KeyEvent.VK_A);
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_A, metaMask));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doNewAreaLayer();
            }
        });
        menu.add(menuItem);
        
        menu.addSeparator();
        
        menuItem = new JMenuItem("Delete Selected Layer(s)...");
        menuItem.setMnemonic(KeyEvent.VK_D);
        //menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_A, metaMask));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doDeleteSelectedLayers();
            }
        });
        menu.add(menuItem);
        
        menu.addSeparator();
        
        menuItem = new JMenuItem("Toggle Selected Layer(s)");
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_V, 0));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doToggleSelectedLayers();
            }
        });
        menu.add(menuItem);
        
        menuItem = new JMenuItem("Show Selected Layer(s)");
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_S, 0));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doShowSelectedLayers(false);
            }
        });
        menu.add(menuItem);
        
        menuItem = new JMenuItem("Show Only Selected Layer(s)");
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_S, ActionEvent.SHIFT_MASK));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doShowSelectedLayers(true);
            }
        });
        menu.add(menuItem);
        
        menuItem = new JMenuItem("Hide Selected Layer(s)");
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_H, 0));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doHideSelectedLayers(false);
            }
        });
        menu.add(menuItem);
        
        menuItem = new JMenuItem("Hide Only Selected Layer(s)");
        menuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_H, ActionEvent.SHIFT_MASK));
        menuItem.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                doHideSelectedLayers(true);
            }
        });
        menu.add(menuItem);
    }
    
    private void createStatusPanel() {
        JComponent statusBar = new JLabel("status");
        statusBar.setBorder(new EmptyBorder(2, 5, 2, 5));
        add(statusBar, BorderLayout.SOUTH);
    }
    
    private void createContentPanes() {
        JSplitPane splitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT);
        splitPane.setBorder(new EmptyBorder(0, 0, 0, 0));
        splitPane.setDividerSize(10);
        splitPane.setDividerLocation(800);
        splitPane.setResizeWeight(1);
        add(splitPane, BorderLayout.CENTER);
        
        createSideBar(splitPane);
        createCanvas(splitPane);
    }
    
    private void createCanvas(JSplitPane splitPane) {
        _canvas = new Canvas();
        _canvas.setBackground(Color.white);
        _canvas.setMinimumSize(new Dimension(400, 400));
        splitPane.setLeftComponent(_canvas);
    }
    
    private void createSideBar(JSplitPane splitPane) {
        _sideBar = new JSplitPane();
        _sideBar.setOrientation(JSplitPane.VERTICAL_SPLIT);
        _sideBar.setResizeWeight(1);
        _sideBar.setBorder(new EmptyBorder(5, 0, 0, 5));
        _sideBar.setDividerLocation(400);
        _sideBar.setDividerSize(10);
        splitPane.setRightComponent(_sideBar);
        
        createLayerPanel();
        createControlPanel();
    }
    
    private void createLayerPanel() {
        JComponent container = new JPanel();
        container.setLayout(new ShelfLayout(Direction.Vertical, 3));
        _sideBar.setTopComponent(container);
        
        container.add(new JLabel("Layers"), 0f);
        
        _layerTable = new JTable();
        _layerTable.setSelectionMode(ListSelectionModel.SINGLE_INTERVAL_SELECTION);
        //DefaultTableColumnModel columnModel = new DefaultTableColumnModel();
        //columnModel.addColumn(new TableColumn(0, 16, ))
        
        JScrollPane layerTableScrollPane = new JScrollPane(_layerTable);
        layerTableScrollPane.setMinimumSize(new Dimension(100, 100));
        layerTableScrollPane.setMaximumSize(new Dimension(1000, 400));
        container.add(layerTableScrollPane, 1f);
        
        JComponent buttons = new JPanel();
        buttons.setLayout(new ShelfLayout(Direction.Horizontal, 0));
        container.add(buttons, 0f);
        
        buttons.add(new Container(), 1f);
        
        _moveUpButton = new JButton("Up");
        buttons.add(_moveUpButton, 0f);
        
        _moveDownButton = new JButton("Down");
        buttons.add(_moveDownButton, 0f);
    }
    
    private void createControlPanel() {
        _controlPanel = new JPanel();
        _controlPanel.setLayout(new CardLayout());
        _sideBar.setBottomComponent(_controlPanel);
    }
    
    abstract void doNewProject();
    abstract void doOpenProject();
    abstract void doExport();
    abstract void doQuit();
    
    abstract void doZoomIn();
    abstract void doZoomOut();
    
    abstract void doNewBitmapLayer();
    abstract void doNewLineLayer();
    abstract void doNewAreaLayer();
    abstract void doDeleteSelectedLayers();
    
    abstract void doShowSelectedLayers(boolean exclusive);
    abstract void doHideSelectedLayers(boolean exclusive);
    abstract void doToggleSelectedLayers();
}
