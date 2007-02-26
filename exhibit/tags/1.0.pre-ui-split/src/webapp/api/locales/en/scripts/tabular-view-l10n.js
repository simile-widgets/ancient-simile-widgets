/*==================================================
 *  Exhibit.TabularView English localization
 *==================================================
 */
 
Exhibit.TabularView.l10n = {
    viewLabel:          "Table",
    viewTooltip:        "View items in a table",
    resetActionTitle:   "Reset",
    
    columnHeaderSortTooltip:    "Click to sort by this column",
    columnHeaderReSortTooltip:  "Click to sort in the reverse order",
    makeSortActionTitle: function(label, ascending) {
        return (ascending ? "sorted ascending by " : "sorted descending by ") + label;
    }
};
