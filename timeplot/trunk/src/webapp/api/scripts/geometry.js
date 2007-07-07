/*==================================================
 *  Default Geometry
 *==================================================*/

Timeplot.DefaultValueGeometry = function(params) {
    if (!params) params = {};
    this._id = ("id" in params) ? params.id : "g" + Math.round(Math.random() * 1000000);
    this._axisColor = ("axisColor" in params) ? params.axisColor : new Timeplot.Color("#606060");
    this._gridColor = ("gridColor" in params) ? params.gridColor : null;
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

    setTimeplot: function(timeplot) {
        this._timeplot = timeplot;
    },

    setCanvas: function(canvas) {
        this._canvas = canvas;
    },

    setRange: function(range) {
        if (!this._minValue || (this._minValue && range.min < this._minValue)) {
            this._minValue = range.min;
        }
        if (!this._maxValue || (this._maxValue && range.max * 1.05 > this._maxValue)) {
            this._maxValue = range.max * 1.05; // get a little more head room to avoid hitting the ceiling
        }
        if (this._minValue == 0 && this._maxValue == 0) {
            this._gridSpacing = { y: 0, value: 0 };
        } else { 
        	this._gridSpacing = this._calculateGridSpacing();
        }
        this._updateMappedValues();
    },

    _updateMappedValues: function() {
    	this._valueRange = this._maxValue - this._minValue
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
	        return (this._canvas.height * this._map.direct(v)) / this._mappedRange;
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
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.2;
        ctx.lineJoin = 'miter';

        // paint grid
        if (this._gridColor) {        
            gradient.addColorStop(0, this._gridColor.toString());

            var y = this._gridSpacing.y;
            var value = this._gridSpacing.value;
            var counter = 1;
            while (y < this._canvas.height) {
                ctx.beginPath();
                ctx.moveTo(0,y);
                ctx.lineTo(this._canvas.width,y);
                ctx.stroke();

                this._timeplot.putText(value,"timeplot-grid-label",{
                    bottom: y,
                    right: 2
                });

                y += this._gridSpacing.y;
                value += this._gridSpacing.value;
                counter++;
            }
        }

        // paint axis
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
    this._earliestDate = ("earliestDate" in params) ? params.earliestDate : null;
    this._latestDate = ("latestDate" in params) ? params.earliestDate : null;
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

    setTimeplot: function(timeplot) {
        this._timeplot = timeplot;
    },

    setCanvas: function(canvas) {
        this._canvas = canvas;
    },

    setRange: function(range) {
        if (range.earliestDate && (!this._earliestDate || (this._earliestDate && range.earliestDate.getTime() < this._earliestDate.getTime()))) {
            this._earliestDate = range.earliestDate;
        }
        if (range.latestDate && (!this._latestDate || (this._latestDate && range.latestDate.getTime() > this._latestDate.getTime()))) {
            this._latestDate = range.latestDate;
        }
        if (this._earliestDate && this._latestDate) {
            this._gridSpacing = { y: 0, value: 0 };
        } else { 
            this._gridSpacing = this._calculateGridSpacing();
        }
        this._updateMappedValues();
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
            return (this._canvas.width * this._map.direct(t)) / this._mappedPeriod;
        } else {
            return 0;
        } 
    },

    fromScreen: function(x) {
        var period = this._latestDate.getTime() - this._earliestDate.getTime();
        return this._map.inverse(this._mappedPeriod * x / this._canvas.width) + this._earliestDate.getTime(); 
    },

    paint: function() {
        var ctx = this._canvas.getContext('2d');

        // fixme(SM): implement
    }
}

// --------------------------------------------------------------

Timeplot.FisheyeTimeGeometry = function(params) {
    Timeplot.DefaultTimeGeometry.apply(this, arguments);
    this._bsplineLevels = 3;
    this._center = 0.5;
    this._aperture = 0.1;
    this._intensity = 0.4;
    this.updateBSpline();
    
    var geometry = this;
    this._fisheyeMap = {
        direct: function(x) {
        	var y = (x < geometry._center) ? geometry._leftSpline.getY(x) : geometry._rightSpline.getY(x);
        	//log("x: " + x + " y: " + y);
        	return y;
        },
        inverse: function(y) {
            var x = (y < geometry._center) ? geometry._leftSpline.getX(y) : geometry._rightSpline.getX(y);
            //log("y: " + y + " x: " + x);
            return x;
        }
    }
    this._mode = "fisheye";
    this._map = this._fisheyeMap;
};

Object.extend(Timeplot.FisheyeTimeGeometry.prototype,Timeplot.DefaultTimeGeometry.prototype);

Timeplot.FisheyeTimeGeometry.prototype.setTimeplot = function(timeplot) {
	this._timeplot = timeplot;
	this._centerIndicator = this._timeplot.putDiv("timeplot-valueflag-pole");
}

Timeplot.FisheyeTimeGeometry.prototype.setCanvas = function(canvas) {
	this._canvas = canvas;
    var geometry = this;

    var clickHandler = function(elmt, evt, target) {
        if (geometry._mode == "fisheye") {
            var coords = SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);
            geometry._timeplot.placeDiv(geometry._centerIndicator, {
                left: coords.x,
                bottom: 0,
                height: geometry._canvas.height,
                display: "block"
            });
            geometry.setFisheyeCenter(coords.x);
            geometry.setFisheyeAperture(0.1);
            geometry.setFisheyeIntensity(0.4);
            geometry.updateBSpline();
        }
    };
            
    SimileAjax.DOM.registerEvent(this._canvas, "click", clickHandler);
}

