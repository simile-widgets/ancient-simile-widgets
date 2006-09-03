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
    
    var browsePanel = this;
    var reconstruct = function() { browsePanel._reconstruct(); };
    this._browseEngine.addListener({
        onRootCollectionSet: reconstruct,
        onRestrict: reconstruct
    });
    
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

Rubik.BrowsePanel.prototype._reconstruct = function(scrollInfo) {
    this._div.innerHTML = "";
    
    var facets = this._browseEngine.getFacets();
    for (var i = 0; i < facets.length; i++) {
        var facet = facets[i];
        if (facet.count > 0) {
            this._div.appendChild(this._constructFacet(facet));
        }
    }
};

Rubik.BrowsePanel.prototype._constructFacet = function(facet) {
    var facetDiv = document.createElement("div");
    var facet = new Rubik.ListFacet(this._rubik, facet, facetDiv, this._configuration);
    return facetDiv;
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
