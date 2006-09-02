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
        
    SimileAjax.findScript = function(doc, substring) {
        var heads = doc.documentElement.getElementsByTagName("head");
        for (var h = 0; h < heads.length; h++) {
            var node = heads[h].firstChild;
            while (node != null) {
                if (node.nodeType == 1 && node.tagName.toLowerCase() == "script") {
                    var url = node.src;
                    var i = url.indexOf(substring);
                    if (i >= 0) {
                        return url;
                    }
                }
                node = node.nextSibling;
            }
        }
        return null;
    };
    SimileAjax.includeJavascriptFile = function(doc, url) {
        doc.write("<script src='" + url + "' type='text/javascript'></script>");
    };
    SimileAjax.includeCssFile = function(doc, url) {
        doc.write("<link rel='stylesheet' href='" + url + "' type='text/css'/>");
    };
    
    (function() {
        var javascriptFiles = [
            "platform.js",
            "debug.js",
            "xmlhttp.js",
            "json.js",
            "dom.js",
            "graphics.js",
            
            "history.js",
            "windowing.js"
        ];
        var cssFiles = [
        ];
        
        var url = SimileAjax.findScript(document, "ajax-api.js");
        if (url == null) {
            SimileAjax.error = new Error("Failed to derive URL prefix for Simile Ajax API code files");
            return;
        }
        SimileAjax.urlPrefix = url.substr(0, url.indexOf("ajax-api.js"));
        
        var includeJavascriptFile = function(filename) {
            SimileAjax.includeJavascriptFile(document, SimileAjax.urlPrefix + "scripts/" + filename);
        };
        var includeCssFile = function(filename) {
            SimileAjax.includeCssFile(document, SimileAjax.urlPrefix + "styles/" + filename);
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
