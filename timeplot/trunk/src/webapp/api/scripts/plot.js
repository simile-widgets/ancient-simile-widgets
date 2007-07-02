/*==================================================
 *  Layer
 *==================================================*/
 
Timeplot.Plot = function(timeplot, plotInfo) {
	this._timeplot = timeplot;
    this._canvas = timeplot.getCanvas();
    this._plotInfo = plotInfo;
    this._id = plotInfo.id;
    this._geometry = plotInfo.geometry;
    this._geometry.setCanvas(this._canvas);
    this._locale = ("locale" in plotInfo) ? plotInfo.locale : SimileAjax.Platform.getDefaultLocale();
    this._timeZone = ("timeZone" in plotInfo) ? plotInfo.timeZone : 0;
    this._labeller = ("labeller" in plotInfo) ? plotInfo.labeller : timeplot.getUnit().createLabeller(this._locale, this._timeZone);
    this._theme = new Timeline.getDefaultTheme();
    this._dataSource = plotInfo.dataSource;
    this._eventSource = plotInfo.eventSource;
    this._bubble = null;
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
        return (this._dataSource) ? this._dataSource : this._eventSource;
    },

    getGeometry: function() {
        return this._geometry;
    },

    paint: function() {
        var ctx = this._canvas.getContext('2d');

        ctx.strokeStyle = this._plotInfo.lineColor.toString();
        ctx.lineWidth = 1;
        ctx.lineJoin = 'miter';

        if (this._dataSource) {     
            if (this._plotInfo.fillColor) {
                var gradient = ctx.createLinearGradient(0,this._canvas.height,0,0);
                gradient.addColorStop(0,this._plotInfo.fillColor.toString());
                gradient.addColorStop(0.5,this._plotInfo.fillColor.toString());
                gradient.addColorStop(1, 'rgba(255,255,255,0)');

                ctx.fillStyle = gradient;

                ctx.beginPath();
                this._plot(function(p) {
                   ctx.lineTo(p.x,p.y);
                });
                ctx.lineTo(this._canvas.width, 0);
                ctx.fill();
            }
                    
            ctx.beginPath();
            this._plot(function(p) {
                ctx.lineTo(p.x,p.y);
            });
            ctx.stroke();
        }

        if (this._eventSource) {
            var gradient = ctx.createLinearGradient(0,0,0,this._canvas.height);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.strokeStyle = gradient;
            ctx.fillStyle = gradient; 
            ctx.lineWidth = 1.2;
            ctx.lineJoin = 'miter';
            
            var i = this._eventSource.getAllEventIterator();
            while (i.hasNext()) {
                var event = i.next();
                var color = event.getColor();
                color = (color) ? new Timeplot.Color(color) : this._plotInfo.lineColor;
                gradient.addColorStop(0, (color) ? color : this._plotInfo.lineColor.toString());
	            if (event.isInstant) {
                    var start = this._geometry._toScreenX(event.getStart());
                    var end = start;
                    ctx.beginPath();
                    ctx.moveTo(start,0);
                    ctx.lineTo(start,this._canvas.height);
                    ctx.stroke();
                } else {
                    var start = this._geometry._toScreenX(event.getStart());
                    var end = this._geometry._toScreenX(event.getEnd());
                    ctx.fillRect(start,0,end - start, this._canvas.height);
                }

                var div = this._geometry.putDiv("timeplot-event-box",{
                    left: Math.round(start - 2),
                    width: Math.round(end - start + 4),
                    top: 0,
                    height: this._canvas.height
                });

                var plot = this;
                var handler = function(event) { 
                    return function(elmt, evt, target) { 
                        var doc = plot._timeplot.getDocument();
                    	plot._closeBubble();
                        var x = evt.pageX;
                        var y = evt.pageY;
                        var width = plot._theme.event.bubble.width;
                        var height = plot._theme.event.bubble.height;
                        plot._bubble = SimileAjax.Graphics.createBubbleForPoint(x, y, width, height);
                        event.fillInfoBubble(plot._bubble.content, plot._theme, plot._labeller);
                    }
                };
                
                SimileAjax.DOM.registerEvent(div, "click", handler(event));
            }
        }
    },

    _plot: function(f) {
        var data = this._dataSource.getData();
        var times = data.times;
        var values = data.values;
        var T = times.length;
        for (var t = 0; t < T; t++) {
            f(this._geometry.toScreen(times[t], values[t]));
        }
    },
    
    _closeBubble: function() {
        if (this._bubble != null) {
            this._bubble.close();
            this._bubble = null;
        }
    }

}