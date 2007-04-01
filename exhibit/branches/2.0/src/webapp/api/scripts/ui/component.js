/*======================================================================
 *  Component
 *======================================================================
 */
Exhibit.Component = {};

Exhibit.Component.create = function(configuration, elmt, uiContext) {
    var role = configuration.role;
    if (role == "exhibit-lens") {
        Exhibit.UIContext.registerLens(configuration, uiContext.getLensRegistry());
        return null;
    } else if (role == "exhibit-view") {
        return Exhibit.Component.createView(configuration, elmt, uiContext);
    } else if (role == "exhibit-facet") {
        return Exhibit.Component.createFacet(configuration, elmt, uiContext);
    } else if (role == "exhibit-viewPanel") {
        return Exhibit.ViewPanel.create(configuration, elmt, uiContext);
    } else if (role == "exhibit-logo") {
        return Exhibit.Logo.create(configuration, elmt, uiContext);
    } else if (role == "exhibit-hiddenContent") {
        elmt.style.display = "none";
        return null;
    } else {
        return null;
    }
};

Exhibit.Component.createFromDOM = function(elmt, uiContext) {
    var role = Exhibit.getAttribute(elmt, "role");
    if (role == "exhibit-lens") {
        Exhibit.UIContext.registerLensFromDOM(elmt, uiContext.getLensRegistry());
        return null;
    } else if (role == "exhibit-view") {
        return Exhibit.Component.createViewFromDOM(elmt, null, uiContext);
    } else if (role == "exhibit-facet") {
        return Exhibit.Component.createFacetFromDOM(elmt, null, uiContext);
    } else if (role == "exhibit-viewPanel") {
        return Exhibit.ViewPanel.createFromDOM(elmt, uiContext);
    } else if (role == "exhibit-logo") {
        return Exhibit.Logo.createFromDOM(elmt, uiContext);
    } else if (role == "exhibit-hiddenContent") {
        elmt.style.display = "none";
        return null;
    } else {
        return null;
    }
};

Exhibit.Component.createView = function(configuration, elmt, uiContext) {
    var viewClass = "viewClass" in configuration ? configuration.viewClass : Exhibit.TileView;
    return viewClass.create(configuration, elmt, uiContext);
};

Exhibit.Component.createViewFromDOM = function(elmt, container, uiContext) {
    var viewClassString = Exhibit.getAttribute(elmt, "viewClass");
    var viewClass = null;
    try {
        viewClass = eval(viewClassString);
    } catch (e) {
        viewClass = Exhibit.TileView;
    }
    
    return viewClass.createFromDOM(elmt, container, uiContext);
};

Exhibit.Component.createFacet = function(configuration, elmt, uiContext) {
    var facetClass = "facetClass" in configuration ? configuration.facetClass : Exhibit.ListFacet;
    return facetClass.create(configuration, elmt, container, uiContext);
};

Exhibit.Component.createFacetFromDOM = function(elmt, container, uiContext) {
    var facetClassString = Exhibit.getAttribute(elmt, "facetClass");
    var facetClass = Exhibit.ListFacet;
    if (facetClassString != null && facetClassString.length > 0) {
        facetClass = eval(facetClassString);
    }
    
    return facetClass.createFromDOM(elmt, container, uiContext);
};

