//=============================================================================
// ChangeListView
// Tracks changes made to Exhibit items through item changing interfaces, and
// provides an interface for enabling/disabling changes, and submitting the
// changes to a backend data source.
//=============================================================================


(function() {

var $ = SimileAjax.jQuery;

//=============================================================================
// Exhibit View Boilerplate
//=============================================================================

function stripWhitespace(s) {
    return s.replace(/\s{2,}/g, ' ');
}

function addMockData(view) {
    view._uiContext.getDatabase().addStatement('Gone With The Wind', 'label', 'Gone With The Wind')
    view.onItemAdded('Gone With The Wind', 'book');
    view.onItemModified('Gone With The Wind', 'author', '', 'Margaret Mitchell');
    view.onItemModified('Gone With The Wind', 'year', '', '1936');
    view.onItemModified('Gone With The Wind', 'availability', '', 'available');
    view.onItemModified('Gone With The Wind', 'owner', '', 'Sarah');
    view.onItemModified('Gone With The Wind', 'description', '', 'Going down south.');
}

Exhibit.ChangeListView = function(containerElmt, uiContext) {
    this._div = $(containerElmt);
    this._uiContext = uiContext;
    this._settings = {};
    this._accessors = {};
    
    if (this._div.children().length == 0) {
        this._template = $(stripWhitespace(Exhibit.ChangeListView.defaultTemplate));
    } else {
        this._template = this._div.children().clone();
        this._div.empty();
    }

    this._changes = new Exhibit.OrderedDictionary();
    this._submissionInfo = {};
    
    uiContext.getDatabase().addListener(this);
    addMockData(this);
}


Exhibit.ChangeListView._settingSpecs = {
    submitTo:        { type: "text", defaultValue: "http://valinor.mit.edu/sostler/gdocbackend.cgi" },
    spreadsheetKey:  { type: "text" },
    worksheetName:   { type: "text", defaultValue: "submissions"}
};

Exhibit.ChangeListView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.ChangeListView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );

    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        Exhibit.ChangeListView._settingSpecs,
        view._settings);

    view._initializeUI();
    return view;
};

Exhibit.ChangeListView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var view = new Exhibit.ChangeListView(
        containerElmt != null ? containerElmt : configElmt, 
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );

    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        configElmt, 
        Exhibit.ChangeListView._settingSpecs, 
        view._settings);

    Exhibit.SettingsUtilities.collectSettings(
        configuration, 
        Exhibit.ChangeListView._settingSpecs, 
        view._settings);

    view._initializeUI();
    return view;
};

Exhibit.ChangeListView.prototype.dispose = function() {
    this._uiContext.getCollection().removeListener(this);
    this._div.innerHTML = "";
    this._div = null;
    this._uiContext = null;
    this._settings = null;
    this._accessors = null;
    this._changes = null;
    this._submissionInfo = null;
}

Exhibit.ChangeListView.prototype.reset = function() {
    this._changes = new Exhibit.OrderedDictionary();
    this._initializeUI();
    this._submissionInfo = {};
}


//=============================================================================
// Item Change Listener methods
//=============================================================================

function makeItemChange(itemID, changeType, itemType) {
    var c = { 
        id: itemID,
        type: changeType,
        enabled: true,
        changes: new Exhibit.OrderedDictionary()
    };
    if (itemType) { c.itemType = itemType }
    return c;
}

function makePropertyChange(prop, origVal, newVal) {
    return {
        prop: prop,
        origVal: origVal,
        newVal: newVal
    };
}

Exhibit.ChangeListView.prototype.onItemAdded = function(itemID, itemType) {
    var db = this._uiContext.getDatabase();
    var itemChange = makeItemChange(itemID, 'added', itemType);

    db.getAllProperties().forEach(function(prop) {
        var value = db.getObject(itemID, prop);
        if (value) {
            var propChange = makePropertyChange(prop, null, value);
            itemChange.changes.put(prop, propChange);
        }
    });
    
    this._changes.put(itemID, itemChange);
    this._initializeUI();
}

Exhibit.ChangeListView.prototype.onItemModified = function(itemID, prop, prevVal, newVal) {
    if (!this._changes.has(itemID)) {
        this._changes.put(itemID, makeItemChange(itemID, 'modified'));
    }
    var itemChange = this._changes.get(itemID);
    var origChange = itemChange.changes.get(prop);

    if (!origChange) {
        var propChange = makePropertyChange(prop, prevVal, newVal);
        itemChange.changes.put(prop, propChange);
    } else {
        if (origChange.origVal == newVal) {
            itemChange.changes.remove(prop);
            if (itemChange.type =='modified' && itemChange.changes.size() == 0) {
                this._changes.remove(itemID);
            }
        } else {
            origChange.newVal = newVal;
        }
    }
    this._initializeUI();
}


//=============================================================================
// UI templating
//=============================================================================


function getByAttr(parent, attr, value) {
    var f = function( ) { 
        if (value === undefined) {
            return $(this).attr(attr) !== undefined;
        } else {
            return $(this).attr(attr) == value;
        }
    }
    return parent.find('*').filter(f);
}


