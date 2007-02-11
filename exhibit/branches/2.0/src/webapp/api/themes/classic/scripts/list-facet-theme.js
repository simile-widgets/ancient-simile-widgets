/*==================================================
 *  Exhibit.ListFacet classic theme
 *==================================================
 */
 
Exhibit.ListFacet.theme = new Object();

Exhibit.ListFacet.theme.constructFacetFrame = function(
    exhibit,
    div,
    facetLabel,
    groupable,
    grouped,
    onGroup, 
    onCollapseAll, 
    onExpandAll, 
    onClearAllSelections
) {
    var l10n = Exhibit.ListFacet.l10n;
    
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
                                title:      l10n.clearSelectionsTooltip,
                                children:   [
                                    "",
                                    {   elmt: Exhibit.Theme.createTranslucentImage(document,
                                            "images/black-check-no-border.png")
                                    }
                                ]
                            },
                            {   tag:        "span",
                                className:  "exhibit-facet-header-title",
                                children:   [ facetLabel ]
                            },
                            {   tag:        "span",
                                className:  "exhibit-facet-header-details",
                                children:   []
                            }
                        ]
                    },
                    {   tag:        "div",
                        className:  "exhibit-facet-body-frame",
                        children: [
                            {   tag:        "div",
                                className:  "exhibit-facet-body",
                                field:      "valuesContainer"
                            }
                        ]
                    },
                    {   tag:        "div",
                        className:  "exhibit-facet-footer",
                        style:      { display: groupable ? "block" : "none" },
                        children: [
                            {   elmt:  exhibit.makeActionLink(l10n.groupByLink, onGroup),
                                field: "groupLink"
                            },
                            {   tag:    "span",
                                field:  "groupControlsSpan",
                                style:  { display: grouped ? "inline" : "none" },
                                children: [
                                    " | ",
                                    {   elmt:  exhibit.makeActionLink(l10n.collapseLink, onCollapseAll),
                                        field: "collapseLink"
                                    },
                                    " | ",
                                    {   elmt:  exhibit.makeActionLink(l10n.expandLink, onExpandAll),
                                        field: "expandLink"
                                    }
                                ]
                            }
                        ]
                    },
                    {   tag: "div",
                        className: "exhibit-facet-resizer",
                        field: "resizerDiv",
                        children: [
                            {   elmt: Exhibit.Theme.createTranslucentImage(document,
                                    "images/down-arrow.png")
                            }
                        ]
                    }
                ]
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    
    dom.setSelectionCount = function(count) {
        this.clearSelectionsDiv.firstChild.nodeValue = count;
        this.innerFacetDiv.className = count > 0 ? 
            "exhibit-facet exhibit-facet-hasSelection" : "exhibit-facet";
    };
    dom.setGroupControlsVisible = function(visible) {
        this.groupControlsSpan.style.display = visible ? "inline" : "none";
    };
    dom.open = function() {
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
    dom.close = function() {
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
    };
    
    SimileAjax.WindowManager.registerEvent(dom.clearSelectionsDiv, "click", onClearAllSelections);
    SimileAjax.WindowManager.registerForDragging(
        dom.resizerDiv,
        {   onDragStart: function() {
                this._height = dom.valuesContainer.offsetHeight;
            },
            onDragBy: function(diffX, diffY) {
                this._height += diffY;
                dom.valuesContainer.style.height = Math.max(50, this._height) + "px";
            },
            onDragEnd: function() {
            }
        }
    );
    
    return dom;
};

