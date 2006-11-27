/*==================================================
 *  Exhibit.BibtexExporter
 *==================================================
 */
 
Exhibit.BibtexExporter = {
    getLabel: function() {
        return "Bibtex";
    },
    _excludeProperties: {
        "pub-type" : true,
        "type" : true,
        "uri" : true,
        "key" : true
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
    var type = database.getObject(itemID, "pub-type");
    var key = database.getObject(itemID, "key");
    s += "@" + type + "{" + (key != null ? key : itemID) + "\n";
    
    var allProperties = database.getAllProperties();
    for (var i = 0; i < allProperties.length; i++) {
        var propertyID = allProperties[i];
        var property = database.getProperty(propertyID);
        var values = database.getObjects(itemID, propertyID);
        var valueType = property.getValueType();
        
        if (values.size() > 0 && !(propertyID in Exhibit.BibtexExporter._excludeProperties)) {
            s += "\t" + (propertyID == "label" ? "title" : propertyID) + " = \"";
            
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