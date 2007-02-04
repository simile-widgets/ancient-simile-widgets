/*==================================================
 *  Exhibit.MapView
 *==================================================
 */

Exhibit.MapView = function(exhibit, div, configuration, domConfiguration, globalConfiguration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    this._globalConfiguration = globalConfiguration;
    
    this._lensConfiguration = {};
    if ("Lens" in globalConfiguration) {
        this._lensConfiguration["Lens"] = globalConfiguration["Lens"];
    }
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
    
    /*
     *  Getter for lat/lng
     */
    var getLatLng = null;
    try {
        var makeGetLatLng = function(s, mazExpression) {
            var latlngExpression = Exhibit.Expression.parse(s);
            return function(itemID, database) {
                var result = {};
                var x = Exhibit.MapView.evaluateSingle(latlngExpression, itemID, database);
                if (x != null) {
                    var a = x.split(",");
                    if (a.length == 2) {
                        result.lat = (typeof a[0] == "number") ? a[0] : parseFloat(a[0]);
                        result.lng = (typeof a[1] == "number") ? a[1] : parseFloat(a[1]);
                    }
                }

                var z = mazExpression && Exhibit.MapView.evaluateSingle(mazExpression, itemID, database);
                if (z != null) {
                    z = parseInt(z, 10);
                    if( typeof z == "number" )
                        result.maxAutoZoom = z;
                }
                return result;
            };
        };
        var makeGetLatLng2 = function(lat, lng, mazExpression) {
            var latExpression = Exhibit.Expression.parse(lat);
            var lngExpression = Exhibit.Expression.parse(lng);
            return function(itemID, database) {
                var result = {};
                var lat = Exhibit.MapView.evaluateSingle(latExpression, itemID, database);
                var lng = Exhibit.MapView.evaluateSingle(lngExpression, itemID, database);
                if (lat != null && lng != null) {
                    result.lat = (typeof lat == "number") ? lat : parseFloat(lat);
                    result.lng = (typeof lng == "number") ? lng : parseFloat(lng);
                }

                var z = mazExpression && Exhibit.MapView.evaluateSingle(mazExpression, itemID, database);
                if (z != null) {
                    z = parseInt(z, 10);
                    if( typeof z == "number" )
                        result.maxAutoZoom = z;
                }
                return result;
            }
        };

        if (domConfiguration != null) {
            var maxAZ = Exhibit.getAttribute(domConfiguration, "maxAutoZoom");
            if (maxAZ != null && maxAZ.length > 0) {
                maxAZ = Exhibit.Expression.parse(maxAZ);
            } else
                maxAZ = null;
            var latlng = Exhibit.getAttribute(domConfiguration, "latlng");
            if (latlng != null && latlng.length > 0) {
                getLatLng = makeGetLatLng(latlng, maxAZ);
            } else {
                var lat = Exhibit.getAttribute(domConfiguration, "lat");
                var lng = Exhibit.getAttribute(domConfiguration, "lng");
                if (lat != null && lng != null && lat.length > 0 && lng.length > 0) {
                    getLatLng = makeGetLatLng2(lat, lng, maxAZ);
                }
            }
        }
        
        if ("latlng" in configuration) {
            getLatLng = makeGetLatLng(configuration.latlng);
        } else if ("lat" in configuration && "lng" in configuration) {
            getLatLng = makeGetLatLng2(configuration.lat, configuration.lng);
        }
    } catch (e) {
        SimileAjax.Debug.exception("MapView: Error processing lat/lng configuration of map view", e);
    }
    this._getLatLng = (getLatLng != null) ? getLatLng : function(itemID, database) { return {}; };
    
    /*
     *  Getter for marker key
     */
    var getMarkerKey = null;
    try {
        var makeGetMarker = function(s) {
            var markerExpression = Exhibit.Expression.parse(s);
            return function(itemID, database) {
                var key = Exhibit.MapView.evaluateSingle(markerExpression, itemID, database);
                return key != null ? key : "";
            };
        };
        
        if (domConfiguration != null) {
            var marker = Exhibit.getAttribute(domConfiguration, "marker");
            if (marker != null && marker.length > 0) {
                getMarkerKey = makeGetMarker(marker);
            }
        }
        if ("marker" in configuration) {
            getMarkerKey = makeGetMarker(configuration.marker);
        }
    } catch (e) {
        SimileAjax.Debug.exception("MapView: Error processing marker configuration of map view", e);
    }
    this._getMarkerKey = (getMarkerKey != null) ? getMarkerKey : function(itemID, database) { return ""; };
    
    /*
     *  Map settings
     */
    this._mapSettings = {
// set by the bounds of all plotted markers unless set up in page configuration
//      center:         [ 20, 0 ],
//      zoom:           2,
        maxAutoZoom:    18,
        size:           "small",
        scaleControl:   true,
	overviewControl:false,
        type:           "normal"
    };
    if (domConfiguration != null) {
        var s = Exhibit.getAttribute(domConfiguration, "center");
        if (s != null && s.length > 0) {
            var a = s.split(",");
            if (a.length == 2) {
                a[0] = parseFloat(a[0]);
                a[1] = parseFloat(a[1]);
                if (typeof a[0] == "number" && typeof a[1] == "number") {
                    this._mapSettings.center = a;
                }
            }
        }
        
        s = Exhibit.getAttribute(domConfiguration, "zoom");
        if (s != null && s.length > 0) {
            this._mapSettings.zoom = parseInt(s);
        }
        
        s = Exhibit.getAttribute(domConfiguration, "size");
        if (s != null && s.length > 0) {
            this._mapSettings.size = s;
        }
        
        s = Exhibit.getAttribute(domConfiguration, "scaleControl");
        if (s != null && s.length > 0) {
            this._mapSettings.scaleControl = (s == "true");
        }

        s = Exhibit.getAttribute(domConfiguration, "overviewControl");
        if (s != null && s.length > 0) {
            this._mapSettings.overviewControl = (s == "true");
        }

        s = Exhibit.getAttribute(domConfiguration, "type");
        if (s != null && s.length > 0) {
            this._mapSettings.type = s;
        }
    }
    if ("center" in configuration) {
        this._mapSettings.center = this._configuration.center;
    }
    if ("zoom" in configuration) {
        this._mapSettings.zoom = configuration.zoom;
    }
    if ("maxAutoZoom" in configuration) {
        this._mapSettings.maxAutoZoom = configuration.maxAutoZoom;
    }
    if ("size" in configuration) {
        this._mapSettings.size = configuration.size;
    }
    if ("scaleControl" in configuration) {
        this._mapSettings.scaleControl = configuration.scaleControl;
    }
    if ("type" in configuration) {
        this._mapSettings.type = configuration.type;
    }
    
    /*
     *  Internal stuff such as caches
     */
    this._latlngCache = new Object();
    this._markerKeyCache = new Object();
    this._markerCache = new Object();
    this._maxMarker = 0;
    
    /*
     *  Initialize UI and register event listeners
     */
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

Exhibit.MapView._markers = [
    {   color:  "FF9000"
    },
    {   color:  "5D7CBA"
    },
    {   color:  "A97838"
    },
    {   color:  "8B9BBA"
    },
    {   color:  "FFC77F"
    },
    {   color:  "003EBA"
    },
    {   color:  "29447B"
    },
    {   color:  "543C1C"
    }
];
Exhibit.MapView._wildcardMarker = {
    color:  "888888"
};
Exhibit.MapView._mixMarker = {
    color:  "FFFFFF"
};

Exhibit.MapView.evaluateSingle = function(expression, itemID, database) {
    return expression.evaluateSingle(
        { "value" : itemID },
        { "value" : "item" },
          "value",
          database
    ).value;
}

Exhibit.MapView.lookupLatLng = function(set, addressExpressionString, outputProperty, outputTextArea, database, accuracy) {
    if (accuracy == undefined) {
        accuracy = 4;
    }
    
    var expression = Exhibit.Expression.parse(addressExpressionString);
    var jobs = [];
    set.visit(function(item) {
        var address = Exhibit.MapView.evaluateSingle(expression, item, database);
        if (address != null) {
            jobs.push({ item: item, address: address });
        }
    });
    
    var results = [];
    var geocoder = new GClientGeocoder();
    var cont = function() {
        if (jobs.length > 0) {
            var job = jobs.shift();
            geocoder.getLocations(
                job.address,
                function(json) {
                    if ("Placemark" in json) {
                        json.Placemark.sort(function(p1, p2) {
                            return p2.AddressDetails.Accuracy - p1.AddressDetails.Accuracy;
                        });
                    }
                    
                    if ("Placemark" in json && 
                        json.Placemark.length > 0 && 
                        json.Placemark[0].AddressDetails.Accuracy >= accuracy) {
                        
                        var coords = json.Placemark[0].Point.coordinates;
                        var lat = coords[1];
                        var lng = coords[0];
                        results.push("\t{ id: '" + job.item + "', " + outputProperty + ": '" + lat + "," + lng + "' }");
                    } else {
                        var segments = job.address.split(",");
                        if (segments.length == 1) {
                            results.push("\t{ id: '" + job.item + "' }");
                        } else {
                            job.address = segments.slice(1).join(",").replace(/^\s+/, "");
                            jobs.unshift(job); // do it again
                        }
                    }
                    cont();
                }
            );
        } else {
            outputTextArea.value = results.join(",\n");
        }
    };
    cont();
};

Exhibit.MapView.prototype.dispose = function() {
    this._exhibit.getBrowseEngine().removeListener(this._listener);
    
    this._div.innerHTML = "";
    
    this._dom.map = null;
    this._dom = null;
    this._div = null;
    this._exhibit = null;
    
    GUnload();
};

Exhibit.MapView.prototype._initializeUI = function() {
    var self = this;
    
    this._div.innerHTML = "";
    this._dom = Exhibit.MapView.theme.constructDom(
        this._exhibit, 
        this._div, 
        function(elmt, evt, target) {
            self._exhibit.getViewPanel().resetBrowseQuery();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    );
    
    var mapDiv = this._dom.getMapDiv();
    mapDiv.style.height = "400px";
    
    if ("constructMap" in this._configuration) {
        this._dom.map = this._configuration.constructMap(mapDiv);
    } else {
        var settings = this._mapSettings;
        
        this._dom.map = new GMap2(mapDiv);
        this._dom.map.enableDoubleClickZoom();
        this._dom.map.enableContinuousZoom();

        this._dom.map.setCenter(new GLatLng(20, 0), 2);
        this._dom.map.addControl(settings.size == "small" ?
            new GSmallMapControl() : new GLargeMapControl());
	if (settings.overviewControl) {
	    this._dom.map.addControl(new GOverviewMapControl);
	}

        if (settings.scaleControl) {
            this._dom.map.addControl(new GScaleControl());
        }
        this._dom.map.addControl(new GMapTypeControl());
        
        switch (settings.type) {
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
    this._dom.clearLegend();
    if (currentSize > 0) {
        var locationToData = {};
        
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
                
                var latlngKey = latlng.lat + "," + latlng.lng;
                var locationData = locationToData[latlngKey];
                if (!(locationData)) {
                    locationData = {
                        latlng:     latlng,
                        items:      [],
                        markerKey:  markerKey
                    };
                    locationToData[latlngKey] = locationData;
                } else if (locationData.markerKey != markerKey) {
                    locationData.markerKey = null;
                }
                
                locationData.items.push(itemID);
                
                mappableSize++;
            }
        });
        
        var usedKeys = {};
        var shape = Exhibit.MapView._defaultMarkerShape;
        var bounds, maxAutoZoom = Infinity;
        var addMarkerAtLocation = function(locationData) {
            var items = locationData.items;
            if( !bounds ) {
                bounds = new GLatLngBounds();
            }

            var markerData;
            if (locationData.markerKey == null) {
                markerData = Exhibit.MapView._mixMarker;
            } else {
                usedKeys[locationData.markerKey] = true;
                if (locationData.markerKey in self._markerCache) {
                    markerData = self._markerCache[locationData.markerKey];
                } else {
                    markerData = Exhibit.MapView._markers[self._maxMarker];
                    self._markerCache[locationData.markerKey] = markerData;
                    self._maxMarker = (self._maxMarker + 1) % Exhibit.MapView._markers.length;
                }
            }
            
            var icon;
            if (items.length == 1) {
                if (!("icon" in markerData)) {
                    markerData.icon = Exhibit.MapView._makeIcon(shape, markerData.color, "space");
                }
                icon = markerData.icon;
            } else {
                icon = Exhibit.MapView._makeIcon(
                    shape, 
                    markerData.color, 
                    locationData.items.length > 50 ? "..." : locationData.items.length
                );
            }

            var point = new GLatLng(locationData.latlng.lat, locationData.latlng.lng);
            var marker = new GMarker(point, icon);
            if (maxAutoZoom > locationData.latlng.maxAutoZoom)
                maxAutoZoom = locationData.latlng.maxAutoZoom;
            bounds.extend(point);

            GEvent.addListener(marker, "click", function() { 
                marker.openInfoWindow(self._createInfoWindow(items)); 
            });
            self._dom.map.addOverlay(marker);
        }
        for (latlngKey in locationToData) {
            addMarkerAtLocation(locationToData[latlngKey]);
        }
        if (bounds && typeof this._mapSettings.zoom == "undefined") {
            var zoom = Math.max(0,self._dom.map.getBoundsZoomLevel(bounds)-1);
            //console.log( zoom, this._mapSettings.maxAutoZoom, maxAutoZoom );
            zoom = Math.min(zoom, maxAutoZoom, this._mapSettings.maxAutoZoom);
            self._dom.map.setZoom(zoom);
        }
        if (bounds && typeof this._mapSettings.center == "undefined")
            self._dom.map.setCenter(bounds.getCenter());

        var legendLabels = [];
        var legendIcons = [];
        var shape = Exhibit.MapView._defaultMarkerShape;
        for (markerKey in this._markerCache) {
            if (markerKey in usedKeys) {
                var markerData = this._markerCache[markerKey];
                legendLabels.push(markerKey);
                legendIcons.push(Exhibit.MapView._markerUrlPrefix + 
                    [   shape,
                        markerData.color,
                        [ "m", shape, markerData.color, "legend.png" ].join("-")
                    ].join("/")
                );
            }
        }
        legendLabels.push(Exhibit.MapView.l10n.mixedLegendKey);
        legendIcons.push(Exhibit.MapView._markerUrlPrefix + 
            [   shape,
                "FFFFFF",
                [ "m", shape, "FFFFFF", "legend.png" ].join("-")
            ].join("/")
        );
        
        this._dom.addLegendBlock(Exhibit.MapView.theme.constructLegendBlockDom(
            this._exhibit,
            Exhibit.MapView.l10n.colorLegendTitle,
            legendIcons,
            legendLabels
        ));
        
        this._dom.setTypes(database.getTypeLabels(currentSet)[currentSize > 1 ? 1 : 0]);
    }
    this._dom.setCounts(currentSize, mappableSize, originalSize);
};

Exhibit.MapView.prototype._createInfoWindow = function(items) {
    if (items.length > 1) {
        var ul = document.createElement("ul");
        for (var i = 0; i < items.length; i++) {
            var li = document.createElement("li");
            li.appendChild(this._exhibit.makeItemSpan(items[i]));
            ul.appendChild(li);
        }
        return ul;
    } else {
        var itemLensDiv = document.createElement("div");
        var itemLens = new Exhibit.Lens(items[0], itemLensDiv, this._exhibit, this._lensConfiguration);
        return itemLensDiv;
    }
};

Exhibit.MapView._iconData = null;
Exhibit.MapView._markerUrlPrefix = "http://static.simile.mit.edu/graphics/maps/markers/";
Exhibit.MapView._defaultMarkerShape = "square";

Exhibit.MapView._makeIcon = function(shape, color, label) {
    /*
     *  Some static initialization is delayed until here.
     */
    if (Exhibit.MapView._iconData == null) {
        Exhibit.MapView._iconData = {
            iconSize:           new GSize(40, 35),
            iconAnchor:         new GPoint(20, 35),
            shadowSize:         new GSize(55, 40),
            infoWindowAnchor:   new GPoint(19, 1),
            imageMap:           [ 6,0, 6,22, 15,22, 20,34, 25,25, 34,22, 34,0 ]
        };
    }
    
    var data = Exhibit.MapView._iconData;
    var icon = new GIcon(G_DEFAULT_ICON);
    icon.image = Exhibit.MapView._markerUrlPrefix + 
        [   shape,
            color,
            [ "m", shape, color, label + ".png" ].join("-")
        ].join("/");
    icon.shadow = Exhibit.MapView._markerUrlPrefix + [ "m", shape, "shadow.png" ].join("-");
    icon.iconSize = data.iconSize;
    icon.iconAnchor = data.iconAnchor;
    icon.imageMap = data.imageMap;
    icon.shadowSize = data.shadowSize;
    icon.infoWindowAnchor = data.infoWindowAnchor;
    
    return icon;
};
