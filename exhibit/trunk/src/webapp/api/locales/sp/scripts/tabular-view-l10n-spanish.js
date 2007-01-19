/*==================================================
 *  Exhibit.TabularView Spanish localization
 *==================================================
 */
 
Exhibit.TabularView.l10n = {
    viewLabel:          "Tabla",
    viewTooltip:        "Ver elementos como una tabla",
    resetActionTitle:   "Reset",
    
    columnHeaderSortTooltip:    "Click para ordenar por esta columna",
    columnHeaderReSortTooltip:  "Click para ordenar inversamente",
    makeSortActionTitle: function(label, ascending) {
        return (ascending ? "ordenado acendentemente por " : "ordenado descendentemente por ") + label;
    }
};
