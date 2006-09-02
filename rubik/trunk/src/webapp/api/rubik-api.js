/*==================================================
 *  Simile Rubik API
 *
 *  Include this file in your HTML file as follows:
 *    <script src="http://simile.mit.edu/rubik/api/rubik-api.js" type="text/javascript"></script>
 *
 *  You should also include the Simile Ajax API 
 *  BEFORE you include Rubik:
 *    <script src="http://simile.mit.edu/ajax/api/ajax-api.js" type="text/javascript"></script>
 *
 *==================================================
 */

if (typeof Rubik == "undefined") {
    var Rubik = {
        loaded: false
    };
    
    (function() {
        var javascriptFiles = [
            "rubik.js",
            "util/set.js",
            
            "database.js",
            "query-engine.js",
            "browser.js"
        ];
        var cssFiles = [
            "browser.css",
            "data.css"
        ];
        
        var url = SimileAjax.findScript(document, "rubik-api.js");
        if (url == null) {
            Rubik.error = new Error("Failed to derive URL prefix for Simile Rubik API code files");
            return;
        }
        Rubik.urlPrefix = url.substr(0, url.indexOf("rubik-api.js"));
        
        var includeJavascriptFile = function(filename) {
            SimileAjax.includeJavascriptFile(document, Rubik.urlPrefix + "scripts/" + filename);
        };
        var includeCssFile = function(filename) {
            SimileAjax.includeCssFile(document, Rubik.urlPrefix + "styles/" + filename);
        }
        
        /*
         *  Include non-localized files
         */
        for (var i = 0; i < javascriptFiles.length; i++) {
            includeJavascriptFile(javascriptFiles[i]);
        }
        for (var i = 0; i < cssFiles.length; i++) {
            includeCssFile(cssFiles[i]);
        }
        
        Rubik.loaded = true;
    })();
}
