/*==================================================
 *  Exhibit.NumericRangeFacet classic theme
 *==================================================
 */
 
Exhibit.NumericRangeFacet.theme = new Object();

Exhibit.NumericRangeFacet.theme.constructFacetFrame = function(
    exhibit,
    div,
    facetLabel,
    onClearAllSelections,
    classNames
) {
    var className = "exhibit-facet-frame";
    if (classNames && classNames.frame) {
        className += " " + classNames.frame;
    }
   
    var l10n = Exhibit.NumericRangeFacet.l10n;
    var template = {
        elmt:       div,
        className:  className,
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
		var h = Math.max(50, this._height) + "px";
                dom.valuesContainer.style.height = h;
                dom.valuesContainer.style.maxHeight = h;
            },
            onDragEnd: function() {
            }
        }
    );
    
    return dom;
};

Exhibit.NumericRangeFacet.theme.constructFacetItem = function(
    exhibit,
    label, 
    count, 
    selected, 
    onSelect
) {
    var classes = [ "exhibit-facet-value" ];
    if (selected) {
        classes.push("exhibit-facet-value-selected");
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
            {   tag:        "div",
                className:  "exhibit-facet-value-inner",
                field:      "innerDiv",
                children:   [ label ]
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    SimileAjax.WindowManager.registerEvent(dom.elmt, "click", onSelect, SimileAjax.WindowManager.getBaseLayer());
    
    return dom;
};
