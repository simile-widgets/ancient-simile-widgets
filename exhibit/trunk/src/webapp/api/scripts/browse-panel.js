/*======================================================================
 *  Exhibit.BrowsePanel
 *  http://simile.mit.edu/wiki/Exhibit/API/BrowsePanel
 *======================================================================
 */
 
Exhibit.BrowsePanel = function(exhibit, div, configuration) {
    if (configuration == null) {
        var o = Exhibit.getAttribute(div, "configuration");
        if (o != null && o.length > 0) {
            try {
                o = eval(o);
                if (typeof o == "object") {
                    configuration = o;
                } else {
                    SimileAjax.Debug.log(
                        "The ex:configuration attribute value in <div id=\"exhibit-browse-panel\"> does not evaluate to an object"
                    );
                }
            } catch (e) {
                SimileAjax.Debug.exception(
                    "The ex:configuration attribute value in <div id=\"exhibit-browse-panel\"> is not a valid Javascript expression",
                    e
                );
            }
        }
    }
    
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
    // TODO: Implement
    return null;
};

Exhibit.BrowsePanel.prototype.setState = function(state) {
    // TODO: Implement
};

Exhibit.BrowsePanel.prototype._configure = function(configuration) {
    if (configuration == null || !("BrowseEngine" in configuration)) {
        var s = Exhibit.getAttribute(this._div, "facets");
        if (s != null && s.length > 0) {
            var a = s.split(",");
            for (var i = 0; i < a.length; i++) {
                a[i] = a[i].trim();
            }
            this._browseEngine.setFacets(a);
        }
    }
};

Exhibit.BrowsePanel.prototype._initializeUI = function() {
    this._div.innerHTML = "";
    
    Exhibit.protectUI(this._div);
    SimileAjax.DOM.appendClassName(this._div, "exhibit-browsePanel");
    
    var logoColor = "Silver";
    var s = Exhibit.getAttribute(document.body, "exhibitLogoColor");
    if (s != null && s.length > 0) {
        logoColor = s;
    }
    
    this._dom = Exhibit.BrowsePanel.theme.constructBrowsePanel(
        this._exhibit, 
        this._div, 
        "http://simile.mit.edu/graphics/logos/exhibit/exhibit-small-" + logoColor + ".png"
    );
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
    var facetContainer = this._dom.facetContainer;
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
    var node = facetContainer.firstChild;
    
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
                    facetContainer.appendChild(result[0]);
                } else {
                    facetContainer.insertBefore(result[0], node);
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
            facetContainer.appendChild(result[0]);
        } else {
            facetContainer.insertBefore(result[0], node);
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
