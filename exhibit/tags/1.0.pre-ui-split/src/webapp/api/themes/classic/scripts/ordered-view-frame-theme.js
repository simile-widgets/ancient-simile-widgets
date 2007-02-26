/*==================================================
 *  Exhibit.OrderedViewFrame classic theme
 *==================================================
 */
 
Exhibit.OrderedViewFrame.theme = new Object();

Exhibit.OrderedViewFrame.theme.createHeaderDom = function(
    exhibit, 
    headerDiv,
    onClearFilters,
    onThenSortBy,
    onGroupToggle,
    onShowDuplicatesToggle
) {
    var l10n = Exhibit.OrderedViewFrame.l10n;
    var headerTemplate = {
        elmt:       headerDiv,
        className:  "exhibit-collectionView-header",
        children: [
            {   tag:    "div",
                field:  "noResultDiv",
                style:  { display: "none" },
                children: Exhibit.ViewPanel.l10n.createNoResultsTemplate(
                    "exhibit-collectionView-header-count",
                    "exhibit-collectionView-header-types",
                    "exhibit-collectionView-header-details"
                )
            },
            {   tag:    "div",
                field:  "resultsDiv",
                style:  { display: "none" },
                children: [
                    {   elmt:   exhibit.makeCopyButton(null),
                        style:  { "float": "right" }
                    },
                    {   tag:    "div",
                        children: Exhibit.ViewPanel.l10n.createResultsSummaryTemplate(
                            "exhibit-collectionView-header-count",
                            "exhibit-collectionView-header-types",
                            "exhibit-collectionView-header-details",
                            exhibit.makeActionLink(
                                Exhibit.ViewPanel.l10n.resetFiltersLabel, 
                                onClearFilters
                            )
                        )
                    },
                    {   tag:        "div",
                        field:      "sortControlsDiv",
                        className:  "exhibit-collectionView-header-sortControls",
                        children: l10n.createSortingControlsTemplate(
                            exhibit.makeActionLink(l10n.thenSortByLabel, onThenSortBy)
                        ).concat([
                            " \u2022 ",
                            {   tag:    "span",
                                field:  "groupSpan",
                                className: "exhibit-collectionView-header-groupControls",
                                children: [
                                    {   elmt:       Exhibit.Theme.createTranslucentImage(document, "images/option.png"),
                                        field:      "groupOption",
                                        style: {  display: "none" }
                                    },
                                    {   elmt:       Exhibit.Theme.createTranslucentImage(document, "images/option-check.png"),
                                        field:      "groupOptionChecked",
                                        style: {  display: "none" }
                                    },
                                    " ",
                                    l10n.groupedAsSorted
                                ]
                            },
                            " \u2022 ",
                            {   tag:    "span",
                                field:  "duplicateSpan",
                                className: "exhibit-collectionView-header-duplicateControls",
                                children: [
                                    {   elmt:       Exhibit.Theme.createTranslucentImage(document, "images/option.png"),
                                        field:      "duplicateOption",
                                        style: {  display: "none" }
                                    },
                                    {   elmt:       Exhibit.Theme.createTranslucentImage(document, "images/option-check.png"),
                                        field:      "duplicateOptionChecked",
                                        style: {  display: "none" }
                                    },
                                    " ",
                                    l10n.showDuplicates
                                ]
                            }
                        ])
                    }
                ]
            }
        ]
    };
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, headerTemplate);
    SimileAjax.WindowManager.registerEvent(dom.groupSpan, "click", onGroupToggle);
    SimileAjax.WindowManager.registerEvent(dom.duplicateSpan, "click", onShowDuplicatesToggle);
    
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
        
        dom.sortControlsDiv.style.display = (resultsCount == 0) ? "none" : "block";
    };
    dom.setTypes = function(typeLabels) {
        var typeLabel = (typeLabels.length > 0 && typeLabels.length <= 3) ?
            Exhibit.l10n.composeListString(typeLabels) :
            Exhibit.Database.l10n.itemType.pluralLabel;
            
        dom.typesSpan.innerHTML = typeLabel;
    };
    dom.setOrders = function(orderDoms) {
        dom.ordersSpan.innerHTML = "";
        
        var addDelimiter = Exhibit.l10n.createListDelimiter(dom.ordersSpan, orderDoms.length);
        for (var i = 0; i < orderDoms.length; i++) {
            addDelimiter();
            dom.ordersSpan.appendChild(orderDoms[i].elmt);
        }
        addDelimiter();
    };
    dom.setGrouped = function(grouped) {
        dom.groupOption.style.display = grouped ? "none" : "inline";
        dom.groupOptionChecked.style.display = grouped ? "inline" : "none";
    };
    dom.setShowDuplicates = function(show) {
        dom.duplicateOption.style.display = show ? "none" : "inline";
        dom.duplicateOptionChecked.style.display = show ? "inline" : "none";
    };
    dom.enableThenByAction = function(enabled) {
        exhibit.enableActionLink(dom.thenByLink, enabled);
    };
    
    return dom;
};

Exhibit.OrderedViewFrame.theme.createOrderDom = function(
    exhibit, 
    label,
    onPopup
) {
    var a = exhibit.makeActionLink(label, onPopup);
    //a.appendChild(Exhibit.Theme.createTranslucentImage(document, "images/down-arrow.png"));
    
    return { elmt: a };
}

Exhibit.OrderedViewFrame.theme.createFooterDom = function(
    exhibit, 
    footerDiv,
    onShowAll,
    onDontShowAll
) {
    var l10n = Exhibit.OrderedViewFrame.l10n;
    var footerTemplate = {
        elmt:       footerDiv,
        className:  "exhibit-collectionView-footer screen",
        children:   []
    };
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, footerTemplate);
    dom.setCounts = function(count, limitCount, showAll, canToggle) {
        dom.elmt.innerHTML = "";
        if (canToggle && count > limitCount) {
            if (showAll) {
                dom.elmt.appendChild(
                    exhibit.makeActionLink(
                        l10n.formatDontShowAll(limitCount), onDontShowAll));
            } else {
                dom.elmt.appendChild(
                    exhibit.makeActionLink(
                        l10n.formatShowAll(count), onShowAll));
            }
        }
    };
    
    return dom;
}