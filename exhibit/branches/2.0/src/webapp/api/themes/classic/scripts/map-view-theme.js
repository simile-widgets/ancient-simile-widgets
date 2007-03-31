/*==================================================
 *  Exhibit.MapView classic theme
 *==================================================
 */
 
Exhibit.MapView.theme = new Object();

Exhibit.MapView.theme.constructDom = function(exhibit, div) {
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
                children: [
                    {   tag:        "div",
                        className:  "exhibit-mapView-map",
                        field:      "mapDiv"
                    }
                ]
            },
            {   tag: "div",
                className: "exhibit-mapView-resizer",
                field: "resizerDiv",
                children: [
                    {   elmt: Exhibit.Theme.createTranslucentImage(document,
                            "images/down-arrow.png")
                    }
                ]
            },
            {   tag: "div",
                className:  "exhibit-mapView-legend",
                field: "legendDiv"
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
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
    
    SimileAjax.WindowManager.registerForDragging(
        dom.resizerDiv,
        {   onDragStart: function() {
                this._height = dom.mapDiv.offsetHeight;
            },
            onDragBy: function(diffX, diffY) {
                this._height += diffY;
                dom.mapDiv.style.height = Math.max(50, this._height) + "px";
            },
            onDragEnd: function() {
                dom.map.checkResize();
            }
        }
    );
    return dom;
};

Exhibit.MapView.theme.constructLegendBlockDom = function(
    exhibit,
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
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    for (var i = 0; i < icons.length; i++) {
        var div = document.createElement("div");
        div.className = "exhibit-mapView-legendBlock-entry";
        div.appendChild(SimileAjax.Graphics.createTranslucentImage(document, icons[i]));
        div.appendChild(document.createTextNode(" " + labels[i]));
        dom.elmt.appendChild(div);
    }
    return dom;
}