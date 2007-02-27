/*==================================================
 *  Exhibit.ListFacet
 *==================================================
 */

Exhibit.ListFacet = function(collection, containerElmt, exhibit) {
    this._collection = collection;
    this._div = containerElmt;
    this._exhibit = exhibit;
    
    this.path = null;
    this._facetLabel = null;
    
    this._dom = null;
    this._topValueDoms = null;
    this._groupingBoxDom = null;
    
    this.valueSet = null;
    this.groupings = [];
    this.selectedCount = 0;
};

Exhibit.ListFacet.create = function(configuration, containerElmt, exhibit) {
    var collection = Exhibit.Collection.getCollection(configuration, exhibit);
    var facet = new Exhibit.ListFacet(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        exhibit
    );
    
    Exhibit.ListFacet._configure(facet, configuration);
    
    facet._initializeUI();
    collection.addFacet(facet);
    
    return facet;
};

Exhibit.ListFacet.createFromDOM = function(configElmt, containerElmt, exhibit) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var collection = Exhibit.Collection.getCollectionFromDOM(configElmt, configuration, exhibit);
    var facet = new Exhibit.ListFacet(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        exhibit
    );
    
    try {
        var expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString != null && expressionString.length > 0) {
            var expression = Exhibit.Expression.parse(expressionString);
            if (expression.isPath()) {
                facet.path = expression.getPath();
            }
        }
        
        var facetLabel = Exhibit.getAttribute(configElmt, "facetLabel");
        if (facetLabel != null && facetLabel.length > 0) {
            facet._facetLabel = facetLabel;
        }
    } catch (e) {
        SimileAjax.Debug.exception("ListFacet: Error processing configuration of list facet", e);
    }
    
    facet._initializeUI();
    collection.addFacet(facet);
    
    return facet;
};

Exhibit.ListFacet._configure = function(facet, configuration) {
    if ("expression" in configuration) {
        var expression = Exhibit.Expression.parse(configuration.expression);
        if (expression.isPath()) {
            facet.path = expression.getPath();
        }
    }
    if ("facetLabel" in configuration) {
        facet._facetLabel = configuration.facetLabel;
    }
}

Exhibit.ListFacet.prototype.dispose = function() {
    this._dom.close();
    
    if (this._groupingBoxDom != null) {
        this._groupingBoxDom.elmt.parentNode.removeChild(this._groupingBoxDom.elmt);
        this._groupingBoxDom = null;
    }
    this._dom = null;
    this._topValueDoms = null;
    
    this._collection = null;
    this._div = null;
    this._exhibit = null;
};

Exhibit.ListFacet.prototype.hasRestrictions = function() {
    return this.selectedCount > 0;
};

Exhibit.ListFacet.prototype.clearAllRestrictions = function() {
    var restrictions = [];
    if (this.selectedCount > 0) {
        if (this.valueSet != null) {
            this.valueSet.visit(function(v) {
                restrictions.push({ level: -1, value: v });
            });
            this.valueSet = null;
        }
        
        for (var i = 0; i < this.groupings.length; i++) {
            if (this.groupings[i].valueSet != null) {
                this.groupings[i].valueSet.visit(function(v) {
                    restrictions.push({ level: i, value: v });
                });
                this.groupings[i].valueSet = null;
            }
        }
        this.selectedCount = 0;
        
        this._notifyCollection();
    }
    return restrictions;
};

Exhibit.ListFacet.prototype.applyRestrictions = function(restrictions) {
    for (var i = 0; i < restrictions.length; i++) {
        var r = restrictions[i];
        this.setSelection(r.level, r.value, true);
    }
    this._notifyCollection();
};

Exhibit.ListFacet.prototype.setSelection = function(level, value, selected) {
    if (selected) {
        if (level == -1) {
            if (!this.valueSet) {
                this.valueSet = new Exhibit.Set();
            }
            if (this.valueSet.add(value)) {
                this.selectedCount++;
            }
        } else {
            var grouping = this.groupings[level];
            if (!grouping.valueSet) {
                grouping.valueSet = new Exhibit.Set();
            }
            if (grouping.valueSet.add(value)) {
                this.selectedCount++;
            }
        }
    } else {
        if (level == -1) {
            if (this.valueSet) {
                if (this.valueSet.remove(value)) {
                    this.selectedCount--;
                }
            }
        } else {
            var grouping = this.groupings[level];
            if (grouping.valueSet) {
                if (grouping.valueSet.remove(value)) {
                    this.selectedCount--;
                }
            }
        }
    }
}

Exhibit.ListFacet.prototype.getValueSet = function(level) {
    return level < 0 ? this.valueSet : this.groupings[level].valueSet;
}

