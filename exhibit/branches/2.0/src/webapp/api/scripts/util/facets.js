/*==================================================
 *  Exhibit.FacetUtilities
 *
 *  Utilities for facets' code.
 *==================================================
 */
Exhibit.FacetUtilities = new Object();

Exhibit.FacetUtilities.constructFacetFrame = function(div, facetLabel, onClearAllSelections) {
    div.className = "exhibit-facet";
    var dom = SimileAjax.DOM.createDOMFromString(
        document,
        div,
        "<div class='exhibit-facet-header'>" +
            "<div class='exhibit-facet-header-filterControl' id='clearSelectionsDiv' title='" + Exhibit.FacetUtilities.l10n.clearSelectionsTooltip + "'>" +
                "<span id='filterCountSpan'></span>" +
                "<img id='checkImage' />" +
            "</div>" +
            "<span class='exhibit-facet-header-title'>" + facetLabel + "</span>" +
        "</div>" +
        "<div class='exhibit-facet-body-frame'>" +
            "<div class='exhibit-facet-body' id='valuesContainer'></div>" +
        "</div>" +
        "<div class='exhibit-facet-resizer' id='resizerDiv'>" +
            "<img id='resizerImage' />" +
        "</div>",
        {   checkImage:     Exhibit.Theme.createTranslucentImage(document, "images/black-check-no-border.png"),
            resizerImage:   Exhibit.Theme.createTranslucentImage(document, "images/down-arrow.png")
        }
    );
    
    dom.setSelectionCount = function(count) {
        this.filterCountSpan.innerHTML = count;
        this.clearSelectionsDiv.style.display = count > 0 ? "block" : "none";
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

Exhibit.FacetUtilities.constructFacetItem = function(
    label, 
    count, 
    selected, 
    facetHasSelection,
    onSelect
) {
    var classes = [ "exhibit-facet-value" ];
    if (selected) {
        classes.push("exhibit-facet-value-selected");
    }
    
    var elmt = SimileAjax.DOM.createElementFromString(
        document,
        "<div class='exhibit-facet-value' title='" + label + "'>" +
            "<div class='exhibit-facet-value-count'>" +
                count +
                SimileAjax.Graphics.createTranslucentImageHTML(
                    Exhibit.Theme.urlPrefix + (selected ? 
                        "images/black-check-no-border.png" :
                        (facetHasSelection ? "images/no-check-no-border.png" : "images/gray-check-no-border.png")
                    )
                ) +
            "</div>" +
            "<div class='exhibit-facet-value-inner'>" + label + "</div>" +
        "</div>"
    );
    elmt.className = classes.join(" ");
    SimileAjax.WindowManager.registerEvent(elmt, "click", onSelect, SimileAjax.WindowManager.getBaseLayer());
    
    return elmt;
};

