/*==================================================
 *  Rubik.BrowsePanel
 *==================================================
 */
 
Rubik.BrowsePanel = function(rubik, div, configuration) {
    this._rubik = rubik;
    this._database = rubik.getDatabase();
    this._browseEngine = rubik.getBrowseEngine();
    this._div = div;
    
    this._configure(configuration);
    this._facetInfos = [];
    
    var browsePanel = this;
    this._browseEngine.addListener({ onChange: function() { browsePanel._reconstruct(); } });
    
    this._initializeUI();
};

Rubik.BrowsePanel.prototype._configure = function(configuration) {
    if ("BrowsePanel" in configuration) {
        var myConfig = configuration["BrowsePanel"];
    }
};

Rubik.BrowsePanel.prototype._initializeUI = function() {
    this._div.innerHTML = "";
    
    Rubik.protectUI(this._div);
    SimileAjax.DOM.appendClassName(this._div, "rubik-browsePanel");
};

Rubik.BrowsePanel.prototype._reconstruct = function() {
    var newFacets = this._browseEngine.getFacets();
    /*  Note that the order of facets never changes, although
        some might disappear and reappear at different times.
    */
    
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
        if (oldFacetKey in oldFacetKeys) {
            SimileAjax.Debug.log("Facet merging algorithm is broken");
        }
        
        oldFacet.facet.dispose();
        oldFacetIndex++;
    }
    
    this._facetInfos = newFacetInfos;
};

Rubik.BrowsePanel.prototype._constructFacet = function(facet) {
    var facetDiv = document.createElement("div");
    var facet = new Rubik.ListFacet(this._rubik, facet, facetDiv, this._configuration);
    return [ facetDiv, facet ];
};

Rubik.BrowsePanel.prototype.setLocation = function(newLocation) {
    var browsePanel = this;
    performLongTask(function() {
        browsePanel._browseEngine.focus(newLocation);
        browsePanel._facetInfos = [];
        browsePanel._reconstruct();
    }, "please wait...");
};

Rubik.BrowsePanel.prototype.reset = function() {
    var browsePanel = this;
    performLongTask(function() {
        browsePanel._browseEngine.truncate(1);
        browsePanel._browseEngine.clearAllCurrentFilters();
        browsePanel._facetInfos = [];
        browsePanel._reconstruct();
        
        setHistoryPosition(browsePanel._focusIndex);
    }, "please wait...");
};