Timeplot.FisheyeTimeGeometry.prototype.actLinear = function() {
    this._mode = "lin";
    this._map = this._linMap;
    this._updateMappedValues();
}

Timeplot.FisheyeTimeGeometry.prototype.actFisheye = function() {
    this._mode = "fisheye";
    this._map = this._fisheyeMap;
    this._updateMappedValues();
}

Timeplot.FisheyeTimeGeometry.prototype.toggle = function() {
    if (this._mode == "fisheye") {
        this.actLinear();
    } else {
        this.actFisheye();
    }
}

Timeplot.FisheyeTimeGeometry.prototype.setFisheyeCenter = function(x) {
	this._center = x / this._canvas.width;
}

Timeplot.FisheyeTimeGeometry.prototype.setFisheyeAperture = function(a) {
    //this._aperture = a / this._canvas.width;
    this._aperture = a;
    while (this._center - this._aperture < 0 || this._center + this._aperture > 1) {
    	if (this._center - this._aperture < 0) {
    		this._aperture = this._center;
    	}
    	if (this._center + this._aperture > 1) {
            this._aperture = 1 - this._center;
    	}
    }
}

Timeplot.FisheyeTimeGeometry.prototype.setFisheyeIntensity = function(b) {
    //this._intensity = b / this._canvas.height;
    this._intensity = b;
    while (this._center - this._intensity < 0 || this._center + this._intensity > 1) {
        if (this._center - this._intensity < 0) {
            this._intensity = this._center;
        }
        if (this._center + this._intensity > 1) {
            this._intensity = 1 - this._center;
        }
    }
}

Timeplot.FisheyeTimeGeometry.prototype.updateBSpline = function() {
	var geometry = this;
	var a = this._aperture;
	var b = this._intensity;
	var c = this._center;

    this._leftSpline = new Timeplot.FisheyeTimeGeometry.BTree(); 
	var leftSpline = function(t) {
        var tt = 1 - t;
        var ctt = c*t*t;
        var ttt = 2*tt*t;
        var x = ttt*(c-a) + ctt;
        var y = ttt*(c-b) + ctt;
        geometry._leftSpline.add(x,y);
	}

    this._rightSpline = new Timeplot.FisheyeTimeGeometry.BTree(); 
    var rightSpline = function(t) {
        var tt = 1 - t;
        var ttt = 2*t*tt;
        var tt2 = tt*tt;
        var t2 = t*t;
        var x = c*tt2 + ttt*(c + a) + t2;
        var y = c*tt2 + ttt*(c + b) + t2;
        geometry._rightSpline.add(x,y);
    }

    var process = function(f,level,begin,end) {
    	var t = begin + (end - begin) / 2;
    	f(t);
    	if (level < geometry._bsplineLevels) {
    		level++;
    		process(f,level,begin,t);
    		process(f,level,t,end);
    	}
    }
    
    process(leftSpline,0,0,1);
    process(rightSpline,0,0,1);
}

// ---------------------------------------------------------

Timeplot.FisheyeTimeGeometry.BTree = function() {
}

Timeplot.FisheyeTimeGeometry.BTree.prototype = {

	add: function(x,y) {
        var v = { x: x, y: y };
		if (this._xRoot && this._yRoot) {
			this._addX(this._xRoot, v);
			this._addY(this._yRoot, v);
		} else {
			this._xRoot = v;
            this._yRoot = v;
		}
	},
    
    _addX: function(node, v) {
        if (v.x > node.x) {
            if (node.bigger) {
                this._addX(node.bigger,v);
            } else {
                node.bigger = v;
            }
        } else if (v.x < node.x) {
            if (node.smaller) {
                this._addX(node.smaller,v);
            } else {
                node.smaller = v;
            }
        } else {
            // do nothing if the X value is already present
        }
    },

    _addY: function(node, v) {
        if (v.y > node.y) {
            if (node.bigger) {
                this._addY(node.bigger,v);
            } else {
                node.bigger = v;
            }
        } else if (v.y < node.y) {
            if (node.smaller) {
                this._addY(node.smaller,v);
            } else {
                node.smaller = v;
            }
        } else {
            // do nothing if the Y value is already present
        }
    },
    
	getY: function(x) {
		if (this._xRoot) {
            var s = { x: 0, y: 0 };
            var e = { x: 1, y: 1 };
            return this._getY(x,this._xRoot,s,e);
		} else {
			return 1;
		}
	},

    getX: function(y) {
        if (this._yRoot) {
        	var s = { x: 0, y: 0 };
        	var e = { x: 1, y: 1 };
            return this._getX(y,this._yRoot,s,e);
        } else {
            return 1;
        }
    },

    _getY: function(x,node,s,e) {
    	if (x > node.x) {
    		if (node.bigger) {
    			return this._getY(x,node.bigger,node,e);
    		} else {
    			s = node;
    		}
    	} else {
    		if (node.smaller) {
                return this._getY(x,node.smaller,s,node);
    		} else {
    			e = node;
    		}
    	}
    	var dx = e.x - s.x;
    	var dy = e.y - s.y;
    	var y = (dy / dx) * (x - s.x);
    	//log(x + " -> " + y);
    	return y;
    },
    
    _getX: function(y,node,s,e) {
        if (y > node.y) {
            if (node.bigger) {
                return this._getX(y,node.bigger,node,e);
            } else {
                s = node;
            }
        } else {
            if (node.smaller) {
                return this._getX(y,node.smaller,s,node);
            } else {
                e = node;
            }
        }
        var dx = e.x - s.x;
        var dy = e.y - s.y;
        var x = (dx / dy) * (y - s.y);
        return x;
    }
}