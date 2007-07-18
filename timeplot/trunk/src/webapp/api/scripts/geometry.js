/**
 * Geometries
 * 
 * @fileOverview Geometries
 * @name Geometries
 */

/**
 * This is the constructor for the default value geometry.
 * A value geometry is what regulates mapping of the plot values to the screen y coordinate.
 * If two plots share the same value geometry, they will be drawn using the same scale.
 * If "min" and "max" parameters are not set, the geometry will stretch itself automatically
 * so that the entire plot will be drawn without overflowing. The stretching happens also
 * when a geometry is shared between multiple plots, the one with the biggest range will
 * win over the others.
 * 
 * @constructor
 */
Timeplot.DefaultValueGeometry = function(params) {
    if (!params) params = {};
    this._id = ("id" in params) ? params.id : "g" + Math.round(Math.random() * 1000000);
    this._axisColor = ("axisColor" in params) ? ((params.axisColor == "string") ? new Timeplot.Color(params.axisColor) : params.axisColor) : new Timeplot.Color("#606060"),
    this._gridColor = ("gridColor" in params) ? ((params.gridColor == "string") ? new Timeplot.Color(params.gridColor) : params.gridColor) : null,
    this._gridLineWidth = ("gridLineWidth" in params) ? params.gridLineWidth : 0.5;
    this._axisLabelsPlacement = ("axisLabelsPlacement" in params) ? params.axisLabelsPlacement : "right";
    this._gridStep = ("gridStep" in params) ? params.gridStep : 30;
    this._gridStepRange = ("gridStepRange" in params) ? params.gridStepRange : 20;
    this._minValue = ("min" in params) ? params.min : null;
    this._maxValue = ("max" in params) ? params.max : null;
    this._linMap = {
        direct: function(v) {
            return v;
        },
        inverse: function(y) {
            return y;
        }
    }
    this._map = this._linMap;
    this._labels = [];
}

