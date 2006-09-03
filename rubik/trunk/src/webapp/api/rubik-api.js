/*==================================================
 *  Simile Rubik API
 *
 *  Include Rubik in your HTML file as follows:
 *    <script src="http://simile.mit.edu/ajax/api/ajax-api.js" type="text/javascript"></script>
 *    <script src="http://simile.mit.edu/rubik/api/rubik-api.js" type="text/javascript"></script>
 *
 *  You do need to include the Simile Ajax API 
 *  BEFORE you include Rubik.
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
            "browse-engine.js",
            
            "browse-panel.js",
            "facets/list-facet.js",
            
            "view-panel.js",
//            "views/tabular-view.js",
            "views/tile-view.js",
            "views/item-view.js"
        ];
        var cssFiles = [
            "rubik.css",
            
            "browse-panel.css",
            "facets/list-facet.css",
            
            "view-panel.css",
//            "views/tabular-view.css",
            "views/tile-view.css",
            "views/item-view.css"
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
