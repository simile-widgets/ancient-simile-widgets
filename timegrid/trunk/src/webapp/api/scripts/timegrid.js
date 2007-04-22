/*****************************************************************************
 * Timegrid
 */

Timegrid.create = function(node, eventSource, layout) {
    return new Timegrid._Impl(node, eventSource, layout);
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
    Timeline.XmlHttp.get(url, fError, fDone);
};

Timegrid.loadJSON = function(url, f) {
    var fError = function(statusText, status, xmlhttp) {
        alert("Failed to load JSON data from " + url + "\n" + statusText);
    };
    var fDone = function(xmlhttp) {
        f(eval('(' + xmlhttp.responseText + ')'), url);
    };
    Timegrid.XmlHttp.get(url, fError, fDone);
};

Timegrid._Impl = function(node, eventSource, layout) {
    this._container = node;
    this._eventSource = eventSource;
    this._layout = (layout == null ? Timegrid.DefaultLayout : layout);
    this._initialize();
};

Timegrid._Impl.prototype._initialize = function() {
    var container = this._container;
    var doc = container.ownerDocument;

    container.className = container.className.split(" ").
                               concat("timegrid-container").join(" ");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

