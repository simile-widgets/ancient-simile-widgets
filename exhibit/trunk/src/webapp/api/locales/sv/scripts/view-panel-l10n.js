/*==================================================
 *  Exhibit.ViewPanel Swedish localization
 *==================================================
 */

Exhibit.ViewPanel.l10n = {
    resetFiltersLabel:  "\xE5terst\xE4ll",
    createSelectViewActionTitle: function(viewLabel) {
        return "v\xE4lj vyn " + viewLabel;
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
                children:   [ "V\xE4lj bort n\xE5gra filter f\xD6r fler resultat." ]
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
                    " filtrerade fr\xE5n ",
                    {   tag:    "span",
                        field:  "originalCountSpan"
                    },
                    " av ursprungliga (",
                    {   elmt:  resetActionLink,
                        title: "V\xE4lj bort alla filter och se samtliga"
                    },
                    ")"
                ]
            }
        ];
    },

    missingViewClassMessage: "Specifikationen f\xD6r en av vyerna saknas i f\xE4ltet viewClass.",
    viewClassNotFunctionMessage: function(expr) {
        return "V\xE4rdet '" + expr + "' du angivit f\xD6r attributet viewClass\n" +
            "f\xD6r en av dessa vyer var inte namnet p\xE5 en javascriptfunktion.";
    },
    badViewClassMessage: function(expr) {
        return "V\xE4rdet '" + expr + "' du angivit f\xD6r attributet viewClass\n" +
            "f\xD6r en av dessa vyer \xE4r inte ett giltigt javascriptuttryck.";
    }
};
