/*==================================================
 *  Exhibit.ThumbnailView
 *==================================================
 */
 
Exhibit.ThumbnailView = function(exhibit, div, configuration, domConfiguration, globalConfiguration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    this._domConfiguration = domConfiguration;
    this._globalConfiguration = globalConfiguration;
    this._lensConfiguration = {};
    
    if (domConfiguration != null) {
        Exhibit.ViewPanel.extractItemLensDomConfiguration(
            domConfiguration, this._lensConfiguration);
    }
    if ("lensSelector" in configuration) {
        if (!("Lens" in this._lensConfiguration)) {
            this._lensConfiguration["Lens"] = {};
        }
        this._lensConfiguration["Lens"].lensSelector = configuration.lensSelector;
    }
    
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

Exhibit.ThumbnailView.prototype.dispose = function() {
    this._exhibit.getBrowseEngine().removeListener(this._listener);
    
    this._div.innerHTML = "";
    
    this._orderedViewFrame.dispose();
    this._orderedViewFrame = null;
    
    this._dom = null;
    this._div = null;
    this._exhibit = null;
};

Exhibit.ThumbnailView.prototype._initializeUI = function() {
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
        this._exhibit, this._dom.headerDiv, this._dom.footerDiv, this._configuration, this._domConfiguration);
        
    var self = this;
    this._orderedViewFrame.parentReconstruct = function() {
        self._reconstruct();
    }
    
    this._reconstruct();
};

Exhibit.ThumbnailView.prototype._reconstruct = function() {
    var view = this;
    var state = {
        div:            this._dom.bodyDiv,
        itemContainer:  null,
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
        state.itemContainer = null;
    }
    
    this._orderedViewFrame.onNewGroup = function(groupSortKey, keyType, groupLevel) {
        closeGroups(groupLevel);
        
        var groupDom = Exhibit.ThumbnailView.theme.constructGroup(
            view._exhibit,
            groupLevel,
            groupSortKey
        );
        
        state.div.appendChild(groupDom.elmt);
        state.div = groupDom.contentDiv;
        
        state.groupDoms.push(groupDom);
        state.groupCounts.push(0);
    };
    
    this._orderedViewFrame.onNewItem = function(itemID, index) {
        //if (index > 10) return;
        
        if (state.itemContainer == null) {
            state.itemContainer = Exhibit.ThumbnailView.theme.constructItemContainer(view._exhibit);
            state.div.appendChild(state.itemContainer);
        }
        
        for (var i = 0; i < state.groupCounts.length; i++) {
            state.groupCounts[i]++;
        }
        
        var itemLensDiv = document.createElement("div");
        itemLensDiv.className = SimileAjax.Platform.browser.isIE ?
            "exhibit-thumbnailView-itemContainer-IE" :
            "exhibit-thumbnailView-itemContainer";
        
        var itemLens = new Exhibit.Lens(itemID, itemLensDiv, view._exhibit, view._lensConfiguration);
        state.itemContainer.appendChild(itemLensDiv);
    };
                
    this._div.style.display = "none";
    
    this._dom.bodyDiv.innerHTML = "";
    this._orderedViewFrame.reconstruct();
    closeGroups(0);
    
    this._div.style.display = "block";
};