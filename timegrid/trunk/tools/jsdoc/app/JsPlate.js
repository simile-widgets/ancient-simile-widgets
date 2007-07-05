/**
 * @fileOverview A lightweight template engine for JavaScript.
 * @author Michael Mathews, micmath@gmail.com
 * @revision $Id: JsPlate.js 27 2007-06-15 22:29:53Z micmath $
 * @license <a href="http://en.wikipedia.org/wiki/MIT_License">X11/MIT License</a>
 *          (See the accompanying README file for full details.)

 */

 /** @constructor */
JsPlate = function(template) {
	this.template = IO.readFile(template);

	this.code = "";
	this.parse();
}

JsPlate.prototype.parse = function() {
	this.template = this.template.replace(/\{#[\s\S]+?#\}/gi, "");
	this.code = "var output=``"+this.template;

	this.code = this.code.replace(
		/<for each="(.+?)" in="(.+?)"(?: sortby="(.+?)")?>/g, 
		function (match, eachName, inName, sortby) {
			if (!sortby) sortby = "asis";
			
			return "``; var $"+eachName+"_keys = "+sortby+"("+inName+"); for(var $"+eachName+"_i = 0; $"+eachName+"_i < $"+eachName+"_keys.length; $"+eachName+"_i++) { var $"+eachName+"_last = ($"+eachName+"_i == $"+eachName+"_keys.length-1); var $"+eachName+"_key = $"+eachName+"_keys[$"+eachName+"_i]; var "+eachName+" = "+inName+"[$"+eachName+"_key]; output+=``";
		}
	);	
	this.code = this.code.replace(/<if test="(.+?)">/g, "``; if ($1) { output+=``");
	this.code = this.code.replace(/<\/(if|for)>/g, "``; }; output+=``");
	this.code = this.code.replace(
		/\{\+\s*([\s\S]+?)\s*\+\}/gi,
		function (match, code) {
			code = code.replace(/"/g, "``"); // prevent qoute-escaping of inline code
			code = code.replace(/(\r?\n)/g, " ");
			return "``+"+code+"+``";
		}
	);
	this.code = this.code.replace(
		/\{!\s*([\s\S]+?)\s*!\}/gi,
		function (match, code) {
			code = code.replace(/"/g, "``"); // prevent qoute-escaping of inline code
			code = code.replace(/(\r?\n)/g, " ");
			return "``; "+code+"; output+=``";
		}
	);
	this.code = this.code+"``;";

	this.code = this.code.replace(/(\r?\n)/g, "\\n");
	this.code = this.code.replace(/"/g, "\\\"");
	this.code = this.code.replace(/``/g, "\"");
}

JsPlate.prototype.toCode = function() {
	return this.code;
}

JsPlate.keys = function(obj) {
	var keys = [];
	if (obj.constructor.toString().indexOf("Array") > -1) {
		for (var i = 0; i < obj.length; i++) keys.push(i);
	}
	else {
		for (var i in obj) { keys.push(i); }
	}
	return keys.sort();
};

JsPlate.values = function(obj) {
	var values = [];
	if (obj.constructor.toString().indexOf("Array") > -1) {
		for (var i = 0; i < obj.length; i++) values.push(obj[i]);
	}
	else {
		for (var i in obj) { values.push(obj[i]); }
	}
	return values.sort();
};

JsPlate.asis = function(obj) {
	var keys = [];
	if (obj.constructor.toString().indexOf("Array") > -1) {
		for (var i = 0; i < obj.length; i++) keys.push(i);
	}
	else {
		for (var i in obj) { keys.push(i); }
	}
	return keys;
};

JsPlate.prototype.process = function(data) {
	var keys = JsPlate.keys;
	var values = JsPlate.values;
	var asis = JsPlate.asis;
	eval(this.code);
	return output;
	//print(this.code)
}