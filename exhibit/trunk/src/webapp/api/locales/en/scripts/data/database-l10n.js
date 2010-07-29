/*==================================================
 *  Exhibit.Database Norwegian (Bokmål) localization
 *==================================================
 */

if (!("l10n" in Exhibit.Database)) {
    Exhibit.Database.l10n = {};
}

Exhibit.Database.l10n.itemType = {
    label:          "Objekt",
    pluralLabel:    "Objekter",
    uri:            "http://simile.mit.edu/2006/11/exhibit#Item"
};
Exhibit.Database.l10n.labelProperty = {
    label:                  "merkelapp",
    pluralLabel:            "merkelapper",
    reverseLabel:           "merkelapp for",
    reversePluralLabel:     "merkelapper for"
};
Exhibit.Database.l10n.typeProperty = {
    label:                  "type",
    pluralLabel:            "typer",
    reverseLabel:           "type av",
    reversePluralLabel:     "typer av"
};
Exhibit.Database.l10n.uriProperty = {
    label:                  "URI",
    pluralLabel:            "URIer",
    reverseLabel:           "URI av",
    reversePluralLabel:     "URIs av"
};
Exhibit.Database.l10n.sortLabels = {
    "text": {
        ascending:  "a - å",
        descending: "å - a"
    },
    "number": {
        ascending:  "minste først",
        descending: "største først"
    },
    "date": {
        ascending:  "tidligste først",
        descending: "nyeste først"
    },
    "boolean": {
        ascending:  "usanne først",
        descending: "sanne først"
    },
    "item": {
        ascending:  "a - å",
        descending: "å - a"
    }
};

Exhibit.Database.l10n.labelItemsOfType = function(count, typeID, database, countStyleClass) {
    var label = count == 1 ? Exhibit.Database.l10n.itemType.label :
        Exhibit.Database.l10n.itemType.pluralLabel
        
    var type = database.getType(typeID);
    if (type) {
        label = type.getLabel();
        if (count != 1) {
            var pluralLabel = type.getProperty("pluralLabel");
            if (pluralLabel) {
                label = pluralLabel;
            }
        }
    }
    
    var span = document.createElement("span");
    span.innerHTML = "<span class='" + countStyleClass + "'>" + count + "</span> " + label;
    
    return span;
};
