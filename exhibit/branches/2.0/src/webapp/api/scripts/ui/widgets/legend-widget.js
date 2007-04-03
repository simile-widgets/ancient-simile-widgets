/*==================================================
 *  Exhibit.LegendWidget
 *==================================================
 */
Exhibit.LegendWidget = function(configuration, containerElmt, uiContext) {
    this._configuration = configuration;
    this._div = containerElmt;
    this._uiContext = uiContext;

    this._sortedKeys = [];
    this._labelNodes = {};

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
    this._sortedKeys = [];
    this._labelNodes = {};
};

Exhibit.LegendWidget.prototype.addEntry = function(key, value, label) {
    if (key in this._labelNodes) {
        return;
    }

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
    this._labelStyler(dom.label, value);

    this._labelNodes[key] = dom;
    this._sortedKeys.push(key);
    this._sortedKeys.sort(Exhibit.LegendWidget._localeSort);

    this._div.innerHTML = "";
    for( var i = 0; dom = this._labelNodes[this._sortedKeys[i]]; i++ ) {
        this._div.appendChild(dom.elmt);
    }
};

Exhibit.LegendWidget._localeSort = function(a,b) {
    return a.localeCompare(b);
}

Exhibit.LegendWidget._defaultColorMarkerGenerator = function(value) {
    var span = document.createElement("span");
    span.className = "exhibit-legendWidget-entry-swatch";
    span.style.background = "#" + value;
    span.innerHTML = "\u00a0\u00a0";
    return span;
};

Exhibit.LegendWidget._defaultColorLabelStyler = function(elmt, value) {
    //elmt.style.color = "#" + value;
};
