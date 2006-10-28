/*==================================================
 *  Exhibit.TimelineView
 *==================================================
 */
 
Exhibit.TimelineView = function(exhibit, div, configuration, globalConfiguration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    this._globalConfiguration = globalConfiguration;
    
    this._densityFactor = 50;
    this._topBandIntervalPixels = 150;
    this._bottomBandIntervalPixels = 200;
    
    var getDurations = null;
    try {
        var getStart = null;
        var getEnd = null;
        
        var makeAccessor = function(expression) {
            var expr = Exhibit.Expression.parse(expression);
            return function(itemID, database) {
                var v = expr.evaluateSingle(
                    { "value" : itemID }, 
                    { "value" : "item" }, 
                    "value",
                    database
                ).value;
                if (v == null) {
                    return v;
                } else if (v instanceof Date) {
                    return v;
                } else {
                    return SimileAjax.DateTime.parseIso8601DateTime(v);
                }
            };
        };
        
        if ("start" in configuration) {
            getStart = makeAccessor(configuration.start);
        } else {
            getStart = function(itemID, database) { return null; }
        }
        if ("end" in configuration) {
            getEnd = makeAccessor(configuration.end);
        } else {
            getEnd = function(itemID, database) { return null; }
        }
        
        var getStartEnd = function(itemID, database) {
            return {
                start:  getStart(itemID, database),
                end:    getEnd(itemID, database)
            };
        }
        
        if ("proxy" in configuration) {
            var expr = Exhibit.Expression.parse(configuration.proxy);
            getDurations = function(itemID, database) {
                var pairs = [];
                expr.evaluate(
                    { "value" : itemID }, 
                    { "value" : "item" }, 
                    "value",
                    database
                ).values.visit(function(v) {
                    var startEnd = getStartEnd(v, database);
                    if (startEnd.start != null) {
                        pairs.push(startEnd);
                    }
                });
                return pairs;
            };
        } else {
            getDurations = getStartEnd;
        }
        
        if ("topBandIntervalPixels" in configuration) {
            this._topBandIntervalPixels = configuration.topBandIntervalPixels;
        }
        if ("bottomBandIntervalPixels" in configuration) {
            this._bottomBandIntervalPixels = configuration.bottomBandIntervalPixels;
        }
        if ("densityFactor" in configuration) {
            this._densityFactor = configuration.densityFactor;
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
                    { "value" : itemID }, 
                    { "value" : "item" }, 
                    "value",
                    database
                ).value;
                
                return key != null ? key : "";
            }
        }
    } catch (e) {
        SimileAjax.Debug.exception(e);
    }
    
    this._getDurations = (getDurations != null) ? getDurations : function(itemID, database) { return {}; };
    this._getMarkerKey = (getMarkerKey != null) ? getMarkerKey : function(itemID, database) { return ""; };
        
    this._durationCache = new Object();
    this._markerKeyCache = new Object();
    this._markerCache = new Object();
    this._maxMarker = 0;
    
    this._largestSize = 0;
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

Exhibit.TimelineView._markers = [
    {   color:  "FF9000",
        textColor:  "000000"
    },
    {   color:  "5D7CBA",
        textColor:  "000000"
    },
    {   color:  "A97838",
        textColor:  "000000"
    },
    {   color:  "8B9BBA",
        textColor:  "000000"
    },
    {   color:  "FFC77F",
        textColor:  "000000"
    },
    {   color:  "003EBA",
        textColor:  "000000"
    },
    {   color:  "29447B",
        textColor:  "000000"
    },
    {   color:  "543C1C",
        textColor:  "000000"
    }
];
Exhibit.TimelineView._wildcardMarker = {
    color:  "888888",
    textColor:  "000000"
};
Exhibit.TimelineView._mixMarker = {
    color:  "FFFFFF",
    textColor:  "000000"
};

Exhibit.TimelineView.prototype.dispose = function() {
    this._exhibit.getBrowseEngine().removeListener(this._listener);
    
    this._dom.timeline = null;
    this._dom = null;
    this._div.innerHTML = "";
    this._div = null;
    this._exhibit = null;
};

