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

Exhibit.TimelineView.theme.constructDom = function(div, onRelayout) {
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
                children: [
                    {   tag:        "div",
                        className:  "exhibit-timelineView-timeline",
                        field:      "timelineDiv"
                    }
                ]
            },
            {   tag:        "div",
                className:  "exhibit-timelineView-resizer",
                field:      "resizerDiv",
                children: [
                    {   elmt: Exhibit.Theme.createTranslucentImage("images/down-arrow.png") }
                ]
            },
            {   tag:        "div",
                className:  "exhibit-timelineView-controls",
                children: [
                    {   tag:    "button",
                        field:  "relayoutButton",
                        children: [ l10n.relayoutButtonLabel ]
                    }
                ]
            },
            {   tag:        "div",
                className:  "exhibit-timelineView-legend",
                field:      "legendDiv"
            }
        ]
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
    SimileAjax.WindowManager.registerEvent(dom.relayoutButton, "click", onRelayout);

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
    
    SimileAjax.WindowManager.registerForDragging(
        dom.resizerDiv,
        {   onDragStart: function() {
                this._height = dom.timelineDiv.offsetHeight;
            },
            onDragBy: function(diffX, diffY) {
                this._height += diffY;
                dom.timelineDiv.style.height = Math.max(50, this._height) + "px";
            },
            onDragEnd: function() {
                dom.timeline.layout();
            }
        }
    );
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