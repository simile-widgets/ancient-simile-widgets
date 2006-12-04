/*==================================================
 *  Simile Ajax API
 *
 *  Include this file in your HTML file as follows:
 *
 *    <script src="http://simile.mit.edu/ajax/api/simile-ajax-api.js" type="text/javascript"></script>
 *
 *==================================================
 */

if (typeof SimileAjax == "undefined") {
    var SimileAjax = {
        loaded:                 false,
        loadingScriptsCount:    0,
        error:                  null
    };
    
    SimileAjax.Platform = new Object();
        /*
            HACK: We need these 2 things here because we cannot simply append
            a <script> element containing code that accesses SimileAjax.Platform
            to initialize it because IE executes that <script> code first
            before it loads ajax.js and platform.js.
        */
        
    var getHead = function(doc) {
        return doc.getElementsByTagName("head")[0];
    };
    
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
        if (doc.body == null) {
            doc.write("<script src='" + url + "' type='text/javascript'></script>");
        } else {
            var script = doc.createElement("script");
            script.type = "text/javascript";
            script.language = "JavaScript";
            script.src = url;
            getHead(doc).appendChild(script);
        }
    };
    SimileAjax.includeJavascriptFiles = function(doc, urlPrefix, filenames) {
        for (var i = 0; i < filenames.length; i++) {
            SimileAjax.includeJavascriptFile(doc, urlPrefix + filenames[i]);
        }
        SimileAjax.loadingScriptsCount += filenames.length;
        SimileAjax.includeJavascriptFile(doc, SimileAjax.urlPrefix + "scripts/signal.js?" + filenames.length);
    };
    SimileAjax.includeCssFile = function(doc, url) {
        if (doc.body == null) {
            doc.write("<link rel='stylesheet' href='" + url + "' type='text/css'/>");
        } else {
            var link = doc.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", url);
            getHead(doc).appendChild(link);
        }
    };
    SimileAjax.includeCssFiles = function(doc, urlPrefix, filenames) {
        for (var i = 0; i < filenames.length; i++) {
            SimileAjax.includeCssFile(doc, urlPrefix + filenames[i]);
        }
    };
    SimileAjax.parseURLParameters = function(url) {
        var pairs = [];
        var question = url.indexOf("?");
        if (question >= 0) {
            var params = url.substr(question+1).split("&");
            for (var p = 0; p < params.length; p++) {
                var pair = params[p].split("=");
                pairs.push({ name: pair[0], value: pair.length > 1 ? pair[1] : "" });
            }
        }
        return pairs;
    };
    
    (function() {
        var javascriptFiles = [
            "platform.js",
            "debug.js",
            "xmlhttp.js",
            "json.js",
            "dom.js",
            "graphics.js",
            "date-time.js",
            "string.js",
            
            "ajax.js",
            "history.js",
            "window-manager.js"
        ];
        var cssFiles = [
        ];
        
        var bundle = true;
        if (typeof SimileAjax_urlPrefix == "string") {
            SimileAjax.urlPrefix = SimileAjax_urlPrefix;
        } else {
            var url = SimileAjax.findScript(document, "simile-ajax-api.js");
            if (url == null) {
                SimileAjax.error = new Error("Failed to derive URL prefix for Simile Ajax API code files");
                return;
            }
            
            var q = url.indexOf("?");
            if (q > 0 && url.substr(q) == "?bundle=false") {
                bundle = false;
            }
            
            SimileAjax.urlPrefix = url.substr(0, url.indexOf("simile-ajax-api.js"));
        }
        
        if (bundle) {
            SimileAjax.includeJavascriptFiles(document, SimileAjax.urlPrefix, [ "bundle.js" ]);
        } else {
            SimileAjax.includeJavascriptFiles(document, SimileAjax.urlPrefix + "scripts/", javascriptFiles);
        }
            SimileAjax.includeCssFiles(document, SimileAjax.urlPrefix + "styles/", cssFiles);
        
        SimileAjax.loaded = true;
    })();
}
