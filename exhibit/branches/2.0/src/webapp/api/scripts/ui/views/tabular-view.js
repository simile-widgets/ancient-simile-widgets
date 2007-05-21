/*==================================================
 *  Exhibit.TabularView
 *==================================================
 */

Exhibit.TabularView = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;
    
    this._initialCount = 10;
    this._showAll = true;
    
    this._columns = [];
    this._sortColumn = 0;
    this._sortAscending = true;
    this._rowStyler = null;
    this._tableStyler = null;

    var view = this;
    this._listener = { 
        onItemsChanged: function() {
            view._reconstruct(); 
        }
    };
    uiContext.getCollection().addListener(this._listener);
};

Exhibit.TabularView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.TabularView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    Exhibit.TabularView._configure(view, configuration);
    
    view._internalValidate();
    view._initializeUI();
    return view;
};

Exhibit.TabularView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var view = new Exhibit.TabularView(
        containerElmt != null ? containerElmt : configElmt, 
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    
    try {
        var expressions = [];
        var labels = Exhibit.getAttribute(configElmt, "columnLabels", ",") || [];
        var formats = Exhibit.getAttribute(configElmt, "columnFormats", ",") || [];
        
        var s = Exhibit.getAttribute(configElmt, "columns");
        if (s != null && s.length > 0) {
            expressions = Exhibit.Expression.parseSeveral(s);
        }
        
        for (var i = 0; i < expressions.length; i++) {
            var expression = expressions[i];
            var format = formats[i];
            if (format == null) {
                format = "list";
            }
            view._columns.push({
                expression: expression,
                styler:     null,
                label:      labels[i],
                format:     format
            });
        }
    } catch (e) {
        SimileAjax.Debug.exception(e, "TabularView: Error processing configuration of tabular view");
    }
    
    var s = Exhibit.getAttribute(configElmt, "sortColumn");
    if (s != null && s.length > 0) {
        view._sortColumn = parseInt(s);
    }
    s = Exhibit.getAttribute(configElmt, "sortAscending");
    if (s != null && s.length > 0) {
        view._sortAscending = (s == "true");
    }
    s = Exhibit.getAttribute(configElmt, "initialCount");
    if (s != null && s.length > 0) {
        view._initialCount = parseInt(s);
    }
    s = Exhibit.getAttribute(configElmt, "showAll");
    if (s != null && s.length > 0) {
        view._showAll = (s == "true");
    }
    s = Exhibit.getAttribute(configElmt, "rowStyler");
    if (s != null && s.length > 0) {
        var f = eval(s);
        if (typeof f == "function") {
            view._rowStyler = f;
        }
    }
    s = Exhibit.getAttribute(configElmt, "tableStyler");
    if (s != null && s.length > 0) {
        f = eval(s);
        if (typeof f == "function") {
            view._tableStyler = f;
        }
    }
        
    Exhibit.TabularView._configure(view, configuration);
    view._internalValidate();
    view._initializeUI();
    return view;
};

Exhibit.TabularView._configure = function(view, configuration) {
    if ("columns" in configuration) {
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
                if (format == null) {
                    format = "list";
                }
                view._columns.push({
                    expression: expression,
                    styler:     styler,
                    label:      label,
                    format:     format
                });
            }
        }
    }
    
    if ("sortColumn" in configuration) {
        view._sortColumn = configuration.sortColumn;
    }
    if ("sortAscending" in configuration) {
        view._sortAscending = (configuration.sortAscending);
    }
    
    if ("initialCount" in configuration) {
        view._initialCount = configuration.initialCount;
    }
    if ("showAll" in configuration) {
        view._showAll = configuration.showAll;
    }
    if ("rowStyler" in configuration) {
        view._rowStyler = configuration.rowStyler;
    }
    if ("tableStyler" in configuration) {
        view._tableStyler = configuration.tableStyler;
    }
};

Exhibit.TabularView.prototype._internalValidate = function() {
    if (this._columns.length == 0) {
        var database = this._uiContext.getDatabase();
        var propertyIDs = database.getAllProperties();
        for (var i = 0; i < propertyIDs.length; i++) {
            var propertyID = propertyIDs[i];
            if (propertyID != "uri") {
                this._columns.push(
                    {   expression: Exhibit.Expression.parse("." + propertyID),
                        styler:     null,
                        label:      database.getProperty(propertyID).getLabel(),
                        format:     "list"
                    }
                );
            }
        }
    }
    this._sortColumn = Math.max(0, Math.min(this._sortColumn, this._columns.length - 1));
};

