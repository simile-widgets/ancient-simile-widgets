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

Exhibit.ChangeList = function(elmt, uiContext, settings) {
    this._div = $(elmt);
    this._uiContext = uiContext;
    this._justSubmitted = false; // true after successful submission; triggers displaying of submissionText
    uiContext.getDatabase().addListener(this);
    this.addMockData();
    this._initializeUI();
}


Exhibit.ChangeList._settingSpecs = {
    submissionText:  { type: "text", defaultValue: "Thanks for your submission! It has been sent to \
        exhibit author for approval." },
    placeholderText: { type: "text", defaultValue: "To begin editing this exhibit, click the \"edit\" \
        links on the exhibit items." }
};

Exhibit.UI.generateCreationMethods(Exhibit.ChangeList);
Exhibit.UI.registerComponent('change-list', Exhibit.ChangeList);

Exhibit.ChangeList.prototype.dispose = function() {
    this._uiContext.getCollection().removeListener(this);
    this._div.innerHTML = "";
    this._div = null;
    this._uiContext = null;
    this._settings = null;
}

Exhibit.ChangeList.prototype.reset = function() {
    this._initializeUI();
}

Exhibit.ChangeList.prototype.addMockData = function(view) {
    this._uiContext.getDatabase().addItem({
        label: 'Gone With The Wind',
        type: 'book',
        author: 'Margaret Mitchell',
        year: '1936',
        availability: 'available',
        owner: 'Sarah',
        description: 'Goin\' down south'
    });
    this._uiContext.getDatabase().editItem('White Noise', 'year', '1990');
    this._uiContext.getDatabase().editItem('White Noise', 'author', 'Don DeMan');
    this._uiContext.getDatabase().removeItem('Objectif Lune');
}


//=============================================================================
// UI templating
//=============================================================================

Exhibit.ChangeList.prototype.makePlaceholder = function() {
    var placeHolder = $('<span>').addClass('placeholderMessage')
    if (this._justSubmitted) {
        this._justSubmitted = false;
        placeHolder.text(this._settings.submissionText);
    } else {
        placeHolder.text(this._settings.placeholderText);
    }
    return placeHolder;
}

Exhibit.ChangeList.prototype.renderPropChange = function(prop, oldVal, newVal) {
    var t = function(t, c) { return $('<span>').text(t).addClass(c) }
    var div = $('<div>').addClass('property-change');

    if (oldVal) {
        div.append(
            t(prop, 'property-name'), ' was changed from ', 
            t(oldVal, 'old-value'), ' to ', 
            t(newVal, 'new-value'));
    } else {
        div.append(
            t(prop, 'property-name'), ' was set to ', 
            t(newVal, 'new-value'));
    }

    return div;
}

Exhibit.ChangeList.prototype.renderItem = function(item) {
    var labelText = item.label + " was " + item.change;
    var div = $('<div>').append(
        $('<div>').text(labelText).addClass('change-label')
    );
    
    if (item.change != 'deleted') {
        for (var prop in item.vals) {
            var v = item.vals[prop];
            div.append(this.renderPropChange(prop, v.oldVal, v.newVal));
        }
    }
    return div;
}

Exhibit.ChangeList.prototype._initializeUI = function() {
    this._div.empty();
    var view = this;
    var changes = this._uiContext.getDatabase().collectChanges();
    
    changes.sort(function(a,b) { return a.label > b.label });

    if (changes.length == 0) {
        this._div.append(makePlaceholder());
    } else {
        changes.forEach(function(item) {
            view._div.append(view.renderItem(item));
        });
    }
}

})();