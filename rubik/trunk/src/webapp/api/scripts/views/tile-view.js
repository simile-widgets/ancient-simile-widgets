/*==================================================
 *  Rubik.TileView
 *==================================================
 */
 
Rubik.TileView = function(rubik, div, configuration) {
    this._rubik = rubik;
    this._div = div;
    this._itemViewConfiguration = {
        properties: null
    };
    
    if ("TileView" in configuration) {
        var myConfig = configuration["TileView"];
        
        if ("properties" in myConfig) {
            this._itemViewConfiguration.properties = [];
            
            var entries = myConfig.properties;
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var sp;
                if (typeof entry == "string") {
                    sp = {
                        property: entry,
                        forward:  true
                    };
                } else {
                    sp = {
                        property: entry.property,
                        forward:  ("forward" in entry) ? (entry.forward) : true
                    }
                }
                this._itemViewConfiguration.properties.push(sp);
            }
        }
    }
    
    var view = this;
    var reconstruct = function() { view._reconstruct(); };
    this._rubik.getBrowseEngine().addListener({
        onRootCollectionSet:    reconstruct,
        onRestrict:             reconstruct
    });
}

Rubik.TileView.prototype._reconstruct = function() {
    var rubik = this._rubik;
    var database = this._rubik.getDatabase();
    
    if (this._itemViewConfiguration.properties == null) {
        this._itemViewConfiguration.properties = [];
        
        var propertyIDs = database.getAllProperties();
        for (var i = 0; i < propertyIDs.length; i++) {
            this._itemViewConfiguration.properties.push({
                property:   propertyIDs[i],
                forward:    true
            });
        }
    }
    
    var items = [];
    
    var collection = this._rubik.getBrowseEngine().getCurrentCollection();
    var currentSet = collection.getCurrentSet();
    currentSet.visit(function(itemID) {
        items.push({ 
            id:     itemID, 
            label:  database.getLiteralProperty(itemID, "label") 
        });
    });
    items.sort(function(a, b) {
        return a.label.localeCompare(b.label);
    });
    
    this._div.innerHTML = "";
    this._div.style.display = "none";
    if (items.length == 0) {
        var template = {
            elmt: this._div,
            children: [
                {   tag: "div",
                    className: "rubik-collectionView-header",
                    children: [
                        {   tag: "span",
                            className: "rubik-collectionView-header-count",
                            children: [ "0" ]
                        },
                        {   tag: "span",
                            className: "rubik-collectionView-header-types",
                            children: [ "results" ]
                        },
                        {   tag: "span",
                            className: "rubik-collectionView-header-details",
                            children: [ "Remove some filters to get some results." ]
                        }
                    ]
                }
            ]
        }
        this._dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    } else {
        var typeLabelArrays = database.getTypeLabels(currentSet);
        var typeLabelArray = typeLabelArrays[items.length > 1 ? 1 : 0];
        var typeLabel = (typeLabelArray.length == 0) ?
            "Items" :
            (typeLabelArray.length > 3 ? "Items" : typeLabelArray.join(", "));
        
        var originalSize = collection.originalSize();
        var onClearFiltersLinkClick = function(elmt, evt, target) {
            //
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        };
        
        var template = {
            elmt: this._div,
            children: [
                {   tag: "div",
                    className: "rubik-collectionView-header",
                    children: [
                        {   tag: "span",
                            className: "rubik-collectionView-header-count",
                            children: [ items.length ]
                        },
                        {   tag: "span",
                            className: "rubik-collectionView-header-types",
                            children: [ typeLabel ]
                        },
                        {   tag: "span",
                            className: "rubik-collectionView-header-details",
                            children: (originalSize == items.length) ?
                                [   "total"
                                ] : 
                                [   {   elmt:  rubik.makeActionLink("filtered", onClearFiltersLinkClick),
                                        title: "Clear all filters and see the original items",
                                        field: "clearFiltersLink"
                                    },
                                    (" from " + originalSize + " items originally")
                                ]
                        }
                    ]
                },
                {   tag: "div",
                    className: "rubik-collectionView-body",
                    field: "bodyDiv",
                    children: [
                        {   tag:            "table",
                            className:      "rubik-tileView-body",
                            cellspacing:    "5",
                            field:          "bodyTable"
                        }
                    ]
                }
            ]
        };
        this._dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
        
        var table = this._dom.bodyTable;
        for (var i = 0; i < items.length && i < 10; i++) {
            var item = items[i];
            var tr = table.insertRow(i);
            
            var tdIndex = tr.insertCell(0);
            tdIndex.innerHTML = (i + 1) + ".";
            
            var tdItemView = tr.insertCell(1);
            
            var itemDiv = document.createElement("div");
            var itemView = new Rubik.ItemView(item.id, itemDiv, rubik, this._itemViewConfiguration);
            
            tdItemView.appendChild(itemDiv);
        }
    }
    this._div.style.display = "block";
};
