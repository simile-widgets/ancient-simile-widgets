/*==================================================
 *  English localization 
 *  (also base and default localization)
 *==================================================
 */
(function() {
    var javascriptFiles = [
        "exhibit.js",
        "database.js",
        "list-facet.js",
        "view-panel.js",
        "ordered-view-frame.js",
        "tile-view.js",
        "map-view.js"
    ];
    var cssFiles = [
    ];

    var urlPrefix = Exhibit.urlPrefix + "locales/en/";
    SimileAjax.includeJavascriptFiles(document, urlPrefix + "scripts/", javascriptFiles);
    SimileAjax.includeCssFiles(document, urlPrefix + "styles/", cssFiles);
})();
