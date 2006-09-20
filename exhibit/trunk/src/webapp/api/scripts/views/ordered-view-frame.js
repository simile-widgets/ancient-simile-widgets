/*==================================================
 *  Exhibit.OrderedViewFrame
 *==================================================
 */
 
Exhibit.OrderedViewFrame = function(exhibit, divHeader, divFooter, configuration) {
    this._exhibit = exhibit;
    this._divHeader = divHeader;
    this._divFooter = divFooter;
    
    this._orders = [
        {   property:   "label",
            forward:    true,
            ascending:  true
        }
    ];
    this._possibleOrders = [
        {   property:   "label",
            forward:    true,
            ascending:  true
        }
    ];
    
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
        if ("possibleOrders" in configuration) {
            this._possibleOrders = [];
            
            var possibleOrders = configuration.orders;
            var hasLabel = false;
            for (var i = 0; i < possibleOrders.length; i++) {
                var order = possibleOrders[i];
                var possibleOrder = (typeof order == "string") ?
                    {   property:   order,
                        forward:    true,
                        ascending:  true
                    } :
                    {   property:   order.property,
                        forward:    ("forward" in order) ? (order.forward) : true,
                        ascending:  ("ascending" in order) ? (order.ascending) : true
                    };
                    
                this._possibleOrders.push(possibleOrder);
                if (possibleOrder.property == "label" && possibleOrder.forward) {
                    hasLabel = true;
                }
            }
            
            if (!hasLabel) {
                this._possibleOrders.push({ 
                    property:   "label", 
                    forward:    true, 
                    ascending:  true 
                });
            }
        }
    }
    
    this._initializeUI();
};

Exhibit.OrderedViewFrame.prototype._initializeUI = function() {
    this._divHeader.innerHTML = "";
    this._divFooter.innerHTML = "";
    
    var self = this;
    this._headerDom = Exhibit.OrderedViewFrame.theme.createHeaderDom(
        this._exhibit, 
        this._divHeader, 
        function(elmt, evt, target) {
            self._reset();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        },
        function(elmt, evt, target) {
            self._openSortPopup(elmt, -1);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    );
};

Exhibit.OrderedViewFrame.prototype.reconstruct = function() {
    var self = this;
    var exhibit = this._exhibit;
    var database = exhibit.getDatabase();
    
    /*
     *  Get the current collection and check if it's empty
     */
    var collection = exhibit.getBrowseEngine().getCurrentCollection();
    var currentSet = collection.getCurrentSet();
    var currentCount = currentSet.size();
    
    /*
     *  Set the header UI
     */
    this._headerDom.setCounts(currentCount, collection.originalSize());
    this._headerDom.setTypes(database.getTypeLabels(currentSet)[currentCount > 1 ? 1 : 0]);
    
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
     *  Generate item views
     */
    var sortKeys = [];
    var groupLevels = orders.length - 1;
    for (var i = 0; i < orders.length; i++) {
        sortKeys.push(null);
    }
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        var g = 0;
        while (g < groupLevels && item.sortKeys[g] == sortKeys[g]) {
            g++;
        }
        
        while (g < groupLevels) {
            sortKeys[g] = item.sortKeys[g];
            
            this.onNewGroup(sortKeys[g], orders[g].valueType, g);
            
            g++;
        }
        
        this.onNewItem(item.id, i);
    }
    
    /*
     *  Build sort controls
     */
    var orderDoms = [];
    var buildOrderDom = function(order, index) {
        var property = database.getProperty(order.property);
        var orderDom = Exhibit.OrderedViewFrame.theme.createOrderDom(
            exhibit,
            (order.forward) ? property.getPluralLabel() : property.getReversePluralLabel(),
            function(elmt, evt, target) {
                self._openSortPopup(elmt, index);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            }
        );
        orderDoms.push(orderDom);
    };
    for (var i = 0; i < orders.length; i++) {
        buildOrderDom(orders[i], i);
    }
    this._headerDom.setOrders(orderDoms);
    this._headerDom.enableThenByAction(orderDoms.length < this._possibleOrders.length);
};

Exhibit.OrderedViewFrame.prototype._processOrder = function(items, order, index) {
    var database = this._exhibit.getDatabase();
    
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
                item.sortKeys.push(value == null ? Exhibit.l10n.missingSortKey : value);
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
                item.sortKeys.push(value == null ? Exhibit.l10n.missingSortKey : value);
            }
        }
    } else {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var valueItem = database.getInverseProperty(item.id, property);
            var value = valueItem == null ? null : database.getLiteralProperty(valueItem, "label");
            item.sortKeys.push(value == null ? Exhibit.l10n.missingSortKey : value);
        }
    }
    
    return textFunction;
};

Exhibit.OrderedViewFrame.prototype._reset = function() {
    var state = {};
    var browseEngine = this._exhibit.getBrowseEngine();
    SimileAjax.History.addAction({
        perform: function() {
            state.restrictions = browseEngine.clearRestrictions();
        },
        undo: function() {
            browseEngine.applyRestrictions(state.restrictions);
        },
        label: "reset",
        uiLayer: SimileAjax.WindowManager.getBaseLayer()
    });
};

