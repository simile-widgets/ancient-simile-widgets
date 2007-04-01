/*======================================================================
 *  Exhibit.ViewPanel
 *  http://simile.mit.edu/wiki/Exhibit/API/ViewPanel
 *======================================================================
 */
Exhibit.ViewPanel = function(div, uiContext) {
    this._uiContext = uiContext;
    this._div = div;
    
    this._viewConstructors = [];
    this._viewConfigs = [];
    this._viewLabels = [];
    this._viewTooltips = [];
    this._viewDomConfigs = [];
    
    this._viewIndex = 0;
    this._view = null;
}

Exhibit.ViewPanel.create = function(configuration, div, uiContext) {
    var viewPanel = new Exhibit.ViewPanel(div, uiContext);
    
    if ("views" in configuration) {
        for (var i = 0; i < configuration.views.length; i++) {
            var viewConfig = configuration.views[i];
            
            var viewClass = ("viewClass" in view) ? view.viewClass : Exhibit.TileView;
            
            var label = null;
            if ("label" in viewConfig) {
                label = viewConfig.label;
            } else if ("l10n" in viewClass && "viewLabel" in viewClass.l10n) {
                label = viewClass.l10n.viewLabel;
            } else {
                label = "" + viewClass;
            }
            
            var tooltip = null;
            if ("tooltip" in viewConfig) {
                tooltip = viewConfig.tooltip;
            } else if ("l10n" in viewClass && "viewTooltip" in viewClass.l10n) {
                tooltip = viewClass.l10n.viewTooltip;
            } else {
                tooltip = label;
            }
                
            viewPanel._viewConstructors.push(viewClass);
            viewPanel._viewConfigs.push(viewConfig);
            viewPanel._viewLabels.push(label);
            viewPanel._viewTooltips.push(tooltip);
            viewPanel._viewDomConfigs.push(null);
        }
    }
    
    if ("initialView" in configuration) {
        viewPanel._viewIndex = configuration.initialView;
    }
    
    viewPanel._internalValidate();
    viewPanel._initializeUI();
    
    return viewPanel;
};

Exhibit.ViewPanel.createFromDOM = function(div, uiContext) {
    var viewPanel = new Exhibit.ViewPanel(div, uiContext);
    
    var node = div.firstChild;
    while (node != null) {
        if (node.nodeType == 1) {
            node.style.display = "none";
            
            var role = Exhibit.getRoleAttribute(node);
            if (role == "view") {
                var viewClass = Exhibit.TileView;
                
                var viewClassString = Exhibit.getAttribute(node, "viewClass");
                if (viewClassString != null && viewClassString.length > 0) {
                    viewClass = Exhibit.UI.viewClassNameToViewClass(viewClassString);
                    if (viewClass == null) {
                        SimileAjax.Debug.warn("Unknown viewClass " + viewClassString);
                    }
                }
                
                var label = Exhibit.getAttribute(node, "label");
                var tooltip = Exhibit.getAttribute(node, "title");
                
                if (label == null) {
                    if ("viewLabel" in viewClass.l10n) {
                        label = viewClass.l10n.viewLabel;
                    } else {
                        label = "" + viewClass;
                    }
                }
                if (tooltip == null) {
                    if ("l10n" in viewClass && "viewTooltip" in viewClass.l10n) {
                        tooltip = viewClass.l10n.viewTooltip;
                    } else {
                        tooltip = label;
                    }
                }
                
                viewPanel._viewConstructors.push(viewClass);
                viewPanel._viewConfigs.push(null);
                viewPanel._viewLabels.push(label);
                viewPanel._viewTooltips.push(tooltip);
                viewPanel._viewDomConfigs.push(node);
            }
        }
        node = node.nextSibling;
    }
    Exhibit.UIContext.registerLensesFromDOM(div, viewPanel._uiContext.getLensRegistry());
    
    var initialView = Exhibit.getAttribute(div, "initialView");
    if (initialView != null) {
        try {
            viewPanel._viewIndex = parseInt(initialView);
        } catch (e) {
        }
        
    }
    
    viewPanel._internalValidate();
    viewPanel._initializeUI();
    
    return viewPanel;
};

Exhibit.ViewPanel.prototype.dispose = function() {
    if (this._view != null) {
        this._view.dispose();
        this._view = null;
    }
    
    this._div.innerHTML = "";
    
    this._uiContext.dispose();
    this._uiContext = null;
    this._div = null;
};

Exhibit.ViewPanel.prototype._internalValidate = function() {
    if (this._viewConstructors.length == 0) {
        this._viewConstructors.push(Exhibit.TileView);
        this._viewConfigs.push({});
        this._viewLabels.push(Exhibit.TileView.l10n.viewLabel);
        this._viewTooltips.push(Exhibit.TileView.l10n.viewTooltip);
        this._viewDomConfigs.push(null);
    }
    
    this._viewIndex = 
        Math.max(0, Math.min(this._viewIndex, this._viewConstructors.length - 1));
};

