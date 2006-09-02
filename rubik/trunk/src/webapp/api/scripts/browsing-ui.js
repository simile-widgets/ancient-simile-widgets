/*==================================================
 *  Browser
 *==================================================
 */
 
Rubik.BrowsingUI = function(database, queryEngine, controlDiv, browseDiv, viewDiv, configuration) {
    this._database = database;
    this._queryEngine = queryEngine;
    
    this._controlDiv = controlDiv;
    this._browseDiv = browseDiv;
    this._viewDiv = viewDiv;

    this._view = "tile";
    this._pinningHighlight = false;
    
    this._showProperties = [];
    if (configuration != null) {
        if ("properties" in configuration) {
            var entries = configuration.properties;
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var sp;
                if (entry instanceof "string") {
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
    
    this._facetInfos = [];
    this._groupingProperty = "";
    
    //this._reconstruct();
}

Rubik.BrowsingUI.prototype._reconstruct = function(scrollInfo) {
    Rubik.BrowsingUI._pinningHighlight = false;
    Rubik.BrowsingUI._hidePinButtons();
    
    this._reconstructItemPane();
    this._reconstructFacetPane(scrollInfo);
    this._reconstructCollectionPane();
}

Rubik.BrowsingUI.prototype._reconstructFacetPane = function(scrollInfo) {
    var facetPaneBody = this._browseDiv;
    facetPaneBody.innerHTML = "";
    
    var browser = this;
    var facets = this._queryEngine.getFacets();
    for (var i = 0; i < facets.length; i++) {
        var facet = facets[i];
        /* if (facet.count > 1 || (facet.count == 1 && facet.values[0].count < this._itemCount)) */ 
        if (facet.count > 0) {
            var property = facet.property;
            var forward = facet.forward;
            
            var facetKey = property + ":" + forward;
            var facetInfo = this._facetInfos[facetKey];
            if (facetInfo == null) {
                facetInfo = [];
                this._facetInfos[facetKey] = facetInfo;
            }
            
            var div = document.createElement("div");
            div.className = "facet-box";
            
            /*
             *  Facet header
             */
            var title = document.createElement("div");
            title.className = "facet-title";
            title.innerHTML = facet.label + ": ";
            
            var count = facet.filteredCount;
            var valuesText = count + " " + (count > 1 ? facet.pluralValueLabel : facet.valueLabel);
            
            var countSpan = document.createElement("span");
            countSpan.className = "facet-count";
            if (facet.slidable) {
                var aSpan = document.createElement("a");
                aSpan.innerHTML = valuesText;
                aSpan.href = "javascript:void";
                aSpan.title = (count > 1 ? "Focus on these " : "Focus on this ") + valuesText;
                aSpan.setAttribute("property", property);
                aSpan.setAttribute("forward", forward ? "true" : "false");
                SimileAjax.DOM.registerEvent(aSpan, "click", function(elmt) { browser._performSliding(elmt); return true; });
                
                countSpan.appendChild(aSpan);
                countSpan.appendChild(document.createTextNode(
                    facet.filteredCount < facet.count ? " filtered" : " total"));
            } else {
                countSpan.innerHTML = valuesText + (facet.filteredCount < facet.count ? " filtered" : " total");
            }
            title.appendChild(countSpan);
            
            div.appendChild(title);
            
            /*
             *  Facet body
             */
            var valuesDiv = document.createElement("div");
            valuesDiv.className = facet.grouped ? "facet-body-long" : "facet-body";
            
            var f = function(values, containerDiv, level) {
                for (var j = 0; j < values.length; j++) {
                    var value = values[j];
                    var valueDiv = document.createElement("div");
                    valueDiv.className = "facet-value" + (facet.filteredCount < facet.count && value.filtered ? " facet-value-filtered" : "");
                    valueDiv.title = value.label;
                    
                    var countDiv = document.createElement("div");
                    countDiv.className = SimileAjax.Platform.browser.isIE ? "facet-value-count-ie" : "facet-value-count-ff";
                    countDiv.innerHTML = value.count;
                    valueDiv.appendChild(countDiv);
                        
                    var checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.checked = value.selected;
                    checkbox.defaultChecked = value.selected;
                    checkbox.setAttribute("property", property);
                    checkbox.setAttribute("forward", forward ? "true" : "false");
                    checkbox.setAttribute("level", value.level);
                    checkbox.setAttribute("value", value.value);
                    SimileAjax.DOM.registerEvent(checkbox, "click", function(elmt) { browser._performFiltering(elmt); return true; });
                    valueDiv.appendChild(checkbox);
                    
                    var expanded;
                    var valueKey = value.value + ":" + value.level;
                    if (Rubik.BrowsingUI._groupingProperty == facetKey) {
                        expanded = (level == 0);
                        facetInfo[valueKey] = expanded;
                    } else {
                        expanded = ((valueKey in facetInfo) && facetInfo[valueKey]);
                    }
                    
                    if (value.children.length > 0) {
                        var img = expanded ? "images/minus.gif" : "images/plus.gif";
                        var controlSpan = document.createElement("span");
                        controlSpan.className = "facet-value-control";
                        controlSpan.innerHTML = "<img src='" + img + "' title='Expand to see values in this group' />";
                        SimileAjax.DOM.registerEvent(controlSpan, "click", function(elmt) { browser._performTogglingGroup(elmt); return true; });
                        valueDiv.appendChild(controlSpan);
                    }
                    
                    valueDiv.appendChild(browser._createValueSpan(value.label, true));
                    
                    containerDiv.appendChild(valueDiv);
                    
                    if (value.children.length > 0) {
                        var childrenDiv = document.createElement("div");
                        childrenDiv.className = "facet-value-children";
                        if (!expanded) {
                            childrenDiv.style.display = "none";
                        }
                        
                        arguments.callee(value.children, childrenDiv, level+1);
                        
                        containerDiv.appendChild(childrenDiv);
                    }
                }
            }
            
            f(facet.values, valuesDiv, 0);
            div.appendChild(valuesDiv);
            
            /*
             *  Facet footer
             */
            if (facet.slidable) {
                var footerDiv = document.createElement("div");
                footerDiv.className = "facet-footer";
                
                var groupA = document.createElement("a");
                groupA.href = "javascript:void";
                groupA.innerHTML = "group by";
                groupA.setAttribute("property", property);
                groupA.setAttribute("forward", forward ? "true" : "false");
                SimileAjax.DOM.registerEvent(groupA, "click", function(elmt) { browser._performGrouping(elmt); return true; });
                
                footerDiv.appendChild(groupA);
                
                if (facet.grouped) {
                    footerDiv.appendChild(document.createTextNode(" | "));
                    
                    var closeA = document.createElement("a");
                    closeA.href = "javascript:void";
                    closeA.innerHTML = "collapse";
                    closeA.setAttribute("property", property);
                    closeA.setAttribute("forward", forward ? "true" : "false");
                    SimileAjax.DOM.registerEvent(closeA, "click", function(elmt) { browser._performCollapsingGroups(elmt); return true; });
                    footerDiv.appendChild(closeA);
                    
                    footerDiv.appendChild(document.createTextNode(" | "));
                    
                    var openA = document.createElement("a");
                    openA.href = "javascript:void";
                    openA.innerHTML = "expand";
                    openA.setAttribute("property", property);
                    openA.setAttribute("forward", forward ? "true" : "false");
                    SimileAjax.DOM.registerEvent(openA, "click", function(elmt) { browser._performExpandingGroups(elmt); return true; });
                    footerDiv.appendChild(openA);
                }
                
                div.appendChild(footerDiv);
            }
            
            facetPaneBody.appendChild(div);
            
            if (scrollInfo) {
                if (property == scrollInfo.property && forward == scrollInfo.forward) {
                    valuesDiv.scrollTop = scrollInfo.scrollTop;
                }
            }
        }
    }
};

Rubik.BrowsingUI.prototype._reconstructItemPane = function() {
    if (this._view == "tabular") {
        this._reconstructItemPaneAsTable();
    } else {
        this._reconstructItemPaneAsTiles();
    }
}

Rubik.BrowsingUI.prototype._reconstructItemPaneAsTiles = function() {
    var items = [];
    var browser = this;
    var collection = this._queryEngine.getCurrentCollection();
    var currentSet = collection.getCurrentSet();
    currentSet.visit(function(o) {
        items.push({ uri: o, label: browser._database.getLiteralProperty(o, "label") });
    });
    items.sort(function(a, b) {
        return a.label.localeCompare(b.label);
    });
    
    Rubik.BrowsingUI._itemCount = items.length;
    
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
            "<a href='javascript:void' onclick='Rubik.BrowsingUI._performClearingFilters(); return false;'>" + originalSize + " " +
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

Rubik.BrowsingUI.prototype._reconstructItemPaneAsTable = function() {
    var items = [];
    var browser = this;
    var collection = this._queryEngine.getCurrentCollection();
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
        this._queryEngine.getTypeLabels(currentSet)[items.length > 1 ? 1 : 0]
    ));
    
    var originalSize = collection.originalSize();
    if (originalSize > items.length) {
        var filterInfoSpan = document.createElement("span");
        filterInfoSpan.className = "filter-info";
        filterInfoSpan.innerHTML = "(filtered from " + 
            "<a href='javascript:void' onclick='Rubik.BrowsingUI._performClearingFilters(); return false;'>" + originalSize + " " +
            this._queryEngine.getTypeLabels(collection.getOriginalSet())[originalSize > 1 ? 1 : 0] +
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

Rubik.BrowsingUI.prototype._reconstructCollectionPane = function() {
    var collectionPane = this._controlDiv;
    collectionPane.innerHTML = "";
    
    var browser = this;
    
    var historyDiv = document.createElement("div");
    historyDiv.id = "history";
    historyDiv.innerHTML = "<a href='javascript:void' onclick='Rubik.BrowsingUI.reset();'>Home</a>";
    collectionPane.appendChild(historyDiv);
    
    var count = this._queryEngine.getCollectionCount();
    for (var i = 0; i < count; i++) {
        var collection = this._queryEngine.getCollection(i);
        
        if (i > 0) {
            var scissorsDiv = document.createElement("div");
            scissorsDiv.className = "scissors";
            scissorsDiv.title = "Discard results to the right of this point";
            scissorsDiv.setAttribute("index", i);
            SimileAjax.DOM.registerEvent(scissorsDiv, "click", function(elmt) { browser._performClosing(elmt); return false; });
            collectionPane.insertBefore(scissorsDiv, collectionPane.firstChild.nextSibling);
        }
        
        var filtered = collection.size() != collection.originalSize();
        var tabDiv = document.createElement("div");
        tabDiv.className = 
            (filtered ? "collection-tab-filtered " : "collection-tab ") + 
            (collection.hasFocus() ? "collection-tab-selected" : "collection-tab-not-selected");
        if (!collection.hasFocus()) {
            tabDiv.setAttribute("index", i);
            SimileAjax.DOM.registerEvent(tabDiv, "click", function(elmt) { browser._performFocusing(elmt); return true; });
        } else {
            this._focusIndex = i;
        }
        
        var slideInfoDiv = document.createElement("div");
        slideInfoDiv.className = "collection-slide-info";
        if (i > 0) {
            slideInfoDiv.appendChild(document.createTextNode(this._queryEngine.getSlide(i - 1).label));
        } else {
            slideInfoDiv.innerHTML = "&nbsp;";
        }
        tabDiv.appendChild(slideInfoDiv);
        
        var text = collection.originalSize() + " " + 
            this._database.getTypeLabels(collection.getRestrictedSet())[collection.size() > 1 ? 1 : 0];
        if (filtered) {
            text += ", filtered to " + collection.size();
        }
        
        var countInfoDiv = document.createElement("div");
        countInfoDiv.className = "collection-count-info";
        countInfoDiv.innerHTML = text;
        tabDiv.appendChild(countInfoDiv);
        
        if (i == 0) {
            collectionPane.appendChild(tabDiv);
        } else {
            collectionPane.insertBefore(tabDiv, collectionPane.firstChild.nextSibling);
        }
    }
    
    collectionPane.style.display = (count > 1) ? "block" : "none";
};

Rubik.BrowsingUI.prototype._performFiltering = function(checkbox) {
    var property = checkbox.getAttribute("property");
    var forward = checkbox.getAttribute("forward") == "true";
    var level = parseInt(checkbox.getAttribute("level"));
    var value = checkbox.getAttribute("value");
    
    var scrollTop = checkbox.parentNode.parentNode.scrollTop;
    
    this._queryEngine.setValueRestriction(property, forward, level, value, checkbox.checked);
    
    this._reconstruct({
        property:   property,
        forward:    forward,
        scrollTop:  scrollTop
    });
};

Rubik.BrowsingUI.prototype._performSliding = function(div) {
    var browser = this;
    performLongTask(function() {
        var property = div.getAttribute("property");
        var forward = div.getAttribute("forward") == "true";
        browser._queryEngine.slide(property, forward);
        
        browser._facetInfos = [];
        browser._reconstruct();

        advanceHistory();
    }, "please wait...");
};

Rubik.BrowsingUI.prototype._performFocusing = function(elmt) {
    var browser = this;
    if (elmt.className.indexOf("collection-tab") == 0) {
        performLongTask(function() {
            browser._queryEngine.focus(parseInt(elmt.getAttribute("index")));
            browser._facetInfos = [];
            browser._reconstruct();
            
            setHistoryPosition(browser._focusIndex);
        }, "please wait...");
    }
};

Rubik.BrowsingUI.prototype.setLocation = function(newLocation) {
    var browser = this;
    performLongTask(function() {
        browser._queryEngine.focus(newLocation);
        browser._facetInfos = [];
        browser._reconstruct();
    }, "please wait...");
};

Rubik.BrowsingUI.prototype.reset = function() {
    var browser = this;
    performLongTask(function() {
        browser._queryEngine.truncate(1);
        browser._queryEngine.clearAllCurrentFilters();
        browser._facetInfos = [];
        browser._reconstruct();
        
        setHistoryPosition(browser._focusIndex);
    }, "please wait...");
};

Rubik.BrowsingUI.prototype._performClosing = function(elmt) {
    var browser = this;
    performLongTask(function() {
        browser._queryEngine.truncate(parseInt(elmt.getAttribute("index")));
        browser._facetInfos = [];
        browser._reconstruct();
        
        setHistoryPosition(browser._focusIndex);
    }, "please wait...");
};

Rubik.BrowsingUI.prototype._performClearingFilters = function() {
    var browser = this;
    performLongTask(function() {
        browser._queryEngine.clearAllCurrentFilters();
        browser._reconstruct();
    }, "please wait...");
}

Rubik.BrowsingUI.prototype._performGrouping = function(elmt) {
    var browser = this;
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    
    var coords = getAbsoluteCoordinates(elmt.parentNode.parentNode);
    document.getElementById("grouping-box").style.top = coords.y + "px";
    
    this._fillDialogBoxBody(property, forward);
    this._groupingProperty = property + ":" + forward;
    
    var dialogBox = document.getElementById("grouping-box");
    dialogBox.style.display = "block";
}

Rubik.BrowsingUI.prototype._closeDialogBox = function() {
    var dialogBox = document.getElementById("grouping-box");
    dialogBox.style.display = "none";
    
    this._groupingProperty = "";
}

Rubik.BrowsingUI.prototype._fillDialogBoxBody = function(property, forward) {
    var browser = this;
    
    var dialogBoxBody = document.getElementById("grouping-box-body");
    dialogBoxBody.innerHTML = "";
    
    var groups = this._queryEngine.getGroups(property, forward);
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var groupingOptions = group.groupingOptions;
        
        var groupingBoxDiv = document.createElement("div");
        groupingBoxDiv.className = "grouping-box";
        
        var headingDiv = document.createElement("div");
        headingDiv.className = "grouping-heading";
        headingDiv.appendChild(document.createTextNode(i == 0 ? "Group by " : "Group the groups by "));
        
        groupingBoxDiv.appendChild(headingDiv);
        
        var hasSelection = false;
        for (var j = 0; j < groupingOptions.length; j++) {
            var groupingOption = groupingOptions[j];
            
            var groupingOptionDiv = document.createElement("div");
            groupingOptionDiv.className = "grouping-option";
            
            var option = document.createElement("input");
            option.type = "radio";
            option.name = "level" + i;
            option.checked = groupingOption.selected;
            option.defaultChecked = groupingOption.selected;
            
            option.setAttribute("property", property);
            option.setAttribute("forward", forward ? "true" : "false");
            option.setAttribute("groupingProperty", groupingOption.property);
            option.setAttribute("groupingForward", groupingOption.forward ? "true" : "false");
            option.setAttribute("level", i);
            
            SimileAjax.DOM.registerEvent(option, "click", function(elmt) { browser._performChoosingGroupingOption(elmt); return true; });
            
            groupingOptionDiv.appendChild(option);
            
            if (groupingOption.selected) {
                hasSelection = true;
            }
            
            groupingOptionDiv.appendChild(document.createTextNode(groupingOption.label));
            
            groupingBoxDiv.appendChild(groupingOptionDiv);
        }
        
        if (hasSelection) {
            var clearA = document.createElement("a");
            clearA.setAttribute("property", property);
            clearA.setAttribute("forward", forward ? "true" : "false");
            clearA.setAttribute("level", i);
            clearA.href = "javascript:void";
            clearA.innerHTML = "(ungroup)";
            SimileAjax.DOM.registerEvent(clearA, "click", function(elmt) { browser._performClearingGrouping(elmt); return true; });
            
            headingDiv.appendChild(clearA);
        }
        
        dialogBoxBody.appendChild(groupingBoxDiv);
    }
}

Rubik.BrowsingUI.prototype._performChoosingGroupingOption = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    var groupingProperty = elmt.getAttribute("groupingProperty");
    var groupingForward = elmt.getAttribute("groupingForward") == "true";
    var level = parseInt(elmt.getAttribute("level"));

    this._queryEngine.group(property, forward, level, groupingProperty, groupingForward);
    this._fillDialogBoxBody(property, forward);
    this._reconstructFacetPane();
}

Rubik.BrowsingUI.prototype._performClearingGrouping = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    var level = parseInt(elmt.getAttribute("level"));
    
    this._queryEngine.ungroup(property, forward, level);
    this._fillDialogBoxBody(property, forward);
    this._reconstructFacetPane();
}

Rubik.BrowsingUI.prototype._performTogglingGroup = function(elmt) {
    var checkbox = elmt.previousSibling;
    var property = checkbox.getAttribute("property");
    var forward = checkbox.getAttribute("forward") == "true";
    var level = checkbox.getAttribute("level");
    var value = checkbox.getAttribute("value");
   
    var facetKey = property + ":" + forward;
    var facetInfo = Rubik.BrowsingUI._facetInfos[facetKey];
    if (facetInfo == null) {
        facetInfo = [];
        Rubik.BrowsingUI._facetInfos[facetKey] = facetInfo;
    }
    var valueKey = value + ":" + level;
            
    var childrenDiv = elmt.parentNode.nextSibling;
    if (childrenDiv.style.display == "none") {
        elmt.firstChild.src = "images/minus.gif";
        childrenDiv.style.display = "block";
        facetInfo[valueKey] = true;
    } else {
        elmt.firstChild.src = "images/plus.gif";
        childrenDiv.style.display = "none";
        facetInfo[valueKey] = false;
    }
}

Rubik.BrowsingUI.prototype._performCollapsingGroups = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    
    var facetKey = property + ":" + forward;
    var facetInfo = Rubik.BrowsingUI._facetInfos[facetKey];
    if (facetInfo == null) {
        facetInfo = [];
        this._facetInfos[facetKey] = facetInfo;
    }
    
    var browser = this;
    var f = function(div) {
        for (var i = 0; i < div.childNodes.length; i++) {
            var elmt = div.childNodes[i];
            if (elmt.className == "facet-value-children") {
                arguments.callee(elmt);
            } else {
                var controlSpan = elmt.childNodes[2];
                if (controlSpan.className == "facet-value-control") {
                    var checkbox = controlSpan.previousSibling;
                    var level = checkbox.getAttribute("level");
                    var value = checkbox.getAttribute("value");
                    var valueKey = value + ":" + level;
                    
                    elmt.nextSibling.style.display = "none";
                    controlSpan.firstChild.src = "images/plus.gif";
                    
                    facetInfo[valueKey] = false;
                }
            }
        }
    }
    
    var valuesDiv = elmt.parentNode.previousSibling;
    f(valuesDiv);
}

