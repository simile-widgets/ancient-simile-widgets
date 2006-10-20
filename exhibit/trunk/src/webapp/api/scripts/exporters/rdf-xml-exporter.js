/*==================================================
 *  Exhibit.RdfXmlExporter
 *==================================================
 */
 
Exhibit.RdfXmlExporter = {
    icon: {
        url:    Exhibit.urlPrefix + "images/rdf-copy-button.png",
        width:  16,
        height: 16
    }
};

Exhibit.RdfXmlExporter.exportOne = function(itemID, exhibit) {
    return Exhibit.RdfXmlExporter._wrapRdf(
        Exhibit.RdfXmlExporter._exportOne(itemID, exhibit));
};

Exhibit.RdfXmlExporter.exportMany = function(set, exhibit) {
    var s = "";
    set.visit(function(itemID) {
        s += Exhibit.RdfXmlExporter._exportOne(itemID, exhibit) + "\n";
    });
    return Exhibit.RdfXmlExporter._wrapRdf(s);
};

Exhibit.RdfXmlExporter._exportOne = function(itemID, exhibit) {
    var s = "";
    var database = exhibit.getDatabase();
    var uri = database.getObject(itemID, "uri");
    s += "<rdf:Description rdf:about='" + uri + "'>\n"
    
    var allProperties = database.getAllProperties();
    for (var i = 0; i < allProperties.length; i++) {
        var propertyID = allProperties[i];
        var property = database.getProperty(propertyID);
        var propertyURI = property.getURI();
        var values = database.getObjects(itemID, propertyID);
        
        if (property.getValueType() == "item") {
            values.visit(function(value) {
                s += "<" + propertyURI + " rdf:resource='" + value + "' />\n";
            });
        } else {
            values.visit(function(value) {
                s += "<" + propertyURI + ">" + value + "</propertyURI>\n";
            });
        }
    }
    
    s += "</rdf:Description>";
    return s;
};

Exhibit.RdfXmlExporter._wrapRdf = function(s) {
    return "<?xml version='1.0'?>\n" +
        "<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'>" +
        s +
        "</rdf:RDF>";
}