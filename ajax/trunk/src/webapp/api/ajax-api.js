/*==================================================
 *  Simile Ajax API
 *
 *  Include this file in your HTML file as follows:
 *
 *    <script src="http://simile.mit.edu/ajax/api/ajax-api.js" type="text/javascript"></script>
 *
 *==================================================
 */

if (typeof SimileAjax == "undefined") {
    var SimileAjax = {
        loaded:     false,
        error:      null
    };
    
    SimileAjax.Platform = new Object();
        /*
            HACK: We need these 2 things here because we cannot simply append
            a <script> element containing code that accesses SimileAjax.Platform
            to initialize it because IE executes that <script> code first
            before it loads ajax.js and platform.js.
        */
        
    SimileAjax.findScript = function(substring) {
        var heads = document.documentElement.getElementsByTagName("head");
        for (var h = 0; h < heads.length; h++) {
            var scripts = heads[h].getElementsByTagName("script");
            for (var s = 0; s < scripts.length; s++) {
                var url = scripts[s].src;
                var i = url.indexOf(substring);
                if (i >= 0) {
                    return url;
                }
            }
        }
        return null;
    };
    SimileAjax.includeJavascriptFile = function(url) {
        document.write("<script src='" + url + "' type='text/javascript'></script>");
    };
    SimileAjax.includeCssFile = function(url) {
        document.write("<link rel='stylesheet' href='" + url + "' type='text/css'/>");
    };
    
    (function() {
        var javascriptFiles = [
            "ajax.js",
            
            "platform.js",
            "debug.js",
            "xmlhttp.js",
            "dom.js",
            "graphics.js"
        ];
        var cssFiles = [
        ];
        
        var url = SimileAjax.findScript("ajax-api.js");
        if (url == null) {
            SimileAjax.error = new Error("Failed to derive URL prefix for Simile Ajax API code files");
            return;
        }
        SimileAjax.urlPrefix = url.substr(0, url.indexOf("ajax-api.js"));
        
        var includeJavascriptFile = function(filename) {
            SimileAjax.includeJavascriptFile(SimileAjax.urlPrefix + "scripts/" + filename);
        };
        var includeCssFile = function(filename) {
            SimileAjax.includeCssFile(SimileAjax.urlPrefix + "styles/" + filename);
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
        
        SimileAjax.loaded = true;
    })();
}
