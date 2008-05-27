/**==================================================
 *  Editing
 *  Adds support for editable item lenses.
 *==================================================
 */

Exhibit.Curate = {};

(function() {

var $ = SimileAjax.jQuery;

// Searches for elements with a given attribute. This is neccessary
// as JQuery selectors don't match attribute names with 
// colons (i.e. exhibit attributes).

function findParentWithAttribute(ele, attr) {
    return $($(ele).parents()
        .filter(function() { return $(this).attr(attr) }).get(0));
};


//=============================================================================
// Global Editing Functions
// These can be called from anywhere, to make global changes to Exhibit
//=============================================================================


function makeUniqueLabel(type, label) {
    var items = exhibit.getDatabase().getAllItems();
    var seed = label || "Untitled " + type;
    var count = 0;
    var name = seed;
    
    while (items.contains(name)) {
        count++;
        name = seed + " " + count;
    }
    
    return name;
}

Exhibit.Curate.addItem = function(type, label) {
    var label = makeUniqueLabel(type, label);
    var item = { label: label, type: type };
    exhibit.getDatabase().addItem(item);
    
    var collection = exhibit.getUIContext().getCollection();
    collection._listeners.fire('onItemAdded', [label]);
    collection._onRootItemsChanged(); // trigger UI redraw
}

Exhibit.Curate.modifyItem = function(itemID, prop, newVal) {
    var db = exhibit.getDatabase();
    var oldVal = db.getObject(itemID, prop);

    if (prop == 'label') {
        db.ensureUniqueness(newVal);
        var registry = Exhibit.LensRegistry._editModeRegistry;
        var wasEditing = registry[itemID];
        delete registry[itemID]
        registry[newVal] = wasEditing;
    }
    db.modifyItem(itemID, prop, newVal);

    var listeners = exhibit.getUIContext().getCollection()._listeners;
    listeners.fire('onItemModified', [itemID, prop, oldVal, newVal]);
}


//=============================================================================
// Editing Callbacks
// These functions are used as callbacks for the UI operations involved in
// item editing.
//=============================================================================

var invalidLabelUniquenessErrorMsg = "LabelUniquenessError should only occur on item rename";

function makeOnAttributeChange(uiContext, itemID, prop) {
    return function() {
        var newVal = $(this).val();
        try {
            Exhibit.Curate.modifyItem(itemID, prop, newVal);
        } catch (e if e instanceof Exhibit.Database.LabelUniquenessError) {
            if (prop != 'label') { 
                throw new Error(invalidLabelUniquenessErrorMsg);
            }
            $(this).val(itemID);
            alert('Cannot rename ' + itemID + ' to ' + newVal
                + ' as another item already has that name.');
        }
    }
}

function makeOnStartEdit(uiContext, itemID) {
    return function() {
        uiContext.getLensRegistry()._startEditing(itemID);
        uiContext.getCollection()._onRootItemsChanged(); // trigger UI redraw
    }
}

function makeOnStopEdit(uiContext, itemID) {
    return function() {
        uiContext.getLensRegistry()._stopEditing(itemID);
        uiContext.getCollection()._onRootItemsChanged(); // trigger UI redraw
    }
}


//=============================================================================
// Lens Registry Modifications
// Patches Lens Registries to support 'edit lens' templates, by aliasing
// LensRegistry.getLens and LensRegistry.createLens methods, and adding private
// methods and variables.
//=============================================================================

// Global edit mode registry; all lenses share same registry
var registry = Exhibit.LensRegistry._editModeRegistry = {};

Exhibit.LensRegistry.prototype._getEditLens = function(itemID, database) {
    if (this._editLenses === undefined) {
        this._editLenses = $('[edit-role=lens]');    
    }
    return this._editLenses.get(0);
}

Exhibit.LensRegistry.prototype._startEditing = function(itemID) {
    registry[itemID] = true;
}
 
Exhibit.LensRegistry.prototype._stopEditing = function(itemID) {
    registry[itemID] = false;
}

Exhibit.LensRegistry.prototype._isEditing = function(itemID) {
    return registry[itemID];
}

Exhibit.LensRegistry.prototype._getLens = Exhibit.LensRegistry.prototype.getLens;

Exhibit.LensRegistry.prototype.getLens = function(itemID, database) {
    return (this._isEditing(itemID)
        ? this._getEditLens(itemID, database)
        : this._getLens(itemID, database));
};

Exhibit.LensRegistry.prototype._createLens = Exhibit.LensRegistry.prototype.createLens;

function attachHandlers(div, attrName, attrVal, handler) {
    var findString = '[' + attrName + '=' +attrVal+ ' ]';
    $(div).find(findString)
        .attr('href', 'javascript:void')
        .click(handler);
}

function setupEditingDiv(itemID, div, uiContext) {
    var inputs = $(div).find('input[type=text][edit-content]');
    
    inputs.each(function() {
        var prop = $(this).attr('edit-content');
        var val = uiContext.getDatabase().getObject(itemID, prop);
        var handler = makeOnAttributeChange(uiContext, itemID, prop);
        
        $(this).change(handler).val(val);
    });
    
    attachHandlers(div, 'edit-role', 'stopEdit',
        makeOnStopEdit(uiContext, itemID));
}

Exhibit.LensRegistry.prototype.createLens = function(itemID, div, uiContext) {
    var ret = this._createLens(itemID, div, uiContext);

    if (this._isEditing(itemID)) {
        setupEditingDiv(itemID, div, uiContext)
    } else {
        var handler = makeOnStartEdit(uiContext, itemID);
        attachHandlers(div, 'edit-role', 'startEdit', handler);
    }
    
    return ret;
};


//=============================================================================
// Add Item Buttons
// Enables buttons that add new items
//=============================================================================



$(document).ready(function() {
    var f = function() {
        var type = $(this).attr('edit-type') || 'item';
        Exhibit.Curate.addItem(type);
    };
    
    $("[edit-role=addNewItem]").click(f)
});


})();