/*======================================================================
 *  Exhibit.BrowseEngine
 *  http://simile.mit.edu/wiki/Exhibit/API/BrowseEngine
 *======================================================================
 */
Exhibit.BrowseEngine = function(database, configuration) {
    this._database = database;
    this._listeners = new SimileAjax.ListenerQueue("onChange");
    
    this._facetEntries = [];
    this._supportSliding = false;
    
    if ("BrowseEngine" in configuration) {
        var myConfig = configuration["BrowseEngine"];
        
        if ("facets" in myConfig) {
            this.setFacets(myConfig["facets"]);
        }
        if ("sliding" in myConfig && myConfig.sliding) {
            this._supportSliding = true;
        }
    }
    
    var self = this;
    this._databaseListener = {
        onAfterLoadingItems: function() {
            delete self._cachedRootFacets;
        }
    };
    this._database.addListener(this._databaseListener);
    
    this._collections = [];
    this._slides = [];
};

Exhibit.BrowseEngine.prototype.dispose = function() {
    this._database.removeListener(this._databaseListener);
};

Exhibit.BrowseEngine.prototype.addListener = function(listener) {
    this._listeners.add(listener);
};

Exhibit.BrowseEngine.prototype.removeListener = function(listener) {
    this._listeners.remove(listener);
};

Exhibit.BrowseEngine.prototype.getState = function() {
    // TODO: Implement
    return null;
};

Exhibit.BrowseEngine.prototype.setState = function(state) {
    // TODO: Implement
};

Exhibit.BrowseEngine.prototype.setFacets = function(facetEntries) {
    var showHelp = function(expr) {
        Exhibit.showHelp(
            Exhibit.BrowseEngine.l10n.errorParsingFacetExpressionMessage(expr),
            Exhibit.docRoot + "Exhibit/Configuring_Browse_Panel"
        );
    };
    
    for (var i = 0; i < facetEntries.length; i++) {
        var entry = facetEntries[i];
        try {
            var expression = Exhibit.Expression.parse(entry);
            if (expression.isPath()) {
                var path = expression.getPath();
                if (path.getSegmentCount() == 1) {
                    this._facetEntries.push(path.getSegment(0));
                } else {
                    showHelp(entry);
                    break;
                }
            } else {
                showHelp(entry);
                break;
            }
        } catch(e) {
            SimileAjax.Debug.exception("BrowseEngine.setFacets failed to parse facet expressions", e);
            showHelp(entry);
            break;
        }
    }
};

Exhibit.BrowseEngine.prototype.getFocus = function() {
    for (var i = 0; i < this._collections.length; i++) {
        var c = this._collections[i];
        if (c._focused) {
            return i;
        }
    }
    return -1;
};

Exhibit.BrowseEngine.prototype.getCollectionCount = function() {
    return this._collections.length;
}

Exhibit.BrowseEngine.prototype.getCurrentCollection = function() {
    return this.getCollection(this.getFocus());
};

Exhibit.BrowseEngine.prototype.getCollection = function(index) {
    var length = this._collections.length;
    return (index >= 0 && index < length) ? this._collections[index] : null;
}

Exhibit.BrowseEngine.prototype.getSlide = function(index) {
    var length = this._slides.length;
    return (index >= 0 && index < length) ? this._slides[index] : null;
}

Exhibit.BrowseEngine.prototype.getFacets = function() {
    var facets = [];
    
    var focusIndex = this.getFocus();
    if (focusIndex >= 0) {
        var collection = this._collections[focusIndex];
        
        var isRoot = (focusIndex == 0);
        var empty = true;
        
        if (isRoot) {
            for (var i = 0; i < collection._restrictions.length; i++) {
                var r = collection._restrictions[i];
                if (r.hasSelection()) {
                    empty = false;
                    break;
                }
            }
        }
        
        if (isRoot && empty && "_cachedRootFacets" in this) {
            facets = this._cachedRootFacets;
        } else {
            for (var i = 0; i < collection._restrictions.length; i++) {
                var r = collection._restrictions[i];
                this._computeFacet(collection, r, facets);
            }
            
            if (isRoot && empty) {
                this._cachedRootFacets = facets;
            }
        }
    }
    return facets;
};