Timeplot.DefaultValueGeometry.prototype = {

    /**
     * Initialize this geometry associating it with the given timeplot.
     */
    initialize: function(timeplot) {
        this._timeplot = timeplot;
        this._canvas = timeplot.getCanvas();
    },

    /**
     * Called by all the plot layers this geometry is associated with
     * to update the value range. Unless min/max values are specified
     * in the parameters, the biggest value range will be used.
     */
    setRange: function(range) {
        if ((this._minValue == null) || ((this._minValue != null) && (range.min < this._minValue))) {
            this._minValue = range.min;
        }
        if ((this._maxValue == null) || ((this._maxValue != null) && (range.max * 1.05 > this._maxValue))) {
            this._maxValue = range.max * 1.05; // get a little more head room to avoid hitting the ceiling
        }

        this._updateMappedValues();

        if (this._minValue == 0 && this._maxValue == 0) {
            this._gridSpacing = { y: 0, value: 0 };
        } else { 
            this._gridSpacing = this._calculateGridSpacing();
        }
    },

    /**
     * Called after changing ranges or canvas size to reset the grid values
     */
    reset: function() {
        this._updateMappedValues();
        this._gridSpacing = this._calculateGridSpacing();
        for (var i = 0; i < this._labels.length; i++) {
            this._timeplot.removeDiv(this._labels[i]);
        }
        this._labels = [];
    },

    /**
     * Map the given value to a y screen coordinate.
     */
    toScreen: function(value) {
    	if (this._maxValue) {
	        var v = value - this._minValue;
	        return this._canvas.height * (this._map.direct(v)) / this._mappedRange;
    	} else {
    		return 0;
    	}
    },

    /**
     * Map the given y screen coordinate to a value
     */
    fromScreen: function(y) {
        return this._map.inverse(this._mappedRange * y / this._canvas.height) + this._minValue;
    },

    /**
     * Each geometry is also a painter and paints the value grid and grid labels.
     */
    paint: function() {
        var ctx = this._canvas.getContext('2d');

        var gradient = ctx.createLinearGradient(0,0,0,this._canvas.height);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = this._gridLineWidth;
        ctx.lineJoin = 'miter';

        // paint grid
        if (this._gridColor) {        
            gradient.addColorStop(0, this._gridColor.toString());
            gradient.addColorStop(1, "rgba(255,255,255,0.5)");

            var y = this._gridSpacing.y;
            var value = this._gridSpacing.value;
            var counter = 1;
            while (y < this._canvas.height) {
                ctx.beginPath();
                ctx.moveTo(0,y);
                ctx.lineTo(this._canvas.width,y);
                ctx.stroke();

                if (this._axisLabelsPlacement == "right") {
	                var div = this._timeplot.putText(value,"timeplot-grid-label",{
	                    bottom: y,
	                    right: 2
	                });
                } else if (this._axisLabelsPlacement == "left") {
                    var div = this._timeplot.putText(value,"timeplot-grid-label",{
                        bottom: y,
                        left: 2
                    });
                }
                this._labels.push(div);

                y += this._gridSpacing.y;
                value += this._gridSpacing.value;
                counter++;
            }
        }

        // paint axis
	    gradient.addColorStop(0, this._axisColor.toString());
	    gradient.addColorStop(1, "rgba(255,255,255,0.5)");
        
        ctx.lineWidth = 1;
        gradient.addColorStop(0, this._axisColor.toString());

        // left axis
        ctx.beginPath();
        ctx.moveTo(0,this._canvas.height);
        ctx.lineTo(0,0);
        ctx.stroke();
        
        // right axis
        ctx.beginPath();
        ctx.moveTo(this._canvas.width,0);
        ctx.lineTo(this._canvas.width,this._canvas.height);
        ctx.stroke();
    },
    
    /*
     * This function calculates the grid spacing that it will be used 
     * by this geometry to draw the grid in order to reduce clutter. 
     */
    _calculateGridSpacing: function() {
    	var step = this._gridStep;
    	var range = this._gridStepRange;
        var v = this.fromScreen(step);
        for (var i = 1; i < 10; i++) { // 10 iterations should be enough to converge
            var r = Timeplot.Math.round(v,i);
            var y = this.toScreen(r);
            if (step - range < y && y < step + range) {
               return {
                   y: y,
                   value: r
               }
            }
        }
        return {
            y: step,
            value: v
        }
    },

    /*
     * Update the values that are used by the paint function so that
     * we don't have to calculate them at every repaint.
     */
    _updateMappedValues: function() {
        this._valueRange = this._maxValue - this._minValue;
        this._mappedRange = this._map.direct(this._valueRange);
    }
    
}

// --------------------------------------------------

/**
 * This is the constructor for a Logarithmic value geometry, which
 * is useful when plots have values in different magnitudes but 
 * exhibit similar trends and such trends want to be shown on the same
 * plot (here a cartesian geometry would make the small magnitudes 
 * disappear).
 * 
 * NOTE: this class extends Timeplot.DefaultValueGeometry and inherits
 * all of the methods of that class. So refer to that class. 
 * 
 * @constructor
 */
Timeplot.LogarithmicValueGeometry = function(params) {
    Timeplot.DefaultValueGeometry.apply(this, arguments);
    this._logMap = {
    	direct: function(v) {
    		return Math.log(v+1);
    	},
    	inverse: function(y) {
    		return Math.exp(y)-1;
    	}
    }
    this._mode = "log";
    this._map = this._logMap;
};

Object.extend(Timeplot.LogarithmicValueGeometry.prototype,Timeplot.DefaultValueGeometry.prototype);

/**
 * Turn the logarithmic scaling off. 
 */
Timeplot.LogarithmicValueGeometry.prototype.actLinear = function() {
    this._mode = "lin";
    this._map = this._linMap;
	this.reset();
}

/**
 * Turn the logarithmic scaling on. 
 */
