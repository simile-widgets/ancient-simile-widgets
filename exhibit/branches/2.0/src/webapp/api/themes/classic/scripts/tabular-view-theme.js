/*==================================================
 *  Exhibit.TabularView classic theme
 *==================================================
 */
 
Exhibit.TabularView.theme = new Object();

Exhibit.TabularView.theme.createDom = function(exhibit, div) {
    var l10n = Exhibit.TabularView.l10n;
    var headerTemplate = {
        elmt:       div,
        className:  "exhibit-collectionView-header",
        children: [
            {   tag:    "div",
                field:  "collectionSummaryDiv"
            },
            {   tag:    "div",
                field:  "bodyDiv"
            }
        ]
    };
    return SimileAjax.DOM.createDOMFromTemplate(document, headerTemplate);
};

Exhibit.TabularView.theme.createColumnHeader = function(
    exhibit, 
    th,
    label,
    sort,
    sortAscending,
    sortFunction
) {
    var l10n = Exhibit.TabularView.l10n;
    var template = {
        elmt:       th,
        className:  sort ? 
                    "exhibit-tabularView-columnHeader-sorted" : 
                    "exhibit-tabularView-columnHeader",
        title: sort ? l10n.columnHeaderReSortTooltip : l10n.columnHeaderSortTooltip,
        children: [ label ]
    };
    if (sort) {
        template.children.push({
            elmt: Exhibit.Theme.createTranslucentImage(document, 
                sortAscending ? "images/up-arrow.png" : "images/down-arrow.png")
        });
    }
    SimileAjax.WindowManager.registerEvent(th, "click", sortFunction, null);
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    return dom;
};