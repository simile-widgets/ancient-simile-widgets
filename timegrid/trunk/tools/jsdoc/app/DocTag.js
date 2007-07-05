/** @constructor */
function DocTag(src) {
	this.title = "";
	this.name = "";
	this.type = "";
	this.desc = "";
	
	if (typeof(src) != "undefined") {
		// like @title {type} name/desc
		var parts = src.match(/^(\S+)(?:\s+\{\s*([\S\s]+?)\s*\})?\s*([\S\s]*\S)?/);
		
		this.title = (parts[1].toLowerCase() || "");
		this.type = (parts[2] || "");
	
		if (this.type) this.type = this.type.replace(/\s*(,|\|\|?)\s*/g, ", ");
		this.desc = (parts[3] || "");
		
		if (this.title == "type") {
			if (this.type) this.desc = this.type;
			if (this.desc) {
				this.desc = this.desc.replace(/\s*(,|\|\|?)\s*/g, ", ");
			}
		}
		
		// tag synonyms here
		if (this.title == "member") this.title = "memberof";
		else if (this.title == "description") this.title = "desc";
		else if (this.title == "exception") this.title = "throws";
		else if (this.title == "class") this.title = "constructor";
		
		if (this.desc) {
			if (this.title == "param") { // long tags like {type} [name] desc
				var m = this.desc.match(/^\s*(\[?)([a-zA-Z0-9.$_]+)(\]?)(?:\s+([\S\s]*\S))?/);
				if (m) {
					this.isOptional = (!!m[1] && !!m[3]); // bracketed name means optional
					this.name = (m[2] || "");
					this.desc = (m[4] || "");
				}
			}
			else if (this.title == "property") {
				m = this.desc.match(/^\s*([a-zA-Z0-9.$_]+)(?:\s+([\S\s]*\S))?/);
				if (m) {
					this.name = (m[1] || "");
					this.desc = (m[2] || "");
				}
			}
		}
	}
}

DocTag.prototype.toString = function() {
	return this.desc;
}
