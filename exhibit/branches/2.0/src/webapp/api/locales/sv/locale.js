/*==================================================
 *  Swedish localization
 *==================================================
 */
(function() {
    var javascriptFiles = [
        "exhibit-l10n.js",
        "database-l10n.js",
        "lens-l10n.js",
        "list-facet-l10n.js",
        "view-panel-l10n.js",
        "ordered-view-frame-l10n.js",
        "tile-view-l10n.js",
        "map-view-l10n.js",
        "timeline-view-l10n.js",
        "thumbnail-view-l10n.js",
        "tabular-view-l10n.js"
    ];
    var cssFiles = [
    ];

    var urlPrefix = Exhibit.urlPrefix + "locales/sv/";
    if (Exhibit.params.bundle) {
        SimileAjax.includeJavascriptFiles(document, urlPrefix, [ "bundle.js" ]);
        if (cssFiles.length > 0) {
            SimileAjax.includeCssFiles(document, urlPrefix, [ "bundle.css" ]);
        }
    } else {
        SimileAjax.includeJavascriptFiles(document, urlPrefix + "scripts/", javascriptFiles);
        SimileAjax.includeCssFiles(document, urlPrefix + "styles/", cssFiles);
    }
})();
