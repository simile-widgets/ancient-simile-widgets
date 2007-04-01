/*==================================================
 *  Classic theme
 *==================================================
 */
(function() {
    var javascriptFiles = [
        "exhibit-theme.js",
        "lens-theme.js",
        "view-panel-theme.js",
        "ordered-view-frame-theme.js",
        "tile-view-theme.js",
        "thumbnail-view-theme.js",
        "map-view-theme.js",
        "timeline-view-theme.js",
        "tabular-view-theme.js",
        "scatter-plot-view-theme.js",
        "pivot-table-view-theme.js"
    ];
    var cssFiles = [
        "exhibit.css",
        
        "browse-panel.css",
        "facet.css",
        
        "view-panel.css",
        
        "collection-summary-widget.css",
        
        "tile-view.css",
        "map-view.css",
        "timeline-view.css",
        "thumbnail-view.css",
        "tabular-view.css",
        "scatter-plot-view.css",
        "pivot-table-view.css",
        "lens.css"
    ];

    var urlPrefix = Exhibit.urlPrefix + "themes/classic/";
    if (Exhibit.bundle) {
        SimileAjax.includeJavascriptFiles(document, urlPrefix, [ "bundle.js" ]);
        SimileAjax.includeCssFiles(document, urlPrefix, [ "bundle.css" ]);
    } else {
        SimileAjax.includeJavascriptFiles(document, urlPrefix + "scripts/", javascriptFiles);
        SimileAjax.includeCssFiles(document, urlPrefix + "styles/", cssFiles);
    }
})();

