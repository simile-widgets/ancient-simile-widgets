/*==================================================
 *  Exhibit.ListFacet
 *==================================================
 */

Exhibit.ListFacet = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;
    
    this._expression = null;
    this._valueSet = new Exhibit.Set();
    
    this._settings = {};
	this._height = Exhibit.getAttribute(containerElmt, "height");
    this._dom = null;
    
    var self = this;
    this._listener = { 
        onRootItemsChanged: function() {
            if ("_itemToValue" in self) {
                delete self._itemToValue;
            }
            if ("_valueToItem" in self) {
                delete self._valueToItem;
            }
        }
    };
    uiContext.getCollection().addListener(this._listener);
};

Exhibit.ListFacet._settingSpecs = {
    "facetLabel":       { type: "text" }
};

Exhibit.ListFacet.create = function(configuration, containerElmt, uiContext) {
    var uiContext = Exhibit.UIContext.create(configuration, uiContext);
    var facet = new Exhibit.ListFacet(containerElmt, uiContext);
    
    Exhibit.ListFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    
    return facet;
};

Exhibit.ListFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var uiContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    var facet = new Exhibit.ListFacet(
        containerElmt != null ? containerElmt : configElmt, 
        uiContext
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.ListFacet._settingSpecs, facet._settings);
	
    try {
        var expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString != null && expressionString.length > 0) {
            facet._expression = Exhibit.ExpressionParser.parse(expressionString);
        }
        
        var selection = Exhibit.getAttribute(configElmt, "selection", ";");
        if (selection != null && selection.length > 0) {
            for (var i = 0, s; s = selection[i]; i++) {
                facet._valueSet.add(s);
            }
        }
    } catch (e) {
        SimileAjax.Debug.exception(e, "ListFacet: Error processing configuration of list facet");
    }
    Exhibit.ListFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    
    return facet;
};

