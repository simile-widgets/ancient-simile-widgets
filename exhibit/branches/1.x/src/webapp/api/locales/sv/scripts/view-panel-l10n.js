/*==================================================
 *  Exhibit.ViewPanel Swedish localization
 *==================================================
 */

Exhibit.ViewPanel.l10n = {
    resetFiltersLabel:  "visa alla",
    createSelectViewActionTitle: function(viewLabel) {
        return "välj vyn " + viewLabel;
    },
    createNoResultsTemplate: function(
        countClass,
        typesClass,
        detailsClass
    ) {
        return [
            {   tag:        "span",
                className:  countClass,
                children:   [ "0" ]
            },
            {   tag:        "span",
                className:  typesClass,
                children:   [ " resultat" ]
            },
            ". ",
            {   tag:        "span",
                className:  detailsClass,
                children:   [ "Välj bort några filter för fler resultat." ]
            }
        ];
    },

    createResultsSummaryTemplate: function(
        countClass,
        typesClass,
        detailsClass,
        resetActionLink
    ) {
        return [
            {   tag:        "span",
                className:  countClass,
                field:      "itemCountSpan"
            },
            {   tag:        "span",
                className:  typesClass,
                field:      "typesSpan"
            },
            {   tag:        "span",
                className:  detailsClass,
                field:      "noFilterDetailsSpan",
                style:      { display: "none" },
                children:   [ "totalt" ]
            },
            {   tag:        "span",
                className:  detailsClass,
                field:      "filteredDetailsSpan",
                style:      { display: "none" },
                children: [
                    " av ",
                    {   tag:    "span",
                        field:  "originalCountSpan"
                    },
                   " totalt (",
                    {   elmt:  resetActionLink,
                        title: "Välj bort alla filter och se samtliga"
                    },
                    ")"
                ]
            }
        ];
    },

    missingViewClassMessage: "Specifikationen för en av vyerna saknas i fältet viewClass.",
    viewClassNotFunctionMessage: function(expr) {
        return "Värdet '" + expr + "' du angivit för attributet viewClass\n" +
            "för en av dessa vyer var inte namnet på en javascriptfunktion.";
    },
    badViewClassMessage: function(expr) {
        return "Värdet '" + expr + "' du angivit för attributet viewClass\n" +
            "för en av dessa vyer är inte ett giltigt javascriptuttryck.";
    }
};