Timeplot.LogarithmicValueGeometry.prototype.actLogarithmic = function() {
    this._mode = "log";
    this._map = this._logMap;
    this.reset();
}

/**
 * Toggle logarithmic scaling seeting it to on if off and viceversa. 
 */
Timeplot.LogarithmicValueGeometry.prototype.toggle = function() {
	if (this._mode == "log") {
		this.actLinear();
	} else {
        this.actLogarithmic();
	}
}

// -----------------------------------------------------

/**
 * This is the constructor for the default time geometry.
 * 
 * @constructor
 */
Timeplot.DefaultTimeGeometry = function(params) {
    if (!params) params = {};
    this._id = ("id" in params) ? params.id : "g" + Math.round(Math.random() * 1000000);
    this._locale = ("locale" in params) ? params.locale : SimileAjax.Platform.getDefaultLocale();
    this._timeZone = ("timeZone" in params) ? plotInfo.params : 0;
    this._labeller = ("labeller" in params) ? plotInfo.params : null;
    this._axisColor = ("axisColor" in params) ? ((params.axisColor == "string") ? new Timeplot.Color(params.axisColor) : params.axisColor) : new Timeplot.Color("#606060"),
    this._gridColor = ("gridColor" in params) ? ((params.gridColor == "string") ? new Timeplot.Color(params.gridColor) : params.gridColor) : null,
    this._gridLineWidth = ("gridLineWidth" in params) ? params.gridLineWidth : 0.5;
    this._axisLabelsPlacement = ("axisLabelsPlacement" in params) ? params.axisLabelsPlacement : "bottom";
    this._gridStep = ("gridStep" in params) ? params.gridStep : 100;
    this._gridStepRange = ("gridStepRange" in params) ? params.gridStepRange : 20;
    this._min = ("min" in params) ? params.min : null;
    this._max = ("max" in params) ? params.max : null;
    this._timeValuePosition =("timeValuePosition" in params) ? params.timeValuePosition : "bottom";
    this._linMap = {
        direct: function(t) {
            return t;
        },
        inverse: function(x) {
            return x;
        }
    }
    this._map = this._linMap;
    this._labels = [];
}

