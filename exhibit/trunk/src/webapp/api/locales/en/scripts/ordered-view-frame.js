/*==================================================
 *  Exhibit.OrderedViewFrame English localization
 *==================================================
 */
 
Exhibit.OrderedViewFrame.l10n = {
    thenSortByLabel:    "then by...",
    removeOrderLabel:   "Remove this order",
    formatSortActionTitle: function(propertyLabel, sortLabel) {
        return "Sorted by " + propertyLabel + " (" + sortLabel + ")";
    },
    formatRemoveOrderActionTitle: function(propertyLabel, sortLabel) {
        return "Removed order by " + propertyLabel + " (" + sortLabel + ")";
    },
    formatDontShowAll: function(limitCount) {
        return "Show only the first " + limitCount + " results";
    },
    formatShowAll: function(count) {
        return "Show all " + count + " results";
    },
    createSortingControlsTemplate: function(
        thenSortByActionLink
    ) {
        return [
            "sorted by: ",
            {   tag:    "span",
                field:  "ordersSpan"
            },
            "; ",
            {   elmt:  thenSortByActionLink,
                title: "Further sort the items",
                field: "thenByLink"
            }
        ];
    }
};