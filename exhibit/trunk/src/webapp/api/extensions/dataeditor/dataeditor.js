/*
 * Data editor extension for Simile Exhibit (aka Felix2, codename 'Tigger').
 *    "But whatever his weight in pounds, shillings, and ounces, 
 *     He always seems bigger because of the bounces"
 *
 * Initial version developed by the Ensemble Project at Liverpool JMU.
 */

/* ========================================================================
 * Includes
 * ======================================================================== */
var __DATAEDITOR_BASE__ = null;
$("script").each(function(idx) {
	var el = $(this).get()[0];
	var reg = /\/dataeditor.js$/;
	if(el!=undefined && el.src!=undefined) {
		if(el.src.match(reg)) { __DATAEDITOR_BASE__ = el.src.replace(reg,"\/"); }
	}
});
if(__DATAEDITOR_BASE__ == null) { SimileAjax.Debug.warn("Cannot find base location for scripts."); }
// jQuery
SimileAjax.includeJavascriptFile(document,__DATAEDITOR_BASE__+"jquery_ui/js/jquery-1.6.2.min.js");  // Apparently this version is needed!
/*SimileAjax.includeJavascriptFile(document,__DATAEDITOR_BASE__+"jquery_ui/js/jquery-ui-1.8.15.custom.min.js");
SimileAjax.includeCssFile(document,__DATAEDITOR_BASE__+"jquery_ui/css/ui-lightness/jquery-ui-1.8.15.custom.css");*/
SimileAjax.includeJavascriptFile(document,__DATAEDITOR_BASE__+"jquery_ui/js/jquery-ui-1.8.16.custom.min.js");
SimileAjax.includeCssFile(document,__DATAEDITOR_BASE__+"jquery_ui/css/overcast/jquery-ui-1.8.16.custom.css");
// DataEdit
SimileAjax.includeJavascriptFile(document,__DATAEDITOR_BASE__+"Editor.js");
SimileAjax.includeJavascriptFile(document,__DATAEDITOR_BASE__+"TextField.js");
SimileAjax.includeJavascriptFile(document,__DATAEDITOR_BASE__+"NumberField.js");
SimileAjax.includeJavascriptFile(document,__DATAEDITOR_BASE__+"EnumField.js");
SimileAjax.includeJavascriptFile(document,__DATAEDITOR_BASE__+"ListField.js");
SimileAjax.includeCssFile(document,__DATAEDITOR_BASE__+"dataedit.css");
delete __DATAEDITOR_BASE__;


/* ========================================================================
 * Constructor
 * ======================================================================== */
Exhibit.DataEdit = function() {}

/** Class used to find Edit/Save Boxes added to lens */
Exhibit.DataEdit.EDIT_DIV = "exhibitDataEditBar";
Exhibit.DataEdit.EDIT_BUTTON = "exhibitDataEditButton";
Exhibit.DataEdit.EDIT_MESSAGE = "exhibitDataEditError";

/** Database mutation modes. */
Exhibit.DataEdit.CREATE_MODE = 1;
Exhibit.DataEdit.UPDATE_MODE = 2;
Exhibit.DataEdit.DELETE_MODE = 3;

/** Debug mode? */
Exhibit.DataEdit._DEBUG_ = false;

/** Editor lock -- prevent editor from being invoked when already open. */
Exhibit.DataEdit._lock_ = false;
/** Currently active editors. */
Exhibit.DataEdit._editors_ = null;

/** STEP1: Switch to edit mode. */
Exhibit.DataEdit.activate = function() {
	var self = this;
	// Locked?  Cancel.
	if(Exhibit.DataEdit._lock_) { 
		Exhibit.DataEdit._cancel_();
		Exhibit.DataEdit._lock_ = false;
		return;
	}
	Exhibit.DataEdit._lock_ = true;
	// Editors
	Exhibit.DataEdit._editors_ = {};
	// Go through each ex:itemid, appending an [Edit] button
	var filter = function(idx) { return $(this).attr("ex:itemid"); }
	$('*').filter(filter).each(function(idx) {  // See http://bugs.jquery.com/ticket/3729
		var id = $(this).attr("ex:itemid");
		// Add [edit]
		$(this).append(
			'<div class="'+Exhibit.DataEdit.EDIT_DIV+'">'+
			'<div class="'+Exhibit.DataEdit.EDIT_BUTTON+'">'+
			'<a href="javascript:Exhibit.DataEdit._edit_(\''+id+'\')">Edit</a>'+
			'</div>'+
			'</div>'
		);
	});
}

/** STEP2: Click on [edit] link. */
Exhibit.DataEdit._edit_ = function(itemId) {
	var self = this;	
	var filter = function(idx) { return ($(this).attr("ex:itemid")); }
	$('*').filter(filter).each(function(idx) {
		// Strip away all [edit] buttons
		$('.'+Exhibit.DataEdit.EDIT_DIV,this).remove();
		// If this is the item/lens being edited, change to editor
		if($(this).attr("ex:itemid") == itemId) {
			// Get lens...
			// var lens = new Exhibit.DataEdit.Lens(el);
			var editor = new Exhibit.DataEdit.Editor(itemId,this);
			Exhibit.DataEdit._editors_[itemId] = editor;
			editor.apply();
			// Change the [edit] to [save]
			//$('.'+Exhibit.DataEdit.EDIT_SAVE_BUTTON,this).replaceWith(
			$(this).append(
				'<div class="'+Exhibit.DataEdit.EDIT_DIV+'">'+
				'<span class="'+Exhibit.DataEdit.EDIT_BUTTON+'">'+
				'<a href="javascript:Exhibit.DataEdit._save_(\''+itemId+'\')">Save</a>'+
				'</span>'+
				'&nbsp;&nbsp;'+
				'<span class="'+Exhibit.DataEdit.EDIT_BUTTON+'">'+
				'<a href="javascript:Exhibit.DataEdit._cancel_()">Cancel</a>'+
				'</span>'+
				'&nbsp;&nbsp;'+
				'<span id="'+Exhibit.DataEdit.EDIT_MESSAGE+'"></span>'+
				'</div>'
			);
		}
	});
}