Timeplot.DefaultTimeGeometry.prototype = {

    /**
     * Initialize this geometry associating it with the given timeplot.
     */
    initialize: function(timeplot) {
    	this._timeplot = timeplot;
    	if (this._labeler == null) this._labeler = timeplot.getUnit().createLabeller(this._locale, this._timeZone);
    	this._canvas = timeplot.getCanvas();
        var dateParser = this._timeplot.getUnit().getParser("iso8601");
	    if (this._min && !this._min.getTime) {
	    	this._min = dateParser(this._min);
	    }
        if (this._max && !this._max.getTime) {
            this._max = dateParser(this._max);
        }
    },

    /**
     * Called by all the plot layers this geometry is associated with
     * to update the time range. Unless min/max values are specified
     * in the parameters, the biggest range will be used.
     */
    setRange: function(range) {
    	if (this._min) {
    		this._earliestDate = this._min;
    	} else if (range.earliestDate && ((this._earliestDate == null) || ((this._earliestDate != null) && (range.earliestDate.getTime() < this._earliestDate.getTime())))) {
            this._earliestDate = range.earliestDate;
        }
        
        if (this._max) {
        	this._latestDate = this._max;
        } else if (range.latestDate && ((this._latestDate == null) || ((this._latestDate != null) && (range.latestDate.getTime() > this._latestDate.getTime())))) {
            this._latestDate = range.latestDate;
        }

        if (!this._earliestDate && !this._latestDate) {
            this._gridSpacing = { x: 0, unit: 0, value: 0 };
        } else {
        	this.reset(); 
        }
    },

    /**
     * Called after changing ranges or canvas size to reset the grid values
     */
    reset: function() {
        this._updateMappedValues();
        this._gridSpacing = this._calculateGridSpacing();
        for (var i = 0; i < this._labels.length; i++) {
        	this._timeplot.removeDiv(this._labels[i]);
        }
        this._labels = [];
    },
    
    /**
     * Map the given date to a x screen coordinate.
     */
    toScreen: function(time) {
        if (this._latestDate) {
            var t = time - this._earliestDate.getTime();
            return this._canvas.width * this._map.direct(t) / this._mappedPeriod;
        } else {
            return 0;
        } 
    },

    /**
     * Map the given x screen coordinate to a date.
     */
    fromScreen: function(x) {
        return this._map.inverse(this._mappedPeriod * x / this._canvas.width) + this._earliestDate.getTime(); 
    },
    
    /**
     * Get a period (in milliseconds) this time geometry spans.
     */
    getPeriod: function() {
    	return this._period;
    },

   /**
    * Each geometry is also a painter and paints the value grid and grid labels.
    */
    paint: function() {
    	var unit = this._timeplot.getUnit();
        var ctx = this._canvas.getContext('2d');

        var gradient = ctx.createLinearGradient(0,0,0,this._canvas.height);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = this._gridLineWidth;
        ctx.lineJoin = 'miter';

        // paint grid
        if (this._gridColor) {        
            gradient.addColorStop(0, this._gridColor.toString());
            gradient.addColorStop(1, "rgba(255,255,255,0.9)");

            var x = this._gridSpacing.x;
            var value = unit.toNumber(this._earliestDate) + this._gridSpacing.value;
            var counter = 1;
            while (x < this._canvas.width) {
                var _label = this._labeler.labelInterval(unit.fromNumber(value),this._gridSpacing.unit).text;
                if (this._axisLabelsPlacement == "top") {
                    var div = this._timeplot.putText(_label,"timeplot-grid-label",{
                        left: x + 2,
                        top: 2,
                        visibility: "hidden"
                    });
                } else if (this._axisLabelsPlacement == "bottom") {
                    var div = this._timeplot.putText(_label,"timeplot-grid-label",{
                        left: x + 2,
                        bottom: 2,
                        visibility: "hidden"
                    });
                }
                this._labels.push(div);
                if (x + div.clientWidth < this._canvas.width + 10) {
                	div.style.visibility = "visible"; // avoid the labels that would overflow
                }

                // draw separator
                ctx.beginPath();
                ctx.moveTo(x,0);
                ctx.lineTo(x,this._canvas.height);
                ctx.stroke();

                x += this._gridSpacing.x;
                value += this._gridSpacing.value;
                counter++;
            }
        }

        // paint axis
        gradient.addColorStop(0, this._axisColor.toString());
        gradient.addColorStop(1, "rgba(255,255,255,0.5)");
        
        ctx.lineWidth = 1;
        gradient.addColorStop(0, this._axisColor.toString());

        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(this._canvas.width,0);
        ctx.stroke();
    },
    
    /*
     * This function calculates the grid spacing that it will be used 
     * by this geometry to draw the grid in order to reduce clutter. 
     */
    _calculateGridSpacing: function() {
    	var u = this._timeplot.getUnit();
        var lib = SimileAjax.DateTime;
        var step = this._gridStep;
        var range = this._gridStepRange;
        var t = this.fromScreen(step);
        var date = u.fromNumber(t);
        for (var unit = lib.MILLENNIUM; unit > 0; unit--) {
            var d = u.cloneValue(date);
	        lib.roundDownToInterval(d, unit, this._timeZone, 1, 0);
	        var t2 = u.toNumber(d);
            var x = this.toScreen(t2);
            if (step - range < x && x < step + range) {
               return {
                   x: x,
                   unit: unit,
                   value: t2 - u.toNumber(this._earliestDate),
               }
            }
        }
        return {
            x: step,
            unit: lib.MILLISECOND,
            value: t - u.toNumber(this._earliestDate)
        }
    },
    
    /*
     * Update the values that are used by the paint function so that
     * we don't have to calculate them at every repaint.
     */
    _updateMappedValues: function() {
        this._period = this._latestDate.getTime() - this._earliestDate.getTime();
        this._mappedPeriod = this._map.direct(this._period);
    }
    
}

