/*==================================================
 *  Exhibit.TabularView
 *==================================================
 */

Exhibit.TabularView = function(exhibit, div, configuration, globalConfiguration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    this._globalConfiguration = globalConfiguration;
    
    this._initialCount = 10;
    this._showAll = true;
    this._sortColumn = 0;
    this._sortAscending = true;
    this._rowStyler = null;
    
    if (configuration != null) {
        if ("columns" in configuration) {
            this._columns = [];
            
            var columns = configuration.columns;
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                var expr;
                var styler = null;
                var label = null;
                var format = null;
                
                if (typeof column == "string") {
                    expr = column;
                } else {
                    expr = column.expression;
                    styler = column.styler;
                    label = column.label;
                    format = column.format;
                }
                
                var expression = Exhibit.Expression.parse(expr);
                if (expression.isPath()) {
                    var path = expression.getPath();
                    if (path.getSegmentCount() == 1) {
                        var segment = path.getSegment(0);
                        
                        if (format == null) {
                            format = "list";
                        }

                        this._columns.push({
                            property:   segment.property,
                            forward:    segment.forward,
                            styler:     styler,
                            label:      label,
                            format:     format
                        });
                    }
                }
            }
        }
        
        if ("sortColumn" in configuration) {
            this._sortColumn = configuration.sortColumn;
        }
        if ("sortAscending" in configuration) {
            this._sortAscending = (configuration.sortAscending);
        }
        
        if ("initialCount" in configuration) {
            this._initialCount = configuration.initialCount;
        }
        if ("showAll" in configuration) {
            this._showAll = configuration.showAll;
        }
        
        if ("rowStyler" in configuration) {
            this._rowStyler = configuration.rowStyler;
        }
    }
    if (this._columns.length == 0) {
        this._columns.push(
            {   property:   "label",
                forward:    true,
                styler:     null,
                label:      exhibit.getDatabase().getProperty("label").getLabel(),
                format:     "list"
            }
        );
    }
    this._sortColumn = Math.max(0, Math.min(this._sortColumn, this._columns.length - 1));
    
    this._initializeUI();
    
    var view = this;
    this._listener = { 
        onChange: function(handlerName) { 
            if (handlerName != "onGroup" && handlerName != "onUngroup") {
                view._reconstruct(); 
            }
        } 
    };
    this._exhibit.getBrowseEngine().addListener(this._listener);
};

Exhibit.TabularView.prototype.dispose = function() {
    this._exhibit.getBrowseEngine().removeListener(this._listener);
    
    this._div.innerHTML = "";
    
    this._dom = null;
    this._div = null;
    this._exhibit = null;
};

