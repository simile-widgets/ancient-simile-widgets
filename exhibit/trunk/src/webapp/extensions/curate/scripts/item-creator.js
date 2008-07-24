Exhibit.ItemCreator = function(elmt, uiContext, settings) {
    var db = uiContext.getDatabase();

    if (elmt.nodeName.toLowerCase() == 'a') {
        elmt.href = "javascript:";
    }
    
    SimileAjax.jQuery(elmt).click(function() {
        var item = { type: settings.itemType };
        Exhibit.ItemCreator.createItem(uiContext, item);
    });
    return elmt;
}

Exhibit.ItemCreator._settingSpecs = {
    "itemType": { type: "text", defaultValue: "item" }
};

Exhibit.UI.generateCreationMethods(Exhibit.ItemCreator);
Exhibit.UI.registerComponent('item-creator', Exhibit.ItemCreator);

Exhibit.ItemCreator.makeNewItemID = function(db, type) {
    var typeLabel = db.getType(type).getLabel();
    
    var seed = "Untitled " + typeLabel;
    var count = "";
    var name = seed;
    
    while (db.containsItem(name)) {
        count++;
        name = seed + ' ' + count;
    }
    
    return name;
}

Exhibit.ItemCreator.createItem = function(uiContext, item) {
    var db = uiContext.getDatabase();
    
    item = item || {};
    item.type = item.type || 'item';
    item.id = item.id || Exhibit.ItemCreator.makeNewItemID(db, item.type);
    item.label = item.label || item.id;
    
    // TODO: make global edits
    db.addItem(item);
    
    var elmt = Exhibit.UI.findAttribute('ex:itemid', item.id).get(0);
    if (elmt) {
        var coords = SimileAjax.DOM.getPageCoordinates(elmt);
        window.scrollTo(coords.left, coords.top - 100); // 100px of space seems to look good
    }
}