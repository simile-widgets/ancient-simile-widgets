/*
 * Data editor extension for Simile Exhibit (aka Felix2, codename 'Tigger').
 *    "But whatever his weight in pounds, shillings, and ounces, 
 *     He always seems bigger because of the bounces"
 *
 * Initial version developed by the Ensemble Project at Liverpool JMU.
 */

 /* 
  * Roles
  *   Toggle buttons:
  *   <span ex:role="editorButton" ex:type="edit">
  *   <span ex:role="editorButton" ex:type="clone">
  *   <span ex:role="editorButton" ex:type="create">
  *   <span ex:role="editorButton" ex:type="delete">
  *
  *   Lens:
  *   <div ex:role="editor">
  *     <span ex:role="editorButton" ex:type="save">
  *     <span ex:role="editorStatus">
  *
  * *** FIXME: The below is not yet fully implemented. ***
  * Lifecycle
  *   Various events are fired during the lifecycle of an edit, paired as before and after an
  *   action.  The onBeforeX events may return false to cancel the action, meaning the
  *   corresponding onX event will never happen.  
  *
  *   The editor can either save individual fields after each is edited, or the whole item if
  *   a [SAVE] button is employed.  onSave's field and value parameters are null if the whole
  *   object is being saved.  An onSave event handler should return true if it *failed* to 
  *   persist its data -- unpersisted data causes a warning to the user when leaving the page.
  *
  *   Multiple event handlers may be registered with addEventhandler(), each as an object with 
  *   functions mapped to properties of the event name, thus:
  *     Exhibit.DataEdit.addEventHandler({
  *       onBeforeInit : function() { ... return false; } ,
  *       onInit : function() { ... }
  *     });
  *   For each event, each handler object is consulted, and if an appropriate property is found its
  *   function is called.  In the case of onBeforeX and onSave events, *all* handlers are called,
  *   and an aggregate return value is determined by AND'ing each individual return -- this 
  *   aggregate return is then used to determine whether the event action should abort (false==abort).
  *
  *   The onSave event also returns an aggregate -- each handler should return true if the persistence
  *   operation went well, and false if it failed.  To display error messages from persistence, add
  *   them (as strings) to the Exhibit.DataEdit.onSaveErrors array, and return false.  Any messages in
  *   that array will be displayed to the user.
  *
  *   onBeforeInit : boolean ()                      Run at start of $(document).ready() 
  *   onInit : void ()                               Run at end of $(document).ready()
  *   onBeforeActivate : boolean ()                  Run at start of Exhibit.DataEdit.activate
  *   onActivate : void ()                           Run at end of Exhibit.DataEdit.activate
  *   onBeforeActivateClose : boolean ()             Run if [Editor] toggle clicked to abort edit
  *   onActivateClose : void ()                      Run if [Editor] toggle clicked to abort edit
  *   onBeforeEdit : boolean (itemId)                Run at start of Exhibit.DataEdit.edit
  *   onEdit : void (itemId)                         Run at end of Exhibit.DataEdit.edit
  *   onBeforeDelete : boolean (itemId)              Run at start of Exhibit.DataEdit.delete
  *   onDelete : void (itemId)                       Run at end of Exhibit.DataEdit.delete
  *   onBeforeClone : boolean (itemId)               Run at start of Exhibit.DataEdit.clone
  *   onClone : void (itemId)                        Run at end of Exhibit.DataEdit.clone
  *   onBeforeSave : boolean (itemId,item)           Run at start of Exhibit.DataEdit.save
  *   onSave : boolean (itemId,item)                 Run at end of Exhibit.DataEdit.save
  *   onBeforeCancel : boolean ()                    Run at start of Exhibit.DataEdit.cancel
  *   onCancel : void ()                             Run at end of Exhibit.DataEdit.cancel
  */
 
/* FIXME: Should not be necessary.  Fixes problem with noConflict(true) call in Exhibit platform.js */
if(!window.jQuery) { window.jQuery = SimileAjax.jQuery; }

/** 'Constructor' */
Exhibit.DataEdit = function() {}

/* ========================================================================
 * Configuration stuff -- change how the API works!
 * ======================================================================== */
/**
 * Set this to true to invoke the editor from API only.
 * When Exhibit.DataEdit.X_DISABLE_MODE_BUTTONS is true, the editor
 * must be activated or deactivated from JavaScript, thus:
 *   Exhibit.DataEdit.activateEdit();
 *   Exhibit.DataEdit.deactivateEdit();
 */
