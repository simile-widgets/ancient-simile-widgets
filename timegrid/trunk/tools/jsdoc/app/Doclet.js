/**
 * @projectDescription Represents a collection of doclet tags.
 * @name Doclet
 * @author Michael Mathews <a href="mailto:micmath@gmail.com">micmath@gmail.com</a>
 * @license <a href="http://en.wikipedia.org/wiki/MIT_License" target="_blank">X11/MIT License</a>
 *          (See the accompanying README file for full details.)
 */
 
/**
 * @constructor
 * @param {string} comment The entire documentation comment. The openening slash-star-star and closing star-slash are optional. An untagged string at the start automatically gets a "desc" tag.
 */
function Doclet(comment) {
	if (!comment) comment = "/** undocumented */";

	var src = comment.replace(/(^\/\*\*|\*\/$)/g, "").replace(/^\s*\* ?/gm, "");
	if (src.match(/^\s*[^@\s]/)) src = "@desc "+src;
	
	var tagTexts = src.split(/(^|[\r\f\n])\s*@/);
	
	this.tags = [];
	for (var i = 0; i < tagTexts.length; i++) {
		if (!tagTexts[i].match(/^\w/)) continue; // may have empty elements on some platforms
		this.tags.push(new DocTag(tagTexts[i]));
	}
}

/**
 * Get every DocTag with the given title.
 * @param {string} tagTitle
 * @return {array}
 */
Doclet.prototype.getTag = function(tagTitle) {
	var result = [];
	
	if (tagTitle) {
		for (var i = 0; i < this.tags.length; i++) {
			if (this.tags[i].title == tagTitle) {
				result.push(this.tags[i]);
			}
		}
	}
	
	return result;
}

/*
 * Remove from this Doclet every DocTag with the given title.
 * @param {string} tagTitle
 */
Doclet.prototype._dropTag = function(tagTitle) {
	var keep = [];
	for (var i = 0; i < this.tags.length; i++) {
		if (this.tags[i].title != tagTitle) {
			keep.push(this.tags[i]);
		}
	}
	this.tags = keep;
}
