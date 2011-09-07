/**
 * Edit integer number.  If a string is passed as the value, an attempt will be made 
 * to parse it as an integer.  A value of 'undefined' is assumed to mean the value 
 * (object) is missing from the item (subject).  An undefined value is presented 
 * for editing as an empty string.  An empty string will treated as undefined when 
 * saving an item back to the database, and as such the property/value will not be 
 * stored.
 *
 * ex:type="text" 
 * ex:content=".<prop>"
 * ex:validators="<list>"
 *
 * css class: exhibitDataEditNumberField
 */
 
/* ========================================================================
 * Constructor
 * ======================================================================== */
Exhibit.DataEdit.Editor.NumberField = function(jq,iid,pid,val) {
	this._jqThis = jq;			// jQuery for original DOM element <input>
	this._itemId = iid;			// Database item (subject) id
	this._propId = pid;			// Database property (predicate)
	this._value = val;			// <number>
	this._divId = '__DATAEDITOR__'+this._propId;
	this._validators = null;
	this._matchDisplayLens = false; // No editor lens?  Try to find into display lens

	// Clean up
	if(this._value==undefined) { this._value = ""; }
	// Check
	if((typeof this._value)!='number') {
		if((typeof(this._value)=='string') && (this._value.match(/^-?[0-9]*$/))) {
			this._value = parseInt(this._value);  // Attempt string-->number
		} else {
			throw "Invalid data for NumberField";
		}
	}
}

/** Create component HTML. */
Exhibit.DataEdit.Editor.NumberField.prototype.getHTML = function(onShow) {
	var style = null;
	if(this._matchDisplayLens) {
		style = Exhibit.DataEdit.Editor._extractStyle(this._jqThis) +
			'border-width: 0px; '+
			'width: '+$(this._jqThis).width()+'px; height: '+$(this._jqThis).height()+'px; ';
	}
	var tag = Exhibit.DataEdit.Editor._htmlTag(
		'input',
		{ 'id':this._divId , 'style':style , 'class':'exhibitDataEditNumberField' , 'type':'Text' , 'value':this._value } ,
		$(this._jqThis).get()[0] ,
		true
	);
	return tag;
}

/** Get value -- empty is assumed to be undefined. */
Exhibit.DataEdit.Editor.NumberField.prototype.getValue = function() {
	var els = $('#'+this._divId).get();
	if(els.length) { 
		return (els[0].value!="") ? els[0].value : undefined ;
	} else {
		return undefined;
	}
}
/** Set value. */
Exhibit.DataEdit.Editor.NumberField.prototype.setValue = function(v) {
	var els = $('#'+this._divId).get();
	if(els.length) { els[0].value = v+""; }
}
/** Show error (?) */
Exhibit.DataEdit.Editor.NumberField.prototype.setError = function(b) {
	$('#'+this._divId).css('background-color' , b?Exhibit.DataEdit.Editor._ERRCOL_:Exhibit.DataEdit.Editor._BGCOL_);
}


/* ======================================================================== 
 * Statics
 * ======================================================================== */
/** Run a function, f, on each element representing <input ex:type="number">. */
Exhibit.DataEdit.Editor.NumberField.domFilter = function(jqThis,f) {
	$('input',jqThis)
		.filter(function(idx) { return $(this).attr("ex:type")=="number"; })
			.each(f);
}