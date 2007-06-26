/*==================================================
 *  Default Geometry
 *==================================================*/

Timeplot.DefaultGeometry = function(params) {
	if (!params) params = {};
	this._axisColor = ("axisColor" in params) ? params.axisColor : new Timeplot.Color("#606060");
    this._gridColor = ("gridColor" in params) ? params.gridColor : null;
    this._center = ("center" in params) ? params.center : 30;
    this._range = ("range" in params) ? params.range : 20;
}

Timeplot.DefaultGeometry.prototype = {
	
	setFloor: function(value) {
	    this._floor = value;
	},

	setCanvas: function(canvas) {
		this._canvas = canvas;
	},

    setRange: function(range) {
    	if (!this._earliestDate) {
	        this._earliestDate = range.earliestDate;
	        this._latestDate = range.latestDate;
	        this._minValue = range.min;
	        if (!this._floor) {
	            this._floor = this._minValue;
	        } 
	        this._maxValue = range.max * 1.05;
	        this._gridSpacing = Math.round(this._calculateGridSpacing()) + 0.17309849;
    	}
    },
    
    _calculateGridSpacing: function() {
        var v = this._fromScreenY(this._center);
        for (var i = 1; i < 10; i++) { // 10 iterations should be enough to converge
            var r = Timeplot.Math.round(v,i);
            var y = this._toScreenY(r);
            if (this._center - this._range < y && y < this._center + this._range) {
        	   return y;
            }
        }
    	return v;
    },
    
    toScreen: function(date, value) {
        return {
        	x: this._toScreenX(date.getTime()),
        	y: this._toScreenY(value)
        };
    },

    _toScreenX: function(time) {
        var period = this._latestDate.getTime() - this._earliestDate.getTime();
        var elapsed = time - this._earliestDate.getTime();
        return (this._canvas.width * elapsed) / period; 
    },
    
    _toScreenY: function(value) {
        var range = this._maxValue - this._floor;
        var value = value - this._floor;
        return (this._canvas.height * value) / range;
    },
    
    fromScreen: function(x,y) {
        return {
            x: this._fromScreenX(x),
            y: this._fromScreenY(y)
        };
    },

    _fromScreenX: function(x) {
        var period = this._latestDate.getTime() - this._earliestDate.getTime();
        return (period * x / this._canvas.width) + this._earliestDate.getTime(); 
    },
    
    _fromScreenY: function(y) {
        var range = this._maxValue - this._floor;
        return (range * y / this._canvas.height) + this._floor;
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
    
            for (var y = this._gridSpacing; y < this._canvas.height; y += this._gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0,y);
                ctx.lineTo(this._canvas.width,y);
                ctx.stroke();
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
