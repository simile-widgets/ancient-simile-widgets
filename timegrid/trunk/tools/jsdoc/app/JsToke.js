/**
 * @fileOverview A library for finding the parts of JavaScript source code.
 * @author Michael Mathews micmath@gmail.com
 * @revision $Id: JsToke.js 96 2007-07-02 16:23:43Z micmath $
 * @license <a href="http://en.wikipedia.org/wiki/MIT_License">X11/MIT License</a>
 *          (See the accompanying README file for full details.)
 */

var TOKN = {};
TOKN.WHIT = {
	" ":  "SPACE",
	"\f": "FORMFEED",
	"\t": "TAB",
	"\v": "VERTICAL_TAB"
};
TOKN.NEWLINE = {
	"\u000A": "UNICODE_LF",
	"\u000D": "UNICODE_CR",
	"\n":     "TOKN.NEWLINE",
	"\r":     "RETURN"
};
TOKN.KEYW = {
	"break":      "BREAK",
	"case":       "CASE",
	"catch":      "CATCH",
	"continue":   "CONTINUE",
	"default":    "DEFAULT",
	"delete":     "DELETE",
	"do":         "DO",
	"else":       "ELSE",
	"false":      "FALSE",
	"finally":    "FINALLY",
	"for":        "FOR",
	"function":   "FUNCTION",
	"if":         "IF",
	"in":         "IN",
	"instanceof": "INSTANCEOF",
	"new":        "NEW",
	"null":       "NULL",
	"return":     "RETURN",
	"switch":     "SWITCH",
	"this":       "THIS",
	"throw":      "THROW",
	"true":       "TRUE",
	"try":        "TRY",
	"typeof":     "TYPEOF",
	"void":       "VOID",
	"while":      "WHILE",
	"with":       "WITH",
	"var":        "VAR"
};
TOKN.PUNC = {
	";":   "SEMICOLON",
	",":   "COMMA",
	"?":   "HOOK",
	":":   "COLON",
	"||":  "OR", 
	"&&":  "AND",
	"|":   "BITWISE_OR",
	"^":   "BITWISE_XOR",
	"&":   "BITWISE_AND",
	"===": "STRICT_EQ", 
	"==":  "EQ",
	"=":   "ASSIGN",
	"!==": "STRICT_NE",
	"!=":  "NE",
	"<<":  "LSH",
	"<=":  "LE", 
	"<":   "LT",
	">>>": "URSH",
	">>":  "RSH",
	">=":  "GE",
	">":   "GT", 
	"++":  "INCREMENT",
	"--":  "DECREMENT",
	"+":   "PLUS",
	"-":   "MINUS",
	"*":   "MUL",
	"/":   "DIV", 
	"%":   "MOD",
	"!":   "NOT",
	"~":   "BITWISE_NOT",
	".":   "DOT",
	"[":   "LEFT_BRACKET",
	"]":   "RIGHT_BRACKET",
	"{":   "LEFT_CURLY",
	"}":   "RIGHT_CURLY",
	"(":   "LEFT_PAREN",
	")":   "RIGHT_PAREN" 
};
TOKN.MATCHING = {
	"LEFT_PAREN": "RIGHT_PAREN",
	"LEFT_CURLY": "RIGHT_CURLY",
	"LEFT_BRACE": "RIGHT_BRACE"
};
TOKN.NUMB    = /^(\.[0-9]|[0-9]+\.|[0-9])[0-9]*([eE][+-][0-9]+)?$/i;
TOKN.HEX_DEC = /^0x[0-9A-F]+$/i;

String.prototype.isWordChar = function() {
	return /^[a-zA-Z0-9$_.]+$/.test(this);
}
String.prototype.isNewline = function() {
	return (typeof TOKN.NEWLINE[this] != "undefined")
}
String.prototype.isSpace = function() {
	return (typeof TOKN.WHIT[this] != "undefined");
}
String.prototype.last = function() {
	return this.charAt[this.length-1];
}

/**
 * Extends built-in Array under a new name.
 * @constructor 
 */
var List = function() {
    that = Array.apply(this, arguments);
	/**
	 * @name last
	 * @function
	 * @memberOf List
	 */
    that.last = function() {
    	return this[this.length-1];
    }
    return that;
}

/** @constructor */
function Token(data, type, name) {
    this.data = data;
    this.type = type;
	this.name = name;
}
Token.prototype.toString = function() { 
    return "<"+this.type+" name=\""+this.name+"\">"+this.data+"</"+this.type+">";
}
Token.prototype.is = function(what) {
    return this.name === what || this.type === what;
}

