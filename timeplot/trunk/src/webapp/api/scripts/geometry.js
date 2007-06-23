/*==================================================
 *  Default Geometry
 *==================================================*/

Timeplot.DefaultGeometry = function() {
}

Timeplot.DefaultGeometry.prototype.locate = function(date, value) {
    var p = {};
    
    var period = this._latestDate.getTime() - this._earliestDate.getTime();
    var elapsed = date.getTime() - this._earliestDate.getTime();
    p.x = (this._width * elapsed) / period; 

    var range = this._maxValue - this._floor;
    var value = value - this._floor;
    p.y = (this._height * value) / range;
    
    return p;	
}

Timeplot.DefaultGeometry.prototype.setWidth = function(value) {
	this._width = value;
}

Timeplot.DefaultGeometry.prototype.setHeight = function(value) {
    this._height = value;
}

Timeplot.DefaultGeometry.prototype.setEarliestDate = function(value) {
	if (!this._earliestDate || value.milliseconds < this._earliestDate.milliseconds) {
	    this._earliestDate = value;
	}
}

Timeplot.DefaultGeometry.prototype.setLatestDate = function(value) {
    if (!this._latestDate || value.milliseconds > this._latestDate.milliseconds) {
        this._latestDate = value;
    }
}

Timeplot.DefaultGeometry.prototype.setFloor = function(value) {
    this._floor = value;
}

Timeplot.DefaultGeometry.prototype.setMinValue = function(value) {
    this._minValue = value;
    if (!this._floor) {
    	this._floor = this._minValue;
    } 
}

Timeplot.DefaultGeometry.prototype.setMaxValue = function(value) {
    this._maxValue = value;
}
