/*======================================================================
 *  Exhibit
 *  http://simile.mit.edu/wiki/Exhibit/API/Exhibit
 *======================================================================
 */
 
Exhibit.create = function(database) {
    return new Exhibit._Impl(database);
};

Exhibit.getAttribute = function(elmt, name, splitOn) {
    try {
        var value = elmt.getAttribute(name);
        if (value == null) {
            value = elmt.getAttribute("ex:" + name);
        }
        if (splitOn == null) {
            return value;
        }
        var values = value.split(splitOn);
        for (var i = 0; value = values[i]; i++) {
            values[i] = value.trim();
        }
        return values;
    } catch(e) { 
        return null;
    }
};

Exhibit.getConfigurationFromDOM = function(elmt) {
    var c = Exhibit.getAttribute(elmt, "configuration");
    if (c != null && c.length > 0) {
        try{
            var o = eval(c);
            if (typeof o == "object") {
                return o;
            }
        } catch (e) {}
    }
    return {};
};

Exhibit.getExporters = function() {
    Exhibit._initializeExporters();
    return [].concat(Exhibit._exporters);
};

Exhibit.addExporters = function(exporter) {
    Exhibit._initializeExporters();
    Exhibit._exporters.push(exporter);
};

Exhibit._initializeExporters = function() {
    if (!("_exporters" in Exhibit)) {
        Exhibit._exporters = [
            Exhibit.RdfXmlExporter,
            Exhibit.SemanticWikitextExporter,
            Exhibit.TSVExporter,
            Exhibit.ExhibitJsonExporter
        ];
    }
};

/*==================================================
 *  Exhibit._Impl
 *==================================================
 */
Exhibit._Impl = function(database) {
    this._database = database != null ? 
        database : 
        ("database" in window ?
            window.database :
            Exhibit.Database.create());
            
    this._uiContext = Exhibit.UIContext.createRootContext({}, this);
    this._collectionMap = {};
    this._componentMap= {};
    
    var self = this;
    this._focusID = null;
    this._databaseListener = {
        onAfterLoadingItems : function() {
            //self._tryToFocusOnItem(); // FIXME: Not implemented.
        }
    };
    this._database.addListener(this._databaseListener);
    
    this._historyListener = {
        onBeforePerform:        function(action) { if(action.lengthy) { Exhibit.UI.showBusyIndicator();} },
        onAfterPerform:         function(action) { if(action.lengthy) { Exhibit.UI.hideBusyIndicator();} },
        onBeforeUndoSeveral:    function() { Exhibit.UI.showBusyIndicator();},
        onAfterUndoSeveral:     function() { Exhibit.UI.hideBusyIndicator();},
        onBeforeRedoSeveral:    function() { Exhibit.UI.showBusyIndicator();},
        onAfterRedoSeveral:     function() { Exhibit.UI.hideBusyIndicator();}
    };
    SimileAjax.History.addListener(this._historyListener);
    
    var hash = document.location.hash;
    if (hash.length > 1) {
        this._focusID = decodeURIComponent(hash.substr(1));
    }
};

Exhibit._Impl.prototype.dispose = function() {
    SimileAjax.History.removeListener(this._historyListener);
    this._database.removeListener(this._databaseListener);
    
    for (var id in this._componentMap) {
        try{
            this._componentMap[id].dispose();
        }catch(e) {
            SimileAjax.Debug.exception("Failed to dispose component", e);
        }
    }
    for (var id in this._collectionMap) {
        try{
            this._collectionMap[id].dispose();
        } catch(e) {
            SimileAjax.Debug.exception("Failed to dispose collection", e);
        }
    }
    
    this._uiContext.dispose();
    
    this._componentMap = null;
    this._collectionMap = null;
    this._uiContext = null;
    this._database = null;
};

Exhibit._Impl.prototype.getDatabase = function() {
    return this._database;
};

Exhibit._Impl.prototype.getUIContext = function() {
    return this._uiContext;
};

Exhibit._Impl.prototype.getCollection = function(id) {
    var collection = this._collectionMap[id];
    if (collection == null && id == "default") {
        collection = Exhibit.Collection.createAllItemsCollection(id, this._database);
        this.setDefaultCollection(collection);
    }
    return collection;
};

Exhibit._Impl.prototype.getDefaultCollection = function() {
    return this.getCollection("default");
};

Exhibit._Impl.prototype.setCollection = function(id, c) {
    if (id in this._collectionMap) {
        try{
            this._collectionMap[id].dispose();
        } catch(e) {
            SimileAjax.Debug.exception(e);
        }
    }
    this._collectionMap[id] = c;
};

Exhibit._Impl.prototype.setDefaultCollection = function(c) {
    this.setCollection("default", c);
};

Exhibit._Impl.prototype.getComponent = function(id) {
    return this._componentMap[id];
};

Exhibit._Impl.prototype.setComponent = function(id, c) {
    if (id in this._componentMap) {
        try{
            this._componentMap[id].dispose();
        } catch(e) {
            SimileAjax.Debug.exception(e);
        }
    }
    
    this._componentMap[id] = c;
};

Exhibit._Impl.prototype.configure = function(configuration) {
    if ("collections" in configuration) {
        for (var i = 0; i < configuration.collections.length; i++) {
            var config = configuration.collections[i];
            var id = config.id;
            if (id == null || id.length == 0) {
                id = "default";
            }
            this.setCollection(id, Exhibit.Collection.create(id, config, this.getDatabase()));
        }
    }
    if ("components" in configuration) {
        for (var i = 0; i < configuration.components.length; i++) {
            var config = configuration.components[i];
            var component = Exhibit.Component.create(config, this._uiContext);
            if (component != null) {
                var id = elmt.id;
                if (id == null || id.length == 0) {
                    id = "component" + Math.floor(Math.random() * 1000000);
                }
                this.setComponent(id, component);
            }
        }
    }
};

Exhibit._Impl.prototype.configureFromDOM = function() {
    var collectionElmts = [];
    var componentElmts = [];
    var f = function(elmt) {
        var role = Exhibit.getAttribute(elmt, "role");
        if (role != null && role.length > 0) {
            if (role == "exhibit-collection") {
                collectionElmts.push(elmt);
            } else {
                componentElmts.push(elmt);
            }
        } else {
            var node = elmt.firstChild;
            while (node != null) {
                if (node.nodeType == 1) {
                    f(node);
                }
                node=node.nextSibling;
            }
        }
    };
    f(document.body);
    
    for (var i = 0; i < collectionElmts.length; i++) {
        var elmt = collectionElmts[i];
        var id = elmt.id;
        if (id==null || id.length == 0) {
            id = "default";
        }
        this.setCollection(id, Exhibit.Collection.createFromDOM(id, elmt, this.getDatabase()));
    }
    
    for (var i = 0; i < componentElmts.length; i++) {
        var elmt = componentElmts[i];
        var component = Exhibit.Component.createFromDOM(elmt, this._uiContext);
        if (component != null) {
            var id = elmt.id;
            if (id == null || id.length == 0) {
                id = "component" + Math.floor(Math.random() * 1000000);
            }
            this.setComponent(id, component);
        }
    }
};
