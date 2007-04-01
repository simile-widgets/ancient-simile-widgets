/*==================================================
 *  Exhibit.CollectionSummaryWidget
 *==================================================
 */
Exhibit.CollectionSummaryWidget = function(containerElmt, uiContext) {
    this._exhibit = uiContext.getExhibit();
    this._collection = uiContext.getCollection();
    this._div = containerElmt;
    
    var widget = this;
    this._listener = { onItemsChanged: function() { widget._reconstruct(); } };
    this._collection.addListener(this._listener);
};

Exhibit.CollectionSummaryWidget.create = function(configuration, containerElmt, uiContext) {
    var widget = new Exhibit.CollectionSummaryWidget(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    widget._initializeUI();
    return widget;
};

Exhibit.CollectionSummaryWidget.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var widget = new Exhibit.CollectionSummaryWidget(
        containerElmt != null ? containerElmt : configElmt, 
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    widget._initializeUI();
    return widget;
};

Exhibit.CollectionSummaryWidget.prototype.dispose = function() {
    this._collection.removeListener(this._listener);
    this._div.innerHTML = "";
    
    this._allResultsDom = null;
    this._filteredResultsDom = null;
    this._div = null;
    this._collection = null;
    this._exhibit = null;
};

Exhibit.CollectionSummaryWidget.prototype._initializeUI = function() {
    var self = this;
    
    var l10n = Exhibit.CollectionSummaryWidget.l10n;
    var onClearFilters = function(elmt, evt, target) {
        self._resetCollection();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    }

    this._allResultsDom = SimileAjax.DOM.createDOMFromString(document, "span", 
        String.substitute(
            l10n.allResultsTemplate,
            [ "exhibit-collectionSummaryWidget-count", "exhibit-collectionSummaryWidget-types" ]
        )
    );
    this._filteredResultsDom = SimileAjax.DOM.createDOMFromString(document, "span", 
        String.substitute(
            l10n.filteredResultsTemplate,
            [ "exhibit-collectionSummaryWidget-count", "exhibit-collectionSummaryWidget-types" ]
        ),
        {   resetActionLink: Exhibit.UI.makeActionLink(l10n.resetFiltersLabel, onClearFilters)
        }
    );
    
    this._div.innerHTML = "";
    this._reconstruct();
};

Exhibit.CollectionSummaryWidget.prototype._reconstruct = function() {
    var originalSize = this._collection.countAllItems();
    var currentSize = this._collection.countRestrictedItems();
    var dom = this._dom;
    
    this._div.innerHTML = "";
    if (originalSize > 0) {
        if (currentSize == 0) {
            this._div.appendChild(this._noResultsDom.elmt);
        } else {
            var typeLabels = database.getTypeLabels(this._collection.getRestrictedItems())[currentSize > 1 ? 1 : 0];
            var typeLabel = (typeLabels.length > 0 && typeLabels.length <= 3) ?
                Exhibit.l10n.composeListString(typeLabels) :
                Exhibit.Database.l10n.itemType.pluralLabel;
            
            if (currentSize == originalSize) {
                this._div.appendChild(this._allResultsDom.elmt);
                this._allResultsDom.currentCountSpan.innerHTML = currentSize;
                this._allResultsDom.typesSpan.innerHTML = typeLabel;
            } else {
                this._div.appendChild(this._filteredResultsDom.elmt);
                this._filteredResultsDom.currentCountSpan.innerHTML = currentSize;
                this._filteredResultsDom.originalCountSpan.innerHTML = originalSize;
                this._filteredResultsDom.typesSpan.innerHTML = typeLabel;
            }
        }
    }
};

Exhibit.CollectionSummaryWidget.prototype._resetCollection = function() {
    var state = {};
    var collection = this._collection;
    
    SimileAjax.History.addLengthyAction(
        function() { state.restrictions = collection.clearAllRestrictions(); },
        function() { collection.applyRestrictions(state.restrictions); },
        Exhibit.CollectionSummaryWidget.l10n.resetActionTitle
    );
};