Rubik.BrowsingUI.prototype._performExpandingGroups = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    
    var facetKey = property + ":" + forward;
    var facetInfo = Rubik.BrowsingUI._facetInfos[facetKey];
    if (facetInfo == null) {
        facetInfo = [];
        this._facetInfos[facetKey] = facetInfo;
    }
    
    var f = function(div) {
        for (var i = 0; i < div.childNodes.length; i++) {
            var elmt = div.childNodes[i];
            if (elmt.className == "facet-value-children") {
                arguments.callee(elmt);
            } else {
                var controlSpan = elmt.childNodes[2];
                if (controlSpan.className == "facet-value-control") {
                    var checkbox = controlSpan.previousSibling;
                    var level = checkbox.getAttribute("level");
                    var value = checkbox.getAttribute("value");
                    var valueKey = value + ":" + level;
                    
                    elmt.nextSibling.style.display = "block";
                    controlSpan.firstChild.src = "images/minus.gif";
                    
                    facetInfo[valueKey] = true;
                }
            }
        }
    }
    
    var valuesDiv = elmt.parentNode.previousSibling;
    f(valuesDiv);
}

Rubik.BrowsingUI.prototype._setTabularView = function() {
    this._view = "tabular";
    this._reconstructItemPane();
}

Rubik.BrowsingUI.prototype._setTileView = function() {
    this._view = "tile";
    this._reconstructItemPane();
}

