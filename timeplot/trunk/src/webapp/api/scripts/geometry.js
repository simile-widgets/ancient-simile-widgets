/*==================================================
 *  Default Geometry
 *==================================================*/

Timeplot.DefaultGeometry = function(params) {
    if (!params) params = {};
    this._id = ("id" in params) ? params.id : "g" + Math.round(Math.random() * 1000000);
    this._axisColor = ("axisColor" in params) ? params.axisColor : new Timeplot.Color("#606060");
    this._gridColor = ("gridColor" in params) ? params.gridColor : null;
    this._center = ("center" in params) ? params.center : 30;
    this._range = ("range" in params) ? params.range : 20;
    this._minValue = ("min" in params) ? params.min : null;
    this._maxValue = ("max" in params) ? params.max : null;
}

Timeplot.DefaultGeometry.prototype = {

    setCanvas: function(canvas) {
        this._canvas = canvas;
        var container = this._canvas.parentNode;
        this._paddingX = (container.clientWidth - this._canvas.width) / 2;
        this._paddingY = (container.clientHeight - this._canvas.height) / 2;
    },

    setRange: function(range) {
        if (range.earliestDate && (!this._earliestDate || (this._earliestDate && range.earliestDate.getTime() < this._earliestDate.getTime()))) {
            this._earliestDate = range.earliestDate;
        }
        if (range.latestDate && (!this._latestDate || (this._latestDate && range.latestDate.getTime() > this._latestDate.getTime()))) {
            this._latestDate = range.latestDate;
        }
        if (!this._minValue || (this._minValue && range.minValue < this._minValue)) {
            this._minValue = range.min;
        }
        if (!this._maxValue || (this._maxValue && range.maxValue * 1.05 > this._maxValue)) {
            this._maxValue = range.max * 1.05; // get a little more head room to avoid hitting the ceiling
        }
        if (this._minValue == 0 && this._maxValue == 0) {
        	this._gridSpacing = 0;
        } else { 
        	this._gridSpacing = this._calculateGridSpacing();
        }
    },

    _calculateGridSpacing: function() {
        var v = this._fromScreenY(this._center);
        for (var i = 1; i < 10; i++) { // 10 iterations should be enough to converge
            var r = Timeplot.Math.round(v,i);
            var y = this._toScreenY(r);
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

    toScreen: function(date, value) {
        return {
            x: this._toScreenX(date.getTime()),
            y: this._toScreenY(value)
        };
    },

    _toScreenX: function(time) {
    	if (this._latestDate) {
	        var period = this._latestDate.getTime() - this._earliestDate.getTime();
	        var elapsed = time - this._earliestDate.getTime();
	        return (this._canvas.width * elapsed) / period;
    	} else {
    		return 0;
    	} 
    },

    _toScreenY: function(value) {
    	if (this._maxValue) {
	        var range = this._maxValue - this._minValue;
	        var value = value - this._minValue;
	        return (this._canvas.height * value) / range;
    	} else {
    		return 0;
    	}
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
        var range = this._maxValue - this._minValue;
        return (range * y / this._canvas.height) + this._minValue;
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

                this.putText(value,"timeplot-grid-label",{
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
    },

    putText: function(text,clazz, styles) {
    	var div = this.putDiv("timeplot-div " + clazz, styles);
    	div.innerHTML = text;
        return div;
    },

    putDiv: function(clazz, styles) {
        var container = this._canvas.parentNode.firstChild; // get the divs container
        var doc = container.ownerDocument;
        var div = doc.createElement("div");
        div.setAttribute("class","timeplot-div " + clazz);
        this.placeDiv(div,styles);
        container.appendChild(div);
        return div;
    },
    
    placeDiv: function(div, styles) {
        if (styles) {
            for (style in styles) {
                if (style == "top") {
                    styles[style] += this._paddingY;
                } else if (style == "bottom") {
                    styles[style] += this._paddingY;
                } else if (style == "left") {
                    styles[style] += this._paddingX;
                } else if (style == "right") {
                    styles[style] += this._paddingX;
                }
                div.style[style] = styles[style];
            }
        }
    }

}
