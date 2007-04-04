/*==================================================
 *  Exhibit.OrderedViewFrame English localization
 *==================================================
 */
 
Exhibit.OrderedViewFrame.l10n = {
    removeOrderLabel: "Remove this order",
    
    sortingControlsTemplate:
        "sorted by: <span id='ordersSpan'></span>; <a id='thenSortByAction' href='javascript:void' class='exhibit-action' title='Further sort the items'>then by...</a>",
        
    formatSortActionTitle: function(propertyLabel, sortLabel) {
        return "Sorted by " + propertyLabel + " (" + sortLabel + ")";
    },
    formatRemoveOrderActionTitle: function(propertyLabel, sortLabel) {
        return "Removed order by " + propertyLabel + " (" + sortLabel + ")";
    },
    
    groupedAsSortedOptionLabel: "grouped as sorted",
    groupAsSortedActionTitle:   "group as sorted",
    ungroupAsSortedActionTitle: "ungroup as sorted",
    
    showAllActionTitle: "show all results",
    dontShowAllActionTitle: "show first few results",
    formatDontShowAll: function(limitCount) {
        return "Show only the first " + limitCount + " results";
    },
    formatShowAll: function(count) {
        return "Show all " + count + " results";
    }
};