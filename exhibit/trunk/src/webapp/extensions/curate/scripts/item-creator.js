Exhibit.ItemCreator = function(elmt, uiContext, settings) {
    var db = uiContext.getDatabase();
    var itemTypeLabel = db.getType(settings.itemType).getLabel();

    var makeNewItemID = function() {
        var seed = "Untitled " + itemTypeLabel;
        var count = "";
        var name = seed;
        
        while (db.containsItem(name)) {
            count++;
            name = seed + ' ' + count;
        }
        
        return name;
    };

    if (elmt.nodeName.toLowerCase() == 'a') {
        elmt.href = "javascript:";
    }
    
    var itemCreationHandler = function() {
        var id = makeNewItemID();
        var item = { type: settings.itemType, id: id, label: id };
        
        db.setEditMode(id, true);
        db.addItem(item);
        
        var elmt = Exhibit.UI.findAttribute('ex:itemid', id).get(0);
        if (elmt) {
            var coords = SimileAjax.DOM.getPageCoordinates(elmt);
            window.scrollTo(coords.left, coords.top - 100); // 100px of space seems to look good
        }
    }
    
    SimileAjax.jQuery(elmt).click(itemCreationHandler);
    return elmt;
}

Exhibit.ItemCreator._settingSpecs = {
    "itemType": { type: "text", defaultValue: "item" }
};

Exhibit.UI.generateCreationMethods(Exhibit.ItemCreator);
Exhibit.UI.registerComponent('item-creator', Exhibit.ItemCreator);
