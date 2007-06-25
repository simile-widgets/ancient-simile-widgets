/*==================================================
 *  Timeplot
 *==================================================
 */

log = SimileAjax.Debug.log;
expand = SimileAjax.Debug.objectToString;
 
Timeplot.create = function(elmt, plotInfos) {
    return new Timeplot._Impl(elmt, plotInfos);
};

Timeplot.createPlotInfo = function(params) {
    return {   
    	id:             ("id" in params) ? params.id : null,
        dataSource:     ("dataSource" in params) ? params.dataSource : null,
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
    this._unit = (unit != null) ? unit : Timeline.NativeDateUnit;
    this._initialize();
};

Timeplot._Impl.prototype.dispose = function() {
    for (var i = 0; i < this._plots.length; i++) {
        this._plots[i].dispose();
    }
    this._plots = null;
    this._plotsInfos = null;
    this._containerDiv.innerHTML = "";
};

Timeplot._Impl.prototype.getDocument = function() {
    return this._containerDiv.ownerDocument;
};

Timeplot._Impl.prototype.add = function(div) {
    this._containerDiv.appendChild(div);
};

Timeplot._Impl.prototype.remove = function(div) {
    this._containerDiv.removeChild(div);
};

Timeplot._Impl.prototype.getPixelWidth = function() {
    var w = window.getComputedStyle(this._containerDiv, null).getPropertyValue("width");
    w = parseInt(w.replace("px",""));
    return w;
};

Timeplot._Impl.prototype.getPixelHeight = function() {
    var h = window.getComputedStyle(this._containerDiv, null).getPropertyValue("height");
    h = parseInt(h.replace("px",""));
    return h;    
};

Timeplot._Impl.prototype.getUnit = function() {
    return this._unit;
};

Timeplot._Impl.prototype.getCanvas = function() {
    return this._canvas;
};

Timeplot._Impl.prototype.loadText = function(url, separator, eventSource) {
    var tp = this;
    
    var fError = function(statusText, status, xmlhttp) {
        alert("Failed to load data xml from " + url + "\n" + statusText);
        tp.hideLoadingMessage();
    };
    
    var fDone = function(xmlhttp) {
        try {
            eventSource.loadText(xmlhttp.responseText, separator, url);
        } catch (e) {
        	SimileAjax.Debug.exception(e);
        } finally {
            tp.hideLoadingMessage();
        }
    };
    
    this.showLoadingMessage();
    window.setTimeout(function() { SimileAjax.XmlHttp.get(url, fError, fDone); }, 0);
};

Timeplot._Impl.prototype.loadXML = Timeline._Impl.prototype.loadXML;
Timeplot._Impl.prototype.loadJSON = Timeline._Impl.prototype.loadJSON;

Timeplot._Impl.prototype.resize = function() {
	this._prepareCanvas();

    for (var i = 0; i < this._plots.length; i++) {
        this._plots[i].paint();
    }
}

Timeplot._Impl.prototype._prepareCanvas = function() {
    var canvas = this.getCanvas();

    canvas.width = this.getPixelWidth();
    canvas.height = this.getPixelHeight();

    var ctx = canvas.getContext('2d');
    ctx.translate(0,canvas.height);
    ctx.scale(1,-1);
    ctx.globalCompositeOperation = 'source-over';
}

Timeplot._Impl.prototype._initialize = function() {
    var containerDiv = this._containerDiv;
    var doc = containerDiv.ownerDocument;

    // make sure the timeplot div has the right class    
    containerDiv.className = containerDiv.className.split(" ").concat("timeplot-container").join(" ");
        
    // clean it up if it contains some content
    while (containerDiv.firstChild) {
        containerDiv.removeChild(containerDiv.firstChild);
    }
    
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
	    
	    // creating plots
	    this._plots = [];
	    if (this._plotInfos) {
	        for (var i = 0; i < this._plotInfos.length; i++) {
	            var plot = new Timeplot.Plot(this, this._plotInfos[i], i);
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
};
