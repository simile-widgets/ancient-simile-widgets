/*==================================================
 *  Exhibit.TimelineView
 *==================================================
 */
 
Exhibit.TimelineView = function(collection, containerElmt, lensRegistry, exhibit) {
    this._collection = collection;
    this._div = containerElmt;
    this._lensRegistry = lensRegistry;
    this._exhibit = exhibit;

    this._densityFactor = 50;
    this._topBandIntervalPixels = 150;
    this._bottomBandIntervalPixels = 200;
    this._bubbleWidth = 400;
    this._bubbleHeight = 300;
    this._timelineConstructor = null;
    
    this._getDurations = function(itemID, database) { return {}; };
    this._getMarkerKey = function(itemID, database) { return ""; };
    this._getEventLabel = function(itemID, database) { return database.getObject(itemID, "label"); };
    
    this._durationCache = new Object();
    this._markerKeyCache = new Object();
    this._markerCache = new Object();
    this._maxMarker = 0;
    
    this._largestSize = 0;
    
    var view = this;
    this._listener = { 
        onItemsChanged: function() {
            view._reconstruct(); 
        }
    };
    collection.addListener(this._listener);
};

Exhibit.TimelineView.create = function(configuration, containerElmt, lensRegistry, exhibit) {
    var collection = Exhibit.Collection.getCollection(configuration, exhibit);
    var lensRegistry2 = Exhibit.Component.createLensRegistry(configuration, lensRegistry);
    var view = new Exhibit.TimelineView(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        lensRegistry2, 
        exhibit
    );
    
    Exhibit.TimelineView._configure(view, configuration);
    
    view._initializeUI();
    return view;
};

Exhibit.TimelineView.createFromDOM = function(configElmt, containerElmt, lensRegistry, exhibit) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var collection = Exhibit.Collection.getCollectionFromDOM(configElmt, configuration, exhibit);
    var lensRegistry2 = Exhibit.Component.createLensRegistryFromDOM(configElmt, configuration, lensRegistry);
    var view = new Exhibit.TimelineView(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        lensRegistry2, 
        exhibit
    );
    
    /*
     *  Start/end retriever
     */
    try {
        var getStart = null;
        var getEnd = function() { return null; };
        
        var start = Exhibit.getAttribute(configElmt, "start");
        if (start != null && start.length > 0) {
            getStart = Exhibit.TimelineView._makeAccessor(start);
        }
        
        var end = Exhibit.getAttribute(configElmt, "end");
        if (end != null && end.length > 0) {
            getEnd = Exhibit.TimelineView._makeAccessor(end);
        }
        
        if (start != null) {
            var getStartEnd = function(itemID, database) {
                return {
                    start:  getStart(itemID, database),
                    end:    getEnd(itemID, database)
                };
            }
        
            var proxy = Exhibit.getAttribute(configElmt, "proxy");
            if (proxy != null && proxy.length > 0) {
                view._getDurations = Exhibit.TimelineView._makeGetDurations(proxy, getStartEnd);
            } else {
                view._getDurations = getStartEnd;
            }
        }
    } catch (e) {
        SimileAjax.Debug.exception("TimelineView: Error processing configuration of timeline view", e);
    }
    
    /*
     *  Marker retriever
     */
    try {
        var marker = Exhibit.getAttribute(configElmt, "marker");
        if (marker != null && marker.length > 0) {
            view._getMarkerKey = Exhibit.TimelineView._makeGetMarker(marker);
        }
    } catch (e) {
        SimileAjax.Debug.exception("TimelineView: Error processing marker configuration of timeline view", e);
    }
    
    /*
     *  Label retriever
     */
    try {
        var eventLabel = Exhibit.getAttribute(configElmt, "eventLabel");
        if (eventLabel != null && eventLabel.length > 0) {
            view._getEventLabel = Exhibit.TimelineView._makeEventLabel(eventLabel);
        }
    } catch (e) {
        SimileAjax.Debug.exception("TimelineView: Error processing eventLabel configuration of timeline view", e);
    }
    
    /*
     *  Other settings
     */
    try {
        var topBandIntervalPixels = Exhibit.getAttribute(configElmt, "topBandIntervalPixels");
        if (topBandIntervalPixels != null && topBandIntervalPixels.length > 0) {
            view._topBandIntervalPixels = parseInt(topBandIntervalPixels);
        }
        
        var bottomBandIntervalPixels = Exhibit.getAttribute(configElmt, "bottomBandIntervalPixels");
        if (bottomBandIntervalPixels != null && bottomBandIntervalPixels.length > 0) {
            view._bottomBandIntervalPixels = parseInt(bottomBandIntervalPixels);
        }
        
        var densityFactor = Exhibit.getAttribute(configElmt, "densityFactor");
        if (densityFactor != null && densityFactor.length > 0) {
            view._densityFactor = parseFloat(densityFactor);
        }
        
        var bubbleWidth = Exhibit.getAttribute(configElmt, "bubbleWidth");
        if (bubbleWidth != null && bubbleWidth.length > 0) {
            view._bubbleWidth = parseInt(bubbleWidth);
        }
        
        var bubbleHeight = Exhibit.getAttribute(configElmt, "bubbleHeight");
        if (bubbleHeight != null && bubbleHeight.length > 0) {
            view._bubbleHeight = parseInt(bubbleHeight);
        }
        
        var timelineConstructor = Exhibit.getAttribute(configElmt, "timelineConstructor");
        if (timelineConstructor != null) {
            var f = eval(timelineConstructor);
            if (typeof f == "function") {
                view._timelineConstructor = f;
            }
        }
    } catch (e) {
        SimileAjax.Debug.exception("TimelineView: Error processing configuration of timeline view", e);
    }
    
    view._initializeUI();
    return view;
};

