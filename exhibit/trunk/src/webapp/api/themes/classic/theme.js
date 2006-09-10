/*==================================================
 *  Classic theme
 *==================================================
 */
(function() {
    var javascriptFiles = [
    ];
    var cssFiles = [
    ];

    var urlPrefix = Exhibit.urlPrefix + "themes/classic/";
    SimileAjax.includeJavascriptFiles(document, urlPrefix + "scripts/", javascriptFiles);
    SimileAjax.includeCssFiles(document, urlPrefix + "styles/", cssFiles);
})();
