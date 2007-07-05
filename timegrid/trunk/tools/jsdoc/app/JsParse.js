/**
 * @fileOverview Find functions in tokenized JavaScript source code.
 * @author Michael Mathews, micmath@gmail.com
 * @revision $Id: JsParse.js 96 2007-07-02 16:23:43Z micmath $
 * @license <a href="http://en.wikipedia.org/wiki/MIT_License">X11/MIT License</a>
 *          (See the accompanying README file for full details.)
 */

/** @constructor */ function JsParse(){};

JsParse.prototype.parse = function(tokenStream) {
	this.scope = ["<global>"]
	/** 
	 * Found symbols in the source stream.
	 * @type Symbol[]
	 */
	this.symbols = [];
	
	/** 
	 * Found overview in the source stream.
	 * @type Symbol
	 */
	this.overview = null;
	
	while(tokenStream.next()) {
		if (this._findDocComment(tokenStream)) continue;
		if (this._findFunction(tokenStream)) continue;
		if (this._findVariable(tokenStream)) continue;
	}
}

JsParse.prototype._findDocComment = function(ts) { /*dbg*///print("_findDocComment "+ts.look());
	// like /** @alias foo.bar */
	if (ts.look().is("JSDOC")) {
		var doc = ts.look().data;
		if (/@(projectdescription|(file)?overview)\b/i.test(doc)) {
			this.overview = doc.replace(RegExp.$1, "overview"); // synonym
			ts.array[ts.cursor] = new Token("\n", "WHIT", "NEWLINE");
			return true;
		}
		else if (/@name\s+([a-z0-9_$.]+)\s*/i.test(doc)) {
			this.symbols.push(
				new Symbol(RegExp.$1, [], SYM.VIRTUAL, doc)
			);
			ts.array[ts.cursor] = new Token("\n", "WHIT", "NEWLINE");
			return true;
		}
		else if (/@scope\s+([a-z0-9_$.]+)\s*/i.test(doc)) {
			var scope = RegExp.$1;
			if (!scope) return false;
			this._onObLiteral(scope, new TokenStream(ts.balance("LEFT_CURLY")));
			return true;
		}
	}
	return false;
}

JsParse.prototype._findFunction = function(ts) { /*dbg*///print("_findFunction "+ts.look());
	if (ts.look().is("NAME")) {
		var name = ts.look().data;
		var doc = "";
		var isa = null;
		var body = "";
		var paramTokens = [];
		var params = [];
		
		// like function foo()
		if (ts.look(-1).is("FUNCTION")) {
			isa = SYM.FUNCTION;
			
			if (ts.look(-2).is("JSDOC")) {
				doc = ts.look(-2).data;
			}
			paramTokens = ts.balance("LEFT_PAREN");
			body = ts.balance("LEFT_CURLY");
		}
		
		// like var foo = function()
		else if (ts.look(1).is("ASSIGN") && ts.look(2).is("FUNCTION")) {
			isa = SYM.FUNCTION;
			
			if (ts.look(-1).is("VAR") && ts.look(-2).is("JSDOC")) {
				doc = ts.look(-2).data;
			}
			else if (ts.look(-1).is("JSDOC")) {
				doc = ts.look(-1).data;
			}
			paramTokens = ts.balance("LEFT_PAREN");
			body = ts.balance("LEFT_CURLY");
			
			// like foo = function(n) {return n}(42)
			if (ts.look(1).is("LEFT_PAREN")) {
				isa = SYM.OBJECT;
				ts.balance("LEFT_PAREN");
				if (doc) { // we only grab these if they are documented
					this.symbols.push(
						new Symbol(name, [], isa, doc)
					);
				}
				this._onFnBody(name, new TokenStream(body));
				return true;
			}
		}
		
		// like var foo = new function()
		else if (ts.look(1).is("ASSIGN") && ts.look(2).is("NEW") && ts.look(3).is("FUNCTION")) {
			isa = SYM.OBJECT;
			
			if (ts.look(-1).is("VAR") && ts.look(-2).is("JSDOC")) {
				doc = ts.look(-2).data;
			}
			else if (ts.look(-1).is("JSDOC")) {
				doc = ts.look(-1).data;
			}
			
			paramTokens = ts.balance("LEFT_PAREN");
			body = ts.balance("LEFT_CURLY");
			if (doc) { // we only grab these if they are documented
				this.symbols.push(
					new Symbol(name, [], isa, doc)
				);
			}
			this._onFnBody(name, new TokenStream(body));
			return true;
		}
		
		if (isa && name) {
			if (isa == SYM.FUNCTION) {
				for (var i = 0; i < paramTokens.length; i++) {
					if (paramTokens[i].is("NAME"))
						params.push(paramTokens[i].data);
				}
			}
			
			// like Foo.bar.prototype.baz = function() {}
			if (name.indexOf(".prototype") > 0) {
				isa = SYM.FUNCTION;
				name = name.replace(/\.prototype\.?/, "/");
			}
			
			this.symbols.push(
				new Symbol(name, params, isa, doc)
			);
			
			if (body) {
				this._onFnBody(name, new TokenStream(body));
			}
			return true;
		}
	}
	return false;
}

