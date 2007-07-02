/*==================================================
 *  Timeplot
 *==================================================
 */

Timeline.Debug = SimileAjax.Debug; // timeline uses it's own debug system which is not as advanced
log = SimileAjax.Debug.log; // shorter name is more usable

// ---------------------------------------------

Timeplot.create = function(elmt, plotInfos) {
    return new Timeplot._Impl(elmt, plotInfos);
};

Timeplot.createPlotInfo = function(params) {
    return {   
        id:             ("id" in params) ? params.id : "p" + Math.round(Math.random() * 1000000),
        dataSource:     ("dataSource" in params) ? params.dataSource : null,
        eventSource:    ("eventSource" in params) ? params.eventSource : null,
        geometry:       ("geometry" in params) ? params.geometry : new Timeplot.DefaultGeometry(),
        timeZone:       ("timeZone" in params) ? params.timeZone : 0,
        fillColor:      ("fillColor" in params) ? params.fillColor : null,
        lineColor:      ("lineColor" in params) ? params.lineColor : new Timeplot.Color("#606060")
    };
};

// -------------------------------------------------------

Timeplot._Impl = function(elmt, plotInfos, unit) {
    this._containerDiv = elmt;
    this._plotInfos = plotInfos;
    this._painters = {
        background: [],
        foreground: []
    };
    this._painter = null;
    this._unit = (unit != null) ? unit : Timeline.NativeDateUnit;
    this._initialize();
};

