/*==================================================
 *  Exhibit.ViewPanel
 *==================================================
 */
 
Exhibit.ViewPanel = function(exhibit, div, configuration) {
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    
    this._viewConstructors = [];
    this._viewConfigs = [];
    this._viewLabels = [];
    this._viewTooltips = [];
    this._viewIndex = 0;
    
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
                    constructor = view.constructor;
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
    
    if (this._viewConstructors.length == 0) {
        this._viewConstructors.push(Exhibit.TileView);
        this._viewLabels.push(Exhibit.TileView.l10n.viewLabel);
        this._viewTooltips.push(Exhibit.TileView.l10n.viewTooltip);
    }
    
    this._view = null;
    this._initializeUI();
}

Exhibit.ViewPanel.prototype._initializeUI = function() {
    this._div.innerHTML = "";
    
    var self = this;
    this._dom = Exhibit.ViewPanel.theme.constructDom(
        this._exhibit,
        this._div,
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
        this._configuration
    );
    this._dom.setViewIndex(this._viewIndex);
};

Exhibit.ViewPanel.prototype._selectView = function(index) {
    this._viewIndex = index;
    this._createView();
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
                    var label = database.getLiteralProperty(value, "label");
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