JsParse.prototype._findVariable = function(ts) { /*dbg*///print("_findVariable  "+ts.look());
	if (ts.look().is("NAME") && ts.look(1).is("ASSIGN")) {
		// like var foo = 1
		var name = ts.look().data;
	
		if (name.indexOf(".prototype") > 0) {
			name = name.replace(/\.prototype\.?/, "/");
		}
					
		var doc;
		if (ts.look(-1).is("JSDOC")) doc = ts.look(-1).data;
		else if (ts.look(-1).is("VAR") && ts.look(-2).is("JSDOC")) doc = ts.look(-2).data;

		if (doc) { // we only grab these if they are documented
			this.symbols.push(
				new Symbol(name, [], SYM.OBJECT, doc)
			);
		}
		
		// like foo = {
		if (ts.look(2).is("LEFT_CURLY")) {
			var literal = ts.balance("LEFT_CURLY");
			this._onObLiteral(name, new TokenStream(literal));
		}
		return true;
	}
	return false;
}

JsParse.prototype._onObLiteral = function(nspace, ts) { /*dbg*///print("_onObLiteral("+nspace+", "+ts+")");
	while (ts.next()) {
		if (this._findDocComment(ts)) {
		
		}
		else if (ts.look().is("NAME") && ts.look(1).is("COLON")) {
			var name = nspace+((nspace.charAt(nspace.length-1)=="/")?"":".")+ts.look().data;
			
			// like foo: function
			if (ts.look(2).is("FUNCTION")) {
				var isa = SYM.FUNCTION;
				var doc = "";
				
				if (ts.look(-1).is("JSDOC")) doc = ts.look(-1).data;
				
				var paramTokens = ts.balance("LEFT_PAREN");
				var params = [];
				for (var i = 0; i < paramTokens.length; i++) {
					if (paramTokens[i].is("NAME"))
						params.push(paramTokens[i].data);
				}
				
				var body = ts.balance("LEFT_CURLY");

				this.symbols.push(
					new Symbol(name, params, isa, doc)
				);
				
				// find methods in the body of this function
				this._onFnBody(name, new TokenStream(body));
			}
			// like foo: {...}
			else if (ts.look(2).is("LEFT_CURLY")) { // another nested object literal
				if (ts.look(-1).is("JSDOC")) {
					var isa = SYM.OBJECT;
					var doc = ts.look(-1).data;

					this.symbols.push(
						new Symbol(name, [], isa, doc)
					);
				}
				
				this._onObLiteral(name, new TokenStream(ts.balance("LEFT_CURLY"))); // recursive
			}
			else { // like foo: 1, or foo: "one"
				if (ts.look(-1).is("JSDOC")) { // we only grab these if they are documented
					var isa = SYM.OBJECT;
					var doc = ts.look(-1).data;
					
					this.symbols.push(
						new Symbol(name, [], isa, doc)
					);
				}
				
				while (!ts.look().is("COMMA")) { // skip to end of RH value ignoring things like bar({blah, blah})
					if (ts.look().is("LEFT_PAREN")) ts.balance("LEFT_PAREN");
					else if (ts.look().is("LEFT_CURLY")) ts.balance("LEFT_CURLY");
					else if (!ts.next()) break;
				}
			}
		}
	}
}

JsParse.prototype._onFnBody = function(nspace, fs) {
	while (fs.look()) {
		if (this._findDocComment(fs)) {
		
		}
		else if (fs.look().is("NAME") && fs.look(1).is("ASSIGN")) {
			var name = fs.look().data;
			
			// like this.foo =
			if (name.indexOf("this.") == 0) {
				// like this.foo = function
				if (fs.look(2).is("FUNCTION")) {
					var isa = SYM.FUNCTION;
					
					name = name.replace(/^this\./, nspace+"/")
					var doc = (fs.look(-1).is("JSDOC"))? fs.look(-1).data : "";
					
					var paramTokens = fs.balance("LEFT_PAREN");
					var params = [];
					for (var i = 0; i < paramTokens.length; i++) {
						if (paramTokens[i].is("NAME")) params.push(paramTokens[i].data);
					}
					
					body = fs.balance("LEFT_CURLY");

					// like this.foo = function(n) {return n}(42)
					if (fs.look(1).is("LEFT_PAREN")) { // false alarm, it's not really a named function definition
						isa = SYM.OBJECT;
						fs.balance("LEFT_PAREN");
						if (doc) { // we only grab these if they are documented
							this.symbols.push(
								new Symbol(name, [], isa, doc)
							);
						}
						break;
					}

					this.symbols.push(
						new Symbol(name, params, isa, doc)
					);
					
					if (body) {
						this._onFnBody(name, new TokenStream(body)); // recursive
					}
				}
				else {
					var isa = SYM.OBJECT;
					name = name.replace(/^this\./, nspace+"/")
					var doc = (fs.look(-1).is("JSDOC"))? fs.look(-1).data : "";
						
					if (doc) {
						this.symbols.push(
							new Symbol(name, [], isa, doc)
						);
					}
						
					// like this.foo = { ... }
					if (fs.look(2).is("LEFT_CURLY")) {
						var literal = fs.balance("LEFT_CURLY");
						this._onObLiteral(name, new TokenStream(literal));
					}
				}
			}
		}
		if (!fs.next()) break;
	}
}
