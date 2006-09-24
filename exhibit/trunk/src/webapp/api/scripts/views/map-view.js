/*==================================================
 *  Exhibit.MapView
 *==================================================
 */
 
Exhibit.MapView = function(exhibit, div, configuration, globalConfiguration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    this._globalConfiguration = globalConfiguration;
    
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

Exhibit.MapView.prototype.dispose = function() {
    if (this._map != null) {
        this._map = null;
        GUnload();
    }
    
    this._div.innerHTML = "";
    this._dom = null;
    this._div = null;
    this._exhibit = null;
};

Exhibit.MapView.prototype._initializeUI = function() {
    this._div.innerHTML = "";
    this._dom = Exhibit.MapView.theme.constructDom(this._exhibit, this._div, function() {});
    
    var mapDiv = this._dom.getMapDiv();
    mapDiv.style.height = "400px";
    
    this._map = new GMap2(mapDiv);
    this._map.enableDoubleClickZoom();
    this._map.enableContinuousZoom();
    
    this._map.addControl(new GSmallMapControl());
    this._map.addControl(new GMapTypeControl());
    this._map.addControl(new GScaleControl());
    this._map.setCenter(new GLatLng(20, 0), 2);
    //this._reconstruct();
};

Exhibit.MapView.prototype._reconstruct = function() {
};