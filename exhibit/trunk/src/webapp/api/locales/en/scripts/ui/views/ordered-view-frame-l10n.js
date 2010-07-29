/*==================================================
 *  Exhibit.OrderedViewFrame English localization
 *==================================================
 */

if (!("l10n" in Exhibit.OrderedViewFrame)) {
    Exhibit.OrderedViewFrame.l10n = {};
}

Exhibit.OrderedViewFrame.l10n.removeOrderLabel = "Fjern denne sorteringsrekkefølgen";

Exhibit.OrderedViewFrame.l10n.sortingControlsTemplate =
    "sortert etter: <span id='ordersSpan'></span>; <a id='thenSortByAction' href='javascript:void' class='exhibit-action' title='Sorter deretter etter'>så etter...</a>";

Exhibit.OrderedViewFrame.l10n.formatSortActionTitle = function(propertyLabel, sortLabel) {
    return "Sorter etter " + propertyLabel + " (" + sortLabel + ")";
};
Exhibit.OrderedViewFrame.l10n.formatRemoveOrderActionTitle = function(propertyLabel, sortLabel) {
    return "Fjernet sorteringsrekkefølge " + propertyLabel + " (" + sortLabel + ")";
};

Exhibit.OrderedViewFrame.l10n.groupedAsSortedOptionLabel = "gruppert slik de er sortert";
Exhibit.OrderedViewFrame.l10n.groupAsSortedActionTitle = "grupper slik de er sortert";
Exhibit.OrderedViewFrame.l10n.ungroupAsSortedActionTitle = "avgruppert slik de er sortert";

Exhibit.OrderedViewFrame.l10n.showAllActionTitle = "vis alle treff";
Exhibit.OrderedViewFrame.l10n.dontShowAllActionTitle = "vis bare de første treff";
Exhibit.OrderedViewFrame.l10n.formatDontShowAll = function(limitCount) {
    return "Vis bare de første " + limitCount + " treffene";
};
Exhibit.OrderedViewFrame.l10n.formatShowAll = function(count) {
    return "Vis alle " + count + " treff";
};

Exhibit.OrderedViewFrame.l10n.pagingControlContainerElement = "div";
Exhibit.OrderedViewFrame.l10n.pagingControlElement = "span";
Exhibit.OrderedViewFrame.l10n.pageWindowEllipses = " ... ";
Exhibit.OrderedViewFrame.l10n.pageSeparator = " &bull; ";
Exhibit.OrderedViewFrame.l10n.previousPage = "&laquo;&nbsp;Forrige";
Exhibit.OrderedViewFrame.l10n.nextPage = "Neste&nbsp;&raquo;";
Exhibit.OrderedViewFrame.l10n.makePagingActionTitle = function(pageIndex) {
    return ("Side " + (pageIndex + 1));
};
Exhibit.OrderedViewFrame.l10n.makePagingLinkTooltip = function(pageIndex) {
    return ("Gå til side " + (pageIndex + 1));
};
