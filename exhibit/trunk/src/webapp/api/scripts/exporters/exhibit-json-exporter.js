/*==================================================
 *  Exhibit.ExhibitJsonExporter
 *==================================================
 */
 
Exhibit.ExhibitJsonExporter = {
    getLabel: function() {
        return Exhibit.l10n.exhibitJsonExporterLabel;
    }
};

Exhibit.ExhibitJsonExporter.exportOne = function(itemID, exhibit) {
    return Exhibit.ExhibitJsonExporter._wrap(
        Exhibit.ExhibitJsonExporter._exportOne(itemID, exhibit) + "\n");
};

Exhibit.ExhibitJsonExporter.exportMany = function(set, exhibit) {
    var s = "";
    var size = set.size();
    var count = 0;
    set.visit(function(itemID) {
        s += Exhibit.ExhibitJsonExporter._exportOne(itemID, exhibit) + ((count++ < size - 1) ? ",\n" : "\n");
    });
    return Exhibit.ExhibitJsonExporter._wrap(s);
};

Exhibit.ExhibitJsonExporter._exportOne = function(itemID, exhibit) {
    var s = "";
    var database = exhibit.getDatabase();
    var uri = database.getObject(itemID, "uri");
    
    s += "\t\t{\tid: \"" + itemID + "\",\n";
    
    var allProperties = database.getAllProperties();
    
    for (var i = 0; i < allProperties.length; i++) {
        var propertyID = allProperties[i];
        var property = database.getProperty(propertyID);
        var values = database.getObjects(itemID, propertyID);
        var valueType = property.getValueType();
        
        if (values.size() > 0) {
            var array;
            if (valueType == "url") {
                array = [];
                values.visit(function(value) {
                    array.push(exhibit.resolveURL(value));
                });
            } else {
                array = values.toArray();
            }
            
            s += "\t\t\t" + propertyID + ":\t";
            if (array.length == 1) {
                s += "\"" + array[0] + "\"";
            } else {
                s += "[ ";
                for (var j = 0; j < array.length; j++) {
                    s += (j > 0 ? ", " : "") + "\"" + array[j] + "\"";
                }
                s += " ]";
            }
            s += ",\n";
        }
    }
    s += "\t\t\torigin: \"" + exhibit.getItemLink(itemID) + "\"\n";
    s += "\t\t}";
    
    return s;
};

Exhibit.ExhibitJsonExporter._wrap = function(s) {
    return "{\n" +
        "\titems: [\n" +
            s +
        "\t]\n" +
    "}";
}