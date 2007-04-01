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
                field:      "legendDiv"
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
    
    dom.resizableDivWidget = Exhibit.ResizableDivWidget.create(
        { onResize: function() {dom.timeline.layout();} }, 
        dom.timelineContainer, 
        uiContext
    );
    dom.timelineDiv = dom.resizableDivWidget.getContentDiv();
    dom.timelineDiv.className = "exhibit-timelineView-timeline";
    
    dom.legendWidget = Exhibit.LegendWidget.create(
        {}, 
        dom.legendDiv, 
        uiContext
    );
    
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

    return dom;
};