Exhibit.ListFacet.prototype.getPath = function(level) {
    if (level < 0 || level == undefined) {
        return this.path;
    } else if (level < this.groupings.length) {
        var grouping = this.groupings[level];
        return Exhibit.Expression.Path.create(grouping.property, grouping.forward);
    } else {
        throw new Error("No such level in restriction");
    }
}

Exhibit.ListFacet.prototype.getLevelCount = function() {
    return this.groupings.length;
};

Exhibit.ListFacet.prototype.restrict = function(items) {
    var self = this;
    var recurseGetRestrictionValues = function(level, results, intersectResultsWith) {
        var path = self.getPath(level);
        var rangeSet = new Exhibit.Set();
        
        var userSelectedSet = self.getValueSet(level);
        if (userSelectedSet && userSelectedSet.size() > 0) {
            rangeSet.addSet(userSelectedSet);
        }
        
        if (level < self.getLevelCount() - 1) {
            recurseGetRestrictionValues(level + 1, rangeSet, null);
        }
        
        if (rangeSet.size() > 0) {
            results.addSet(path.walkBackward(rangeSet, "item", intersectResultsWith, database).values);
            return results;
        } else {
            return intersectResultsWith;
        }
    };
    
    return recurseGetRestrictionValues(-1, new Exhibit.Set(), items);
};

Exhibit.ListFacet.prototype.update = function(items) {
    this._dom.valuesContainer.style.display = "none";
    this._dom.valuesContainer.innerHTML = "";
    
    var facetData = this._computeFacet(items);
    if (facetData != null) {
        this._constructBody(facetData);
    }
    this._dom.valuesContainer.style.display = "block";
};

Exhibit.ListFacet.prototype._computeFacet = function(currentSet) {
    var database = this._exhibit.getDatabase();
    
    var results = this.getPath().walkForward(currentSet, "item", database);
    var values = results.values;
    if (values.size() == 0) {
        return null;
    }
    
    var slideSet = this.getPath().walkForward(currentSet, "item", database).values;
    var facetData = this._createFacetTemplate(values, results.valueType, slideSet);
    
    var self = this;
    var f = function(level, domainSets, valueToFacetValueMap) {
        var domainSet = domainSets[domainSets.length - 1];
        var path = self.getPath(level);
        
        var resultStruct = path.walkForward(domainSet, "item", database);
        var rangeSet = resultStruct.values;
        var rangeValuesAreItems = resultStruct.valueType == "item";
        
        var previousSelectedRangeSet = self.getValueSet(level);
        if (previousSelectedRangeSet) {
            rangeSet.addSet(previousSelectedRangeSet);
            facetData.selectedCount += previousSelectedRangeSet.size();
        }
        
        var results = [];
        var map = {};
        var facetSortFunc = function(a, b) {
            return a.label.localeCompare(b.label);
        };
        if (resultStruct.valueType == "number") {
            facetSortFunc = function(a, b) {
                a = parseFloat(a.value);
                b = parseFloat(b.value);
                return a < b ? -1 : a > b ? 1 : 0;
            }
        }
        
        rangeSet.visit(function(rangeValue) {
            var domainSubset = path.evaluateBackward(rangeValue, "item", domainSet, database).values;
            
            /*
             *  Reverse-project all the way to get the count 
             *  of the subset in the original collection
             */
            var firstDomainSubset = domainSubset;
            for (var i = level - 1; i >= -1; i--) {
                firstDomainSubset = r.getPath(i).walkBackward(
                    firstDomainSubset, "item", domainSets[i+1], database).values;
            }
            
            var label = rangeValuesAreItems ? database.getObject(rangeValue, "label") : rangeValue;
            var facetValue = {
                value:      rangeValue,
                count:      firstDomainSubset.size(),
                label:      label != null ? label : rangeValue,
                
                selected:   (previousSelectedRangeSet) ? 
                                previousSelectedRangeSet.contains(rangeValue) : false,
                                
                filtered:   level == -1 && slideSet.contains(rangeValue),
                level:      level,
                children:   []
            };
            
            if (valueToFacetValueMap) {
                domainSubset.visit(function(domainValue) {
                    var childFacetValue = valueToFacetValueMap[domainValue];
                    facetValue.children.push(childFacetValue);
                });
                
                facetValue.children.sort(facetSortFunc);
            }
            
            results.push(facetValue);
            map[rangeValue] = facetValue;
        });
        
        if (level < self.getLevelCount() - 1) {
            domainSets.push(rangeSet);
            return arguments.callee(level + 1, domainSets, map);
        } else {
            results.sort(facetSortFunc);
            return results;
        }
    };
    
    facetData.values = f(-1, [ currentSet ], null);
    
    return facetData;
}

