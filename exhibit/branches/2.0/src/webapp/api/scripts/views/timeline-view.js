/*==================================================
 *  Exhibit.TimelineView
 *==================================================
 */
 
Exhibit.TimelineView = function(collection, containerElmt, lensRegistry, exhibit) {
    this._collection = collection;
    this._div = containerElmt;
    this._lensRegistry = lensRegistry;
    this._exhibit = exhibit;
    
    this._settings = {};
    this._accessors = {
        getEventLabel:  function(itemID, database, visitor) { visitor(database.getObject(itemID, "label")); },
        getProxy:       function(itemID, database, visitor) { visitor(itemID); }
    };

    this._colorMap = new Object();
    this._maxColorIndex = 0;
    
    this._largestSize = 0;
    
    var view = this;
    this._listener = { 
        onItemsChanged: function() {
            view._reconstruct(); 
        }
    };
    collection.addListener(this._listener);
};

Exhibit.TimelineView._intervalChoices = [
    "millisecond", "second", "minute", "hour", "day", "week", "month", "year", "decade", "century", "millennium"
];

Exhibit.TimelineView._settingSpecs = {
    "topBandHeight":           { type: "int",        defaultValue: 75 },
    "topBandUnit":             { type: "enum",       defaultValue: null, choices: Exhibit.TimelineView._intervalChoices },
    "topBandPixelsPerUnit":    { type: "int",        defaultValue: 200 },
    "bottomBandHeight":        { type: "int",        defaultValue: 25 },
    "bottomBandUnit":          { type: "enum",       defaultValue: null, choices: Exhibit.TimelineView._intervalChoices },
    "bottomBandPixelsPerUnit": { type: "int",        defaultValue: 200 },
    "timelineHeight":          { type: "int",        defaultValue: 400 },
    "bubbleWidth":             { type: "int",        defaultValue: 400 },
    "bubbleHeight":            { type: "int",        defaultValue: 300 },
    "timelineConstructor":     { type: "function",   defaultValue: null }
};

Exhibit.TimelineView._accessorSpecs = [
    {   accessorName:   "getProxy",
        attributeName:  "proxy"
    },
    {   accessorName: "getDuration",
        bindings: [
            {   attributeName:  "start",
                type:           "date",
                bindingName:    "start"
            },
            {   attributeName:  "end",
                type:           "date",
                bindingName:    "end"
            }
        ]
    },
    {   accessorName:   "getColor",
        attributeName:  "marker",
        type:           "text"
    },
    {   accessorName:   "getEventLabel",
        attributeName:  "eventLabel",
        type:           "text"
    }
];

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
    
    Exhibit.SettingsUtilities.createAccessorsFromDOM(configElmt, Exhibit.TimelineView._accessorSpecs, view._accessors);
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.TimelineView._settingSpecs, view._settings);
    Exhibit.TimelineView._configure(view, configuration);
    
    view._initializeUI();
    return view;
};

Exhibit.TimelineView._configure = function(view, configuration) {
    Exhibit.SettingsUtilities.createAccessors(configuration, Exhibit.TimelineView._accessorSpecs, view._accessors);
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.TimelineView._settingSpecs, view._settings);
    
    var accessors = view._accessors;
    view._getDuration = function(itemID, database, visitor) {
        accessors.getProxy(itemID, database, function(proxy) {
            accessors.getDuration(proxy, database, visitor);
        });
    };
};

Exhibit.TimelineView.prototype.dispose = function() {
    this._collection.removeListener(this._listener);
    this._collectionSummaryWidget.dispose();
    
    this._div.innerHTML = "";
    
    this._collectionSummaryWidget = null;
    this._dom.timeline = null;
    this._dom = null;
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
            self._largestSize = 0;
            self._reconstruct();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    );
    this._collectionSummaryWidget = Exhibit.CollectionSummaryWidget.create(
        { collectionID: this._collection.getID() }, 
        this._dom.collectionSummaryDiv, 
        this._lensRegistry,
        this._exhibit
    );
    
    this._eventSource = new Timeline.DefaultEventSource();
    this._reconstruct();
};

