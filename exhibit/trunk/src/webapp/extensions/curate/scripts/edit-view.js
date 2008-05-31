//=============================================================================
// EditView
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

Exhibit.EditView = function(containerElmt, uiContext) {
    this._div = $(containerElmt);
    this._uiContext = uiContext;
    this._settings = {};
    this._accessors = {};
    
    if (this._div.children().length == 0) {
        this._template = $(stripWhitespace(Exhibit.EditView.defaultTemplate));
    } else {
        this._template = this._div.children().clone();
        this._div.empty();
    }

    this._changes = new Exhibit.OrderedDictionary();
    this._submissionInfo = {};
    
    uiContext.getDatabase().addListener(this);
    // addMockData(this);
}


Exhibit.EditView._settingSpecs = {
    submitTo:       { type: "text", defaultValue: "gdocbackend.py" },
    exhibitName:    { type: "text" }
};

Exhibit.EditView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.EditView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );

    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        Exhibit.EditView._settingSpecs,
        view._settings);

    view._initializeUI();
    return view;
};

Exhibit.EditView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var view = new Exhibit.EditView(
        containerElmt != null ? containerElmt : configElmt, 
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );

    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        configElmt, 
        Exhibit.EditView._settingSpecs, 
        view._settings);

    Exhibit.SettingsUtilities.collectSettings(
        configuration, 
        Exhibit.EditView._settingSpecs, 
        view._settings);

    view._initializeUI();
    return view;
};

Exhibit.EditView.prototype.dispose = function() {
    this._uiContext.getCollection().removeListener(this);
    this._div.innerHTML = "";
    this._div = null;
    this._uiContext = null;
    this._settings = null;
    this._accessors = null;
    this._changes = null;
    this._submissionInfo = null;
}

Exhibit.EditView.prototype.reset = function() {
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

Exhibit.EditView.prototype.onItemAdded = function(itemID, itemType) {
    this._changes.put(itemID, makeItemChange(itemID, 'added', itemType));
    this._initializeUI();
}

Exhibit.EditView.prototype.onItemModified = function(itemID, prop, prevVal, newVal) {
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
            if (itemChange.type =='modified' && itemChange.size() == 0) {
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

Exhibit.EditView.defaultTemplate = '                                        \
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

Exhibit.EditView.prototype.makeViewFromTemplate = function() {
    var view = this;
    var db = this._uiContext.getDatabase();
    var template = this._template.clone();

    if (this._changes.size() == 0) {
        template.find('.changeList-item').remove();
    } else {
        template.find('.changeList-placeholder').remove();
        var changeContainer = $('<div>');
        
        template.find('[submissionInfo]').each(function() {
            var attr = $(this).attr('submissionInfo');
            $(this).val(view._submissionInfo[attr]);
            $(this).change(function(){
                view._submissionInfo[attr] = $(this).val();
            });
        });
        
        this._changes.values().forEach(function(item) {
            var i = template.find('.changeList-item').clone();
            var label = db.getObject(item.id, 'label') || db.getObject(item.id, 'id');
            i.find('.item-label').text(label)

            var editContainer = $('<div>');
            
            item.changes.values().forEach(function(edit) {
                var e = i.find('.item-edit').clone();
                e.find('.edit-property').text(edit.prop)
                e.find('.edit-newValue').text(edit.newVal);
                e.find('.edit-origValue').text(edit.origVal);
                editContainer.append(e);
            });
            
            i.find('.item-edit').replaceWith(editContainer);
            changeContainer.append(i);
        });
        
        template.find('.changeList-item').replaceWith(changeContainer);
    }
    template.find('.editView-submitButton').click(function() { view.submitChanges() });
    return template;
}

Exhibit.EditView.prototype._initializeUI = function() {
    this._div.empty();
    this._div.append(this.makeViewFromTemplate());
}


//=============================================================================
// Change submission
//=============================================================================

Exhibit.EditView.prototype.makeSubmissionMessage = function() {
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

Exhibit.EditView.prototype.submitChanges = function() {
    var view = this;
    var url = this._settings.submitTo + '?callback=?';
    var exhibitName = this._settings.exhibitName;
    var message = this.makeSubmissionMessage();
    var str = SimileAjax.JSON.toJSONString(message);
    
    var err = function(xhr) {
        alert("Error submitting changes: " + xhr.responseText);
        view._div.find('editView-submitButton').attr('disabled', false);
    };
    
    this._div.find('.editView-submitButton').attr('disabled', true);
    
    $.getJSON(url, 'exhibitName='+exhibitName+'&message='+str,
        function(data) {
            view.reset(); // trigger redraw
            view._div.find('.editView-submitButton').attr('disabled', false);
            var successMsg = 'Submission successful! Feel free to edit further.';
            view._div.find('.changeList-placeholder').text(successMsg);
        }
    );
}

})();