/** 
 * @constructor
 * @type MyObject
 */
function ConsoleWriter(winId){
	/** @type String */
	this.winId = winId;
}

/** @type number */ var gCounter = 0;

/**
 * Reference to form element(s) of the ColumnEditor.
 *
 * @type 	  HTMLElement
 			| HTMLElement[]
 			| null
 */
Kudzoo.widget.editor.input = null;

/**
 * @type FontDef||String
 */
Kudzoo.widget.editor.font = null;

/**
 * @type { number ,  sizeDef}
 */
Kudzoo.widget.editor.margin = null;