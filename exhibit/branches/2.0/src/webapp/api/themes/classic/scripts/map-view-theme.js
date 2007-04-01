/*==================================================
 *  Exhibit.MapView classic theme
 *==================================================
 */
 
Exhibit.MapView.theme = new Object();

Exhibit.MapView.theme.constructDom = function(div, uiContext) {
    var l10n = Exhibit.MapView.l10n;
    var template = {
        elmt:       div,
        children: [
            {   tag:        "div",
                className:  "exhibit-collectionView-header",
                children: [
                    {   tag:    "div",
                        field:  "collectionSummaryDiv"
                    },
                    {   tag:        "div",
                        className:  "exhibit-mapView-mappableDetails",
                        field:      "mappableDiv"
                    }
                ]
            },
            {   tag:        "div",
                className:  "exhibit-mapView-mapContainer",
                field:      "mapContainer"
            },
            {   tag: "div",
                className:  "exhibit-mapView-legend",
                field: "legendDiv"
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
    var resizableDivWidget = Exhibit.ResizableDivWidget.create(
        { onResize: function() {dom.map.checkResize();} }, 
        dom.mapContainer, 
        uiContext
    );
    dom.mapDiv = resizableDivWidget.getContentDiv();
    dom.mapDiv.className = "exhibit-mapView-map"
    
    dom.setMappableCounts = function(resultsCount, mappableCount) {
        if (mappableCount != resultsCount) {
            dom.mappableDiv.style.display = "block";
            dom.mappableDiv.innerHTML = l10n.formatMappableCount(mappableCount);
        } else {
            dom.mappableDiv.style.display = "none";
        }
    };
    dom.getMapDiv = function() {
        return dom.mapDiv;
    };
    dom.clearLegend = function() {
        dom.legendDiv.innerHTML = "<table cellspacing='10'><tr valign='top'></tr></table>";
    };
    dom.addLegendBlock = function(blockDom) {
        var tr = dom.legendDiv.firstChild.rows[0];
        var td = tr.insertCell(tr.cells.length);
        td.appendChild(blockDom.elmt);
    };

    return dom;
};

Exhibit.MapView.theme.constructLegendBlockDom = function(
    title,
    icons,
    labels
) {
    var l10n = Exhibit.MapView.l10n;
    var template = {
        tag:        "div",
        className:  "exhibit-mapView-legendBlock",
        children: [
            {   tag:        "div",
                className:  "exhibit-mapView-legendBlock-title",
                children:   [ title ]
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
    for (var i = 0; i < icons.length; i++) {
        var div = document.createElement("div");
        div.className = "exhibit-mapView-legendBlock-entry";
        div.appendChild(SimileAjax.Graphics.createTranslucentImage(icons[i]));
        div.appendChild(document.createTextNode(" " + labels[i]));
        dom.elmt.appendChild(div);
    }
    return dom;
}