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
                field: "legendDiv"
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
    
    dom.resizableDivWidget = Exhibit.ResizableDivWidget.create(
        { onResize: function() {dom.map.checkResize();} }, 
        dom.mapContainer, 
        uiContext
    );
    dom.mapDiv = dom.resizableDivWidget.getContentDiv();
    dom.mapDiv.className = "exhibit-mapView-map";
    
    dom.legendWidget = Exhibit.LegendWidget.create(
        {   markerGenerator: function(color) {
                var shape = "square";
                return SimileAjax.Graphics.createTranslucentImage(
                    Exhibit.MapView._markerUrlPrefix + 
                    [   shape,
                        color,
                        [ "m", shape, color, "legend.png" ].join("-")
                    ].join("/")
                );
            }
        }, 
        dom.legendDiv, 
        uiContext
    );
    
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

    return dom;
};
