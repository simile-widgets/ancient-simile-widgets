/*==================================================
 *  Exhibit.TabularView Swedish localization
 *==================================================
 */

Exhibit.TabularView.l10n = {
    viewLabel:          "Tabell",
    viewTooltip:        "Visa i tabell",
    resetActionTitle:   "Återställ",

    columnHeaderSortTooltip:    "Klicka för att sortera efter den här kolumnen",
    columnHeaderReSortTooltip:  "Klicka för att välja omvänd ordning",
    makeSortActionTitle: function(label, ascending) {
        return "sortera efter " + (ascending ? "stigande " : "fallande ") +
            label;
    }
};
