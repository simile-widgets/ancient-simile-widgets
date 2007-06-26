/*==================================================
 *  Layer
 *==================================================*/
 
Timeplot.Plot = function(timeplot, plotInfo, index) {
    this._timeplot = timeplot;
    this._plotInfo = plotInfo;
    this._index = index;
    
    this._locale = ("locale" in plotInfo) ? plotInfo.locale : SimileAjax.Platform.getDefaultLocale();
    this._timeZone = ("timeZone" in plotInfo) ? plotInfo.timeZone : 0;
    this._labeller = ("labeller" in plotInfo) ? plotInfo.labeller : timeplot.getUnit().createLabeller(this._locale, this._timeZone);
    
    var plot = this;
    this._dataSource = plotInfo.dataSource;
    if (this._dataSource) {
        this._paintingListener = {
            onAddMany: function() { plot.paint(); },
            onClear:   function() { plot.paint(); }
        }
        this._dataSource.addListener(this._paintingListener);
    }
};

Timeplot.Plot.prototype = {
	
	dispose: function() {
	    if (this._dataSource) {
	        this._dataSource.removeListener(this._paintingListener);
	        this._paintingListener = null;
	        this._dataSource.dispose();
	        this._dataSource = null;
	    }
	},

    paint: function() {
		var canvas = this._timeplot.getCanvas();
        var source = this._dataSource;

	    var geometry = this._plotInfo.geometry;
	    geometry.setSize(canvas);
	    geometry.setRange(source.getRange());
	
	    var ctx = canvas.getContext('2d');
	    
	    ctx.save();
	    
	    if (this._plotInfo.fillColor) {
			var lineargradient = ctx.createLinearGradient(0,canvas.height,0,0);
			lineargradient.addColorStop(0,this._plotInfo.fillColor.toString());
	        lineargradient.addColorStop(0.5,this._plotInfo.fillColor.toString());
			lineargradient.addColorStop(1,"white");
	
	        ctx.fillStyle = lineargradient;
	        
	        ctx.beginPath();
	        this._plot(geometry,function(p) {
               ctx.lineTo(p.x,p.y);
	        });
	        ctx.lineTo(canvas.width, 0);
	        ctx.fill();
	    }
	            
	    ctx.strokeStyle = this._plotInfo.lineColor.toString();
	    ctx.lineWidth = 1;
	    ctx.lineJoin = 'miter';
	    ctx.beginPath();
	    this._plot(geometry,function(p) {
           ctx.lineTo(p.x,p.y);
	    });
	    ctx.stroke();
	    
	    ctx.restore();
    },

    _plot: function(geometry,f) {
		var data = this._dataSource.getData();
		var times = data.times;
		var values = data.values;
	    var T = times.length;
	    for (var t = 0; t < T; t++) {
    		f(geometry.locate(times[t], values[t]));
	    }
    }
}
