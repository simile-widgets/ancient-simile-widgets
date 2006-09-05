/*==================================================
 *  Rubik.BrowseEngine
 *==================================================
 */
Rubik.BrowseEngine = function(database, configuration) {
    this._database = database;
    this._listeners = new SimileAjax.ListenerQueue("onChange");
    
    this._facetEntries = [];
    this._supportSliding = false;
    
    if ("BrowseEngine" in configuration) {
        var myConfig = configuration["BrowseEngine"];
        
        if ("facets" in myConfig) {
            var facetEntries = myConfig["facets"];
            for (var i = 0; i < facetEntries.length; i++) {
                var entry = facetEntries[i];
                var facetEntry;
                if (typeof entry == "string") {
                    facetEntry = {
                        property: entry,
                        forward:  true
                    };
                } else {
                    facetEntry = {
                        property: entry.property,
                        forward:  ("forward" in entry) ? (entry.forward) : true
                    }
                }
                this._facetEntries.push(facetEntry);
            }
        }
        if ("sliding" in myConfig && myConfig.sliding) {
            this._supportSliding = true;
        }
    }
    
    this._collections = [];
    this._slides = [];
};

Rubik.BrowseEngine.prototype.addListener = function(listener) {
    this._listeners.add(listener);
};

Rubik.BrowseEngine.prototype.removeListener = function(listener) {
    this._listeners.remove(listener);
};

Rubik.BrowseEngine.prototype.getFocus = function() {
    for (var i = 0; i < this._collections.length; i++) {
        var c = this._collections[i];
        if (c._focused) {
            return i;
        }
    }
    return -1;
};

Rubik.BrowseEngine.prototype.getCollectionCount = function() {
    return this._collections.length;
}

Rubik.BrowseEngine.prototype.getCurrentCollection = function() {
    return this._collections[this.getFocus()];
};

Rubik.BrowseEngine.prototype.getCollection = function(index) {
    return this._collections[index];
}

Rubik.BrowseEngine.prototype.getSlide = function(index) {
    return this._slides[index];
}

Rubik.BrowseEngine.prototype.getFacets = function() {
    var facets = [];
    
    var focusIndex = this.getFocus();
    if (focusIndex >= 0) {
        var collection = this._collections[focusIndex];
        for (var i = 0; i < collection._restrictions.length; i++) {
            var r = collection._restrictions[i];
            this._computeFacet(collection, r, facets);
        }
    }
    return facets;
};

