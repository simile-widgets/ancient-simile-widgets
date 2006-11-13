/*==================================================
 *  Exhibit.BibtexExporter
 *==================================================
 */
 
Exhibit.BibtexExporter = {
    getLabel: function() {
        return "Bibtex";
    },
    _typeMap: {
        "Article":	        "article",
        "Book":	            "book",
        "Booklet":	        "booklet",
        "Conference":	    "conference",
        "Inbook":	        "inbook",
        "Incollection":	    "incollection",
        "Inproceedings":    "inproceedings",
        "Manual":	        "manual",
        "Mastersthesis":	"mastersthesis",
        "Misc":	            "misc",
        "Phdthesis":	    "phdthesis",
        "Proceedings":	    "proceedings",
        "Techreport":	    "techreport",
        "Unpublished":	    "unpublished",
        "Collection":	    "collection",
        "Patent":	        "patent"
    },
    _propertyMap: {
        "hasAddress":		"address",
        "hasAnnote":		"annote",
        "hasAuthor":		"author",
        "hasBooktitle":		"booktitle",
        "hasCrossref":		"crossref",
        "hasChapter":		"chapter",
        "hasEdition":		"edition",
        "hasEditor":		"editor",
        "howPublished":		"howpublished",
        "hasInstitution":	"institution",
        "hasJournal":		"journal",
        "hasKey":		    "key",
        "hasMonth":		    "month",
        "hasNote":		    "note",
        "hasNumber":		"number",
        "hasOrganization":	"organization",
        "hasPages":		    "pages",
        "hasPublisher":		"publisher",
        "hasSchool":		"school",
        "hasSeries":		"series",
        "label":		    "title",
        "hasType":		    "type",
        "hasVolume":		"volume",
        "hasYear":		    "year",
        "hasAffiliation":	"affiliation",
        "hasAbstract":		"abstract",
        "hasContents":		"contents",
        "hasCopyright":		"copyright",
        "hasISBN":		    "isbn",
        "hasISSN":		    "issn",
        "hasKeywords":		"keywords",
        "hasLanguage":		"language",
        "hasLocation":		"location",
        "hasLCCN":		    "lccn",
        "hasMrnumber":		"mrnumber",
        "hasPrice":		    "price",
        "hasSize":		    "size",
        "hasURL":		    "url"
    }
};

Exhibit.BibtexExporter.exportOne = function(itemID, exhibit) {
    return Exhibit.BibtexExporter._wrap(
        Exhibit.BibtexExporter._exportOne(itemID, exhibit));
};

Exhibit.BibtexExporter.exportMany = function(set, exhibit) {
    var s = "";
    set.visit(function(itemID) {
        s += Exhibit.BibtexExporter._exportOne(itemID, exhibit) + "\n";
    });
    return Exhibit.BibtexExporter._wrap(s);
};

Exhibit.BibtexExporter._exportOne = function(itemID, exhibit) {
    var s = "";
    var database = exhibit.getDatabase();
    var type = database.getObject(itemID, "type");
    var key = database.getObject(itemID, "hasKey");
    s += "@" + Exhibit.BibtexExporter._typeMap[type] + "{" + (key != null ? key : itemID) + "\n";
    
    var allProperties = database.getAllProperties();
    for (var i = 0; i < allProperties.length; i++) {
        var propertyID = allProperties[i];
        var property = database.getProperty(propertyID);
        var values = database.getObjects(itemID, propertyID);
        var valueType = property.getValueType();
        
        if (values.size() > 0 && propertyID in Exhibit.BibtexExporter._propertyMap) {
            s += "\t" + Exhibit.BibtexExporter._propertyMap[propertyID] + " = \"";
            
            var strings;
            if (valueType == "item") {
                strings = [];
                values.visit(function(value) {
                    strings.push(database.getObject(value, "label"));
                });
            } else {
                if (valueType == "url") {
                    strings = [];
                    values.visit(function(value) {
                        strings.push(exhibit.resolveURL(value));
                    });
                } else {
                    strings = values.toArray();
                }
            }
            
            s += strings.join(" and ") + "\",\n";
        }
    }
    s += "\torigin = \"" + exhibit.getItemLink(itemID) + "\"\n";
    s += "}\n";
    
    return s;
};

Exhibit.BibtexExporter._wrap = function(s) {
    return s;
}