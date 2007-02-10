/*==================================================
 *  Exhibit.TSVExporter
 *==================================================
 */
 
Exhibit.TSVExporter = {
    getLabel: function() {
        return Exhibit.l10n.tsvExporterLabel;
    }
};

Exhibit.TSVExporter.exportOne = function(itemID, exhibit) {
    return Exhibit.TSVExporter._wrap(
        Exhibit.TSVExporter._exportOne(itemID, exhibit), exhibit);
};

Exhibit.TSVExporter.exportMany = function(set, exhibit) {
    var s = "";
    set.visit(function(itemID) {
        s += Exhibit.TSVExporter._exportOne(itemID, exhibit) + "\n";
    });
    return Exhibit.TSVExporter._wrap(s, exhibit);
};

Exhibit.TSVExporter._exportOne = function(itemID, exhibit) {
    var s = "";
    var database = exhibit.getDatabase();
    
    var allProperties = database.getAllProperties();
    for (var i = 0; i < allProperties.length; i++) {
        var propertyID = allProperties[i];
        var property = database.getProperty(propertyID);
        var values = database.getObjects(itemID, propertyID);
        var valueType = property.getValueType();
        
        s += values.toArray().join("; ") + "\t";
    }
    
    return s;
};

Exhibit.TSVExporter._wrap = function(s, exhibit) {
    var header = "";
    var database = exhibit.getDatabase();
    
    var allProperties = database.getAllProperties();
    for (var i = 0; i < allProperties.length; i++) {
        var propertyID = allProperties[i];
        var property = database.getProperty(propertyID);
        var valueType = property.getValueType();
        header += propertyID + ":" + valueType + "\t";
    }
    
    return header + "\n" + s;
}