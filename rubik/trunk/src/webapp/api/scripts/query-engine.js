/*==================================================
 *  Rubik.QueryEngine
 *==================================================
 */
Rubik.QueryEngine = function(database, types, properties, rootObjectSet) {
    this._database = database;
    this._types = types;
    this._properties = properties;
    
    this._collections = [];
    this._slides = [];
    
    this._addCollection(rootObjectSet);
    
    this.focus(0);
};

Rubik.QueryEngine.prototype._addCollection = function(objectSet) {
    var c = new Rubik.QueryEngine._Collection(objectSet);
    this._initializeRestrictions(c);
    
    this._collections.push(c);
};

Rubik.QueryEngine.prototype._initializeRestrictions = function(collection) {
    for (p in this._properties) {
        var data = this._properties[p];
        if (!("canFacet" in data) || data["canFacet"]) {
            collection._restrictions.push(new Rubik.QueryEngine._Restriction(p, false, null));
            if (data.canReverse) {
                collection._restrictions.push(new Rubik.QueryEngine._Restriction(p, true, null));
            }
        }
    }
};

Rubik.QueryEngine.prototype.focus = function(index) {
    for (var i = 0; i < this._collections.length; i++) {
        var c = this._collections[i];
        c._focused = (i == index);
    }
};

Rubik.QueryEngine.prototype.getFocus = function() {
    for (var i = 0; i < this._collections.length; i++) {
        var c = this._collections[i];
        if (c._focused) {
            return i;
        }
    }
    
    this._collections[0]._focused = true;
    return 0;
};

Rubik.QueryEngine.prototype.getFacets = function() {
    var collection = this._collections[this.getFocus()];
    var facets = [];
    
    for (var i = 0; i < collection._restrictions.length; i++) {
        var r = collection._restrictions[i];
        this._computeFacet(collection, r, facets);
    }
    
    facets.sort(function(a, b) { return a.label.localeCompare(b.label); });
    
    return facets;
};