Rubik.BrowseEngine.prototype.getGroups = function(property, forward) {
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

Rubik.BrowseEngine.prototype.setRootCollection = function(itemSet) {
    this._collections = [];
    this._slides = [];
    this._addCollection(itemSet)._focused = true;
    this._listeners.fire("onRootCollectionSet", []);
};

Rubik.BrowseEngine.prototype.setValueRestriction = function(property, forward, level, value, selected) {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    for (var i = 0; i < collection._restrictions.length; i++) {
        var restriction = collection._restrictions[i];
        if (restriction.property == property && restriction.forward == forward) {
            restriction.setSelection(level, value, selected);
            break;
        }
    }
    
    collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
    
    this._propagateChanges(focusIndex);
    
    this._listeners.fire("onRestrict", []);
};

Rubik.BrowseEngine.prototype.focus = function(index) {
    for (var i = 0; i < this._collections.length; i++) {
        var c = this._collections[i];
        c._focused = (i == index);
    }
};

Rubik.BrowseEngine.prototype.slide = function(propertyID, forward) {
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

Rubik.BrowseEngine.prototype.clearRestrictions = function() {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    var oldRestrictions = collection._restrictions;
    
    collection._restrictions = [];
    collection._restrictedSet = collection._originalSet;
    this._initializeRestrictions(collection);
    
    this._propagateChanges(focusIndex);
    this._listeners.fire("onClearRestrictions", []);
    
    return oldRestrictions;
}

Rubik.BrowseEngine.prototype.applyRestrictions = function(restrictions) {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    collection._restrictions = restrictions;
    collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
    this._propagateChanges(focusIndex);
    this._listeners.fire("onApplyRestrictions", []);
}

Rubik.BrowseEngine.prototype.clearFacetRestrictions = function(property, forward) {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    for (var i = 0; i < collection._restrictions.length; i++) {
        var restriction = collection._restrictions[i];
        if (restriction.property == property && restriction.forward == forward) {
            var oldRestriction = restriction;
            collection._restrictions[i] = new Rubik.BrowseEngine._Restriction(property, forward);
            collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);

            this._propagateChanges(focusIndex);
            this._listeners.fire("onClearFacetRestrictions", []);
            
            return oldRestriction;
        }
    }
    return null;
}

Rubik.BrowseEngine.prototype.applyFacetRestrictions = function(property, forward, restrictions) {
    if (restrictions != null) {
        var focusIndex = this.getFocus();
        var collection = this._collections[focusIndex];
        for (var i = 0; i < collection._restrictions.length; i++) {
            var restriction = collection._restrictions[i];
            if (restriction.property == property && restriction.forward == forward) {
                collection._restrictions[i] = restrictions;
                collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
    
                this._propagateChanges(focusIndex);
                this._listeners.fire("onApplyFacetRestrictions", []);
                break;
            }
        }
    }
}

Rubik.BrowseEngine.prototype.truncate = function(index) {
    var focusIndex = this.getFocus();
    if (index > 0) {
        this._collections = this._collections.slice(0, index);
        this._slides = this._slides.slice(0, index - 1);
        if (focusIndex >= index) {
            this.focus(index - 1);
        }
    }
    
    this._listeners.fire("onTruncate", []);
}

Rubik.BrowseEngine.prototype.group = function(property, forward, level, groupingProperty, groupingForward) {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    for (var i = 0; i < collection._restrictions.length; i++) {
        var restriction = collection._restrictions[i];
        if (restriction.property == property && restriction.forward == forward) {
            var results = this._group(collection, restriction, level, groupingProperty, groupingForward);
            
            collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
            this._propagateChanges(focusIndex);
            
            return results;
        }
    }
};

Rubik.BrowseEngine.prototype.ungroup = function(property, forward, level) {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    for (var i = 0; i < collection._restrictions.length; i++) {
        var restriction = collection._restrictions[i];
        if (restriction.property == property && restriction.forward == forward) {
            var results = this._ungroup(collection, restriction, level);
            
            collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
            this._propagateChanges(focusIndex);
            
            return results;
        }
    }
};

Rubik.BrowseEngine.prototype._addCollection = function(itemSet) {
    var c = new Rubik.BrowseEngine._Collection(itemSet);
    this._initializeRestrictions(c);
    this._collections.push(c);
    return c;
};

Rubik.BrowseEngine.prototype._initializeRestrictions = function(collection) {
    for (var i = 0; i < this._facetEntries.length; i++) {
        var facetEntry = this._facetEntries[i];
        collection._restrictions.push(
            new Rubik.BrowseEngine._Restriction(
                facetEntry.property, 
                facetEntry.forward
            )
        );
    }
};

Rubik.BrowseEngine.prototype._computeFacet = function(collection, r, facets) {
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
        grouped:            r.getLevelCount() > 0,
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
                queryEngine._database.getLiteralProperty(rangeValue, "label") : rangeValue;
                
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
        } else {try {
            results.sort(function(a, b) {
                return a.label.localeCompare(b.label);
            });} catch(e) { console.log(results); }
            return results;
        }
    };
    
    facet.values = f(-1, [ currentSet ], null);
    facets.push(facet);
};

