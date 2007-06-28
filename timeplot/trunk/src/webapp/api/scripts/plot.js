/*==================================================
 *  Layer
 *==================================================*/
 
Timeplot.Plot = function(timeplot, plotInfo) {
    this._canvas = timeplot.getCanvas();
    this._plotInfo = plotInfo;
    this._id = plotInfo.id;
    this._geometry = plotInfo.geometry;
    this._geometry.setCanvas(this._canvas);
    this._dataSource = plotInfo.dataSource;
    this._locale = ("locale" in plotInfo) ? plotInfo.locale : SimileAjax.Platform.getDefaultLocale();
    this._timeZone = ("timeZone" in plotInfo) ? plotInfo.timeZone : 0;
    this._labeller = ("labeller" in plotInfo) ? plotInfo.labeller : timeplot.getUnit().createLabeller(this._locale, this._timeZone);
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

    getDataSource: function() {
        return this._dataSource;
    },

    getGeometry: function() {
    	return this._geometry;
    },
    
    paint: function() {
	    var ctx = this._canvas.getContext('2d');
	    
	    if (this._plotInfo.fillColor) {
			var lineargradient = ctx.createLinearGradient(0,this._canvas.height,0,0);
			lineargradient.addColorStop(0,this._plotInfo.fillColor.toString());
	        lineargradient.addColorStop(0.5,this._plotInfo.fillColor.toString());
			lineargradient.addColorStop(1,"white");
	
	        ctx.fillStyle = lineargradient;
	        
	        ctx.beginPath();
	        this._plot(function(p) {
               ctx.lineTo(p.x,p.y);
	        });
	        ctx.lineTo(this._canvas.width, 0);
	        ctx.fill();
	    }
	            
	    ctx.strokeStyle = this._plotInfo.lineColor.toString();
	    ctx.lineWidth = 1;
	    ctx.lineJoin = 'miter';
	    ctx.beginPath();
	    this._plot(function(p) {
           ctx.lineTo(p.x,p.y);
	    });
	    ctx.stroke();
    },

    _plot: function(f) {
		var data = this._dataSource.getData();
		var times = data.times;
		var values = data.values;
	    var T = times.length;
	    for (var t = 0; t < T; t++) {
    		f(this._geometry.toScreen(times[t], values[t]));
	    }
    }
}
