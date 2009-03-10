/*==================================================
 *  Simile Exhibit Freebase Extension
 *==================================================
 */

Exhibit.FreebaseExtension = {
    params: {
        bundle: false
    } 
};

(function() {
    var javascriptFiles = [
        "freebase-importer.js",
        "metaweb.js"
    ];
    var cssFiles = [
    ];
        
    var url = SimileAjax.findScript(document, "/freebase-extension.js");
    if (url == null) {
        SimileAjax.Debug.exception(new Error("Failed to derive URL prefix for Simile Exhibit Freebase Extension code files"));
        return;
    }
    Exhibit.FreebaseExtension.urlPrefix = url.substr(0, url.indexOf("freebase-extension.js"));
        
    var paramTypes = { bundle: Boolean };
    SimileAjax.parseURLParameters(url, Exhibit.FreebaseExtension.params, paramTypes);
        
    var scriptURLs = [];
    var cssURLs = [];
    
    // Bundling and localization are ignored atm
    
    SimileAjax.prefixURLs(scriptURLs    , Exhibit.FreebaseExtension.urlPrefix + "scripts/", javascriptFiles);
    SimileAjax.prefixURLs(cssURLs, Exhibit.FreebaseExtension.urlPrefix + "styles/", cssFiles);
    
    SimileAjax.includeJavascriptFiles(document, "", scriptURLs);
    SimileAjax.includeCssFiles(document, "", cssURLs);
})();