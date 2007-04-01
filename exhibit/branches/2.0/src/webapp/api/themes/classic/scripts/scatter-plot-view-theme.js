/*==================================================
 *  Exhibit.ScatterPlotView classic theme
 *==================================================
 */
 
Exhibit.ScatterPlotView.theme = new Object();

Exhibit.ScatterPlotView.theme.constructDom = function(div, onResize, uiContext) {
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
                field:      "plotOuterContainer"
            },
            {   tag: "div",
                field: "legendDiv"
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
    
    dom.resizableDivWidget = Exhibit.ResizableDivWidget.create(
        { onResize: onResize }, 
        dom.plotOuterContainer, 
        uiContext
    );
    dom.plotContainer = dom.resizableDivWidget.getContentDiv();
    dom.plotContainer.className = "exhibit-scatterPlotView-plotContainer";
    
    dom.legendWidget = Exhibit.LegendWidget.create(
        {}, 
        dom.legendDiv, 
        uiContext
    );
    
    dom.setPlottableCounts = function(resultsCount, plottableCount) {
        if (plottableCount != resultsCount) {
            dom.plottableDiv.style.display = "block";
            dom.plottableDiv.innerHTML = l10n.formatMappableCount(plottableCount);
        } else {
            dom.plottableDiv.style.display = "none";
        }
    };
    return dom;
};

Exhibit.ScatterPlotView.theme.constructLegendBlockDom = function(
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
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
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