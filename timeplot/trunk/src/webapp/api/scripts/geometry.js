/*==================================================
 *  Default Geometry
 *==================================================*/

Timeplot.DefaultValueGeometry = function(params) {
    if (!params) params = {};
    this._id = ("id" in params) ? params.id : "g" + Math.round(Math.random() * 1000000);
    this._axisColor = ("axisColor" in params) ? params.axisColor : new Timeplot.Color("#606060");
    this._gridColor = ("gridColor" in params) ? params.gridColor : null;
    this._axisLabelsPlacement = ("axisLabelsPlacement" in params) ? params.axisLabelsPlacement : null;
    this._center = ("center" in params) ? params.center : 30;
    this._range = ("range" in params) ? params.range : 20;
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
}

Timeplot.DefaultValueGeometry.prototype = {

    initialize: function(timeplot) {
        this._timeplot = timeplot;
        this._canvas = timeplot.getCanvas();
    },

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

    _updateMappedValues: function() {
    	this._valueRange = this._maxValue - this._minValue;
        this._mappedRange = this._map.direct(this._valueRange);
    },

    _calculateGridSpacing: function() {
        var v = this.fromScreen(this._center);
        for (var i = 1; i < 10; i++) { // 10 iterations should be enough to converge
            var r = Timeplot.Math.round(v,i);
            var y = this.toScreen(r);
            if (this._center - this._range < y && y < this._center + this._range) {
               return {
                   y: y,
                   value: r
               }
            }
        }
        return {
            y: v,
            value: this._center
        }
    },

    toScreen: function(value) {
    	if (this._maxValue) {
	        var v = value - this._minValue;
	        return this._canvas.height * (this._map.direct(v)) / this._mappedRange;
    	} else {
    		return 0;
    	}
    },

    fromScreen: function(y) {
        return this._map.inverse(this._mappedRange * y / this._canvas.height) + this._minValue;
    },

    paint: function() {
        var ctx = this._canvas.getContext('2d');

        var gradient = ctx.createLinearGradient(0,0,0,this._canvas.height);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.5;
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
	                this._timeplot.putText(value,"timeplot-grid-label",{
	                    bottom: y,
	                    right: 2
	                });
                } else if (this._axisLabelsPlacement == "left") {
                    this._timeplot.putText(value,"timeplot-grid-label",{
                        bottom: y,
                        left: 2
                    });
                }

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

        ctx.beginPath();
        ctx.moveTo(0,this._canvas.height);
        ctx.lineTo(0,0);
        ctx.lineTo(this._canvas.width,0);
        ctx.lineTo(this._canvas.width,this._canvas.height);
        ctx.stroke();
    }
}

// --------------------------------------------------

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

Timeplot.LogarithmicValueGeometry.prototype.actLinear = function() {
    this._mode = "lin";
    this._map = this._linMap;
	this._updateMappedValues();
}

Timeplot.LogarithmicValueGeometry.prototype.actLogarithmic = function() {
    this._mode = "log";
    this._map = this._logMap;
    this._updateMappedValues();
}

Timeplot.LogarithmicValueGeometry.prototype.toggle = function() {
	if (this._mode == "log") {
		this.actLinear();
	} else {
        this.actLogarithmic();
	}
}

// -----------------------------------------------------

Timeplot.DefaultTimeGeometry = function(params) {
    if (!params) params = {};
    this._id = ("id" in params) ? params.id : "g" + Math.round(Math.random() * 1000000);
    this._axisColor = ("axisColor" in params) ? params.axisColor : new Timeplot.Color("#606060");
    this._gridColor = ("gridColor" in params) ? params.gridColor : null;
    this._min = ("min" in params) ? params.min : null;
    this._max = ("max" in params) ? params.max : null;
    this._linMap = {
        direct: function(t) {
            return t;
        },
        inverse: function(x) {
            return x;
        }
    }
    this._map = this._linMap;
}

Timeplot.DefaultTimeGeometry.prototype = {

    initialize: function(timeplot) {
    	this._timeplot = timeplot;
    	this._canvas = timeplot.getCanvas();
        var dateParser = this._timeplot.getUnit().getParser("iso8601");
	    if (this._min && !this._min.getTime) {
	    	this._min = dateParser(this._min);
	    }
        if (this._max && !this._max.getTime) {
            this._max = dateParser(this._max);
        }
    },

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
            this._gridSpacing = { y: 0, value: 0 };
        } else { 
            this._updateMappedValues();
            this._gridSpacing = this._calculateGridSpacing();
        }
    },

    _updateMappedValues: function() {
    	this._period = this._latestDate.getTime() - this._earliestDate.getTime();
        this._mappedPeriod = this._map.direct(this._period);
    },
        
    _calculateGridSpacing: function() {
    	// fixme(SM): implement
        return {
            y: 0,
            value: 0
        }
    },

    toScreen: function(time) {
        if (this._latestDate) {
            var t = time - this._earliestDate.getTime();
            return this._canvas.width * this._map.direct(t) / this._mappedPeriod;
        } else {
            return 0;
        } 
    },

    fromScreen: function(x) {
        return this._map.inverse(this._mappedPeriod * x / this._canvas.width) + this._earliestDate.getTime(); 
    },
    
    getPeriod: function() {
    	return this._period;
    },

    paint: function() {
        var ctx = this._canvas.getContext('2d');

        // fixme(SM): implement
    }
}

// --------------------------------------------------------------

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

Timeplot.MagnifyingTimeGeometry.prototype.actLinear = function() {
    this._mode = "lin";
    this._map = this._linMap;
    this._updateMappedValues();
}

Timeplot.MagnifyingTimeGeometry.prototype.actMagnifying = function() {
    this._mode = "Magnifying";
    this._map = this._MagnifyingMap;
    this._updateMappedValues();
}

Timeplot.MagnifyingTimeGeometry.prototype.toggle = function() {
    if (this._mode == "Magnifying") {
        this.actLinear();
    } else {
        this.actMagnifying();
    }
}

