//=============================================================================
// EditLogView
// Tracks changes made to Exhibit items through item changing interfaces, and
// provides an interface for enabling/disabling changes, and submitting the
// changes to a backend data source.
//=============================================================================


(function() {

var $ = SimileAjax.jQuery;


//=============================================================================
// Utility functions
//=============================================================================


function link(click, text, cssClass) {
    var link = $('<a>').text(text).click(click);
    link.attr('href', 'javascript:');
    if (cssClass) { link.addClass(cssClass) }
    return link;
};


//=============================================================================
// Exhibit View Boilerplate
//=============================================================================


Exhibit.EditLogView = function(containerElmt, uiContext) {
    this._div = $(containerElmt);
    this._uiContext = uiContext;
    this._settings = {};
    this._accessors = {};

    this._postTo = this._settings.submitTo;

    this._log = new Exhibit.OrderedDictionary();
    this._comment = "";
    
    uiContext.getCollection().addListener(this);
}


Exhibit.EditLogView._settingSpecs = {
    submitTo:        { type: "text", defaultValue: "admin/submit.py" },
    headerText:      { type: "text", defaultValue: "Edit Log" },
    placeholderText: { type: "text", defaultValue: "To start editing this " +
        "exhibit, click 'edit' on the items above" },
    submitCallback: { type: "text" }
};

Exhibit.EditLogView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.EditLogView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );

    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        Exhibit.EditLogView._settingSpecs,
        view._settings);

    view._initializeUI();
    return view;
};

Exhibit.EditLogView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var view = new Exhibit.EditLogView(
        containerElmt != null ? containerElmt : configElmt, 
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );

    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        configElmt, 
        Exhibit.EditLogView._settingSpecs, 
        view._settings);

    Exhibit.SettingsUtilities.collectSettings(
        configuration, 
        Exhibit.EditLogView._settingSpecs, 
        view._settings);

    view._initializeUI();
    return view;
};

Exhibit.EditLogView.prototype.dispose = function() {
    this._uiContext.getCollection().removeListener(this);
    this._div.innerHTML = "";
    this._div = null;
    this._uiContext = null;
    this._settings = null;
    this._accessors = null;
    this._log = null;
}

Exhibit.EditLogView.prototype.reset = function() {
    this._log = new Exhibit.OrderedDictionary();
    this._comment = "";
    this._initializeUI();
}


//=============================================================================
// Item Change Listener methods
//=============================================================================

function itemChange(itemID, type) {
    return { 
        label: itemID,
        initialLabel: itemID,
        type:  type, 
        edits: new Exhibit.OrderedDictionary()
    };
}

function propertyChange(prop, origVal) {
    return {
        property: prop,
        originalValue: origVal
    };
}

Exhibit.EditLogView.prototype.onItemAdded = function(itemID) {
    this._log.put(itemID, itemChange(itemID, 'added'));
    this._initializeUI();
}

Exhibit.EditLogView.prototype.onItemModified = function(itemID, prop, oldVal, newVal) {
    var defaultItem = itemChange(itemID, 'modified');
    
    var item = this._log.get(itemID, defaultItem);
    var allEdits = item.edits;
    var edit = allEdits.get(prop, propertyChange(prop, oldVal));
    
    // need to rename links in log structure
    if (prop == 'label') {
        this._log.rekey(oldVal, newVal);
        item.label = newVal;
        itemID = newVal;
    }

    edit.value = newVal;
    
    if (edit.originalValue == newVal) {
        allEdits.remove(prop);
        
        if (allEdits.size() == 0) {
            this._log.remove(itemID);
        }
    }
    
    this._initializeUI();
}


//=============================================================================
// UI functionality
//=============================================================================


function makePlaceholder(view) {
    return $('<span>')
        .addClass('placeholderText')
        .text(view._settings.placeholderText);
}

function highlight(text) {
    return $('<span>').addClass('highlight').text(text);
}

function makeItemHeader(item) {
    var header = $('<ul>');
    var headerLabel = ' was ' + item.type;
    
    var headerText = $('<span>')
        .attr('itemID', item.label)
        .text(item.label + headerLabel)
        .addClass('headerText');

    header.append(headerText);
    return header;
}