Exhibit.DataEdit.X_DISABLE_MODE_BUTTONS = false;
/** Directly switch to edit mode, instead of via red-dotted selector. */
//Exhibit.DataEdit.X_ALWAYS_SHOW_EDIT_LENS = false;
 
 
/* ========================================================================
 * Constants 'n' stuff...
 * ======================================================================== */

/** Lensless editor */
/*Exhibit.DataEdit.EDIT_INJECT_MARKER = "exhibitDataEditMarker";*/		// Class for red dotted highlight
/*Exhibit.DataEdit.EDIT_DIV = "exhibitDataEditBar";*/
Exhibit.DataEdit.EDIT_BUTTON = "exhibitDataEditButton";				// Class of activation button in corner
Exhibit.DataEdit.EDIT_BUTTON_SYMBOL = "exhibitDataEditButtonSymbol"; // Class of activate button symbol
Exhibit.DataEdit.EDIT_BUTTON_TEXT = "exhibitDataEditButtonText";	// Class of activate button text 
Exhibit.DataEdit.EDIT_STATUS_ID = "exhibitDataEditMsg";				// Id of status (if exists)
Exhibit.DataEdit.MODE_EDIT_ID = "exhibitDataEditModeEdit";
Exhibit.DataEdit.MODE_CLONE_ID = "exhibitDataEditModeClone";
Exhibit.DataEdit.MODE_CREATE_ID = "exhibitDataEditModeCreate";
Exhibit.DataEdit.MODE_DELETE_ID = "exhibitDataEditModeDelete";

/** Button roles. */
Exhibit.DataEdit.LENS_ROLE_BUTTON = "editorButton";					// ex:role for buttons
Exhibit.DataEdit.LENS_BUTTON_EDIT = "edit";							// ex:type for toggling edit mode
Exhibit.DataEdit.LENS_BUTTON_CLONE = "clone";						// ex:type for toggling clone mode
Exhibit.DataEdit.LENS_BUTTON_CREATE = "create";						// ex:type for toggling create mode
Exhibit.DataEdit.LENS_BUTTON_DELETE = "delete";						// ex:type for toggling delete mode
Exhibit.DataEdit.LENS_BUTTON_CSS_ON = "exhibitEditorButtonOn";		// CSS class applied to buttons (active)
Exhibit.DataEdit.LENS_BUTTON_CSS_OFF = "exhibitEditorButtonOff";	// CSS class applied to buttons (inactive)
Exhibit.DataEdit.LENS_ROLE_STATUS = "editorStatus";					// ex:role for status message
/** Lens roles etc. */
Exhibit.DataEdit.LENS_ROLE_ITEM_LENS = "editor"; 					// ex:role for editor item lens (see editor.js)
Exhibit.DataEdit.LENS_BUTTON_LENS_SAVE = "save";					// ex:type Save button
Exhibit.DataEdit.LENS_ROLE_ITEM_STATUS = "editorStatus";			// Status message area (unused)

/* This table stops us from having to write a lot of repetitious code
 * for mode buttons -- see end of this source file. */
Exhibit.DataEdit.EDIT_MODE_REFDATA = {};

/** Debug mode? */
Exhibit.DataEdit._DEBUG_ = false;

/** Editor lock -- prevent editor from being invoked when already open. */
Exhibit.DataEdit._lock_ = null;
/** Currently active editors. */
Exhibit.DataEdit._editors_ = null;
/** Used to hold externally registered lifecycle callbacks. */
Exhibit.DataEdit._lifeCycleEventHandlers_ = [];
/**
 * Error/warning messages, from onSave failures.  Persistence modules should
 * populate this array during onSave() event, to signal errors with remote save.
 */
Exhibit.DataEdit.onSaveErrors = [];


/* ========================================================================
 * Easy access function for editing.
 * ======================================================================== */
Exhibit.DataEdit.activateEdit = function() { 
	if(!Exhibit.DataEdit._lock_) { 
		Exhibit.DataEdit.activateMode(Exhibit.DataEdit.MODE_EDIT_ID);
	}
}
Exhibit.DataEdit.deactivateEdit = function() { 
	if(Exhibit.DataEdit._lock_==Exhibit.DataEdit.MODE_EDIT_ID) {
		Exhibit.DataEdit.deactivateMode(Exhibit.DataEdit.MODE_EDIT_ID);
	}
}


