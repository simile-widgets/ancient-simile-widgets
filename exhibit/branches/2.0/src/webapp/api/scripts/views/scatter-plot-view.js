/*==================================================
 *  Exhibit.ScatterPlotView
 *==================================================
 */
Exhibit.ScatterPlotView = function(collection, containerElmt, lensRegistry, exhibit) {
    this._collection = collection;
    this._div = containerElmt;
    this._lensRegistry = lensRegistry;
    this._exhibit = exhibit;

    this._getXY = function(itemID, database) { return {}; };
    this._getColorKey = function(itemID, database) { return ""; };
    
    this._plotSettings = {
        xAxisMin: Number.POSITIVE_INFINITY,
        xAxisMax: Number.NEGATIVE_INFINITY,
        yAxisMin: Number.POSITIVE_INFINITY,
        yAxisMax: Number.NEGATIVE_INFINITY,
        xLabel:   "x",
        yLabel:   "y"
    };
    
    // Function maps that allow for other axis scales (logarithmic, etc.), defaults to identity/linear
    this._axisFuncs = { x: function (x) { return x; }, y: function (y) { return y; } };
    this._axisInverseFuncs = { x: function (x) { return x; }, y: function (y) { return y; } };

    this._xyCache = new Object();
    this._colorKeyCache = new Object();
    this._maxColor = 0;
    
    var view = this;
    this._listener = { 
        onItemsChanged: function() {
            view._reconstruct(); 
        }
    };
    collection.addListener(this._listener);
};

Exhibit.ScatterPlotView.create = function(configuration, containerElmt, lensRegistry, exhibit) {
    var collection = Exhibit.Collection.getCollection(configuration, exhibit);
    var lensRegistry2 = Exhibit.Component.createLensRegistry(configuration, lensRegistry);
    var view = new Exhibit.ScatterPlotView(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        lensRegistry2, 
        exhibit
    );
    
    Exhibit.ScatterPlotView._configure(view, configuration);
    
    view._initializeUI();
    return view;
};

Exhibit.ScatterPlotView.createFromDOM = function(configElmt, containerElmt, lensRegistry, exhibit) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var collection = Exhibit.Collection.getCollectionFromDOM(configElmt, configuration, exhibit);
    var lensRegistry2 = Exhibit.Component.createLensRegistryFromDOM(configElmt, configuration, lensRegistry);
    var view = new Exhibit.ScatterPlotView(
        collection, 
        containerElmt != null ? containerElmt : configElmt, 
        lensRegistry2, 
        exhibit
    );
    
    // Configure the axes functions (linear, log, etc)
    s = Exhibit.getAttribute(configElmt, "xAxisType");
    if (s != null && s.length > 0) {
        view._axisFuncs.x = Exhibit.ScatterPlotView._getAxisFunc(s);
        view._axisInverseFuncs.x = Exhibit.ScatterPlotView._getAxisInverseFunc(s);
    }
    s = Exhibit.getAttribute(configElmt, "yAxisType");
    if (s != null && s.length > 0) {
        view._axisFuncs.y = Exhibit.ScatterPlotView._getAxisFunc(s);
        view._axisInverseFuncs.y = Exhibit.ScatterPlotView._getAxisInverseFunc(s);
    }   
    
    /*
     *  Getter for x/y
     */
    try {
        var xy = Exhibit.getAttribute(configElmt, "xy");
        if (xy != null && xy.length > 0) {
            view._getXY = Exhibit.ScatterPlotView._makeGetXY(xy);
        } else {
            var x = Exhibit.getAttribute(configElmt, "x");
            var y = Exhibit.getAttribute(configElmt, "y");
            if (x != null && y != null && x.length > 0 && y.length > 0) {
                view._getXY = Exhibit.ScatterPlotView._makeGetXY2(x, y, view._axisFuncs);
            }
        }
    } catch (e) {
        SimileAjax.Debug.exception("ScatterPlotView: Error processing x/y configuration", e);
    }
    
    /*
     *  Getter for color key
     */
    try {
        var color = Exhibit.getAttribute(configElmt, "color");
        if (color != null && color.length > 0) {
            view._getColorKey = Exhibit.ScatterPlotView._makeGetColor(color);
        }
    } catch (e) {
        SimileAjax.Debug.exception("ScatterPlotView: Error processing color configuration", e);
    }
    
    /*
     *  Other settings
     */
    var s = Exhibit.getAttribute(configElmt, "xAxisMin");
    if (s != null && s.length > 0) {
        view._plotSettings.xAxisMin = parseFloat(s);
    }
    s = Exhibit.getAttribute(configElmt, "xAxisMax");
    if (s != null && s.length > 0) {
        view._plotSettings.xAxisMax = parseFloat(s);
    }
    s = Exhibit.getAttribute(configElmt, "yAxisMin");
    if (s != null && s.length > 0) {
        view._plotSettings.yAxisMin = parseFloat(s);
    }
    s = Exhibit.getAttribute(configElmt, "yAxisMax");
    if (s != null && s.length > 0) {
        view._plotSettings.yAxisMax = parseFloat(s);
    } 
    s = Exhibit.getAttribute(configElmt, "xLabel");
    if (s != null && s.length > 0) {
        view._plotSettings.xLabel = s;
    }
    s = Exhibit.getAttribute(configElmt, "yLabel");
    if (s != null && s.length > 0) {
        view._plotSettings.yLabel = s;
    }

    view._initializeUI();
    return view;
};