Exhibit.TimelineView.prototype._reconstructTimeline = function(newEvents) {
    var settings = this._settings;
    
    if (this._dom.timeline != null) {
        this._dom.timeline.dispose();
    }
    
    if (newEvents) {
        this._eventSource.addMany(newEvents);
    }
    
    var timelineDiv = this._dom.getTimelineDiv();
    if (settings.timelineConstructor != null) {
        this._dom.timeline = settings.timelineConstructor(timelineDiv, this._eventSource);
    } else {
        timelineDiv.style.height = "400px";
        
        var theme = Timeline.ClassicTheme.create();
        theme.event.bubble.width = settings.bubbleWidth;
        theme.event.bubble.height = settings.bubbleHeight;
        
        var topIntervalUnit, bottomIntervalUnit;
        if (settings.topBandUnit != null || settings.bottomBandUnit != null) {
            if (Exhibit.TimelineView._intervalLabelMap == null) {
                Exhibit.TimelineView._intervalLabelMap = {
                    "millisecond":      Timeline.DateTime.MILLISECOND,
                    "second":           Timeline.DateTime.SECOND,
                    "minute":           Timeline.DateTime.MINUTE,
                    "hour":             Timeline.DateTime.HOUR,
                    "day":              Timeline.DateTime.DAY,
                    "week":             Timeline.DateTime.WEEK,
                    "month":            Timeline.DateTime.MONTH,
                    "year":             Timeline.DateTime.YEAR,
                    "decade":           Timeline.DateTime.DECADE,
                    "century":          Timeline.DateTime.CENTURY,
                    "millennium":       Timeline.DateTime.MILLENNIUM
                };
            }
            
            if (settings.topBandUnit == null) {
                bottomIntervalUnit = Exhibit.TimelineView._intervalLabelMap[settings.bottomBandUnit];
                topIntervalUnit = bottomIntervalUnit - 1;
            } else if (settings.bottomBandUnit == null) {
                topIntervalUnit = Exhibit.TimelineView._intervalLabelMap[settings.topBandUnit];
                bottomIntervalUnit = topIntervalUnit + 1;
            } else {
                topIntervalUnit = Exhibit.TimelineView._intervalLabelMap[settings.topBandUnit];
                bottomIntervalUnit = Exhibit.TimelineView._intervalLabelMap[settings.bottomBandUnit];
            }
        } else { // figure this out dynamically
            var earliest = this._eventSource.getEarliestDate();
            var latest = this._eventSource.getLatestDate();
            
            var totalDuration = latest.getTime() - earliest.getTime();
            var totalEventCount = this._eventSource.getCount();
            if (totalDuration > 0 && totalEventCount > 1) {
                var totalDensity = totalEventCount / totalDuration;
                
                var topIntervalUnit = Timeline.DateTime.MILLENNIUM;
                while (topIntervalUnit > 0) {
                    var intervalDuration = Timeline.DateTime.gregorianUnitLengths[topIntervalUnit];
                    var eventsPerPixel = totalDensity * intervalDuration / settings.topBandPixelsPerUnit;
                    if (eventsPerPixel < 0.01) {
                        break;
                    }
                    topIntervalUnit--;
                }
            } else {
                topIntervalUnit = Timeline.DateTime.YEAR;
            }
            bottomIntervalUnit = topIntervalUnit + 1;
        }
        
        var bandInfos = [
            Timeline.createBandInfo({
                width:          settings.topBandHeight + "%", 
                intervalUnit:   topIntervalUnit, 
                intervalPixels: settings.topBandPixelsPerUnit,
                eventSource:    this._eventSource,
                //date:           earliest,
                theme:          theme
            }),
            Timeline.createBandInfo({
                width:          settings.bottomBandHeight + "%", 
                intervalUnit:   bottomIntervalUnit, 
                intervalPixels: settings.bottomBandPixelsPerUnit,
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
    var settings = this._settings;
    var accessors = this._accessors;
    
    /*
     *  Get the current collection and check if it's empty
     */
    var currentSize = this._collection.countRestrictedItems();
    var plottableSize = 0;
    
    var usedKeys = {};
        
    this._dom.clearLegend();
    this._eventSource.clear();
    
    if (currentSize > 0) {
        var currentSet = this._collection.getRestrictedItems();
        var events = [];
        
        var addEvent = function(itemID, duration, colorData) {
            var label;
            accessors.getEventLabel(itemID, database, function(v) { label = v; return true; });
            
            var evt = new Timeline.DefaultEventSource.Event(
                duration.start,
                duration.end,
                null,
                null,
                duration.end == null, // is instant?
                label,
                "",     // description
                null,   // image url
                null,   // link url
                null,   // icon url
                "#" + colorData.color,
                "#" + (duration.end == null ? colorData.color : colorData.textColor)
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
            var durations = [];
            self._getDuration(itemID, database, function(duration) { durations.push(duration); });
            
            if (durations.length > 0) {
                plottableSize++;
                
                var colorKey = null;
                accessors.getColor(itemID, database, function(v) { colorKey = v; });
            
                usedKeys[colorKey] = true;
                
                var colorData;
                if (colorKey in self._colorMap) {
                    colorData = self._colorMap[colorKey];
                } else {
                    colorData = Exhibit.TimelineView.theme.markers[self._maxColorIndex];
                    self._colorMap[colorKey] = colorData;
                    self._maxColorIndex = (self._maxColorIndex + 1) % Exhibit.TimelineView.theme.markers.length;
                }
                
                for (var i = 0; i < durations.length; i++) {
                    addEvent(itemID, durations[i], colorData);
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
        for (colorKey in this._colorMap) {
            if (colorKey in usedKeys) {
                var colorData = this._colorMap[colorKey];
                legendLabels.push(colorKey);
                legendColors.push("#" + colorData.color);
            }
        }
        
        this._dom.addLegendBlock(Exhibit.TimelineView.theme.constructLegendBlockDom(
            this._exhibit,
            Exhibit.TimelineView.l10n.colorLegendTitle,
            legendColors,
            legendLabels
        ));
        
        var band = this._dom.timeline.getBand(0);
        var centerDate = band.getCenterVisibleDate();
        if (centerDate < this._eventSource.getEarliestDate()) {
            band.scrollToCenter(this._eventSource.getEarliestDate());
        } else if (centerDate > this._eventSource.getLatestDate()) {
            band.scrollToCenter(this._eventSource.getLatestDate());
        }
    }
    
    this._dom.setPlottableCounts(currentSize, plottableSize);
};

Exhibit.TimelineView.prototype._fillInfoBubble = function(evt, elmt, theme, labeller) {
    this._lensRegistry.createLens(evt._itemID, elmt, this._exhibit);
};
