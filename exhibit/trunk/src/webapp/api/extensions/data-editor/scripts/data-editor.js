/*
 * Data editor extension for Simile Exhibit (aka Felix2, codename 'Tigger').
 *    "But whatever his weight in pounds, shillings, and ounces, 
 *     He always seems bigger because of the bounces"
 *
 * Initial version developed by the Ensemble Project at Liverpool JMU.
 */

 /* 
  * Roles
  *   <div ex:role="editor">                         Editor lens definition
  *   <div ex:role="editorActivateButton">           Button to activate edit lens mode
  *   <div ex:role="editorEditButton">               Button to acitvate an individual edit lens
  *   <div ex:role="editorSaveButton">               Button to save
  *   <div ex:role="editorCancelButton">             Button to cancel
  *   <div ex:role="editorStatus">                   Validator messages, etc.
  *
  * *** FIXME: The below is not yet fully implemented. ***
  * Lifecycle
  *   Various events are fired during the lifecycle of an edit, paired as before and after an
  *   action.  The onBeforeX events may return true to cancel the action.  
  *
  *   The editor can either save individual fields after each is edited, or the whole item if
  *   a [SAVE] button is employed.  onSave's field and value parameters are null if the whole
  *   object is being saved.  An onSave event handler should return true if it *failed* to 
  *   persist its data -- unpersisted data causes a warning to the user when leaving the page.
  *
  *   Multiple event handlers may be registered with addEventhandler(), each as an object with 
  *   functions mapped to properties of the event name, thus:
  *     Exhibit.DataEdit.AddEventHandler({
  *       onBeforeInit : function() { ... return false; } ,
  *       onInit : function() { ... }
  *     });
  *   For each event, each handler object is consulted, and if an appropriate property is found its
  *   function is called.  In the case of onBeforeX and onSave events, *all* handlers are called,
  *   and the aggregate return value is determined by OR'ing each individual return (thus: 'true'
  *   if any of the handlers returned true).
  *
  *   onBeforeInit : boolean ()                      Run at start of $(document).ready() 
  *   onInit : void ()                               Run at end of $(document).ready()
  *   onBeforeActivate : boolean ()                  Run at start of Exhibit.DataEdit.activate
  *   onActivate : void ()                           Run at end of Exhibit.DataEdit.activate
  *   onBeforeActivateClose : boolean ()             Run if [Editor] toggle clicked to abort edit
  *   onActivateClose : void ()                      Run if [Editor] toggle clicked to abort edit
  *   onBeforeEdit : boolean (item_id)               Run at start of Exhibit.DataEdit.edit
  *   onEdit : void (item_id)                        Run at end of Exhibit.DataEdit.edit
  *   onBeforeSave : boolean (item_id<,field,value>) Run at start of Exhibit.DataEdit.save
  *   onSave : boolean (item_id,<,field,value>)      Run at end of Exhibit.DataEdit.save
  *   onBeforeCancel : boolean ()                    Run at start of Exhibit.DataEdit.cancel
  *   onCancel : void ()                             Run at end of Exhibit.DataEdit.cancel
  */
 
/* FIXME: Should not be necessary.  Fixes problem with noConflict(true) call in Exhibit platform.js */
if(!window.jQuery) { window.jQuery = SimileAjax.jQuery; }

/** 'Constructor' */
Exhibit.DataEdit = function() {}


/* ========================================================================
 * Constants 'n' stuff...
 * ======================================================================== */

 /** Class used to find Edit/Save Boxes added to lens. */
Exhibit.DataEdit.EDIT_INJECT_MARKER = "exhibitDataEditMarker";
Exhibit.DataEdit.EDIT_DIV = "exhibitDataEditBar";
Exhibit.DataEdit.EDIT_BUTTON = "exhibitDataEditButton";
Exhibit.DataEdit.EDIT_MESSAGE = "exhibitDataEditError";

