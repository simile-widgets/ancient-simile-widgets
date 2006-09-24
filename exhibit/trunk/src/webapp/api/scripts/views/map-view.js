/*==================================================
 *  Exhibit.MapView
 *==================================================
 */
 
Exhibit.MapView = function(exhibit, div, configuration, globalConfiguration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    this._globalConfiguration = globalConfiguration;
    
    var getLatLng = null;
    try {
        if ("latlng" in configuration) {
            var latlngExpression = Exhibit.Expression.parse(configuration.latlng);
            getLatLng = function(itemID, database) {
                var result = {};
                var x = latlngExpression.evaluateSingle(
                    { "value" : itemID }, 
                    { "value" : "item" }, 
                    "value",
                    database
                ).value;
                
                if (x != null) {
                    var a = x.split(",");
                    if (a.length == 2) {
                        result.lat = (typeof a[0] == "number") ? a[0] : parseFloat(a[0]);
                        result.lng = (typeof a[1] == "number") ? a[1] : parseFloat(a[1]);
                    }
                }
                return result;
            }
        } else if ("lat" in configuration && "lng" in configuration) {
            var latExpression = Exhibit.Expression.parse(configuration.lat);
            var lngExpression = Exhibit.Expression.parse(configuration.lng);
            getLatLng = function(itemID, database) {
                var result = {};
                var lat = latExpression.evaluateSingle(
                    { "value" : itemID }, 
                    { "value" : "item" }, 
                    "value",
                    database
                ).value;
                var lng = lngExpression.evaluateSingle(
                    { "value" : itemID }, 
                    { "value" : "item" }, 
                    "value",
                    database
                ).value;
                
                if (lat != null && lng != null) {
                    result.lat = (typeof lat == "number") ? lat : parseFloat(lat);
                    result.lng = (typeof lng == "number") ? lng : parseFloat(lng);
                }
                return result;
            }
        }
    } catch (e) {
        SimileAjax.Debug.exception(e);
    }
    
    var getMarkerKey = null;
    try {
        if ("marker" in configuration) {
            var markerExpression = Exhibit.Expression.parse(configuration.marker);
            getMarkerKey = function(itemID, database) {
                var key = markerExpression.evaluateSingle(
                    { "value" : value }, 
                    { "value" : valueType }, 
                    "value",
                    database
                ).value;
                
                return key != null ? key : "";
            }
        }
    } catch (e) {
        SimileAjax.Debug.exception(e);
    }
    
    this._getLatLng = (getLatLng != null) ? getLatLng : function(itemID, database) { return {}; };
    this._getMarkerKey = (getMarkerKey != null) ? getMarkerKey : function(itemID, database) { return ""; };
        
    this._latlngCache = new Object();
    this._markerKeyCache = new Object();
    this._markerCache = new Object();
    this._maxMarker = 0;
    
    this._initializeUI();
    
    var view = this;
    this._exhibit.getBrowseEngine().addListener({ 
        onChange: function(handlerName) { 
            if (handlerName != "onGroup" && handlerName != "onUngroup") {
                view._reconstruct(); 
            }
        } 
    });
};

Exhibit.MapView._markers = [
];
Exhibit.MapView._wildcardMarker = {
};

Exhibit.MapView.lookupLatLng = function(set, addressExpressionString, outputProperty, outputTextArea, database) {
    var expression = Exhibit.Expression.parse(addressExpressionString);
    var jobs = [];
    set.visit(function(item) {
        var address = expression.evaluateSingle(
            { "value" : item }, 
            { "value" : "item" }, 
            "value",
            database
        ).value;
        
        if (address != null) {
            jobs.push({ item: item, address: address });
        }
    });
    
    var results = [];
    var geocoder = new GClientGeocoder();
    var cont = function() {
        if (jobs.length > 0) {
            var job = jobs.shift();
            geocoder.getLatLng(
                job.address,
                function(point) {
                    if (point) {
                        results.push({ item: job.item, point: point });
                    }
                    cont();
                }
            );
        } else {
            var s = [];
            for (var i = 0; i < results.length; i++) {
                var r = results[i];
                s.push("\t{ id: '" + r.item + "', " + outputProperty + ": '" + r.point.lat() + "," + r.point.lng() + "' }");
            }
            outputTextArea.value = s.join(",\n");
        }
    };
    cont();
};