/* ========================================================================
 * Hook into Exhibit lenses.
 * ======================================================================== */
/*
 * FIXME -- !!There surely **MUST** be a better way to do this!!
 * Hook into the ex:onshow of each display lens; here's the problem: We
 * need to get at the lenses after <body> has loaded, but before Exhibit
 * initialises.  Our jQuery.ready() will run _after_ Exhibit's (our library 
 * will be included second) when Exhibit has already processed its lenses.
 *   -o- 'Loose' code in our lib will run before Exhibit's ready(), but the 
 *       doc's <body> will not have been loaded yet.
 *   -o- Hacking jQuery's document ready queue to inject our func first is 
 *       (a) a hack, and (b) not easy with more recent jQuery impl's.
 *   -o- Hooking ex:ondataload has similar problems to hooking ex:onshow.
 *   -o- Spliting the lib into two include's, one before and one after Exhibit,
 *       is inelegant, and adds undesirable complexity for the end user.
 *
 * Solution: patch Exhibit's lens compiler; run code before it runs.
 */
Exhibit.Lens._compileTemplate = Exhibit.Lens.compileTemplate; // Original func
Exhibit.Lens.compileTemplate = function(rootNode, isXML, uiContext) { // Replacement func
	// Save current ex:onshow, if exists, and inject our own
	var jq = $(rootNode);
	if(jq.attr('ex:onshow')) { jq.attr('_ex:originalOnShow',jq.attr('ex:onshow')); }
	jq.attr('ex:onshow','Exhibit.Lens.onShow(this)');
	// Now call original Exhibit code (func we hooked) with mod'd rootNode
	return Exhibit.Lens._compileTemplate(rootNode,isXML,uiContext);
}
/* Runs immediately after item lens HTML built. */
Exhibit.Lens.onShow = function(div) {
	// Call original ex:onshow
	if($(div).attr("_ex:originalOnShow")) { 
		var onshow = $(div).attr("_ex:originalOnShow");
		try { (new Function(onshow)).call(div); } catch(e) { SimileAjax.Debug.log(e); }
	}
	// Our code
	if(Exhibit.DataEdit._lock_) {
		Exhibit.DataEdit.injectIntoItemDiv(div);
	}
}
/* Alter div to inject WYSIWYG item. */
Exhibit.DataEdit.injectIntoItemDiv = function(div) {
	var id = $(div).attr("ex:itemid");
	/* FIXME: THIS CODE ATTEMPTS TO RESTORE EDITORS IF ACTIVE -- DOESN'T WORK AT MOMENT
	var modeDef = Exhibit.DataEdit.EDIT_MODE_REFDATA[Exhibit.DataEdit._lock_];
	// Are we in editor mode, and if so, is this lens being edited?
	var beingEdited = (Exhibit.DataEdit._editors_[id] || Exhibit.DataEdit.X_ALWAYS_SHOW_EDIT_LENS);
	if((Exhibit.DataEdit._lock_==Exhibit.DataEdit.MODE_EDIT_ID) && beingEdited) {
		Exhibit.DataEdit.edit.div(id,div);
		return;
	}*/
	Exhibit.DataEdit._buildOverlayHTML(id,div);
}

/** Varargs log function, using special array 'arguments', and apply() */
Exhibit.DataEdit.log = function() {
	if(window.console && Exhibit.DataEdit._DEBUG_) { console.log.apply(this,arguments); }
}


/* ========================================================================
 * Step 1
 * ======================================================================== */

/** STEP1a: Toggle mode on/off. */
Exhibit.DataEdit.toggleMode = function(mode) {
	var modeDef = Exhibit.DataEdit.EDIT_MODE_REFDATA[mode];
	if(Exhibit.DataEdit._lock_==mode) { Exhibit.DataEdit.deactivateMode(mode); } // Toggle off
	else if(Exhibit.DataEdit._lock_!=null) { return; }  // Locked by another mode, ignore
	else { Exhibit.DataEdit.activateMode(mode); } // Toggle on
}

/** STEP1b: Mode on. */
Exhibit.DataEdit.activateMode = function(mode) {
	var modeDef = Exhibit.DataEdit.EDIT_MODE_REFDATA[mode];
	// Call 'before' event if exists.  Exit if returns false.
	if(modeDef.eventBefore && 
		!Exhibit.DataEdit._invokeEventHandlers(modeDef.eventBefore)) { return; }
	// Clear data of items being edited
	Exhibit.DataEdit._editors_ = {};  
	// Enter mode and force Exhibit redraw: causes onshow handler for each item
	Exhibit.DataEdit._setLock(mode);
	database._listeners.fire("onAfterLoadingItems",[]);
	// Call main event
	Exhibit.DataEdit._invokeEventHandlers(modeDef.event);
}

