/*==================================================
 *  Exhibit.TileView classic theme
 *==================================================
 */
 
Exhibit.TileView.theme = new Object();

Exhibit.TileView.theme.constructGroup = function(groupLevel, label) {
    var l10n = Exhibit.TileView.l10n;
    var template = {
        tag: "div",
        className: "exhibit-collectionView-group",
        children: [
            {   tag: "h" + (groupLevel + 1),
                children: [ 
                    label,
                    {   tag:        "span",
                        className:  "exhibit-collectionView-group-count",
                        children: [
                            " (",
                            {   tag: "span",
                                field: "countSpan"
                            },
                            ")"
                        ]
                    }
                ],
                field: "header"
            },
            {   tag: "div",
                className: "exhibit-collectionView-group-content",
                field: "contentDiv"
            }
        ]
    };
    return SimileAjax.DOM.createDOMFromTemplate(document, template);
};

Exhibit.TileView.theme.constructTable = function() {
    var table = document.createElement("table");
    table.className = "exhibit-tileView-body";
    return table;
};
    
