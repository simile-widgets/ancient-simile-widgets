/*==================================================
 *  Exhibit.PivotTableView
 *==================================================
 */
Exhibit.PivotTableView = function(collection, containerElmt, lensRegistry, exhibit) {
    this._collection = collection;
    this._div = containerElmt;
    this._lensRegistry = lensRegistry;
    this._exhibit = exhibit;

    this._rowPath = null;
    this._columnPath = null;
    this._cellExpression = null;
    
    this._settings = {};

    var view = this;
    this._listener = { 
        onItemsChanged: function() {
            view._reconstruct(); 
        }
    };
    collection.addListener(this._listener);
};

Exhibit.PivotTableView.create = function(configuration, containerElmt, lensRegistry, exhibit) {
    var collection = Exhibit.Collection.getCollection(configuration, exhibit);
    var lensRegistry2 = Exhibit.Component.createLensRegistry(configuration, lensRegistry);
    var view = new Exhibit.PivotTableView(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        lensRegistry2, 
        exhibit
    );
    
    Exhibit.PivotTableView._configure(view, configuration);
    
    view._initializeUI();
    return view;
};

Exhibit.PivotTableView.createFromDOM = function(configElmt, containerElmt, lensRegistry, exhibit) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var collection = Exhibit.Collection.getCollectionFromDOM(configElmt, configuration, exhibit);
    var lensRegistry2 = Exhibit.Component.createLensRegistryFromDOM(configElmt, configuration, lensRegistry);
    var view = new Exhibit.PivotTableView(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        lensRegistry2, 
        exhibit
    );
    
    view._columnPath = Exhibit.PivotTableView._parsePath(Exhibit.getAttribute(configElmt, "column"));
    view._rowPath = Exhibit.PivotTableView._parsePath(Exhibit.getAttribute(configElmt, "row"));
    view._cellExpression = Exhibit.PivotTableView._parseExpression(Exhibit.getAttribute(configElmt, "cell"));
    
    view._initializeUI();
    return view;
};

Exhibit.PivotTableView._configure = function(view, configuration) {
    view._columnPath = Exhibit.PivotTableView._parsePath(configuration.column);
    view._rowPath = Exhibit.PivotTableView._parsePath(configuration.row);
    view._cellExpression = Exhibit.PivotTableView._parseExpression(configuration.cell);
};

Exhibit.PivotTableView._parseExpression = function(s) {
    try {
        return Exhibit.Expression.parse(s);
    } catch (e) {
        SimileAjax.Debug.exception("Error parsing expression " + s, e);
    }
    return null;
};

Exhibit.PivotTableView._parsePath = function(s) {
    try {
        var expression = Exhibit.Expression.parse(s);
        if (expression.isPath()) {
            return expression.getPath();
        } else {
            SimileAjax.Debug.log("Expecting a path but got a full expression: " + s);
        }
    } catch (e) {
        SimileAjax.Debug.exception("Error parsing expression " + s, e);
    }
    return null;
};

Exhibit.PivotTableView.prototype.dispose = function() {
    this._collection.removeListener(this._listener);
    
    this._div.innerHTML = "";
    
    this._dom = null;
    this._div = null;
    this._collection = null;
    this._exhibit = null;
};

