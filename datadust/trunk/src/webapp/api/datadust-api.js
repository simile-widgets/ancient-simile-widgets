/*==================================================
 *  SimileWidgets Datadust API
 *==================================================
 */

(function() {
    var useLocalResources = false;
    
    if (document.location.search.length > 0) {
        var params = document.location.search.substr(1).split("&");
        for (var i = 0; i < params.length; i++) {
            if (params[i] == "datadust-use-local-resources") {
                useLocalResources = true;
            }
        }
    }
    
    var loadMe = function() {
        if (typeof window.Datadust != "undefined") {
            return;
        }
    
        window.Datadust = {
            loaded:     false,
            params:     { bundle: false /*!useLocalResources*/ },
            importers:  {},
            locales:    [ "en" ]
        };
    
        var javascriptFiles = [
            "datadust.js",
            "dispatcher.js",
            "flash.js"
        ];
        var cssFiles = [
            "datadust.css"
        ];
        
        var defaultClientLocales = ("language" in navigator ? navigator.language : navigator.browserLanguage).split(";");
        for (var l = 0; l < defaultClientLocales.length; l++) {
            var locale = defaultClientLocales[l];
            if (locale != "en") {
                var segments = locale.split("-");
                if (segments.length > 1 && segments[0] != "en") {
                    Datadust.locales.push(segments[0]);
                }
                Datadust.locales.push(locale);
            }
        }

        var paramTypes = { bundle:Boolean, js:Array, css:Array };
        if (typeof Datadust_urlPrefix == "string") {
            Datadust.urlPrefix = Datadust_urlPrefix;
            if ("Datadust_parameters" in window) {
                SimileAjax.parseURLParameters(Datadust_parameters,
                                              Datadust.params,
                                              paramTypes);
            }
        } else {
            var url = SimileAjax.findScript(document, "/datadust-api.js");
            if (url == null) {
                Datadust.error = new Error("Failed to derive URL prefix for Datadust API code files");
                return;
            }
            Datadust.urlPrefix = url.substr(0, url.indexOf("datadust-api.js"));
        
            SimileAjax.parseURLParameters(url, Datadust.params, paramTypes);
        }
        
        if (useLocalResources) {
            Datadust.urlPrefix = "http://127.0.0.1:9191/datadust/api/";
        }

        if (Datadust.params.locale) { // ISO-639 language codes,
            // optional ISO-3166 country codes (2 characters)
            if (Datadust.params.locale != "en") {
                var segments = Datadust.params.locale.split("-");
                if (segments.length > 1 && segments[0] != "en") {
                    Datadust.locales.push(segments[0]);
                }
                Datadust.locales.push(Datadust.params.locale);
            }
        }

        var scriptURLs = Datadust.params.js || [];
        var cssURLs = Datadust.params.css || [];
                
        /*
         *  Core scripts and styles
         */
        if (Datadust.params.bundle) {
            scriptURLs.push(Datadust.urlPrefix + "datadust-bundle.js");
            cssURLs.push(Datadust.urlPrefix + "datadust-bundle.css");
        } else {
            SimileAjax.prefixURLs(scriptURLs, Datadust.urlPrefix + "scripts/", javascriptFiles);
            SimileAjax.prefixURLs(cssURLs, Datadust.urlPrefix + "styles/", cssFiles);
        }
        
        /*
         *  Localization
         */
        for (var i = 0; i < Datadust.locales.length; i++) {
            scriptURLs.push(Datadust.urlPrefix + "locales/" + Datadust.locales[i] + "/locale.js");
        };
        
        if (Datadust.params.callback) {
            window.SimileAjax_onLoad = function() {
                eval(Datadust.params.callback + "()");
            }
        }

        SimileAjax.includeJavascriptFiles(document, "", scriptURLs);
        SimileAjax.includeCssFiles(document, "", cssURLs);
        Datadust.loaded = true;
    };

    /*
     *  Load SimileAjax if it's not already loaded
     */
    if (typeof SimileAjax == "undefined") {
        window.SimileAjax_onLoad = loadMe;
        
        var url = useLocalResources ?
            "http://127.0.0.1:8888/ajax/api/simile-ajax-api.js?bundle=false" :
            "http://api.simile-widgets.org/ajax/2.2.1/simile-ajax-api.js";
            
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