Exhibit.OrderedViewFrame.prototype._openSortPopup = function(elmt, index) {
    var self = this;
    var database = this._exhibit.getDatabase();
    
    var popupDom = Exhibit.Theme.createPopupMenuDom(elmt);
    
    /*
     *  Ascending/descending/remove options for the current order
     */
    if (index >= 0) {
        var order = this._orders[index];
        var property = database.getProperty(order.property);
        var propertyLabel = order.forward ? property.getPluralLabel() : property.getReversePluralLabel();
        var valueType = order.forward ? property.getValueType() : "item";
        var sortLabels = Exhibit.Database.l10n.sortLabels[valueType];
        sortLabels = (sortLabels != null) ? sortLabels : 
            Exhibit.Database.l10n.sortLabels["text"];
        
        popupDom.appendMenuItem(
            sortLabels.ascending, 
            Exhibit.Theme.urlPrefix +
                (order.ascending ? "images/option-check.png" : "images/option.png"),
            order.ascending ?
                function() {} :
                function() {
                    self._reSort(
                        index, 
                        order.property, 
                        order.forward, 
                        true,
                        false
                    );
                }
        );
        popupDom.appendMenuItem(
            sortLabels.descending, 
            Exhibit.Theme.urlPrefix +
                (order.ascending ? "images/option.png" : "images/option-check.png"),
            order.ascending ?
                function() {
                    self._reSort(
                        index, 
                        order.property, 
                        order.forward, 
                        false,
                        false
                    );
                } :
                function() {}
        );
        if (this._orders.length > 1) {
            popupDom.appendSeparator();
            popupDom.appendMenuItem(
                Exhibit.OrderedViewFrame.l10n.removeOrderLabel, 
                null,
                function() {self._removeOrder(index);}
            );
        }
    }
    
    /*
     *  The remaining possible orders
     */
    var orders = [];
    for (var i = 0; i < this._possibleOrders.length; i++) {
        var possibleOrder = this._possibleOrders[i];
        var skip = false;
        for (var j = (index < 0) ? this._orders.length - 1 : index; j >= 0; j--) {
            var existingOrder = this._orders[j];
            if (existingOrder.property == possibleOrder.property && 
                existingOrder.forward == possibleOrder.forward) {
                skip = true;
                break;
            }
        }
        
        if (!skip) {
            var property = database.getProperty(possibleOrder.property);
            orders.push({
                property:   possibleOrder.property,
                forward:    possibleOrder.forward,
                ascending:  possibleOrder.ascending,
                label:      possibleOrder.forward ? 
                                property.getPluralLabel() : 
                                property.getReversePluralLabel()
            });
        }
    }
    
    if (orders.length > 0) {
        if (index >= 0) {
            popupDom.appendSeparator();
        }
        
        orders.sort(function(order1, order2) {
            return order1.label.localeCompare(order2.label);
        });
        
        var appendOrder = function(order) {
            popupDom.appendMenuItem(
                order.label,
                null,
                function() {
                    self._reSort(
                        index, 
                        order.property, 
                        order.forward, 
                        order.ascending,
                        true
                    );
                }
            );
        }
        
        for (var i = 0; i < orders.length; i++) {
            appendOrder(orders[i]);
        }
    }
    popupDom.open();
};

Exhibit.OrderedViewFrame.prototype._reSort = function(index, propertyID, forward, ascending, slice) {
    index = (index < 0) ? this._orders.length : index;
    
    var oldOrders = this._orders;
    var newOrders = this._orders.slice(0, index);
    newOrders.push({ property: propertyID, forward: forward, ascending: ascending });
    if (!slice) {
        newOrders = newOrders.concat(oldOrders.slice(index+1));
    }
    
    var property = this._exhibit.getDatabase().getProperty(propertyID);
    var propertyLabel = forward ? property.getPluralLabel() : property.getReversePluralLabel();
    var valueType = forward ? property.getValueType() : "item";
    var sortLabels = Exhibit.Database.l10n.sortLabels[valueType];
    sortLabels = (sortLabels != null) ? sortLabels : 
        Exhibit.Database.l10n.sortLabels["text"];
    
    var self = this;
    SimileAjax.History.addAction({
        perform: function() {
            self._orders = newOrders;
            self.parentReconstruct();
        },
        undo: function() {
            self._orders = oldOrders;
            self.parentReconstruct();
        },
        label: Exhibit.OrderedViewFrame.l10n.formatSortActionTitle(
            propertyLabel, ascending ? sortLabels.ascending : sortLabels.descending),
        uiLayer: SimileAjax.WindowManager.getBaseLayer()
    });
};

Exhibit.OrderedViewFrame.prototype._removeOrder = function(index) {
    var oldOrders = this._orders;
    var newOrders = this._orders.slice(0, index).concat(this._orders.slice(index + 1));
    
    var order = oldOrders[index];
    var property = this._exhibit.getDatabase().getProperty(order.property);
    var propertyLabel = order.forward ? property.getPluralLabel() : property.getReversePluralLabel();
    var valueType = order.forward ? property.getValueType() : "item";
    var sortLabels = Exhibit.Database.l10n.sortLabels[valueType];
    sortLabels = (sortLabels != null) ? sortLabels : 
        Exhibit.Database.l10n.sortLabels["text"];
    
    var self = this;
    SimileAjax.History.addAction({
        perform: function() {
            self._orders = newOrders;
            self.parentReconstruct();
        },
        undo: function() {
            self._orders = oldOrders;
            self.parentReconstruct();
        },
        label: Exhibit.OrderedViewFrame.l10n.formatRemoveOrderActionTitle(
            propertyLabel, order.ascending ? sortLabels.ascending : sortLabels.descending),
        uiLayer: SimileAjax.WindowManager.getBaseLayer()
    });
};