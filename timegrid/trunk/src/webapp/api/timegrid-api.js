/******************************************************************************
 * Timegrid API
 *   This file will load all the necessary Javascript files to make a standard 
 *   Timegrid operate.
 *****************************************************************************/

(function() {
    var loadMe = function() {
        if (typeof window.Timegrid != "undefined") {
            return;
        }
    
        window.Timegrid = {
            loaded:     false,
            bundle:     false,
            importers:  {}
        };
    
        var javascriptFiles = [
            "timegrid.js",
        
            "util/jquery.js",
            "util/util.js",
            "util/html.js",
            "util/debug.js",
            "util/data-structure.js",
            
            "grid.js",
            "units.js",
            "sources.js",
            "themes.js",
            "labellers.js",
            "layouts.js",

            "layouts/weekly.js",
            "layouts/monthly.js"
        ];
        var cssFiles = [
            "timegrid.css"
        ];
        
        var locales = [ "en" ];
        
        var defaultClientLocales = ("language" in navigator ? navigator.language : navigator.browserLanguage).split(";");
        for (var l = 0; l < defaultClientLocales.length; l++) {
            var locale = defaultClientLocales[l];
            var segments = locale.split("-");
            if (segments.length > 1) {
                locales.push(segments[0]);
            }
            locales.push(locale);
        }
        
        var url = SimileAjax.findScript(document, "timegrid-api.js");
        if (url == null) {
            Timeline.error = new Error("Failed to derive URL prefix for Simile Timegrid API code files");
            return;
        }
        Timegrid.urlPrefix = url.substr(0, url.indexOf("timegrid-api.js"));
        
        /*
         *  Core scripts and styles
         */
        if (Timegrid.bundle) {
            SimileAjax.includeJavascriptFiles(document, Timegrid.urlPrefix, [ "bundle.js" ]);
            SimileAjax.includeCssFiles(document, Timegrid.urlPrefix, [ "bundle.css" ]);
        } else {
            SimileAjax.includeJavascriptFiles(document, Timegrid.urlPrefix + "scripts/", javascriptFiles);
            SimileAjax.includeCssFiles(document, Timegrid.urlPrefix + "styles/", cssFiles);
        }
        
        /*
         *  Localization
         */
        var localeFiles = [];
        for (var i = 0; i < locales.length; i++) {
            localeFiles.push(locales[i] + "/locale.js");
        };
        SimileAjax.includeJavascriptFiles(document, Timegrid.urlPrefix + "locales/", localeFiles);
        
        SimileAjax.includeJavascriptFile(document, Timegrid.urlPrefix + "scripts/create.js");
        Timegrid.loaded = true;
    };
    
    /*
     *  Load SimileAjax if it's not already loaded
     */
    if (typeof SimileAjax == "undefined") {
        window.SimileAjax_onLoad = loadMe;
        
        //var url = "http://127.0.0.1:8888/ajax/api/simile-ajax-api.js?bundle=false";
        var url = "http://static.simile.mit.edu/ajax/api-2.0/simile-ajax-api.js";
        //var url = "http://simile.mit.edu/repository/ajax/trunk/src/webapp/api/simile-ajax-api.js";
        var createScriptElement = function() {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.language = "JavaScript";
            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        }
        if (document.body == null) {
            try {
                document.write("<script src='" + url + "' type='text/javascript'></script>");
            } catch (e) {
                createScriptElement();
            }
        } else {
            createScriptElement();
        }
    } else {
        loadMe();
    }
})();
