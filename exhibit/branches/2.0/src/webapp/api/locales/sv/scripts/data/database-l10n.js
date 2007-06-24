/*==================================================
 *  Exhibit.Database Swedish localization
 *==================================================
 */

if (!("l10n" in Exhibit.Database)) {
    Exhibit.Database.l10n = {};
}

Exhibit.Database.l10n.itemType = {
    label:          "Sak",
    pluralLabel:    "Saker"
};
Exhibit.Database.l10n.labelProperty = {
    label:                  "etikett",
    pluralLabel:            "etiketter",
    reverseLabel:           "etikett till",
    reversePluralLabel:     "etiketter till",
    groupingLabel:          "etiketter",
    reverseGroupingLabel:   "saker med etiketten"
};
Exhibit.Database.l10n.typeProperty = {
    label:                  "typ",
    pluralLabel:            "typer",
    reverseLabel:           "typ av",
    reversePluralLabel:     "typer av",
    groupingLabel:          "typer",
    reverseGroupingLabel:   "saker av dessa typer"
};
Exhibit.Database.l10n.uriProperty = {
    label:                  "URI",
    pluralLabel:            "URIer",
    reverseLabel:           "URI för",
    reversePluralLabel:     "URIer för",
    groupingLabel:          "URIer",
    reverseGroupingLabel:   "saker med dessa URIer"
};
Exhibit.Database.l10n.sortLabels = {
    "text": {
        ascending:  "a - z",
        descending: "z - a"
    },
    "number": {
        ascending:  "lägst först",
        descending: "högst först"
    },
    "date": {
        ascending:  "tidigast först",
        descending: "nyligast först"
    },
    "boolean": {
        ascending:  "falskt först",
        descending: "sant först"
    },
    "item": {
        ascending:  "a - z",
        descending: "z - a"
    }
};