Exhibit.MapView.prototype.dispose = function() {
    this._dom.map = null;
    this._dom = null;
    
    this._div.innerHTML = "";
    this._div = null;
    this._exhibit = null;
    
    GUnload();
};

Exhibit.MapView.prototype._initializeUI = function() {
    this._div.innerHTML = "";
    this._dom = Exhibit.MapView.theme.constructDom(this._exhibit, this._div, function() {});
    
    var mapDiv = this._dom.getMapDiv();
    mapDiv.style.height = "400px";
    
    if ("constructMap" in this._configuration) {
        this._dom.map = this._configuration.constructMap(mapDiv);
    } else {
        this._dom.map = new GMap2(mapDiv);
        this._dom.map.enableDoubleClickZoom();
        this._dom.map.enableContinuousZoom();
        
        if ("center" in this._configuration) {
            var lat = this._configuration.center[0];
            var lng = this._configuration.center[1];
        } else {
            var lat = 20;
            var lng = 0;
        }
        var zoom = ("zoom" in this._configuration) ? this._configuration.zoom : 2;
        this._dom.map.setCenter(new GLatLng(lat, lng), zoom);
        
        if ("size" in this._configuration && this._configuration.size == "small") {
            this._dom.map.addControl(new GSmallMapControl());
        } else {
            this._dom.map.addControl(new GLargeMapControl());
        }
        
        if (!("scaleControl" in this._configuration) || this._configuration.scaleControl) {
            this._dom.map.addControl(new GScaleControl());
        }
        
        this._dom.map.addControl(new GMapTypeControl());
        if ("type" in this._configuration) {
            switch (this._configuration.type) {
            case "normal":
                this._dom.map.setMapType(G_NORMAL_MAP);
                break;
            case "satellite":
                this._dom.map.setMapType(G_SATELLITE_MAP);
                break;
            case "hybrid":
                this._dom.map.setMapType(G_HYBRID_MAP);
                break;
            }
        }
    }
    this._reconstruct();
};

Exhibit.MapView.prototype._reconstruct = function() {
    var self = this;
    var exhibit = this._exhibit;
    var database = exhibit.getDatabase();
    
    /*
     *  Get the current collection and check if it's empty
     */
    var collection = exhibit.getBrowseEngine().getCurrentCollection();
    var originalSize = 0;
    var currentSize = 0;
    var mappableSize = 0;
    if (collection != null) {
        originalSize = collection.originalSize();
        
        var currentSet = collection.getCurrentSet();
        currentSize = currentSet.size();
    }
    
    this._dom.map.clearOverlays();
    if (currentSize > 0) {
        var colorKeys = [];
        
        currentSet.visit(function(itemID) {
            var latlng;
            if (itemID in self._latlngCache) {
                latlng = self._latlngCache[itemID];
            } else {
                latlng = self._getLatLng(itemID, database);
                self._latlngCache[itemID] = latlng;
            }
            
            if ("lat" in latlng && "lng" in latlng) {
                var markerKey;
                if (itemID in self._markerKeyCache) {
                    markerKey = self._markerKeyCache[itemID];
                } else {
                    markerKey = self._getMarkerKey(itemID, database);
                    self._markerKeyCache[itemID] = markerKey;
                }
                
                var marker;
                if (markerKey in self._markerCache) {
                    marker = self._markerCache[markerKey];
                } else if (self._maxMarker >= Exhibit.MapView._markers.length) {
                    marker = Exhibit.MapView._wildcardMarker;
                    self._markerCache[markerKey] = marker;
                } else {
                    marker = Exhibit.MapView._markers[self._maxMarker++];
                    self._markerCache[markerKey] = marker;
                }
                
                var point = new GLatLng(latlng.lat, latlng.lng);
                var marker = new GMarker(point, G_DEFAULT_ICON);
                GEvent.addListener(marker, "click", function() { marker.openInfoWindow(links); });
                
                self._dom.map.addOverlay(marker);
                mappableSize++;
            }
        });
        
        this._dom.setTypes(database.getTypeLabels(currentSet)[currentSize > 1 ? 1 : 0]);
    }
    this._dom.setCounts(currentSize, mappableSize, originalSize);
};