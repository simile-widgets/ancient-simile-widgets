/*==================================================
 *  Swedish localization
 *==================================================
 */
(function() {
    var javascriptFiles = [
        "exhibit-l10n-spanish.js",
        "database-l10n-spanish.js",
        "browse-engine-l10n-spanish.js",
        "control-panel-l10n-spanish.js",
        "browse-panel-l10n-spanish.js",
        "lens-l10n-spanish.js",
        "list-facet-l10n-spanish.js",
        "view-panel-l10n-spanish.js",
        "ordered-view-frame-l10n-spanish.js",
        "tile-view-l10n-spanish.js",
        "map-view-l10n-spanish.js",
        "timeline-view-l10n-spanish.js",
        "thumbnail-view-l10n-spanish.js",
        "tabular-view-l10n-spanish.js"
    ];
    var cssFiles = [
    ];

    var urlPrefix = Exhibit.urlPrefix + "locales/sv/";
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
