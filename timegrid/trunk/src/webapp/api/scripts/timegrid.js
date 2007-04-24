/******************************************************************************
 * Timegrid
 *****************************************************************************/

Timegrid.create = function(node, eventSource, layoutName, layoutParams) {
    return new Timegrid._Impl(node, eventSource, layoutName, layoutParams);
};

Timegrid.loadXML = function(url, f) {
    var fError = function(statusText, status, xmlhttp) {
        alert("Failed to load data XML from " + url + "\n" + statusText);
    };
    var fDone = function(xmlhttp) {
        var xml = xmlhttp.responseXML;
        if (!xml.documentElement && xmlhttp.responseStream) {
            xml.load(xmlhttp.responseStream);
        }
        f(xml, url);
    };
    SimileAjax.XmlHttp.get(url, fError, fDone);
};

Timegrid.loadJSON = function(url, f) {
    var fError = function(statusText, status, xmlhttp) {
        alert("Failed to load JSON data from " + url + "\n" + statusText);
    };
    var fDone = function(xmlhttp) {
        f(eval('(' + xmlhttp.responseText + ')'), url);
    };
    SimileAjax.XmlHttp.get(url, fError, fDone);
};

Timegrid._Impl = function(node, eventSource, layoutName, layoutParams) {
    this._container = node;
    this._eventSource = eventSource;
    this._layout = Timegrid.LayoutFactory.createLayout(layoutName, eventSource,
                                                       layoutParams);
    this._initialize();
};

Timegrid._Impl.prototype._initialize = function() {
    var container = this._container;
    var doc = container.ownerDocument;

    $(container).addClass("timegrid-container");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

