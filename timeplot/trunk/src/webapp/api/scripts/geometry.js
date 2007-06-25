/*==================================================
 *  Default Geometry
 *==================================================*/

Timeplot.DefaultGeometry = function() {
}

Timeplot.DefaultGeometry.prototype = {
	
	setFloor: function(value) {
	    this._floor = value;
	},

	setSize: function(canvas) {
		this._width = canvas.width;
		this._height = canvas.height;
	},

    setRange: function(range) {
		if (!this._earliestDate || range.earliestDate.milliseconds < this._earliestDate.milliseconds) {
		    this._earliestDate = range.earliestDate;
		}
	    if (!this._latestDate || range.latestDate.milliseconds > this._latestDate.milliseconds) {
	        this._latestDate = range.latestDate;
	    }
	    this._minValue = range.min;
	    if (!this._floor) {
	    	this._floor = this._minValue;
	    } 
        this._maxValue = range.max;
    },
    
    locate: function(date, value) {
        var p = {};
        
        var period = this._latestDate.getTime() - this._earliestDate.getTime();
        var elapsed = date.getTime() - this._earliestDate.getTime();
        p.x = (this._width * elapsed) / period; 
        
        var range = this._maxValue - this._floor;
        var value = value - this._floor;
        p.y = (this._height * value) / range;
        
        return p;   
    }
}
