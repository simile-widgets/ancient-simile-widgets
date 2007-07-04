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
    this._showValues = plotInfo.showValues;
    this._theme = new Timeline.getDefaultTheme();
    this._dataSource = plotInfo.dataSource;
    this._eventSource = plotInfo.eventSource;
    this._bubble = null;
};

Timeplot.Plot.prototype = {
    
    initialize: function() {
	    if (this._showValues && this._dataSource && this._dataSource.getValue) {
	        this._valueFlag = this._geometry.putDiv("timeplot-valueflag");
	        this._valueFlagPole = this._geometry.putDiv("timeplot-valueflag-pole");
	        var plot = this;
            var mouseOverHandler = function(elmt, evt, target) {
                plot._valueFlag.style.display = "block";
                mouseMoveHandler(elmt, evt, target);
            }
	        var mouseMoveHandler = function(elmt, evt, target) {
	            var coords = SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);
	            var t = plot._geometry._fromScreenX(coords.x);
	            var v = plot._dataSource.getValue(t);
	            if (v > 0) v = Math.round(v);
	            plot._valueFlag.innerHTML = new String(v);
                var y = plot._geometry._toScreenY(v);
	            plot._geometry.placeDiv(plot._valueFlag,{
	                left: coords.x,
	                bottom: y,
	                display: "block"
	            });
	            plot._geometry.placeDiv(plot._valueFlagPole, {
	            	left: coords.x,
	            	bottom: 0,
	            	height: y,
	            	display: "block"
	            });
	        };
	        
            SimileAjax.DOM.registerEvent(this._canvas, "mouseover", mouseOverHandler);
            SimileAjax.DOM.registerEvent(this._canvas, "mousemove", mouseMoveHandler);
	    }
    },
    
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
	                try {
	                    ctx.lineTo(p.x,p.y);
	                } catch (e) {
	                    log(p + ": " + e);
	                }
                });
                ctx.lineTo(this._canvas.width, 0);
                ctx.fill();
            }
                    
            ctx.beginPath();
            this._plot(function(p) {
            	try {
                    ctx.lineTo(p.x,p.y);
            	} catch (e) {
                    log(p + ": " + e);
            	}
            });
            ctx.stroke();
        }

        if (this._eventSource) {
            var gradient = ctx.createLinearGradient(0,0,0,this._canvas.height);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.strokeStyle = gradient;
            ctx.fillStyle = gradient; 
            ctx.lineWidth = this._plotInfo.eventLineWidth;
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
                    left: Math.round(start - 3),
                    width: Math.round(end - start + 3),
                    top: 0,
                    height: this._canvas.height
                });

                var plot = this;
                var clickHandler = function(event) { 
                    return function(elmt, evt, target) { 
                        var doc = plot._timeplot.getDocument();
                    	plot._closeBubble();
                    	var coords = SimileAjax.DOM.getEventPageCoordinates(evt);
                        var width = plot._theme.event.bubble.width;
                        var height = plot._theme.event.bubble.height;
                        plot._bubble = SimileAjax.Graphics.createBubbleForPoint(coords.x, coords.y, width, height);
                        event.fillInfoBubble(plot._bubble.content, plot._theme, plot._labeller);
                    }
                };
                var mouseOverHandler = function(elmt, evt, target) {
                	elmt.oldClass = elmt.className;
                    elmt.className = elmt.className + " timeplot-event-box-highlight";
                };
                var mouseOutHandler = function(elmt, evt, target) {
                    elmt.className = elmt.oldClass;
                    elmt.oldClass = null;
                }
                
                SimileAjax.DOM.registerEvent(div, "click", clickHandler(event));
                SimileAjax.DOM.registerEvent(div, "mouseover", mouseOverHandler);
                SimileAjax.DOM.registerEvent(div, "mouseout", mouseOutHandler);
            }
        }
    },

    _plot: function(f) {
        var data = this._dataSource.getData();
        if (data) {
	        var times = data.times;
	        var values = data.values;
	        var T = times.length;
	        for (var t = 0; t < T; t++) {
	            f(this._geometry.toScreen(times[t], values[t]));
	        }
        }
    },
    
    _closeBubble: function() {
        if (this._bubble != null) {
            this._bubble.close();
            this._bubble = null;
        }
    }

}