Exhibit.ViewPanel.prototype._initializeUI = function() {
    var div = document.createElement("div");
    if (this._div.firstChild != null) {
        this._div.insertBefore(div, this._div.firstChild);
    } else {
        this._div.appendChild(div);
    }
    
    var self = this;
    this._dom = Exhibit.ViewPanel.theme.constructDom(
        this._div.firstChild,
        this._viewLabels,
        this._viewTooltips,
        function(index) {
            self._selectView(index);
        }
    );
    
    this._createView();
};

Exhibit.ViewPanel.prototype._createView = function() {
    if (this._view) {
        this._view.dispose();
    }
    
    var viewContainer = this._dom.getViewContainer();
    viewContainer.innerHTML = "";
    
    var viewDiv = document.createElement("div");
    viewContainer.appendChild(viewDiv);
    
    var index = this._viewIndex;
    if (this._viewDomConfigs[index] != null) {
        this._view = this._viewConstructors[index].createFromDOM(
            this._viewDomConfigs[index],
            viewContainer, 
            this._uiContext
        );
    } else {
        this._view = this._viewConstructors[index].create(
            this._viewConfigs[index],
            viewContainer, 
            this._uiContext
        );
    }
    this._dom.setViewIndex(index);
};

Exhibit.ViewPanel.prototype._selectView = function(newIndex) {
    var oldIndex = this._viewIndex;
    var self = this;
    SimileAjax.History.addAction({
        perform: function() {
            self._viewIndex = newIndex;
            self._createView();
        },
        undo: function() {
            self._viewIndex = oldIndex;
            self._createView();
        },
        label:      Exhibit.ViewPanel.l10n.createSelectViewActionTitle(self._viewLabels[newIndex]),
        uiLayer:    SimileAjax.WindowManager.getBaseLayer(),
        lengthy:    true
    });
};

Exhibit.ViewPanel.getPropertyValuesPairs = function(itemID, propertyEntries, database) {
    var pairs = [];
    var enterPair = function(propertyID, forward) {
        var property = database.getProperty(propertyID);
        var values = forward ? 
            database.getObjects(itemID, propertyID) :
            database.getSubjects(itemID, propertyID);
        var count = values.size();
        
        if (count > 0) {
            var itemValues = property.getValueType() == "item";
            var pair = { 
                propertyLabel:
                    forward ?
                        (count > 1 ? property.getPluralLabel() : property.getLabel()) :
                        (count > 1 ? property.getReversePluralLabel() : property.getReverseLabel()),
                valueType:  property.getValueType(),
                values:     []
            };
            
            if (itemValues) {
                values.visit(function(value) {
                    var label = database.getObject(value, "label");
                    pair.values.push(label != null ? label : value);
                });
            } else {
                values.visit(function(value) {
                    pair.values.push(value);
                });
            }
            pairs.push(pair);
        }
    };
    
    for (var i = 0; i < propertyEntries.length; i++) {
        var entry = propertyEntries[i];
        if (typeof entry == "string") {
            enterPair(entry, true);
        } else {
            enterPair(entry.property, entry.forward);
        }
    }
    return pairs;
};

Exhibit.ViewPanel.makeCopyAllButton = function(collection, database, generatedContentElmtRetriever, layer) {
    var button = Exhibit.Theme.createCopyButton(true);
    var handler = function(elmt, evt, target) {
        Exhibit.ViewPanel._showCopyMenu(elmt, collection, database, generatedContentElmtRetriever);
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    }
    SimileAjax.WindowManager.registerEvent(
        button, "click", handler, layer != null ? layer : SimileAjax.WindowManager.getHighestLayer());
        
    return button;
};

Exhibit.ViewPanel._showCopyMenu = function(elmt, collection, database, generatedContentElmtRetriever) {
    var popupDom = Exhibit.Theme.createPopupMenuDom(elmt);
    
    var makeMenuItem = function(exporter) {
        popupDom.appendMenuItem(
            exporter.getLabel(),
            null,
            function() {
                var text = exporter.exportMany(collection.getRestrictedItems(), database);
                Exhibit.Theme.createCopyDialogBox(text).open();
            }
        );
    }
    
    var exporters = Exhibit.getExporters();
    for (var i = 0; i < exporters.length; i++) {
        makeMenuItem(exporters[i]);
    }
    
    if (generatedContentElmtRetriever != null) {
        popupDom.appendMenuItem(
            Exhibit.l10n.htmlExporterLabel,
            null,
            function() {
                Exhibit.Theme.createCopyDialogBox(
                    generatedContentElmtRetriever().innerHTML
                        //.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\&/g, "&amp;")
                ).open();
            }
        );
    }
    
    popupDom.open();
};