Exhibit.ScatterPlotView._configure = function(view, configuration) {

    // Configure the axes functions (linear, log, etc)
    if ("xAxisType" in configuration) {
        view._axisFuncs.x = Exhibit.ScatterPlotView._getAxisFunc(configuration.xAxisType);
        view._axisInverseFuncs.x = Exhibit.ScatterPlotView._getAxisInverseFunc(configuration.xAxisType);
    }
    if ("yAxisType" in configuration) {
        view._axisFuncs.y = Exhibit.ScatterPlotView._getAxisFunc(configuration.yAxisType);
        view._axisInverseFuncs.y = Exhibit.ScatterPlotView._getAxisInverseFunc(configuration.yAxisType);
    }
    
    /*
     *  Getter for x/y
     */
    try {
        if ("xy" in configuration) {
            view._getXY = Exhibit.ScatterPlotView._makeGetXY(configuration.xy);
        } else if ("x" in configuration && "y" in configuration) {
            view._getXY = Exhibit.ScatterPlotView._makeGetXY2(configuration.x, configuration.y, view._axisFuncs);
        }
    } catch (e) {
        SimileAjax.Debug.exception("ScatterPlotView: Error processing x/y configuration", e);
    }
    
    /*
     *  Getter for color key
     */
    try {
        if ("color" in configuration) {
            view._getColorKey = Exhibit.ScatterPlotView._makeGetColor(configuration.color);
        }
    } catch (e) {
        SimileAjax.Debug.exception("ScatterPlotView: Error processing color configuration", e);
    }

    /*
     *  Other settings
     */
    if ("xAxisMin" in configuration) {
        view._plotSettings.xAxisMin = configuration.xAxisMin;
    }
    if ("xAxisMax" in configuration) {
        view._plotSettings.xAxisMax = configuration.xAxisMax;
    }
    if ("yAxisMin" in configuration) {
        view._plotSettings.yAxisMin = configuration.yAxisMin;
    }
    if ("yAxisMax" in configuration) {
        view._plotSettings.yAxisMax = configuration.yAxisMax;
    }
    if ("xLabel" in configuration) {
        view._plotSettings.xLabel = configuration.xLabel;
    }
    if ("yLabel" in configuration) {
        view._plotSettings.yLabel = configuration.yLabel;
    }
};

// Convenience function that maps strings to respective functions
Exhibit.ScatterPlotView._getAxisFunc = function(s) {
    var stringToFunc = {
        linear: function (x) { return x; },
        log: function (x) { return (Math.log(x) / Math.log(10.0)); }
    };
    var func = stringToFunc[s];
    return func != null ? func : function (x) { return x; };
}

