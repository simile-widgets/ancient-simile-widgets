/*======================================================================
 *  Exhibit.ViewPanel
 *  http://simile.mit.edu/wiki/Exhibit/API/ViewPanel
 *======================================================================
 */
 
Exhibit.ViewPanel = function(exhibit, div, configuration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    
    this._viewConstructors = [];
    this._viewConfigs = [];
    this._viewLabels = [];
    this._viewTooltips = [];
    this._viewDomConfigs = [];
    this._viewIndex = 0;
    
    /*
     *  Construct from configuration
     */
    if ("ViewPanel" in configuration) {
        var c = configuration.ViewPanel;
        if ("views" in c) {
            var views = c.views;
            
            for (var i = 0; i < views.length; i++) {
                var view = views[i];
                
                var constructor = null;
                var label = null;
                var tooltip = null;
                var config = null;
                
                if (typeof view == "function") {
                    constructor = view;
                } else {
                    constructor = view.viewClass;
                    if ("label" in view) {
                        label = view.label;
                    }
                    if ("tooltip" in view) {
                        tooltip = view.tooltip;
                    }
                    if ("configuration" in view) {
                        config = view.configuration;
                    }
                }
                
                if (label == null) {
                    if ("l10n" in constructor && "viewLabel" in constructor.l10n) {
                        label = constructor.l10n.viewLabel;
                    } else {
                        label = "" + constructor;
                    }
                }
                if (tooltip == null) {
                    if ("l10n" in constructor && "viewTooltip" in constructor.l10n) {
                        tooltip = constructor.l10n.viewTooltip;
                    } else {
                        tooltip = label;
                    }
                }
                
                this._viewConstructors.push(constructor);
                this._viewConfigs.push(config != null ? config : {});
                this._viewLabels.push(label);
                this._viewTooltips.push(tooltip);
                this._viewDomConfigs.push(null);
            }
        }
        
        if ("initialView" in c) {
            this._viewIndex = Math.max(0, 
                Math.min(
                    c.initialView, 
                    this._viewConstructors.length - 1
                )
            );
        }
    }
    
    /*
     *  Construct from DOM
     */
    var node = this._div.firstChild;
    while (node != null) {
        if (node.nodeType == 1) {
            node.style.display = "none";
            
            var role = Exhibit.getAttribute(node, "role");
            if (role == "exhibit-view") {
                try {
                    var constructor = eval(Exhibit.getAttribute(node, "viewClass"));
                    if (typeof constructor == "function") {
                        var label = Exhibit.getAttribute(node, "label");
                        var tooltip = Exhibit.getAttribute(node, "title");
                        var config = null;
                        
                        if (label == null) {
                            if ("l10n" in constructor && "viewLabel" in constructor.l10n) {
                                label = constructor.l10n.viewLabel;
                            } else {
                                label = "" + constructor;
                            }
                        }
                        if (tooltip == null) {
                            if ("l10n" in constructor && "viewTooltip" in constructor.l10n) {
                                tooltip = constructor.l10n.viewTooltip;
                            } else {
                                tooltip = label;
                            }
                        }
                        
                        var o = Exhibit.getAttribute(node, "configuration");
                        if (o != null) {
                            try {
                                o = eval(o);
                                if (typeof o == "object") {
                                    config = o;
                                }
                            } catch (e) {
                            }
                        }
                        
                        this._viewConstructors.push(constructor);
                        this._viewConfigs.push(config != null ? config : {});
                        this._viewLabels.push(label);
                        this._viewTooltips.push(tooltip);
                        this._viewDomConfigs.push(node);
                    } else {
                        // TODO: error message
                    }
                } catch (e) {
                    // TODO: error message
                }
            }
        }
        node = node.nextSibling;
    }
    Exhibit.ViewPanel.extractItemViewDomConfiguration(this._div, configuration);
    
    if (this._viewConstructors.length == 0) {
        this._viewConstructors.push(Exhibit.TileView);
        this._viewLabels.push(Exhibit.TileView.l10n.viewLabel);
        this._viewTooltips.push(Exhibit.TileView.l10n.viewTooltip);
    }
    
    this._view = null;
    this._initializeUI();
}

Exhibit.ViewPanel.prototype.getState = function() {
    return null;
};

Exhibit.ViewPanel.prototype.setState = function(state) {
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
        this._exhibit,
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
    
    this._view = new this._viewConstructors[this._viewIndex](
        this._exhibit, 
        viewDiv, 
        this._viewConfigs[this._viewIndex],
        this._viewDomConfigs[this._viewIndex],
        this._configuration
    );
    this._dom.setViewIndex(this._viewIndex);
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

Exhibit.ViewPanel.prototype.resetBrowseQuery = function() {
    var state = {};
    var browseEngine = this._exhibit.getBrowseEngine();
    SimileAjax.History.addAction({
        perform: function() {
            state.restrictions = browseEngine.clearRestrictions();
        },
        undo: function() {
            browseEngine.applyRestrictions(state.restrictions);
        },
        label:      Exhibit.OrderedViewFrame.l10n.resetActionTitle,
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

Exhibit.ViewPanel.extractItemViewDomConfiguration = function(parentNode, configuration) {
    var node = parentNode.firstChild;
    while (node != null) {
        if (node.nodeType == 1) {
            var role = Exhibit.getAttribute(node, "role");
            if (role == "exhibit-lens") {
                var url = Exhibit.getAttribute(node, "templateFile");
                if (url != null && url.length > 0) {
                    configuration["ItemView"] = {
                        viewSelector: function(itemID, exhibit) { return url; }
                    };
                } else {
                    var id = Exhibit.getAttribute(node, "template");
                    var elmt = document.getElementById(id);
                    if (elmt != null) {
                        configuration["ItemView"] = {
                            viewSelector: function(itemID, exhibit) { return elmt; }
                        };
                    } else {
                        configuration["ItemView"] = {
                            viewSelector: function(itemID, exhibit) { return node; }
                        };
                    }
                }
                break;
            }
        }
        node = node.nextSibling;
    }
};
