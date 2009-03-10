package org.simileWidgets.babel.exhibit;

import java.io.IOException;
import java.io.Reader;
import java.util.LinkedList;
import java.util.List;

public class ChainingReader extends Reader {
	List<Reader> _readers = new LinkedList<Reader>();
	
	public void addReader(Reader reader) {
		_readers.add(reader);
	}
	
	@Override
	public void close() throws IOException {
		for (Reader reader : _readers) {
			try {
				reader.close();
			} catch (IOException e) {
				// silent
			}
		}
	}

	@Override
	public int read(char[] cbuf, int off, int len) throws IOException {
		int c = -1;
		while (_readers.size() > 0) {
			c = _readers.get(0).read(cbuf, off, len);
			if (c <= 0) {
				_readers.remove(0).close();
			} else {
				break;
			}
		}
		return c;
	}
}
