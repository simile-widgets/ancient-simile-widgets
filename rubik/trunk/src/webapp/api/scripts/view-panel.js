/*==================================================
 *  Rubik.ViewPanel
 *==================================================
 */
 
Rubik.ViewPanel = function(rubik, viewDiv, configuration) {
    this._rubik = rubik;
    this._database = rubik.getDatabase();
    this._browseEngine = rubik.getBrowseEngine();
    this._viewDiv = viewDiv;
    this._view = "tile";
    
    this._showProperties = [];
    if (configuration != null) {
        if ("properties" in configuration) {
            var entries = configuration.properties;
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
                this._showProperties.push(sp);
            }
        }
        if ("sliding" in configuration && configuration.sliding) {
            this._supportSliding = true;
        }
    }
    
    this._groupingProperty = "";
    
    var viewPanel = this;
    var reconstruct = function() { viewPanel._reconstruct(); };
    this._browseEngine.addListener({
        onRootCollectionSet: reconstruct,
        onRestrict: reconstruct
    });
    
    //this._reconstruct();
}

Rubik.ViewPanel.prototype._reconstruct = function() {
    if (this._view == "tabular") {
        this._reconstructItemPaneAsTable();
    } else {
        this._reconstructItemPaneAsTiles();
    }
}

Rubik.ViewPanel.prototype._reconstructItemPaneAsTiles = function() {
    var items = [];
    var browser = this;
    var collection = this._browseEngine.getCurrentCollection();
    var currentSet = collection.getCurrentSet();
    currentSet.visit(function(o) {
        items.push({ uri: o, label: browser._database.getLiteralProperty(o, "label") });
    });
    items.sort(function(a, b) {
        return a.label.localeCompare(b.label);
    });
    
    Rubik.ViewPanel._itemCount = items.length;
    
    var itemPaneHeader = document.getElementById("item-pane-header");
    itemPaneHeader.innerHTML = "";
    itemPaneHeader.appendChild(document.createTextNode(
        items.length + " " + 
        this._database.getTypeLabels(currentSet)[items.length > 1 ? 1 : 0].join(", ")
    ));
    
    var originalSize = collection.originalSize();
    if (originalSize > items.length) {
        var filterInfoSpan = document.createElement("span");
        filterInfoSpan.className = "filter-info";
        filterInfoSpan.innerHTML = "(filtered from " + 
            "<a href='javascript:void' onclick='Rubik.ViewPanel._performClearingFilters(); return false;'>" + originalSize + " " +
            this._database.getTypeLabels(collection.getOriginalSet())[originalSize > 1 ? 1 : 0].join(", ") +
            "</a> originally)";
        itemPaneHeader.appendChild(filterInfoSpan);
    }
    
    var itemPaneBody = document.getElementById("item-pane-body");
    itemPaneBody.innerHTML = "";
    
    for (var i = 0; i < items.length && i < 10; i++) {
        var item = items[i];
        var itemType = this._database.getLiteralProperty(item.uri, "type");
        
        var itemDiv = document.createElement("div");
        itemDiv.className = "item type-" + itemType;
        
        var titleDiv = document.createElement("div");
        titleDiv.className = "item-title";
        titleDiv.appendChild(this._createValueSpan(item.label, false));
        itemDiv.appendChild(titleDiv);
        
        var bodyDiv = document.createElement("div");
        bodyDiv.className = "item-body";
        itemDiv.appendChild(bodyDiv);
        
        var pairs = this.getPropertyValuesPairs(item.uri);
        for (var j = 0; j < pairs.length; j++) {
            var pair = pairs[j];
            
            if (pair.propertyLabel == "image") {
                for (var m = 0; m < pair.values.length; m++) {
                    var img = document.createElement("img");
                    img.className = "thumbnail";
                    img.setAttribute("src", pair.values[m]);
                    if (bodyDiv.firstChild == null) {
                        bodyDiv.appendChild(img);
                    } else {
                        bodyDiv.insertBefore(img, bodyDiv.firstChild);
                    }
                }
            } else {
                var pairDiv = document.createElement("div");
                pairDiv.className = "pair";
                
                var propertyNameSpan = document.createElement("span");
                propertyNameSpan.className = "property-name";
                propertyNameSpan.innerHTML = pair.propertyLabel + ": ";
                pairDiv.appendChild(propertyNameSpan);
                
                var propertyValuesSpan = document.createElement("span");
                propertyValuesSpan.className = "property-values";
                
                for (var m = 0; m < pair.values.length; m++) {
                    if (m > 0) {
                        propertyValuesSpan.appendChild(document.createTextNode(", "));
                    }
                    propertyValuesSpan.appendChild(browser._createValueSpan(pair.values[m], !pair.itemValues));
                }
                
                pairDiv.appendChild(propertyValuesSpan);
                
                bodyDiv.appendChild(pairDiv);
            }
        }
        
        itemPaneBody.appendChild(itemDiv);
    }
};

