/*======================================================================
 *  Exhibit
 *  http://simile.mit.edu/wiki/Exhibit/API/Exhibit
 *======================================================================
 */
Exhibit.create = function(rootTypes, data) {
    var exhibit = Exhibit._internalCreate({});
    exhibit.setRootTypes(rootTypes);
    if (typeof data != "undefined") {
        exhibit._dwim_create(data);
    }

    return exhibit;
};

Exhibit.createAdvanced = function(configuration, controlDiv, browseDiv, viewDiv) {
    return Exhibit._internalCreate({
        controlDiv:     controlDiv,
        browseDiv:      browseDiv,
        viewDiv:        viewDiv,
        configuration:  configuration
    });
};

Exhibit.protectUI = function(elmt) {
    SimileAjax.DOM.appendClassName(elmt, "exhibit-ui-protection");
};

Exhibit.getAttribute = function(elmt, name) {
    try {
        var value = elmt.getAttribute(name);
        return (value != null) ? value : elmt.getAttribute("ex:" + name);
    } catch (e) {
        return null;
    }
};

Exhibit.showHelp = function(message, url, target) {
    target = (target) ? target : "_blank";
    if (url != null) {
        if (window.confirm(message + "\n\n" + Exhibit.l10n.showDocumentationMessage)) {
            window.open(url, target);
        }
    } else {
        window.alert(message);
    }
};

Exhibit.showJavascriptExpressionValidation = function(message, expression) {
    var target = "_blank";
    if (window.confirm(message + "\n\n" + Exhibit.l10n.showJavascriptValidationMessage)) {
        window.open(Exhibit.validator + "?expresson=" + encodeURIComponent(expression), target);
    }
};

Exhibit.showJsonFileValidation = function(message, url) {
    var target = "_blank";
    if (url.indexOf("file:") == 0) {
        if (window.confirm(message + "\n\n" + Exhibit.l10n.showJsonValidationFormMessage)) {
            window.open(Exhibit.validator, target);
        }
    } else {
        if (window.confirm(message + "\n\n" + Exhibit.l10n.showJsonValidationMessage)) {
            window.open(Exhibit.validator + "?url=" + url, target);
        }
    }
};

Exhibit._busyIndicator = null;
Exhibit._busyIndicatorCount = 0;

Exhibit.showBusyIndicator = function() {
    Exhibit._busyIndicatorCount++;
    if (Exhibit._busyIndicatorCount > 1) {
        return;
    }
    
    if (Exhibit._busyIndicator == null) {
        Exhibit._busyIndicator = Exhibit.Theme.createBusyIndicator();
    }
    
    var scrollTop = ("scrollTop" in document.body) ?
        document.body.scrollTop :
        document.body.parentNode.scrollTop;
    var height = ("innerHeight" in window) ?
        window.innerHeight :
        ("clientHeight" in document.body ?
            document.body.clientHeight :
            document.body.parentNode.clientHeight);
        
    var top = Math.floor(scrollTop + height / 3);
    
    Exhibit._busyIndicator.style.top = top + "px";
    document.body.appendChild(Exhibit._busyIndicator);
};

Exhibit.hideBusyIndicator = function() {
    Exhibit._busyIndicatorCount--;
    if (Exhibit._busyIndicatorCount > 0) {
        return;
    }
    
    try {
        document.body.removeChild(Exhibit._busyIndicator);
    } catch(e) {
        // silent
    }
};

