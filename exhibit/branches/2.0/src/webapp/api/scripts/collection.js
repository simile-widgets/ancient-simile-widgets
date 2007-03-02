/*======================================================================
 *  Collection
 *======================================================================
 */
Exhibit.Collection = function(database) {
    this._database = database;
    
    this._listeners = new SimileAjax.ListenerQueue();
    this._facets = [];
    this._updating = false;
    
    this._items = null;
    this._restrictedItems = null;
    
    var self = this;
    this._listener = { 
        onAfterLoadingItems: function() { 
            self._update();
        } 
    };
    database.addListener(this._listener);
};

Exhibit.Collection.getCollection = function(configuration, exhibit) {
    var id = configuration["collectionID"];
    if (id == null) {
        return exhibit.getDefaultCollection();
    } else {
        return exhibit.getCollection(id);
    }
};

Exhibit.Collection.getCollectionFromDOM = function(elmt, configuration, exhibit) {
    var id = Exhibit.getAttribute(elmt, "collectionID");
    if (id == null) {
        return Exhibit.Collection.getCollection(configuration, exhibit);
    } else {
        return exhibit.getCollection(id);
    }
};

Exhibit.Collection.createFromDOM = function(elmt, database) {
    var collection = new Exhibit.Collection(database);
    
    var itemTypes = Exhibit.getAttribute(elmt, "itemTypes");
    if (itemTypes != null && itemTypes.length > 0) {
        itemTypes = itemTypes.split(",");
        for (var i = 0; i < itemTypes.length; i++) {
            itemTypes[i] = itemTypes[i].trim();
        }
        
        collection._itemTypes = itemTypes;
        collection._update = Exhibit.Collection._typeBasedCollection_update;
    } else {
        collection._update = Exhibit.Collection._allItemsCollection_update;
    }
    
    collection._update();
    
    return collection;
};

Exhibit.Collection.createAllItemsCollection = function(database) {
    var collection = new Exhibit.Collection(database);
    
    collection._update = Exhibit.Collection._allItemsCollection_update;
    collection._update();
    
    return collection;
};

/*======================================================================
 *  Implementation
 *======================================================================
 */
Exhibit.Collection._allItemsCollection_update = function() {
    this._items = this._database.getAllItems();
    this._onRootItemsChanged();
};

Exhibit.Collection._typeBasedCollection_update = function() {
    var newItems = new Exhibit.Set();
    for (var i = 0; i < this._itemTypes.length; i++) {
        this._database.getSubjects(this._itemTypes[i], "type", newItems);
    }
    
    this._items = newItems;
    this._onRootItemsChanged();
};

Exhibit.Collection.prototype.dispose = function() {
    this._database.removeListener(this._listener);
    this._database = null;
};

Exhibit.Collection.prototype.addListener = function(listener) {
    this._listeners.add(listener);
};

Exhibit.Collection.prototype.removeListener = function(listener) {
    this._listeners.remove(listener);
};

Exhibit.Collection.prototype.addFacet = function(facet) {
    this._facets.push(facet);
    
    if (facet.hasRestrictions()) {
        this._computeRestrictedItems();
        this._updateFacets(null);
    } else {
        facet.update(this.getRestrictedItems());
    }
};

Exhibit.Collection.prototype.removeFacet = function(facet) {
    for (var i = 0; i < this._facets.length; i++) {
        if (facet == this._facets[i]) {
            this._facets.splice(i, 1);
            if (facet.hasRestrictions()) {
                this._computeRestrictedItems();
                this._updateFacets(null);
            }
            break;
        }
    }
};

Exhibit.Collection.prototype.clearAllRestrictions = function() {
    var restrictions = [];
    
    this._updating = true;
    for (var i = 0; i < this._facets.length; i++) {
        restrictions.push(this._facets[i].clearAllRestrictions());
    }
    this._updating = false;
    
    this.onFacetUpdated(null);
    
    return restrictions;
};

Exhibit.Collection.prototype.applyRestrictions = function(restrictions) {
    this._updating = true;
    for (var i = 0; i < this._facets.length; i++) {
        this._facets[i].applyRestrictions(restrictions[i]);
    }
    this._updating = false;
    
    this.onFacetUpdated(null);
};

Exhibit.Collection.prototype.getAllItems = function() {
    return new Exhibit.Set(this._items);
};

Exhibit.Collection.prototype.countAllItems = function() {
    return this._items.size();
};

Exhibit.Collection.prototype.getRestrictedItems = function() {
    return new Exhibit.Set(this._restrictedItems);
};

Exhibit.Collection.prototype.countRestrictedItems = function() {
    return this._restrictedItems.size();
};

Exhibit.Collection.prototype.onFacetUpdated = function(facetChanged) {
    if (!this._updating) {
        this._computeRestrictedItems();
        this._updateFacets(facetChanged);
        this._listeners.fire("onItemsChanged", []);
    }
}

Exhibit.Collection.prototype._onRootItemsChanged = function() {
    this._computeRestrictedItems();
    this._updateFacets(null);
    this._listeners.fire("onItemsChanged", []);
};

Exhibit.Collection.prototype._updateFacets = function(facetChanged) {
    var restrictedFacetCount = 0;
    for (var i = 0; i < this._facets.length; i++) {
        if (this._facets[i].hasRestrictions()) {
            restrictedFacetCount++;
        }
    }
    
    for (var i = 0; i < this._facets.length; i++) {
        var facet = this._facets[i];
        if (facet.hasRestrictions()) {
            if (restrictedFacetCount <= 1) {
                facet.update(this.getAllItems());
            } else {
                var items = this.getAllItems();
                for (var j = 0; j < this._facets.length; j++) {
                    if (i != j) {
                        items = this._facets[j].restrict(items);
                    }
                }
                facet.update(items);
            }
        } else {
            facet.update(this.getRestrictedItems());
        }
    }
};

Exhibit.Collection.prototype._computeRestrictedItems = function() {
    this._restrictedItems = this._items;
    for (var i = 0; i < this._facets.length; i++) {
        var facet = this._facets[i];
        if (facet.hasRestrictions()) {
            this._restrictedItems = facet.restrict(this._restrictedItems);
        }
    }
};
