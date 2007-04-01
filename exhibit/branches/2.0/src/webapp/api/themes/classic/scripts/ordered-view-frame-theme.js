/*==================================================
 *  Exhibit.OrderedViewFrame classic theme
 *==================================================
 */
 
Exhibit.OrderedViewFrame.theme = new Object();

Exhibit.OrderedViewFrame.theme.createHeaderDom = function(
    exhibit, 
    headerDiv,
    onThenSortBy,
    onGroupToggle,
    onShowDuplicatesToggle,
    generatedContentElmtRetriever
) {
    var l10n = Exhibit.OrderedViewFrame.l10n;
    var headerTemplate = {
        elmt:       headerDiv,
        className:  "exhibit-collectionView-header",
        children: [
            {   tag:    "div",
                field:  "collectionSummaryDiv"
            },
            {   tag:        "div",
                field:      "sortControlsDiv",
                className:  "exhibit-collectionView-header-sortControls",
                children: l10n.createSortingControlsTemplate(
                    Exhibit.UI.makeActionLink(l10n.thenSortByLabel, onThenSortBy)
                ).concat([
                    " \u2022 ",
                    {   tag:    "span",
                        field:  "groupSpan",
                        className: "exhibit-collectionView-header-groupControls",
                        children: [
                            {   elmt:       Exhibit.Theme.createTranslucentImage("images/option.png"),
                                field:      "groupOption",
                                style: {  display: "none" }
                            },
                            {   elmt:       Exhibit.Theme.createTranslucentImage("images/option-check.png"),
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
                            {   elmt:       Exhibit.Theme.createTranslucentImage("images/option.png"),
                                field:      "duplicateOption",
                                style: {  display: "none" }
                            },
                            {   elmt:       Exhibit.Theme.createTranslucentImage("images/option-check.png"),
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
    };
    var dom = SimileAjax.DOM.createDOMFromTemplate(headerTemplate);
    SimileAjax.WindowManager.registerEvent(dom.groupSpan, "click", onGroupToggle);
    SimileAjax.WindowManager.registerEvent(dom.duplicateSpan, "click", onShowDuplicatesToggle);
    
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
        Exhibit.UI.enableActionLink(dom.thenByLink, enabled);
    };
    
    return dom;
};

Exhibit.OrderedViewFrame.theme.createOrderDom = function(label, onPopup) {
    var a = Exhibit.UI.makeActionLink(label, onPopup);
    //a.appendChild(Exhibit.Theme.createTranslucentImage("images/down-arrow.png"));
    
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
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(footerTemplate);
    dom.setCounts = function(count, limitCount, showAll, canToggle) {
        dom.elmt.innerHTML = "";
        if (canToggle && count > limitCount) {
            if (showAll) {
                dom.elmt.appendChild(
                    Exhibit.UI.makeActionLink(
                        l10n.formatDontShowAll(limitCount), onDontShowAll));
            } else {
                dom.elmt.appendChild(
                    Exhibit.UI.makeActionLink(
                        l10n.formatShowAll(count), onShowAll));
            }
        }
    };
    
    return dom;
}