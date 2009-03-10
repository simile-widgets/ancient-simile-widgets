package org.mozilla.javascript;

public class RelaxedJSONException extends RhinoException {
	private static final long serialVersionUID = 4790078900471599703L;

	public RelaxedJSONException(String message, String sourceName, int line, String lineSource, int lineOffset) {
		super(message);
		initSourceName(sourceName);
		initLineNumber(line);
		initLineSource(lineSource);
		initColumnNumber(lineOffset);
	}
}
