/*==================================================
 *  Exhibit.ScatterPlotView classic theme
 *==================================================
 */
 
Exhibit.ScatterPlotView.theme = new Object();

Exhibit.ScatterPlotView.theme.constructDom = function(exhibit, div, onResized) {
    var l10n = Exhibit.ScatterPlotView.l10n;
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
                        className:  "exhibit-scatterPlotView-mappableDetails",
                        field:      "plottableDiv"
                    }
                ]
            },
            {   tag:        "div",
                field:      "plotContainer",
                className:  "exhibit-scatterPlotView-plotContainer"
            },
            {   tag: "div",
                className: "exhibit-scatterPlotView-resizer",
                field: "resizerDiv",
                children: [
                    {   elmt: Exhibit.Theme.createTranslucentImage(document,
                            "images/down-arrow.png")
                    }
                ]
            },
            {   tag: "div",
                className:  "exhibit-scatterPlotView-legend",
                field: "legendDiv"
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    dom.setPlottableCounts = function(resultsCount, plottableCount) {
        if (plottableCount != resultsCount) {
            dom.plottableDiv.style.display = "block";
            dom.plottableDiv.innerHTML = l10n.formatMappableCount(plottableCount);
        } else {
            dom.plottableDiv.style.display = "none";
        }
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
                this._height = dom.plotContainer.offsetHeight;
            },
            onDragBy: function(diffX, diffY) {
                this._height += diffY;
                dom.plotContainer.style.height = Math.max(50, this._height) + "px";
            },
            onDragEnd: function() {
                onResized();
            }
        }
    );
    return dom;
};

Exhibit.ScatterPlotView.theme.constructLegendBlockDom = function(
    exhibit,
    title,
    colors,
    labels
) {
    var l10n = Exhibit.ScatterPlotView.l10n;
    var template = {
        tag:        "div",
        className:  "exhibit-scatterPlotView-legendBlock",
        children: [
            {   tag:        "div",
                className:  "exhibit-scatterPlotView-legendBlock-title",
                children:   [ title ]
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    for (var i = 0; i < colors.length; i++) {
        var div = document.createElement("div");
        div.className = "exhibit-scatterPlotView-legendBlock-entry";
        
        var span = document.createElement("span");
        span.className = "exhibit-scatterPlotView-legendBlock-colorBlob";
        span.style.backgroundColor = colors[i];
        span.innerHTML = "&nbsp;";
        
        div.appendChild(span);
        div.appendChild(document.createTextNode(" " + labels[i]));
        
        dom.elmt.appendChild(div);
    }
    return dom;
}