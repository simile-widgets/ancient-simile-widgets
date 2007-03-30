/*==================================================
 *  Exhibit.MapView
 *==================================================
 */

Exhibit.MapView = function(collection, containerElmt, lensRegistry, exhibit) {
    this._collection = collection;
    this._div = containerElmt;
    this._lensRegistry = lensRegistry;
    this._exhibit = exhibit;

    this._settings = {
        center:             [20,0],
        zoom:               2,
        size:               "small",
        scaleControl:       true,
        overviewControl:    false,
        type:               "normal",
        bubbleTip:          "top",
        mapConstructor:     null
    };
    this._accessors = {};
    
    this._latlngCache = new Object();
    this._markerKeyCache = new Object();
    this._markerCache = new Object();
    this._maxMarker = 0;
    
    var view = this;
    this._listener = { 
        onItemsChanged: function() {
            view._reconstruct(); 
        }
    };
    collection.addListener(this._listener);
};

Exhibit.MapView._settingSpecs = {
    "center":           { type: "float", dimensions: 2 },
    "zoom":             { type: "float" },
    "size":             { type: "text" },
    "scaleControl":     { type: "boolean" },
    "overviewControl":  { type: "boolean" },
    "type":             { type: "enum", choices: [ "normal", "satellite", "hybrid" ] },
    "bubbleTip":        { type: "enum", choices: [ "top", "bottom" ] },
    "mapConstructor":   { type: "function" }
};

Exhibit.MapView._accessorSpecs = [
    {   accessorName: "getLatlng",
        alternatives: [
            {   bindings: [
                    {   attributeName:  "latlng",
                        types:          [ "float", "float" ],
                        bindingNames:   [ "lat", "lng" ]
                    },
                    {   attributeName:  "maxAutoZoom",
                        type:           "float",
                        bindingName:    "maxAutoZoom",
                        optional:       true
                    }
                ]
            },
            {   bindings: [
                    {   attributeName:  "lat",
                        type:           "float",
                        bindingName:    "lat"
                    },
                    {   attributeName:  "lng",
                        type:           "float",
                        bindingName:    "lng"
                    },
                    {   attributeName:  "maxAutoZoom",
                        type:           "float",
                        bindingName:    "maxAutoZoom",
                        optional:       true
                    }
                ]
            }
        ]
    },
    {   accessorName:   "getColor",
        attributeName:  "marker",
        type:           "text"
    }
];

Exhibit.MapView.create = function(configuration, containerElmt, lensRegistry, exhibit) {
    var collection = Exhibit.Collection.getCollection(configuration, exhibit);
    var lensRegistry2 = Exhibit.Component.createLensRegistry(configuration, lensRegistry);
    var view = new Exhibit.MapView(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        lensRegistry2, 
        exhibit
    );
    
    Exhibit.MapView._configure(view, configuration);
    
    view._initializeUI();
    return view;
};

Exhibit.MapView.createFromDOM = function(configElmt, containerElmt, lensRegistry, exhibit) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var collection = Exhibit.Collection.getCollectionFromDOM(configElmt, configuration, exhibit);
    var lensRegistry2 = Exhibit.Component.createLensRegistryFromDOM(configElmt, configuration, lensRegistry);
    var view = new Exhibit.MapView(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        lensRegistry2, 
        exhibit
    );
    
    Exhibit.SettingsUtilities.createAccessorsFromDOM(configElmt, Exhibit.MapView._accessorSpecs, view._accessors);
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.MapView._settingSpecs, view._settings);
    Exhibit.MapView._configure(view, configuration);
    
    view._initializeUI();
    return view;
};

Exhibit.MapView._configure = function(view, configuration) {
    Exhibit.SettingsUtilities.createAccessors(configuration, Exhibit.MapView._accessorSpecs, view._accessors);
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.MapView._settingSpecs, view._settings);
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

