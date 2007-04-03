/*==================================================
 *  Classic theme
 *==================================================
 */
(function() {
    var javascriptFiles = [
        "exhibit-theme.js",
        "lens-theme.js",
        
        "views/view-panel-theme.js",
        "views/ordered-view-frame-theme.js",
        "views/tile-view-theme.js",
        "views/thumbnail-view-theme.js",
        "views/timeline-view-theme.js",
        "views/tabular-view-theme.js",
        "views/pivot-table-view-theme.js"
    ];
    var cssFiles = [
        "exhibit.css",
        "browse-panel.css",
        "lens.css",
        
        "util/facets.css",
        "util/views.css",
        
        "widgets/collection-summary-widget.css",
        "widgets/resizable-div-widget.css",
        "widgets/legend-widget.css",
        
        "views/view-panel.css",
        "views/tile-view.css",
        "views/map-view.css",
        "views/timeline-view.css",
        "views/thumbnail-view.css",
        "views/tabular-view.css",
        "views/scatter-plot-view.css",
        "views/pivot-table-view.css"
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