Exhibit.ListFacet.theme.constructFacetItem = function(
    exhibit,
    label, 
    count, 
    level, 
    selected, 
    hasChildren, 
    expanded,
    onSelect
) {
    var l10n = Exhibit.ListFacet.l10n;
    
    var classes = [ "exhibit-facet-value" ];
    if (selected) {
        classes.push("exhibit-facet-value-selected");
    }
    if (hasChildren) {
        classes.push("exhibit-facet-value-hasChildren");
    }
    
    var template = {
        tag:        "div",
        className:  classes.join(" "),
        title:      label,
        children: [
            {   tag:        "div",
                className:  "exhibit-facet-value-count",
                children:   [ 
                    count,
                    {   elmt:       Exhibit.Theme.createTranslucentImage(document, "images/gray-check-no-border.png"),
                        className:  "exhibit-facet-grayCheck"
                    },
                    {   elmt:       Exhibit.Theme.createTranslucentImage(document, "images/no-check-no-border.png"),
                        className:  "exhibit-facet-noCheck"
                    },
                    {   elmt:       Exhibit.Theme.createTranslucentImage(document, "images/black-check-no-border.png"),
                        className:  "exhibit-facet-blackCheck"
                    }
                ]
            },
        ]
    };
    if (hasChildren) {
        template.children.push(
            {   tag:        "div",
                className:  "exhibit-facet-value-inner",
                field:      "innerDiv",
                style:      { marginLeft: ((level + 1) * 16) + "px" },
                children:   [ 
                    {   tag:        "div",
                        className:  "exhibit-facet-value-groupControl " +
                            (expanded ? "exhibit-facet-value-expanded" : "exhibit-facet-value-collapsed"),
                        title:      l10n.toggleGroupTooltip,
                        field:      "groupControlDiv",
                        children: [
                            {   elmt:       Exhibit.Theme.createTranslucentImage(document, "images/expand.png"),
                                className:  "exhibit-facet-value-expandControl"
                            },
                            {   elmt:       Exhibit.Theme.createTranslucentImage(document, "images/collapse.png"),
                                className:  "exhibit-facet-value-collapseControl"
                            },
                            " "
                        ]
                    },
                    label 
                ]
            }
        );
    } else {
        template.children.push(
            {   tag:        "div",
                className:  "exhibit-facet-value-inner",
                field:      "innerDiv",
                style:      { marginLeft: (level * 16) + "px" },
                children:   [ 
                    label 
                ]
            }
        );
    }
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    dom.expanded = expanded;
    if (hasChildren) {
        dom.expandGroup = function() {
            this.groupControlDiv.className = "exhibit-facet-value-groupControl exhibit-facet-value-expanded";
            this.childrenContainer.style.display = "block";
            this.expanded = true;
        };
        dom.collapseGroup = function() {
            this.groupControlDiv.className = "exhibit-facet-value-groupControl exhibit-facet-value-collapsed";
            this.childrenContainer.style.display = "none";
            this.expanded = false;
        };
        dom.toggleGroup = function() {
            if (this.expanded) {
                this.collapseGroup();
            } else {
                this.expandGroup();
            }
        };
        
        SimileAjax.WindowManager.registerEvent(dom.groupControlDiv, "click", 
            function(elmt, evt, target) {
                dom.toggleGroup();
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            },
            SimileAjax.WindowManager.getBaseLayer()
        );
    }
    SimileAjax.WindowManager.registerEvent(dom.elmt, "click", onSelect, SimileAjax.WindowManager.getBaseLayer());
    
    return dom;
};

Exhibit.ListFacet.theme.constructFacetChildrenContainer = function(exhibit, expanded) {
    var elmt = document.createElement("div");
    elmt.className = "exhibit-facet-value-children";
    if (!expanded) {
        elmt.style.display = "none";
    }
    return elmt;
};

Exhibit.ListFacet.theme.constructGroupingBox = function(
    exhibit,
    alignLeft,
    onUngroupAll,
    onClose
) {
    var template = {
        tag:        "div",
        className:  "exhibit-facet-groupBox " + 
            (alignLeft ? "exhibit-facet-groupBox-left" : "exhibit-facet-groupBox-right"), 
        children: [
            {   tag:    "div",
                field:  "groupsDiv"
            },
            {   tag:        "div",
                className:  "exhibit-facet-groupBox-footer",
                field:      "footerDiv",
                children: [
                    {   elmt:  exhibit.makeActionLink(Exhibit.ListFacet.l10n.ungroupAllButton, onUngroupAll),
                        field: "ungroupLink"
                    },
                    " | ",
                    {   elmt:  exhibit.makeActionLink(Exhibit.ListFacet.l10n.closeButton, onClose),
                        field: "closeLink"
                    }
                ]
            }
        ]
    };
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    dom.appendGroup = function(groupDom) {
        dom.groupsDiv.appendChild(groupDom.elmt);
    };
    dom.clearGroups = function() {
        dom.groupsDiv.innerHTML = "";
    };
    return dom;
};

Exhibit.ListFacet.theme.constructGroup = function(exhibit, first, grouped, onUngroup) {
    var l10n = Exhibit.ListFacet.l10n;
    var template = {
        tag:        "div",
        className:  "exhibit-facet-groupBox-group",
        children: [
            {   tag:        "div",
                className:  "exhibit-facet-groupBox-groupHeader",
                children:   [ 
                    first ? l10n.groupByLabel : l10n.groupTheGroupsByLabel,
                    {   elmt:   exhibit.makeActionLink(Exhibit.ListFacet.l10n.ungroupLink, onUngroup),
                        style:  { display: grouped ? "inline" : "none" },
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
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    dom.appendOption = function(optionDom) {
        dom.bodyDiv.appendChild(optionDom.elmt);
    };
    return dom;
};

Exhibit.ListFacet.theme.constructGroupingOption = function(exhibit, label, selected, onSelect) {
    var template = {
        tag:        "div",
        className:  "exhibit-facet-groupBox-groupOption",
        children: [
            {   elmt: Exhibit.Theme.createTranslucentImage(document,
                    selected ? "images/option-check.png" : "images/option.png"
                )
            },
            " " + label
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    SimileAjax.WindowManager.registerEvent(dom.elmt, "click", onSelect);
    
    return dom;
};