/** @constructor */
function TextStream(text) {
	this.text = text;
	this.cursor = 0;
}
TextStream.prototype.look = function(n) {
	if (typeof n == "undefined") n = 0;
	
	if (this.cursor+n < 0 || this.cursor+n >= this.text.length) {
		var result = new String("");
		result.eof = true;
		return result;
	}
	return this.text.charAt(this.cursor+n);
}
TextStream.prototype.next = function(n) {
	if (typeof n == "undefined") n = 1;
	if (n < 1) return null;
	
	var pulled = "";
	for (var i = 0; i < n; i++) {
		if (this.cursor+i < this.text.length) {
			pulled += this.text.charAt(this.cursor+i);
		}
		else {
			var result = new String("");
			result.eof = true;
			return result;
		}
	}

	this.cursor += n;
	return pulled;
}

/** @constructor */
function TokenReader(src){
	this.src = src;
};
TokenReader.prototype.tokenize = function() {
	var stream = new TextStream(this.src);
	var tokens = new List();
	
	while (!stream.look().eof) {
		if (this.read_mlcomment(stream, tokens)) continue;
		if (this.read_slcomment(stream, tokens)) continue;
		if (this.read_dbquote(stream, tokens)) continue;
		if (this.read_snquote(stream, tokens)) continue;
		if (this.read_regx(stream, tokens)) continue;
		if (this.read_numb(stream, tokens)) continue;
		if (this.read_punc(stream, tokens)) continue;
		if (this.read_space(stream, tokens)) continue;
		if (this.read_newline(stream, tokens)) continue;
		if (this.read_word(stream, tokens)) continue;
		
		tokens.push(new Token(stream.next(), "TOKN", "UNKNOWN_TOKEN")); // This is an error case.
	}
	return tokens;
}
TokenReader.prototype.read_word = function(stream, tokens) { /*debug*///print("> read_word");
	var found = "";
	while (!stream.look().eof && stream.look().isWordChar()) {
		found += stream.next();
	}
	
	if (found === "") {
		return false;
	}
	else {
		var name;
		if ((name = TOKN.KEYW[found])) tokens.push(new Token(found, "KEYW", name));
		else tokens.push(new Token(found, "NAME", "NAME"));
		return true;
	}
}
TokenReader.prototype.read_punc = function(stream, tokens) { /*debug*///print("> read_punc");
	var found = "";
	var name;
	while (!stream.look().eof && TOKN.PUNC[found+stream.look()]) {
		found += stream.next();
	}
	
	if (found === "") {
		return false;
	}
	else {
		tokens.push(new Token(found, "PUNC", TOKN.PUNC[found]));
		return true;
	}
}
TokenReader.prototype.read_space = function(stream, tokens) { /*debug*///print("> read_space");
	var found = "";
	
	while (!stream.look().eof && stream.look().isSpace()) {
		found = " "; // collapse multiples
		stream.next();
	}
	
	if (found === "") {
		return false;
	}
	else {
		// don't keep
		//tokens.push(new Token(found, "TOKN.WHIT", "SPACE"));
		return true;
	}
}
TokenReader.prototype.read_newline = function(stream, tokens) { /*debug*///print("> read_newline");
	var found = "";
	
	while (!stream.look().eof && stream.look().isNewline()) {
		found = "\n"; // collapse multiples
		stream.next();
	}
	
	if (found === "") {
		return false;
	}
	else {
		tokens.push(new Token(found, "WHIT", "NEWLINE"));
		return true;
	}
}
TokenReader.prototype.read_mlcomment = function(stream, tokens) { /*debug*///print("> read_mlcomment");
	if (stream.look() == "/" && stream.look(1) == "*") {
		var found = stream.next(2);
		
		while (!stream.look().eof && !(stream.look(-1) == "/" && stream.look(-2) == "*")) {
			found += stream.next();
		}
		
		if (/^\/\*\*[^*]/.test(found)) tokens.push(new Token(found, "COMM", "JSDOC"));
		else if (this.keepComments) tokens.push(new Token(found, "COMM", "MULTI_LINE_COMM"));
		return true;
	}
	return false;
}
TokenReader.prototype.read_slcomment = function(stream, tokens) { /*debug*///print("> read_slcomment");
	var found;
	if (
		(stream.look() == "/" && stream.look(1) == "/" && (found=stream.next(2)))
		|| 
		(stream.look() == "<" && stream.look(1) == "!" && stream.look(2) == "-" && stream.look(3) == "-" && (found=stream.next(4)))
	) {
		
		while (!stream.look().eof && !stream.look().isNewline()) {
			found += stream.next();
		}
		
		if (this.keepComments) {
			tokens.push(new Token(found, "COMM", "SINGLE_LINE_COMM"));
		}
		return true;
	}
	return false;
}
TokenReader.prototype.read_dbquote = function(stream, tokens) { /*debug*///print("> read_dbquote");
	if (stream.look() == "\"") {
		// find terminator
		var string = stream.next();
		
		while (!stream.look().eof) {
			if (stream.look() == "\\") { /*debug*///print("> escape sequence ");
				if (stream.look(1).isNewline()) {
					do {
						stream.next();
					} while (!stream.look().eof && stream.look().isNewline());
					string += "\\\n";
				}
				else {
					string += stream.next(2);
				}
			}
			else if (stream.look() == "\"") {
				string += stream.next();
				tokens.push(new Token(string, "STRN", "DOUBLE_QUOTE"));
				return true;
			}
			else {
				string += stream.next();
			}
		}
	}
	return false; // error! unterminated string
}
TokenReader.prototype.read_snquote = function(stream, tokens) { /*debug*///print("> read_snquote");
	if (stream.look() == "'") {
		// find terminator
		var string = stream.next();
		
		while (!stream.look().eof) {
			if (stream.look() == "\\") { // escape sequence
				string += stream.next(2);
			}
			else if (stream.look() == "'") {
				string += stream.next();
				tokens.push(new Token(string, "STRN", "SINGLE_QUOTE"));
				return true;
			}
			else {
				string += stream.next();
			}
		}
	}
	return false; // error! unterminated string
}
TokenReader.prototype.read_numb = function(stream, tokens) { /*debug*///print("> read_numb \n");
	if (stream.look() === "0" && stream.look(1) == "x") {
		return this.read_hex(stream, tokens);
	}
	
	var found = "";
	
	while (!stream.look().eof && TOKN.NUMB.test(found+stream.look())){
		found += stream.next();
	}
	
	if (found === "") {
		return false;
	}
	else {
		if (/^0[0-7]/.test(found)) tokens.push(new Token(found, "NUMB", "OCTAL"));
		else tokens.push(new Token(found, "NUMB", "DECIMAL"));
		return true;
	}
}
TokenReader.prototype.read_hex = function(stream, tokens) { /*debug*///print("> read_hex\n");
	var found = stream.next(2);
	
	while (!stream.look().eof) {
		if (TOKN.HEX_DEC.test(found) && !TOKN.HEX_DEC.test(found+stream.look())) { // done
			tokens.push(new Token(found, "NUMB", "HEX_DEC"));
			return true;
		}
		else {
			found += stream.next();
		}
	}
	return false;
}
TokenReader.prototype.read_regx = function(stream, tokens) { /*debug*///print("> read_regx");
	if (stream.look() == "/" 
	 && !tokens.last().is("NUMB")
	 && !tokens.last().is("NAME")
	 && !tokens.last().is("RIGHT_PAREN")
	 && !tokens.last().is("RIGHT_BRACKET")
	) {
		var regex = stream.next();
		
		while (!stream.look().eof) {
			if (stream.look() == "\\") { // escape sequence
				regex += stream.next(2);
			}
			else if (stream.look() == "/") {
				regex += stream.next();
				
				while (/[gmi]/.test(stream.look())) {
					regex += stream.next();
				}
				
				tokens.push(new Token(regex, "REGX", "REGX"));
				return true;
			}
			else {
				regex += stream.next();
			}
		}
		// error: unterminated regex
	}
	return false;
}

