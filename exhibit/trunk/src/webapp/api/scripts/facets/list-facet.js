/*==================================================
 *  Exhibit.ListFacet
 *==================================================
 */
 
Exhibit.ListFacet = function(exhibit, facet, div, configuration) {
    this._exhibit = exhibit;
    this._configuration = configuration;
    
    this._facetID = facet.facetID;
    this._facetLabel = facet.facetLabel;
    
    this._dom = null;
    this._topValueDoms = null;
    this._groupingBoxDom = null;
    
    this._constructFrame(div, facet);
    this.update(facet);
};

Exhibit.ListFacet.prototype.dispose = function() {
    this._dom.close();
    
    if (this._groupingBoxDom != null) {
        this._groupingBoxDom.elmt.parentNode.removeChild(this._groupingBoxDom.elmt);
        this._groupingBoxDom = null;
    }
    this._exhibit = null;
    this._configuration = null;
    this._dom = null;
    this._topValueDoms = null;
};

Exhibit.ListFacet.prototype.update = function(facet) {
    this._dom.valuesContainer.style.display = "none";
    this._dom.valuesContainer.innerHTML = "";
    
    this._constructBody(facet);
    
    this._dom.valuesContainer.style.display = "block";
};

Exhibit.ListFacet.prototype._constructFrame = function(div, facet) {
    var listFacet = this;

    var onGroup = function(elmt, evt, target) {
        listFacet._openGroupingUI();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var onCollapseAll = function(elmt, evt, target) {
        listFacet._collapseGroups();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var onExpandAll = function(elmt, evt, target) {
        listFacet._expandGroups();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var onClearSelections = function(elmt, evt, target) {
        listFacet._clearSelections();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    
    this._dom = Exhibit.ListFacet.theme.constructFacetFrame(
        this._exhibit,
        div,
        facet.facetLabel,
        facet.groupable,
        facet.groupLevelCount > 0,
        onGroup, 
        onCollapseAll, 
        onExpandAll, 
        onClearSelections
    );
    this._dom.open();
};

Exhibit.ListFacet.prototype._constructBody = function(facet) {
    var listFacet = this;
    this._topValueDoms = [];
    this._dom.setGroupControlsVisible(facet.groupLevelCount > 0);

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
    constructValues(facet.values, this._dom.valuesContainer, 0);
    
    this._groupLevelCount = facet.groupLevelCount;
    this._dom.setSelectionCount(facet.selectedCount);
};

Exhibit.ListFacet.prototype._filter = function(valueDom) {
    var facetID = this._facetID;
    var level = this._groupLevelCount - valueDom.level - 1;
    var value = valueDom.value;
    var selected = !valueDom.selected;
    var browseEngine = this._exhibit.getBrowseEngine();
    
    SimileAjax.History.addAction({
        perform: function() {
            browseEngine.setValueRestriction(
                facetID, level, value, selected
            );
        },
        undo: function() {
            browseEngine.setValueRestriction(
                facetID, level, value, !selected
            );
        },
        label: selected ? 
            ("set " + this._facetLabel + " = " + value) :
            ("unset " + this._facetLabel + " = " + value),
        uiLayer: SimileAjax.WindowManager.getBaseLayer(),
        lengthy: true
    });
};

Exhibit.ListFacet.prototype._slide = function() {
};

Exhibit.ListFacet.prototype._clearSelections = function() {
    var state = {};
    var facetID = this._facetID;
    var browseEngine = this._exhibit.getBrowseEngine();
    SimileAjax.History.addAction({
        perform: function() {
            state.restrictions = browseEngine.clearFacetRestrictions(facetID);
        },
        undo: function() {
            browseEngine.applyFacetRestrictions(facetID, state.restrictions);
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