Exhibit.PivotTableView.prototype._initializeUI = function() {
    var self = this;
    
    this._div.innerHTML = "";
    this._dom = Exhibit.PivotTableView.theme.constructDom(
        this._collection,
        this._exhibit, 
        this._div, 
        function(elmt, evt, target) {
            Exhibit.ViewPanel.resetCollection(self._collection);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    );
    
    this._reconstruct();
};

Exhibit.PivotTableView.prototype._reconstruct = function() {
    this._dom.tableContainer.innerHTML = "";
    
    var originalSize = this._collection.countAllItems();
    var currentSize = this._collection.countRestrictedItems();
    
    if (currentSize > 0) {
        var currentSet = this._collection.getRestrictedItems();
        if (this._columnPath != null && this._rowPath != null && this._cellExpression != null) {
            this._makeTable(currentSet);
        }
        this._dom.setTypes(this._exhibit.getDatabase().getTypeLabels(currentSet)[currentSize > 1 ? 1 : 0]);
    }
    this._dom.setCounts(currentSize, originalSize);
};

Exhibit.PivotTableView.prototype._makeTable = function(items) {
    var self = this;
    var exhibit = this._exhibit;
    var database = exhibit.getDatabase();
    
    var rowResults = this._rowPath.walkForward(items, "item", database);
    var columnResults = this._columnPath.walkForward(items, "item", database);
    
    var rowValues = Exhibit.PivotTableView._sortValues(rowResults.values);
    var columnValues = Exhibit.PivotTableView._sortValues(columnResults.values);
    
    var rowCount = rowValues.length;
    var columnCount = columnValues.length;
    
    var evenColor = "#eee";
    var oddColor = "#fff";
    
    var table = document.createElement("table");
    table.cellPadding = 2;
    table.cellSpacing = 0;
    
    var rowToInsert = 0;
    var tr, td;
    
    for (var c = 0; c < columnCount; c++) {
        var cellToInsert = 0;
        
        tr = table.insertRow(rowToInsert++);
        
        td = tr.insertCell(cellToInsert++); // empty horizontal cell
        
        if (c > 0) {
            td = tr.insertCell(cellToInsert++);
            td.rowSpan = columnCount - c + 1;
            td.style.backgroundColor = (c % 2) == 0 ? oddColor : evenColor;
            td.innerHTML = "\u00a0";
        }
        
        td = tr.insertCell(cellToInsert++);
        td.colSpan = columnCount - c + 1;
        td.style.backgroundColor = (c % 2) == 1 ? oddColor : evenColor;
        td.innerHTML = columnValues[c].label;
    }
    
    tr = table.insertRow(rowToInsert++);
    td = tr.insertCell(0);
    td = tr.insertCell(1);
    td.style.backgroundColor = (columnCount % 2) == 0 ? oddColor : evenColor;
    td.innerHTML = "\u00a0";
    td = tr.insertCell(2);
    
    for (var r = 0; r < rowCount; r++) {
        var cellToInsert = 0;
        var rowPair = rowValues[r];
        var rowValue = rowPair.value;
        
        tr = table.insertRow(rowToInsert++);
        
        td = tr.insertCell(cellToInsert++);
        td.innerHTML = rowValues[r].label;
        td.style.borderBottom = "1px solid #aaa";
        
        var rowItems = this._rowPath.evaluateBackward(rowValue, rowResults.valueType, items, database).values;
        for (var c = 0; c < columnCount; c++) {
            var columnPair = columnValues[c];
            var columnValue = columnPair.value;
            
            td = tr.insertCell(cellToInsert++);
            td.style.backgroundColor = (c % 2) == 1 ? oddColor : evenColor;
            td.style.borderBottom = "1px solid #ccc";
            td.title = rowPair.label + " / " + columnPair.label;
            
            var cellItemResults = this._columnPath.evaluateBackward(columnValue, columnResults.valueType, rowItems, database);
            var cellResults = this._cellExpression.evaluate(
                { "value" : cellItemResults.values },
                { "value" : cellItemResults.valueType },
                "value",
                database
            );
            
            if (cellResults.valueType == "number" && cellResults.values.size() == 1) {
                cellResults.values.visit(function(v) {
                    if (v != 0) {
                        td.appendChild(document.createTextNode(v));
                    } else {
                        td.appendChild(document.createTextNode("\u00a0"));
                    }
                });
            } else {
                var first = true;
                cellResults.values.visit(function(v) {
                    if (first) {
                        first = false;
                    } else {
                        td.appendChild(document.createTextNode(", "));
                    }
                    td.appendChild(document.createTextNode(v));
                });
            }
        }
    }

    this._dom.tableContainer.appendChild(table);
};

Exhibit.PivotTableView._sortValues = function(values, valueType, database) {
    var a = [];
    values.visit(valueType == "item" ?
        function(v) {
            var label = database.getObject(v, "label");
            a.push({
                value: v,
                label: label != null ? label : v
            });
        } :
        function(v) {
            a.push({
                value: v,
                label: v
            });
        }
    );
    a.sort(function(o1, o2) {
        var c = o1.label.localeCompare(o2.label);
        return c != null ? c : o1.value.localeCompare(o2.value);
    });
    return a;
};

Exhibit.PivotTableView.prototype._openPopup = function(elmt, items) {
    var coords = SimileAjax.DOM.getPageCoordinates(elmt);
    var bubble = SimileAjax.Graphics.createBubbleForPoint(
        document, 
        coords.left + Math.round(elmt.offsetWidth / 2), 
        coords.top + Math.round(elmt.offsetHeight / 2), 
        400, // px
        300  // px
    );
    
    if (items.length > 1) {
        var ul = document.createElement("ul");
        for (var i = 0; i < items.length; i++) {
            var li = document.createElement("li");
            li.appendChild(Exhibit.UI.makeItemSpan(items[i], null, null, this._lensRegistry, this._exhibit));
            ul.appendChild(li);
        }
        bubble.content.appendChild(ul);
    } else {
        var itemLensDiv = document.createElement("div");
        var itemLens = this._lensRegistry.createLens(items[0], itemLensDiv, this._exhibit);
        bubble.content.appendChild(itemLensDiv);
    }
};