Rubik.QueryEngine.prototype._computeFacet = function(collection, r, facets) {
    var propertyData = this._properties[r.property];
    var currentSet = this._restrict(collection._originalSet, collection._restrictions, r);
    
    var values = r.reverse ? 
        this._database.getSubjectsUnion(currentSet, r.property, null, null) :
        this._database.getObjectsUnion(currentSet, r.property, null, null);
        
    if (values.size() == 0) {
        return;
    }
    
    var slideSet = this._slide2(collection.getCurrentSet(), r.getProperty(-1), r.getReverse(-1));
    
    var facetLabel = r.reverse ?
        ((propertyData.reversePluralLabel) ? propertyData.reversePluralLabel : propertyData.reverseLabel) :
        ((propertyData.pluralLabel) ? propertyData.pluralLabel : propertyData.label);
    
    var typeLabels = this.getTypeLabels(values);
    var facet = {
        label:              facetLabel,
        property:           r.property,
        reverse:            r.reverse,
        count:              values.size(),
        selectedCount:      0,
        filteredCount:      slideSet.size(),
        valueLabel:         typeLabels[0],
        pluralValueLabel:   typeLabels[1],
        slidable:           ("canSlide" in propertyData) ? propertyData["canSlide"] : propertyData.canReverse,
        grouped:            r.getLevelCount() > 0,
        values:             []
    };
    
    var queryEngine = this;
    var f = function(level, domainSets, valueToFacetValueMap) {
        var domainSet = domainSets[domainSets.length - 1];
        var property = r.getProperty(level);
        var reverse = r.getReverse(level);
        var propertyData2 = queryEngine._properties[property];
        
        var rangeSet = queryEngine._slide2(domainSet, property, reverse);
        var previousSelectedRangeSet = r.getValueSet(level);
        if (previousSelectedRangeSet) {
            rangeSet.addSet(previousSelectedRangeSet);
        }
        
        var results = [];
        var map = {};
        
        rangeSet.visit(function(rangeValue) {
            if (level > -1) {
                var domainSubset = reverse ?
                    queryEngine._database.getObjects(rangeValue, property, null, domainSet) :
                    queryEngine._database.getSubjects(rangeValue, property, null, domainSet);
                
                /*
                 *  Reverse-project all the way to get the count of the subset in the original collection
                 */
                var firstDomainSubset = domainSubset;
                for (var i = level - 1; i >= -1; i--) {
                    firstDomainSubset = r.getReverse(i) ?
                        queryEngine._database.getObjectsUnion(firstDomainSubset, r.getProperty(i), null, domainSets[i+1]) :
                        queryEngine._database.getSubjectsUnion(firstDomainSubset, r.getProperty(i), null, domainSets[i+1]);
                }
                
                var count = firstDomainSubset.size();
            } else {
                var count = reverse ?
                    queryEngine._database.countDistinctObjects(rangeValue, property, domainSet) :
                    queryEngine._database.countDistinctSubjects(rangeValue, property, domainSet);
            }
            
            var label = propertyData2.isLiteral ? 
                rangeValue : queryEngine._database.getLiteralProperty(rangeValue, "label");
                
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

Rubik.QueryEngine.prototype.getTypeLabels = function(set) {
    var types = this._database.getObjectsUnion(set, "type", null, null);
    var typeArray = types.toArray();
    var typeLabels = [];
    var pluralTypeLabels = [];
    for (var i = 0; i < typeArray.length; i++) {
        pluralTypeLabels.push(this._types[typeArray[i]].pluralLabel);
        typeLabels.push(this._types[typeArray[i]].label);
    }
    if (typeLabels.length == 0) {
        typeLabels[0] = "option";
        pluralTypeLabels[0] = "options";
    }
    
    return [ typeLabels.join("/"), pluralTypeLabels.join(", ") ];
};

Rubik.QueryEngine.prototype._restrict = function(originalSet, restrictions, except) {
    var currentSet = originalSet;
    
    var database = this._database;
    var queryEngine = this;
    
    var recurseGetRestrictionValues = function(restriction, level, results, filter) {
        var property = restriction.getProperty(level);
        var reverse = restriction.getReverse(level);
        
        var rangeSet = new Rubik.Set();
        
        var valueSet = restriction.getValueSet(level);
        if (valueSet && valueSet.size() > 0) {
            rangeSet.addSet(valueSet);
        }
        
        if (level < restriction.getLevelCount() - 1) {
            recurseGetRestrictionValues(restriction, level + 1, rangeSet, null);
        }
        
        if (rangeSet.size() > 0) {
            if (reverse) {
                return database.getObjectsUnion(
                    rangeSet, property, results, filter);
            } else {
                return database.getSubjectsUnion(
                    rangeSet, property, results, filter);
            }
        } else {
            return filter;
        }
    }
    
    var addRestriction = function(restriction) {
        if (restriction.hasSelection()) {
            currentSet = recurseGetRestrictionValues(restriction, -1, null, currentSet);
        }
    }
    
    for (var i = 0; i < restrictions.length; i++) {
        var restriction = restrictions[i];
        if (!except || (restriction.property != except.property || restriction.reverse != except.reverse)) {
            addRestriction(restriction);
        }
    }

    return currentSet;
};

Rubik.QueryEngine.prototype._slide2 = function(set, property, reverse) {
    return reverse ?
        this._database.getSubjectsUnion(set, property, null, null) :
        this._database.getObjectsUnion(set, property, null, null);
}

Rubik.QueryEngine.prototype._slide = function(collection, property, reverse) {
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
    return this._slide2(collection._restrictedSet, property, reverse);
};

Rubik.QueryEngine.prototype.setValueRestriction = function(property, reverse, level, value, selected) {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    for (var i = 0; i < collection._restrictions.length; i++) {
        var restriction = collection._restrictions[i];
        if (restriction.property == property && restriction.reverse == reverse) {
            restriction.setSelection(level, value, selected);
            break;
        }
    }
    
    collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
    
    this._propagateChanges(focusIndex);
};

Rubik.QueryEngine.prototype.slide = function(property, reverse) {
    var focusIndex = this.getFocus();
    if (focusIndex < this._collections.length - 1) {
        this._collections = this._collections.slice(0, focusIndex + 1);
        this._slides = this._collections.slice(0, focusIndex);
    }
    
    var propertyData = this._properties[property];
    var label = reverse ? propertyData.reversePluralLabel : propertyData.pluralLabel;
    var slide = {
        property:   property,
        reverse:    reverse,
        label:      label
    };

    this._slides.push(slide);
    
    var collection = this._collections[focusIndex];
    var newSet = this._slide(collection, property, reverse);
    
    this._addCollection(newSet);
    this.focus(focusIndex + 1);
}

Rubik.QueryEngine.prototype.clearAllCurrentFilters = function() {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    for (var i = 0; i < collection._restrictions.length; i++) {
        collection._restrictions[i].clearSelection();
    }
    
    collection._restrictedSet = collection._originalSet;
    
    this._propagateChanges(focusIndex);
}

Rubik.QueryEngine.prototype._propagateChanges = function(index) {
    var collection = this._collections[index];
    
    var prevCollection = collection;
    for (var i = index + 1; i < this._collections.length; i++) {
        var slide = this._slides[i-1];
        
        collection = this._collections[i];
        
        collection._originalSet = this._slide(prevCollection, slide.property, slide.reverse);
        collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
        
        prevCollection = collection;
    }
}

Rubik.QueryEngine.prototype.truncate = function(index) {
    var focusIndex = this.getFocus();
    if (index > 0) {
        this._collections = this._collections.slice(0, index);
        this._slides = this._slides.slice(0, index - 1);
        if (focusIndex >= index) {
            this.focus(index - 1);
        }
    }
}

Rubik.QueryEngine.prototype.getPropertyValuesPairs = function(object) {
    var pairs = [];
    
    var queryEngine = this;
    var enterPair = function(propertyData, values, reverse) {
        if (values.length > 0) {
            var pair = { 
                propertyLabel: reverse ? propertyData.reverseLabel : propertyData.label,
                isLiteral: data.isLiteral,
                values: []
            };
            if (data.isLiteral) {
                for (var i = 0; i < values.length; i++) {
                    pair.values.push(values[i]);
                }
            } else {
                for (var i = 0; i < values.length; i++) {
                    pair.values.push(queryEngine._database.getLiteralProperty(values[i], "label"));
                }
            }
            pairs.push(pair);
        }
    };
    
    for (p in this._properties) {
        if (p != '______array') {
            var data = this._properties[p];
            if (!("canDisplay" in data) || data["canDisplay"]) {
                enterPair(data, g_database.getObjects(object, p).toArray(), false);
                if (data.canReverse) {
                    enterPair(data, g_database.getSubjects(object, p).toArray(), true);
                }
            }
        }
    }
    return pairs;
};

Rubik.QueryEngine.prototype.getCollectionCount = function() {
    return this._collections.length;
}

Rubik.QueryEngine.prototype.getCollection = function(index) {
    return this._collections[index];
}

Rubik.QueryEngine.prototype.getSlide = function(index) {
    return this._slides[index];
}

Rubik.QueryEngine.prototype.getCurrentCollection = function() {
    return this._collections[this.getFocus()];
};

Rubik.QueryEngine.prototype.getGroups = function(property, reverse) {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    for (var i = 0; i < collection._restrictions.length; i++) {
        var restriction = collection._restrictions[i];
        if (restriction.property == property && restriction.reverse == reverse) {
            return this._getGroups(collection, restriction);
        }
    }
};

Rubik.QueryEngine.prototype.group = function(property, reverse, level, groupingProperty, groupingReverse) {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    for (var i = 0; i < collection._restrictions.length; i++) {
        var restriction = collection._restrictions[i];
        if (restriction.property == property && restriction.reverse == reverse) {
            var results = this._group(collection, restriction, level, groupingProperty, groupingReverse);
            
            collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
            this._propagateChanges(focusIndex);
            
            return results;
        }
    }
};

Rubik.QueryEngine.prototype.ungroup = function(property, reverse, level) {
    var focusIndex = this.getFocus();
    var collection = this._collections[focusIndex];
    for (var i = 0; i < collection._restrictions.length; i++) {
        var restriction = collection._restrictions[i];
        if (restriction.property == property && restriction.reverse == reverse) {
            var results = this._ungroup(collection, restriction, level);
            
            collection._restrictedSet = this._restrict(collection._originalSet, collection._restrictions, null);
            this._propagateChanges(focusIndex);
            
            return results;
        }
    }
};

Rubik.QueryEngine.prototype._getGroups = function(collection, restriction) {
    var results = [];
    
    var groupings = restriction.groupings;
    var set = this._slide(collection, restriction.property, restriction.reverse);
    
    var further = true;
    for (var i = 0; i < groupings.length; i++) {
        var grouping = groupings[i];
        var groupingProperty = grouping.property;
        var groupingReverse = grouping.reverse;
        
        var groupingOptions = this._getGroupingOptions(set);
        var result = {
            groupingOptions: groupingOptions
        };
        
        further = false;
        for (var j = 0; j < groupingOptions.length; j++) {
            var groupingOption = groupingOptions[j];
            if (groupingOption.property == groupingProperty &&
                groupingOption.reverse == groupingReverse) {
                
                groupingOption.selected = true;
                result.values = this._slide2(set, groupingProperty, groupingReverse);
                result.isLiteral = this._properties[groupingOption.property].isLiteral;
                
                set = result.values;
                further = groupingOption.further;
            } else {
                groupingOption.selected = false;
            }
        }
        
        results.push(result);
    }
    
    if (further) {
        results.push({ groupingOptions: this._getGroupingOptions(set) });
    }
    
    return results;
};

Rubik.QueryEngine.prototype._group = function(collection, restriction, level, groupingProperty, groupingReverse) {
    if (level < restriction.groupings.length) {
        restriction.groupings = restriction.groupings.slice(0, level);
    }
    restriction.groupings.push({ property: groupingProperty, reverse: groupingReverse });
};

Rubik.QueryEngine.prototype._ungroup = function(collection, restriction, level) {
    if (level < restriction.groupings.length) {
        restriction.groupings = restriction.groupings.slice(0, level);
    }
};

Rubik.QueryEngine.prototype._getGroupingOptions = function(set) {
    var options = [];
    for (p in this._properties) {
        if (p != '______array') {
            var data = this._properties[p];
            if (!("canGroup" in data) || data["canGroup"]) {
                if (this._database.getObjectsUnion(set, p).size()) {
                    options.push({ 
                        property: p, 
                        reverse: false, 
                        label: data.groupingLabel, 
                        further: !data.isLiteral
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
        }
    }
    return options;
};


/*==================================================
 *  Restriction
 *==================================================
 */
Rubik.QueryEngine._Restriction = function(property, reverse, valueSet) {
    this.property = property;
    this.reverse = reverse;
    this.valueSet = valueSet;
    this.groupings = [];
    this.selectedCount = 0;
}

Rubik.QueryEngine._Restriction.prototype.hasSelection = function() {
    return this.selectedCount > 0;
}

Rubik.QueryEngine._Restriction.prototype.clearSelection = function() {
    this.valueSet = null;
    for (var i = 0; i < this.groupings.length; i++) {
        this.groupings[i].valueSet = null;
    }
    this.selectedCount = 0;
}

Rubik.QueryEngine._Restriction.prototype.setSelection = function(level, value, selected) {
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

Rubik.QueryEngine._Restriction.prototype.getValueSet = function(level) {
    return level < 0 ? this.valueSet : this.groupings[level].valueSet;
}

Rubik.QueryEngine._Restriction.prototype.getProperty = function(level) {
    return level < 0 ? this.property : this.groupings[level].property;
}

Rubik.QueryEngine._Restriction.prototype.getReverse = function(level) {
    return level < 0 ? this.reverse : this.groupings[level].reverse;
}

Rubik.QueryEngine._Restriction.prototype.getLevelCount = function() {
    return this.groupings.length;
}

/*==================================================
 *  Collection
 *==================================================
 */
Rubik.QueryEngine._Collection = function(objectSet) {
    this._originalSet = objectSet;
    this._restrictedSet = objectSet;
    this._restrictions = [];
    this._focused = false;
}

Rubik.QueryEngine._Collection.prototype.size = function() {
    return this._restrictedSet.size();
}

Rubik.QueryEngine._Collection.prototype.originalSize = function() {
    return this._originalSet.size();
}

Rubik.QueryEngine._Collection.prototype.getCurrentSet = function() {
    return this._restrictedSet;
}

Rubik.QueryEngine._Collection.prototype.getOriginalSet = function() {
    return this._originalSet;
}

Rubik.QueryEngine._Collection.prototype.hasFocus = function() {
    return this._focused;
}

Rubik.QueryEngine._Collection.prototype.getRestrictedSet = function() {
    return this._restrictedSet;
}

