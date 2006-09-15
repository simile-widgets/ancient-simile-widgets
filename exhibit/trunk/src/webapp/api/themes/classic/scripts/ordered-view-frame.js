/*==================================================
 *  Exhibit.OrderedViewFrame classic theme
 *==================================================
 */
 
Exhibit.OrderedViewFrame.theme = new Object();

Exhibit.OrderedViewFrame.theme.createHeaderDom = function(
    exhibit, 
    headerDiv,
    onClearFilters
) {
    var l10n = Exhibit.OrderedViewFrame.l10n;
    var headerTemplate = {
        elmt:       headerDiv,
        className:  "exhibit-collectionView-header",
        children: [
            {   tag:    "div",
                field:  "noResultDiv",
                style:  { display: "none" },
                children: l10n.createNoResultsTemplate(
                    "exhibit-collectionView-header-count",
                    "exhibit-collectionView-header-types",
                    "exhibit-collectionView-header-details"
                )
            },
            {   tag:    "div",
                field:  "resultsDiv",
                style:  { display: "none" },
                children: l10n.createResultsTemplate(
                    "exhibit-collectionView-header-count",
                    "exhibit-collectionView-header-types",
                    "exhibit-collectionView-header-details",
                    exhibit.makeActionLink(l10n.resetFiltersLabel, onClearFilters)
                )
            }
        ]
    };
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, headerTemplate);
    dom.setCounts = function(resultsCount, originalCount) {
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
        
        dom.itemCountSpan.innerHTML = resultsCount;
        dom.originalCountSpan.innerHTML = originalCount;
    };
    dom.setTypes = function(typeLabels) {
        var typeLabel = (typeLabels.length > 0 && typeLabels.length <= 3) ?
            Exhibit.l10n.composeListString(typeLabels) :
            Exhibit.Database.l10n.itemType.pluralLabel;
            
        dom.typesSpan.innerHTML = typeLabel;
    };
    
    return dom;
};