function makeRevertFunc(label, prop, currentVal, desiredVal) {
    return function() {    
        try {
            Exhibit.Curate.modifyItem(label, prop, desiredVal);
        } catch (e if e instanceof Exhibit.Database.LabelUniquenessError) {
            alert('Cannot revert name of ' + currentVal +
                ' to ' + desiredVal + ', as another ' +
                'item now has that name.');
        }
    }
}

function makeRevertLink(item, edit) {
    var f = makeRevertFunc(
        item.label, edit.property,
        edit.value, edit.originalValue);
    return link(f, '[revert]', 'revertEditLink');
}

function makeChangedPropertyDescription(item, edit) {
    var list = $('<li>');
    
    if (item.type == 'modified') {
        list.append(
            highlight(edit.property), ' was changed from ', 
            highlight(edit.originalValue), ' to ', 
            highlight(edit.value));
    } else {
        list.append(
            highlight(edit.property), ' was set to ', 
            highlight(edit.value));
    }
    
    if (edit.originalValue) {
        list.append(makeRevertLink(item, edit));
    }
    
    return list;
}

function makeItemChangeList(item) {
    var header = makeItemHeader(item);
         
    item.edits.values().forEach(function(edit) {
        makeChangedPropertyDescription(item, edit).appendTo(header);
    });
    
    return header;
}

function makeChangeList(view) {
    var list = $('<div>').addClass('ChangeList');
    
    view._log.values().forEach(function(item) {
        list.append(makeItemChangeList(item));
    });
    
    return list;
}

function makeEditLog(view) {    
    var editLog = $('<div>')
        .addClass('ListContainer')
        .append(makeChangeList(view));
    
    var commentInput = $('<input>')
        .val(view._comment || "enter a comment describing your changes")
        .addClass('commentField')
        .change(function() { view._comment = $(this).val() });

    var submitButton = $('<input type="submit">')
        .val('Submit Changes')
        .addClass('submitButton')
        .click(function() { view.submitChanges() })
        
    editLog.append(commentInput, submitButton);
    return editLog;
}

Exhibit.EditLogView.prototype._initializeUI = function() {
    var header = $('<h1>').text(this._settings.headerText);
    var errorMsg = $('<p>').addClass('errorMessage').hide();
    var editLog = this._log.size() > 0
        ? makeEditLog(this)
        : makePlaceholder(this);
    
    this._div.empty().append(header, errorMsg, editLog);
}


//=============================================================================
// Change submission
//=============================================================================


function attr(name) {
    return function() { return this[name] };
}

function findExhibitDataURL() {
    var dataString = 'head link[rel=exhibit/data]';
    return $(dataString).map(attr('href'))[0];
}

function assert(obj, msg) {
    if (obj) { return obj } 
    else { SimileAjax.Debug.log(msg) }
}

Exhibit.EditLogView.prototype.submissionLocation = function() {
    return assert(this._settings.submitTo || findExhibitDataURL(),
        "no location to submit changes to");
}

Exhibit.EditLogView.prototype.makeSubmissionMessage = function() {
    var message = {};
    
    if (this._comment) {
        message.comment = this._comment;
    }
    
    var edits = this._log.values().map(function(item) {
        // because curators are familiar with existing items,
        // the original item label is used if the item is not new
        var label = item.type == 'modified' ? 
            item.initialLabel : 
            item.label;
        
        return { 
            label: label,
            type: item.type, 
            values: item.edits.values()
        };
    });
    
    message.edits = edits;
    return message;
}

function handleSubmitError(resp) {
    SimileAjax.Debug.log(resp)
    $('.EditLog > .errorMessage')
        .text('Unable to submit changes: ' + resp).show();
    $('.EditLog input.submitButton').attr('disabled', false);
}

function makeSuccessHandler(view) {
    return function(resp) {
        view.reset(); // this triggers redraw
        var successMsg = 'Submission successful! Feel free to edit further.';
        $('.placeholderText').text(successMsg);
    }
}

Exhibit.EditLogView.prototype.submitChanges = function() {
    var message = this.makeSubmissionMessage();
    var json = SimileAjax.JSON.toJSONString(message);
    
    $('.EditLog input.submitButton').attr('disabled', false);
    
    $.ajax({
        type: "POST",
        data: "message=" + json,
        url: this._settings.submitTo,
        success: makeSuccessHandler(this),
        error: handleSubmitError
    });
}

})();