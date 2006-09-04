/*==================================================
 *  Rubik
 *==================================================
 */
var g_historyLocation = 0;

function advanceHistory() {
}

function setHistoryPosition(newPosition) {
}

function showStatus(message) {
}

function hideStatus() {
}

function performLongTask(f, message) {
    showStatus(message);
    setTimeout(function() {
        try { f(); } catch (e) {}
        hideStatus();
    }, 0);
}

Rubik.create = function(controlDiv, browseDiv, viewDiv, configuration) {
    return new Rubik._Impl(controlDiv, browseDiv, viewDiv, configuration);
};

Rubik.protectUI = function(elmt) {
    SimileAjax.DOM.appendClassName(elmt, "rubik-ui-protection");
};

/*==================================================
 *  Rubik._Impl
 *==================================================
 */
Rubik._Impl = function(controlDiv, browseDiv, viewDiv, configuration) {
    if (configuration == null) {
        configuration = {};
    }
    
    this._database = new Rubik.Database();
    this._engine = new Rubik.BrowseEngine(this._database, configuration);
    this._browsePanel = new Rubik.BrowsePanel(this, browseDiv, configuration);
    this._viewPanel = new Rubik.ViewPanel(this, viewDiv, configuration);
};

Rubik._Impl.prototype.getDatabase = function() { return this._database; };
Rubik._Impl.prototype.getBrowseEngine = function() { return this._engine; };
Rubik._Impl.prototype.getBrowsePanel = function() { return this._browsePanel; };
Rubik._Impl.prototype.getViewPanel = function() { return this._viewPanel; };

Rubik._Impl.prototype.loadJSON = function(url, fDone) {
    var rubik = this;
    var fError = function(statusText, status, xmlhttp) {
        alert("Failed to load data xml from " + url + "\n" + statusText);
    };
    var fDone2 = function(xmlhttp) {
        try {
            rubik._loadJSON(
                eval("(" + xmlhttp.responseText + ")"), 
                rubik.getBaseURL(url)
            );
            if (fDone != null) {
                fDone();
            }
        } catch (e) {
            SimileAjax.Debug.exception(e);
        }
    };
    SimileAjax.XmlHttp.get(url, fError, fDone2);
};

Rubik._Impl.prototype.getBaseURL = function(url) {
    if (url.indexOf("://") < 0) {
        var url2 = this.getBaseURL(document.location.href);
        if (url.substr(0,1) == "/") {
            url = url2.substr(0, url2.indexOf("/", url2.indexOf("://") + 3)) + url;
        } else {
            url = url2 + url;
        }
    }
    
    var i = url.lastIndexOf("/");
    if (i < 0) {
        return "";
    } else {
        return url.substr(0, i+1);
    }
};

Rubik._Impl.prototype.makeActionLink = function(text, handler, layer) {
    var a = document.createElement("a");
    a.href = "javascript:";
    a.className = "rubik-action";
    a.innerHTML = text;
    
    var handler2 = function(elmt, evt, target) {
        if ("true" == elmt.getAttribute("disabled")) {
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        } else {
            return handler(elmt, evt, target);
        }
    }
    SimileAjax.WindowManager.registerEvent(a, "click", handler2, layer);
    
    return a;
};

Rubik._Impl.prototype.makeActionLinkWithObject = function(text, obj, handlerName, layer) {
    var a = document.createElement("a");
    a.href = "javascript:";
    a.className = "rubik-action";
    a.innerHTML = text;
    
    var handler2 = function(elmt, evt, target) {
        if ("true" == elmt.getAttribute("disabled")) {
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        } else {
            return obj[handlerName].call(obj, elmt, evt, target);
        }
    }
    SimileAjax.WindowManager.registerEvent(a, "click", handler2, layer);
    
    return a;
};

Rubik._Impl.prototype.enableActionLink = function(a, enabled) {
    a.setAttribute("disabled", enabled ? "false" : "true");
};

Rubik._Impl.prototype.makeItemSpan = function(itemID, label, layer) {
    if (label == null) {
        label = this._database.getLiteralProperty(itemID, "label");
    }
    if (label == null) {
        label = itemID;
    }
    
    var a = document.createElement("a");
    a.href = "javascript:";
    a.className = "rubik-item";
    a.innerHTML = label;
    
    var rubik = this;
    var handler = function(elmt, evt, target) {
        rubik.showItemView(itemID, elmt);
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    }
    SimileAjax.WindowManager.registerEvent(a, "click", handler, layer);
    
    return a;
};

Rubik._Impl.prototype.makeValueSpan = function(label, valueType, layer) {
    var span = document.createElement("span");
    span.className = "rubik-value";
    if (valueType == "url") {
        var a = document.createElement("a");
        a.target = "_blank";
        a.href = label;
        if (label.length > 50) {
            a.innerHTML = label.substr(0, 20) + " ... " + label.substr(label.length - 20);
        } else {
            a.innerHTML = label;
        }
        span.appendChild(a);
    } else {
        span.innerHTML = label;
    }
    return span;
};

Rubik._Impl.prototype.showItemView = function(itemID, elmt) {
};

Rubik._Impl.prototype.serializeItem = function(itemID, format) {
    if (format == "rdf/xml") {
        var s = "";
        var uri = this._database.getLiteralProperty(itemID, "uri");
        s += "<rdf:Description rdf:about='" + uri + "'>\n"
        
        var allProperties = this._database.getAllProperties();
        for (var i = 0; i < allProperties.length; i++) {
            var propertyID = allProperties[i];
            var property = this._database.getProperty(propertyID);
            var propertyURI = property.getURI();
            var values = this._database.getObjects(itemID, propertyID);
            
            if (property.getValueType() == "item") {
                values.visit(function(value) {
                    s += "<" + propertyURI + " rdf:resource='" + value + "' />\n";
                });
            } else {
                values.visit(function(value) {
                    s += "<" + propertyURI + ">" + value + "</propertyURI>\n";
                });
            }
        }
        
        s += "</rdf:Description>";
        return s;
    }
    return "";
};

Rubik._Impl.prototype._loadJSON = function(o, url) {
    if ("types" in o) {
        this._database.loadTypes(o.types, url);
    }
    if ("properties" in o) {
        this._database.loadProperties(o.properties, url);
    }
    if ("items" in o) {
        this._database.loadItems(o.items, url);
    }
};

