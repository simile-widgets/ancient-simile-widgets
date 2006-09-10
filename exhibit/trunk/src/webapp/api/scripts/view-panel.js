/*==================================================
 *  Exhibit.ViewPanel
 *==================================================
 */
 
Exhibit.ViewPanel = function(exhibit, div, configuration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    
    this._view = null;
    this._initializeUI();
}

Exhibit.ViewPanel.prototype._initializeUI = function() {
    this._div.innerHTML = "";
    
    Exhibit.protectUI(this._div);
    SimileAjax.DOM.appendClassName(this._div, "exhibit-viewPanel");
    
    var collectionViewDiv = document.createElement("div");
    this._div.appendChild(collectionViewDiv);
    
    this._view = new Exhibit.TileView(
        this._exhibit, 
        collectionViewDiv, 
        this._configuration
    );
};

Exhibit.ViewPanel.getPropertyValuesPairs = function(itemID, propertyEntries, database) {
    var pairs = [];
    var enterPair = function(propertyID, forward) {
        var property = database.getProperty(propertyID);
        var values = forward ? 
            database.getObjects(itemID, propertyID) :
            database.getSubjects(itemID, propertyID);
        var count = values.size();
        
        if (count > 0) {
            var itemValues = property.getValueType() == "item";
            var pair = { 
                propertyLabel:
                    forward ?
                        (count > 1 ? property.getPluralLabel() : property.getLabel()) :
                        (count > 1 ? property.getReversePluralLabel() : property.getReverseLabel()),
                valueType:  property.getValueType(),
                values:     []
            };
            
            if (itemValues) {
                values.visit(function(value) {
                    var label = database.getLiteralProperty(value, "label");
                    pair.values.push(label != null ? label : value);
                });
            } else {
                values.visit(function(value) {
                    pair.values.push(value);
                });
            }
            pairs.push(pair);
        }
    };
    
    for (var i = 0; i < propertyEntries.length; i++) {
        var entry = propertyEntries[i];
        if (typeof entry == "string") {
            enterPair(entry, true);
        } else {
            enterPair(entry.property, entry.forward);
        }
    }
    return pairs;
};