Exhibit.BrowseEngine.prototype.getFacet = function(property, forward) {
    var facets = [];
    
    var focusIndex = this.getFocus();
    if (focusIndex >= 0) {
        var collection = this._collections[focusIndex];
        for (var i = 0; i < collection._restrictions.length; i++) {
            var r = collection._restrictions[i];
            if (r.property == property && r.forward == forward) {
                this._computeFacet(collection, r, facets);
                break;
            }
        }
    }
    return facets.length > 0 ? facets[0] : null;
};

Exhibit.BrowseEngine.prototype.getGroups = function(property, forward) {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    for (var i = 0; i < collection._restrictions.length; i++) {
        var restriction = collection._restrictions[i];
        if (restriction.property == property && restriction.forward == forward) {
            return this._getGroups(collection, restriction);
        }
    }
    return [];
};

Exhibit.BrowseEngine.prototype.setRootCollection = function(itemSet) {
    if (itemSet != null) {
        this._collections = [];
        this._slides = [];
        this._addCollection(itemSet)._focused = true;
        
        delete this._cachedRootFacets;
        
        this._listeners.fire("onRootCollectionSet", []);
    } else {
        SimileAjax.Debug.log("Exhibit.BrowseEngine.setRootCollection is called with null argument");
    }
};

Exhibit.BrowseEngine.prototype.setValueRestriction = function(property, forward, level, value, selected) {
    var focusIndex = this.getFocus();
    if (focusIndex >= 0 && focusIndex < this._collections.length) {
        var collection = this._collections[focusIndex];
        for (var i = 0; i < collection._restrictions.length; i++) {
            var restriction = collection._restrictions[i];
            if (restriction.property == property && restriction.forward == forward) {
                restriction.setSelection(level, value, selected);
                
                collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
                
                this._propagateChanges(focusIndex);
                
                this._listeners.fire("onRestrict", []);
                
                return;
            }
        }
        SimileAjax.Debug.log("Exhibit.BrowseEngine.setValueRestriction is called with invalid property and forward");
    } else {
        SimileAjax.Debug.log("Exhibit.BrowseEngine.setValueRestriction is called when there is no collection");
    }
};

Exhibit.BrowseEngine.prototype.focus = function(index) {
    for (var i = 0; i < this._collections.length; i++) {
        var c = this._collections[i];
        c._focused = (i == index);
    }
};

Exhibit.BrowseEngine.prototype.slide = function(propertyID, forward) {
    var focusIndex = this.getFocus();
    if (focusIndex < this._collections.length - 1) {
        this._collections = this._collections.slice(0, focusIndex + 1);
        this._slides = this._collections.slice(0, focusIndex);
    }
    
    var property = this._properties[propertyID];
    var label = forward ? property.pluralLabel : property.reversePluralLabel;
    var slide = {
        property:   propertyID,
        forward:    forward,
        label:      label
    };

    this._slides.push(slide);
    
    var collection = this._collections[focusIndex];
    var newSet = this._slideCollection(collection, property, forward);
    
    this._addCollection(newSet);
    this.focus(focusIndex + 1);
    
    this._listeners.fire("onSlide", []);
}

Exhibit.BrowseEngine.prototype.clearRestrictions = function() {
    var focusIndex = this.getFocus();
    if (focusIndex >= 0 && focusIndex < this._collections.length) {
        var collection = this._collections[focusIndex];
        var oldRestrictions = collection._restrictions;
        
        collection._restrictions = [];
        collection._restrictedSet = collection._originalSet;
        this._initializeRestrictions(collection);
        
        this._propagateChanges(focusIndex);
        this._listeners.fire("onClearRestrictions", []);
        
        return oldRestrictions;
    } else {
        SimileAjax.Debug.log("Exhibit.BrowseEngine.clearRestrictions is called when there is no collection");
        return null;
    }
}

Exhibit.BrowseEngine.prototype.applyRestrictions = function(restrictions) {
    var focusIndex = this.getFocus();
    if (focusIndex >= 0 && focusIndex < this._collections.length) {
        var collection = this._collections[focusIndex];
        collection._restrictions = restrictions;
        collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
        this._propagateChanges(focusIndex);
        this._listeners.fire("onApplyRestrictions", []);
    } else {
        SimileAjax.Debug.log("Exhibit.BrowseEngine.applyRestrictions is called when there is no collection");
    }
}

