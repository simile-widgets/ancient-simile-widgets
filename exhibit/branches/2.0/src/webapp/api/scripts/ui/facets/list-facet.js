/*==================================================
 *  Exhibit.ListFacet
 *==================================================
 */

Exhibit.ListFacet = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;
    
    this._path = null;
    this._valueSet = new Exhibit.Set();
    
    this._settings = {};
    this._dom = null;
};

Exhibit.ListFacet._settingSpecs = {
    "facetLabel":       { type: "text" }
};

Exhibit.ListFacet.create = function(configuration, containerElmt, uiContext) {
    var facet = new Exhibit.ListFacet(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    
    Exhibit.ListFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    
    return facet;
};

Exhibit.ListFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var facet = new Exhibit.ListFacet(
        containerElmt != null ? containerElmt : configElmt, 
        Exhibit.UIContext.create(configuration, uiContext)
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.ListFacet._settingSpecs, facet._settings);
    
    try {
        var expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString != null && expressionString.length > 0) {
            var expression = Exhibit.Expression.parse(expressionString);
            if (expression.isPath()) {
                facet._path = expression.getPath();
            }
        }
        
        var selection = Exhibit.getAttribute(configElmt, "selection", ";");
        if (selection != null && selection.length > 0) {
            for (var i = 0, s; s = selection[i]; i++) {
                facet._valueSet.add(s);
            }
        }
    } catch (e) {
        SimileAjax.Debug.exception("ListFacet: Error processing configuration of list facet", e);
    }
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    
    return facet;
};

Exhibit.ListFacet._configure = function(facet, configuration) {
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.ListFacet._settingSpecs, facet._settings);
    
    if ("expression" in configuration) {
        var expression = Exhibit.Expression.parse(configuration.expression);
        if (expression.isPath()) {
            facet._path = expression.getPath();
        }
    }
    if ("selection" in configuration) {
        var selection = configuration.selection;
        for (var i = 0; i < selection.length; i++) {
            facet._valueSet.add(selection[i]);
        }
    }
}

Exhibit.ListFacet.prototype.dispose = function() {
    this._div.innerHTML = "";
    
    this._div = null;
    this._uiContext = null;
    
    this._path = null;
    this._valueSet = null;
    
    this._settings = null;
    this._dom = null;
};

Exhibit.ListFacet.prototype.hasRestrictions = function() {
    return this._valueSet.size() > 0;
};

Exhibit.ListFacet.prototype.clearAllRestrictions = function() {
    var restrictions = [];
    if (this.selectedCount > 0) {
        this._valueSet.visit(function(v) {
            restrictions.push(v);
        });
        this._valueSet = new Exhibit.Set();
        this._notifyCollection();
    }
    return restrictions;
};

Exhibit.ListFacet.prototype.applyRestrictions = function(restrictions) {
    for (var i = 0; i < restrictions.length; i++) {
        this.setSelection(restrictions[i], true);
    }
    this._notifyCollection();
};

Exhibit.ListFacet.prototype.setSelection = function(value, selected) {
    if (selected) {
        this._valueSet.add(value);
    } else {
        this._valueSet.remove(value);
    }
    this._notifyCollection();
}

Exhibit.ListFacet.prototype.restrict = function(items) {
    if (this._valueSet.size() == 0) {
        return items;
    } else {
        return this._path.walkBackward(
            this._valueSet, 
            "item", items, 
            this._uiContext.getDatabase()
        ).values;
    }
};

Exhibit.ListFacet.prototype.update = function(items) {
    this._dom.valuesContainer.style.display = "none";
    this._dom.valuesContainer.innerHTML = "";
    this._constructBody(this._computeFacet(items));
    this._dom.valuesContainer.style.display = "block";
};

Exhibit.ListFacet.prototype._computeFacet = function(items) {
    var database = this._uiContext.getDatabase();
    var path = this._path;
    var entries = [];
    
    var facetValueResult = path.walkForward(items, "item", database);
    var facetValues = facetValueResult.values;
    if (facetValues.size() > 0) {
        var selection = this._valueSet;
        var sorter = (facetValueResult.valueType == "number") ?
            function(a, b) {
                a = parseFloat(a.value);
                b = parseFloat(b.value);
                return a < b ? -1 : a > b ? 1 : 0;
            } :
            function(a, b) { return a.label.localeCompare(b.label); };
        
        var labeler = facetValueResult.valueType == "item" ?
            function(v) { return database.getObject(v, "label"); } :
            function(v) { return v; }
        
        facetValues.visit(function(facetValue) {
            var itemSubset = path.evaluateBackward(facetValue, facetValueResult.valueType, items, database).values;
            var entry = {
                value:      facetValue,
                count:      itemSubset.size(),
                label:      labeler(facetValue),
                selected:   selection.contains(facetValue)
            };
            entries.push(entry);
        });
        entries.sort(sorter);
    };
    return entries;
}

Exhibit.ListFacet.prototype._notifyCollection = function() {
    this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.ListFacet.prototype._initializeUI = function() {
    var self = this;

    var onClearSelections = function(elmt, evt, target) {
        self._clearSelections();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    
    this._dom = Exhibit.FacetUtilities.constructFacetFrame(
        this._div,
        this._settings.facetLabel,
        onClearSelections
    );
};

Exhibit.ListFacet.prototype._constructBody = function(entries) {
    var self = this;
    var containerDiv = this._dom.valuesContainer;
    
    containerDiv.style.display = "none";
        var facetHasSelection = this._valueSet.size() > 0;
        var constructValue = function(entry) {
            var onSelect = function(elmt, evt, target) {
                self._filter(entry.value, entry.label);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            };
            var elmt = Exhibit.FacetUtilities.constructFacetItem(
                entry.label, 
                entry.count, 
                entry.selected, 
                facetHasSelection,
                onSelect
            );
            containerDiv.appendChild(elmt);
        };
        
        for (var j = 0; j < entries.length; j++) {
            constructValue(entries[j]);
        }
    containerDiv.style.display = "block";
    
    this._dom.setSelectionCount(this._valueSet.size());
};

Exhibit.ListFacet.prototype._filter = function(value, label) {
    var selected = !this._valueSet.contains(value);
    
    var self = this;
    SimileAjax.History.addAction({
        perform: function() {
            self.setSelection(value, selected);
        },
        undo: function() {
            self.setSelection(value, !selected);
        },
        label: selected ? 
            ("set " + this._settings.facetLabel + " = " + label) :
            ("unset " + this._settings.facetLabel + " = " + label),
        uiLayer: SimileAjax.WindowManager.getBaseLayer(),
        lengthy: true
    });
};

Exhibit.ListFacet.prototype._clearSelections = function() {
    var state = {};
    var self = this;
    SimileAjax.History.addAction({
        perform: function() {
            state.restrictions = self.clearAllRestrictions();
        },
        undo: function() {
            self.applyRestrictions(state.restrictions);
        },
        label: "clear selections in facet " + this._settings.facetLabel,
        uiLayer: SimileAjax.WindowManager.getBaseLayer(),
        lengthy: true
    });
};
