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

var Rubik = new Object();

Rubik.create = function(controlDiv, browseDiv, viewDiv, configuration) {
    return new Rubik._Impl(controlDiv, browseDiv, viewDiv, configuration);
};

/*==================================================
 *  Rubik._Impl
 *==================================================
 */
Rubik._Impl = function(controlDiv, browseDiv, viewDiv, configuration) {
    this._database = new Rubik.Database();
    this._engine = new Rubik.BrowseEngine(this._database, configuration.engine);
    this._browsePanel = new Rubik.BrowsePanel(this, browseDiv, configuration.browsePanel);
    this._viewPanel = new Rubik.ViewPanel(this, viewDiv, configuration.viewPanel);
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

