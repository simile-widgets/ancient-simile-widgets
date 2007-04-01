/*==================================================
 *  Exhibit.TimelineView classic theme
 *==================================================
 */
 
Exhibit.TimelineView.theme = new Object();

Exhibit.TimelineView.theme.markers = [
    {   color:      "FF9000",
        textColor:  "000000"
    },
    {   color:      "5D7CBA",
        textColor:  "000000"
    },
    {   color:      "A97838",
        textColor:  "000000"
    },
    {   color:      "8B9BBA",
        textColor:  "000000"
    },
    {   color:      "BF955F",
        textColor:  "000000"
    },
    {   color:      "003EBA",
        textColor:  "FFFFFF"
    },
    {   color:      "29447B",
        textColor:  "FFFFFF"
    },
    {   color:      "543C1C",
        textColor:  "FFFFFF"
    }
];

Exhibit.TimelineView.theme.constructDom = function(div, uiContext) {
    var l10n = Exhibit.TimelineView.l10n;
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
                        className:  "exhibit-timelineView-plottableDetails",
                        field:      "plottableDiv"
                    }
                ]
            },
            {   tag:        "div",
                className:  "exhibit-timelineView-timelineContainer",
                field:      "timelineContainer"
            },
            {   tag:        "div",
                className:  "exhibit-timelineView-legend",
                field:      "legendDiv"
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
    var resizableDivWidget = Exhibit.ResizableDivWidget.create(
        { onResize: function() {dom.timeline.layout();} }, 
        dom.timelineContainer, 
        uiContext
    );
    dom.timelineDiv = resizableDivWidget.getContentDiv();
    dom.timelineDiv.className = "exhibit-timelineView-timeline";
    
    dom.setPlottableCounts = function(resultsCount, plottableCount, originalCount) {
        if (plottableCount != resultsCount) {
            dom.plottableDiv.style.display = "block";
            dom.plottableDiv.innerHTML = l10n.formatMappableCount(plottableCount);
        } else {
            dom.plottableDiv.style.display = "none";
        }
    };
    dom.getTimelineDiv = function() {
        return dom.timelineDiv;
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

Exhibit.TimelineView.theme.constructLegendBlockDom = function(
    title,
    colors,
    labels
) {
    var l10n = Exhibit.TimelineView.l10n;
    var template = {
        tag:        "div",
        className:  "exhibit-timelineView-legendBlock",
        children: [
            {   tag:        "div",
                className:  "exhibit-timelineView-legendBlock-title",
                children:   [ title ]
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
    for (var i = 0; i < colors.length; i++) {
        var div = document.createElement("div");
        div.className = "exhibit-timelineView-legendBlock-entry";
        div.style.color = colors[i];
        
        var span = document.createElement("span");
        span.className = "exhibit-timelineView-legendBlock-swatch";
        span.style.background = colors[i];
        span.innerHTML = "&nbsp;";
        
        div.appendChild(span);
        div.appendChild(document.createTextNode(" " + labels[i]));
        dom.elmt.appendChild(div);
    }
    return dom;
}