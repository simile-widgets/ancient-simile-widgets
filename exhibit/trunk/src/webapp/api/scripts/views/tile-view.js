/*==================================================
 *  Exhibit.TileView
 *==================================================
 */
 
Exhibit.TileView = function(exhibit, div, configuration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    
    this._initializeUI();
    
    var view = this;
    this._exhibit.getBrowseEngine().addListener({ 
        onChange: function(handlerName) { 
            if (handlerName != "onGroup" && handlerName != "onUngroup") {
                view._reconstruct(); 
            }
        } 
    });
}

Exhibit.TileView.prototype._initializeUI = function() {
    this._div.innerHTML = "";
    var template = {
        elmt: this._div,
        children: [
            {   tag: "div",
                field: "headerDiv"
            },
            {   tag: "div",
                className: "exhibit-collectionView-body",
                field: "bodyDiv"
            },
            {   tag: "div",
                field: "footerDiv"
            }
        ]
    };
    this._dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    this._orderedViewFrame = new Exhibit.OrderedViewFrame(
        this._exhibit, this._dom.headerDiv, this._dom.footerDiv, this._configuration["TileView"]);
};

Exhibit.TileView.prototype._reconstruct = function() {
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
            className: "exhibit-collectionView-group",
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
                    className: "exhibit-collectionView-group-content",
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
        //if (index > 10) return;
        
        if (state.table == null) {
            state.table = document.createElement("table");
            state.table.className = "exhibit-tileView-body";
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
        var itemView = new Exhibit.ItemView(itemID, itemViewDiv, view._exhibit, view._configuration);
        tdItemView.appendChild(itemViewDiv);
    };
                
    this._div.style.display = "none";
    
    this._dom.bodyDiv.innerHTML = "";
    this._orderedViewFrame.reconstruct();
    closeGroups(0);
    
    this._div.style.display = "block";
};