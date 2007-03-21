/*==================================================
 *  Exhibit.NumericRangeFacet
 *==================================================
 */

Exhibit.NumericRangeFacet = function(collection, containerElmt, exhibit) {
    this._collection = collection;
    this._div = containerElmt;
    this._exhibit = exhibit;
    
    this._path = null;
    this._facetLabel = null;
    this._interval = 10;
    
    this._dom = null;
    this._ranges = [];
};

Exhibit.NumericRangeFacet.create = function(configuration, containerElmt, exhibit) {
    var collection = Exhibit.Collection.getCollection(configuration, exhibit);
    var facet = new Exhibit.NumericRangeFacet(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        exhibit
    );
    
    Exhibit.NumericRangeFacet._configure(facet, configuration);
    
    facet._initializeUI();
    collection.addFacet(facet);
    
    return facet;
};

Exhibit.NumericRangeFacet.createFromDOM = function(configElmt, containerElmt, exhibit) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var collection = Exhibit.Collection.getCollectionFromDOM(configElmt, configuration, exhibit);
    var facet = new Exhibit.NumericRangeFacet(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        exhibit
    );
    
    try {
        var expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString != null && expressionString.length > 0) {
            var expression = Exhibit.Expression.parse(expressionString);
            if (expression.isPath()) {
                facet._path = expression.getPath();
            }
        }
        
        var facetLabel = Exhibit.getAttribute(configElmt, "facetLabel");
        if (facetLabel != null && facetLabel.length > 0) {
            facet._facetLabel = facetLabel;
        }
        
        var interval = Exhibit.getAttribute(configElmt, "interval");
        if (interval != null && interval.length > 0) {
            facet._interval = parseFloat(interval);
        }
    } catch (e) {
        SimileAjax.Debug.exception("NumericRangeFacet: Error processing configuration of numeric range facet", e);
    }
    
    facet._initializeUI();
    collection.addFacet(facet);
    
    return facet;
};

Exhibit.NumericRangeFacet._configure = function(facet, configuration) {
    if ("expression" in configuration) {
        var expression = Exhibit.Expression.parse(configuration.expression);
        if (expression.isPath()) {
            facet._path = expression.getPath();
        }
    }
    if ("facetLabel" in configuration) {
        facet._facetLabel = configuration.facetLabel;
    }
    if ("interval" in configuration) {
        facet._interval = configuration.interval;
    }
}

Exhibit.NumericRangeFacet.prototype.dispose = function() {
    this._dom.close();
    this._dom = null;
    
    this._collection = null;
    this._div = null;
    this._exhibit = null;
};

Exhibit.NumericRangeFacet.prototype.hasRestrictions = function() {
    return this._ranges.length > 0;
};

Exhibit.NumericRangeFacet.prototype.clearAllRestrictions = function() {
    var restrictions = [];
    if (this._ranges.length > 0) {
        restrictions = restrictions.concat(this._ranges);
        this._ranges = [];
        this._notifyCollection();
    }
    return restrictions;
};

Exhibit.NumericRangeFacet.prototype.applyRestrictions = function(restrictions) {
    this._ranges = restrictions;
    this._notifyCollection();
};

Exhibit.NumericRangeFacet.prototype.setRange = function(from, to, selected) {
    if (selected) {
        for (var i = 0; i < this._ranges.length; i++) {
            var range = this._ranges[i];
            if (range.from == from && range.to == to) {
                return;
            }
        }
        this._ranges.push({ from: from, to: to });
    } else {
        for (var i = 0; i < this._ranges.length; i++) {
            var range = this._ranges[i];
            if (range.from == from && range.to == to) {
                this._ranges.splice(i, 1);
                break;
            }
        }
    }
    this._notifyCollection();
}

Exhibit.NumericRangeFacet.prototype.restrict = function(items) {
    var path = this._path;
    var database = this._exhibit.getDatabase();
    
    var set = new Exhibit.Set();
    for (var i = 0; i < this._ranges.length; i++) {
        var range = this._ranges[i];
        set.addSet(path.rangeBackward(range.from, range.to, items, database).values);
    }
    return set;
};

Exhibit.NumericRangeFacet.prototype.update = function(items) {
    this._dom.valuesContainer.style.display = "none";
    this._dom.valuesContainer.innerHTML = "";
    
    this._reconstruct(items);
    this._dom.valuesContainer.style.display = "block";
};

Exhibit.NumericRangeFacet.prototype._reconstruct = function(items) {
    var database = this._exhibit.getDatabase();
    
    var propertyID = this._path.getLastSegment().property;
    var property = database.getProperty(propertyID);
    if (property == null) {
        return null;
    }
    
    var rangeIndex = property.getRangeIndex();
    var min = rangeIndex.getMin();
    var max = rangeIndex.getMax();
    min = Math.floor(min / this._interval) * this._interval;
    max = Math.ceil(max / this._interval) * this._interval;
    
    var ranges = [];
    for (var x = min; x < max; x += this._interval) {
        var range = { 
            from:       x, 
            to:         x + this._interval, 
            selected:   false
        };
        range.items = this._path.rangeBackward(range.from, range.to, items, database).values
        
        for (var i = 0; i < this._ranges.length; i++) {
            var range2 = this._ranges[i];
            if (range2.from == range.from && range2.to == range.to) {
                range.selected = true;
                break;
            }
        }
        
        ranges.push(range);
    }
    
    var self = this;
    var containerDiv = this._dom.valuesContainer;
    var makeFacetValue = function(from, to, count, selected) {
        var onSelect = function(elmt, evt, target) {
            self._toggleRange(from, to, selected);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        };
        var valueDom = Exhibit.NumericRangeFacet.theme.constructFacetItem(
            self._exhibit,
            from + " - " + to, 
            count, 
            selected, 
            onSelect
        );
        containerDiv.appendChild(valueDom.elmt);
    };
    
    for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];
        if (range.selected || range.items.size() > 0) {
            makeFacetValue(range.from, range.to, range.items.size(), range.selected);
        }
    }
    this._dom.setSelectionCount(this._ranges.length);
}

Exhibit.NumericRangeFacet.prototype._notifyCollection = function() {
    this._collection.onFacetUpdated(this);
};

Exhibit.NumericRangeFacet.prototype._initializeUI = function() {
    var facet = this;

    var onClearSelections = function(elmt, evt, target) {
        facet._clearSelections();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    
    this._dom = Exhibit.NumericRangeFacet.theme.constructFacetFrame(
        this._exhibit,
        this._div,
        this._facetLabel,
        onClearSelections,
        { frame:facet._facetLabel }
    );
    this._dom.open();
};

Exhibit.NumericRangeFacet.prototype._toggleRange = function(from, to, selected) {
    var self = this;
    var range = from + " to " + to;
    SimileAjax.History.addAction({
        perform: function() {
            self.setRange(from, to, !selected);
        },
        undo: function() {
            self.setRange(from, to, selected);
        },
        label: selected ?
            ("Remove range " + range + " from " + this._facetLabel) :
            ("Add range " + range + " to " + this._facetLabel),
        uiLayer: SimileAjax.WindowManager.getBaseLayer(),
        lengthy: true
    });
};

Exhibit.NumericRangeFacet.prototype._clearSelections = function() {
    var state = {};
    var self = this;
    SimileAjax.History.addAction({
        perform: function() {
            state.restrictions = self.clearAllRestrictions();
        },
        undo: function() {
            self.applyRestrictions(state.restrictions);
        },
        label: "clear selections",
        uiLayer: SimileAjax.WindowManager.getBaseLayer(),
        lengthy: true
    });
};
