/*==================================================
 *  Exhibit.ListFacet
 *==================================================
 */
 
Exhibit.ListFacet = function(exhibit, facet, div, configuration) {
    this._exhibit = exhibit;
    this._configuration = configuration;
    
    this._property = facet.property;
    this._forward = facet.forward;
    this._facetLabel = facet.facetLabel;
    
    this._dom = null;
    this._topValueDoms = null;
    this._groupingDom = null;
    
    this._constructFrame(div, facet);
    this._constructBody(facet);
};

Exhibit.ListFacet.prototype.dispose = function() {
    var div = this._dom.elmt;
    var parentNode = div.parentNode;
    var height = div.offsetHeight;
    div.style.overflow = "hidden";
    
    var f = function(current, step) {
        if (step == 0) {
            parentNode.removeChild(div);
        } else {
            div.style.height = Math.floor(height * current / 100) + "px";
            div.style.opacity = Math.round(current / 10) / 10;
        }
    };
    SimileAjax.Graphics.createAnimation(f, 100, 0, 500).run();
    
    if (this._groupingDom != null) {
        this._groupingDom.elmt.parentNode.removeChild(this._groupingDom.elmt);
        this._groupingDom = null;
    }
    this._exhibit = null;
    this._configuration = null;
    this._dom = null;
    this._topValueDoms = null;
};

Exhibit.ListFacet.prototype.update = function(facet) {
    this._dom.valuesDiv.innerHTML = "";
    this._constructBody(facet);
};

