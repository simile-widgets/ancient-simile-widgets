/*==================================================
 *  Simile Exhibit Curate Extension
 *==================================================
 */

Exhibit.CurateExtension = {
    params: {
        bundle: false
    } 
};

(function() {
    var javascriptFiles = [
        "edit-view.js",
        "curate-view.js"
    ];
    var cssFiles = [
        "edit-view.css"
    ];
        
    var url = SimileAjax.findScript(document, "/curate-extension.js");
    if (url == null) {
        SimileAjax.Debug.exception(new Error("Failed to derive URL prefix for Simile Exhibit Curate Extension code files"));
        return;
    }
    Exhibit.CurateExtension.urlPrefix = url.substr(0, url.indexOf("curate-extension.js"));
        
    var paramTypes = { bundle: Boolean };
    SimileAjax.parseURLParameters(url, Exhibit.CurateExtension.params, paramTypes);
        
    var scriptURLs = [];
    var cssURLs = [];
    
    // Bundling and localization are ignored atm
    
    SimileAjax.prefixURLs(scriptURLs, Exhibit.CurateExtension.urlPrefix + "scripts/", javascriptFiles);
    SimileAjax.prefixURLs(cssURLs, Exhibit.CurateExtension.urlPrefix + "styles/", cssFiles);
    
    SimileAjax.includeJavascriptFiles(document, "", scriptURLs);
    SimileAjax.includeCssFiles(document, "", cssURLs);
})();