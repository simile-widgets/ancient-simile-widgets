/*======================================================================
 *  Component
 *======================================================================
 */
Exhibit.Component = {};

Exhibit.Component.create = function(configuration, elmt, exhibit) {
    var role = configuration.role;
    if (role == "exhibit-lens") {
        Exhibit.Component.registerLens(configuration, exhibit.getLensRegistry());
        return null;
    } else if (role == "exhibit-view") {
        return Exhibit.Component.createView(configuration, elmt, exhibit.getLensRegistry(), exhibit);
    } else if (role == "exhibit-facet") {
        return Exhibit.Component.createFacet(configuration, elmt, exhibit);
    } else if (role == "exhibit-viewPanel") {
        return Exhibit.ViewPanel.create(configuration, elmt, exhibit);
    } else if (role == "exhibit-logo") {
        return Exhibit.Logo.create(configuration, elmt, exhibit);
    } else if (role == "exhibit-hiddenContent") {
        elmt.style.display = "none";
        return null;
    } else {
        return null;
    }
};

Exhibit.Component.createFromDOM = function(elmt, exhibit) {
    var role = Exhibit.getAttribute(elmt, "role");
    if (role == "exhibit-lens") {
        Exhibit.Component.registerLensFromDOM(elmt, exhibit.getLensRegistry());
        return null;
    } else if (role == "exhibit-view") {
        return Exhibit.Component.createViewFromDOM(elmt, null, exhibit.getLensRegistry(), exhibit);
    } else if (role == "exhibit-facet") {
        return Exhibit.Component.createFacetFromDOM(elmt, null, exhibit);
    } else if (role == "exhibit-viewPanel") {
        return Exhibit.ViewPanel.createFromDOM(elmt, exhibit);
    } else if (role == "exhibit-logo") {
        return Exhibit.Logo.createFromDOM(elmt, exhibit);
    } else if (role == "exhibit-hiddenContent") {
        elmt.style.display = "none";
        return null;
    } else {
        return null;
    }
};

Exhibit.Component.createView = function(configuration, elmt, lensRegistry, exhibit) {
    var viewClass = "viewClass" in configuration ? configuration.viewClass : Exhibit.TileView;
    return viewClass.create(configuration, elmt, lensRegistry, exhibit);
};

Exhibit.Component.createViewFromDOM = function(elmt, container, lensRegistry, exhibit) {
    var viewClassString = Exhibit.getAttribute(elmt, "viewClass");
    var viewClass = null;
    try {
        viewClass = eval(viewClassString);
    } catch (e) {
        viewClass = Exhibit.TileView;
    }
    
    return viewClass.createFromDOM(elmt, container, lensRegistry, exhibit);
};

Exhibit.Component.createFacet = function(configuration, elmt, exhibit) {
    var facetClass = "facetClass" in configuration ? configuration.facetClass : Exhibit.ListFacet;
    return facetClass.create(configuration, elmt, container, exhibit);
};

Exhibit.Component.createFacetFromDOM = function(elmt, container, exhibit) {
    var facetClassString = Exhibit.getAttribute(elmt, "facetClass");
    var facetClass = Exhibit.ListFacet;
    if (facetClassString != null && facetClassString.length > 0) {
        facetClass = eval(facetClassString);
    }
    
    return facetClass.createFromDOM(elmt, container, exhibit);
};

Exhibit.Component.registerLens = function(configuration, lensRegistry) {
    var template = configuration.templateFile;
    if (template != null) {
        if ("itemTypes" in configuration) {
            for (var i = 0; i < configuration.itemTypes.length; i++) {
                lensRegistry.registerLensForType(template, configuration.itemTypes[i]);
            }
        } else {
            lensRegistry.registerDefaultLens(template);
        }
    }
};

Exhibit.Component.registerLensFromDOM = function(elmt, lensRegistry) {
    var itemTypes = Exhibit.getAttribute(elmt, "itemTypes");
    var template = null;
    
    var url = Exhibit.getAttribute(elmt, "templateFile");
    if (url != null && url.length > 0) {
        template = url;
    } else {
        var id = Exhibit.getAttribute(elmt, "template");
        var elmt2 = document.getElementById(id);
        if (elmt2 != null) {
            template = elmt2;
        } else {
            template = elmt;
        }
    }
    
    if (template != null) {
        if (itemTypes == null) {
            lensRegistry.registerDefaultLens(template);
        } else {
            itemTypes = itemTypes.split(",");
            for (var i = 0; i < itemTypes.length; i++) {
                lensRegistry.registerLensForType(template, itemTypes[i].trim());
            }
        }
    }
};

Exhibit.Component.registerLenses = function(configuration, lensRegistry) {
    if ("lenses" in configuration) {
        for (var i = 0; i < configuration.lenses.length; i++) {
            Exhibit.Component.registerLens(configuration.lenses[i], lensRegistry);
        }
    }
    if ("lensSelector" in configuration) {
        var lensSelector = configuration.lensSelector;
        if (typeof lensSelector == "function") {
            lensRegistry.addLensSelector(lensSelector);
        } else {
            SimileAjax.Debug.log("lensSelector is not a function");
        }
    }
};

Exhibit.Component.registerLensesFromDOM = function(parentNode, lensRegistry) {
    var node = parentNode.firstChild;
    while (node != null) {
        if (node.nodeType == 1) {
            var role = Exhibit.getAttribute(node, "role");
            if (role == "exhibit-lens") {
                Exhibit.Component.registerLensFromDOM(node, lensRegistry);
            }
        }
        node = node.nextSibling;
    }
    
    var lensSelectorString = Exhibit.getAttribute(parentNode, "lensSelector");
    if (lensSelectorString != null && lensSelectorString.length > 0) {
        try {
            var lensSelector = eval(lensSelectorString);
            if (typeof lensSelector == "function") {
                lensRegistry.addLensSelector(lensSelector);
            } else {
                SimileAjax.Debug.log("lensSelector expression " + lensSelectorString + " is not a function");
            }
        } catch (e) {
            SimileAjax.Debug.exception("Bad lensSelector expression: " + lensSelectorString, e);
        }
    }
};

Exhibit.Component.createLensRegistry = function(configuration, parentLensRegistry) {
    var lensRegistry = new Exhibit.LensRegistry(parentLensRegistry);
    Exhibit.Component.registerLenses(configuration, lensRegistry);
    
    return lensRegistry;
};

Exhibit.Component.createLensRegistryFromDOM = function(parentNode, configuration, parentLensRegistry) {
    var lensRegistry = new Exhibit.LensRegistry(parentLensRegistry);
    Exhibit.Component.registerLensesFromDOM(parentNode, lensRegistry);
    Exhibit.Component.registerLenses(configuration, lensRegistry);
    
    return lensRegistry;
};
