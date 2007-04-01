/*==================================================
 *  Exhibit.ThumbnailView classic theme
 *==================================================
 */
 
Exhibit.ThumbnailView.theme = new Object();

Exhibit.ThumbnailView.theme.constructGroup = function(
    groupLevel,
    label
) {
    var l10n = Exhibit.ThumbnailView.l10n;
    var template = {
        tag: "div",
        className: "exhibit-thumbnailView-group",
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

Exhibit.ThumbnailView.theme.constructItemContainer = function() {
    var div = document.createElement("div");
    div.className = "exhibit-thumbnailView-body";
    return div;
};
    