/** STEP1c: Mode off. */
Exhibit.DataEdit.deactivateMode = function(mode) {
	var modeDef = Exhibit.DataEdit.EDIT_MODE_REFDATA[mode];
	if(Exhibit.DataEdit._lock_==mode) { 
		// Call 'beforeCancel' if exists.  Exit if returns false.
		if(modeDef.eventBeforeCancel 
			&& !Exhibit.DataEdit._invokeEventHandlers(modeDef.eventBeforeCancel)) { return; }
		// Exit mode and force Exhibit redraw: causes onshow handler for each item
		Exhibit.DataEdit._setLock(null);
		database._listeners.fire("onAfterLoadingItems",[]);
		// Call 'cancel' event if exists.
		Exhibit.DataEdit._invokeEventHandlers(modeDef.eventCancel);
	}
}

/* Build red dotted selectors for various modes. */
Exhibit.DataEdit._buildOverlayHTML = function(id,div) {
	var modeDef = Exhibit.DataEdit.EDIT_MODE_REFDATA[Exhibit.DataEdit._lock_];
	// Add clickable overlay onto display lens.
	var jq = $(div);
	var markerId = '__MARKER__'+Exhibit.DataEdit.Editor._escapeString(id);
	jq.append(
		'<div id="'+markerId+'" class="exhibitDataEditSelectorOff" '+
			'style="position:Absolute ; cursor:Help" '+
			'onclick="'+modeDef.overlayOnClick+'(\''+id+'\',event)"></div>'
	);
	jq.mouseover(function(ev) {
		var overlay = $('#'+markerId);
		if(overlay.attr('title')=='select') { return; }
		var xy = jq.position();
		// FIXME: 2012-04-26 : these two lines were commented out!  Weird!
		var w = jq.outerWidth(true);  // Width / height inc. margins and padding. 
		var h = jq.outerHeight(true);
		overlay.removeClass('exhibitDataEditSelectorOff').addClass('exhibitDataEditSelectorOn')
			.css('top',xy.top+'px').css('left',xy.left+'px').css('width',w+'px').css('height',h+'px')
			.attr('title','select');
	}).mouseout(function() {
		$('#'+markerId).removeClass('exhibitDataEditSelectorOn').addClass('exhibitDataEditSelectorOff')
			.attr('title',null);
	});
	// If we're currently in edit mode, add a hidden <input> in an attempt 
	// to allow [tab] keys to automatically activate editors.  The idea is
	// a [tab] nav from previous item will land here...
	// Don't use display:None, as browser may 'intelligently' ignore field.
	// These <input> will get removed when transformed into editor lens.
	if(Exhibit.DataEdit._lock_==Exhibit.DataEdit.MODE_EDIT_ID) {
		var grapTab = '<input type="text" '+
			'class="__GRAB_TABS__" '+
			'style="width:0px; height:0px; border:None; padding:0px; margin:0px; float:Left;" '+
			'onfocus="'+modeDef.overlayOnClick+'(\''+id+'\')"/>'
		jq.prepend(grapTab).append(grapTab);
	}
}


/* ========================================================================
 * Step 2
 * ======================================================================== */

/** STEP2a: Click on [edit] link. */
Exhibit.DataEdit.edit = function(itemId,ev) {
	if(!Exhibit.DataEdit._invokeEventHandlers('onBeforeEdit',itemId)) { return; }

	//var self = this;	
	var filter = function(idx) { return ($(this).attr("ex:itemid")); }
	// FIXME: Can we be more efficient than '*' ?
	$('*').filter(filter).each(function(idx) {
		var id = $(this).attr("ex:itemid");
		// If this is the item/lens selected for editing, change to editor
		if(id == itemId) {
			Exhibit.DataEdit.edit.div(itemId,this,ev);
		} else {
			// Move the edit marker (red dotted box) if exists, to account for
			// rejigging of page caused by editor.
			var markerId = '__MARKER__'+Exhibit.DataEdit.Editor._escapeString(id);
			var xy = $(this).offset();
			$('#'+markerId,this).css('top',xy.top+'px').css('left',xy.left+'px');
		}
	});

	Exhibit.DataEdit._invokeEventHandlers('onEdit',itemId);
}
Exhibit.DataEdit.edit.div = function(itemId,jqThis,clickEv) {
	var markerId = '__MARKER__'+Exhibit.DataEdit.Editor._escapeString(itemId);
	// Strip away edit overlay (red dotted box) if exists
	$('#'+markerId,jqThis).remove();
	// Display lens...
	// var lens = new Exhibit.DataEdit.Lens(el);
	var editor = null;
	if(!Exhibit.DataEdit._editors_[itemId]) {
		editor = new Exhibit.DataEdit.Editor(itemId,jqThis,clickEv);
		Exhibit.DataEdit._editors_[itemId] = editor;
	} else {
		editor = Exhibit.DataEdit._editors_[itemId]
		editor.updateTargetDOMElement(jqThis);
	}
	editor.apply();
}

