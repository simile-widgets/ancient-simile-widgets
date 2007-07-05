SYM = {
	OBJECT:			"OBJECT",
	FUNCTION:		"FUNCTION",
	CONSTRUCTOR:	"CONSTRUCTOR",
	VIRTUAL:		"VIRTUAL",
};

/** @constructor */
function Symbol(name, params, isa, comment) {
	this.name = name;
	this.params = (params || []);
	this.isa = (isa || SYM.OBJECT);
	this.type = "";
	this.alias = name;
	this.desc = "";
	this.memberof = "";
	this.properties = [];
	this.methods = [];
	this.returns = [];
	this.exceptions = [];
	this.doc = new Doclet(comment);
	
	// move certain data out of the tags and into the Symbol
	var overviews;
	if ((overviews = this.doc.getTag("overview")) && overviews.length) {
		var libraries;
		if ((libraries = this.doc.getTag("name")) && libraries.length) {
			this.name = libraries[0].desc;
			this.doc._dropTag("name");
		}
		else {
			this.name = Util.fileName(this.alias)
		}
		
		this.desc = overviews[0].desc;
		this.doc._dropTag("overview");
	}
	else {
		var descs;
		if ((descs = this.doc.getTag("desc")) && descs.length) {
			this.desc = descs[0].desc;
			this.doc._dropTag("desc");
		}
		
		var params;
		if ((params = this.doc.getTag("param")) && params.length) { // user defined params override those defined by parser
			this.params = params;
			this.doc._dropTag("param");
		}
		else { // promote parser params into DocTag objects
			for (var i = 0; i < this.params.length; i++) {
				this.params[i] = new DocTag("param "+this.params[i]);
			}
		}
		
		var constructors;
		if ((constructors = this.doc.getTag("constructor")) && constructors.length) {
			this.isa = SYM.CONSTRUCTOR;
			this.doc._dropTag("constructor");
		}
		
		var functions;
		if ((functions = this.doc.getTag("function")) && functions.length) {
			this.isa = SYM.FUNCTION;
			this.doc._dropTag("function");
		}
		
		var methods;
		if ((functions = this.doc.getTag("method")) && functions.length) {
			this.isa = SYM.FUNCTION;
			this.doc._dropTag("method");
		}
		
		var names;
		if ((names = this.doc.getTag("name")) && names.length) {
			this.name = names[0].desc;
			this.doc._dropTag("name");
		}
		
		var properties;
		if ((properties = this.doc.getTag("property")) && properties.length) {
			for (var i = 0; i < properties.length; i++) {
				properties[i].alias = this.alias+"."+properties[i].name;
				this.properties.push(properties[i]);
			}
			this.doc._dropTag("property");
		}
		
		var returns;
		if ((returns = this.doc.getTag("return")) && returns.length) {
			for (var i = 0; i < returns.length; i++) {
				this.returns.push(returns[i]);
			}
			this.doc._dropTag("return");
		}

		var exceptions;
		if ((exceptions = this.doc.getTag("throws")) && exceptions.length) {
			for (var i = 0; i < exceptions.length; i++) {
				this.exceptions.push(exceptions[i]);
			}
			this.doc._dropTag("throws");
		}
		
		if (this.is("VIRTUAL")) this.isa = SYM.OBJECT;
		
		var types;
		if ((types = this.doc.getTag("type")) && types.length) {
			if (this.is("OBJECT"))
				this.type = (types[0].desc || ""); // multiple type tags are ignored
			this.doc._dropTag("type");
		}
	}
	
}

Symbol.prototype.is = function(what) {
    return this.isa === SYM[what];
}

Symbol.prototype.signature = function() {
    var result = [];
    for (var i = 0; i < this.params.length; i++) {
    	result.push(this.params[i].name);
    }
    return result.join(", ");
}