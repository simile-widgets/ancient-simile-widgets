/*==================================================
 *  Exhibit.SemanticWikitextExporter
 *==================================================
 */
 
Exhibit.SemanticWikitextExporter = {
    icon: {
        url:    Exhibit.urlPrefix + "images/rdf-copy-button.png",
        width:  16,
        height: 16
    }
};

Exhibit.SemanticWikitextExporter.exportOne = function(itemID, exhibit) {
    return Exhibit.SemanticWikitextExporter._wrap(
        Exhibit.SemanticWikitextExporter._exportOne(itemID, exhibit));
};

Exhibit.SemanticWikitextExporter.exportMany = function(set, exhibit) {
    var s = "";
    set.visit(function(itemID) {
        s += Exhibit.SemanticWikitextExporter._exportOne(itemID, exhibit) + "\n";
    });
    return Exhibit.SemanticWikitextExporter._wrap(s);
};

Exhibit.SemanticWikitextExporter._exportOne = function(itemID, exhibit) {
    var s = "";
    var database = exhibit.getDatabase();
    var uri = database.getObject(itemID, "uri");
    s += uri + "\n"
    
    var allProperties = database.getAllProperties();
    for (var i = 0; i < allProperties.length; i++) {
        var propertyID = allProperties[i];
        var property = database.getProperty(propertyID);
        var values = database.getObjects(itemID, propertyID);
        
        if (property.getValueType() == "item") {
            values.visit(function(value) {
                s += "[[" + propertyID + "::" + value + "]]\n";
            });
        } else {
            values.visit(function(value) {
                s += "[[" + propertyID + ":=" + value + "]]\n";
            });
        }
    }
    
    s += "\n";
    return s;
};

Exhibit.SemanticWikitextExporter._wrap = function(s) {
    return s;
}