/*==================================================
 *  English localization 
 *  (also base and default localization)
 *==================================================
 */
(function() {
    var javascriptFiles = [
        "exhibit-l10n.js",
        "database-l10n.js",
        "ui-context-l10n.js",
        
        "lens-l10n.js",
        
        "collection-summary-widget-l10n.js",
        
        "view-panel-l10n.js",
        "ordered-view-frame-l10n.js",
        "tile-view-l10n.js",
        "thumbnail-view-l10n.js",
        "map-view-l10n.js",
        "timeline-view-l10n.js",
        "tabular-view-l10n.js",
        "scatter-plot-view-l10n.js",
        "pivot-table-view-l10n.js",
        
        "list-facet-l10n.js",
        "numeric-range-facet-l10n.js"
    ];
    var cssFiles = [
    ];

    var urlPrefix = Exhibit.urlPrefix + "locales/en/";
    if (Exhibit.bundle) {
        SimileAjax.includeJavascriptFiles(document, urlPrefix, [ "bundle.js" ]);
        if (cssFiles.length > 0) {
            SimileAjax.includeCssFiles(document, urlPrefix, [ "bundle.css" ]);
        }
    } else {
        SimileAjax.includeJavascriptFiles(document, urlPrefix + "scripts/", javascriptFiles);
        SimileAjax.includeCssFiles(document, urlPrefix + "styles/", cssFiles);
    }
})();