Exhibit.BrowseEngine.prototype.clearFacetRestrictions = function(property, forward) {
    var focusIndex = this.getFocus();
    if (focusIndex >= 0 && focusIndex < this._collections.length) {
        var collection = this._collections[focusIndex];
        for (var i = 0; i < collection._restrictions.length; i++) {
            var restriction = collection._restrictions[i];
            if (restriction.property == property && restriction.forward == forward) {
                var oldRestriction = restriction;
                collection._restrictions[i] = new Exhibit.BrowseEngine._Restriction(property, forward);
                collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);

                this._propagateChanges(focusIndex);
                this._listeners.fire("onClearFacetRestrictions", []);
                
                return oldRestriction;
            }
        }
        SimileAjax.Debug.log("Exhibit.BrowseEngine.clearFacetRestrictions is called with invalid property and forward");
        return null;
    } else {
        SimileAjax.Debug.log("Exhibit.BrowseEngine.clearFacetRestrictions is called when there is no collection");
        return null;
    }
}

Exhibit.BrowseEngine.prototype.applyFacetRestrictions = function(property, forward, restrictions) {
    if (restrictions != null) {
        var focusIndex = this.getFocus();
        if (focusIndex >= 0 && focusIndex < this._collections.length) {
            var collection = this._collections[focusIndex];
            for (var i = 0; i < collection._restrictions.length; i++) {
                var restriction = collection._restrictions[i];
                if (restriction.property == property && restriction.forward == forward) {
                    collection._restrictions[i] = restrictions;
                    collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
        
                    this._propagateChanges(focusIndex);
                    this._listeners.fire("onApplyFacetRestrictions", []);
                    return;
                }
            }
            SimileAjax.Debug.log("Exhibit.BrowseEngine.applyFacetRestrictions is called with invalid property and forward");
        } else {
            SimileAjax.Debug.log("Exhibit.BrowseEngine.applyFacetRestrictions is called when there is no collection");
        }
    }
}

Exhibit.BrowseEngine.prototype.truncate = function(index) {
    var focusIndex = this.getFocus();
    if (focusIndex >= 0 && focusIndex < this._collections.length) {
        if (index > 0) {
            this._collections = this._collections.slice(0, index);
            this._slides = this._slides.slice(0, index - 1);
            if (focusIndex >= index) {
                this.focus(index - 1);
            }
        }
        
        this._listeners.fire("onTruncate", []);
    } else {
        SimileAjax.Debug.log("Exhibit.BrowseEngine.truncate is called when there is no collection");
    }
}

Exhibit.BrowseEngine.prototype.group = function(property, forward, level, groupingProperty, groupingForward) {
    var focusIndex = this.getFocus();
    if (focusIndex >= 0 && focusIndex < this._collections.length) {
        var collection = this._collections[focusIndex];
        for (var i = 0; i < collection._restrictions.length; i++) {
            var restriction = collection._restrictions[i];
            if (restriction.property == property && restriction.forward == forward) {
                if (this._group(collection, restriction, level, groupingProperty, groupingForward)) {
                    collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
                    this._propagateChanges(focusIndex);
                    
                    this._listeners.fire("onRestrict", []);
                }
                this._listeners.fire("onGroup", []);
                return;
            }
        }
        SimileAjax.Debug.log("Exhibit.BrowseEngine.group is called with invalid property and forward");
    } else {
        SimileAjax.Debug.log("Exhibit.BrowseEngine.group is called when there is no collection");
    }
};

Exhibit.BrowseEngine.prototype.ungroup = function(property, forward, level) {
    var focusIndex = this.getFocus();
    if (focusIndex >= 0 && focusIndex < this._collections.length) {
        var collection = this._collections[focusIndex];
        for (var i = 0; i < collection._restrictions.length; i++) {
            var restriction = collection._restrictions[i];
            if (restriction.property == property && restriction.forward == forward) {
                if (this._ungroup(collection, restriction, level)) {
                    collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
                    this._propagateChanges(focusIndex);
                    
                    this._listeners.fire("onRestrict", []);
                }
                this._listeners.fire("onUngroup", []);
                return;
            }
        }
        SimileAjax.Debug.log("Exhibit.BrowseEngine.ungroup is called with invalid property and forward");
    } else {
        SimileAjax.Debug.log("Exhibit.BrowseEngine.ungroup is called when there is no collection");
    }
};

