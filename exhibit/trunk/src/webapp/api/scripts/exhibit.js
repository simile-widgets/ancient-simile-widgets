/*======================================================================
 *  Exhibit
 *  http://simile.mit.edu/wiki2/Exhibit/API/Exhibit
 *======================================================================
 */
Exhibit.create = function(controlDiv, browseDiv, viewDiv, configuration) {
    return new Exhibit._Impl(controlDiv, browseDiv, viewDiv, configuration);
};

Exhibit.protectUI = function(elmt) {
    SimileAjax.DOM.appendClassName(elmt, "exhibit-ui-protection");
};

/*==================================================
 *  Exhibit._Impl
 *==================================================
 */
Exhibit._Impl = function(controlDiv, browseDiv, viewDiv, configuration) {
    if (configuration == null) {
        configuration = {};
    }
    this._configuration = configuration;
    
    this._database = new Exhibit.Database();
    this._engine = new Exhibit.BrowseEngine(this._database, configuration);
    this._browsePanel = new Exhibit.BrowsePanel(this, browseDiv, configuration);
    this._viewPanel = new Exhibit.ViewPanel(this, viewDiv, configuration);
    
    this._exporters = "exporters" in configuration ? configuration.exporters : {};
    this._exporters["rdf/xml"] = {
        exporter:   Exhibit.RdfXmlExporter
    };
    this._exporters["smw"] = {
        exporter:   Exhibit.SemanticWikitextExporter
    };
};

Exhibit._Impl.prototype.getDatabase = function() { return this._database; };
Exhibit._Impl.prototype.getBrowseEngine = function() { return this._engine; };
Exhibit._Impl.prototype.getBrowsePanel = function() { return this._browsePanel; };
Exhibit._Impl.prototype.getViewPanel = function() { return this._viewPanel; };

Exhibit._Impl.prototype.loadJSON = function(urls, fDone) {
    var exhibit = this;
    if (urls instanceof Array) {
        urls = [].concat(urls);
    } else {
        urls = [ urls ];
    }
    
    var fError = function(statusText, status, xmlhttp) {
        SimileAjax.Debug.log("Failed to load data xml from " + urls[0] + "\n" + statusText);
        urls.shift();
        fNext();
    };
    
    var fDone2 = function(xmlhttp) {
        try {
            var o = null;
            try {
                o = eval("(" + xmlhttp.responseText + ")");
            } catch (e) {
                SimileAjax.Debug.exception(e);
                SimileAjax.Debug.log("Syntax error in JSON file at " + urls[0]);
            }
            
            if (o != null) {
                exhibit._loadJSON(o, exhibit.getBaseURL(urls[0]));
            }
            
            urls.shift();
            fNext();
        } catch (e) {
            SimileAjax.Debug.exception(e);
        }
    };
    
    var fNext = function() {
        if (urls.length > 0) {
            SimileAjax.XmlHttp.get(urls[0], fError, fDone2);
        } else {
            try {
                if (fDone != null) {
                    fDone();
                }
            } catch (e) {
                SimileAjax.Debug.exception(e);
            }
        }
    };
    fNext();
};

Exhibit._Impl.prototype.getBaseURL = function(url) {
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

Exhibit._Impl.prototype.makeActionLink = function(text, handler, layer) {
    var a = document.createElement("a");
    a.href = "javascript:";
    a.className = "exhibit-action";
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

Exhibit._Impl.prototype.makeActionLinkWithObject = function(text, obj, handlerName, layer) {
    var a = document.createElement("a");
    a.href = "javascript:";
    a.className = "exhibit-action";
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

Exhibit._Impl.prototype.enableActionLink = function(a, enabled) {
    a.setAttribute("disabled", enabled ? "false" : "true");
    a.className = enabled ? "exhibit-action" : "exhibit-action-disabled";
};

Exhibit._Impl.prototype.makeItemSpan = function(itemID, label, layer) {
    if (label == null) {
        label = this._database.getObject(itemID, "label");
    }
    if (label == null) {
        label = itemID;
    }
    
    var a = document.createElement("a");
    a.href = "javascript:";
    a.className = "exhibit-item";
    a.innerHTML = label;
    
    var exhibit = this;
    var handler = function(elmt, evt, target) {
        exhibit.showItemView(itemID, elmt);
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    }
    SimileAjax.WindowManager.registerEvent(a, "click", handler, layer);
    
    return a;
};

Exhibit._Impl.prototype.makeValueSpan = function(label, valueType, layer) {
    var span = document.createElement("span");
    span.className = "exhibit-value";
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

Exhibit._Impl.prototype.showItemView = function(itemID, elmt) {
    var coords = SimileAjax.DOM.getPageCoordinates(elmt);
    var bubble = SimileAjax.Graphics.createBubbleForPoint(
        document, 
        coords.left + Math.round(elmt.offsetWidth / 2), 
        coords.top + Math.round(elmt.offsetHeight / 2), 
        400, // px
        300  // px
    );
    
    var itemViewDiv = document.createElement("div");
    var itemView = new Exhibit.ItemView(itemID, itemViewDiv, this, this._configuration);
    bubble.content.appendChild(itemViewDiv);
};

Exhibit._Impl.prototype.getExporters = function() {
    return this._exporters;
};

Exhibit._Impl.prototype.serializeItem = function(itemID, format) {
    if (format == "rdf/xml") {
        var s = "";
        var uri = this._database.getObject(itemID, "uri");
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

Exhibit._Impl.prototype._loadJSON = function(o, url) {
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