/** @constructor */
function TokenStream(array) {
	this.array = array;
	this.cursor = -1;
}

TokenStream.prototype.look = function(n, considerWhitespace) {
	if (typeof n == "undefined") n = 0;

	if (considerWhitespace == true) {
		if (this.cursor+n < 0 || this.cursor+n > this.array.length) return {};
		return this.array[this.cursor+n];
	}
	else {
		var count = 0;
		var i = this.cursor;
		var voidToken = {is: function(){return false;}}
		while (true) {
			if (i < 0 || i > this.array.length) return voidToken;
			if (i != this.cursor && (this.array[i] === undefined || this.array[i].is("SPACE") || this.array[i].is("NEWLINE"))) {
				if (n < 0) i--; else i++;
				continue;
			}
			
			if (count == Math.abs(n)) {
				return this.array[i];
			}
			count++;
			(n < 0)? i-- : i++;
		}
		return voidToken; // because null isn't an object and caller always expects an object
	}
};
TokenStream.prototype.next = function(howMany) {
	if (typeof howMany == "undefined") howMany = 1;
	if (howMany < 1) return null;
	var got = [];

	for (var i = 1; i <= howMany; i++) {
		if (this.cursor+i >= this.array.length) {
			return null;
		}
		got.push(this.array[this.cursor+i]);
	}
	this.cursor += howMany;

	if (howMany == 1) {
		return got[0];
	}
	else return got;
};
TokenStream.prototype.balance = function(start, stop) {
	if (!stop) stop = TOKN.MATCHING[start];
	
	var depth = 0;
	var got = [];
	var started = false;
	
	while ((token = this.look())) {
		if (token.is(start)) {
			depth++;
			started = true;
		}
		
		if (started) {
			got.push(token);
		}
		
		if (token.is(stop)) {
			depth--;
			if (depth == 0) return got;
		}
		if (!this.next()) break;
	}
};