Exhibit.TabularView.prototype.dispose = function() {
    this._uiContext.getCollection().removeListener(this._listener);
    
    this._toolboxWidget.dispose();
    this._toolboxWidget = null;
    
    this._collectionSummaryWidget.dispose();
    this._collectionSummaryWidget = null;
    
    this._uiContext.dispose();
    this._uiContext = null;
    
    this._div.innerHTML = "";
    
    this._dom = null;
    this._div = null;
};

Exhibit.TabularView.prototype._initializeUI = function() {
    var self = this;
    
    this._div.innerHTML = "";
    this._dom = Exhibit.TabularView.createDom(this._div);
    this._collectionSummaryWidget = Exhibit.CollectionSummaryWidget.create(
        {}, 
        this._dom.collectionSummaryDiv, 
        this._uiContext
    );
    this._toolboxWidget = Exhibit.ToolboxWidget.createFromDOM(this._div, this._div, this._uiContext);
    
    this._reconstruct();
};

Exhibit.TabularView.prototype._reconstruct = function() {
    var self = this;
    var collection = this._uiContext.getCollection();
    var database = this._uiContext.getDatabase();
    
    var bodyDiv = this._dom.bodyDiv;
    bodyDiv.innerHTML = "";

    /*
     *  Get the current collection and check if it's empty
     */
    var items = [];
    var originalSize = collection.countAllItems();
    if (originalSize > 0) {
        var currentSet = collection.getRestrictedItems();
        currentSet.visit(function(itemID) { items.push({ id: itemID, sortKey: "" }); });
    }
    
    /*
     *  Set the header UI
     */
    if (items.length > 0) {
        /*
         *  Sort the items
         */
        var sortColumn = this._columns[this._sortColumn];
        items.sort(this._createSortFunction(items, sortColumn.expression, this._sortAscending));
    
        var table = document.createElement("table");
        table.cellPadding = 5;
        table.border = 1;
        if (this._tableStyler != null) {
            this._tableStyler(table, database);
        }

        /*
         *  Create item rows
         */
        var max = this._showAll ? items.length : Math.min(items.length, this._initialCount);
        for (var i = 0; i < max; i++) {
            var item = items[i];
            var tr = table.insertRow(i);
            
            if (this._rowStyler != null) {
                this._rowStyler(item.id, database, tr, i);
            }
            
            for (var c = 0; c < this._columns.length; c++) {
                var column = this._columns[c];
                var td = tr.insertCell(c);
                
                var results = column.expression.evaluate(
                    { "value" : item.id }, 
                    { "value" : "item" }, 
                    "value",
                    database
                );

                switch (column.format) {
                case "image":
                    results.values.visit(function(url) {
                        var img = document.createElement("img");
                        img.src = url;
                        td.appendChild(img);
                    });
                    break;
                default:
                    Exhibit.TabularView._constructDefaultValueList(
                        results.values, results.valueType, td, this._uiContext);
                }
                
                if (column.styler != null) {
                    column.styler(item.id, database, td);
                }
            }
        }

        /*
         *  Create the column headers
         */
        var th = table.createTHead();
        tr = th.insertRow(0);
        var createColumnHeader = function(i) {
            var column = self._columns[i];
            if (column.label == null) {
                column.label = self._getColumnLabel(column.expression);
            }
	    var colgroup = document.createElement("colgroup");
	    colgroup.className = column.label;
	    table.appendChild(colgroup);

            var td = document.createElement("th");
            Exhibit.TabularView.createColumnHeader(
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

        bodyDiv.appendChild(table);
    }
};

Exhibit.TabularView.prototype._getColumnLabel = function(expression) {
    var database = this._uiContext.getDatabase();
    var path = expression.getPath();
    var segment = path.getSegment(path.getSegmentCount() - 1);
    var propertyID = segment.property;
    var property = database.getProperty(propertyID);
    if (property != null) {
        return segment.forward ? property.getLabel() : property.getReverseLabel();
    } else {
        return propertyID;
    }
};

Exhibit.TabularView.prototype._createSortFunction = function(items, expression, ascending) {
    var database = this._uiContext.getDatabase();
    var multiply = ascending ? 1 : -1;
    
    var numericFunction = function(item1, item2) {
        return multiply * (item1.sortKey - item2.sortKey);
    };
    var textFunction = function(item1, item2) {
        return multiply * item1.sortKey.localeCompare(item2.sortKey);
    };
    
    var valueTypes = [];
    var valueTypeMap = {};
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var r = expression.evaluate(
            { "value" : item.id }, 
            { "value" : "item" }, 
            "value",
            database
        );
        r.values.visit(function(value) {
            item.sortKey = value;
        });
        
        if (!(r.valueType in valueTypeMap)) {
            valueTypeMap[r.valueType] = true;
            valueTypes.push(r.valueType);
        }
    }
    
    var coercedValueType = "text"
    if (valueTypes.length == 1) {
        coercedValueType = valueTypes[0];
    } else {
        coercedValueType = "text";
    }
    
    var coersion;
    var sortingFunction;
    if (coercedValueType == "number") {
        sortingFunction = numericFunction;
        coersion = function(v) {
            if (v == null) {
                return Number.NEGATIVE_INFINITY;
            } else if (typeof v == "number") {
                return v;
            } else {
                var n = parseFloat(v);
                if (isNaN(n)) {
                    return Number.NEGATIVE_INFINITY;
                } else {
                    return n;
                }
            }
        }
    } else if (coercedValueType == "date") {
        sortingFunction = numericFunction;
        coersion = function(v) {
            if (v == null) {
                return Number.NEGATIVE_INFINITY;
            } else if (v instanceof Date) {
                return v.getTime();
            } else {
                try {
                    return SimileAjax.DateTime.parseIso8601DateTime(v).getTime();
                } catch (e) {
                    return Number.NEGATIVE_INFINITY;
                }
            }
        }
    } else if (coercedValueType == "boolean") {
        sortingFunction = numericFunction;
        coersion = function(v) {
            if (v == null) {
                return Number.NEGATIVE_INFINITY;
            } else if (typeof v == "boolean") {
                return v ? 1 : 0;
            } else {
                return v.toString().toLowerCase() == "true";
            }
        }
    } else if (coercedValueType == "item") {
        sortingFunction = textFunction;
        coersion = function(v) {
            if (v == null) {
                return Exhibit.l10n.missingSortKey;
            } else {
                var label = database.getObject(v, "label");
                return (label == null) ? v : label;
            }
        }
    } else {
        sortingFunction = textFunction;
        coersion = function(v) {
            if (v == null) {
                return Exhibit.l10n.missingSortKey;
            } else {
                return v.toString();
            }
        }
    }
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        item.sortKey = coersion(item.sortKey);
    }
    
    return sortingFunction;
};

