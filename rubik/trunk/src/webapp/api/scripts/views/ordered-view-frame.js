/*==================================================
 *  Rubik.OrderedViewFrame
 *==================================================
 */
 
Rubik.OrderedViewFrame = function(rubik, divHeader, divFooter, configuration) {
    this._rubik = rubik;
    this._divHeader = divHeader;
    this._divFooter = divFooter;
    
    this._orders = [
        {   property:   "label",
            forward:    true,
            ascending:  true
        }
    ];
    this._groupLevels = 0;
    
    if (configuration != null) {
        if ("orders" in configuration) {
            this._orders = [];
            
            var orders = configuration.orders;
            for (var i = 0; i < orders.length; i++) {
                var order = orders[i];
                if (typeof order == "string") {
                    this._orders.push({
                        property:   order,
                        forward:    true,
                        ascending:  true
                    });
                } else {
                    this._orders.push({
                        property:   order.property,
                        forward:    ("forward" in order) ? (order.forward) : true,
                        ascending:  ("ascending" in order) ? (order.ascending) : true
                    });
                }
            }
        }
        if ("groupLevels" in configuration) {
            this._groupLevels = Math.min(configuration.groupLevels, this._orders.length);
        }
    }
    
    this._initializeUI();
};

Rubik.OrderedViewFrame.prototype._initializeUI = function() {
    this._divHeader.innerHTML = "";
    this._divFooter.innerHTML = "";
    
    var onClearFiltersLinkClick = function(elmt, evt, target) {
        //
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    
    var headerTemplate = {
        elmt: this._divHeader,
        className: "rubik-collectionView-header",
        children: [
            {   tag:    "div",
                field:  "noResultDiv",
                style:  { display: "none" },
                children: [
                    {   tag:        "span",
                        className:  "rubik-collectionView-header-count",
                        children:   [ "0" ]
                    },
                    {   tag:        "span",
                        className:  "rubik-collectionView-header-types",
                        children:   [ "results" ]
                    },
                    {   tag:        "span",
                        className:  "rubik-collectionView-header-details",
                        children:   [ "Remove some filters to get some results." ]
                    }
                ]
            },
            {   tag:    "div",
                field:  "resultsDiv",
                style:  { display: "none" },
                children: [
                    {   tag:        "span",
                        className:  "rubik-collectionView-header-count",
                        field:      "itemCountSpan"
                    },
                    {   tag:        "span",
                        className:  "rubik-collectionView-header-types",
                        field:      "typesSpan"
                    },
                    {   tag:        "span",
                        className:  "rubik-collectionView-header-details",
                        field:      "noFilterDetailsSpan",
                        style:      { display: "none" },
                        children:   [ "total" ]
                    },
                    {   tag:        "span",
                        className:  "rubik-collectionView-header-details",
                        field:      "filteredDetailsSpan",
                        style:      { display: "none" },
                        children: [
                            " filtered from ",
                            {   tag:    "span",
                                field:  "originalCountSpan"
                            },
                            " originally (",
                            {   elmt:  this._rubik.makeActionLink("reset", onClearFiltersLinkClick),
                                title: "Clear all filters and see the original items",
                                field: "clearFiltersLink"
                            },
                            ")"
                        ]
                    }
                ]
            }
        ]
    };
    this._headerDom = SimileAjax.DOM.createDOMFromTemplate(document, headerTemplate);
};

Rubik.OrderedViewFrame.prototype.reconstruct = function() {
    var rubik = this._rubik;
    var database = rubik.getDatabase();
    
    /*
     *  Get the current collection and check if it's empty
     */
    var collection = rubik.getBrowseEngine().getCurrentCollection();
    var currentSet = collection.getCurrentSet();
    if (currentSet.size() == 0) {
        this._headerDom.noResultDiv.style.display = "block";
        this._headerDom.resultsDiv.style.display = "none";
        return;
    }
    
    /*
     *  Sort the items
     */
    var items = [];
    currentSet.visit(function(itemID) { items.push({ id: itemID, sortKeys: [] }); });
    
    var orders = this._orders;
    var sortFunctions = [];
    for (var x = 0; x < orders.length; x++) {
        sortFunctions.push(this._processOrder(items, orders[x], x));
    }
    var masterSortFunction = function(item1, item2) {
        var c = 0;
        var i = 0;
        while (c == 0 && i < sortFunctions.length) {
            c = sortFunctions[i](item1, item2);
            i++;
        }
        return c;
    }
    items.sort(masterSortFunction);
    
    /*
     *  Set the header UI
     */
    this._headerDom.noResultDiv.style.display = "none";
    this._headerDom.resultsDiv.style.display = "block";
    
    var typeLabelArrays = database.getTypeLabels(currentSet);
    var typeLabelArray = typeLabelArrays[items.length > 1 ? 1 : 0];
    var typeLabel = (typeLabelArray.length == 0) ?
        "Items" :
        (typeLabelArray.length > 3 ? "Items" : typeLabelArray.join(", "));
        
    this._headerDom.itemCountSpan.innerHTML = items.length;
    this._headerDom.typesSpan.innerHTML = typeLabel;
    
    var originalSize = collection.originalSize();
    if (originalSize != items.length) {
        this._headerDom.noFilterDetailsSpan.style.display = "none";
        this._headerDom.filteredDetailsSpan.style.display = "inline";
        this._headerDom.originalCountSpan.innerHTML = originalSize;
    } else {
        this._headerDom.noFilterDetailsSpan.style.display = "inline";
        this._headerDom.filteredDetailsSpan.style.display = "none";
    }
    
    /*
     *  Generate item views
     */
    var sortKeys = [];
    for (var i = 0; i < orders.length; i++) {
        sortKeys.push(null);
    }
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        var g = 0;
        while (g < this._groupLevels && item.sortKeys[g] == sortKeys[g]) {
            g++;
        }
        
        while (g < this._groupLevels) {
            sortKeys[g] = item.sortKeys[g];
            
            this.onNewGroup(sortKeys[g], orders[g].valueType, g);
            
            g++;
        }
        
        this.onNewItem(item.id, i);
    }
};