/** STEP2b: Click on [delete] link. */
/* IMPORTANT: this function is named de-ONE-ete,  IE can't use keywords for functions names, apparently! */
Exhibit.DataEdit.de1ete = function(itemId,ev) {
	if(!Exhibit.DataEdit._invokeEventHandlers('onBeforeDelete',itemId)) { return; }
	
	// Delete all objects relating to properties of this item?
	if(confirm("Do you really want to delete this item?\nItem: "+itemId)) {
		var item = database._spo[itemId];
		for(p in item) {
			database.removeObjects(itemId,p);
		}
	} else { 
		return;  // confirm() == false
	}
	// Cause Exhibit to re-eval its views/facets, and close edit window
	Exhibit.DataEdit._setLock(null);  // FIXME try/catch/*finally*
	database._listeners.fire("onAfterLoadingItems",[]);
	
	Exhibit.DataEdit._invokeEventHandlers('onDelete',itemId);
}

/** STEP2c: Click on [clone] link. */
Exhibit.DataEdit.clone = function(itemId,ev) {
	if(!Exhibit.DataEdit._invokeEventHandlers('onBeforeClone',itemId)) { return; }
	
	// Clone this item?
	if(confirm("Do you really want to clone this item?\nItem: "+itemId)) {
		// Item uses label or id as 'key'?
		var keyProp = (database.getObject(itemId,'id')) ? 'id' : 'label';
		var _id = database.getObject(itemId,keyProp);
		if(!_id || _id!=itemId) { return; } // _id!=itemId should never fail!!
		// If the id ends in digits, attempt to increment
		if(_id.match(/\d+$/)) {
			// Ends in digit, increment until we get unique id
			var m = _id.match(/(.*?)(\d*)$/);  // m[1]=base m[2]=digits
			var base = m[1];
			var n = (m[2].length) ? parseInt(m[2]) : 0;  // Test should never be false!
			do { n++; } while(database.containsItem(base+n));
			_id = base+n;
		} else {
			// Doesn't end in digit, so add one
			_id = _id+'2';
		}
		// Deep clone item
		var srcItem = database._spo[itemId];
		var destItem = {};
		for(var p in srcItem) {
			var sa = srcItem[p];
			if(typeof sa == 'object') {
				var da = [];
				for(var i=0;i<sa.length;i++) { da.push(sa[i]); }
				destItem[p] = da;
			} else {
				destItem[p] = sa;
			}
		}
		// Change id/label, call cloning callback
		destItem[keyProp] = [_id];
		var hType = 'onCloning';
		for(var i=0;i<Exhibit.DataEdit._lifeCycleEventHandlers_.length;i++) {
			var handler = Exhibit.DataEdit._lifeCycleEventHandlers_[i];
			destItem = (handler[hType]) ? handler[hType](itemId,_id,destItem) : destItem;
		}
		// Save cloned item
		database.loadData( { items:[destItem] } );
	} else {
		return;  // confirm() == false
	}
	// Cause Exhibit to re-eval its views/facets, and close edit window
	Exhibit.DataEdit._setLock(null);  // FIXME try/catch/*finally*
	database._listeners.fire("onAfterLoadingItems",[]);
	
	Exhibit.DataEdit._invokeEventHandlers('onClone',itemId);
}