// Convenience function that maps strings to respective functions
Exhibit.ScatterPlotView._getAxisInverseFunc = function(s) {
    var stringToFunc = {
        linear: function (x) { return x; },
        log: function (x) { return Math.pow(10, x); }
    };
    var func = stringToFunc[s];
    return func != null ? func : function (x) { return x; };
}

// This hasn't been modified to support non-linear scales yet
Exhibit.ScatterPlotView._makeGetXY = function(s) {
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

Exhibit.ScatterPlotView._makeGetXY2 = function(x, y, funcs) {
    var xExpression = Exhibit.Expression.parse(x);
    var yExpression = Exhibit.Expression.parse(y);
    // Default values for funcs hash, i.e. the identity functions
    var funcs = augment({ x: function (x) { return x; },
                          y: function (y) { return y; } }, funcs);
    return function(itemID, database) {
        var result = {};
        var x = Exhibit.ScatterPlotView.evaluateSingle(xExpression, itemID, database);
        var y = Exhibit.ScatterPlotView.evaluateSingle(yExpression, itemID, database);
        if (x != null && y != null) {
            // We store the actual x,y values as x0 and y0
            result.x0 = (typeof x == "number") ? x : parseFloat(x);
            result.y0 = (typeof y == "number") ? y : parseFloat(y);
            // Then scale them with whatever method is specified
            result.x = funcs["x"](result.x0);
            result.y = funcs["y"](result.y0);
        }

        return result;
    }
};

Exhibit.ScatterPlotView._makeGetColor = function(s) {
    var colorExpression = Exhibit.Expression.parse(s);
    return function(itemID, database) {
        var key = Exhibit.ScatterPlotView.evaluateSingle(colorExpression, itemID, database);
        return key != null ? key : "";
    };
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
    return expression.evaluateSingleOnItem(itemID, database).value;
}

Exhibit.ScatterPlotView.prototype.dispose = function() {
    this._collection.removeListener(this._listener);
    
    this._div.innerHTML = "";
    
    this._dom = null;
    this._div = null;
    this._collection = null;
    this._exhibit = null;
};

Exhibit.ScatterPlotView.prototype._initializeUI = function() {
    var self = this;
    
    this._div.innerHTML = "";
    this._dom = Exhibit.ScatterPlotView.theme.constructDom(
        this._collection,
        this._exhibit, 
        this._div, 
        function(elmt, evt, target) {
            Exhibit.ViewPanel.resetCollection(self._collection);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        },
        function() {
            return self._reconstruct();
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
    var originalSize = this._collection.countAllItems();
    var currentSize = this._collection.countRestrictedItems();
    var mappableSize = 0;
    
    this._dom.clearLegend();
    if (currentSize > 0) {
        var currentSet = this._collection.getRestrictedItems();
        
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
        var makeMakeLabel = function(axis, interval) {
            // Intelligently deal with non-linear scales
            var f = self._axisInverseFuncs[axis];
            if (interval >= 1000000) {
                return function (n) { return Math.floor(f(n) / 1000000) + "M"; };
            } else if (interval >= 1000) {
                return function (n) { return Math.floor(f(n) / 1000) + "K"; };
            } else {
                return function (n) { return f(n); };
            }
        };
        var makeLabelX = makeMakeLabel("x", xInterval);
        var makeLabelY = makeMakeLabel("y", yInterval);
        
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
                colorData = Exhibit.ScatterPlotView._mixMarker;
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
            var x0 = xyData.xy.x0; // x0 and y0 are the actual data values, i.e. not scaled
            var y0 = xyData.xy.y0;
            var tooltip = xyData.items + " = (" + x0 + "," + y0 + ")";
            var left = Math.floor((x - xAxisMin) * xScale);
            var bottom = Math.floor((y - yAxisMin) * yScale);
            marker.style.left = left + "px";
            marker.style.bottom = bottom + "px";
            marker.title = tooltip;
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
            li.appendChild(Exhibit.UI.makeItemSpan(items[i], null, null, this._lensRegistry, this._exhibit));
            ul.appendChild(li);
        }
        bubble.content.appendChild(ul);
    } else {
        var itemLensDiv = document.createElement("div");
        var itemLens = this._lensRegistry.createLens(items[0], itemLensDiv, this._exhibit);
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
