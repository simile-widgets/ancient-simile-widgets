/*==================================================
 *  Exhibit.OrderedViewFrame
 *==================================================
 */
 
Exhibit.OrderedViewFrame = function(exhibit, divHeader, divFooter, configuration, domConfiguration) {
    this._exhibit = exhibit;
    this._divHeader = divHeader;
    this._divFooter = divFooter;
    
    this._orders = null;
    this._possibleOrders = null;
    this._initialCount = 10;
    this._showAll = false;
    
    /*
     *  First, get configurations from the dom, if any
     */
    if (domConfiguration != null) {
        var orders = Exhibit.getAttribute(domConfiguration, "orders");
        if (orders != null && orders.length > 0) {
            this._orders = [];
            this._configureOrders(orders.split(","));
        }
        
        var directions = Exhibit.getAttribute(domConfiguration, "directions");
        if (directions != null && directions.length > 0) {
            directions = directions.split(",");
            for (var i = 0; i < directions.length && i < this._orders.length; i++) {
                this._orders[i].ascending = (directions[i].trim().toLowerCase() != "descending");
            }
        }
        
        var possibleOrders = Exhibit.getAttribute(domConfiguration, "possibleOrders");
        if (possibleOrders != null && possibleOrders.length > 0) {
            this._possibleOrders = [];
            this._configurePossibleOrders(possibleOrders.split(","));
        }
        
        var possibleDirections = Exhibit.getAttribute(domConfiguration, "possibleDirections");
        if (possibleDirections != null && possibleDirections.length > 0) {
            possibleDirections = possibleDirections.split(",");
            for (var i = 0; i < possibleDirections.length && i < this._possibleOrders.length; i++) {
                this._possibleOrders.ascending = (possibleDirections[i].trim().toLowerCase() != "descending");
            }
        }
        
        var initialCount = Exhibit.getAttribute(domConfiguration, "initialCount");
        if (initialCount != null && initialCount.length > 0) {
            this._initialCount = parseInt(initialCount);
        }
        
        var showAll = Exhibit.getAttribute(domConfiguration, "showAll");
        if (showAll != null && showAll.length > 0) {
            this._showAll = (showAll == "true");
        }
    }
    
    /*
     *  Then override them from the configuration object
     */
    if ("orders" in configuration) {
        this._orders = [];
        this._configureOrders(configuration.orders);
    }
    if ("possibleOrders" in configuration) {
        this._possibleOrders = [];
        this._configurePossibleOrders(configuration.possibleOrders);
    }
    if ("initialCount" in configuration) {
        this._initialCount = configuration.initialCount;
    }
    if ("showAll" in configuration) {
        this._showAll = configuration.showAll;
    }
    
    /*
     *  Fix up configuration in case author makes mistakes
     */
    if (this._possibleOrders == null) {
        this._possibleOrders = [
            {   property:   "label",
                forward:    true,
                ascending:  true
            }
        ];
    }
    if (this._orders == null) {
        this._orders = [
            this._possibleOrders[0]
        ];
    }
    
    /*
     *  Initialize the UI
     */
    this._initializeUI();
};

Exhibit.OrderedViewFrame.prototype.dispose = function() {
    this._headerDom = null;
    this._footerDom = null;
    
    this._divHeader.innerHTML = "";
    this._divFooter.innerHTML = "";
    this._divHeader = null;
    this._divFooter = null;
    
    this._exhibit = null;
};

Exhibit.OrderedViewFrame.prototype._configureOrders = function(orders) {
    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        var expr;
        var ascending = true;
        
        if (typeof order == "string") {
            expr = order;
        } else {
            expr = order.expression,
            ascending = ("ascending" in order) ? (order.ascending) : true;
        }
        
        var expression = Exhibit.Expression.parse(expr);
        if (expression.isPath()) {
            var path = expression.getPath();
            if (path.getSegmentCount() == 1) {
                var segment = path.getSegment(0);
                this._orders.push({
                    property:   segment.property,
                    forward:    segment.forward,
                    ascending:  ascending
                });
            }
        }
    }
};

Exhibit.OrderedViewFrame.prototype._configurePossibleOrders = function(possibleOrders) {
    var hasLabel = false;
    for (var i = 0; i < possibleOrders.length; i++) {
        var order = possibleOrders[i];
        var expr;
        var ascending = true;
        
        if (typeof order == "string") {
            expr = order;
        } else {
            expr = order.expression,
            ascending = ("ascending" in order) ? (order.ascending) : true;
        }
        
        var expression = Exhibit.Expression.parse(expr);
        if (expression.isPath()) {
            var path = expression.getPath();
            if (path.getSegmentCount() == 1) {
                var segment = path.getSegment(0);
                this._possibleOrders.push({
                    property:   segment.property,
                    forward:    segment.forward,
                    ascending:  ascending
                });
                
                if (segment.property == "label" && segment.forward) {
                    hasLabel = true;
                }
            }
        }
    }
    
    if (!hasLabel) {
        this._possibleOrders.push({ 
            property:   "label", 
            forward:    true, 
            ascending:  true 
        });
    }
};

