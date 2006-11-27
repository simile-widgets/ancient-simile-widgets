/*==================================================
 *  Exhibit.TimelineView
 *==================================================
 */
 
Exhibit.TimelineView = function(exhibit, div, configuration, domConfiguration, globalConfiguration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    this._globalConfiguration = globalConfiguration;
    
    this._densityFactor = 50;
    this._topBandIntervalPixels = 150;
    this._bottomBandIntervalPixels = 200;
    this._timelineConstructor = null;
    
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
        
        if (domConfiguration != null) {
            var start = Exhibit.getAttribute(domConfiguration, "start");
            if (start != null && start.length > 0) {
                getStart = makeAccessor(start);
            }
        }
        if ("start" in configuration) {
            getStart = makeAccessor(configuration.start);
        } 
        getStart = getStart != null ? getStart : function(itemID, database) { return null; }
        
        if (domConfiguration != null) {
            var end = Exhibit.getAttribute(domConfiguration, "end");
            if (end != null && end.length > 0) {
                getEnd = makeAccessor(end);
            }
        }
        if ("end" in configuration) {
            getEnd = makeAccessor(configuration.end);
        }
        getEnd = getEnd != null ? getEnd : function(itemID, database) { return null; }
        
        var getStartEnd = function(itemID, database) {
            return {
                start:  getStart(itemID, database),
                end:    getEnd(itemID, database)
            };
        }
        
        var makeGetDurations = function(s) {
            var expr = Exhibit.Expression.parse(s);
            return function(itemID, database) {
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
        };
        
        if (domConfiguration != null) {
            var proxy = Exhibit.getAttribute(domConfiguration, "proxy");
            if (proxy != null && proxy.length > 0) {
                getDurations = makeGetDurations(proxy);
            }
        }
        if ("proxy" in configuration) {
            getDurations = makeGetDurations(configuration.proxy);
        }
        getDurations = getDurations != null ? getDurations : getStartEnd;
        
        
        if (domConfiguration != null) {
            var topBandIntervalPixels = Exhibit.getAttribute(domConfiguration, "topBandIntervalPixels");
            if (topBandIntervalPixels != null && topBandIntervalPixels.length > 0) {
                this._topBandIntervalPixels = parseInt(topBandIntervalPixels);
            }
            
            var bottomBandIntervalPixels = Exhibit.getAttribute(domConfiguration, "bottomBandIntervalPixels");
            if (bottomBandIntervalPixels != null && bottomBandIntervalPixels.length > 0) {
                this._bottomBandIntervalPixels = parseInt(bottomBandIntervalPixels);
            }
            
            var densityFactor = Exhibit.getAttribute(domConfiguration, "densityFactor");
            if (densityFactor != null && densityFactor.length > 0) {
                this._densityFactor = parseFloat(densityFactor);
            }
            
            var timelineConstructor = Exhibit.getAttribute(domConfiguration, "timelineConstructor");
            if (timelineConstructor != null) {
                var f = eval(timelineConstructor);
                if (typeof f == "function") {
                    this._timelineConstructor = f;
                }
            }
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
        if ("timelineConstructor" in configuration) {
            this._timelineConstructor = configuration.timelineConstructor;
        }
    } catch (e) {
        SimileAjax.Debug.exception("TimelineView: Error processing configuration of timeline view", e);
    }
    
    var getMarkerKey = null;
    try {
        var makeGetMarker = function(s) {
            var markerExpression = Exhibit.Expression.parse(s);
            return function(itemID, database) {
                var key = markerExpression.evaluateSingle(
                    { "value" : itemID }, 
                    { "value" : "item" }, 
                    "value",
                    database
                ).value;
                
                return key != null ? key : "";
            }
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
        SimileAjax.Debug.exception("TimelineView: Error processing marker configuration of timeline view", e);
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
            self._exhibit.getViewPanel().resetBrowseQuery();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        },
        function(elmt, evt, target) {
            self._largestSize = 0;
            self._reconstruct();
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
    if (this._timelineConstructor != null) {
        this._dom.timeline = this._timelineConstructor(timelineDiv, this._eventSource);
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
        
        var theme = Timeline.ClassicTheme.create();
        theme.event.bubble.width = 300;
        theme.event.bubble.height = 250;
        var bandInfos = [
            Timeline.createBandInfo({
                width:          "75%", 
                intervalUnit:   intervalUnit, 
                intervalPixels: this._topBandIntervalPixels,
                eventSource:    this._eventSource,
                //date:           earliest,
                theme:          theme
            }),
            Timeline.createBandInfo({
                width:          "25%", 
                intervalUnit:   intervalUnit + 1, 
                intervalPixels: this._bottomBandIntervalPixels,
                eventSource:    this._eventSource,
                //date:           earliest,
                showEventText:  false, 
                trackHeight:    0.5,
                trackGap:       0.2,
                theme:          theme
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
                "#" + (duration.end == null ? markerData.color : markerData.textColor)
            );
            evt._itemID = itemID;
            evt.getProperty = function(name) {
                return database.getObject(this._itemID, name);
            };
            evt.fillInfoBubble = function(elmt, theme, labeller) {
                self._fillInfoBubble(this, elmt, theme, labeller);
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
                    markerData = Exhibit.TimelineView.theme.markers[self._maxMarker];
                    self._markerCache[markerKey] = markerData;
                    self._maxMarker = (self._maxMarker + 1) % Exhibit.TimelineView.theme.markers.length;
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
        
        this._dom.addLegendBlock(Exhibit.TimelineView.theme.constructLegendBlockDom(
            this._exhibit,
            Exhibit.TimelineView.l10n.colorLegendTitle,
            legendColors,
            legendLabels
        ));
        
        this._dom.setTypes(database.getTypeLabels(currentSet)[currentSize > 1 ? 1 : 0]);
        
        var band = this._dom.timeline.getBand(0);
        var centerDate = band.getCenterVisibleDate();
        if (centerDate < this._eventSource.getEarliestDate()) {
            band.scrollToCenter(this._eventSource.getEarliestDate());
        } else if (centerDate > this._eventSource.getLatestDate()) {
            band.scrollToCenter(this._eventSource.getLatestDate());
        }
    }
    
    this._dom.setCounts(currentSize, plottableSize, originalSize);
};

Exhibit.TimelineView.prototype._fillInfoBubble = function(evt, elmt, theme, labeller) {
    new Exhibit.Lens(evt._itemID, elmt, this._exhibit, this._globalConfiguration);
};