Exhibit.TabularView.prototype._initializeUI = function() {
    var self = this;
    
    this._div.innerHTML = "";
    this._dom = Exhibit.TabularView.theme.createDom(
        this._exhibit, 
        this._div, 
        function(elmt, evt, target) {
            self._reset();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    );
    
    this._reconstruct();
};

Exhibit.TabularView.prototype._reconstruct = function() {
    var self = this;
    var exhibit = this._exhibit;
    var database = exhibit.getDatabase();
    
    var bodyDiv = this._dom.bodyDiv;
    bodyDiv.innerHTML = "";

    /*
     *  Get the current collection and check if it's empty
     */
    var collection = exhibit.getBrowseEngine().getCurrentCollection();
    var items = [];
    var originalSize = 0;
    if (collection != null) {
        var currentSet = collection.getCurrentSet();
        currentSet.visit(function(itemID) { items.push({ id: itemID, sortKey: "" }); });
        originalSize = collection.originalSize();
    }
    
    /*
     *  Set the header UI
     */
    this._dom.setCounts(items.length, originalSize);
    
    if (items.length > 0) {
        this._dom.setTypes(database.getTypeLabels(currentSet)[items.length > 1 ? 1 : 0]);
        
        /*
         *  Sort the items
         */
        var sortColumn = this._columns[this._sortColumn];
        items.sort(this._createSortFunction(
            items, sortColumn.property, sortColumn.forward, this._sortAscending));
    
        var table = document.createElement("table");
        table.cellPadding = 5;
        table.border = 1;
        
        /*
         *  Create the column headers
         */
        var th = table.createTHead();
        var tr = th.insertRow(0);
        var createColumnHeader = function(i) {
            var column = self._columns[i];
            if (column.label == null) {
                var property = database.getProperty(column.property);
                column.label = column.forward ? property.getLabel() : property.getReverseLabel();
            }
            
            var td = document.createElement("th");
            Exhibit.TabularView.theme.createColumnHeader(
                exhibit, td, column.label, i == self._sortColumn, self._sortAscending,
                function(elmt, evt, target) {
                    self._doSort(i);
                    SimileAjax.DOM.cancelEvent(evt);
                    return false;
                }
            );
                
            tr.appendChild(td);
        };
        for (var i = 0; i < this._columns.length; i++) {
            createColumnHeader(i);
        }
        
        /*
         *  Create item rows
         */
        var max = this._showAll ? items.length : Math.min(items.length, this._initialCount);
        for (var i = 0; i < max; i++) {
            var item = items[i];
            tr = table.insertRow(i + 1);
            
            if (this._rowStyler != null) {
                this._rowStyler(item.id, database, tr);
            }
            
            for (var c = 0; c < this._columns.length; c++) {
                var column = this._columns[c];
                var property = database.getProperty(column.property);
                var td = tr.insertCell(c);
                
                var values = column.forward ? 
                    database.getObjects(item.id, column.property) :
                    database.getSubjects(item.id, column.property);
                var valueType = column.forward ?
                    property.getValueType() :
                    "item";
                    
                switch (column.format) {
                case "image":
                    values.visit(function(url) {
                        var img = document.createElement("img");
                        img.src = url;
                        td.appendChild(img);
                    });
                    break;
                default:
                    Exhibit.TabularView._constructDefaultValueList(values, valueType, td, exhibit);
                }
                
                if (column.styler != null) {
                    column.styler(item.id, database, td);
                }
            }
        }
        
        bodyDiv.appendChild(table);
    }
};

Exhibit.TabularView.prototype._createSortFunction = function(items, property, forward, ascending) {
    var database = this._exhibit.getDatabase();
    var multiply = ascending ? 1 : -1;
    
    var numericFunction = function(item1, item2) {
        return multiply * (item1.sortKey - item2.sortKey);
    };
    var textFunction = function(item1, item2) {
        return multiply * item1.sortKey.localeCompare(item2.sortKey);
    };
    
    if (forward) {
        var valueType = database.getProperty(property).getValueType();
        
        if (valueType == "item") {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var valueItem = database.getObject(item.id, property);
                var value = (valueItem == null) ? null : database.getObject(valueItem, "label");
                item.sortKey = (value == null) ? Exhibit.l10n.missingSortKey : value;
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
                item.sortKey = value;
            }
            
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
                item.sortKey = value;
            }
            
            return numericFunction;
        } else {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var value = database.getObject(item.id, property);
                item.sortKey = (value == null) ? Exhibit.l10n.missingSortKey : value;
            }
        }
    } else {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var valueItem = database.getSubject(item.id, property);
            var value = valueItem == null ? null : database.getObject(valueItem, "label");
            item.sortKey = (value == null) ? Exhibit.l10n.missingSortKey : value;
        }
    }
    
    return textFunction;
};

Exhibit.TabularView.prototype._reset = function() {
    var state = {};
    var browseEngine = this._exhibit.getBrowseEngine();
    SimileAjax.History.addAction({
        perform: function() {
            state.restrictions = browseEngine.clearRestrictions();
        },
        undo: function() {
            browseEngine.applyRestrictions(state.restrictions);
        },
        label: Exhibit.TabularView.l10n.resetActionTitle,
        uiLayer: SimileAjax.WindowManager.getBaseLayer()
    });
};

Exhibit.TabularView.prototype._doSort = function(columnIndex) {
    var oldSortColumn = this._sortColumn;
    var oldSortAscending = this._sortAscending;
    var newSortColumn = columnIndex;
    var newSortAscending = oldSortColumn == newSortColumn ? !oldSortAscending : true;
    
    var self = this;
    SimileAjax.History.addAction({
        perform: function() {
            self._sortColumn = newSortColumn;
            self._sortAscending = newSortAscending;
            self._reconstruct();
        },
        undo: function() {
            self._sortColumn = oldSortColumn;
            self._sortAscending = oldSortAscending;
            self._reconstruct();
        },
        label: Exhibit.TabularView.l10n.makeSortActionTitle(this._columns[columnIndex].label, newSortAscending),
        uiLayer: SimileAjax.WindowManager.getBaseLayer()
    });
};

Exhibit.TabularView._constructDefaultValueList = function(values, valueType, parentElmt, exhibit) {
    var processOneValue = (valueType == "item") ?
        function(value) {
            addDelimiter();
            parentElmt.appendChild(exhibit.makeItemSpan(value));
        } :
        function(value) {
            addDelimiter();
            parentElmt.appendChild(exhibit.makeValueSpan(value, valueType));
        };
        
    var addDelimiter = Exhibit.l10n.createListDelimiter(parentElmt, values.size());
    values.visit(processOneValue);
    addDelimiter();
};
