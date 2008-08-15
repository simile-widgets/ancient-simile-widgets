Exhibit.ItemCreator = function(elmt, uiContext, settings) {
    var db = uiContext.getDatabase();

    if (elmt.nodeName.toLowerCase() == 'a') {
        elmt.href = "javascript:";
    }
    
    SimileAjax.jQuery(elmt).click(function() {
        var item = { type: settings.itemType };
        Exhibit.ItemCreator.makeNewItemBox(uiContext, item);
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

Exhibit.ItemCreator.makeNewItemBox = function(uiContext, item, opts) {
    var db = uiContext.getDatabase();
    opts = opts || {};
    
    var box = $("<div>" +
        "<h1 class='exhibit-focusDialog-header' id='boxHeader'></h1>" +
        "<div class='exhibit-focusDialog-viewContainer' id='itemContainer'></div>" +
        "<div class='exhibit-focusDialog-controls'>" +
            "<button id='removeButton' style='margin-right: 2em'>Remove Item</button>" +
            "<button id='addButton' style='margin-left: 2em'>Create Item</button>" +
        "</div>" +
    "</div>");

    if (opts.title) {
        box.find('#boxHeader').text(opts.title);
    } else {
        box.find('#boxHeader').remove();
    }

    box.addClass('exhibit-focusDialog').addClass("exhibit-ui-protection");
    box.css({
      top: document.body.scrollTop + 100 + 'px',
      background: "#EEE repeat"
    });

    item.type = item.type || 'item';
    item.id = item.id || Exhibit.ItemCreator.makeNewItemID(db, item.type);
    item.label = item.label || item.id;

    db.addItem(item);

    var itemDiv = box.find('#itemContainer').get(0);
        
    uiContext.getLensRegistry().createEditLens(item.id, itemDiv, uiContext, {
        disableEditWidgets: true
    });
    
    box.find('#removeButton').click(function() {
        box.remove();
        database.removeItem(item.id);
    });
    
    box.find('#addButton').click(function() {
       box.remove(); 
    });
    
    box.appendTo(document.body);
}