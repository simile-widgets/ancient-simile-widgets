/*==================================================
 *  Layer
 *==================================================*/
 
Timeplot.Layer = function(timeplot, layerInfo, index) {
    this._timeplot = timeplot;
    this._layerInfo = layerInfo;
    this._index = index;
    
    this._locale = ("locale" in layerInfo) ? layerInfo.locale : SimileAjax.Platform.getDefaultLocale();
    this._timeZone = ("timeZone" in layerInfo) ? layerInfo.timeZone : 0;
    this._labeller = ("labeller" in layerInfo) ? layerInfo.labeller : timeplot.getUnit().createLabeller(this._locale, this._timeZone);
    
    var layer = this;
    this._eventSource = layerInfo.eventSource;
    if (this._eventSource) {
        this._eventListener = {
            onAddMany: function() { layer.paint(); },
            onClear:   function() { layer.paint(); }
        }
        this._eventSource.addListener(this._eventListener);
    }
};

Timeplot.Layer.prototype.dispose = function() {
    if (this._eventSource) {
        this._eventSource.removeListener(this._eventListener);
        this._eventListener = null;
        this._eventSource = null;
    }
};

Timeplot.Layer.prototype.paint = function() {
	
	var canvas = this._timeplot.getCanvas();
    var geometry = this._layerInfo.geometry;

    geometry.setWidth(canvas.width);
    geometry.setHeight(canvas.height);

    var source = this._eventSource;
    geometry.setEarliestDate(source.getEarliestDate());
    geometry.setLatestDate(source.getLatestDate());
    var stats = source.getStats(this._layerInfo.column - 1);
    geometry.setMinValue(stats.min);
    geometry.setMaxValue(stats.max);

    var ctx = canvas.getContext('2d');
    
    ctx.save();
    
    if (this._layerInfo.fillColor) {
		var lineargradient = ctx.createLinearGradient(0,canvas.height,0,0);
		lineargradient.addColorStop(0,this._layerInfo.fillColor.toString());
        lineargradient.addColorStop(0.5,this._layerInfo.fillColor.toString());
		lineargradient.addColorStop(1,"white");

        ctx.fillStyle = lineargradient;
        
        ctx.beginPath();
        this.plot(geometry,function(p) {
            ctx.lineTo(p.x,p.y);
        });
        ctx.lineTo(canvas.width, 0);
        ctx.fill();
    }
            
    ctx.strokeStyle = this._layerInfo.lineColor.toString();
    ctx.lineWidth = 1;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    this.plot(geometry,function(p) {
        ctx.lineTo(p.x,p.y);
    });
    ctx.stroke();
    
    ctx.restore();
}

Timeplot.Layer.prototype.plot = function(geometry,f) {
    var data = this._eventSource.getEvents();
    var D = data.length();
    for (var i = 0; i < D; i++) {
        var event = data.elementAt(i);
        var value = event.getValues()[this._layerInfo.column - 1];
        var p = geometry.locate(event.getStart(), value);
        f(p);
    }
}
