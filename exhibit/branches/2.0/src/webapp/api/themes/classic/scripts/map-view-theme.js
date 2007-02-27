/*==================================================
 *  Exhibit.MapView classic theme
 *==================================================
 */
 
Exhibit.MapView.theme = new Object();

Exhibit.MapView.theme.constructDom = function(
    collection,
    exhibit,
    div,
    onClearFilters
) {
    var l10n = Exhibit.MapView.l10n;
    var template = {
        elmt:       div,
        children: [
            {   tag:        "div",
                className:  "exhibit-collectionView-header",
                children: [
                    {   tag:    "div",
                        field:  "noResultDiv",
                        style:  { display: "none" },
                        children: Exhibit.ViewPanel.l10n.createNoResultsTemplate(
                            "exhibit-collectionView-header-count",
                            "exhibit-collectionView-header-types",
                            "exhibit-collectionView-header-details"
                        )
                    },
                    {   tag:    "div",
                        field:  "resultsDiv",
                        style:  { display: "none" },
                        children: [
                            {   elmt:   Exhibit.ViewPanel.makeCopyAllButton(collection, exhibit.getDatabase()),
                                style:  { "float": "right" }
                            },
                            {   tag:    "div",
                                children: Exhibit.ViewPanel.l10n.createResultsSummaryTemplate(
                                    "exhibit-collectionView-header-count",
                                    "exhibit-collectionView-header-types",
                                    "exhibit-collectionView-header-details",
                                    Exhibit.UI.makeActionLink(
                                        Exhibit.ViewPanel.l10n.resetFiltersLabel, 
                                        onClearFilters
                                    )
                                )
                            },
                            {   tag:        "div",
                                className:  "exhibit-mapView-mappableDetails",
                                field:      "mappableDiv"
                            }
                        ]
                    }
                ]
            },
            {   tag:        "div",
                className:  "exhibit-mapView-mapContainer",
                children: [
                    {   tag:    "div",
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
    dom.setCounts = function(resultsCount, mappableCount, originalCount) {
        if (resultsCount == 0) {
            dom.noResultDiv.style.display = "block";
            dom.resultsDiv.style.display = "none";
        } else {
            dom.noResultDiv.style.display = "none";
            dom.resultsDiv.style.display = "block";
        }
        
        if (originalCount != resultsCount) {
            dom.noFilterDetailsSpan.style.display = "none";
            dom.filteredDetailsSpan.style.display = "inline";
        } else {
            dom.noFilterDetailsSpan.style.display = "inline";
            dom.filteredDetailsSpan.style.display = "none";
        }
        
        if (mappableCount != resultsCount) {
            dom.mappableDiv.style.display = "block";
            dom.mappableDiv.innerHTML = l10n.formatMappableCount(mappableCount);
        } else {
            dom.mappableDiv.style.display = "none";
        }
        
        dom.itemCountSpan.innerHTML = resultsCount;
        dom.originalCountSpan.innerHTML = originalCount;
    };
    dom.setTypes = function(typeLabels) {
        var typeLabel = (typeLabels.length > 0 && typeLabels.length <= 3) ?
            Exhibit.l10n.composeListString(typeLabels) :
            Exhibit.Database.l10n.itemType.pluralLabel;
            
        dom.typesSpan.innerHTML = typeLabel;
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