Exhibit.BrowseEngine.prototype._addCollection = function(itemSet) {
    var c = new Exhibit.BrowseEngine._Collection(itemSet);
    this._initializeRestrictions(c);
    this._collections.push(c);
    return c;
};

Exhibit.BrowseEngine.prototype._initializeRestrictions = function(collection) {
    for (var i = 0; i < this._facetEntries.length; i++) {
        var facetEntry = this._facetEntries[i];
        collection._restrictions.push(
            new Exhibit.BrowseEngine._Restriction(
                facetEntry.property, 
                facetEntry.forward
            )
        );
    }
};

Exhibit.BrowseEngine.prototype._computeFacet = function(collection, r, facets) {
    var propertyData = this._database.getProperty(r.property);
    var currentSet = this._restrict(collection._originalSet, collection._restrictions, r);
    
    var values = r.forward ? 
        this._database.getObjectsUnion(currentSet, r.property, null, null) :
        this._database.getSubjectsUnion(currentSet, r.property, null, null);
        
    if (values.size() == 0) {
        return;
    }
    
    var slideSet = this._slideSet(collection.getCurrentSet(), r.getProperty(-1), r.getForward(-1));
    
    var facetLabel = r.forward ? propertyData.getPluralLabel() : propertyData.getReversePluralLabel();
    var typeLabels = this._database.getTypeLabels(values);
    var valueLabel = typeLabels[0].length > 0 ? typeLabels[0].join(", ") : "option";
    var pluralValueLabel = typeLabels[1].length > 0 ? typeLabels[1].join(", ") : "options";
    var itemValues = (!r.getForward(-1) || this._database.getProperty(r.getProperty(-1)).getValueType() == "item");
    var facet = {
        facetLabel:         facetLabel,
        property:           r.property,
        forward:            r.forward,
        count:              values.size(),
        selectedCount:      0,
        filteredCount:      slideSet.size(),
        valueLabel:         valueLabel,
        pluralValueLabel:   pluralValueLabel,
        slidable:           this._supportSliding && itemValues,
        groupable:          itemValues,
        groupLevelCount:    r.getLevelCount(),
        values:             []
    };
    
    var queryEngine = this;
    var f = function(level, domainSets, valueToFacetValueMap) {
        var domainSet = domainSets[domainSets.length - 1];
        var property = r.getProperty(level);
        var forward = r.getForward(level);
        var propertyData2 = queryEngine._database.getProperty(property);
        
        var rangeSet = queryEngine._slideSet(domainSet, property, forward);
        var previousSelectedRangeSet = r.getValueSet(level);
        if (previousSelectedRangeSet) {
            rangeSet.addSet(previousSelectedRangeSet);
            facet.selectedCount += previousSelectedRangeSet.size();
        }
        
        var results = [];
        var map = {};
        
        rangeSet.visit(function(rangeValue) {
            if (level > -1) {
                var domainSubset = forward ?
                    queryEngine._database.getSubjects(rangeValue, property, null, domainSet) :
                    queryEngine._database.getObjects(rangeValue, property, null, domainSet);
                
                /*
                 *  Reverse-project all the way to get the count of the subset in the original collection
                 */
                var firstDomainSubset = domainSubset;
                for (var i = level - 1; i >= -1; i--) {
                    firstDomainSubset = r.getForward(i) ?
                        queryEngine._database.getSubjectsUnion(firstDomainSubset, r.getProperty(i), null, domainSets[i+1]) :
                        queryEngine._database.getObjectsUnion(firstDomainSubset, r.getProperty(i), null, domainSets[i+1]);
                }
                
                var count = firstDomainSubset.size();
            } else {
                var count = forward ?
                    queryEngine._database.countDistinctSubjects(rangeValue, property, domainSet) :
                    queryEngine._database.countDistinctObjects(rangeValue, property, domainSet);
            }
            
            var label = propertyData2.itemValues ? 
                queryEngine._database.getObject(rangeValue, "label") : rangeValue;
                
            var facetValue = {
                label:      label,
                value:      rangeValue,
                count:      count,
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
                
                facetValue.children.sort(function(a, b) {
                    return a.label.localeCompare(b.label);
                });
            }
            
            results.push(facetValue);
            map[rangeValue] = facetValue;
        });
        
        if (level < r.getLevelCount() - 1) {
            domainSets.push(rangeSet);
            return arguments.callee(level + 1, domainSets, map);
        } else {
            results.sort(function(a, b) {
                return a.label.localeCompare(b.label);
            });
            return results;
        }
    };
    
    facet.values = f(-1, [ currentSet ], null);
    facets.push(facet);
};

