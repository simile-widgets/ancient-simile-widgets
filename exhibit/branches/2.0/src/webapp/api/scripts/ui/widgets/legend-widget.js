/*==================================================
 *  Exhibit.LegendWidget
 *==================================================
 */
Exhibit.LegendWidget = function(configuration, containerElmt, uiContext) {
    this._configuration = configuration;
    this._div = containerElmt;
    this._uiContext = uiContext;
    
    this._keys = {};
    
    this._markerGenerator = "markerGenerator" in configuration ?
        configuration.markerGenerator :
        Exhibit.LegendWidget._defaultColorMarkerGenerator;
        
    this._labelStyler = "labelStyler" in configuration ?
        configuration.labelStyler :
        Exhibit.LegendWidget._defaultColorLabelStyler;
    
    this._initializeUI();
};

Exhibit.LegendWidget.create = function(configuration, containerElmt, uiContext) {
    return new Exhibit.LegendWidget(configuration, containerElmt, uiContext);
};

Exhibit.LegendWidget.prototype.dispose = function() {
    this._div.innerHTML = "";
    
    this._div = null;
    this._uiContext = null;
};

Exhibit.LegendWidget.prototype._initializeUI = function() {
    this._div.className = "exhibit-legendWidget";
    this._div.innerHTML = "";
};

Exhibit.LegendWidget.prototype.clear = function() {
    this._div.innerHTML = "";
    this._keys = {};
};

Exhibit.LegendWidget.prototype.addEntry = function(key, value, label) {
    if (key in this._keys) {
        return;
    }
    
    this._keys[key] = true;
    
    var dom = SimileAjax.DOM.createDOMFromString(
        "span",
        "<span id='marker'></span>\u00a0" +
            "<span id='label' class='exhibit-legendWidget-entry-title'>" + 
                label.replace(/\s+/g, "\u00a0") + 
            "</span>" +
            "\u00a0\u00a0 ",
        { marker: this._markerGenerator(value) }
    );
    dom.elmt.className = "exhibit-legendWidget-entry";
        
    this._labelStyler(dom.label);
    this._div.appendChild(dom.elmt);
};

Exhibit.LegendWidget._defaultColorMarkerGenerator = function(value) {
    var span = document.createElement("span");
    span.className = "exhibit-legendWidget-entry-swatch";
    span.style.background = "#" + value;
    span.innerHTML = "\u00a0\u00a0";
    return span;
};

Exhibit.LegendWidget._defaultColorLabelStyler = function(elmt, value) {
    elmt.style.color = "#" + value;
};
