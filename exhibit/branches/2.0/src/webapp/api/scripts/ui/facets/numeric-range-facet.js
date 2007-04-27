/*==================================================
 *  Exhibit.NumericRangeFacet
 *==================================================
 */

Exhibit.NumericRangeFacet = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;
    
    this._expression = null;
    this._settings = {};
    
    this._dom = null;
    this._ranges = [];
    
    var self = this;
    this._listener = { 
        onRootItemsChanged: function() {
            if ("_rangeIndex" in self) {
                delete self._rangeIndex;
            }
        }
    };
    uiContext.getCollection().addListener(this._listener);
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
            facet._expression = Exhibit.Expression.parse(expressionString);
        }
    } catch (e) {
        SimileAjax.Debug.exception(e, "NumericRangeFacet: Error processing configuration of numeric range facet");
    }
    Exhibit.NumericRangeFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    
    return facet;
};

Exhibit.NumericRangeFacet._configure = function(facet, configuration) {
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.NumericRangeFacet._settingSpecs, facet._settings);
    
    if ("expression" in configuration) {
        facet._expression = Exhibit.Expression.parse(configuration.expression);
    }
    
    if (!("facetLabel" in facet._settings)) {
        facet._settings.facetLabel = "missing ex:facetLabel";
        if (facet._expression != null && facet._expression.isPath()) {
            var segment = facet._expression.getPath().getLastSegment();
            var property = facet._uiContext.getDatabase().getProperty(segment.property);
            if (property != null) {
                facet._settings.facetLabel = segment.forward ? property.getLabel() : property.getReverseLabel();
            }
        }
    }
}

Exhibit.NumericRangeFacet.prototype.dispose = function() {
    this._uiContext.getCollection().removeListener(this._listener);
    this._uiContext = null;

    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
    
    this._expression = null;
    this._settings = null;
    this._ranges = null;
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
    } else if (this._expression.isPath()) {
        var path = this._expression.getPath();
        var database = this._uiContext.getDatabase();
        
        var set = new Exhibit.Set();
        for (var i = 0; i < this._ranges.length; i++) {
            var range = this._ranges[i];
            set.addSet(path.rangeBackward(range.from, range.to, items, database).values);
        }
        return set;
    } else {
        this._buildRangeIndex();
        
        var set = new Exhibit.Set();
        for (var i = 0; i < this._ranges.length; i++) {
            var range = this._ranges[i];
            this._rangeIndex.getSubjectsInRange(range.from, range.to, false, set, items);
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
    var ranges = [];
    
    var rangeIndex;
    var computeItems;
    if (this._expression.isPath()) {
        var database = this._uiContext.getDatabase();
        var path = this._expression.getPath();
        
        var propertyID = path.getLastSegment().property;
        var property = database.getProperty(propertyID);
        if (property == null) {
            return null;
        }
        
        rangeIndex = property.getRangeIndex();
        countItems = function(range) {
            return path.rangeBackward(range.from, range.to, items, database).values.size();
        }
    } else {
        this._buildRangeIndex();
        
        rangeIndex = this._rangeIndex;
        countItems = function(range) {
            return rangeIndex.getSubjectsInRange(range.from, range.to, false, null, items).size();
        }
    }
    
    var min = rangeIndex.getMin();
    var max = rangeIndex.getMax();
    min = Math.floor(min / this._settings.interval) * this._settings.interval;
    max = Math.ceil(max / this._settings.interval) * this._settings.interval;
    
    for (var x = min; x < max; x += this._settings.interval) {
        var range = { 
            from:       x, 
            to:         x + this._settings.interval, 
            selected:   false
        };
        range.count = countItems(range);
        
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
                onSelect,
                self._uiContext
            );
            containerDiv.appendChild(elmt);
        };
        
        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            if (range.selected || range.count > 0) {
                makeFacetValue(range.from, range.to, range.count, range.selected);
            }
        }
    containerDiv.style.display = "block";
    
    this._dom.setSelectionCount(this._ranges.length);
}

Exhibit.NumericRangeFacet.prototype._notifyCollection = function() {
    this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.NumericRangeFacet.prototype._initializeUI = function() {
    var self = this;
    this._dom = Exhibit.FacetUtilities.constructFacetFrame(
        this._div,
        this._settings.facetLabel,
        function(elmt, evt, target) { self._clearSelections(); },
        this._uiContext
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


Exhibit.NumericRangeFacet.prototype._buildRangeIndex = function() {
    if (!("_rangeIndex" in this)) {
        var expression = this._expression;
        var database = this._uiContext.getDatabase();
        var getter = function(item, f) {
            expression.evaluateOnItem(item, database).values.visit(function(value) {
                if (typeof value != "number") {
                    value = parseFloat(value);
                }
                if (!isNaN(value)) {
                    f(value);
                }
            });
        };
    
        this._rangeIndex = new Exhibit.Database._RangeIndex(
            this._uiContext.getCollection().getAllItems(),
            getter
        );    
    }
};