Exhibit.TimelineView._configure = function(view, configuration) {
    /*
     *  Start/end retriever
     */
    try {
        var getStart = null;
        var getEnd = function() { return null; };
        
        if ("start" in configuration) {
            getStart = Exhibit.TimelineView._makeAccessor(configuration.start);
        }
        
        if ("end" in configuration) {
            getEnd = Exhibit.TimelineView._makeAccessor(configuration.end);
        }
        
        if (start != null) {
            var getStartEnd = function(itemID, database) {
                return {
                    start:  getStart(itemID, database),
                    end:    getEnd(itemID, database)
                };
            }
        
            if ("proxy" in configuration) {
                view._getDurations = Exhibit.TimelineView._makeGetDurations(configuration.proxy, getStartEnd);
            } else {
                view._getDurations = getStartEnd;
            }
        }
    } catch (e) {
        SimileAjax.Debug.exception("TimelineView: Error processing configuration of timeline view", e);
    }
    
    /*
     *  Marker retriever
     */
    try {
        if ("marker" in configuration) {
            view._getMarkerKey = Exhibit.TimelineView._makeGetMarker(configuration.marker);
        }
    } catch (e) {
        SimileAjax.Debug.exception("TimelineView: Error processing marker configuration of timeline view", e);
    }
    
    /*
     *  Label retriever
     */
    try {
        if ("eventLabel" in configuration) {
            view._getEventLabel = Exhibit.TimelineView._makeEventLabel(configuration.eventLabel);
        }
    } catch (e) {
        SimileAjax.Debug.exception("TimelineView: Error processing eventLabel configuration of timeline view", e);
    }
    
    /*
     *  Other settings
     */
    try {
        if ("topBandIntervalPixels" in configuration) {
            view._topBandIntervalPixels = configuration.topBandIntervalPixels;
        }
        if ("bottomBandIntervalPixels" in configuration) {
            view._bottomBandIntervalPixels = configuration.bottomBandIntervalPixels;
        }
        if ("densityFactor" in configuration) {
            view._densityFactor = configuration.densityFactor;
        }
        if ("bubbleWidth" in configuration) {
            view._bubbleWidth = configuration.bubbleWidth;
        }
        if ("bubbleHeight" in configuration) {
            view._bubbleHeight = configuration.bubbleHeight;
        }
        if ("timelineConstructor" in configuration) {
            view._timelineConstructor = configuration.timelineConstructor;
        }
    } catch (e) {
        SimileAjax.Debug.exception("TimelineView: Error processing configuration of timeline view", e);
    }
};

Exhibit.TimelineView._makeAccessor = function(expression) {
    var expr = Exhibit.Expression.parse(expression);
    return function(itemID, database) {
        var v = expr.evaluateSingleOnItem(itemID, database).value;
        if (v == null) {
            return v;
        } else if (v instanceof Date) {
            return v;
        } else {
            return SimileAjax.DateTime.parseIso8601DateTime(v);
        }
    };
};

Exhibit.TimelineView._makeGetDurations = function(s, getStartEnd) {
    var expr = Exhibit.Expression.parse(s);
    return function(itemID, database) {
        var pairs = [];
        expr.evaluateOnItem(itemID, database).values.visit(function(v) {
            var startEnd = getStartEnd(v, database);
            if (startEnd.start != null) {
                pairs.push(startEnd);
            }
        });
        return pairs;
    };
};

Exhibit.TimelineView._makeGetMarker = function(s) {
    var markerExpression = Exhibit.Expression.parse(s);
    return function(itemID, database) {
        var key = markerExpression.evaluateSingleOnItem(itemID, database).value;
        return key != null ? key : "";
    };
};

Exhibit.TimelineView._makeGetEventLabel = function(s) {
    var expression = Exhibit.Expression.parse(s);
    return function(itemID, database) {
        var label = expression.evaluateSingleOnItem(itemID, database).value;
        return label != null ? label : itemID;
    }
};

Exhibit.TimelineView.prototype.dispose = function() {
    this._collection.removeListener(this._listener);
    
    this._dom.timeline = null;
    this._dom = null;
    this._div.innerHTML = "";
    
    this._div = null;
    this._collection = null;
    this._exhibit = null;
};

Exhibit.TimelineView.prototype._initializeUI = function() {
    var self = this;
    
    this._div.innerHTML = "";
    this._dom = Exhibit.TimelineView.theme.constructDom(
        this._exhibit, 
        this._div, 
        function(elmt, evt, target) {
            Exhibit.ViewPanel.resetCollection(self._collection);
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
        theme.event.bubble.width = this._bubbleWidth;
        theme.event.bubble.height = this._bubbleHeight;
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
    var originalSize = this._collection.countAllItems();
    var currentSize = this._collection.countRestrictedItems();
    var plottableSize = 0;
    
    var usedKeys = {};
        
    this._dom.clearLegend();
    this._eventSource.clear();
    
    if (currentSize > 0) {
        var currentSet = this._collection.getRestrictedItems();
        var events = [];
        
        var addEvent = function(itemID, duration, markerData) {
            var evt = new Timeline.DefaultEventSource.Event(
                duration.start,
                duration.end,
                null,
                null,
                duration.end == null, // is instant?
                self._getEventLabel(itemID, database),
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
    this._lensRegistry.createLens(evt._itemID, elmt, this._exhibit);
};
