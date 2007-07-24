/******************************************************************************
 * Timegrid
 *****************************************************************************/

Timegrid.create = function(node, eventSource, rootConfig, layoutConfigs) {
    return new Timegrid._Impl(node, eventSource, rootConfig, layoutConfigs);
};

Timegrid.resize = function() {
    for (var i in window.timegrids) {
        window.timegrids[i]._construct();
    }
};

Timegrid.createFromDOM = function(elmt) {
    var config = Timegrid.getConfigFromDOM(elmt);
    var eventSource = new Timegrid.DefaultEventSource();
    var layoutNames = config.get('views').split(",");
    var layoutConfigs = {};
    $.map(layoutNames, function(s) {
        layoutConfigs[s] = Timegrid.getLayoutConfigFromDOM(elmt, name, config);
    });
    var tg = Timegrid.create(elmt, eventSource, config, layoutConfigs);
    var getExtension = function(s) {
        return s.split('.').pop().toLowerCase();
    };
    var src = config.get('src');
    if (src) {
        switch (getExtension(src)) {
            case 'xml':
            tg.loadXML(src, function(xml, url) {
                eventSource.loadXML(xml, url);
            });
            break;
            case 'js':
            tg.loadJSON(src, function(json, url) {
                eventSource.loadJSON(json, url);
            });
            break;
        }
    }
    return tg;
};

Timegrid.getConfigFromDOM = function(elmt) {
    var params = $(elmt).attrs('tg');
    params.scrollwidth = $.scrollWidth();
    return new Timegrid.Configuration(params);
};

Timegrid.getLayoutConfigFromDOM = function(elmt, name, parent) {
    var children = $(elmt).children();
    children.each(function() {
        var attrs = $(this).attrs('tg');
        if (attrs.role == "view" && attrs.name == name) {
            return new Timegrid.Configuration(attrs, parent);
        }
    });
    return new Timegrid.Configuration({}, parent);
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

Timegrid._Impl = function(node, eventSource, rootConfig, layoutConfigs) {
    var tg = this;
    this._container = node;
    this._eventSource = eventSource;
    this._layoutConfigs= layoutConfigs;
    this._config = rootConfig;

    if (this._eventSource) {
        this._eventListener = {
            onAddMany: function() { tg._onAddMany(); },
            onClear:   function() { tg._onClear(); }
        }
        this._eventSource.addListener(this._eventListener);
    }
    this._construct();
};

Timegrid._Impl.prototype.loadXML = function(url, f) {
    var tg = this;

    var fError = function(statusText, status, xmlhttp) {
        alert("Failed to load data xml from " + url + "\n" + statusText);
        tg.hideLoadingMessage();
    };
    var fDone = function(xmlhttp) {
        try {
            var xml = xmlhttp.responseXML;
            if (!xml.documentElement && xmlhttp.responseStream) {
                xml.load(xmlhttp.responseStream);
            }
            f(xml, url);
        } finally {
            tg.hideLoadingMessage();
        }
    };
    this.showLoadingMessage();
    window.setTimeout(function() {
        SimileAjax.XmlHttp.get(url, fError, fDone);
    }, 0);
};

Timegrid._Impl.prototype.loadJSON = function(url, f) {
    var tg = this;
    var fError = function(statusText, status, xmlhttp) {
        alert("Failed to load json data from " + url + "\n" + statusText);
        tg.hideLoadingMessage();
    };
    var fDone = function(xmlhttp) {
        try {
            f(eval('(' + xmlhttp.responseText + ')'), url);
        } finally {
            tg.hideLoadingMessage();
        }
    };
    this.showLoadingMessage();
    window.setTimeout(function() { SimileAjax.XmlHttp.get(url, fError, fDone); }, 0);
};

Timegrid._Impl.prototype._construct = function() {
    var self = this;
    this._layouts = [];
    for (name in this._layoutConfigs) {
        var config = this._layoutConfigs[name];
        var layout = Timegrid.LayoutFactory.createLayout(name, 
                                                         self._eventSource, 
                                                         config);
        this._layouts.push(layout);
    }
    this._panel = new Timegrid.Controls.Panel(this._layouts);
    var container = this._container;
    var doc = container.ownerDocument;

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    $(container).addClass('timegrid-default');

    var message = SimileAjax.Graphics.createMessageBubble(doc);
    message.containerDiv.className = "timegrid-message-container";
    container.appendChild(message.containerDiv);

    message.contentDiv.className = "timegrid-message";
    message.contentDiv.innerHTML = "<img src='" + Timegrid.urlPrefix
        + "images/progress-running.gif' /> Loading...";

    this.showLoadingMessage = function() { $(message.containerDiv).show(); };
    this.hideLoadingMessage = function() { $(message.containerDiv).hide(); };

    this._panel.render(container);
};

Timegrid._Impl.prototype._onAddMany = function() {
    this._construct();
};

Timegrid._Impl.prototype._onClear = function() {
    this._construct();
};