Exhibit.OrderedViewFrame.prototype._initializeUI = function() {
    this._divHeader.innerHTML = "";
    this._divFooter.innerHTML = "";
    
    var self = this;
    this._headerDom = Exhibit.OrderedViewFrame.theme.createHeaderDom(
        this._exhibit, 
        this._divHeader, 
        function(elmt, evt, target) {
            self._exhibit.getViewPanel().resetBrowseQuery();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        },
        function(elmt, evt, target) {
            self._openSortPopup(elmt, -1);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    );
    this._footerDom = Exhibit.OrderedViewFrame.theme.createFooterDom(
        this._exhibit, 
        this._divFooter, 
        function(elmt, evt, target) {
            self._setShowAll(true);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        },
        function(elmt, evt, target) {
            self._setShowAll(false);
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
    var items = [];
    var originalSize = 0;
    if (collection != null) {
        var currentSet = collection.getCurrentSet();
        currentSet.visit(function(itemID) { items.push({ id: itemID, sortKeys: [] }); });
        originalSize = collection.originalSize();
    }
    
    /*
     *  Set the header UI
     */
    this._headerDom.setCounts(items.length, originalSize);
    this._footerDom.setCounts(items.length, this._initialCount, this._showAll);
    
    if (items.length > 0) {
        this._headerDom.setTypes(database.getTypeLabels(currentSet)[items.length > 1 ? 1 : 0]);
        
        /*
         *  Sort the items
         */
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
         *  Detect how deep we need to group
         */
        var checkGroupingLevel = function(level, start, end) {
            var result = -1;
            if (level < orders.length) {
                var sortKey = items[start].sortKeys[level];
                var i = start + 1;
                
                while (i < end) {
                    var item = items[i];
                    var itemSortKey = item.sortKeys[level];
                    
                    if (itemSortKey != sortKey) {
                        if (i - start > 1) {
                            result = Math.max(result, Math.max(level, checkGroupingLevel(level + 1, start, i)));
                        }
                        sortKey = itemSortKey;
                        start = i;
                    }
                    i++;
                }
                
                if (i - start > 1) {
                    result = Math.max(result, Math.max(level, checkGroupingLevel(level + 1, start, i)));
                }
            }
            return result;
        }
        var groupLevels = checkGroupingLevel(0, 0, items.length) + 1;
        
        /*
         *  Generate item views
         */
        var sortKeys = [];
        for (var i = 0; i < orders.length; i++) {
            sortKeys.push(null);
        }
        
        var max = this._showAll ? items.length : Math.min(items.length, this._initialCount);
        for (var i = 0; i < max; i++) {
            var item = items[i];
            
            var g = 0;
            while (g < groupLevels && item.sortKeys[g] == sortKeys[g]) {
                g++;
            }
            
            while (g < groupLevels) {
                sortKeys[g] = item.sortKeys[g];
                
                this.onNewGroup(sortKeys[g], orders[g].keyType, g);
                
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
    }
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
                var valueItem = database.getObject(item.id, property);
                var value = valueItem == null ? null : database.getObject(valueItem, "label");
                item.sortKeys.push(value == null ? Exhibit.l10n.missingSortKey : value);
            }
        } else if (valueType == "number") {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var value = database.getObject(item.id, property);
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
                var value = database.getObject(item.id, property);
                if (value != null && value instanceof Date) {
                    value = value.getTime();
                } else {
                    try {
                        value = SimileAjax.DateTime.parseIso8601DateTime(value).getTime();
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
                var value = database.getObject(item.id, property);
                item.sortKeys.push(value == null ? Exhibit.l10n.missingSortKey : value);
            }
        }
    } else {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var valueItem = database.getSubject(item.id, property);
            var value = valueItem == null ? null : database.getObject(valueItem, "label");
            item.sortKeys.push(value == null ? Exhibit.l10n.missingSortKey : value);
        }
    }
    
    return textFunction;
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
        uiLayer: SimileAjax.WindowManager.getBaseLayer(),
        lengthy: true
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
        uiLayer: SimileAjax.WindowManager.getBaseLayer(),
        lengthy: true
    });
};

Exhibit.OrderedViewFrame.prototype._setShowAll = function(showAll) {
    this._showAll = showAll;
    this.parentReconstruct();
};