/** Roles. */
Exhibit.DataEdit.EDIT_ROLE_LENS = "editor";
Exhibit.DataEdit.EDIT_ROLE_ACTIVATE = "editorActivateButton";
Exhibit.DataEdit.EDIT_ROLE_EDIT = "editorEditButton";
Exhibit.DataEdit.EDIT_ROLE_SAVE = "editorSaveButton";
Exhibit.DataEdit.EDIT_ROLE_CANCEL = "editorCancelButton";
Exhibit.DataEdit.EDIT_ROLE_STATUS = "editorStatus";

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
/** Used to hold externally registered lifecycle callbacks. */
Exhibit.DataEdit._lifeCycleEventHandlers_ = [];


/* ========================================================================
 * Edit steps
 * ======================================================================== */

/** STEP1: Activate edit mode. */
Exhibit.DataEdit.activate = function() {
	var self = this;
	// Locked?  Cancel.
	if(Exhibit.DataEdit._lock_) { 
		Exhibit.DataEdit._invokeEventHandlers('onBeforeActivateClose');
		Exhibit.DataEdit.cancel();
		Exhibit.DataEdit._setEditLock(false);
		Exhibit.DataEdit._invokeEventHandlers('onActivateClose');
		return;
	}

	Exhibit.DataEdit._invokeEventHandlers('onBeforeActivate');
	Exhibit.DataEdit._setEditLock(true);
	//Exhibit.UI.showBusyIndicator();
	// Editors
	Exhibit.DataEdit._editors_ = {};
	// Go through each ex:itemid, appending an [Edit] button
	var filter = function(idx) { return $(this).attr("ex:itemid"); }
	$('*').filter(filter).each(function(idx) {  // See http://bugs.jquery.com/ticket/3729
		var id = $(this).attr("ex:itemid");
		// Did the display lens contain an ex:role="editorEdit"?  (Note: ex:role attr has been 
		// rewritten as _ex:role, to survive display lens capture/render code) 
		var filterEdit = function(idx) { return $(this).attr("_ex:role")==Exhibit.DataEdit.EDIT_ROLE_EDIT; }
		var l = $('*',this).filter(filterEdit);  // Important: see FIXME [1] at foot of code
		if(l.length>0) {
			// Yes: display user's <div>
			l.each(function(idx) {
				$(this).css('display','Block');
				$(this).click(function() { Exhibit.DataEdit.edit(id); });
			});
		} else {
			// No: add overlay to display <div>
			// Add clickable overlay onto display lens.
			var xy = $(this).offset();
			var w = $(this).outerWidth(true);  // Width / height inc. margins and padding. 
			var h = $(this).outerHeight(true);
			var overlay = '<div class="'+Exhibit.DataEdit.EDIT_INJECT_MARKER+'" '+
				'onMouseOver="Exhibit.DataEdit._rollIn_(this)" onMouseOut="Exhibit.DataEdit._rollOut_(this)" '+
				'onclick="Exhibit.DataEdit.edit(\''+id+'\')" '+
				'style="position:Absolute ; top:'+xy.top+'px ; left:'+xy.left+'px ; width:'+w+'px ; height:'+h+'px ; '+
					'cursor:Help ; border:2px #dddddd Dotted">'+
				'</div>';
			$(this).append(overlay);
		}
	});
	
	//Exhibit.UI.hideBusyIndicator();
	Exhibit.DataEdit._invokeEventHandlers('onActivate');
}
Exhibit.DataEdit._rollIn_ = function(div) { $(div).css('border','2px Red Dotted'); }
Exhibit.DataEdit._rollOut_ = function(div) { $(div).css('border',"2px #dddddd Dotted"); }

/** STEP2: Click on [edit] link. */
Exhibit.DataEdit.edit = function(itemId) {
	Exhibit.DataEdit._invokeEventHandlers('onBeforeEdit');

	var self = this;	
	var filter = function(idx) { return ($(this).attr("ex:itemid")); }
	$('*').filter(filter).each(function(idx) {
		// Hide user defined <div ex:role="editorEditButton"> (if they exist)
		var filterEdit = function(idx) { return $(this).attr("_ex:role")==Exhibit.DataEdit.EDIT_ROLE_EDIT; }
		$('*',this).filter(filterEdit).css('display','None');  // Important: see FIXME [1] at foot of code
		// Strip away all edit overlays (if they exist)
		$('.'+Exhibit.DataEdit.EDIT_INJECT_MARKER,this).remove();	
		
		// If this is the item/lens being edited, change to editor
		if($(this).attr("ex:itemid") == itemId) {
			// Get lens...
			// var lens = new Exhibit.DataEdit.Lens(el);
			var editor = new Exhibit.DataEdit.Editor(itemId,this);
			Exhibit.DataEdit._editors_[itemId] = editor;
			editor.apply();
		}
	});

	Exhibit.DataEdit._invokeEventHandlers('onEdit');
}

