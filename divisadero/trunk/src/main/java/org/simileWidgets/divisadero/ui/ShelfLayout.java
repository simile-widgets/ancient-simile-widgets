package org.simileWidgets.divisadero.ui;

import java.awt.Component;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.LayoutManager2;
import java.util.LinkedList;
import java.util.List;

public class ShelfLayout implements LayoutManager2 {
    static public enum Direction {
        Horizontal,
        Vertical
    }
    
    final protected Direction _direction;
    final protected int _gap;
    
    protected List<Component> _components = new LinkedList<Component>();
    protected List<Float> _weights = new LinkedList<Float>();
    
    public ShelfLayout(Direction direction, int gap) {
        _direction = direction;
        _gap = gap;
    }

    public void addLayoutComponent(Component comp, Object constraints) {
        _components.add(comp);
        _weights.add((Float) constraints);
    }

    public float getLayoutAlignmentX(Container target) {
        return Component.LEFT_ALIGNMENT;
    }

    public float getLayoutAlignmentY(Container target) {
        return Component.TOP_ALIGNMENT;
    }

    public void invalidateLayout(Container target) {
        // TODO Auto-generated method stub

    }

    public void addLayoutComponent(String name, Component comp) {
        // TODO Auto-generated method stub

    }

    public void layoutContainer(Container parent) {
        int fitDimension = _direction == Direction.Horizontal ? parent.getWidth() : parent.getHeight();
        int commonDimension = _direction == Direction.Horizontal ? parent.getHeight() : parent.getWidth();
        
        int slack = fitDimension - (_components.size() - 1) * _gap;
        float totalWeights = 0;
        int[] pixels = new int[_weights.size()];
        for (int i = 0; i < _weights.size(); i++) {
            float weight = _weights.get(i);
            if (weight <= 0) {
                Dimension d = _components.get(i).getPreferredSize();
                int pixel = _direction == Direction.Horizontal ? d.width : d.height;
                
                slack -= pixel;
                pixels[i] = pixel;
            } else {
                totalWeights += weight;
            }
        }
        
        for (int i = 0; i < _weights.size(); i++) {
            float weight = _weights.get(i);
            if (weight > 0) {
                int pixel = totalWeights > 0 ? Math.round(slack * weight / totalWeights) : 0;
                slack -= pixel;
                pixels[i] = pixel;
            }
        }
        
        int offset = 0;
        for (int i = 0; i < _components.size(); i++) {
            Component c = _components.get(i);
            Dimension max = c.getMaximumSize();
            
            int top, left, width, height;
            if (_direction == Direction.Horizontal) {
                top = 0;
                left = offset;
                width = pixels[i];
                height = Math.min(commonDimension, max.height);
            } else {
                top = offset;
                left = 0;
                height = pixels[i];
                width = Math.min(commonDimension, max.width);
            }
            c.setLocation(left, top);
            c.setSize(width, height);
            
            offset += pixels[i] + _gap;
        }
    }

    public Dimension minimumLayoutSize(Container parent) {
        int width = 0;
        int height = 0;
        
        if (_direction == Direction.Horizontal) {
            for (Component c : _components) {
                Dimension d = c.getMinimumSize();
                width += d.width + (width > 0 ? _gap : 0);
                height = Math.max(height, d.height);
            }
        } else {
            for (Component c : _components) {
                Dimension d = c.getMinimumSize();
                width = Math.max(width, d.width);
                height += d.height + (height > 0 ? _gap : 0);;
            }
        }
        return new Dimension(width, height);
    }
    
    public Dimension maximumLayoutSize(Container target) {
        int width = 0;
        int height = 0;
        
        if (_direction == Direction.Horizontal) {
            for (Component c : _components) {
                Dimension d = c.getMaximumSize();
                width += d.width + (width > 0 ? _gap : 0);;
                height = Math.max(height, d.height);
            }
        } else {
            for (Component c : _components) {
                Dimension d = c.getMaximumSize();
                width = Math.max(width, d.width);
                height += d.height + (height > 0 ? _gap : 0);;
            }
        }
        return new Dimension(width, height);
    }

    public Dimension preferredLayoutSize(Container parent) {
        int width = 0;
        int height = 0;
        
        if (_direction == Direction.Horizontal) {
            for (Component c : _components) {
                Dimension d = c.getPreferredSize();
                width += d.width + (width > 0 ? _gap : 0);;
                height = Math.max(height, d.height);
            }
        } else {
            for (Component c : _components) {
                Dimension d = c.getPreferredSize();
                width = Math.max(width, d.width);
                height += d.height + (height > 0 ? _gap : 0);;
            }
        }
        return new Dimension(width, height);
    }

    public void removeLayoutComponent(Component comp) {
        int i = _components.indexOf(comp);
        if (i >= 0) {
            _components.remove(i);
            _weights.remove(i);
        }
    }
}
