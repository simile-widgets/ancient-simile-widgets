/*==================================================
 *  Exhibit.OrderedViewFrame Swedish localization
 *==================================================
 */

Exhibit.OrderedViewFrame.l10n = {
    thenSortByLabel:    "och sedan efter...",
    removeOrderLabel:   "Ta bort det här sorteringskriteriet",
    formatSortActionTitle: function(propertyLabel, sortLabel) {
        return "Sorterat efter " + propertyLabel + " (" + sortLabel + ")";
    },
    formatRemoveOrderActionTitle: function(propertyLabel, sortLabel) {
        return "Ta bort sorteringskriteriet " + propertyLabel + " (" + sortLabel + ")";
    },
    resetActionTitle:   "Återställ",
    formatDontShowAll: function(limitCount) {
        return "Visa bara de första  " + limitCount + " resultaten";
    },
    formatShowAll: function(count) {
        return "Visa samtliga " + count + " result";
    },
    createSortingControlsTemplate: function(
        thenSortByActionLink
    ) {
        return [
            "sorterat efter: ",
            {   tag:    "span",
                field:  "ordersSpan"
            },
            {   tag:        "span",
                className:  "screen",
                children: [
                    "; ",
                    {   elmt:  thenSortByActionLink,
                        title: "sortera ytterligare",
                        field: "thenByLink"
                    }
                ]
            }
        ];
    },
    groupedAsSorted: "gruppera som de sorterats",
    groupAsSortedActionTitle: "grupperade som de sorterats",
    ungroupActionTitle: "ogrupperade",

    showDuplicates: "visa dubletter",
    showDuplicatesActionTitle: "visa dubletter",
    hideDuplicatesActionTitle: "göm dubletter"
};
