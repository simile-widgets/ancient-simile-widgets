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
    
    var canvas = this._timeplot.getDocument().createElement("canvas");
    
    if (canvas.getContext) {
    	this._canvas = canvas;
	    this._canvas.className = "timeplot-layer";
	    this._canvas.style.display = "none";
	    this._timeplot.add(this._canvas);
    } else {
	    this._message = SimileAjax.Graphics.createMessageBubble(this._timeplot.getDocument());
	    this._message.containerDiv.className = "timeplot-message-container";
	    this._timeplot.appendChild(this._message.containerDiv);
	    this._message.contentDiv.className = "timeplot-message";
	    this._message.contentDiv.innerHTML = "We're sorry, but your web browser is not currently supported by Timeplot.";
        this._message.containerDiv.style.display = "block";
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
	if (this._canvas) {
        var geometry = this._layerInfo.geometry;

		this._canvas.width = this._timeplot.getPixelWidth();
	    this._canvas.height = this._timeplot.getPixelHeight();
	    this._canvas.style.display = "block";

        geometry.setWidth(this._canvas.width);
        geometry.setHeight(this._canvas.height);

        var ctx = this._canvas.getContext('2d');
        ctx.translate(0,this._canvas.height);
        ctx.scale(1,-1);
        	
	    var source = this._eventSource;
	    geometry.setEarliestDate(source.getEarliestDate());
	    geometry.setLatestDate(source.getLatestDate());
	    var stats = source.getStats(this._layerInfo.column - 1);
        geometry.setMinValue(stats.min);
        geometry.setMaxValue(stats.max);
        
        ctx.lineTo(10,10);
        
	    var iterator = source.getAllEventIterator();
	    while (iterator.hasNext()) {
	    	var event = iterator.next();
	    	var value = event.getValues()[this._layerInfo.column - 1];
	    	var p = geometry.locate(event.getStart(), value);
	    	//log(expand(p));
	    	ctx.fillRect(p.x,0,1,p.y);
	    }
	}
}
