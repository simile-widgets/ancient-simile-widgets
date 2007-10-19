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
        { checkImage: Exhibit.UI.createTranslucentImage("images/black-check.png") }
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
    onSelectOnly,
    uiContext
) {
    if (Exhibit.params.safe) {
        label = Exhibit.Formatter.encodeAngleBrackets(label);
    }
    
    var dom = SimileAjax.DOM.createDOMFromString(
        "div",
        "<div class='exhibit-facet-value-count'>" + count + "</div>" +
        "<div class='exhibit-facet-value-inner' id='inner'>" + 
            (   "<div class='exhibit-facet-value-checkbox'>&nbsp;" +
                    SimileAjax.Graphics.createTranslucentImageHTML(
                        Exhibit.urlPrefix + 
                        (   facetHasSelection ?
                            (selected ? "images/black-check.png" : "images/no-check.png") :
                            "images/no-check-no-border.png"
                        )) +
                "</div>"
            ) +
        "</div>"
    );
    dom.elmt.className = selected ? "exhibit-facet-value exhibit-facet-value-selected" : "exhibit-facet-value";
    if (typeof label == "string") {
        dom.elmt.title = label;
        dom.inner.appendChild(document.createTextNode(label));
    } else {
        dom.inner.appendChild(label);
    }
    
    SimileAjax.WindowManager.registerEvent(dom.elmt, "click", onSelectOnly, SimileAjax.WindowManager.getBaseLayer());
    if (facetHasSelection) {
        SimileAjax.WindowManager.registerEvent(dom.inner.firstChild, "click", onSelect, SimileAjax.WindowManager.getBaseLayer());
    }
    return dom.elmt;
};