Timeplot._Impl.prototype = {

    dispose: function() {
        for (var i = 0; i < this._plots.length; i++) {
            this._plots[i].dispose();
        }
        this._plots = null;
        this._plotsInfos = null;
        this._containerDiv.innerHTML = "";
    },

    getDocument: function() {
        return this._containerDiv.ownerDocument;
    },

    add: function(div) {
        this._containerDiv.appendChild(div);
    },

    remove: function(div) {
        this._containerDiv.removeChild(div);
    },

    addPainter: function(layerName, painter) {
        var layer = this._painters[layerName];
        if (layer) {
            for (var i = 0; i < layer.length; i++) {
                if (layer[i].context._id == painter.context._id) {
                    return;
                }
            }
            layer.push(painter);
        }
    },
    
    removePainter: function(layerName, painter) {
        var layer = this._painters[layerName];
        if (layer) {
            for (var i = 0; i < layer.length; i++) {
                if (layer[i].context._id == painter.context._id) {
                    layer.splice(i, 1);
                    break;
                }
            }
        }
    },
    
    getPixelWidth: function() {
        var w = window.getComputedStyle(this._containerDiv, null).getPropertyValue("width");
        w = parseInt(w.replace("px",""));
        return w;
    },

    getPixelHeight: function() {
        var h = window.getComputedStyle(this._containerDiv, null).getPropertyValue("height");
        h = parseInt(h.replace("px",""));
        return h;    
    },

    getUnit: function() {
        return this._unit;
    },
    
    getCanvas: function() {
        return this._canvas;
    },
    
    loadText: function(url, separator, eventSource, filter) {
        var tp = this;
        
        var fError = function(statusText, status, xmlhttp) {
            alert("Failed to load data xml from " + url + "\n" + statusText);
            tp.hideLoadingMessage();
        };
        
        var fDone = function(xmlhttp) {
            try {
                eventSource.loadText(xmlhttp.responseText, separator, url, filter);
            } catch (e) {
                SimileAjax.Debug.exception(e);
            } finally {
                tp.hideLoadingMessage();
            }
        };
        
        this.showLoadingMessage();
        window.setTimeout(function() { SimileAjax.XmlHttp.get(url, fError, fDone); }, 0);
    },

    loadXML: function(url, eventSource) {
        var tl = this;
        
        var fError = function(statusText, status, xmlhttp) {
            alert("Failed to load data xml from " + url + "\n" + statusText);
            tl.hideLoadingMessage();
        };
        
        var fDone = function(xmlhttp) {
            try {
                var xml = xmlhttp.responseXML;
                if (!xml.documentElement && xmlhttp.responseStream) {
                    xml.load(xmlhttp.responseStream);
                } 
                eventSource.loadXML(xml, url);
            } finally {
                tl.hideLoadingMessage();
            }
        };
        
        this.showLoadingMessage();
        window.setTimeout(function() { SimileAjax.XmlHttp.get(url, fError, fDone); }, 0);
    },
    
    update: function() {
        for (var i = 0; i < this._plots.length; i++) {
            var plot = this._plots[i];
            var dataSource = plot.getDataSource();
            if (dataSource) {
                var range = dataSource.getRange();
                if (range) plot._geometry.setRange(range);
            }
        }
        this._paint();
    },
    
    resize: function() {
        this._prepareCanvas();
        this._paint();
    },
    
    _paint: function() {
        if (this._painter == null) {
            var timeplot = this;
            this._painter = window.setTimeout(function() {
                timeplot._painter = null;
                var background = timeplot._painters.background;
                for (var i = 0; i < background.length; i++) {
                    try {
                        background[i].action.apply(background[i].context,[]);
                    } catch (e) {
                        SimileAjax.Debug.exception(e);
                    }
                }
                var foreground = timeplot._painters.foreground;
                for (var i = 0; i < foreground.length; i++) {
                    try {
                        foreground[i].action.apply(foreground[i].context,[]);
                    } catch (e) {
                        SimileAjax.Debug.exception(e);
                    }
                }
            }, 10);
        }
    },

    _prepareCanvas: function() {
        var canvas = this.getCanvas();
    
        canvas.width = this.getPixelWidth();
        canvas.height = this.getPixelHeight();
    
        var ctx = canvas.getContext('2d');
        ctx.translate(0,canvas.height);
        ctx.scale(1,-1);
        ctx.globalCompositeOperation = 'source-over';
    },
    
    _initialize: function() {
    	// initialize the window manager (used to handle the popups)
    	// NOTE: this is a singleton and it's safe to call multiple times
    	SimileAjax.WindowManager.initialize(); 
    	
        var containerDiv = this._containerDiv;
        var doc = containerDiv.ownerDocument;
    
        // make sure the timeplot div has the right class    
        containerDiv.className = "timeplot-container " + containerDiv.className;
            
        // clean it up if it contains some content
        while (containerDiv.firstChild) {
            containerDiv.removeChild(containerDiv.firstChild);
        }
        
        // this is where we'll place the labels
        var labels = doc.createElement("div");
        containerDiv.appendChild(labels);
        
        var canvas = doc.createElement("canvas");
        
        if (canvas.getContext) {
            this._canvas = canvas;
            canvas.className = "timeplot-canvas";
            this._prepareCanvas();
            containerDiv.appendChild(canvas);
    
            // inserting copyright and link to simile
            var elmtCopyright = SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix + "images/copyright.png");
            elmtCopyright.className = "timeplot-copyright";
            elmtCopyright.title = "Timeplot (c) SIMILE - http://simile.mit.edu/timeplot/";
            SimileAjax.DOM.registerEvent(elmtCopyright, "click", function() { window.location = "http://simile.mit.edu/timeplot/"; });
            containerDiv.appendChild(elmtCopyright);
            
            var timeplot = this;
            var painter = {
                onAddMany: function() { timeplot.update(); },
                onClear:   function() { timeplot.update(); }
            }

            // creating painters
            this._plots = [];
            if (this._plotInfos) {
                for (var i = 0; i < this._plotInfos.length; i++) {
                    var plot = new Timeplot.Plot(this, this._plotInfos[i]);
                    var dataSource = plot.getDataSource();
                    if (dataSource) {
                        dataSource.addListener(painter);
                    }
                    this.addPainter("background", {
                        context: plot,
                        action: plot.paint
                    });
                    this.addPainter("foreground", {
                        context: plot.getGeometry(),
                        action: plot.getGeometry().paint
                    });
                    this._plots.push(plot);
                }
            }
                
            // creating loading UI
            var message = SimileAjax.Graphics.createMessageBubble(doc);
            message.containerDiv.className = "timeplot-message-container";
            containerDiv.appendChild(message.containerDiv);
            
            message.contentDiv.className = "timeplot-message";
            message.contentDiv.innerHTML = "<img src='http://static.simile.mit.edu/timeline/api/images/progress-running.gif' /> Loading...";
            
            this.showLoadingMessage = function() { message.containerDiv.style.display = "block"; };
            this.hideLoadingMessage = function() { message.containerDiv.style.display = "none"; };
    
        } else {
    
            this._message = SimileAjax.Graphics.createMessageBubble(doc);
            this._message.containerDiv.className = "timeplot-message-container";
            this._message.contentDiv.className = "timeplot-message";
            this._message.contentDiv.innerHTML = "We're sorry, but your web browser is not currently supported by Timeplot.";
            this.appendChild(this._message.containerDiv);
            this._message.containerDiv.style.display = "block";
    
        }
    }
};