/** STEP3a: Click on [save] link. */
Exhibit.DataEdit.save = function(itemId) {
	Exhibit.DataEdit._invokeEventHandlers('onBeforeSave');

	var self = this;

	var mode = Exhibit.DataEdit.UPDATE_MODE;
	var editor = Exhibit.DataEdit._editors_[itemId];
	var fields = editor.getFields();

	// Reset all error indicators
	for(var fieldId in fields) { fields[fieldId].setError(false); }
	// Save fields
	for(var fieldId in fields) {
		var f = fields[fieldId];
		if( Exhibit.DataEdit._saveField(itemId,fieldId,f) ) { return; }
	}
	// Cause Exhibit to re-eval its views/facets, and close edit window
	database._listeners.fire("onAfterLoadingItems",[]);
	Exhibit.DataEdit._setEditLock(false);  // FIXME try/catch/*finally*

	Exhibit.DataEdit._invokeEventHandlers('onSave');	
}

/** STEP3b: Click on [cancel] link. */
Exhibit.DataEdit.cancel = function() {
	Exhibit.DataEdit._invokeEventHandlers('onBeforeCancel');

	//var self = this;
	database._listeners.fire("onAfterLoadingItems",[]);
	Exhibit.DataEdit._setEditLock(false);  // FIXME try/catch/*finally*

	Exhibit.DataEdit._invokeEventHandlers('onCancel');
}

/* Set up clear the edit lock (also set the edit button appearence). */
Exhibit.DataEdit._setEditLock = function(b) {
	Exhibit.DataEdit._lock_ = b;
	// Alter the global button
	$('.exhibitDataEditButton #symbol').html(
		Exhibit.DataEdit._lock_ ? '<span class="on">&#10004;</span>' : '<span class="off">&#10006;</span>');
}

/* When in field saving mode (because [SAVE] button missing) each editing 
 * component checks in here when their onChange is triggered, with their
 * itemId and fieldId. */
Exhibit.DataEdit.onChange = function(itemId,fieldId) {
	var editor = Exhibit.DataEdit._editors_[itemId];
	var fields = editor.getFields();
	var f = fields[fieldId];
	if( Exhibit.DataEdit._saveField(itemId,fieldId,f) ) {
		// Find status element, if exists, and display error message
		$('.'+Exhibit.DataEdit.STATUS_CLASS).each(function(idx) { $(this).html(err); });
	}
	//console.log("ok",itemId,fieldId);
}

/** Varargs log function, using special array 'arguments', and apply() */
Exhibit.DataEdit.log = function() {
	if(window.console && Exhibit.DataEdit._DEBUG_) { console.log.apply(this,arguments); }
}


/* ========================================================================
 * Database
 * ======================================================================== */