Exhibit.ListFacet.prototype._constructFrame = function(div, facet) {
    var exhibit = this._exhibit;
    var listFacet = this;

    var onGroupLinkClick = function(elmt, evt, target) {
        listFacet._openGroupingUI();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var onCollapseLinkClick = function(elmt, evt, target) {
        listFacet._collapseGroups();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var onExpandLinkClick = function(elmt, evt, target) {
        listFacet._expandGroups();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var onClearSelectionsClick = function(elmt, evt, target) {
        listFacet._clearSelections();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
        
    var template = {
        elmt:       div,
        className:  "exhibit-facet-frame",
        style:      { height: "1px" },
        children: [
            {   tag:        "div",
                className:  "exhibit-facet",
                field:      "innerFacetDiv",
                children: [
                    {   tag:        "div",
                        className:  "exhibit-facet-header",
                        children: [ 
                            {   tag:        "div",
                                className:  "exhibit-facet-header-filterControl",
                                field:      "clearSelectionsDiv",
                                title:      "Clear these selections",
                                children:   [
                                    "",
                                    {   elmt: SimileAjax.Graphics.createTranslucentImage(
                                            document, Exhibit.urlPrefix + "images/black-check-no-border.png")
                                    }
                                ]
                            },
                            {   tag:        "span",
                                className:  "exhibit-facet-header-title",
                                children:   [ facet.facetLabel ]
                            },
                            {   tag:        "span",
                                className:  "exhibit-facet-header-details",
                                children:   []
                            }
                        ]
                    },
                    {   tag:        "div",
                        className:  "exhibit-facet-body",
                        field:      "valuesDiv"
                    },
                    {   tag:        "div",
                        className:  "exhibit-facet-footer",
                        style:      { display: facet.groupable ? "block" : "none" },
                        children: [
                            {   elmt:  exhibit.makeActionLink("group by", onGroupLinkClick),
                                field: "groupLink"
                            },
                            {   tag:    "span",
                                field:  "groupControlsSpan",
                                style:  { display: facet.groupLevelCount > 0 ? "inline" : "none" },
                                children: [
                                    " | ",
                                    {   elmt:  exhibit.makeActionLink("collapse", onCollapseLinkClick),
                                        field: "collapseLink"
                                    },
                                    " | ",
                                    {   elmt:  exhibit.makeActionLink("expand", onExpandLinkClick),
                                        field: "expandLink"
                                    }
                                ]
                            }
                        ]
                    },
                    {   tag: "div",
                        className: "exhibit-facet-resizer",
                        field: "resizerDiv"
                    }
                ]
            }
        ]
    };
    
    this._dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    
    SimileAjax.WindowManager.registerEvent(this._dom.clearSelectionsDiv, "click", onClearSelectionsClick);
    SimileAjax.WindowManager.registerForDragging(
        this._dom.resizerDiv,
        {   onDragStart: function() {
                this._height = listFacet._dom.valuesDiv.offsetHeight;
            },
            onDragBy: function(diffX, diffY) {
                this._height += diffY;
                listFacet._dom.valuesDiv.style.height = Math.max(50, this._height) + "px";
            },
            onDragEnd: function() {
            }
        }
    );
    
    /*
     *  Animate opening up facet
     */
    var facetDiv = div.firstChild;
    var f = function(current, step) {
        if (step == 0) {
            div.style.overflow = "visible";
            div.style.opacity = 1;
            div.style.height = "";
        } else {
            var height = facetDiv.offsetHeight;
            div.style.height = Math.floor(height * current / 100) + "px";
            div.style.opacity = Math.round(current / 10) / 10;
        }
    };
    SimileAjax.Graphics.createAnimation(f, 0, 100, 300).run();
};

Exhibit.ListFacet.prototype._constructBody = function(facet) {
    var listFacet = this;
    this._topValueDoms = [];
    this._dom.groupControlsSpan.style.display = 
        facet.groupLevelCount > 0 ? "inline" : "none";

    var createImage = function(url) {
        return SimileAjax.Graphics.createTranslucentImage(document, Exhibit.urlPrefix + url);
    };
    
    var constructValue = function(value, containerDiv, level) {
        var classes = [ "exhibit-facet-value" ];
        var hasChildren = value.children.length > 0;
        var expanded = level == 0;
        
        if (value.selected) {
            classes.push("exhibit-facet-value-selected");
        }
        if (hasChildren) {
            classes.push("exhibit-facet-value-hasChildren");
        }
        
        var valueTemplate = {
            tag:        "div",
            className:  classes.join(" "),
            title:      value.label,
            children: [
                {   tag:        "div",
                    className:  "exhibit-facet-value-count",
                    children:   [ 
                        value.count,
                        {   elmt:       createImage("images/gray-check-no-border.png"),
                            className:  "exhibit-facet-grayCheck"
                        },
                        {   elmt:       createImage("images/no-check-no-border.png"),
                            className:  "exhibit-facet-noCheck"
                        },
                        {   elmt:       createImage("images/black-check-no-border.png"),
                            className:  "exhibit-facet-blackCheck"
                        }
                    ]
                },
                {   tag:        "div",
                    className:  "exhibit-facet-value-inner",
                    field:      "innerDiv",
                    children:   [ 
                        {   tag:        "div",
                            className:  "exhibit-facet-value-groupControl " +
                                (expanded ? "exhibit-facet-value-expanded" : "exhibit-facet-value-collapsed"),
                            title:      "Toggle group",
                            field:      "groupControlDiv",
                            children: [
                                {   elmt:       createImage("images/expand.png"),
                                    className:  "exhibit-facet-value-expandControl"
                                },
                                {   elmt:       createImage("images/collapse.png"),
                                    className:  "exhibit-facet-value-collapseControl"
                                },
                                " "
                            ]
                        },
                        value.label 
                    ]
                }
            ]
        };
        
        var valueDom = SimileAjax.DOM.createDOMFromTemplate(document, valueTemplate);
        valueDom.value = value.value;
        valueDom.selected = value.selected;
        valueDom.level = level;
        valueDom.expanded = expanded;
        containerDiv.appendChild(valueDom.elmt);
        
        valueDom.innerDiv.style.marginLeft = ((level + (hasChildren ? 1 : 0)) * 16) + "px";
        
        var onValueCheckboxClick = function(elmt, evt, target) {
            listFacet._filter(valueDom);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        };
        SimileAjax.WindowManager.registerEvent(valueDom.elmt, "click", onValueCheckboxClick);

        var onGroupControlDivClick = function(elmt, evt, target) {
            listFacet._toggleGroup(valueDom);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        };
        SimileAjax.WindowManager.registerEvent(valueDom.groupControlDiv, "click", onGroupControlDivClick);

        if (level == 0) {
            listFacet._topValueDoms.push(valueDom);
        }
        if (value.children.length > 0) {
            var childrenDiv = document.createElement("div");
            childrenDiv.className = "exhibit-facet-value-children";
            if (!expanded) {
                childrenDiv.style.display = "none";
            }
            constructValues(value.children, childrenDiv, level + 1);
            containerDiv.appendChild(childrenDiv);
            
            valueDom.childrenDiv = childrenDiv;
        }
    };
    var constructValues = function(values, containerDiv, level) {
        for (var j = 0; j < values.length; j++) {
            constructValue(values[j], containerDiv, level);
        }
    };
    constructValues(facet.values, this._dom.valuesDiv, 0);
    
    this._groupLevelCount = facet.groupLevelCount;
    if (facet.selectedCount > 0) {
        this._dom.innerFacetDiv.className = "exhibit-facet exhibit-facet-hasSelection";
    } else {
        this._dom.innerFacetDiv.className = "exhibit-facet";
    }
    this._dom.clearSelectionsDiv.firstChild.nodeValue = facet.selectedCount;
};

Exhibit.ListFacet.prototype._filter = function(valueDom) {
    var property = this._property;
    var forward = this._forward;
    var level = this._groupLevelCount - valueDom.level - 1;
    var value = valueDom.value;
    var selected = !valueDom.selected;
    var browseEngine = this._exhibit.getBrowseEngine();
    
    SimileAjax.History.addAction({
        perform: function() {
            browseEngine.setValueRestriction(
                property, forward, level, value, selected
            );
        },
        undo: function() {
            browseEngine.setValueRestriction(
                property, forward, level, value, !selected
            );
        },
        label: selected ? 
            ("set " + this._facetLabel + " = " + value) :
            ("unset " + this._facetLabel + " = " + value),
        uiLayer: SimileAjax.WindowManager.getBaseLayer()
    });
};

Exhibit.ListFacet.prototype._slide = function() {
};

Exhibit.ListFacet.prototype._clearSelections = function() {
    var state = {};
    var property = this._property;
    var forward = this._forward;
    var browseEngine = this._exhibit.getBrowseEngine();
    SimileAjax.History.addAction({
        perform: function() {
            state.restrictions = browseEngine.clearFacetRestrictions(property, forward);
        },
        undo: function() {
            browseEngine.applyFacetRestrictions(property, forward, state.restrictions);
        },
        label: "clear selections",
        uiLayer: SimileAjax.WindowManager.getBaseLayer()
    });
};

Exhibit.ListFacet.prototype._openGroupingUI = function() {
    if (this._groupingDom != null) {
        return;
    }
    
    var coords = SimileAjax.DOM.getPageCoordinates(this._dom.elmt);
    var align = coords.left < (document.body.scrollWidth / 2) ?
        "exhibit-facet-groupBox-right" : "exhibit-facet-groupBox-left";
    
    var listFacet = this;
    var onUngroupLinkClick = function(elmt, evt, target) {
        listFacet._ungroupAll();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var onCloseLinkClick = function(elmt, evt, target) {
        listFacet._closeGroupingUI();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    var groupingBoxTemplate = {
        tag:        "div",
        className:  "exhibit-facet-groupBox " + align,  
        children: [
            {   tag:    "div",
                field:  "groupsDiv"
            },
            {   tag:        "div",
                className:  "exhibit-facet-groupBox-footer",
                field:      "footerDiv",
                children: [
                    {   elmt:  this._exhibit.makeActionLink("un-group all", onUngroupLinkClick),
                        field: "ungroupLink"
                    },
                    " | ",
                    {   elmt:  this._exhibit.makeActionLink("close", onCloseLinkClick),
                        field: "closeLink"
                    }
                ]
            }
        ]
    };
    this._groupingDom = SimileAjax.DOM.createDOMFromTemplate(document, groupingBoxTemplate);
    this._reconstructGroupingBox();
    
    this._dom.elmt.appendChild(this._groupingDom.elmt);
}

Exhibit.ListFacet.prototype._closeGroupingUI = function() {
    if (this._groupingDom != null) {
        this._groupingDom.elmt.parentNode.removeChild(this._groupingDom.elmt);
        this._groupingDom = null;
    }
}

Exhibit.ListFacet.prototype._reconstructGroupingBox = function() {
    var listFacet = this;
    this._groupingDom.groupsDiv.innerHTML = "";
    
    var makeGroup = function(group, level) {
        var groupingOptions = group.groupingOptions;
        
        var onUngroupLinkClick = function(elmt, evt, target) {
            listFacet._ungroup(groupDom);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        };
        var groupTemplate = {
            tag:        "div",
            className:  "exhibit-facet-groupBox-group",
            children: [
                {   tag:        "div",
                    className:  "exhibit-facet-groupBox-groupHeader",
                    children:   [ 
                        i == 0 ? "Group by " : "Group the groups by ",
                        {   elmt:   listFacet._exhibit.makeActionLink("(un-group)", onUngroupLinkClick),
                            style:  { display: group.grouped ? "inline" : "none" },
                            field:  "ungroupLink"
                        }
                    ]
                },
                {   tag:        "div",
                    className:  "exhibit-facet-groupBox-groupBody",
                    field:      "bodyDiv"
                }
            ]
        };
        var groupDom = SimileAjax.DOM.createDOMFromTemplate(document, groupTemplate);
        groupDom.level = level;
        listFacet._groupingDom.groupsDiv.appendChild(groupDom.elmt);
        
        var makeGroupOption = function(groupingOption) {
            var optionTemplate = {
                tag:        "div",
                className:  "exhibit-facet-groupBox-groupOption",
                children: [
                    {   elmt: SimileAjax.Graphics.createTranslucentImage(
                            document, 
                            Exhibit.urlPrefix + (groupingOption.selected ? "images/option-check.png" : "images/option.png")
                        )
                    },
                    " " + groupingOption.label
                ]
            };
            var optionDom = SimileAjax.DOM.createDOMFromTemplate(document, optionTemplate);
            optionDom.property = groupingOption.property;
            optionDom.forward = groupingOption.forward;
            optionDom.selected = groupingOption.selected;
            
            SimileAjax.WindowManager.registerEvent(optionDom.elmt, "click", 
                function(elmt, evt, target) { 
                    listFacet._group(groupDom, optionDom); 
                    SimileAjax.DOM.cancelEvent(evt);
                    return false;
                }
            );
            groupDom.bodyDiv.appendChild(optionDom.elmt);
        };
        
        for (var j = 0; j < groupingOptions.length; j++) {
            makeGroupOption(groupingOptions[j]);
        }
    };
    
    var groups = this._exhibit.getBrowseEngine().getGroups(this._property, this._forward);
    for (var i = 0; i < groups.length; i++) {
        makeGroup(groups[i], i);
    }
}

Exhibit.ListFacet.prototype._group = function(groupDom, optionDom) {
    var groupingProperty = optionDom.property;
    var groupingForward = optionDom.forward;
    var level = groupDom.level

    this._exhibit.getBrowseEngine().group(this._property, this._forward, level, groupingProperty, groupingForward);
    this._reconstructGroupingBox();
    
    var facet = this._exhibit.getBrowseEngine().getFacet(this._property, this._forward);
    if (facet != null) {
        this.update(facet);
    }
}

Exhibit.ListFacet.prototype._ungroup = function(groupDom) {
    this._exhibit.getBrowseEngine().ungroup(this._property, this._forward, groupDom.level);
    this._reconstructGroupingBox();
    
    var facet = this._exhibit.getBrowseEngine().getFacet(this._property, this._forward);
    if (facet != null) {
        this.update(facet);
    }
}

Exhibit.ListFacet.prototype._ungroupAll = function() {
    this._exhibit.getBrowseEngine().ungroup(this._property, this._forward, 0);
    this._reconstructGroupingBox();
    
    var facet = this._exhibit.getBrowseEngine().getFacet(this._property, this._forward);
    if (facet != null) {
        this.update(facet);
    }
}

Exhibit.ListFacet.prototype._toggleGroup = function(valueDom) {
    this._changeGroup(valueDom, !valueDom.expanded);
}

Exhibit.ListFacet.prototype._changeGroup = function(valueDom, expanded) {
    valueDom.expanded = expanded;
    valueDom.childrenDiv.style.display = expanded ? "block" : "none";
    valueDom.groupControlDiv.className =
        "exhibit-facet-value-groupControl " +
        (expanded ? "exhibit-facet-value-expanded" : "exhibit-facet-value-collapsed");
}

Exhibit.ListFacet.prototype._collapseGroups = function() {
    for (var i = 0; i < this._topValueDoms.length; i++) {
        this._changeGroup(this._topValueDoms[i], false);
    }
}

Exhibit.ListFacet.prototype._expandGroups = function(valueDom) {
    for (var i = 0; i < this._topValueDoms.length; i++) {
        this._changeGroup(this._topValueDoms[i], true);
    }
}