// --------------------------------------------------------------

/**
 * This is the constructor for the magnifying time geometry.
 * Users can interact with this geometry and 'magnify' certain areas of the
 * plot to see the plot enlarged and resolve details that would otherwise
 * get lost or cluttered with a linear time geometry.
 * 
 * @constructor
 */
Timeplot.MagnifyingTimeGeometry = function(params) {
    Timeplot.DefaultTimeGeometry.apply(this, arguments);
        
    var g = this;
    this._MagnifyingMap = {
        direct: function(t) {
        	if (t < g._leftTimeMargin) {
        		var x = t * g._leftRate;
        	} else if ( g._leftTimeMargin < t && t < g._rightTimeMargin ) {
        		var x = t * g._expandedRate + g._expandedTimeTranslation;
        	} else {
        		var x = t * g._rightRate + g._rightTimeTranslation;
        	}
        	return x;
        },
        inverse: function(x) {
            if (x < g._leftScreenMargin) {
                var t = x / g._leftRate;
            } else if ( g._leftScreenMargin < x && x < g._rightScreenMargin ) {
                var t = x / g._expandedRate + g._expandedScreenTranslation;
            } else {
                var t = x / g._rightRate + g._rightScreenTranslation;
            }
            return t;
        }
    }

    this._mode = "lin";
    this._map = this._linMap;
};

Object.extend(Timeplot.MagnifyingTimeGeometry.prototype,Timeplot.DefaultTimeGeometry.prototype);

/**
 * Initialize this geometry associating it with the given timeplot and 
 * register the geometry event handlers to the timeplot so that it can
 * interact with the user.
 */
Timeplot.MagnifyingTimeGeometry.prototype.initialize = function(timeplot) {
    Timeplot.DefaultTimeGeometry.prototype.initialize.apply(this, arguments);

    if (!this._lens) {
        this._lens = this._timeplot.putDiv("lens","timeplot-lens");
    }

    var period = 1000 * 60 * 60 * 24 * 30; // a month in the magnifying lens

    var geometry = this;
    
    var magnifyWith = function(lens) {
        var aperture = lens.clientWidth;
        var loc = geometry._timeplot.locate(lens);
        geometry.setMagnifyingParams(loc.x + aperture / 2, aperture, period);
        geometry.actMagnifying();
        geometry._timeplot.paint();
    }
    
    var canvasMouseDown = function(elmt, evt, target) {
        geometry._canvas.startCoords = SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);
        geometry._canvas.pressed = true;
    }
    
    var canvasMouseUp = function(elmt, evt, target) {
        geometry._canvas.pressed = false;
        var coords = SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);
        if (Timeplot.Math.isClose(coords,geometry._canvas.startCoords,5)) {
            geometry._lens.style.display = "none";
            geometry.actLinear();
            geometry._timeplot.paint();
        } else {
	        geometry._lens.style.cursor = "move";
	        magnifyWith(geometry._lens);
        }
    }

    var canvasMouseMove = function(elmt, evt, target) {
        if (geometry._canvas.pressed) {
            var coords = SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);
            if (coords.x < 0) coords.x = 0;
            if (coords.x > geometry._canvas.width) coords.x = geometry._canvas.width;
            geometry._timeplot.placeDiv(geometry._lens, {
                left: geometry._canvas.startCoords.x,
                width: coords.x - geometry._canvas.startCoords.x,
                bottom: 0,
                height: geometry._canvas.height,
                display: "block"
            });
        }
    }

    var lensMouseDown = function(elmt, evt, target) {
        geometry._lens.startCoords = SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);;
        geometry._lens.pressed = true; 
    }
    
    var lensMouseUp = function(elmt, evt, target) {
        geometry._lens.pressed = false;
    }
    
    var lensMouseMove = function(elmt, evt, target) {
        if (geometry._lens.pressed) {
            var coords = SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);
            var lens = geometry._lens;
            var left = lens.offsetLeft + coords.x - lens.startCoords.x;
            if (left < geometry._timeplot._paddingX) left = geometry._timeplot._paddingX;
            if (left + lens.clientWidth > geometry._canvas.width - geometry._timeplot._paddingX) left = geometry._canvas.width - lens.clientWidth + geometry._timeplot._paddingX;
            lens.style.left = left;
            magnifyWith(lens);
        }
    }
    
    if (!this._canvas.instrumented) {
        SimileAjax.DOM.registerEvent(this._canvas, "mousedown", canvasMouseDown);
        SimileAjax.DOM.registerEvent(this._canvas, "mousemove", canvasMouseMove);
        SimileAjax.DOM.registerEvent(this._canvas, "mouseup"  , canvasMouseUp);
        SimileAjax.DOM.registerEvent(this._canvas, "mouseup"  , lensMouseUp);
        this._canvas.instrumented = true;
    }
    
    if (!this._lens.instrumented) {
	    SimileAjax.DOM.registerEvent(this._lens, "mousedown", lensMouseDown);
	    SimileAjax.DOM.registerEvent(this._lens, "mousemove", lensMouseMove);
        SimileAjax.DOM.registerEvent(this._lens, "mouseup"  , lensMouseUp);
    	SimileAjax.DOM.registerEvent(this._lens, "mouseup"  , canvasMouseUp);
    	this._lens.instrumented = true;
    }
}

