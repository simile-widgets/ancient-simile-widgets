/*==================================================
 *  Layer
 *==================================================*/
 
Timeplot.Plot = function(timeplot, plotInfo) {
	this._timeplot = timeplot;
    this._canvas = timeplot.getCanvas();
    this._plotInfo = plotInfo;
    this._id = plotInfo.id;
    this._timeGeometry = plotInfo.timeGeometry;
    this._timeGeometry.initialize(timeplot);
    this._valueGeometry = plotInfo.valueGeometry;
    this._valueGeometry.initialize(timeplot);
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
            this._timeFlag = this._timeplot.putDiv("timeflag","timeplot-timeflag");
	        this._valueFlag = this._timeplot.putDiv(this._id + "valueflag","timeplot-valueflag");
	        this._valueFlagLineLeft = this._timeplot.putDiv(this._id + "valueflagLineLeft","timeplot-valueflag-line");
            this._valueFlagLineRight = this._timeplot.putDiv(this._id + "valueflagLineRight","timeplot-valueflag-line");
            if (!this._valueFlagLineLeft.firstChild) {
            	this._valueFlagLineLeft.appendChild(SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix + "images/line_left.png"));
                this._valueFlagLineRight.appendChild(SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix + "images/line_right.png"));
            }
	        this._valueFlagPole = this._timeplot.putDiv(this._id + "valuepole","timeplot-valueflag-pole");

            var opacity = this._plotInfo.valuesOpacity;
            
            SimileAjax.Graphics.setOpacity(this._timeFlag, opacity);
            SimileAjax.Graphics.setOpacity(this._valueFlag, opacity);
            SimileAjax.Graphics.setOpacity(this._valueFlagLineLeft, opacity);
            SimileAjax.Graphics.setOpacity(this._valueFlagLineRight, opacity);
            SimileAjax.Graphics.setOpacity(this._valueFlagPole, opacity);

            var plot = this;
            
		    var mouseOverHandler = function(elmt, evt, target) {
		        plot._valueFlag.style.display = "block";
		        mouseMoveHandler(elmt, evt, target);
		    }
		
		    var day = 24 * 60 * 60 * 1000;
		    var month = 30 * day;
		    
		    var mouseMoveHandler = function(elmt, evt, target) {
		    	if (typeof SimileAjax != "undefined") {
                    var c = plot._canvas;
			        var x = Math.round(SimileAjax.DOM.getEventRelativeCoordinates(evt,plot._canvas).x);
			        if (x > c.width) x = c.width;
			        if (isNaN(x) || x < 0) x = 0;
			        var t = plot._timeGeometry.fromScreen(x);
			        var v = plot._dataSource.getValue(t);
			        if (plot._plotInfo.roundValues) v = Math.round(v);
			        plot._valueFlag.innerHTML = new String(v);
			        var d = new Date(t);
			        var p = plot._timeGeometry.getPeriod(); 
			        if (p < day) {
			            plot._timeFlag.innerHTML = d.toLocaleTimeString();
			        } else if (p > month) {
                        plot._timeFlag.innerHTML = d.toLocaleDateString();
			        } else {
                        plot._timeFlag.innerHTML = d.toLocaleString();
			        }
			        
			        var tw = plot._timeFlag.clientWidth;
                    var th = plot._timeFlag.clientHeight;
                    var tdw = Math.round(tw / 2);
                    var vw = plot._valueFlag.clientWidth;
                    var vh = plot._valueFlag.clientHeight;
			        var y = plot._valueGeometry.toScreen(v);

                    if (x + tdw > c.width) {
                        var tx = c.width - tdw;
                    } else if (x - tdw < 0) {
                        var tx = tdw;
                    } else {
                    	var tx = x;
                    }

			        if (plot._timeGeometry._timeValuePosition == "top") {
                        plot._timeplot.placeDiv(plot._valueFlagPole, {
                            left: x,
                            top: th - 5,
                            height: c.height - y - th + 6,
                            display: "block"
                        });
				        plot._timeplot.placeDiv(plot._timeFlag,{
				            left: tx - tdw,
				            top: -6,
				            display: "block"
				        });
			        } else {
                        plot._timeplot.placeDiv(plot._valueFlagPole, {
                            left: x,
                            bottom: th - 5,
                            height: y - th + 6,
                            display: "block"
                        });
                        plot._timeplot.placeDiv(plot._timeFlag,{
                            left: tx - tdw,
                            bottom: -6,
                            display: "block"
                        });
			        }
			        
			        if (x + vw + 14 > c.width && y + vh + 4 > c.height) {
                        plot._valueFlagLineLeft.style.display = "none";
	                    plot._timeplot.placeDiv(plot._valueFlagLineRight,{
	                        left: x - 14,
	                        bottom: y - 14,
	                        display: "block"
	                    });
	                    plot._timeplot.placeDiv(plot._valueFlag,{
	                        left: x - vw - 13,
	                        bottom: y - vh - 13,
	                        display: "block"
	                    });
			        } else if (x + vw + 14 > c.width && y + vh + 4 < c.height) {
                        plot._valueFlagLineRight.style.display = "none";
                        plot._timeplot.placeDiv(plot._valueFlagLineLeft,{
                            left: x - 14,
                            bottom: y,
                            display: "block"
                        });
                        plot._timeplot.placeDiv(plot._valueFlag,{
                            left: x - vw - 13,
                            bottom: y + 13,
                            display: "block"
                        });
                    } else if (x + vw + 14 < c.width && y + vh + 4 > c.height) {
                        plot._valueFlagLineRight.style.display = "none";
                        plot._timeplot.placeDiv(plot._valueFlagLineLeft,{
                            left: x,
                            bottom: y - 13,
                            display: "block"
                        });
                        plot._timeplot.placeDiv(plot._valueFlag,{
                            left: x + 13,
                            bottom: y - 13,
                            display: "block"
                        });
			        } else {
                        plot._valueFlagLineLeft.style.display = "none";
                        plot._timeplot.placeDiv(plot._valueFlagLineRight,{
                            left: x,
                            bottom: y,
                            display: "block"
                        });
                        plot._timeplot.placeDiv(plot._valueFlag,{
                            left: x + 13,
                            bottom: y + 13,
                            display: "block"
                        });
			        }
		    	}
		    }

            var timeplotElement = this._timeplot.getElement();
            SimileAjax.DOM.registerEvent(timeplotElement, "mouseover", mouseOverHandler);
            SimileAjax.DOM.registerEvent(timeplotElement, "mousemove", mouseMoveHandler);
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

    getTimeGeometry: function() {
        return this._timeGeometry;
    },

    getValueGeometry: function() {
        return this._valueGeometry;
    },

    paint: function() {
        var ctx = this._canvas.getContext('2d');

        ctx.lineWidth = this._plotInfo.lineWidth;
        ctx.lineJoin = 'miter';

        if (this._dataSource) {     
            if (this._plotInfo.fillColor) {
                var gradient = ctx.createLinearGradient(0,this._canvas.height,0,0);
                gradient.addColorStop(0,this._plotInfo.fillColor.toString());
                gradient.addColorStop(0.5,this._plotInfo.fillColor.toString());
                gradient.addColorStop(1, 'rgba(255,255,255,0)');

                ctx.fillStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(0,0);
	            this._plot(function(x,y) {
                    ctx.lineTo(x,y);
	            });
                ctx.lineTo(this._canvas.width, 0);
                ctx.fill();
            }
                    
            if (this._plotInfo.lineColor) {
                ctx.strokeStyle = this._plotInfo.lineColor.toString();
	            ctx.beginPath();
	            this._plot(function(x,y) {
	                ctx.lineTo(x,y);
	            });
	            ctx.stroke();
            }

            if (this._plotInfo.dotColor) {
                ctx.fillStyle = this._plotInfo.dotColor.toString();
                var r = this._plotInfo.dotRadius;
                this._plot(function(x,y) {
                    ctx.beginPath();
                    ctx.arc(x,y,r,0,2*Math.PI,true);
                    ctx.fill();
                });
            }
        }

        if (this._eventSource) {
            var gradient = ctx.createLinearGradient(0,0,0,this._canvas.height);
            gradient.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.strokeStyle = gradient;
            ctx.fillStyle = gradient; 
            ctx.lineWidth = this._plotInfo.eventLineWidth;
            ctx.lineJoin = 'miter';
            
            var i = this._eventSource.getAllEventIterator();
            while (i.hasNext()) {
                var event = i.next();
                var color = event.getColor();
                color = (color) ? new Timeplot.Color(color) : this._plotInfo.lineColor;
                var eventStart = event.getStart().getTime();
                var eventEnd = event.getEnd().getTime();
                if (eventStart == eventEnd) {
                    var c = color.toString();
                    gradient.addColorStop(0, c);
                    var start = this._timeGeometry.toScreen(eventStart);
                    var end = start;
                    ctx.beginPath();
                    ctx.moveTo(start,0);
                    ctx.lineTo(start,this._canvas.height);
                    ctx.stroke();
                    var x = start - 4;
                    var w = 7;
                } else {
                	var c = color.toString(0.5);
                    gradient.addColorStop(0, c);
                    var start = this._timeGeometry.toScreen(eventStart);
                    var end = this._timeGeometry.toScreen(eventEnd);
                    ctx.fillRect(start,0,end - start, this._canvas.height);
                    var x = start;
                    var w = end - start - 1;
                }

                var div = this._timeplot.putDiv(event.getID(),"timeplot-event-box",{
                    left: Math.round(x),
                    width: Math.round(w),
                    top: 0,
                    height: this._canvas.height - 1
                });

                var plot = this;
                var clickHandler = function(event) { 
                    return function(elmt, evt, target) { 
                        var doc = plot._timeplot.getDocument();
                    	plot._closeBubble();
                    	var coords = SimileAjax.DOM.getEventPageCoordinates(evt);
                    	var elmtCoords = SimileAjax.DOM.getPageCoordinates(elmt);
                        plot._bubble = SimileAjax.Graphics.createBubbleForPoint(coords.x, elmtCoords.top + plot._canvas.height, plot._plotInfo.bubbleWidth, plot._plotInfo.bubbleHeight, "bottom");
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
                
                if (!div.instrumented) {
	                SimileAjax.DOM.registerEvent(div, "click"    , clickHandler(event));
	                SimileAjax.DOM.registerEvent(div, "mouseover", mouseOverHandler);
	                SimileAjax.DOM.registerEvent(div, "mouseout" , mouseOutHandler);
		            div.instrumented = true;
                }
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
	            f(this._timeGeometry.toScreen(times[t]),this._valueGeometry.toScreen(values[t]));
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