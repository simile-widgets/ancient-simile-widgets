/*==================================================
 *  Exhibit.NumericRangeFacet
 *==================================================
 */

Exhibit.NumericRangeFacet = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;
    
    this._path = null;
    this._settings = {};
    
    this._dom = null;
    this._ranges = [];
};

Exhibit.NumericRangeFacet._settingSpecs = {
    "facetLabel":       { type: "text" },
    "interval":         { type: "float", defaultValue: 10 }
};

Exhibit.NumericRangeFacet.create = function(configuration, containerElmt, uiContext) {
    var facet = new Exhibit.NumericRangeFacet(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    
    Exhibit.NumericRangeFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    
    return facet;
};

Exhibit.NumericRangeFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var facet = new Exhibit.NumericRangeFacet(
        containerElmt != null ? containerElmt : configElmt, 
        Exhibit.UIContext.create(configuration, uiContext)
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.NumericRangeFacet._settingSpecs, facet._settings);
    
    try {
        var expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString != null && expressionString.length > 0) {
            var expression = Exhibit.Expression.parse(expressionString);
            if (expression.isPath()) {
                facet._path = expression.getPath();
            }
        }
    } catch (e) {
        SimileAjax.Debug.exception("NumericRangeFacet: Error processing configuration of numeric range facet", e);
    }
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    
    return facet;
};

Exhibit.NumericRangeFacet._configure = function(facet, configuration) {
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.NumericRangeFacet._settingSpecs, facet._settings);
    
    if ("expression" in configuration) {
        var expression = Exhibit.Expression.parse(configuration.expression);
        if (expression.isPath()) {
            facet._path = expression.getPath();
        }
    }
}

Exhibit.NumericRangeFacet.prototype.dispose = function() {
    this._div.innerHTML = "";
    
    this._div = null;
    this._uiContext = null;
    
    this._path = null;
    this._settings = null;
    this._dom = null;
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
    if (this._ranges.length == 0) {
        return items;
    } else {
        var path = this._path;
        var database = this._uiContext.getDatabase();
        
        var set = new Exhibit.Set();
        for (var i = 0; i < this._ranges.length; i++) {
            var range = this._ranges[i];
            set.addSet(path.rangeBackward(range.from, range.to, items, database).values);
        }
        return set;
    }
};

Exhibit.NumericRangeFacet.prototype.update = function(items) {
    this._dom.valuesContainer.style.display = "none";
    this._dom.valuesContainer.innerHTML = "";
    
    this._reconstruct(items);
    this._dom.valuesContainer.style.display = "block";
};

Exhibit.NumericRangeFacet.prototype._reconstruct = function(items) {
    var self = this;
    var database = this._uiContext.getDatabase();
    
    var propertyID = this._path.getLastSegment().property;
    var property = database.getProperty(propertyID);
    if (property == null) {
        return null;
    }
    
    var rangeIndex = property.getRangeIndex();
    var min = rangeIndex.getMin();
    var max = rangeIndex.getMax();
    min = Math.floor(min / this._settings.interval) * this._settings.interval;
    max = Math.ceil(max / this._settings.interval) * this._settings.interval;
    
    var ranges = [];
    for (var x = min; x < max; x += this._settings.interval) {
        var range = { 
            from:       x, 
            to:         x + this._settings.interval, 
            selected:   false
        };
        range.items = this._path.rangeBackward(range.from, range.to, items, database).values
        
        for (var i = 0; i < this._ranges.length; i++) {
            var range2 = this._ranges[i];
            if (range2.from == range.from && range2.to == range.to) {
                range.selected = true;
                facetHasSelection = true;
                break;
            }
        }
        
        ranges.push(range);
    }
    
    var facetHasSelection = this._ranges.length > 0;
    var containerDiv = this._dom.valuesContainer;
    containerDiv.style.display = "none";
        var makeFacetValue = function(from, to, count, selected) {
            var onSelect = function(elmt, evt, target) {
                self._toggleRange(from, to, selected);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            };
            var elmt = Exhibit.FacetUtilities.constructFacetItem(
                from + " - " + to, 
                count, 
                selected, 
                facetHasSelection,
                onSelect
            );
            containerDiv.appendChild(elmt);
        };
        
        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            if (range.selected || range.items.size() > 0) {
                makeFacetValue(range.from, range.to, range.items.size(), range.selected);
            }
        }
    containerDiv.style.display = "block";
    
    this._dom.setSelectionCount(this._ranges.length);
}

Exhibit.NumericRangeFacet.prototype._notifyCollection = function() {
    this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.NumericRangeFacet.prototype._initializeUI = function() {
    var facet = this;

    var onClearSelections = function(elmt, evt, target) {
        facet._clearSelections();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    
    this._dom = Exhibit.FacetUtilities.constructFacetFrame(
        this._div,
        this._settings.facetLabel,
        onClearSelections
    );
};

Exhibit.NumericRangeFacet.prototype._toggleRange = function(from, to, oldSelected) {
    var self = this;
    var label = from + " to " + to;
    var selected = !oldSelected;
    SimileAjax.History.addLengthyAction(
        function() { self.setRange(from, to, selected); },
        function() { self.setRange(from, to, oldSelected); },
        String.substitute(
            Exhibit.FacetUtilities.l10n[selected ? "facetSelectActionTitle" : "facetUnselectActionTitle"],
            [ label, this._settings.facetLabel ])
    );
};

Exhibit.NumericRangeFacet.prototype._clearSelections = function() {
    var state = {};
    var self = this;
    SimileAjax.History.addLengthyAction(
        function() { state.restrictions = self.clearAllRestrictions(); },
        function() { self.applyRestrictions(state.restrictions); },
        String.substitute(
            Exhibit.FacetUtilities.l10n["facetClearSelectionsActionTitle"],
            [ this._settings.facetLabel ])
    );
};
