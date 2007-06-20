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
    
    this._canvas = this._timeplot.getDocument().createElement("canvas");
    this._canvas.className = "timeplot-layer";
    this._canvas.style.display = "none";
    this._timeplot.add(this._canvas);
};

Timeplot.Layer.prototype.dispose = function() {
    if (this._eventSource) {
        this._eventSource.removeListener(this._eventListener);
        this._eventListener = null;
        this._eventSource = null;
    }
};

Timeplot.Layer.prototype.paint = function() {
	this._canvas.width = this._timeplot.getPixelWidth() - 1;
    this._canvas.height = this._timeplot.getPixelHeight() - 1;
    this._canvas.style.display = "block";
	if (this._canvas.getContext) {
		var ctx = this._canvas.getContext('2d');
	    ctx.fillRect(25,25,100,100);
	    ctx.clearRect(45,45,60,60);
	    ctx.strokeRect(50,50,50,50);
    }
    
    // ********************** draw the chart here !! ********************    
}