Rubik.ViewPanel.prototype._reconstructItemPaneAsTable = function() {
    var items = [];
    var browser = this;
    var collection = this._browseEngine.getCurrentCollection();
    var currentSet = collection.getCurrentSet();
    currentSet.visit(function(o) {
        items.push({ uri: o, label: browser._database.getLiteralProperty(o, "label") });
    });
    items.sort(function(a, b) {
    try {
        return a.label.localeCompare(b.label); } catch (e) { console.log(a); }
    });
    
    this._itemCount = items.length;
    
    var itemPaneHeader = document.getElementById("item-pane-header");
    itemPaneHeader.innerHTML = "";
    itemPaneHeader.appendChild(document.createTextNode(
        items.length + " " + 
        this._browseEngine.getTypeLabels(currentSet)[items.length > 1 ? 1 : 0]
    ));
    
    var originalSize = collection.originalSize();
    if (originalSize > items.length) {
        var filterInfoSpan = document.createElement("span");
        filterInfoSpan.className = "filter-info";
        filterInfoSpan.innerHTML = "(filtered from " + 
            "<a href='javascript:void' onclick='Rubik.ViewPanel._performClearingFilters(); return false;'>" + originalSize + " " +
            this._browseEngine.getTypeLabels(collection.getOriginalSet())[originalSize > 1 ? 1 : 0] +
            "</a> originally)";
        itemPaneHeader.appendChild(filterInfoSpan);
    }
    
    var itemPaneBody = document.getElementById("item-pane-body");
    itemPaneBody.innerHTML = "";
    
    var table = document.createElement("table");
    table.style.display = "none";
    table.id = "item-pane-table";
    
    var addValues = function(propertyLabel, values, td, isLiteral) {
        if (propertyLabel == "image") {
            for (var m = 0; m < values.length; m++) {
                var img = document.createElement("img");
                img.setAttribute("src", values[m]);
                td.appendChild(img);
            }
        } else {
            for (var m = 0; m < values.length; m++) {
                if (m > 0) {
                    td.appendChild(document.createTextNode(", "));
                }
                td.appendChild(browser._createValueSpan(values[m], isLiteral));
            }
        }                    
    }
    
    var columns = [];
    for (var i = 0; i < items.length && i < 20; i++) {
        var item = items[i];
        var pairs = this.getPropertyValuesPairs(item.uri);
        
        var tr = table.insertRow(i);
        if (i % 2 == 1) {
            tr.className = "item-pane-table-odd-row";
        } else {
            tr.className = "item-pane-table-even-row";
        }
        
        var tdLabel = tr.insertCell(0);
        tdLabel.appendChild(this._createValueSpan(item.label), false);
        
        for (var j = 0; j < columns.length; j++) {
            var propertyLabel = columns[j];
            var td = tr.insertCell(j+1);
            
            for (var n = 0; n < pairs.length; n++) {
                var pair = pairs[n];
                if (propertyLabel == pair.propertyLabel) {
                    addValues(propertyLabel, pair.values, td, !pair.itemValues);
                    pairs.splice(n, 1);
                    break;
                }
            }
        }
        
        for (var n = 0; n < pairs.length; n++) {
            var pair = pairs[n];
            
            var td = tr.insertCell(columns.length+1);
            addValues(pair.propertyLabel, pair.values, td, !pair.itemValues);
            columns.push(pair.propertyLabel);
        }
    }
    
    var tr = table.insertRow(0);
    tr.id = "item-pane-table-header";
    
    var td = tr.insertCell(0);
    td.innerHTML = "label";
    
    for (var j = 0; j < columns.length; j++) {
        var propertyLabel = columns[j];
        var td = tr.insertCell(j+1);
        td.innerHTML = propertyLabel;
    }
        
    itemPaneBody.appendChild(table);
    table.style.display = "block";
};

Rubik.ViewPanel.prototype._setTabularView = function() {
    this._view = "tabular";
    this._reconstructItemPane();
}

Rubik.ViewPanel.prototype._setTileView = function() {
    this._view = "tile";
    this._reconstructItemPane();
}

Rubik.ViewPanel.prototype._createValueSpan = function(text, omitLink) {
    var valueSpan = document.createElement(omitLink ? "span" : "a");
    valueSpan.setAttribute("name", "value");
    SimileAjax.DOM.registerEvent(valueSpan, "mouseover", Rubik.ViewPanel._highlightValue);
    SimileAjax.DOM.registerEvent(valueSpan, "mouseout", Rubik.ViewPanel._unhighlightValue);
    if (!omitLink) {
        valueSpan.setAttribute("src", "javascript:(void)");
        SimileAjax.DOM.registerEvent(valueSpan, "click", Rubik.ViewPanel._focusValue);
    }
    valueSpan.innerHTML = text;
    return valueSpan;
}

Rubik.ViewPanel.prototype.getPropertyValuesPairs = function(object) {
    var pairs = [];
    
    var queryEngine = this;
    var database = this._database;
    var enterPair = function(property, values, forward) {
        if (values.length > 0) {
            var itemValues = property.getValueType() == "item";
            var pair = { 
                propertyLabel:  forward ? property.getLabel() : property.getReverseLabel(),
                itemValues:     itemValues,
                values:         []
            };
            if (itemValues) {
                for (var i = 0; i < values.length; i++) {
                    var value = values[i];
                    var label = database.getLiteralProperty(value, "label");
                    pair.values.push(label != null ? label : value);
                }
            } else {
                for (var i = 0; i < values.length; i++) {
                    pair.values.push(values[i]);
                }
            }
            pairs.push(pair);
        }
    };
    
    for (var i = 0; i < this._showProperties.length; i++) {
        var entry = this._showProperties[i];
        //var property = this._database.getProperty(propertyID);
        enterPair(this._database.getProperty(entry.property), this._database.getObjects(object, entry.property).toArray(), true);
    }
    return pairs;
};

