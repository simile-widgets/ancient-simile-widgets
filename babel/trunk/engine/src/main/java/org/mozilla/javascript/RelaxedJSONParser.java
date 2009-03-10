package org.mozilla.javascript;

import java.io.IOException;
import java.io.Reader;

public class RelaxedJSONParser extends Parser {
	protected TokenStream 	ts;
	protected ErrorReporter	errorReporter2;
	protected String	  	sourceURI2;
	protected int		  	currentToken;
	
    public RelaxedJSONParser(CompilerEnvirons compilerEnv, ErrorReporter errorReporter) {
    	super(compilerEnv, errorReporter);
    	errorReporter2 = errorReporter;
    }
    
    /*
     * Just check the code for errors.
     */
    public void check(String sourceString, String sourceURI, int lineno) {
        this.sourceURI2 = sourceURI;
        this.ts = new TokenStream(this, null, sourceString, lineno);
        try {
            check();
        } catch (IOException ex) {
            // Should never happen
            throw new IllegalStateException();
        }
    }

    /*
     * Just check the code for errors.
     */
    public void check(Reader sourceReader, String sourceURI, int lineno) throws IOException {
        this.sourceURI2 = sourceURI;
        this.ts = new TokenStream(this, sourceReader, null, lineno);
        check();
    }
    
    protected void check() throws IOException {
    	consumeToken();
    	checkObject();
	}
    
    protected void consumeAndSkipWhitespace() throws IOException {
    	consumeToken();
    	skipWhitespace();
    }
    
    protected void skipWhitespace() throws IOException {
    	while (currentToken == Token.EOL) {
    		consumeToken();
    	}
    }
    
    protected void consumeToken() throws IOException {
    	currentToken = ts.getToken();
    }
    
    protected void checkObject() throws IOException {
    	if (currentToken != Token.LC) {
            reportErrorHere("Expecting opening brace {");
    	} else {
    		consumeAndSkipWhitespace(); // consume {
    	}
    	
    	while (currentToken != Token.RC && currentToken != Token.EOF) {
    		if (currentToken != Token.NAME && currentToken != Token.STRING) {
    			reportErrorHere("Expecting a property name (you might have to quote it)");
    			break;
    		}
    		
    		consumeAndSkipWhitespace(); // consume field name
    		if (currentToken != Token.COLON) {
    			if (currentToken == Token.SUB) {
        			reportErrorHere("Property name needs to be quoted");
    				while (currentToken == Token.SUB || currentToken == Token.NAME) {
    					consumeToken();
    				}
    			} else {
    				reportErrorHere("Expecting colon after property name");
    				break;
    			}
    		}
    		
    		consumeAndSkipWhitespace(); // consume colon
    		if (currentToken == Token.EOF) {
    			reportErrorHere("Expecting property value");
    			break;
    		}
    		
    		checkValue();
    		
    		if (currentToken != Token.COMMA) {
    			if (currentToken == Token.STRING || currentToken == Token.NAME) {
        			reportErrorHere("Missing comma before this property name (check the previous line)");
    			} else {
    				break;
    			}
    		} else {
	    		saveLocation();
	    		consumeAndSkipWhitespace();
	    		if (currentToken == Token.RC) {
	    			reportError2("Found trailing comma before closing brace }");
	    			break;
	    		}
    		}
    	}
    	
    	if (currentToken != Token.RC) {
            reportErrorHere("Expecting closing brace }");
    	} else {
    		consumeAndSkipWhitespace();
    	}
    }
    
    protected void checkArray() throws IOException {
    	if (currentToken != Token.LB) {
            reportErrorHere("Expecting opening bracket [");
    	} else {
    		consumeAndSkipWhitespace(); // consume [
    	}
    	
    	while (currentToken != Token.RB && currentToken != Token.EOF) {
    		checkValue();
    		
    		if (currentToken != Token.COMMA) {
    			if (currentToken == Token.RB || currentToken == Token.RC) {
    				break;
    			} else {
        			reportErrorHere("Missing comma before this array element (check the previous line)");
    			}
    		} else {
	    		saveLocation();
	    		consumeAndSkipWhitespace();
	    		if (currentToken == Token.RB) {
	    			reportError2("Found trailing comma before closing bracket ]");
	    			break;
	    		}
    		}
    	}
    	
    	if (currentToken != Token.RB) {
            reportErrorHere("Expecting closing bracket ]");
    	} else {
    		consumeAndSkipWhitespace();
    	}
    }
    
    protected void checkValue() throws IOException {
    	switch (currentToken) {
    	case Token.NUMBER:
    	case Token.STRING:
    	case Token.FALSE:
    	case Token.TRUE:
    		consumeAndSkipWhitespace();
    		break;
    	case Token.LB:
    		checkArray();
    		break;
    	case Token.LC:
    		checkObject();
    		break;
    	default:
			reportErrorHere("Unexpected token");
			consumeAndSkipWhitespace();
    	}
    }
    
    private int lineNumber;
    private int lineOffset;
    private String lineSource;
    protected void saveLocation() {
    	lineNumber = ts.getLineno();
    	lineOffset = ts.getOffset();
    	lineSource = ts.getLine();
    }
    protected void reportError2(String message) {
        errorReporter2.error(message, sourceURI2, lineNumber, lineSource, lineOffset);
    }
    protected void reportErrorHere(String message) {
    	saveLocation();
    	reportError2(message);
    }
    void addWarning(String messageId, String messageArg) {
    	reportErrorHere(ScriptRuntime.getMessage1(messageId, messageArg));
    }
    void addError(String messageId) {
    	reportErrorHere(ScriptRuntime.getMessage0(messageId));
    }
}