Exhibit.ChangeListView.defaultTemplate = '                                  \
<span class="editView-header">Changes</span>                                \
<div class="editView-changeList">                                           \
    <div class="changeList-placeholder">                                    \
        To begin editing this Exhibit, click on the edit link.              \
    </div>                                                                  \
    <div class="changeList-item">                                           \
        <div class="item-label"></div>                                      \
        <div class="item-edit">                                             \
            <span class="edit-property"></span>                             \
            changed to                                                      \
            <span class="edit-newValue"></span>                             \
        </div>                                                              \
    </div>                                                                  \
</div>                                                                      \
<input type="button" class="editView-submitButton"                          \
       value="Submit Changes" />                                            \
';

Exhibit.ChangeListView.ignoredProperties = ['id', 'uri', 'type']

Exhibit.ChangeListView.prototype.makeViewFromTemplate = function() {
    var view = this;
    var db = this._uiContext.getDatabase();
    var template = this._template.clone();

    if (this._changes.size() == 0) {
        getByAttr(template, 'ex:role', 'item').remove();
    } else {
        getByAttr(template, 'ex:role', 'placeholder').remove();
        var changeContainer = $('<div>');
        
        template.find('[submissionInfo]').each(function() {
            var attr = $(this).attr('submissionInfo');
            $(this).val(view._submissionInfo[attr]);
            $(this).change(function(){
                view._submissionInfo[attr] = $(this).val();
            });
        });
        this._changes.values().forEach(function(item) {
            var itemTemplate = getByAttr(template, 'ex:role', 'item').addClass('edit-item').clone();
            var label = db.getObject(item.id, 'label') || db.getObject(item.id, 'id');
            var editContainer = $('<div>');
            
            getByAttr(itemTemplate, 'ex:itemRole', 'label').text(label);
            
            item.changes.values().forEach(function(edit) {
                if (Exhibit.ChangeListView.ignoredProperties.indexOf(edit.prop) == -1) {
                    var editTemplate = getByAttr(itemTemplate, 'ex:itemRole', 'edit').clone().addClass('edit-entry');

                    getByAttr(editTemplate, 'ex:editRole', 'property').addClass('edit-property').text(edit.prop);
                    getByAttr(editTemplate, 'ex:editRole', 'old-value').addClass('edit-old-value').text(edit.origVal);
                    getByAttr(editTemplate, 'ex:editRole', 'new-value').addClass('edit-new-value').text(edit.newVal);

                    editContainer.append(editTemplate);
                }
            });
            
            getByAttr(itemTemplate, 'ex:itemRole', 'edit').replaceWith(editContainer);
            changeContainer.append(itemTemplate);
        });
        
        getByAttr(template, 'ex:role', 'item').replaceWith(changeContainer);
        
    }
    getByAttr(template, 'ex:role', 'submit-button').click(function() { view.submitChanges() });
    return template;
}

Exhibit.ChangeListView.prototype._initializeUI = function() {
    this._div.empty();
    this._div.append(this.makeViewFromTemplate());
}


//=============================================================================
// Change submission
//=============================================================================

Exhibit.ChangeListView.prototype.makeSubmissionMessage = function() {
    var view = this;
    var message = []
    
    var changes = this._changes.values().forEach(function(item) {  
        var submission = {
            type: item.itemType,
            id: item.id
        };
        
        for (var i in view._submissionInfo) {
            submission[i] = view._submissionInfo[i];
        }
        
        item.changes.values().forEach(function(edit){
            submission[edit.prop] = edit.newVal;
        });
        if (!submission.label) {
            submission.label = submission.id;
        }
        message.push(submission);
    });
    
    return message;
}

var ignoredParams = ['rel'];

function parseSubmissionParams() {
    var sub = $('head link[rel="exhibit/submission"]').get(0);
    if (!sub) { return {} };
    var params = {};

    for (var i in sub.attributes) {
        if (sub.attributes.hasOwnProperty(i)) {
            var node = sub.attributes[i];   
            if (ignoredParams.indexOf(node.nodeName) == -1) {
                params[node.nodeName] = node.nodeValue;
            }
        }
    }
    return params;
}

Exhibit.ChangeListView.prototype.submitChanges = function() {
    var view = this;
    var ss = this._settings.spreadsheetKey;
    var wkname = this._settings.worksheetName;
    var message = this.makeSubmissionMessage();
    var str = SimileAjax.JSON.toJSONString(message);
    
    var error = function(xhr, textStatus, errorThrown) {
        alert("Error submitting changes: " + xhr.responseText);
        view._div.find('.editView-submitButton').attr('disabled', false);
    };
    
    var success = function(data) {
        view.reset(); // trigger redraw
        view._div.find('.editView-submitButton').attr('disabled', false);

        var successMsg = 'Submission successful! Feel free to edit further.';
        view._div.find('.changeList-placeholder').text(successMsg);
    };
    
    this._div.find('.editView-submitButton').attr('disabled', true);
    
    var params = parseSubmissionParams();
    console.log(params)
    params['message'] = str;
    
    $.ajax({
        url: this._settings.submitTo,
        dataType: 'jsonp',
        jsonp: 'callback',
        data: params, //'ss='+ ss + '&wkname=' + wkname + '&message='+str,
        success: success,
        error: error  
    });
}

})();