/** STEP2d: Click on [new] link. */
Exhibit.DataEdit.create = function(itemId,ev) {
	if(!Exhibit.DataEdit._invokeEventHandlers('onBeforeCreate',itemId)) { return; }
	
	var item = {};
	// Create empty item using source example
	var srcItem = database._spo[itemId];
	for(p in srcItem) {
		var o = database.getObject(itemId,p);
		if(typeof o=='number') {
			item[p] = 0;
		}
		else if(typeof o=='boolean') {
			item[p] = false;
		}
		else if(typeof o=='string') {
			if(o.match(/^(\+|\-)?\d+(\.\d+)?$/)) { item[p]=0; }
			else { item[p]=''; }
		}
		else {
			item[p] = '';
		}
	}
	// Clone source item's type
	var type = database.getObject(itemId,'type');
	item['type'] = (type) ? type : 'item';
	// Key
	var keyProp = (database.getObject(itemId,'id')) ? 'id' : 'label';
	item[keyProp] = 'item' + (new Date().getTime());
	// Call creating callback
	var hType = 'onCreating';
	for(var i=0;i<Exhibit.DataEdit._lifeCycleEventHandlers_.length;i++) {
		var handler = Exhibit.DataEdit._lifeCycleEventHandlers_[i];
		item = (handler[hType]) ? handler[hType](item[keyProp],item) : item;
	}
	// Save
	database.loadData( { items:[item] } );

	// Cause Exhibit to re-eval its views/facets, and close edit window
	Exhibit.DataEdit._setLock(null);  // FIXME try/catch/*finally*
	database._listeners.fire("onAfterLoadingItems",[]);
	
	Exhibit.DataEdit._invokeEventHandlers('onCreate',itemId);
}


/* ========================================================================
 * Step 3
 * ======================================================================== */

/** STEP3a: Item save; click on [save] link. */
Exhibit.DataEdit.save = function(itemId) {
	var self = this;

	var editor = Exhibit.DataEdit._editors_[itemId];
	var fields = editor.getFields();

	
	// Build an item dictionary
	var item = {};
	for(var fieldId in fields) { item[fieldId] = fields[fieldId].getValue(); }
	
	if(!Exhibit.DataEdit._invokeEventHandlers('onBeforeSave',itemId,item)) { return; }  // Before save
	for(var fieldId in fields) { fields[fieldId].setError(false); } // Reset all error indicators
	Exhibit.DataEdit.onSaveErrors = [];  // Persistence errors
	// Save fields
	for(var fieldId in fields) {
		var f = fields[fieldId];
		var err = Exhibit.DataEdit._saveField(itemId,fieldId,f);
		if(err) { 
			f.setError(true); // Change field itself
			Exhibit.DataEdit._setStatusMessage(itemId,err);
			return;
		}
	}
	var persistSuccess = Exhibit.DataEdit._invokeEventHandlers('onSave',itemId,item); // Save event
	Exhibit.DataEdit._checkSaveFailure(itemId,persistSuccess);
}
/** STEP3b: Field save; field onChange. */
/* When in field saving mode (because [SAVE] button missing) each editing 
 * component checks in here when their onChange is triggered, with their
 * itemId and fieldId. */
Exhibit.DataEdit.onChange = function(itemId,fieldId) {
	var editor = Exhibit.DataEdit._editors_[itemId];
	var fields = editor.getFields();
	var f = fields[fieldId];
	
	var item = {};
	item[fieldId] = f.getValue();
	
	if(!Exhibit.DataEdit._invokeEventHandlers('onBeforeSave',itemId,item)) { return; }  // Before save
	Exhibit.DataEdit.onSaveErrors = [];  // Persistence errors
	// Save field
	var err = Exhibit.DataEdit._saveField(itemId,fieldId,f);
	if(err) {		
		f.setError(true); // Change field itself
		Exhibit.DataEdit._setStatusMessage(itemId,err);
	}
	var persistSuccess = Exhibit.DataEdit._invokeEventHandlers('onSave',itemId,item);  // Save event
	Exhibit.DataEdit._checkSaveFailure(itemId,persistSuccess);
}

