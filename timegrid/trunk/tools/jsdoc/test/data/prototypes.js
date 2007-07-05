// prototypes

/** @constructor */
function Article() {
}

Article.prototype = {
	/** Get the title. */
	getTitle: function(){
	}
}

var Word = function(){}
Word.prototype = String.prototype;

/** @constructor */
function Paragraph(text){
	
}
/** The lines of text. */
Paragraph.prototype.lines = []
/** Get the lines. */
Paragraph.prototype.getLines = function() {
	
}