Exhibit.getBaseURL = function(url) {
    if (url.indexOf("://") < 0) {
        var url2 = Exhibit.getBaseURL(document.location.href);
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

Exhibit.resolveURL = function(url) {
    if (url.indexOf("://") < 0) {
        var url2 = Exhibit.getBaseURL(document.location.href);
        if (url.substr(0,1) == "/") {
            url = url2.substr(0, url2.indexOf("/", url2.indexOf("://") + 3)) + url;
        } else {
            url = url2 + url;
        }
    }
    return url;
};

Exhibit.getURLWithoutQueryAndHash = function() {
    var url;
    if ("_urlWithoutQueryAndHash" in Exhibit) {
        url = Exhibit._urlWithoutQueryAndHash;
    } else {
        url = document.location.href;
        
        var hash = url.indexOf("#");
        var question = url.indexOf("?");
        if (question >= 0) {
            url = url.substr(0, question);
        } else if (hash >= 0) {
            url = url.substr(0, hash);
        }
        
        Exhibit._urlWithoutQueryAndHash = url;
    }
    return url;
};

Exhibit.getURLWithoutQuery = function() {
    var url;
    if ("_urlWithoutQuery" in Exhibit) {
        url = Exhibit._urlWithoutQuery;
    } else {
        url = document.location.href;
        
        var question = url.indexOf("?");
        if (question >= 0) {
            url = url.substr(0, question);
        }
        
        Exhibit._urlWithoutQuery = url;
    }
    return url;
};

Exhibit.docRoot = "http://simile.mit.edu/wiki/";
Exhibit.validator = "http://simile.mit.edu/babel/validator";

Exhibit._internalCreate = function(settings) {
    if (!("controlDiv" in settings) || settings.controlDiv == null) {
        settings.controlDiv = document.getElementById("exhibit-control-panel");
    }
    if (!("browseDiv" in settings) || settings.browseDiv == null) {
        settings.browseDiv = document.getElementById("exhibit-browse-panel");
    }
    if (!("viewDiv" in settings) || settings.viewDiv == null) {
        settings.viewDiv = document.getElementById("exhibit-view-panel");
    }
    if (!("configuration" in settings) || settings.configuration == null) {
        settings.configuration = {};
    }
    
    return new Exhibit._Impl(
        settings.controlDiv, 
        settings.browseDiv, 
        settings.viewDiv, 
        settings.configuration
    );
};

/*==================================================
 *  Exhibit._Impl
 *==================================================
 */
Exhibit._Impl = function(controlDiv, browseDiv, viewDiv, configuration) {
    this._configuration = configuration;
    
    this._exporters = [
        Exhibit.RdfXmlExporter,
        Exhibit.SemanticWikitextExporter,
        Exhibit.ExhibitJsonExporter,
        Exhibit.TSVExporter,
        Exhibit.HTMLExporter
    ];
    if ("exporters" in configuration) {
        this._exporters = this._exporters.concat(configuration.exporters);
    }
    
    this._database = ("database" in window) ? window.database : Exhibit.Database.create();
    this._engine = new Exhibit.BrowseEngine(this._database, configuration);
    this._controlPanel = new Exhibit.ControlPanel(this, controlDiv, configuration);
    this._browsePanel = new Exhibit.BrowsePanel(this, browseDiv, configuration);
    this._viewPanel = new Exhibit.ViewPanel(this, viewDiv, configuration);
    
    var self = this;
    this._focusID = null;
    this._databaseListener = {
        onAfterLoadingItems: function() {
            self._tryToFocusOnItem();
        }
    };
    this._database.addListener(this._databaseListener);
    
    this._historyListener = {
        onBeforePerform: function(action) {
            if (action.lengthy) {
                Exhibit.showBusyIndicator();
            }
        },
        onAfterPerform: function(action) {
            if (action.lengthy) {
                Exhibit.hideBusyIndicator();
            }
        },
        onBeforeUndoSeveral: function() {
            Exhibit.showBusyIndicator();
        },
        onAfterUndoSeveral: function() {
            Exhibit.hideBusyIndicator();
        },
        onBeforeRedoSeveral: function() {
            Exhibit.showBusyIndicator();
        },
        onAfterRedoSeveral: function() {
            Exhibit.hideBusyIndicator();
        }
    };
    SimileAjax.History.addListener(this._historyListener);
    
    var hash = document.location.hash;
    if (hash.length > 1) {
        this._focusID = decodeURIComponent(hash.substr(1));
    }
};

Exhibit._Impl.prototype.getDatabase = function() { return this._database; };
Exhibit._Impl.prototype.getBrowseEngine = function() { return this._engine; };
Exhibit._Impl.prototype.getBrowsePanel = function() { return this._browsePanel; };
Exhibit._Impl.prototype.getViewPanel = function() { return this._viewPanel; };
Exhibit._Impl.prototype.getControlPanel = function() { return this._controlPanel; };

Exhibit._Impl.prototype.dispose = function() {
    SimileAjax.History.removeListener(this._historyListener);
    this._database.removeListener(this._databaseListener);
};

Exhibit._Impl.prototype._dwim_create = function(data) {
    var showError = function() {
        if( confirm( "Exhibit.create() wants a rootTypes argument (a type\n" +
                     "name or array of type names), and (optionally) a\n" +
                     "Javascript object, the ID of a <data> or <table>\n" +
                     "element, or an array of either.\n\n" +
                     "Do you want to see to the relevant documentation?" ) ) {
            window.open("http://simile.mit.edu/wiki/Exhibit/Creating%2C_Importing%2C_and_Managing_Data", "_blank");
        }
    };

    if (typeof data == "object") {
        if (data.hasOwnProperty("items") ||
            data.hasOwnProperty("types") ||
            data.hasOwnProperty("properties"))
            return this._database.loadData(data);
        if (data.hasOwnProperty("jsonp_url"))
            return Exhibit.JSONPImporter.load(data.jsonp_url,
					      this._database,
					      data.continuation,
					      data.ondataload,
					      data.callback);
    }

    if (typeof data == "string") {
        var elmt = document.getElementById(data);
        if (elmt == null) {
            return showError();
        } else {
            var tagName = elmt.tagName.toLowerCase();
            if (tagName == "data") {
                this.loadDataFromDomNode(elmt);
            } else if (tagName == "table") {
                Exhibit.HtmlTableImporter.loadTable(elmt, this._database);
            } else {
                showError();
            }
        }
    } else {
        showError();
    }
}

Exhibit._Impl.prototype.setRootTypes = function(rootTypes) {
    var items, database = this.getDatabase();
    if (typeof rootTypes == "string") {
        items = database.getSubjects(rootTypes, "type");
    } else if (rootTypes instanceof Array) {
        items = database.getSubjectsUnion(new Exhibit.Set(rootTypes), "type");
    } else {
        items = database.getAllItems();
    }
    this.getBrowseEngine().setRootCollection(items);
};

Exhibit._Impl.prototype.getPermanentLink = function() {
    var state = {};
    
    var engineState = this._engine.getState();
    if (engineState != null) {
        state["browseEngine"] = engineState;
    }
    var browsePanelState = this._browsePanel.getState();
    if (browsePanelState != null) {
        state["browsePanel"] = browsePanelState;
    }
    var viewPanelState = this._viewPanel.getState();
    if (viewPanelState != null) {
        state["viewPanel"] = viewPanelState;
    }
    
    var stateString = this._serializeState(state);
    
    return Exhibit.getURLWithoutQuery() + "?exhibit-state=" + encodeURIComponent(stateString);
};

Exhibit._Impl.prototype.getItemLink = function(itemID) {
    return Exhibit.getURLWithoutQueryAndHash() + "#" + encodeURIComponent(itemID);
};

Exhibit._Impl.prototype.loadData = function(data) {
    this._database.loadData(data, Exhibit.getURLWithoutQueryAndHash());
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
    a.href = this.getItemLink(itemID);
    a.className = "exhibit-item";
    a.innerHTML = label;
    
    var exhibit = this;
    var handler = function(elmt, evt, target) {
        exhibit.showItemInPopup(itemID, elmt);
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

Exhibit._Impl.prototype.showItemInPopup = function(itemID, elmt) {
    var coords = SimileAjax.DOM.getPageCoordinates(elmt);
    var bubble = SimileAjax.Graphics.createBubbleForPoint(
        document, 
        coords.left + Math.round(elmt.offsetWidth / 2), 
        coords.top + Math.round(elmt.offsetHeight / 2), 
        400, // px
        300  // px
    );
    
    var itemLensDiv = document.createElement("div");
    var itemLens = new Exhibit.Lens(itemID, itemLensDiv, this, this._configuration);
    bubble.content.appendChild(itemLensDiv);
};

Exhibit._Impl.prototype.makeCopyButton = function(itemID, layer) {
    var self = this;
    var button = Exhibit.Theme.createCopyButton(itemID == null);
    var handler = function(elmt, evt, target) {
        self._showCopyMenu(elmt, itemID);
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    }
    SimileAjax.WindowManager.registerEvent(
        button, "click", handler, layer != null ? layer : SimileAjax.WindowManager.getHighestLayer());
        
    return button;
};

Exhibit._Impl.prototype.getExporters = function() {
    return this._exporters;
};

Exhibit._Impl.prototype.addExporter = function(exporter) {
    this._exporters.push(exporter);
};

Exhibit._Impl.prototype._tryToFocusOnItem = function() {
    if (this._focusID != null && this._database.containsItem(this._focusID)) {
        var dom = Exhibit.Theme.createFocusDialogBox(this._focusID, this, this._configuration);
        dom.open();
        
        this._focusID = null;
    }
};

Exhibit._Impl.prototype._deserializeState = function(s) {
    return eval(s);
};

Exhibit._Impl.prototype._serializeState = function(state) {
    return Exhibit._anythingToJSON(state);
};

Exhibit._Impl.prototype._showCopyMenu = function(elmt, itemID) {
    var exhibit = this;
    var popupDom = Exhibit.Theme.createPopupMenuDom(elmt);
    
    var makeMenuItem = function(exporter) {
        popupDom.appendMenuItem(
            exporter.getLabel(),
            null,
            function() {
                var text = (itemID) ?
                    exporter.exportOne(itemID, exhibit) :
                    exporter.exportMany(
                        exhibit.getBrowseEngine().getCurrentCollection().getCurrentSet(), exhibit);
                        
                Exhibit.Theme.createCopyDialogBox(text).open();
            }
        );
    }
    
    var exporters = exhibit.getExporters();
    for (var i = 0; i < exporters.length; i++) {
        makeMenuItem(exporters[i]);
    }
    popupDom.open();
};