/* Set up clear the edit lock (also set the edit button appearence). */
Exhibit.DataEdit._setLock = function(buttId) {
	Exhibit.DataEdit._lock_ = buttId;
	// Alter global activation buttons
	for(var b in Exhibit.DataEdit.EDIT_MODE_REFDATA) {
		var bRef = Exhibit.DataEdit.EDIT_MODE_REFDATA[b];
		var matched = (b==buttId);
		// Default buttons (added on absence of customs)
		$('#'+b).each(function() {
			$('.'+Exhibit.DataEdit.EDIT_BUTTON_SYMBOL,this).html(
				matched ? 
					'<span class="on">&#10004;</span>' : 
					'<span class="off">&#10006;</span>'
			);
			$('.'+Exhibit.DataEdit.EDIT_BUTTON_TEXT,this).html(
				matched ? 
					'<span class="on">'+bRef.textOn+'</span>' :
					'<span class="off">'+bRef.textOff+'</span>'
			);
		});
		// Custom buttons, apply on/off class
		var unset = !matched ? Exhibit.DataEdit.LENS_BUTTON_CSS_ON : Exhibit.DataEdit.LENS_ROLE_ACTIVATE_CSS_OFF;
		var set = matched ? Exhibit.DataEdit.LENS_BUTTON_CSS_ON : Exhibit.DataEdit.LENS_ROLE_ACTIVATE_CSS_OFF;
		var role = bRef.customButton;
		var filter = function(idx) { return $(this).attr("ex:role")==role; }
		$('*').filter(filter).removeClass(unset).addClass(set);
	}
}

/* Convenience: did the item persist properly? */
Exhibit.DataEdit._checkSaveFailure = function(itemId,persistSuccess) {
	if(!persistSuccess) { 
		// Do we have a function to handle persistence failures?
		/*if(Exhibit.DataEdit._countEventHandlers('onPersistFailed')) {
			Exhibit.DataEdit._invokeEventHandlers('onPersistFailed',Exhibit.DataEdit.onSaveErrors);
		}*/
		// Show messages
		if(Exhibit.DataEdit.onSaveErrors.length>0) {
			// If there are messages to show, and no error handler, alert().
			var s = "";
			for(var i=0;i<Exhibit.DataEdit.onSaveErrors.length;i++) { 
				s=s+Exhibit.DataEdit.onSaveErrors[i]+'\n';
			}
			Exhibit.DataEdit._setStatusMessage(itemId,s,true);
		} else {
			Exhibit.DataEdit._setStatusMessage(itemId,"Saved locally, persistence failed",true);
		}
	} else {
		Exhibit.DataEdit._setStatusMessage(itemId,"Saved",false);
	}
}

/* Display status message for given item */
Exhibit.DataEdit._setStatusMessage = function(itemId,mesg,urgent) {
	var sel = '#'+Exhibit.DataEdit.EDIT_STATUS_ID+'_'+itemId;
	$(sel).html(mesg);
	if(urgent && $(sel).length==0) { alert(mesg); }
}


/* ========================================================================
 * Database
 * ======================================================================== */

/** Save a given field for given item.  Returns error message, or null on success. */
Exhibit.DataEdit._saveField = function(itemId,fieldId,f) {
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
				return err; // Exit wirh error
			}
		}
	}
	// Perform save
	if(val!=undefined) {
		database.removeObjects(itemId,fieldId);
		if(val instanceof Array) {
			Exhibit.DataEdit.log("Updating(array)",fieldId,val);
			for(var j=0;j<val.length;j++) { database.addStatement(itemId,fieldId,val[j]); }
		} else {
			Exhibit.DataEdit.log("Updating(scalar)",fieldId,val);
			database.addStatement(itemId,fieldId,val);
		}
	}
	return null;
}



/* ========================================================================
 * Life cycle event handlers
 * FIXME: Use SimileAjax.ListenerQueue instead?
 * ======================================================================== */

