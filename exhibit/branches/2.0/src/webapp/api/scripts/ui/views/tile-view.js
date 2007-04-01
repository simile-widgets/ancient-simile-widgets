/*==================================================
 *  Exhibit.TileView
 *==================================================
 */

Exhibit.TileView = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;
    
    var view = this;
    
    this._listener = { onItemsChanged: function() { view._reconstruct(); } };
    uiContext.getCollection().addListener(this._listener);
    
    this._orderedViewFrame = new Exhibit.OrderedViewFrame(uiContext);
    this._orderedViewFrame.parentReconstruct = function() { view._reconstruct(); }
};

Exhibit.TileView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.TileView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    view._orderedViewFrame.configure(configuration);
    
    view._initializeUI();
    return view;
};

Exhibit.TileView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var view = new Exhibit.TileView(
        containerElmt != null ? containerElmt : configElmt, 
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    
    view._orderedViewFrame.configureFromDOM(configElmt);
    view._orderedViewFrame.configure(configuration);
    
    view._initializeUI();
    return view;
};

Exhibit.TileView.prototype.dispose = function() {
    this._uiContext.getCollection().removeListener(this._listener);
    
    this._div.innerHTML = "";
    
    this._orderedViewFrame.dispose();
    this._orderedViewFrame = null;
    this._dom = null;
    
    this._div = null;
    this._uiContext = null;
};

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
    this._dom = SimileAjax.DOM.createDOMFromTemplate(template);
    
    var self = this;
    this._orderedViewFrame._divHeader = this._dom.headerDiv;
    this._orderedViewFrame._divFooter = this._dom.footerDiv;
    this._orderedViewFrame._generatedContentElmtRetriever = function() {
        return self._dom.bodyDiv;
    };
    this._orderedViewFrame.initializeUI();
        
    this._reconstruct();
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
        
        var groupDom = Exhibit.TileView.theme.constructGroup(groupLevel, groupSortKey);
        
        state.div.appendChild(groupDom.elmt);
        state.div = groupDom.contentDiv;
        
        state.groupDoms.push(groupDom);
        state.groupCounts.push(0);
    };
    
    this._orderedViewFrame.onNewItem = function(itemID, index) {
        //if (index > 10) return;
        
        if (state.table == null) {
            state.table = Exhibit.TileView.theme.constructTable();
            state.div.appendChild(state.table);
        }
        
        for (var i = 0; i < state.groupCounts.length; i++) {
            state.groupCounts[i]++;
        }
        
        var rows = state.table.rows;
        var tr = state.table.insertRow(rows.length);
        
        var tdIndex = tr.insertCell(0);
        tdIndex.className = "exhibit-tileView-itemIndex";
        tdIndex.innerHTML = (index + 1) + ".";
        
        var tdItemLens = tr.insertCell(1);
        
        var itemLensDiv = document.createElement("div");
        var itemLens = view._uiContext.getLensRegistry().createLens(itemID, itemLensDiv, view._uiContext);
        tdItemLens.appendChild(itemLensDiv);
    };
                
    this._div.style.display = "none";
    
    this._dom.bodyDiv.innerHTML = "";
    this._orderedViewFrame.reconstruct();
    closeGroups(0);
    
    this._div.style.display = "block";
};