/** STEP3a: Click on [save] link. */
Exhibit.DataEdit._save_ = function(itemId) {
	var self = this;

	var mode = Exhibit.DataEdit.UPDATE_MODE;
	var editor = Exhibit.DataEdit._editors_[itemId];
	var fields = editor.getFields();

	// Reset all error indicators
	for(var fieldId in fields) { fields[fieldId].setError(false); }
	// Check fields
	for(var fieldId in fields) {
		var f = fields[fieldId];
		var val = f.getValue();
		var validators = f._validators;
		// Perform validation
		if(validators) {
			var _vNames = validators.split(',');
			for(var i=0;i<_vNames.length;i++) {
				var err = null;
				var v = _vNames[i];
				if(v.charAt(0)==='#') {
					// Alias
					v = v.toLowerCase();
					if(v=='#notempty') { err = Exhibit.DataEdit.validateIsNotEmpty(val); }
					else if(v=='#isurl') { err = Exhibit.DataEdit.validateIsURL(val); }
				} else {
					// Look for named function, defined in window scope
					if((window[v]) && (typeof window[v]=='function')) {
						window[v](val);
					}
				}
				// Did we get an error?
				if(err!=null) {
					$('#'+Exhibit.DataEdit.EDIT_MESSAGE).html(err);
					f.setError(true);
					return; // Exit function
				}
			}
		}
		// Perform save
		if((mode==Exhibit.DataEdit.UPDATE_MODE) && (val!=undefined)) {
			database.removeObjects(itemId,fieldId);
			if(val instanceof Array) {
				Exhibit.DataEdit.log("Updating(array)",fieldId,val);
				for(var j=0;j<val.length;j++) { database.addStatement(itemId,fieldId,val[j]); }
			} else {
				Exhibit.DataEdit.log("Updating(scalar)",fieldId,val);
				database.addStatement(itemId,fieldId,val);
			}
		} else if((mode==Exhibit.DataEdit.CREATE_MODE) && (val!=undefined)) {
			Exhibit.DataEdit.log("Creating",fieldId,val);
			//database.loadData( { items:[item] } );
		} else if(mode == Exhibit.DataEdit.DELETE_MODE) {
			Exhibit.DataEdit.log("Deleting",fieldId,val);
			database.removeObjects(itemId,fieldId);
		}
	}
	// Cause Exhibit to re-eval its views/facets, and close edit window
	database._listeners.fire("onAfterLoadingItems",[]);
	Exhibit.DataEdit._lock_ = false;  // FIXME try/catch/*finally*
}

/** STEP3b: Click on [cancel] link. */
Exhibit.DataEdit._cancel_ = function() {
	//var self = this;
	database._listeners.fire("onAfterLoadingItems",[]);
	Exhibit.DataEdit._lock_ = false;  // FIXME try/catch/*finally*
}

Exhibit.DataEdit.deactivate = function() {
	var self = this;
	var filter = function(idx) { return $(this).attr("ex:itemid"); }
	Exhibit.DataEdit.log("deactivate()");
	// See http://bugs.jquery.com/ticket/3729
	$('*').filter(filter).each(function(idx) {
		$(this).click(null);
	});
}

/** Varargs log function, using special array 'arguments', and apply() */
Exhibit.DataEdit.log = function() {
	if(window.console && Exhibit.DataEdit._DEBUG_) { console.log.apply(this,arguments); }
}


/* ========================================================================
 * Validators
 * ======================================================================== */

/** If defined, and is nonempty string, or nonzero number, or nonempty array... otherwise false */
Exhibit.DataEdit.validateIsNotEmpty = function(v) {
	var err = "Cannot be empty";
	if(v==undefined) { return err; }
	else if((typeof v=='string') && (v.length==0)) { return err; }
	else if((typeof v=='number') && (v==0)) { return err; }
	else if((typeof v=='object') && (v instanceof Array) && (v.length==0)) { return err; }
	else { return null; }
}
/** If defined, and begins with http:// */
Exhibit.DataEdit.validateIsURL = function(v) {
	var err = "Must be a web address";
	if(v==undefined || (typeof v != 'string')) { return err; }
	return (!v.match(/^http:\/\//)) ? err : null;
}

/** Bootstrap. */
$(document).ready(function() {
	// Add [Edit] button to page to activate editor.  First look for any element with 
	// ex:role="editorButton", inject onclick if found, otherwise add a button as 
	// absolute <div> top/right.
	var filter = function(idx) { return $(this).attr("ex:role")=="editorButton"; }
	var l = $('*').filter(filter);
	if(l.length>0) {
		// ex:role found -- inject
		l.each(function(idx) {
			try {
				$(this).click(function(){ 
					Exhibit.DataEdit.activate();
				});
			} catch(err) { SimileAjax.Debug.warn(err); }
		});
	} else {
		// ex:role not found -- add absolute <div>
		var buttonHTML = 
			'<div style="position:Fixed; right:1em;  top:1em;">'+
			'<div class="'+Exhibit.DataEdit.EDIT_BUTTON+'">'+
			'<a href="javascript:Exhibit.DataEdit.activate();">Toggle editor</a>'+
			'</div>'+
			'</div>';
		var body = $('body').first().append(buttonHTML);
		
	}
});
