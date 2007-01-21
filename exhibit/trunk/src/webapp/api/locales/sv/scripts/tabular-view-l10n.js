/*==================================================
 *  Exhibit.TabularView Swedish localization
 *==================================================
 */

Exhibit.TabularView.l10n = {
    viewLabel:          "Tabell",
    viewTooltip:        "Visa i tabell",
    resetActionTitle:   "Återst\xE4ll",

    columnHeaderSortTooltip:    "Klicka f\xD6r att sortera efter den h\xE4r kolumnen",
    columnHeaderReSortTooltip:  "Klicka f\xD6r att v\xE4lja omv\xE4nd ordning",
    makeSortActionTitle: function(label, ascending) {
        return "sortera efter " + (ascending ? "stigande " : "fallande ") +
            label;
    }
};