Exhibit.BrowseEngine.prototype._restrict = function(itemSet, restrictions, except) {
    var database = this._database;
    
    /*
     *  Recursion is needed to support grouping.
     */
    var recurseGetRestrictionValues = function(restriction, level, results, intersectResultsWith) {
        var property = restriction.getProperty(level);
        var forward = restriction.getForward(level);
        
        var rangeSet = new Exhibit.Set();
        
        var userSelectedSet = restriction.getValueSet(level);
        if (userSelectedSet && userSelectedSet.size() > 0) {
            rangeSet.addSet(userSelectedSet);
        }
        
        if (level < restriction.getLevelCount() - 1) {
            recurseGetRestrictionValues(restriction, level + 1, rangeSet, null);
        }
        
        if (rangeSet.size() > 0) {
            if (forward) {
                return database.getSubjectsUnion(rangeSet, property, results, intersectResultsWith);
            } else {
                return database.getObjectsUnion(rangeSet, property, results, intersectResultsWith);
            }
        } else {
            return intersectResultsWith;
        }
    }
    
    for (var i = 0; i < restrictions.length; i++) {
        var restriction = restrictions[i];
        if (restriction.isDifferentFrom(except) && restriction.hasSelection()) {
            itemSet = recurseGetRestrictionValues(restriction, -1, null, itemSet);
        }
    }

    return itemSet;
};

Exhibit.BrowseEngine.prototype._slideSet = function(set, property, forward) {
    return forward ?
        this._database.getObjectsUnion(set, property, null, null) :
        this._database.getSubjectsUnion(set, property, null, null);
}

Exhibit.BrowseEngine.prototype._slideCollection = function(collection, property, forward) {
/*
    var r = null;
    for (var i = 0; i < collection._restrictions.length; i++) {
        var restriction = collection._restrictions[i];
        if (restriction.property == property && restriction.reverse == reverse) {
            r = restriction;
            break;
        }
    }
    var set = this._restrict(collection._originalSet, collection._restrictions, r);
*/
    return this._slideSet(collection._restrictedSet, property, forward);
};

Exhibit.BrowseEngine.prototype._propagateChanges = function(index) {
    var collection = this._collections[index];
    
    var prevCollection = collection;
    for (var i = index + 1; i < this._collections.length; i++) {
        var slide = this._slides[i-1];
        
        collection = this._collections[i];
        
        collection._originalSet = this._slideCollection(prevCollection, slide.property, slide.forward);
        collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
        
        prevCollection = collection;
    }
}

Exhibit.BrowseEngine.prototype._getGroups = function(collection, restriction) {
    var results = [];
    
    var groupings = restriction.groupings;
    var set = this._slideCollection(collection, restriction.property, restriction.forward);
    
    var lastSetCanBeGroupedFurther = !restriction.forward ||
        this._database.getProperty(restriction.property).getValueType() == "item";
        
    for (var i = 0; i < groupings.length; i++) {
        var groupingOptions = this._getGroupingOptions(set);
        var result = {
            groupingOptions: groupingOptions
        };
        
        var grouping = groupings[i];
        var groupingProperty = grouping.property;
        var groupingForward = grouping.forward;
        
        lastSetCanBeGroupedFurther = !groupingForward ||
            this._database.getProperty(groupingProperty).getValueType() == "item";
        
        for (var j = 0; j < groupingOptions.length; j++) {
            var groupingOption = groupingOptions[j];
            if (groupingOption.property == groupingProperty &&
                groupingOption.forward == groupingForward) {
                
                set = this._slideSet(set, groupingProperty, groupingForward);
                
                groupingOption.selected = true;
                result.grouped = true;
            }
        }
        
        results.push(result);
    }
    
    if (lastSetCanBeGroupedFurther) {
        results.push({ groupingOptions: this._getGroupingOptions(set) });
    }
    
    return results;
};

Exhibit.BrowseEngine.prototype._group = function(collection, restriction, level, groupingProperty, groupingForward) {
    var changed = false;
    if (level < restriction.groupings.length) {
        for (var i = level; i < restriction.groupings.length; i++) {
            var selection = restriction.groupings[i].valueSet;
            if (selection != null && selection.size() > 0) {
                changed = true;
                break;
            }
        }
        restriction.groupings = restriction.groupings.slice(0, level);
    }
    restriction.groupings.push({ property: groupingProperty, forward: groupingForward });
    return changed;
};

