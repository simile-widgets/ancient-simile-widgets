//=============================================================================
// Database Extensions
// Mismatch between RDF model and item model ??
//=============================================================================

Exhibit.Database.LabelUniquenessError = function(label) {
   this.label = label;
}

Exhibit.Database._Impl.prototype.ensureUniqueness = function(label) {
    if (this.containsItem(label)) {
        throw new Exhibit.Database.LabelUniquenessError(label);
    }
}

Exhibit.Database._Impl.prototype.addItem = function(item) {
    this.ensureUniqueness(item.label);
    this.loadItems([item], Exhibit.Persistence.getItemLink(item));
};

Exhibit.Database._Impl.prototype.modifyItem = function(itemID, prop, newVal) {
    if (prop == 'label') {
        this.renameItem(itemID, newVal);
        return;
    }
        
    var oldVal = this.getObject(itemID, prop);
    
    this.removeStatement(itemID, prop, oldVal);
    this.addStatement(itemID, prop, newVal);
    this.getProperty(prop)._onNewData(); // flush property._rangeIndex
};

Exhibit.Database._Impl.prototype.renameItem = function(oldID, newID) {
    this.ensureUniqueness(newID);
    this._items.remove(oldID);
    
    var subject = this._spo[oldID];
    var item = { label: newID };
    
    for (var prop in subject) {
        var obj = subject[prop][0];
        this.removeStatement(oldID, prop, obj);
        
        if (prop != 'uri' && prop != 'label') {
            item[prop] = obj;
        }
    }

    this.addItem(item); // this flushes property._rangeIndex

    // needed to flush collection._items
    this._listeners.fire("onAfterLoadingItems", []);
};