Exhibit.ListFacet.prototype._createFacetTemplate = function(values, valueType, slideSet) {
    var database = this._exhibit.getDatabase();
    var segment = this.getPath(-1).getLastSegment();
    var property = segment.property;
    var forward = segment.forward;
    
    var propertyData = database.getProperty(property);
    var facetLabel = forward ? propertyData.getPluralLabel() : propertyData.getReversePluralLabel();
    
    var typeLabels = database.getTypeLabels(values);
    var valueLabel = typeLabels[0].length > 0 ? typeLabels[0].join(", ") : "option";
    var pluralValueLabel = typeLabels[1].length > 0 ? typeLabels[1].join(", ") : "options";
    
    var itemValues = (!forward || propertyData.getValueType() == "item");
    
    return {
        facetLabel:         facetLabel,
        valueLabel:         valueLabel,
        pluralValueLabel:   pluralValueLabel,
        
        count:              values.size(),
        selectedCount:      0,
        filteredCount:      slideSet.size(),
        groupLevelCount:    this.getLevelCount(),
        
        groupable:          itemValues,
        values:             []
    };
};

Exhibit.ListFacet.prototype._notifyCollection = function() {
    this._collection.onFacetUpdated(this);
};

Exhibit.ListFacet.prototype._initializeUI = function() {
    var facet = this;

    var onGroup = function(elmt, evt, target) {
        facet._openGroupingUI();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var onCollapseAll = function(elmt, evt, target) {
        facet._collapseGroups();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var onExpandAll = function(elmt, evt, target) {
        facet._expandGroups();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var onClearSelections = function(elmt, evt, target) {
        facet._clearSelections();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    
    this._dom = Exhibit.ListFacet.theme.constructFacetFrame(
        this._exhibit,
        this._div,
        this._facetLabel,
        this._groupable,
        this._groupLevelCount > 0,
        onGroup, 
        onCollapseAll, 
        onExpandAll, 
        onClearSelections
    );
    this._dom.open();
};

Exhibit.ListFacet.prototype._constructBody = function(facetData) {
    var listFacet = this;
    this._topValueDoms = [];
    this._dom.setGroupControlsVisible(facetData.groupLevelCount > 0);

    var constructValue = function(value, containerDiv, level) {
        var hasChildren = value.children.length > 0;
        var expanded = false;
        var onSelect = function(elmt, evt, target) {
            listFacet._filter(valueDom);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        };
        var valueDom = Exhibit.ListFacet.theme.constructFacetItem(
            listFacet._exhibit,
            value.label, 
            value.count, 
            level,
            value.selected, 
            hasChildren, 
            expanded,
            onSelect
        );
        valueDom.value = value.value;
        valueDom.selected = value.selected;
        valueDom.level = level;
        containerDiv.appendChild(valueDom.elmt);
        
        if (level == 0) {
            listFacet._topValueDoms.push(valueDom);
        }
        if (value.children.length > 0) {
            var childrenContainer = Exhibit.ListFacet.theme.constructFacetChildrenContainer(
                listFacet._exhibit, expanded);
            
            constructValues(value.children, childrenContainer, level + 1);
            containerDiv.appendChild(childrenContainer);
            
            valueDom.childrenContainer = childrenContainer;
        }
    };
    var constructValues = function(values, containerDiv, level) {
        for (var j = 0; j < values.length; j++) {
            constructValue(values[j], containerDiv, level);
        }
    };
    constructValues(facetData.values, this._dom.valuesContainer, 0);
    
    this._groupLevelCount = facetData.groupLevelCount;
    this._dom.setSelectionCount(facetData.selectedCount);
};

Exhibit.ListFacet.prototype.setSelection = function(level, value, selected) {
    if (selected) {
        if (level == -1) {
            if (!this.valueSet) {
                this.valueSet = new Exhibit.Set();
            }
            if (this.valueSet.add(value)) {
                this.selectedCount++;
            }
        } else {
            var grouping = this.groupings[level];
            if (!grouping.valueSet) {
                grouping.valueSet = new Exhibit.Set();
            }
            if (grouping.valueSet.add(value)) {
                this.selectedCount++;
            }
        }
    } else {
        if (level == -1) {
            if (this.valueSet) {
                if (this.valueSet.remove(value)) {
                    this.selectedCount--;
                }
            }
        } else {
            var grouping = this.groupings[level];
            if (grouping.valueSet) {
                if (grouping.valueSet.remove(value)) {
                    this.selectedCount--;
                }
            }
        }
    }
    this._notifyCollection();
};

Exhibit.ListFacet.prototype._filter = function(valueDom) {
    var level = this._groupLevelCount - valueDom.level - 1;
    var value = valueDom.value;
    var selected = !valueDom.selected;
    
    var self = this;
    SimileAjax.History.addAction({
        perform: function() {
            self.setSelection(level, value, selected);
        },
        undo: function() {
            self.setSelection(level, value, !selected);
        },
        label: selected ? 
            ("set " + this._facetLabel + " = " + value) :
            ("unset " + this._facetLabel + " = " + value),
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
        label: "clear selections",
        uiLayer: SimileAjax.WindowManager.getBaseLayer(),
        lengthy: true
    });
};

Exhibit.ListFacet.prototype._openGroupingUI = function() {
    if (this._groupingBoxDom != null) {
        return;
    }
    
    var coords = SimileAjax.DOM.getPageCoordinates(this._dom.elmt);
    var listFacet = this;
    this._groupingBoxDom = Exhibit.ListFacet.theme.constructGroupingBox(
        this._exhibit,
        coords.left > (document.body.scrollWidth / 2),
        function(elmt, evt, target) {
            listFacet._ungroupAll();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        },
        function(elmt, evt, target) {
            listFacet._closeGroupingUI();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    );
    this._reconstructGroupingBox();
    this._dom.elmt.appendChild(this._groupingBoxDom.elmt);
}

Exhibit.ListFacet.prototype._closeGroupingUI = function() {
    if (this._groupingBoxDom != null) {
        this._groupingBoxDom.elmt.parentNode.removeChild(this._groupingBoxDom.elmt);
        this._groupingBoxDom = null;
    }
}

Exhibit.ListFacet.prototype._reconstructGroupingBox = function() {
    var listFacet = this;
    this._groupingBoxDom.clearGroups();
    
    var makeGroup = function(group, level) {
        var groupDom = Exhibit.ListFacet.theme.constructGroup(
            listFacet._exhibit,
            level == 0,
            group.grouped,
            function(elmt, evt, target) {
                listFacet._ungroup(groupDom);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            }
        );
        groupDom.level = level;
        listFacet._groupingBoxDom.appendGroup(groupDom);
        
        var makeGroupOption = function(groupingOption) {
            var optionDom = Exhibit.ListFacet.theme.constructGroupingOption(
                listFacet._exhibit,
                groupingOption.label,
                groupingOption.selected,
                function(elmt, evt, target) { 
                    listFacet._toggleGroup(groupDom, optionDom); 
                    SimileAjax.DOM.cancelEvent(evt);
                    return false;
                }
            );
            optionDom.property = groupingOption.property;
            optionDom.forward = groupingOption.forward;
            optionDom.selected = groupingOption.selected;
            
            groupDom.appendOption(optionDom);
        };
        
        var groupingOptions = group.groupingOptions;
        for (var j = 0; j < groupingOptions.length; j++) {
            makeGroupOption(groupingOptions[j]);
        }
    };
    
    var groups = this._exhibit.getBrowseEngine().getGroups(this._facetID);
    for (var i = 0; i < groups.length; i++) {
        makeGroup(groups[i], i);
    }
}

Exhibit.ListFacet.prototype._toggleGroup = function(groupDom, optionDom) {
    if (optionDom.selected) {
        this._ungroup(groupDom);
    } else {
        this._group(groupDom, optionDom);
    }
}

Exhibit.ListFacet.prototype._group = function(groupDom, optionDom) {
    var property = optionDom.property;
    var forward = optionDom.forward;
    var selected = optionDom.selected;
    var level = groupDom.level;
    
    this._exhibit.getBrowseEngine().group(
        this._facetID,
        level, 
        property, 
        forward
    );
    this._reconstructGroupingBox();
    
    var facet = this._exhibit.getBrowseEngine().getFacet(this._facetID);
    if (facet != null) {
        this.update(facet);
    }
}

Exhibit.ListFacet.prototype._ungroup = function(groupDom) {
    this._exhibit.getBrowseEngine().ungroup(this._facetID, groupDom.level);
    this._reconstructGroupingBox();
    
    var facet = this._exhibit.getBrowseEngine().getFacet(this._facetID);
    if (facet != null) {
        this.update(facet);
    }
}

Exhibit.ListFacet.prototype._ungroupAll = function() {
    this._exhibit.getBrowseEngine().ungroup(this._facetID, 0);
    this._reconstructGroupingBox();
    
    var facet = this._exhibit.getBrowseEngine().getFacet(this._facetID);
    if (facet != null) {
        this.update(facet);
    }
}

Exhibit.ListFacet.prototype._collapseGroups = function() {
    for (var i = 0; i < this._topValueDoms.length; i++) {
        this._topValueDoms[i].collapseGroup();
    }
}

Exhibit.ListFacet.prototype._expandGroups = function(valueDom) {
    for (var i = 0; i < this._topValueDoms.length; i++) {
        this._topValueDoms[i].expandGroup();
    }
}

