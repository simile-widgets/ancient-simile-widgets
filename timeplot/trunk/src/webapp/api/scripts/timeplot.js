/*==================================================
 *  Timeplot
 *==================================================
 */

log = SimileAjax.Debug.log;
expand = SimileAjax.Debug.objectToString;
 
Timeplot.strings = {}; // localization string tables

Timeplot.create = function(elmt, layerInfos) {
    return new Timeplot._Impl(elmt, layerInfos);
};

Timeplot.createLayerInfo = function(params) {
    return {   
    	id:             ("id" in params) ? params.id : null,
        eventSource:    ("eventSource" in params) ? params.eventSource : new Timeplot.DefaultEventSource(),
        column:         ("column" in params) ? params.column : 1,
        geometry:       ("geometry" in params) ? params.geometry : new Timeplot.DefaultGeometry(),
        timeZone:       ("timeZone" in params) ? params.timeZone : 0
    };
};

// -------------------------------------------------------

Timeplot._Impl = function(elmt, layerInfos, unit) {
    this._containerDiv = elmt;
    this._layerInfos = layerInfos;
    this._unit = (unit != null) ? unit : Timeline.NativeDateUnit;
    this._initialize();
};

Timeplot._Impl.prototype.dispose = function() {
    for (var i = 0; i < this._layers.length; i++) {
        this._layers[i].dispose();
    }
    this._layers = null;
    this._layersInfos = null;
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
    return this._containerDiv.offsetWidth;
};

Timeplot._Impl.prototype.getPixelHeight = function() {
    return this._containerDiv.offsetHeight;
};

Timeplot._Impl.prototype.getUnit = function() {
    return this._unit;
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

Timeplot._Impl.prototype.paint = function() {
    for (var i = 0; i < this._layers.length; i++) {
        this._layers[i].paint();
    }
};

Timeplot._Impl.prototype._initialize = function() {
    var containerDiv = this._containerDiv;
    var doc = containerDiv.ownerDocument;
    
    containerDiv.className = containerDiv.className.split(" ").concat("timeplot-container").join(" ");
        
    while (containerDiv.firstChild) {
        containerDiv.removeChild(containerDiv.firstChild);
    }
    
    // inserting copyright and link to simile
    var elmtCopyright = SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix + "images/copyright.png");
    elmtCopyright.className = "timeplot-copyright";
    elmtCopyright.title = "Timeplot (c) SIMILE - http://simile.mit.edu/timeplot/";
    SimileAjax.DOM.registerEvent(elmtCopyright, "click", function() { window.location = "http://simile.mit.edu/timeplot/"; });
    containerDiv.appendChild(elmtCopyright);
    
    // creating layers
    this._layers = [];
    if (this._layerInfos) {
	    for (var i = 0; i < this._layerInfos.length; i++) {
	        var layer = new Timeplot.Layer(this, this._layerInfos[i], i);
	        this._layers.push(layer);
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
};
