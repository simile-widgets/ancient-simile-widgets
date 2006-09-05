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
        this._configuration = configuration["TileView"];
        
        if ("properties" in this._configuration) {
            this._itemViewConfiguration.properties = [];
            
            var entries = this._configuration.properties;
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
    
    this._initializeUI();
    
    var view = this;
    var reconstruct = function() { view._reconstruct(); };
    this._rubik.getBrowseEngine().addListener({
        onRootCollectionSet:    reconstruct,
        onRestrict:             reconstruct,
        onClearRestrictions:    reconstruct,
        onApplyRestrictions:    reconstruct
    });
}

Rubik.TileView.prototype._initializeUI = function() {
    this._div.innerHTML = "";
    var template = {
        elmt: this._div,
        children: [
            {   tag: "div",
                field: "headerDiv"
            },
            {   tag: "div",
                className: "rubik-collectionView-body",
                field: "bodyDiv"
            },
            {   tag: "div",
                field: "footerDiv"
            }
        ]
    };
    this._dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    this._orderedViewFrame = new Rubik.OrderedViewFrame(
        this._rubik, this._dom.headerDiv, this._dom.footerDiv, this._configuration);
};

Rubik.TileView.prototype._reconstruct = function() {
    if (this._itemViewConfiguration.properties == null) {
        this._itemViewConfiguration.properties = [];
        
        var propertyIDs = this._rubik.getDatabase().getAllProperties();
        for (var i = 0; i < propertyIDs.length; i++) {
            this._itemViewConfiguration.properties.push({
                property:   propertyIDs[i],
                forward:    true
            });
        }
    }
    
    var view = this;
    var state = {
        div:            this._dom.bodyDiv,
        table:          null,
        groupDoms:      [],
        groupCounts:    []
    };
    
    var closeGroups = function(groupLevel) {
        for (var i = groupLevel; i < state.groupDoms.length; i++) {
            state.groupDoms[i].countSpan.innerHTML = state.groupCounts[i];
        }
        state.groupDoms = state.groupDoms.slice(0, groupLevel);
        state.groupCounts = state.groupCounts.slice(0, groupLevel);
        
        if (groupLevel > 0) {
            state.div = state.groupDoms[groupLevel - 1].contentDiv;
        } else {
            state.div = view._dom.bodyDiv;
        }
        state.table = null;
    }
    
    this._orderedViewFrame.onNewGroup = function(groupSortKey, keyType, groupLevel) {
        closeGroups(groupLevel);
        var groupTemplate = {
            tag: "div",
            className: "rubik-collectionView-group",
            children: [
                {   tag: "h" + (groupLevel + 1),
                    children: [ 
                        groupSortKey,
                        " (",
                        {   tag: "span",
                            field: "countSpan"
                        },
                        ")"
                    ],
                    field: "header"
                },
                {   tag: "div",
                    className: "rubik-collectionView-group-content",
                    field: "contentDiv"
                }
            ]
        };
        var groupDom = SimileAjax.DOM.createDOMFromTemplate(document, groupTemplate);
        
        state.div.appendChild(groupDom.elmt);
        state.div = groupDom.contentDiv;
        
        state.groupDoms.push(groupDom);
        state.groupCounts.push(0);
    };
    
    this._orderedViewFrame.onNewItem = function(itemID, index) {
        if (state.table == null) {
            state.table = document.createElement("table");
            state.table.className = "rubik-tileView-body";
            state.div.appendChild(state.table);
        }
        
        for (var i = 0; i < state.groupCounts.length; i++) {
            state.groupCounts[i]++;
        }
        
        var rows = state.table.rows;
        var tr = state.table.insertRow(rows.length);
        
        var tdIndex = tr.insertCell(0);
        tdIndex.innerHTML = (index + 1) + ".";
        
        var tdItemView = tr.insertCell(1);
        
        var itemViewDiv = document.createElement("div");
        var itemView = new Rubik.ItemView(itemID, itemViewDiv, view._rubik, view._itemViewConfiguration);
        tdItemView.appendChild(itemViewDiv);
    };
                
    this._div.style.display = "none";
    
    this._dom.bodyDiv.innerHTML = "";
    this._orderedViewFrame.reconstruct();
    closeGroups(0);
    
    this._div.style.display = "block";
};