/*==================================================
 *  Classic theme
 *==================================================
 */
(function() {
    var javascriptFiles = [
        "list-facet.js",
        "ordered-view-frame.js",
        "tile-view.js"
    ];
    var cssFiles = [
        "exhibit.css",
        
        "browse-panel.css",
        "list-facet.css",
        
        "view-panel.css",
        "tile-view.css",
        "item-view.css"
    ];

    var urlPrefix = Exhibit.urlPrefix + "themes/classic/";
    SimileAjax.includeJavascriptFiles(document, urlPrefix + "scripts/", javascriptFiles);
    SimileAjax.includeCssFiles(document, urlPrefix + "styles/", cssFiles);
})();

Exhibit.Theme = {
    urlPrefix:  Exhibit.urlPrefix + "themes/classic/",
    createTranslucentImage: function(doc, url) {
        return SimileAjax.Graphics.createTranslucentImage(
            doc, Exhibit.Theme.urlPrefix + url
        );
    }
};