/*==================================================
 *  Exhibit.ThumbnailView
 *==================================================
 */
 
Exhibit.ThumbnailView = function(collection, containerElmt, lensRegistry, exhibit) {
    this._collection = collection;
    this._div = containerElmt;
    this._lensRegistry = lensRegistry;
    this._exhibit = exhibit;
    
    var view = this;
    this._listener = { 
        onItemsChanged: function() {
            view._reconstruct(); 
        } 
    };
    collection.addListener(this._listener);
    
    this._orderedViewFrame = new Exhibit.OrderedViewFrame(this._collection, this._exhibit);
    this._orderedViewFrame.parentReconstruct = function() {
        view._reconstruct();
    }
};

Exhibit.ThumbnailView.create = function(configuration, containerElmt, lensRegistry, exhibit) {
    // TODO
};

Exhibit.ThumbnailView.createFromDOM = function(configElmt, containerElmt, lensRegistry, exhibit) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var collection = Exhibit.Collection.getCollectionFromDOM(configElmt, configuration, exhibit);
    var lensRegistry2 = Exhibit.Component.createLensRegistryFromDOM(configElmt, configuration, lensRegistry);
    var view = new Exhibit.ThumbnailView(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        lensRegistry2, 
        exhibit
    );
    
    view._orderedViewFrame.configureFromDOM(configElmt);
    view._initializeUI();
    return view;
};

Exhibit.ThumbnailView.prototype.dispose = function() {
    this._collection.removeListener(this._listener);
    this._div.innerHTML = "";
    
    this._orderedViewFrame.dispose();
    this._orderedViewFrame = null;
    this._dom = null;
    
    this._collection = null;
    this._div = null;
    this._lensRegistry = null;
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
    
    this._orderedViewFrame._divHeader = this._dom.headerDiv;
    this._orderedViewFrame._divFooter = this._dom.footerDiv;
    this._orderedViewFrame.initializeUI();
        
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
        
        var itemLens = view._lensRegistry.createLens(itemID, itemLensDiv, view._exhibit);
        state.itemContainer.appendChild(itemLensDiv);
    };
                
    this._div.style.display = "none";
    
    this._dom.bodyDiv.innerHTML = "";
    this._orderedViewFrame.reconstruct();
    closeGroups(0);
    
    this._div.style.display = "block";
};