Exhibit.TimelineView.prototype._initializeUI = function() {
    var self = this;
    
    this._div.innerHTML = "";
    this._dom = Exhibit.TimelineView.theme.constructDom(
        this._exhibit, 
        this._div, 
        function(elmt, evt, target) {
            self._reset();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    );
    this._eventSource = new Timeline.DefaultEventSource();
    
    this._reconstruct();
};

Exhibit.TimelineView.prototype._reconstructTimeline = function(newEvents) {
    if (this._dom.timeline != null) {
        this._dom.timeline.dispose();
    }
    
    if (newEvents) {
        this._eventSource.addMany(newEvents);
    }
    
    var timelineDiv = this._dom.getTimelineDiv();
    if ("constructTimeline" in this._configuration) {
        this._dom.timeline = this._configuration.constructTimeline(timelineDiv, this._eventSource);
    } else {
        timelineDiv.style.height = "400px";
        
        var earliest = this._eventSource.getEarliestDate();
        var latest = this._eventSource.getLatestDate();
        var duration = latest.getTime() - earliest.getTime();
        
        var intervalUnit = Timeline.DateTime.MILLENNIUM;
        while (intervalUnit > 0) {
            var intervalLength = Timeline.DateTime.gregorianUnitLengths[intervalUnit];
            if (duration / intervalLength > this._densityFactor) {
                break;
            }
            intervalUnit--;
        }
        
        var bandInfos = [
            Timeline.createBandInfo({
                width:          "75%", 
                intervalUnit:   intervalUnit, 
                intervalPixels: this._topBandIntervalPixels,
                eventSource:    this._eventSource,
                date:           earliest
            }),
            Timeline.createBandInfo({
                width:          "25%", 
                intervalUnit:   intervalUnit + 1, 
                intervalPixels: this._bottomBandIntervalPixels,
                eventSource:    this._eventSource,
                date:           earliest,
                showEventText:  false, 
                trackHeight:    0.5,
                trackGap:       0.2
            })
        ];
        bandInfos[1].syncWith = 0;
        bandInfos[1].highlight = true;
        bandInfos[1].eventPainter.setLayout(bandInfos[0].eventPainter.getLayout());

        this._dom.timeline = Timeline.create(timelineDiv, bandInfos, Timeline.HORIZONTAL);
    }
};

Exhibit.TimelineView.prototype._reconstruct = function() {
    var self = this;
    var exhibit = this._exhibit;
    var database = exhibit.getDatabase();
    
    /*
     *  Get the current collection and check if it's empty
     */
    var collection = exhibit.getBrowseEngine().getCurrentCollection();
    var originalSize = 0;
    var currentSize = 0;
    var plottableSize = 0;
    if (collection != null) {
        originalSize = collection.originalSize();
        
        var currentSet = collection.getCurrentSet();
        currentSize = currentSet.size();
    }
    
    var usedKeys = {};
        
    this._dom.clearLegend();
    this._eventSource.clear();
    
    if (currentSize > 0) {
        var events = [];
        
        var addEvent = function(itemID, duration, markerData) {
            var evt = new Timeline.DefaultEventSource.Event(
                duration.start,
                duration.end,
                null,
                null,
                duration.end == null, // is instant?
                database.getObject(itemID, "label"),
                "no description",
                null, // image url
                null, // link url
                null, // icon url
                "#" + markerData.color,
                "#" + markerData.textColor
            );
            evt._itemID = itemID;
            evt.getProperty = function(name) {
                return database.getObject(this._itemID, name);
            };
            
            events.push(evt);
        };
        
        currentSet.visit(function(itemID) {
            var durations;
            if (itemID in self._durationCache) {
                durations = self._durationCache[itemID];
            } else {
                durations = self._getDurations(itemID, database);
                self._durationCache[itemID] = durations;
            }
            
            if ((durations instanceof Array && durations.length > 0) ||
                (durations.start != null)) {
                plottableSize++;
                
                var markerKey;
                if (itemID in self._markerKeyCache) {
                    markerKey = self._markerKeyCache[itemID];
                } else {
                    markerKey = self._getMarkerKey(itemID, database);
                    self._markerKeyCache[itemID] = markerKey;
                }
                
                usedKeys[markerKey] = true;
                if (markerKey in self._markerCache) {
                    markerData = self._markerCache[markerKey];
                } else {
                    markerData = Exhibit.TimelineView._markers[self._maxMarker];
                    self._markerCache[markerKey] = markerData;
                    self._maxMarker = (self._maxMarker + 1) % Exhibit.TimelineView._markers.length;
                }
                
                if (durations instanceof Array) {
                    for (var i = 0; i < durations.length; i++) {
                        addEvent(itemID, durations[i], markerData);
                    }
                } else {
                    addEvent(itemID, durations, markerData);
                }
            }
        });
        
        if (plottableSize > this._largestSize) {
            this._largestSize = plottableSize;
            this._reconstructTimeline(events);
        } else {
            this._eventSource.addMany(events);
        }
        
        var legendLabels = [];
        var legendColors = [];
        for (markerKey in this._markerCache) {
            if (markerKey in usedKeys) {
                var markerData = this._markerCache[markerKey];
                legendLabels.push(markerKey);
                legendColors.push("#" + markerData.color);
            }
        }
        legendLabels.push(Exhibit.TimelineView.l10n.mixedLegendKey);
        legendColors.push("#FFFFFF");
        
        this._dom.addLegendBlock(Exhibit.TimelineView.theme.constructLegendBlockDom(
            this._exhibit,
            Exhibit.TimelineView.l10n.colorLegendTitle,
            legendColors,
            legendLabels
        ));
        
        this._dom.setTypes(database.getTypeLabels(currentSet)[currentSize > 1 ? 1 : 0]);
    }
    
    this._dom.setCounts(currentSize, plottableSize, originalSize);
};

Exhibit.TimelineView.prototype._createInfoWindow = function(items) {
    if (items.length > 1) {
        var ul = document.createElement("ul");
        for (var i = 0; i < items.length; i++) {
            var li = document.createElement("li");
            li.appendChild(this._exhibit.makeItemSpan(items[i]));
            ul.appendChild(li);
        }
        return ul;
    } else {
        var itemViewDiv = document.createElement("div");
        var itemView = new Exhibit.ItemView(items[0], itemViewDiv, this._exhibit, this._globalConfiguration);
        return itemViewDiv;
    }
};

Exhibit.TimelineView.prototype._reset = function() {
    var state = {};
    var browseEngine = this._exhibit.getBrowseEngine();
    SimileAjax.History.addAction({
        perform: function() {
            state.restrictions = browseEngine.clearRestrictions();
        },
        undo: function() {
            browseEngine.applyRestrictions(state.restrictions);
        },
        label: Exhibit.OrderedViewFrame.l10n.resetActionTitle,
        uiLayer: SimileAjax.WindowManager.getBaseLayer()
    });
};