Rubik.BrowseEngine.prototype._restrict = function(itemSet, restrictions, except) {
    var database = this._database;
    
    /*
     *  Recursion is needed to support grouping.
     */
    var recurseGetRestrictionValues = function(restriction, level, results, intersectResultsWith) {
        var property = restriction.getProperty(level);
        var forward = restriction.getForward(level);
        
        var rangeSet = new Rubik.Set();
        
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

Rubik.BrowseEngine.prototype._slideSet = function(set, property, forward) {
    return forward ?
        this._database.getObjectsUnion(set, property, null, null) :
        this._database.getSubjectsUnion(set, property, null, null);
}

Rubik.BrowseEngine.prototype._slideCollection = function(collection, property, forward) {
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

Rubik.BrowseEngine.prototype._propagateChanges = function(index) {
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

Rubik.BrowseEngine.prototype._getGroups = function(collection, restriction) {
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
                
                result.values = this._slideSet(set, groupingProperty, groupingForward);
                set = result.values;
                
                groupingOption.selected = true;
            }
        }
        
        results.push(result);
    }
    
    if (lastSetCanBeGroupedFurther) {
        results.push({ groupingOptions: this._getGroupingOptions(set) });
    }
    
    return results;
};

Rubik.BrowseEngine.prototype._group = function(collection, restriction, level, groupingProperty, groupingForward) {
    if (level < restriction.groupings.length) {
        restriction.groupings = restriction.groupings.slice(0, level);
    }
    restriction.groupings.push({ property: groupingProperty, forward: groupingForward });
};

Rubik.BrowseEngine.prototype._ungroup = function(collection, restriction, level) {
    if (level < restriction.groupings.length) {
        restriction.groupings = restriction.groupings.slice(0, level);
    }
};

Rubik.BrowseEngine.prototype._getGroupingOptions = function(set) {
    var options = [];
/*    for (p in this._properties) {
        var data = this._properties[p];
        if (!("canGroup" in data) || data["canGroup"]) {
            if (this._database.getObjectsUnion(set, p).size()) {
                options.push({ 
                    property: p, 
                    reverse: false, 
                    label: data.groupingLabel, 
                    further: data.itemValues
                });
            }
            if (data.canReverse) {
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
    } */
    return options;
};


/*==================================================
 *  Restriction
 *==================================================
 */
Rubik.BrowseEngine._Restriction = function(property, forward) {
    this.property = property;
    this.forward = forward;
    this.valueSet = null;
    this.groupings = [];
    this.selectedCount = 0;
}

Rubik.BrowseEngine._Restriction.prototype.isDifferentFrom = function(r) {
    return r == null || r.property != this.property || r.forward != this.forward;
};

Rubik.BrowseEngine._Restriction.prototype.isSameAs = function(r) {
    return r != null && r.property == this.property && r.forward == this.forward;
};

Rubik.BrowseEngine._Restriction.prototype.hasSelection = function() {
    return this.selectedCount > 0;
}

Rubik.BrowseEngine._Restriction.prototype.clearSelection = function() {
    this.valueSet = null;
    for (var i = 0; i < this.groupings.length; i++) {
        this.groupings[i].valueSet = null;
    }
    this.selectedCount = 0;
}

Rubik.BrowseEngine._Restriction.prototype.setSelection = function(level, value, selected) {
    if (selected) {
        if (level == -1) {
            if (!this.valueSet) {
                this.valueSet = new Rubik.Set();
            }
            if (this.valueSet.add(value)) {
                this.selectedCount++;
            }
        } else {
            var grouping = this.groupings[level];
            if (!grouping.valueSet) {
                grouping.valueSet = new Rubik.Set();
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

Rubik.BrowseEngine._Restriction.prototype.getValueSet = function(level) {
    return level < 0 ? this.valueSet : this.groupings[level].valueSet;
}

Rubik.BrowseEngine._Restriction.prototype.getProperty = function(level) {
    return level < 0 ? this.property : this.groupings[level].property;
}

Rubik.BrowseEngine._Restriction.prototype.getForward = function(level) {
    return level < 0 ? this.forward : this.groupings[level].forward;
}

Rubik.BrowseEngine._Restriction.prototype.getLevelCount = function() {
    return this.groupings.length;
}

/*==================================================
 *  Collection
 *==================================================
 */
Rubik.BrowseEngine._Collection = function(itemSet) {
    this._originalSet = itemSet;
    this._restrictedSet = itemSet;
    this._restrictions = [];
    this._focused = false;
}

Rubik.BrowseEngine._Collection.prototype.size = function() {
    return this._restrictedSet.size();
}

Rubik.BrowseEngine._Collection.prototype.originalSize = function() {
    return this._originalSet.size();
}

Rubik.BrowseEngine._Collection.prototype.getCurrentSet = function() {
    return this._restrictedSet;
}

Rubik.BrowseEngine._Collection.prototype.getOriginalSet = function() {
    return this._originalSet;
}

Rubik.BrowseEngine._Collection.prototype.hasFocus = function() {
    return this._focused;
}

Rubik.BrowseEngine._Collection.prototype.getRestrictedSet = function() {
    return this._restrictedSet;
}

