/*==================================================
 *  Exhibit.Database English localization
 *==================================================
 */

if (!("l10n" in Exhibit.Database)) {
    Exhibit.Database.l10n = {};
}

Exhibit.Database.l10n.itemType = {
    label:          "Item",
    pluralLabel:    "Items"
};
Exhibit.Database.l10n.labelProperty = {
    label:                  "label",
    pluralLabel:            "labels",
    reverseLabel:           "label of",
    reversePluralLabel:     "labels of",
    groupingLabel:          "labels",
    reverseGroupingLabel:   "things being labelled"
};
Exhibit.Database.l10n.typeProperty = {
    label:                  "type",
    pluralLabel:            "types",
    reverseLabel:           "type of",
    reversePluralLabel:     "types of",
    groupingLabel:          "types",
    reverseGroupingLabel:   "things of these types"
};
Exhibit.Database.l10n.uriProperty = {
    label:                  "URI",
    pluralLabel:            "URIs",
    reverseLabel:           "URI of",
    reversePluralLabel:     "URIs of",
    groupingLabel:          "URIs",
    reverseGroupingLabel:   "things named by these URIs"
};
Exhibit.Database.l10n.sortLabels = {
    "text": {
        ascending:  "a - z",
        descending: "z - a"
    },
    "number": {
        ascending:  "smallest first",
        descending: "largest first"
    },
    "date": {
        ascending:  "earliest first",
        descending: "latest first"
    },
    "boolean": {
        ascending:  "false first",
        descending: "true first"
    },
    "item": {
        ascending:  "a - z",
        descending: "z - a"
    }
};