Rubik.BrowsingUI.prototype._createValueSpan = function(text, omitLink) {
    var valueSpan = document.createElement(omitLink ? "span" : "a");
    valueSpan.setAttribute("name", "value");
    SimileAjax.DOM.registerEvent(valueSpan, "mouseover", Rubik.BrowsingUI._highlightValue);
    SimileAjax.DOM.registerEvent(valueSpan, "mouseout", Rubik.BrowsingUI._unhighlightValue);
    if (!omitLink) {
        valueSpan.setAttribute("src", "javascript:(void)");
        SimileAjax.DOM.registerEvent(valueSpan, "click", Rubik.BrowsingUI._focusValue);
    }
    valueSpan.innerHTML = text;
    return valueSpan;
}

Rubik.BrowsingUI._highlightValue = function(elmt, evt) {
    if (Rubik.BrowsingUI._pinningHighlight) {
        Rubik.BrowsingUI._showPinButton(document.getElementById("unpin-button"), elmt, evt);
        return;
    }
    
    var value = elmt.innerHTML;
    var elmts = document.getElementsByName("value");
    
    if (elmts.length > 0) {
        for (var i = 0; i < elmts.length; i++) {
            var elmt2 = elmts[i];
            if (elmt2.innerHTML == value) {
                elmt2.className = "value-highlight";
            } else {
                elmt2.className = "";
            }
        }
        
        Rubik.BrowsingUI._showPinButton(document.getElementById("pin-button"), elmt, evt);
    }
}