/**
 * Set the Magnifying parameters. c is the location in pixels where the Magnifying
 * center should be located in the timeplot, a is the aperture in pixel of
 * the Magnifying and b is the time period in milliseconds that the Magnifying 
 * should span.
 */
Timeplot.MagnifyingTimeGeometry.prototype.setMagnifyingParams = function(c,a,b) {
    var a = a / 2;
    var b = b / 2;

    var w = this._canvas.width;
    var d = this._period;

    if (c < 0) c = 0;
    if (c > w) c = w;
    
    if (c - a < 0) a = c;
    if (c + a > w) a = w - c;
    
    var ct = this.fromScreen(c) - this._earliestDate.getTime();
    if (ct - b < 0) b = ct;
    if (ct + b > d) b = d - ct;

    this._centerX = c;
    this._centerTime = ct;
    this._aperture = a;
    this._aperturePeriod = b;
    
    this._leftScreenMargin = this._centerX - this._aperture;
    this._rightScreenMargin = this._centerX + this._aperture;
    this._leftTimeMargin = this._centerTime - this._aperturePeriod;
    this._rightTimeMargin = this._centerTime + this._aperturePeriod;
        
    this._leftRate = (c - a) / (ct - b);
    this._expandedRate = a / b;
    this._rightRate = (w - c - a) / (d - ct - b);

    this._expandedTimeTranslation = this._centerX - this._centerTime * this._expandedRate; 
    this._expandedScreenTranslation = this._centerTime - this._centerX / this._expandedRate;
    this._rightTimeTranslation = (c + a) - (ct + b) * this._rightRate;
    this._rightScreenTranslation = (ct + b) - (c + a) / this._rightRate;

    this._updateMappedValues();
}

/*
 * Turn magnification off.
 */
Timeplot.MagnifyingTimeGeometry.prototype.actLinear = function() {
    this._mode = "lin";
    this._map = this._linMap;
    this.reset();
}

/*
 * Turn magnification on.
 */
Timeplot.MagnifyingTimeGeometry.prototype.actMagnifying = function() {
    this._mode = "Magnifying";
    this._map = this._MagnifyingMap;
    this.reset();
}

/*
 * Toggle magnification.
 */
Timeplot.MagnifyingTimeGeometry.prototype.toggle = function() {
    if (this._mode == "Magnifying") {
        this.actLinear();
    } else {
        this.actMagnifying();
    }
}