Exhibit.TabularView.prototype._doSort = function(columnIndex) {
    var oldSortColumn = this._sortColumn;
    var oldSortAscending = this._sortAscending;
    var newSortColumn = columnIndex;
    var newSortAscending = oldSortColumn == newSortColumn ? !oldSortAscending : true;
    
    var self = this;
    SimileAjax.History.addLengthyAction(
        function() {
            self._sortColumn = newSortColumn;
            self._sortAscending = newSortAscending;
            self._reconstruct();
        },
        function() {
            self._sortColumn = oldSortColumn;
            self._sortAscending = oldSortAscending;
            self._reconstruct();
        },
        Exhibit.TabularView.l10n.makeSortActionTitle(this._columns[columnIndex].label, newSortAscending)
    );
};

Exhibit.TabularView._constructDefaultValueList = function(values, valueType, parentElmt, uiContext) {
    var processOneValue = (valueType == "item") ?
        function(value) {
            addDelimiter();
            parentElmt.appendChild(Exhibit.UI.makeItemSpan(value, null, uiContext));
        } :
        function(value) {
            addDelimiter();
            parentElmt.appendChild(Exhibit.UI.makeValueSpan(value, valueType));
        };
        
    var addDelimiter = Exhibit.l10n.createListDelimiter(parentElmt, values.size());
    values.visit(processOneValue);
    addDelimiter();
};

Exhibit.TabularView.createDom = function(div) {
    var l10n = Exhibit.TabularView.l10n;
    var headerTemplate = {
        elmt:       div,
        className:  "exhibit-collectionView-header",
        children: [
            {   tag:    "div",
                field:  "collectionSummaryDiv"
            },
            {   tag:    "div",
                field:  "bodyDiv"
            }
        ]
    };
    return SimileAjax.DOM.createDOMFromTemplate(headerTemplate);
};

Exhibit.TabularView.createColumnHeader = function(
    exhibit, 
    th,
    label,
    sort,
    sortAscending,
    sortFunction
) {
    var l10n = Exhibit.TabularView.l10n;
    var template = {
        elmt:       th,
        className:  sort ? 
                    "exhibit-tabularView-columnHeader-sorted" : 
                    "exhibit-tabularView-columnHeader",
        title: sort ? l10n.columnHeaderReSortTooltip : l10n.columnHeaderSortTooltip,
        children: [ label ]
    };
    if (sort) {
        template.children.push({
            elmt: Exhibit.UI.createTranslucentImage(
                sortAscending ? "images/up-arrow.png" : "images/down-arrow.png")
        });
    }
    SimileAjax.WindowManager.registerEvent(th, "click", sortFunction, null);
    
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
    return dom;
};