Exhibit.ListFacet._configure = function(facet, configuration) {
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.ListFacet._settingSpecs, facet._settings);
    
    if ("expression" in configuration) {
        facet._expression = Exhibit.ExpressionParser.parse(configuration.expression);
    }
    if ("selection" in configuration) {
        var selection = configuration.selection;
        for (var i = 0; i < selection.length; i++) {
            facet._valueSet.add(selection[i]);
        }
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

Exhibit.ListFacet.prototype.dispose = function() {
    this._uiContext.getCollection().removeListener(this._listener);
    this._uiContext = null;
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
    
    this._expression = null;
    this._valueSet = null;
    this._settings = null;
};

Exhibit.ListFacet.prototype.hasRestrictions = function() {
    return this._valueSet.size() > 0;
};

Exhibit.ListFacet.prototype.clearAllRestrictions = function() {
    var restrictions = [];
    if (this._valueSet.size() > 0) {
        this._valueSet.visit(function(v) {
            restrictions.push(v);
        });
        this._valueSet = new Exhibit.Set();
        this._notifyCollection();
    }
    return restrictions;
};

Exhibit.ListFacet.prototype.applyRestrictions = function(restrictions) {
    this._valueSet = new Exhibit.Set();
    for (var i = 0; i < restrictions.length; i++) {
        this._valueSet.add(restrictions[i]);
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
    } else if (this._expression.isPath()) {
        return this._expression.getPath().walkBackward(
            this._valueSet, 
            "item", items, 
            this._uiContext.getDatabase()
        ).getSet();
    } else {
        this._buildMaps();
        
        var set = new Exhibit.Set();
        var valueToItem = this._valueToItem;
        
        this._valueSet.visit(function(value) {
            if (value in valueToItem) {
                var itemA = valueToItem[value];
                for (var i = 0; i < itemA.length; i++) {
                    var item = itemA[i];
                    if (items.contains(item)) {
                        set.add(item);
                    }
                }
            }
        });
        return set;
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
    var entries = [];
    var valueType = "text";
    
    if (this._expression.isPath()) {
        var path = this._expression.getPath();
        var facetValueResult = path.walkForward(items, "item", database);
        valueType = facetValueResult.valueType;
        
        if (facetValueResult.size > 0) {
            facetValueResult.forEachValue(function(facetValue) {
                var itemSubcollection = path.evaluateBackward(facetValue, valueType, items, database);
                entries.push({ value: facetValue, count: itemSubcollection.size });
            });
        };
    } else {
        this._buildMaps();
        
        valueType = this._valueType;
        for (var value in this._valueToItem) {
            var itemA = this._valueToItem[value];
            var count = 0;
            for (var i = 0; i < itemA.length; i++) {
                if (items.contains(itemA[i])) {
                    count++;
                }
            }
            
            if (count > 0) {
                entries.push({ value: value, count: count });
            }
        }
    }
    
    if (entries.length > 0) {
        var selection = this._valueSet;
        var labeler = valueType == "item" ?
            function(v) { var l = database.getObject(v, "label"); return l != null ? l : v; } :
            function(v) { return v; }
            
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            entry.label = labeler(entry.value);
            entry.selected = selection.contains(entry.value);
        }
            
        entries.sort((valueType == "number") ?
            function(a, b) {
                a = parseFloat(a.value);
                b = parseFloat(b.value);
                return a < b ? -1 : a > b ? 1 : 0;
            } :
            function(a, b) { return a.label.localeCompare(b.label); }
        );
    }
    return entries;
}

Exhibit.ListFacet.prototype._notifyCollection = function() {
    this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.ListFacet.prototype._initializeUI = function() {
    var self = this;
    this._dom = Exhibit.FacetUtilities.constructFacetFrame(
        this._div,
        this._settings.facetLabel,
        function(elmt, evt, target) { self._clearSelections(); },
        this._uiContext
    );
};

Exhibit.ListFacet.prototype._constructBody = function(entries) {
    var self = this;
    var containerDiv = this._dom.valuesContainer;
    
    containerDiv.style.display = "none";
	if (this._height) {
		containerDiv.style.height = this._height;
	}	
	
        var facetHasSelection = this._valueSet.size() > 0;
        var constructValue = function(entry) {
            var onSelect = function(elmt, evt, target) {
                self._filter(entry.value, entry.label, false);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            };
            var onSelectOnly = function(elmt, evt, target) {
                self._filter(entry.value, entry.label, !(evt.ctrlKey || evt.metaKey));
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            };
            var elmt = Exhibit.FacetUtilities.constructFacetItem(
                entry.label, 
                entry.count, 
                entry.selected, 
                facetHasSelection,
                onSelect,
                onSelectOnly,
                self._uiContext
            );
            containerDiv.appendChild(elmt);
        };
        
        for (var j = 0; j < entries.length; j++) {
            constructValue(entries[j]);
        }
    containerDiv.style.display = "block";
    
    this._dom.setSelectionCount(this._valueSet.size());
};

Exhibit.ListFacet.prototype._filter = function(value, label, singleSelection) {
    var self = this;
    var wasSelected = this._valueSet.contains(value);
    var wasOnlyThingSelected = (this._valueSet.size() == 1 && wasSelected);
    if (singleSelection && !wasOnlyThingSelected) {
        var newRestrictions = [ value ];
        var oldRestrictions = [];
        this._valueSet.visit(function(v) {
            oldRestrictions.push(v);
        });
    
        SimileAjax.History.addLengthyAction(
            function() { self.applyRestrictions(newRestrictions); },
            function() { self.applyRestrictions(oldRestrictions); },
            String.substitute(
                Exhibit.FacetUtilities.l10n["facetSelectOnlyActionTitle"],
                [ label, this._settings.facetLabel ])
        );
    } else {
        SimileAjax.History.addLengthyAction(
            function() { self.setSelection(value, !wasSelected); },
            function() { self.setSelection(value, wasSelected); },
            String.substitute(
                Exhibit.FacetUtilities.l10n[wasSelected ? "facetUnselectActionTitle" : "facetSelectActionTitle"],
                [ label, this._settings.facetLabel ])
        );
    }
};

Exhibit.ListFacet.prototype._clearSelections = function() {
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

Exhibit.ListFacet.prototype._buildMaps = function() {
    if (!("_itemToValue" in this) || !("_valueToItem" in this)) {
        var itemToValue = {};
        var valueToItem = {};
        var valueType = "text";
        
        var insert = function(x, y, map) {
            if (x in map) {
                map[x].push(y);
            } else {
                map[x] = [ y ];
            }
        };
        
        var expression = this._expression;
        var database = this._uiContext.getDatabase();
        
        this._uiContext.getCollection().getAllItems().visit(function(item) {
            var results = expression.evaluateOnItem(item, database);
            if (results.values.size() > 0) {
                valueType = results.valueType;
                results.values.visit(function(value) {
                    insert(item, value, itemToValue);
                    insert(value, item, valueToItem);
                });
            }
        });
        
        this._itemToValue = itemToValue;
        this._valueToItem = valueToItem;
        this._valueType = valueType;
    }
};