/** Called by external code to register an event handler object. */
Exhibit.DataEdit.addEventHandler = function(h) {
	if(h) { Exhibit.DataEdit._lifeCycleEventHandlers_.push(h); }
}
/** Called interally, to fire events for given type. */
Exhibit.DataEdit._invokeEventHandlers = function(type,id,item) {
	// Iterate over handlers
	var ret = true;
	for(var i=0;i<Exhibit.DataEdit._lifeCycleEventHandlers_.length;i++) {
		var handler = Exhibit.DataEdit._lifeCycleEventHandlers_[i];
		if(handler[type]) { 
			ret = ret && handler[type](id,item);
		}
	}
	return ret;
}
/*Exhibit.DataEdit._countEventHandlers = function(type) {
	var cnt=0;
	for(var i=0;i<Exhibit.DataEdit._lifeCycleEventHandlers_.length;i++) {
		var handler = Exhibit.DataEdit._lifeCycleEventHandlers_[i];
		if(handler[type]) { cnt++; }
	}
	return cnt;
}*/


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
	// Check config option: editor to be used via API only?
	if(Exhibit.DataEdit.X_DISABLE_MODE_BUTTONS) { return; }
	// Otherwise, do buttons...
	var buttonHTML = "";
	var numCustomButtons = 0;
	for(var buttId in Exhibit.DataEdit.EDIT_MODE_REFDATA) {
		var b = Exhibit.DataEdit.EDIT_MODE_REFDATA[buttId];
		var cb = b.customButton;  // Role to look for
		var filter = function(idx) { 
			return ($(this).attr("ex:role")==Exhibit.DataEdit.LENS_ROLE_BUTTON)
				&& ($(this).attr("ex:type")==cb);
		}
		var l = $('*').filter(filter);
		if(l.length>0) {
			// ex:role found -- inject
			l.each(function(idx) {
				try {
					var b = buttId;
					$(this)
						.click(function(){
							Exhibit.DataEdit.toggleMode(b);
						})
						.addClass(Exhibit.DataEdit.LENS_BUTTON_CSS_OFF);
				} catch(err) { SimileAjax.Debug.warn(err); }
			});
			numCustomButtons++;
		} else {
			// ex:role not found -- add to absolute <div>
			buttonHTML += 
				'<span id="'+buttId+'" class="'+Exhibit.DataEdit.EDIT_BUTTON+'">'+
				'<a href="javascript:Exhibit.DataEdit.toggleMode(\''+buttId+'\');"><div>'+
					'<span class="'+Exhibit.DataEdit.EDIT_BUTTON_SYMBOL+'"><span class="off">&#10006;</span></span>'+
					'&nbsp;<span class="'+Exhibit.DataEdit.EDIT_BUTTON_TEXT+'"><span class="off">'+b.textOff+'</span></span>'+
				'</div></a>'+
				'</span>';
		}

	}
	// If no custom activation buttons on page, use default buttons
	if(numCustomButtons==0 && buttonHTML.length) {
		// FIXME: float:Right is a work around for IE8 not supporting position:Fixed with certain doctypes
		buttonHTML = '<div style="position:Fixed; float:Right; right:0.5em;  top:0.5em; z-index:1000;">' + buttonHTML + '</div>';
		$('body').first().prepend(buttonHTML);	
	}
}

/** Bootstrap. */
$(document).ready(function() {
	if(!Exhibit.DataEdit._invokeEventHandlers('onBeforeInit')) { return; }
	Exhibit.DataEdit._setup_injectActivateButton();
	Exhibit.DataEdit._invokeEventHandlers('onInit');
});

/**
 * Reference data for activation buttons (see Exhibit.DataEdit._setup_injectActivateButton(), etc.)
 */
Exhibit.DataEdit.EDIT_MODE_REFDATA[Exhibit.DataEdit.MODE_EDIT_ID] = {
	textOff: "Edit item", textOn: "Stop editing",
	customButton: Exhibit.DataEdit.LENS_BUTTON_EDIT ,
	overlayOnClick: "Exhibit.DataEdit.edit" ,
	eventBefore: "onBeforeActivate" , eventBeforeCancel: "onBeforeActivateClose" ,
	event: "onActivate" , eventCancel: "onActivateClose"
};
Exhibit.DataEdit.EDIT_MODE_REFDATA[Exhibit.DataEdit.MODE_CLONE_ID] = { 
	textOff: "Clone item", textOn: "Cancel clone",
	customButton: Exhibit.DataEdit.LENS_BUTTON_CLONE ,
	overlayOnClick: "Exhibit.DataEdit.clone" ,
	eventBefore: null , eventBeforeCancel: null ,
	event: null , eventCancel: null
};
Exhibit.DataEdit.EDIT_MODE_REFDATA[Exhibit.DataEdit.MODE_CREATE_ID] = { 
	textOff: "Create item", textOn: "Cancel create",
	customButton: Exhibit.DataEdit.LENS_BUTTON_CREATE ,
	overlayOnClick: "Exhibit.DataEdit.create" ,
	eventBefore: null , eventBeforeCancel: null ,
	event: null , eventCancel: null
};
Exhibit.DataEdit.EDIT_MODE_REFDATA[Exhibit.DataEdit.MODE_DELETE_ID] = {
	textOff: "Delete item", textOn: "Cancel delete",
	customButton: Exhibit.DataEdit.LENS_BUTTON_DELETE ,
	overlayOnClick: "Exhibit.DataEdit.de1ete" ,
	eventBefore: null , eventBeforeCancel: null ,
	event: null , eventCancel: null
};