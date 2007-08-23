/******************************************************************************
 * Timegrid
 *****************************************************************************/

Timegrid.create = function(node, eventSource, layoutName, layoutParams) {
    return new Timegrid._Impl(node, eventSource, layoutName, layoutParams);
};

Timegrid.resize = function() {
    for (var i = 0; i < window.timegrids.length; i++) {
        window.timegrids[i]._resize();
    }
    return false;
};

Timegrid.createFromDOM = function(elmt) {
    var config = Timegrid.getConfigFromDOM(elmt);
    var layoutNames = config.views.split(",");
    var getExtension = function(s) {
        return s.split('.').pop().toLowerCase();
    };
    if (config.eventsource) {
        var eventSource = eval(config.eventsource);
        var tg = Timegrid.create(elmt, eventSource, layoutNames, config);
        return tg;
    } else if (config.src) {
        var eventSource = new Timegrid.DefaultEventSource();
        var tg = Timegrid.create(elmt, eventSource, layoutNames, config);
        switch (getExtension(config.src)) {
            case 'xml':
            tg.loadXML(config.src, function(xml, url) {
                eventSource.loadXML(xml, url);
            });
            break;
            case 'js':
            tg.loadJSON(config.src, function(json, url) {
                eventSource.loadJSON(json, url);
            });
            break;
        }
        return tg;
    }
};

Timegrid.getConfigFromDOM = function(elmt) {
    var config = $(elmt).attrs('tg');
    config.scrollwidth = $.scrollWidth();
    for (var k in config) {
        config[k.toLowerCase()] = config[k];
    }
    return config;
};

Timegrid.loadXML = function(url, f) {
    var fError = function(statusText, status, xmlhttp) {
        alert(Timegrid.l10n.xmlErrorMessage + " " + url + "\n" + statusText);
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
        alert(Timegrid.l10n.jsonErrorMessage + " " + url + "\n" + statusText);
    };
    var fDone = function(xmlhttp) {
        f(eval('(' + xmlhttp.responseText + ')'), url);
    };
    SimileAjax.XmlHttp.get(url, fError, fDone);
};

Timegrid._Impl = function(node, eventSource, layoutNames, layoutParams) {
    var tg = this;
    this._container = node;
    this._eventSource = eventSource;
    this._layoutNames = layoutNames;
    this._layoutParams = layoutParams;

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
        alert(Timegrid.l10n.xmlErrorMessage + " " + url + "\n" + statusText);
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
        alert(Timegrid.l10n.jsonErrorMessage + " " + url + "\n" + statusText);
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
    this.rendering = true;
    var self = this;
    this._layouts = $.map(this._layoutNames, function(s) {
        return Timegrid.LayoutFactory.createLayout(s, self._eventSource,
                                                      self._layoutParams);
    });
    if (this._panel) {
        this._panel.setLayouts(this._layouts);
    } else {
        this._panel = new Timegrid.Controls.Panel(this._layouts);
    }
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
        + "images/progress-running.gif' /> " + Timegrid.l10n.loadingMessage;

    this.showLoadingMessage = function() { $(message.containerDiv).show(); };
    this.hideLoadingMessage = function() { $(message.containerDiv).hide(); };

    this._panel.render(container);
    this.rendering = false;
};

Timegrid._Impl.prototype._update = function() {
    this._panel.renderChanged();
};

Timegrid._Impl.prototype._resize = function() {
    var newHeight = $(this._container).height();
    var newWidth = $(this._container).width();
    
    if (!(newHeight == this._oldHeight && newWidth == this._oldWidth)) {
        if (!this.rendering) { this._construct(); }       
        this._oldHeight = newHeight;
        this._oldWidth = newWidth;
    }
};

Timegrid._Impl.prototype._onAddMany = function() {
    this._update();
};

Timegrid._Impl.prototype._onClear = function() {
    this._update();
};