Exhibit.MapView.lookupLatLng = function(set, addressExpressionString, outputProperty, outputTextArea, database, accuracy) {
    if (accuracy == undefined) {
        accuracy = 4;
    }
    
    var expression = Exhibit.Expression.parse(addressExpressionString);
    var jobs = [];
    set.visit(function(item) {
        var address = expression.evaluateSingle(
            { "value" : item },
            { "value" : "item" },
            "value",
            database
        ).value
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
    this._collection.removeListener(this._listener);
    
    this._div.innerHTML = "";
    
    this._dom.map = null;
    this._dom = null;
    this._div = null;
    this._collection = null;
    this._exhibit = null;
    
    GUnload();
};

Exhibit.MapView.prototype._initializeUI = function() {
    var self = this;
    
    this._div.innerHTML = "";
    this._dom = Exhibit.MapView.theme.constructDom(
        this._collection,
        this._exhibit, 
        this._div, 
        function(elmt, evt, target) {
            Exhibit.ViewPanel.resetCollection(self._collection);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    );
    
    var mapDiv = this._dom.getMapDiv();
    mapDiv.style.height = "400px";
    
    var settings = this._settings;
    if (settings._mapConstructor != null) {
        this._dom.map = settings._mapConstructor(mapDiv);
    } else {
        this._dom.map = new GMap2(mapDiv);
        this._dom.map.enableDoubleClickZoom();
        this._dom.map.enableContinuousZoom();

        this._dom.map.setCenter(new GLatLng(settings.center[0], settings.center[1]), settings.zoom);
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
    var settings = this._settings;
    var accessors = this._accessors;
    
    /*
     *  Get the current collection and check if it's empty
     */
    var originalSize = this._collection.countAllItems();
    var currentSize = this._collection.countRestrictedItems();
    var mappableSize = 0;
    
    this._dom.map.clearOverlays();
    this._dom.clearLegend();
    if (currentSize > 0) {
        var currentSet = this._collection.getRestrictedItems();
        var locationToData = {};
        
        currentSet.visit(function(itemID) {
            var latlng = null;
            if (itemID in self._latlngCache) {
                latlng = self._latlngCache[itemID];
            } else {
                accessors.getLatlng(itemID, database, function(v) { latlng = v; });
                self._latlngCache[itemID] = latlng;
            }
            
            if (latlng != null && "lat" in latlng && "lng" in latlng) {
                var markerKey;
                if (itemID in self._markerKeyCache) {
                    markerKey = self._markerKeyCache[itemID];
                } else {
                    accessors.getColor(itemID, database, function(v) { markerKey = v; });
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
                    markerData.icon = Exhibit.MapView._makeIcon(shape, markerData.color, "space", settings.bubbleTip);
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
		self._dom.map.openInfoWindow(marker.getPoint(),
					     self._createInfoWindow(items));
            });
            self._dom.map.addOverlay(marker);
        }
        for (latlngKey in locationToData) {
            addMarkerAtLocation(locationToData[latlngKey]);
        }
        if (bounds && typeof settings.zoom == "undefined") {
            var zoom = Math.max(0,self._dom.map.getBoundsZoomLevel(bounds)-1);
            //console.log( zoom, settings.maxAutoZoom, maxAutoZoom );
            zoom = Math.min(zoom, maxAutoZoom, settings.maxAutoZoom);
            self._dom.map.setZoom(zoom);
        }
        if (bounds && typeof settings.center == "undefined")
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
            li.appendChild(Exhibit.UI.makeItemSpan(items[i], null, null, this._lensRegistry, this._exhibit));
            ul.appendChild(li);
        }
        return ul;
    } else {
        var itemLensDiv = document.createElement("div");
        var itemLens = this._lensRegistry.createLens(items[0], itemLensDiv, this._exhibit);
        return itemLensDiv;
    }
};

Exhibit.MapView._iconData = null;
Exhibit.MapView._markerUrlPrefix = "http://static.simile.mit.edu/graphics/maps/markers/";
Exhibit.MapView._defaultMarkerShape = "square";

Exhibit.MapView._makeIcon = function(shape, color, label, bubbleTip) {
    /*
     *  Some static initialization is delayed until here.
     */
    if (Exhibit.MapView._iconData == null) {
        Exhibit.MapView._iconData = {
            iconSize:               new GSize(40, 35),
            iconAnchor:             new GPoint(20, 35),
            shadowSize:             new GSize(55, 40),
            infoWindowAnchorBottom: new GPoint(19, 1),
            infoWindowAnchorTop:    new GPoint(19, 34),
            imageMap:               [ 6,0, 6,22, 15,22, 20,34, 25,25, 34,22, 34,0 ]
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
    icon.infoWindowAnchor = bubbleTip == "bottom" ? data.infoWindowAnchorBottom : data.infoWindowAnchorTop;
    
    return icon;
};