Rubik.OrderedViewFrame.prototype._processOrder = function(items, order, index) {
    var database = this._rubik.getDatabase();
    
    var property = order.property;
    var multiply = order.ascending ? 1 : -1;
    
    var numericFunction = function(item1, item2) {
        return multiply * (item1.sortKeys[index] - item2.sortKeys[index]);
    };
    var textFunction = function(item1, item2) {
        return multiply * item1.sortKeys[index].localeCompare(item2.sortKeys[index]);
    };
    
    order.keyType = "text";
    if (order.forward) {
        var valueType = database.getProperty(property).getValueType();
        
        if (valueType == "item") {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var valueItem = database.getLiteralProperty(item.id, property);
                var value = valueItem == null ? null : database.getLiteralProperty(valueItem, "label");
                item.sortKeys.push(value == null ? "(missing)" : value);
            }
        } else if (valueType == "number") {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var value = database.getLiteralProperty(item.id, property);
                if (!(typeof value == "number")) {
                    try {
                        value = parseFloat(value);
                    } catch (e) {
                        value = Number.NEGATIVE_INFINITY;
                    }
                }
                item.sortKeys.push(value);
            }
            order.keyType = "number";
            
            return numericFunction;
        } else if (valueType == "date") {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var value = database.getLiteralProperty(item.id, property);
                if (value != null && value instanceof Date) {
                    value = value.getTime();
                } else {
                    try {
                        value = Date.parse(value);
                    } catch (e) {
                        value = Number.NEGATIVE_INFINITY;
                    }
                }
                item.sortKeys.push(value);
            }
            order.keyType = "date";
            
            return numericFunction;
        } else {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var value = database.getLiteralProperty(item.id, property);
                item.sortKeys.push(value == null ? "(missing)" : value);
            }
        }
    } else {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var valueItem = database.getInverseProperty(item.id, property);
            var value = valueItem == null ? null : database.getLiteralProperty(valueItem, "label");
            item.sortKeys.push(value == null ? "(missing)" : value);
        }
    }
    
    return textFunction;
};