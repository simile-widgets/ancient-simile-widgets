/*======================================================================
 *  Exhibit.BrowsePanel
 *  http://simile.mit.edu/wiki/Exhibit/API/BrowsePanel
 *======================================================================
 */
 
Exhibit.BrowsePanel = function(exhibit, div, configuration) {
    this._exhibit = exhibit;
    this._database = exhibit.getDatabase();
    this._browseEngine = exhibit.getBrowseEngine();
    this._div = div;
    
    this._configure(configuration);
    this._facetInfos = [];
    
    var browsePanel = this;
    this._browseEngine.addListener({ 
        onChange: function(handlerName) { 
            if (handlerName != "onGroup" && handlerName != "onUngroup") {
                browsePanel._reconstruct(); 
            }
        } 
    });
    
    this._initializeUI();
};

Exhibit.BrowsePanel.prototype.getState = function() {
    return null;
};

Exhibit.BrowsePanel.prototype.setState = function(state) {
};

Exhibit.BrowsePanel.prototype._configure = function(configuration) {
    if (configuration == null || !("BrowseEngine" in configuration)) {
        var s = Exhibit.getAttribute(this._div, "facets");
        if (s != null && s.length > 0) {
            var a = s.split(",");
            for (var i = 0; i < a.length; i++) {
                a[i] = a[i].replace(/^\s+/, '').replace(/\s+$/, '');
            }
            this._browseEngine.setFacets(a);
        }
    }
};

Exhibit.BrowsePanel.prototype._initializeUI = function() {
    this._div.innerHTML = "";
    
    Exhibit.protectUI(this._div);
    SimileAjax.DOM.appendClassName(this._div, "exhibit-browsePanel");
};

Exhibit.BrowsePanel.prototype._reconstruct = function() {
    var newFacets = this._browseEngine.getFacets();
    /*  Note that the order of facets never changes, although
        some might disappear and reappear at different times.
    */
    
    if (newFacets.length > 0) {
        this._reconstructFacets(newFacets);
    } else {
        this._showHelp();
    }
};
    
Exhibit.BrowsePanel.prototype._showHelp = function() {
    this._div.innerHTML = "";
    Exhibit.BrowsePanel.theme.constructConfigureHelpDom(this._exhibit, this._div);
};

Exhibit.BrowsePanel.prototype._reconstructFacets = function(newFacets) {
    var getKey = function(f) {
        return f.property + ":" + f.forward;
    };
    
    var newFacetKeys = {};
    for (var i = 0; i < newFacets.length; i++) {
        var facet = newFacets[i];
        var key = getKey(facet);
        newFacetKeys[key] = true;
    }
    
    var oldFacets = this._facetInfos;
    var oldFacetKeys = {};
    for (i = 0; i < oldFacets.length; i++) {
        var facet = oldFacets[i];
        var key = getKey(facet);
        if (!(newFacetKeys[key])) {
            oldFacetKeys[key] = true;
        }
    }
    
    var newFacetInfos = [];
    var newFacetIndex = 0;
    var oldFacetIndex = 0;
    var node = this._div.firstChild;
    
    while (newFacetIndex < newFacets.length && oldFacetIndex < oldFacets.length) {
        var oldFacet = oldFacets[oldFacetIndex];
        var oldFacetKey = getKey(oldFacet);
        
        if (oldFacetKeys[oldFacetKey]) { // dispose this facet
            node = node.nextSibling;
            
            oldFacet.facet.dispose();
            oldFacetIndex++;
        } else {
            var newFacet = newFacets[newFacetIndex];
            var newFacetKey = getKey(newFacet);
            
            if (newFacetKey == oldFacetKey) { // update
                node = node.nextSibling;
                
                oldFacet.facet.update(newFacet);
                newFacetInfos.push(oldFacet);
                
                newFacetIndex++;
                oldFacetIndex++;
            } else { // insert
                var result = this._constructFacet(newFacet);
                if (node == null) {
                    this._div.appendChild(result[0]);
                } else {
                    this._div.insertBefore(result[0], node);
                }
                
                newFacetInfos.push({ 
                    property:   newFacet.property,
                    forward:    newFacet.forward,
                    facet:      result[1]
                });
                newFacetIndex++;
            }
        }
    }
    
    // Insert the remaining new facets
    while (newFacetIndex < newFacets.length) {
        var newFacet = newFacets[newFacetIndex];
        var result = this._constructFacet(newFacet);
        if (node == null) {
            this._div.appendChild(result[0]);
        } else {
            this._div.insertBefore(result[0], node);
        }
        
        newFacetInfos.push({ 
            property:   newFacet.property,
            forward:    newFacet.forward,
            facet:      result[1]
        });
        newFacetIndex++;
    }
    
    // Remove the remaining old facets
    while (oldFacetIndex < oldFacets.length) {
        var oldFacet = oldFacets[oldFacetIndex];
        
        var oldFacetKey = getKey(oldFacet);
        if (!(oldFacetKey in oldFacetKeys)) {
            SimileAjax.Debug.log("Facet merging algorithm is broken " + oldFacetKey);
        }
        
        oldFacet.facet.dispose();
        oldFacetIndex++;
    }
    
    this._facetInfos = newFacetInfos;
};

Exhibit.BrowsePanel.prototype._constructFacet = function(facet) {
    var facetDiv = document.createElement("div");
    var listFacet = new Exhibit.ListFacet(this._exhibit, facet, facetDiv, this._configuration);
    return [ facetDiv, listFacet ];
};