/** Save a given field for given item. */
Exhibit.DataEdit._saveField = function(itemId,fieldId,f) {
	var mode = Exhibit.DataEdit.UPDATE_MODE;
	
	var val = f.getValue();
	var validators = f._validators;
	// Perform validation
	if(validators) {
		var _vNames = validators.split(',');
		for(var i=0;i<_vNames.length;i++) {
			var err = null;
			var v = _vNames[i];
			// Check internal validators first
			var found = false;
			var vl = v.toLowerCase();
			if(Exhibit.DataEdit._internalValidators[vl]) { 
				err = Exhibit.DataEdit._internalValidators[vl](val);
				found = true;
			}
			if(!found && (window[v]) && (typeof window[v]=='function')) {
				err = window[v](val);
				found = true;
			}
			if(!found) {} // FIXME: Do something useful!
			// Did we get an error?
			if(err!=null) {
				// Find status element, if exists, and display error message
				if($('#'+Exhibit.DataEdit.EDIT_MESSAGE).length) {
					$('#'+Exhibit.DataEdit.EDIT_MESSAGE).html(err);
				} else {
					alert(err);
				}
				// Change field itself
				f.setError(true);
				return true; // Exit wirh error
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
	return false;
}



/* ========================================================================
 * Life cycle event handlers
 * ======================================================================== */

/** Called by external code to register an event handler object. */
Exhibit.DataEdit.addEventHandler = function(h) {
	if(h) { Exhibit.DataEdit._lifeCycleEventHandlers_.push(h); }
}
/** Called interally, to fire events for given type. */
Exhibit.DataEdit._invokeEventHandlers = function(type) {
	for(var h in Exhibit.DataEdit._lifeCycleEventHandlers_) {
		if(h[type]) { h[type](); }
	}
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

/* Fill this out so the validator code can map functions to attr tokens. 
 * USE LOWER CASE TOKENS!
 */
Exhibit.DataEdit._internalValidators = {
	'notempty' : 			Exhibit.DataEdit.validateIsNotEmpty ,
	'isurl' :				Exhibit.DataEdit.validateIsURL
};


/* ========================================================================
 * Bootstrap
 * ======================================================================== */

/* Setup pt1 */
Exhibit.DataEdit._setup_injectActivateButton = function() {
	// Add [Edit] button to page to activate editor.  First look for any element with 
	// ex:role="editorActivate", inject onclick if found, otherwise add a button as 
	// absolute <div> top/right.
	var filterActivate = function(idx) { return $(this).attr("ex:role")==Exhibit.DataEdit.EDIT_ROLE_ACTIVATE; }
	var l = $('*').filter(filterActivate);
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
			'<a href="javascript:Exhibit.DataEdit.activate();"><span id="symbol"><span class="off">&#10006;</span></span>&nbsp;Editor</a>'+
			'</div>'+
			'</div>';
		var body = $('body').first().append(buttonHTML);	
	}
}
/* Setup pt2 */
Exhibit.DataEdit._setup_scanForEditButtonInDisplayLens = function() {
	// Hide all the ex:role="editorEdit" elements.
	var filterEdit = function(idx) { return $(this).attr("ex:role")==Exhibit.DataEdit.EDIT_ROLE_EDIT; }
	var l = $('*').filter(filterEdit);  // Important: see FIXME [1] at foot of code
	if(l.length>0) {
		l.each(function(idx) {
			// Display lens code removes ex:role, so rename it.
			$(this).attr('_ex:role',Exhibit.DataEdit.EDIT_ROLE_EDIT);
			// Hide element
			$(this).css('display','None');
		});
	}
}

/** Bootstrap. */
$(document).ready(function() {
	Exhibit.DataEdit._invokeEventHandlers('onBeforeInit');
	
	Exhibit.DataEdit._setup_injectActivateButton();
	/*Exhibit.DataEdit._setup_scanForEditButtonInDisplayLens();*/ // See FIXME [1] below
	
	Exhibit.DataEdit._invokeEventHandlers('onInit');
});

/*
 * FIXME [1] :
 *
 *   Originally each display lens could (optionally) feature a <div ex:role="editorEditButton">
 *   which, when editing was activated, would be shown in preference to the red dotted overlay.  
 *   _setup_scanForEditButtonInDisplayLens() would scan for such elements in the display lens, 
 *   inject an onclick handler and set display:None to hide them.  activate() would then show them
 *   again, and edit() would hide them.
 *
 *   This worked on Firefox 3.6, but not IE 8!!!  The likely problem was Exhibit's $(document).ready() 
 *   being called first and processing the display lens, making _setup_scanForEditButtonInDisplayLens()'s 
 *   changes redundant (which begs the question: how come it works in FF?!??).
 *   
 *   For this reason, _setup_scanForEditButtonInDisplayLens() has been deactivated (commented), until
 *   Exhibit gets some proper lifecycle events that allow this extension to run code before its
 *   $(document).ready() .  The remainder of the code is still in, but will have no effect without
 *   the setup code running first.
 */