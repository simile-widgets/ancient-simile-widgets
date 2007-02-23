/*==================================================
 *  Exhibit.ScatterPlotView
 *==================================================
 */

Exhibit.ScatterPlotView = function(exhibit, div, configuration, domConfiguration, globalConfiguration) {
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
     *  Getter for x/y
     */
    var getXY = null;
    try {
        var makeGetXY = function(s) {
            var xyExpression = Exhibit.Expression.parse(s);
            return function(itemID, database) {
                var result = {};
                var x = Exhibit.ScatterPlotView.evaluateSingle(xyExpression, itemID, database);
                if (x != null) {
                    var a = x.split(",");
                    if (a.length == 2) {
                        result.lat = (typeof a[0] == "number") ? a[0] : parseFloat(a[0]);
                        result.lng = (typeof a[1] == "number") ? a[1] : parseFloat(a[1]);
                    }
                }

                return result;
            };
        };
        var makeGetXY2 = function(x, y) {
            var xExpression = Exhibit.Expression.parse(x);
            var yExpression = Exhibit.Expression.parse(y);
            return function(itemID, database) {
                var result = {};
                var x = Exhibit.ScatterPlotView.evaluateSingle(xExpression, itemID, database);
                var y = Exhibit.ScatterPlotView.evaluateSingle(yExpression, itemID, database);
                if (x != null && y != null) {
                    result.x = (typeof x == "number") ? x : parseFloat(x);
                    result.y = (typeof y == "number") ? y : parseFloat(y);
                }

                return result;
            }
        };

        if (domConfiguration != null) {
            var xy = Exhibit.getAttribute(domConfiguration, "xy");
            if (xy != null && xy.length > 0) {
                getXY = makeGetXY(xy);
            } else {
                var x = Exhibit.getAttribute(domConfiguration, "x");
                var y = Exhibit.getAttribute(domConfiguration, "y");
                if (x != null && y != null && x.length > 0 && y.length > 0) {
                    getXY = makeGetXY2(x, y);
                }
            }
        }
        
        if ("xy" in configuration) {
            getXY = makeGetLatLng(configuration.xy);
        } else if ("x" in configuration && "y" in configuration) {
            getXY = makeGetXY2(configuration.x, configuration.y);
        }
    } catch (e) {
        SimileAjax.Debug.exception("ScatterPlotView: Error processing x/y configuration", e);
    }
    this._getXY = (getXY != null) ? getXY : function(itemID, database) { return {}; };
    
    /*
     *  Getter for color key
     */
    var getColorKey = null;
    try {
        var makeGetColor = function(s) {
            var colorExpression = Exhibit.Expression.parse(s);
            return function(itemID, database) {
                var key = Exhibit.ScatterPlotView.evaluateSingle(colorExpression, itemID, database);
                return key != null ? key : "";
            };
        };
        
        if (domConfiguration != null) {
            var color = Exhibit.getAttribute(domConfiguration, "color");
            if (color != null && color.length > 0) {
                getColorKey = makeGetColor(color);
            }
        }
        if ("color" in configuration) {
            getColorKey = makeGetColor(configuration.color);
        }
    } catch (e) {
        SimileAjax.Debug.exception("ScatterPlotView: Error processing color configuration", e);
    }
    this._getColorKey = (getColorKey != null) ? getColorKey : function(itemID, database) { return ""; };
    
    /*
     *  Map settings
     */
    this._plotSettings = {
        xAxisMin: Number.POSITIVE_INFINITY,
        xAxisMax: Number.NEGATIVE_INFINITY,
        yAxisMin: Number.POSITIVE_INFINITY,
        yAxisMax: Number.NEGATIVE_INFINITY,
        xLabel:   "x",
        yLabel:   "y"
    };
    if (domConfiguration != null) {
        var s = Exhibit.getAttribute(domConfiguration, "xAxisMin");
        if (s != null && s.length > 0) {
            this._plotSettings.xAxisMin = parseFloat(s);
        }
        s = Exhibit.getAttribute(domConfiguration, "xAxisMax");
        if (s != null && s.length > 0) {
            this._plotSettings.xAxisMax = parseFloat(s);
        }
        s = Exhibit.getAttribute(domConfiguration, "yAxisMin");
        if (s != null && s.length > 0) {
            this._plotSettings.yAxisMin = parseFloat(s);
        }
        s = Exhibit.getAttribute(domConfiguration, "yAxisMax");
        if (s != null && s.length > 0) {
            this._plotSettings.yAxisMax = parseFloat(s);
        }
        
        s = Exhibit.getAttribute(domConfiguration, "xLabel");
        if (s != null && s.length > 0) {
            this._plotSettings.xLabel = s;
        }
        
        s = Exhibit.getAttribute(domConfiguration, "yLabel");
        if (s != null && s.length > 0) {
            this._plotSettings.yLabel = s;
        }
    }
    if ("xAxisMin" in configuration) {
        this._plotSettings.xAxisMin = this._configuration.xAxisMin;
    }
    if ("xAxisMax" in configuration) {
        this._plotSettings.xAxisMax = this._configuration.xAxisMax;
    }
    if ("yAxisMin" in configuration) {
        this._plotSettings.yAxisMin = this._configuration.yAxisMin;
    }
    if ("yAxisMax" in configuration) {
        this._plotSettings.yAxisMax = this._configuration.yAxisMax;
    }
    if ("xLabel" in configuration) {
        this._plotSettings.xLabel = this._configuration.xLabel;
    }
    if ("yLabel" in configuration) {
        this._plotSettings.yLabel = this._configuration.yLabel;
    }
    
    /*
     *  Internal stuff such as caches
     */
    this._xyCache = new Object();
    this._colorKeyCache = new Object();
    this._maxColor = 0;
    
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

Exhibit.ScatterPlotView._colors = [
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
Exhibit.ScatterPlotView._wildcardMarker = {
    color:  "888888"
};
Exhibit.ScatterPlotView._mixMarker = {
    color:  "FFFFFF"
};

Exhibit.ScatterPlotView.evaluateSingle = function(expression, itemID, database) {
    return expression.evaluateSingle(
        { "value" : itemID },
        { "value" : "item" },
          "value",
          database
    ).value;
}

Exhibit.ScatterPlotView.prototype.dispose = function() {
    this._exhibit.getBrowseEngine().removeListener(this._listener);
    
    this._div.innerHTML = "";
    
    this._dom = null;
    this._div = null;
    this._exhibit = null;
};

Exhibit.ScatterPlotView.prototype._initializeUI = function() {
    var self = this;
    
    this._div.innerHTML = "";
    this._dom = Exhibit.ScatterPlotView.theme.constructDom(
        this._exhibit, 
        this._div, 
        function(elmt, evt, target) {
            self._exhibit.getViewPanel().resetBrowseQuery();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    );
    
    this._dom.plotContainer.style.height = "400px";
    this._reconstruct();
};

Exhibit.ScatterPlotView.prototype._reconstruct = function() {
    var self = this;
    var exhibit = this._exhibit;
    var database = exhibit.getDatabase();
    
    this._dom.plotContainer.innerHTML = "";
    
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
    
    this._dom.clearLegend();
    if (currentSize > 0) {
        var xyToData = {};
        var xAxisMin = this._plotSettings.xAxisMin;
        var xAxisMax = this._plotSettings.xAxisMax;
        var yAxisMin = this._plotSettings.yAxisMin;
        var yAxisMax = this._plotSettings.yAxisMax;
        
        /*
         *  Iterate through all items, collecting min and max on both axes
         */
        currentSet.visit(function(itemID) {
            var xy;
            if (itemID in self._xyCache) {
                xy = self._xyCache[itemID];
            } else {
                xy = self._getXY(itemID, database);
                self._xyCache[itemID] = xy;
            }
            
            if ("x" in xy && "y" in xy) {
                var colorKey;
                if (itemID in self._colorKeyCache) {
                    colorKey = self._colorKeyCache[itemID];
                } else {
                    colorKey = self._getColorKey(itemID, database);
                    self._colorKeyCache[itemID] = colorKey;
                }
                
                var xyKey = xy.x + "," + xy.y;
                var xyData = xyToData[xyKey];
                if (!(xyData)) {
                    xyData = {
                        xy:         xy,
                        items:      [],
                        colorKey:  colorKey
                    };
                    xyToData[xyKey] = xyData;
                } else if (xyData.colorKey != colorKey) {
                    xyData.colorKey = null;
                }
                
                xyData.items.push(itemID);
                
                mappableSize++;
                xAxisMin = Math.min(xAxisMin, xy.x);
                xAxisMax = Math.max(xAxisMax, xy.x);
                yAxisMin = Math.min(yAxisMin, xy.y);
                yAxisMax = Math.max(yAxisMax, xy.y);
            }
        });
        
        /*
         *  Figure out scales, mins, and maxes for both axes
         */
        var xDiff = xAxisMax - xAxisMin;
        var yDiff = yAxisMax - yAxisMin;
        
        var xInterval = 1;
        if (xDiff > 1) {
            while (xInterval * 20 < xDiff) {
                xInterval *= 10;
            }
        } else {
            while (xInterval < xDiff * 20) {
                xInterval /= 10;
            }
        }
        xAxisMin = Math.floor(xAxisMin / xInterval) * xInterval;
        xAxisMax = Math.ceil(xAxisMax / xInterval) * xInterval;
        
        var yInterval = 1;
        if (yDiff > 1) {
            while (yInterval * 20 < yDiff) {
                yInterval *= 10;
            }
        } else {
            while (yInterval < yDiff * 20) {
                yInterval /= 10;
            }
        }
        yAxisMin = Math.floor(yAxisMin / yInterval) * yInterval;
        yAxisMax = Math.ceil(yAxisMax / yInterval) * yInterval;
        
        this._plotSettings.xAxisMin = xAxisMin;
        this._plotSettings.xAxisMax = xAxisMax;
        this._plotSettings.yAxisMin = yAxisMin;
        this._plotSettings.yAxisMax = yAxisMax;
        
        /*
         *  Construct plot's frame
         */
        var canvasFrame = document.createElement("div");
        canvasFrame.className = SimileAjax.Platform.browser.isIE ?
            "exhibit-scatterPlotView-canvasFrame-ie" :
            "exhibit-scatterPlotView-canvasFrame";
        this._dom.plotContainer.appendChild(canvasFrame);
        
        var canvasDiv = document.createElement("div");
        canvasDiv.className = "exhibit-scatterPlotView-canvas";
        canvasDiv.style.height = "100%";
        canvasFrame.appendChild(canvasDiv);
        
        var xAxisDiv = document.createElement("div");
        xAxisDiv.className = "exhibit-scatterPlotView-xAxis";
        this._dom.plotContainer.appendChild(xAxisDiv);
        
        var xAxisDivInner = document.createElement("div");
        xAxisDivInner.style.position = "relative";
        xAxisDiv.appendChild(xAxisDivInner);
        
        var yAxisDiv = document.createElement("div");
        yAxisDiv.className = SimileAjax.Platform.browser.isIE ?
            "exhibit-scatterPlotView-yAxis-ie" :
            "exhibit-scatterPlotView-yAxis";
        this._dom.plotContainer.appendChild(yAxisDiv);
        
        var yAxisDivInner = document.createElement("div");
        yAxisDivInner.style.position = "relative";
        yAxisDivInner.style.height = "100%";
        yAxisDiv.appendChild(yAxisDivInner);
        
        var canvasWidth = canvasDiv.offsetWidth;
        var canvasHeight = canvasDiv.offsetHeight;
        var xScale = canvasWidth / (xAxisMax - xAxisMin);
        var yScale = canvasHeight / (yAxisMax - yAxisMin);
        
        /*
         *  Construct plot's grid lines and axis labels
         */
        var makeMakeLabel = function(interval) {
            if (interval >= 1000000) {
                return function (n) { return Math.floor(n / 1000000) + "M"; };
            } else if (interval >= 1000) {
                return function (n) { return Math.floor(n / 1000) + "K"; };
            } else {
                return function (n) { return n; };
            }
        };
        var makeLabelX = makeMakeLabel(xInterval);
        var makeLabelY = makeMakeLabel(yInterval);
        
        for (var x = xAxisMin + xInterval; x < xAxisMax; x += xInterval) {
            var left = Math.floor((x - xAxisMin) * xScale);
            
            var div = document.createElement("div");
            div.className = "exhibit-scatterPlotView-gridLine";
            div.style.width = "1px";
            div.style.left = left + "px";
            div.style.top = "0px";
            div.style.height = "100%";
            canvasDiv.appendChild(div);
            
            var labelDiv = document.createElement("div");
            labelDiv.className = "exhibit-scatterPlotView-xAxisLabel";
            labelDiv.style.left = left + "px";
            labelDiv.innerHTML = makeLabelX(x);
            xAxisDivInner.appendChild(labelDiv);
        }
        var xNameDiv = document.createElement("div");
        xNameDiv.className = "exhibit-scatterPlotView-xAxisName";
        xNameDiv.innerHTML = this._plotSettings.xLabel;
        xAxisDivInner.appendChild(xNameDiv);
            
        for (var y = yAxisMin + yInterval; y < yAxisMax; y += yInterval) {
            var bottom = Math.floor((y - yAxisMin) * yScale);
            
            var div = document.createElement("div");
            div.className = "exhibit-scatterPlotView-gridLine";
            div.style.height = "1px";
            div.style.bottom = bottom + "px";
            div.style.left = "0px";
            div.style.width = "100%";
            canvasDiv.appendChild(div);
            
            var labelDiv = document.createElement("div");
            labelDiv.className = "exhibit-scatterPlotView-yAxisLabel";
            labelDiv.style.bottom = bottom + "px";
            labelDiv.innerHTML = makeLabelY(y);
            yAxisDivInner.appendChild(labelDiv);
        }
        var yNameDiv = document.createElement("div");
        yNameDiv.className = "exhibit-scatterPlotView-yAxisName";
        yNameDiv.innerHTML = this._plotSettings.yLabel;
        yAxisDivInner.appendChild(yNameDiv);
        
        /*
         *  Plot the points
         */
        var usedKeys = {};
        var addPointAtLocation = function(xyData) {
            var items = xyData.items;

            var colorData;
            if (xyData.colorKey == null) {
                colorData = Exhibit.ScatterPlotView._mixColor;
            } else {
                usedKeys[xyData.colorKey] = true;
                if (xyData.colorKey in self._colorKeyCache) {
                    colorData = self._colorKeyCache[xyData.colorKey];
                } else {
                    colorData = Exhibit.ScatterPlotView._colors[self._maxColor];
                    self._colorKeyCache[xyData.colorKey] = colorData;
                    self._maxColor = (self._maxColor + 1) % Exhibit.ScatterPlotView._colors.length;
                }
            }
            
            var marker = Exhibit.ScatterPlotView._makePoint(colorData.color);
            var x = xyData.xy.x;
            var y = xyData.xy.y;
            var left = Math.floor((x - xAxisMin) * xScale);
            var bottom = Math.floor((y - yAxisMin) * yScale);
            marker.style.left = left + "px";
            marker.style.bottom = bottom + "px";
            SimileAjax.WindowManager.registerEvent(marker, "click", function(elmt, evt, target) {
                self._openPopup(marker, items);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            });

            canvasDiv.appendChild(marker);
        }
        
        for (xyKey in xyToData) {
            addPointAtLocation(xyToData[xyKey]);
        }

        /*
         *  Draw the legends
         */
        var legendLabels = [];
        var legendColors = [];
        for (colorKey in this._colorKeyCache) {
            if (colorKey in usedKeys) {
                var colorData = this._colorKeyCache[colorKey];
                legendLabels.push(colorKey);
                legendColors.push("#" + colorData.color);
            }
        }
        legendLabels.push(Exhibit.ScatterPlotView.l10n.mixedLegendKey);
        legendColors.push("white");
        
        this._dom.addLegendBlock(Exhibit.ScatterPlotView.theme.constructLegendBlockDom(
            this._exhibit,
            Exhibit.ScatterPlotView.l10n.colorLegendTitle,
            legendColors,
            legendLabels
        ));
        
        this._dom.setTypes(database.getTypeLabels(currentSet)[currentSize > 1 ? 1 : 0]);
    }
    this._dom.setCounts(currentSize, mappableSize, originalSize);
};

Exhibit.ScatterPlotView.prototype._openPopup = function(elmt, items) {
    var coords = SimileAjax.DOM.getPageCoordinates(elmt);
    var bubble = SimileAjax.Graphics.createBubbleForPoint(
        document, 
        coords.left + Math.round(elmt.offsetWidth / 2), 
        coords.top + Math.round(elmt.offsetHeight / 2), 
        400, // px
        300  // px
    );
    
    if (items.length > 1) {
        var ul = document.createElement("ul");
        for (var i = 0; i < items.length; i++) {
            var li = document.createElement("li");
            li.appendChild(this._exhibit.makeItemSpan(items[i]));
            ul.appendChild(li);
        }
        bubble.content.appendChild(ul);
    } else {
        var itemLensDiv = document.createElement("div");
        var itemLens = new Exhibit.Lens(items[0], itemLensDiv, this._exhibit, this._lensConfiguration);
        bubble.content.appendChild(itemLensDiv);
    }
};

Exhibit.ScatterPlotView._makePoint = function(color) {
    var div = document.createElement("div");
    div.className = "exhibit-scatterPlotView-point";
    div.style.backgroundColor = "#" + color;
    div.style.width = "6px";
    div.style.height = "6px";
    return div;
};
