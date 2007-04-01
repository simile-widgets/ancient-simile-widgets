/*==================================================
 *  Exhibit.PivotTableView classic theme
 *==================================================
 */
 
Exhibit.PivotTableView.theme = new Object();

Exhibit.PivotTableView.theme.constructDom = function(div) {
    var l10n = Exhibit.PivotTableView.l10n;
    var template = {
        elmt: div,
        children: [
            {   tag:        "div",
                className:  "exhibit-collectionView-header",
                field:      "collectionSummaryDiv"
            },
            {   tag:        "div",
                field:      "tableContainer",
                className:  "exhibit-pivotTableView-tableContainer"
            }
        ]
    };
    
    return SimileAjax.DOM.createDOMFromTemplate(document, template);
};
