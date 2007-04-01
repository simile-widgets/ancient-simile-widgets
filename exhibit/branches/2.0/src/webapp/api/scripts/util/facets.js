/*==================================================
 *  Exhibit.FacetUtilities
 *
 *  Utilities for facets' code.
 *==================================================
 */
Exhibit.FacetUtilities = new Object();

Exhibit.FacetUtilities.constructFacetFrame = function(div, facetLabel, onClearAllSelections, uiContext) {
    div.className = "exhibit-facet";
    var dom = SimileAjax.DOM.createDOMFromString(
        div,
        "<div class='exhibit-facet-header'>" +
            "<div class='exhibit-facet-header-filterControl' id='clearSelectionsDiv' title='" + Exhibit.FacetUtilities.l10n.clearSelectionsTooltip + "'>" +
                "<span id='filterCountSpan'></span>" +
                "<img id='checkImage' />" +
            "</div>" +
            "<span class='exhibit-facet-header-title'>" + facetLabel + "</span>" +
        "</div>" +
        "<div class='exhibit-facet-body-frame' id='frameDiv'></div>",
        { checkImage: Exhibit.Theme.createTranslucentImage("images/black-check-no-border.png") }
    );
    var resizableDivWidget = Exhibit.ResizableDivWidget.create({}, dom.frameDiv, uiContext);
    
    dom.valuesContainer = resizableDivWidget.getContentDiv();
    dom.valuesContainer.className = "exhibit-facet-body";
    
    dom.setSelectionCount = function(count) {
        this.filterCountSpan.innerHTML = count;
        this.clearSelectionsDiv.style.display = count > 0 ? "block" : "none";
    };
    SimileAjax.WindowManager.registerEvent(dom.clearSelectionsDiv, "click", onClearAllSelections);
    
    return dom;
};

Exhibit.FacetUtilities.constructFacetItem = function(
    label, 
    count, 
    selected, 
    facetHasSelection,
    onSelect,
    uiContext
) {
    var classes = [ "exhibit-facet-value" ];
    if (selected) {
        classes.push("exhibit-facet-value-selected");
    }
    
    var elmt = SimileAjax.DOM.createElementFromString(
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