Exhibit.BrowseEngine.prototype._ungroup = function(collection, restriction, level) {
    var changed = false;
    if (level < restriction.groupings.length) {
        for (var i = level; i < restriction.groupings.length; i++) {
            var selection = restriction.groupings[i].valueSet;
            if (selection != null && selection.size() > 0) {
                changed = true;
                break;
            }
        }
        restriction.groupings = restriction.groupings.slice(0, level);
    }
    return changed;
};

Exhibit.BrowseEngine.prototype._getGroupingOptions = function(set) {
    var options = [];
    var propertyIDs = this._database.getAllProperties();
    for (var i = 0; i < propertyIDs.length; i++) {
        var propertyID = propertyIDs[i];
        if (propertyID != "label" && propertyID != "uri") {
            var property = this._database.getProperty(propertyID);
            var objects = this._database.getObjectsUnion(set, propertyID);
            if (objects.size() > 0) {
                options.push({ 
                    property:   propertyID, 
                    forward:    true, 
                    label:      property.getGroupingLabel(), 
                    further:    property.getValueType() == "item"
                });
            }
            if (false) {//data.canReverse) {
                if (this._database.getSubjectsUnion(set, p).size()) {
                    options.push({ 
                        property: p, 
                        reverse: true, 
                        label: data.reverseGroupingLabel, 
                        further: true 
                    });
                }
            }
        }
    }
    return options;
};


/*==================================================
 *  Restriction
 *==================================================
 */
Exhibit.BrowseEngine._Restriction = function(property, forward) {
    this.property = property;
    this.forward = forward;
    this.valueSet = null;
    this.groupings = [];
    this.selectedCount = 0;
}

Exhibit.BrowseEngine._Restriction.prototype.isDifferentFrom = function(r) {
    return r == null || r.property != this.property || r.forward != this.forward;
};

Exhibit.BrowseEngine._Restriction.prototype.isSameAs = function(r) {
    return r != null && r.property == this.property && r.forward == this.forward;
};

Exhibit.BrowseEngine._Restriction.prototype.hasSelection = function() {
    return this.selectedCount > 0;
}

Exhibit.BrowseEngine._Restriction.prototype.clearSelection = function() {
    this.valueSet = null;
    for (var i = 0; i < this.groupings.length; i++) {
        this.groupings[i].valueSet = null;
    }
    this.selectedCount = 0;
}

Exhibit.BrowseEngine._Restriction.prototype.setSelection = function(level, value, selected) {
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

Exhibit.BrowseEngine._Restriction.prototype.getValueSet = function(level) {
    return level < 0 ? this.valueSet : this.groupings[level].valueSet;
}

Exhibit.BrowseEngine._Restriction.prototype.getProperty = function(level) {
    return level < 0 ? this.property : this.groupings[level].property;
}

Exhibit.BrowseEngine._Restriction.prototype.getForward = function(level) {
    return level < 0 ? this.forward : this.groupings[level].forward;
}

Exhibit.BrowseEngine._Restriction.prototype.getLevelCount = function() {
    return this.groupings.length;
}

/*==================================================
 *  Collection
 *  http://simile.mit.edu/wiki/Exhibit/API/BrowseEngine/Collection
 *==================================================
 */
Exhibit.BrowseEngine._Collection = function(itemSet) {
    this._originalSet = itemSet;
    this._restrictedSet = itemSet;
    this._restrictions = [];
    this._focused = false;
}

Exhibit.BrowseEngine._Collection.prototype.size = function() {
    return this._restrictedSet.size();
}

Exhibit.BrowseEngine._Collection.prototype.originalSize = function() {
    return this._originalSet.size();
}

Exhibit.BrowseEngine._Collection.prototype.getCurrentSet = function() {
    return this._restrictedSet;
}

Exhibit.BrowseEngine._Collection.prototype.getOriginalSet = function() {
    return this._originalSet;
}

Exhibit.BrowseEngine._Collection.prototype.hasFocus = function() {
    return this._focused;
}

Exhibit.BrowseEngine._Collection.prototype.getRestrictedSet = function() {
    return this._restrictedSet;
}

