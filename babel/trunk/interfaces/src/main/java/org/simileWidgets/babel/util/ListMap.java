package org.simileWidgets.babel.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * @author matsakis
 * @author dfhuynh
 *
 * A map from keys to a list of objects
 */
@SuppressWarnings("unchecked")
public class ListMap extends HashMap {
	
    private static final long serialVersionUID = 3856407370527187912L;

	public boolean check(Object key, Object value){
		List val = (List) super.get(key);
		if (val == null)
			return false;
		for(int i = 0; i<val.size(); i++)
			if(value.equals(val.get(i)))
				return true;
		return false;
	}

	public int count(Object key){
		List val = (List) super.get(key);
		return (val == null)
			? 0
			: ((List) val).size();
	}

	public Object get(Object key){
		List val = (List) super.get(key);
		return (val == null)
			? null
			: ((List) val).get(0);
	}

	public Object get(Object key, int index){
		List val = (List) super.get(key);
		return (val == null)
			? null
			: ((List) val).get(index);
	}

	public Object put(Object key, Object value){
		List val = (List) super.get(key);
		if(val == null)
			val = new ArrayList();
		val.add(value);
		return super.put(key, val);
	}
}