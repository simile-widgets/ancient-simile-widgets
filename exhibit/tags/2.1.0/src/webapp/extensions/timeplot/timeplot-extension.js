/*==================================================
 *  Simile Exhibit Timeplot Extension
 *==================================================
 */

Exhibit.TimeplotExtension = {
    params: {
        bundle: true
    } 
};

(function() {
    var javascriptFiles = [
        "timeplot-view.js"
    ];
    var cssFiles = [
        "timeplot-view.css"
    ];
        
    var url = SimileAjax.findScript(document, "/timeplot-extension.js");
    if (url == null) {
        SimileAjax.Debug.exception(new Error("Failed to derive URL prefix for Simile Exhibit Timeplot Extension code files"));
        return;
    }
    Exhibit.TimeplotExtension.urlPrefix = url.substr(0, url.indexOf("timeplot-extension.js"));
        
    var paramTypes = { bundle: Boolean };
    SimileAjax.parseURLParameters(url, Exhibit.TimeplotExtension.params, paramTypes);
        
    var scriptURLs = [ "http://static.simile.mit.edu/timeplot/api/1.0/timeplot-api.js" ];
    var cssURLs = [];
        
    if (Exhibit.TimeplotExtension.params.bundle) {
        scriptURLs.push(Exhibit.TimeplotExtension.urlPrefix + "timeplot-extension-bundle.js");
        cssURLs.push(Exhibit.TimeplotExtension.urlPrefix + "timeplot-extension-bundle.css");
    } else {
        SimileAjax.prefixURLs(scriptURLs, Exhibit.TimeplotExtension.urlPrefix + "scripts/", javascriptFiles);
        SimileAjax.prefixURLs(cssURLs, Exhibit.TimeplotExtension.urlPrefix + "styles/", cssFiles);
    }
    
    for (var i = 0; i < Exhibit.locales.length; i++) {
        scriptURLs.push(Exhibit.TimeplotExtension.urlPrefix + "locales/" + Exhibit.locales[i] + "/timeplot-locale.js");
    };
    
    SimileAjax.includeJavascriptFiles(document, "", scriptURLs);
    SimileAjax.includeCssFiles(document, "", cssURLs);
})();
