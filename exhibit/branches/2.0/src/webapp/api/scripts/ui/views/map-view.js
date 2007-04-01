/*==================================================
 *  Exhibit.MapView
 *==================================================
 */

Exhibit.MapView = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;

    this._settings = {};
    this._accessors = {
        getProxy: function(itemID, database, visitor) { visitor(itemID); }
    };
    
    this._colorMap = {};
    this._maxColorIndex = 0;
    
    var view = this;
    this._listener = { 
        onItemsChanged: function() {
            view._reconstruct(); 
        }
    };
    uiContext.getCollection().addListener(this._listener);
};

Exhibit.MapView._settingSpecs = {
    "center":           { type: "float",    defaultValue: [20,0],   dimensions: 2 },
    "zoom":             { type: "float",    defaultValue: 2         },
    "size":             { type: "text",     defaultValue: "small"   },
    "scaleControl":     { type: "boolean",  defaultValue: true      },
    "overviewControl":  { type: "boolean",  defaultValue: false     },
    "type":             { type: "enum",     defaultValue: "normal", choices: [ "normal", "satellite", "hybrid" ] },
    "bubbleTip":        { type: "enum",     defaultValue: "top",    choices: [ "top", "bottom" ] },
    "mapConstructor":   { type: "function", defaultValue: null      }
};

Exhibit.MapView._accessorSpecs = [
    {   accessorName:   "getProxy",
        attributeName:  "proxy"
    },
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

Exhibit.MapView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.MapView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    Exhibit.MapView._configure(view, configuration);
    
    view._initializeUI();
    return view;
};

Exhibit.MapView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var view = new Exhibit.MapView(
        containerElmt != null ? containerElmt : configElmt, 
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
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
    
    var accessors = view._accessors;
    view._getLatlng = function(itemID, database, visitor) {
        accessors.getProxy(itemID, database, function(proxy) {
            accessors.getLatlng(proxy, database, visitor);
        });
    };
};

Exhibit.MapView._colors = [
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
    this._uiContext.getCollection().removeListener(this._listener);
    this._collectionSummaryWidget.dispose();
    this._uiContext.dispose();
    
    this._div.innerHTML = "";
    
    this._collectionSummaryWidget = null;
    this._uiContext = null;
    this._dom.map = null;
    this._dom = null;
    this._div = null;
    
    GUnload();
};

Exhibit.MapView.prototype._initializeUI = function() {
    var self = this;
    
    this._div.innerHTML = "";
    this._dom = Exhibit.MapView.theme.constructDom(this._div);
    this._collectionSummaryWidget = Exhibit.CollectionSummaryWidget.create(
        {}, 
        this._dom.collectionSummaryDiv, 
        this._uiContext
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
    var collection = this._uiContext.getCollection();
    var database = this._uiContext.getDatabase();
    var settings = this._settings;
    var accessors = this._accessors;
    
    /*
     *  Get the current collection and check if it's empty
     */
    var originalSize = collection.countAllItems();
    var currentSize = collection.countRestrictedItems();
    var mappableSize = 0;
    
    this._dom.map.clearOverlays();
    this._dom.clearLegend();
    if (currentSize > 0) {
        var currentSet = collection.getRestrictedItems();
        var locationToData = {};
        
        currentSet.visit(function(itemID) {
            var latlngs = [];
            self._getLatlng(itemID, database, function(v) { if ("lat" in v && "lng" in v) latlngs.push(v); });
            
            if (latlngs.length > 0) {
                var colorKey = null;
                accessors.getColor(itemID, database, function(v) { colorKey = v; });
                
                for (var n = 0; n < latlngs.length; n++) {
                    var latlng = latlngs[n];
                    var latlngKey = latlng.lat + "," + latlng.lng;
                    if (latlngKey in locationToData) {
                        var locationData = locationToData[latlngKey];
                        locationData.items.push(itemID);
                        if (locationData.colorKey != colorKey) {
                            locationData.colorKey = null;
                        }
                    } else {
                        locationToData[latlngKey] = {
                            latlng:     latlng,
                            items:      [ itemID ],
                            colorKey:  colorKey
                        };
                    }
                }
                
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

            var colorData;
            if (locationData.colorKey == null) {
                colorData = Exhibit.MapView._mixMarker;
            } else {
                usedKeys[locationData.colorKey] = true;
                if (locationData.colorKey in self._colorMap) {
                    colorData = self._colorMap[locationData.colorKey];
                } else {
                    colorData = Exhibit.MapView._colors[self._maxColorIndex];
                    self._colorMap[locationData.colorKey] = colorData;
                    self._maxColorIndex = (self._maxColorIndex + 1) % Exhibit.MapView._colors.length;
                }
            }
            
            var icon;
            if (items.length == 1) {
                if (!("icon" in colorData)) {
                    colorData.icon = Exhibit.MapView._makeIcon(shape, colorData.color, "space", settings.bubbleTip);
                }
                icon = colorData.icon;
            } else {
                icon = Exhibit.MapView._makeIcon(
                    shape, 
                    colorData.color, 
                    locationData.items.length > 50 ? "..." : locationData.items.length
                );
            }

            var point = new GLatLng(locationData.latlng.lat, locationData.latlng.lng);
            var marker = new GMarker(point, icon);
            if (maxAutoZoom > locationData.latlng.maxAutoZoom)
                maxAutoZoom = locationData.latlng.maxAutoZoom;
            bounds.extend(point);

            GEvent.addListener(marker, "click", function() { 
        		self._dom.map.openInfoWindow(marker.getPoint(), self._createInfoWindow(items));
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
        for (colorKey in this._colorMap) {
            if (colorKey in usedKeys) {
                var colorData = this._colorMap[colorKey];
                legendLabels.push(colorKey);
                legendIcons.push(Exhibit.MapView._markerUrlPrefix + 
                    [   shape,
                        colorData.color,
                        [ "m", shape, colorData.color, "legend.png" ].join("-")
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
            Exhibit.MapView.l10n.colorLegendTitle,
            legendIcons,
            legendLabels
        ));
    }
    this._dom.setMappableCounts(currentSize, mappableSize);
};

Exhibit.MapView.prototype._createInfoWindow = function(items) {
    return Exhibit.ViewUtilities.fillBubbleWithItems(
        null, 
        items, 
        this._uiContext
    );
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