Rubik.BrowsingUI._unhighlightValue = function(elmt, evt) {
/*
    var elmts = document.getElementsByName("value");
    
    for (var i = 0; i < elmts.length; i++) {
        var elmt2 = elmts[i];
        elmt2.className = "";
    }
*/
}

Rubik.BrowsingUI._focusValue = function(elmt, evt) {
    focus(elmt.innerHTML);
}

Rubik.BrowsingUI._pinHighlight = function(elmt) {
    Rubik.BrowsingUI._hidePinButton(elmt);
    Rubik.BrowsingUI._pinningHighlight = true;
}

Rubik.BrowsingUI._unpinHighlight = function(elmt) {
    Rubik.BrowsingUI._hidePinButton(elmt);
    Rubik.BrowsingUI._pinningHighlight = false;
    Rubik.BrowsingUI._unhighlightValue();
}

Rubik.BrowsingUI._showPinButton = function(button, elmt, evt) {
    if (Rubik.BrowsingUI._timerID) {
        window.clearTimeout(Rubik.BrowsingUI._timerID);
    }
    
    var centerX = evt.pageX + 8;
    var centerY = evt.pageY + 6;
    
    button.style.left = centerX + "px";
    button.style.top = centerY + "px";
    button.style.display = "block";
    
    Rubik.BrowsingUI._timerID = window.setTimeout(
        function() { 
            Rubik.BrowsingUI._hidePinButton(button); 
            Rubik.BrowsingUI._timerID = null; 
        }, 
        2000
    );
}

Rubik.BrowsingUI._hidePinButton = function(button) {
    button.style.display = "none";
}

Rubik.BrowsingUI._hidePinButtons = function() {
    document.getElementById("pin-button").style.display = "none";
    document.getElementById("unpin-button").style.display = "none";
}



Rubik.BrowsingUI.prototype.getPropertyValuesPairs = function(object) {
    var pairs = [];
    
    var queryEngine = this;
    var enterPair = function(property, values, forward) {
        if (values.length > 0) {
            var itemValues = property.getValueType() == "item";
            var pair = { 
                property:   forward ? propertyData.getLabel() : propertyData.getReverseLabel(),
                itemValues: itemValues,
                values:     []
            };
            if (itemValues) {
                for (var i = 0; i < values.length; i++) {
                    pair.values.push(queryEngine._database.getLiteralProperty(values[i], "label"));
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
        enterPair(this._database.getProperty(entry.property), this._database.getObjects(object, entry.property).toArray(), false);
    }
    return pairs;
};

