/******************************************************************************
 * Timegrid API
 *   This file will load all the necessary Javascript files to make a standard 
 *   Timegrid operate.
 *****************************************************************************/
 
var Timegrid = new Object();
Timegrid.Platform = new Object();
    /*
        HACK: We need these 2 things here because we cannot simply append
        a <script> element containing code that accesses Timegrid.Platform
        to initialize it because IE executes that <script> code first
        before it loads timegrid.js and util/platform.js.
    */

(function() {
    var bundle = false;
    var javascriptFiles = [
        "timegrid.js",
        
        "util/jquery.js",
        "util/data-structure.js",
        
        "event-grid.js",
        "units.js",
        "sources.js",
        "layouts.js",
    ];
    var cssFiles = [
        "timegrid.css",
    ];
    
    var localizedJavascriptFiles = [
        "timegrid.js",
    ];
    var localizedCssFiles = [
    ];
    
    // ISO-639 language codes, ISO-3166 country codes (2 characters)
    var supportedLocales = [
        "cs",       // Czech
        "de",       // German
        "en",       // English
        "es",       // Spanish
        "fr",       // French
        "it",       // Italian
        "ru",       // Russian
        "se",       // Swedish
        "vi",       // Vietnamese
        "zh"        // Chinese
    ];
    
    try {
        var desiredLocales = [ "en" ];
        var defaultServerLocale = "en";
        
        var parseURLParameters = function(parameters) {
            var params = parameters.split("&");
            for (var p = 0; p < params.length; p++) {
                var pair = params[p].split("=");
                if (pair[0] == "locales") {
                    desiredLocales = desiredLocales.concat(pair[1].split(","));
                } else if (pair[0] == "defaultLocale") {
                    defaultServerLocale = pair[1];
                } else if (pair[0] == "bundle") {
                    bundle = pair[1] != "false";
                }
            }
        };
        
        (function() {
            if (typeof Timegrid_urlPrefix == "string") {
                Timegrid.urlPrefix = Timegrid_urlPrefix;
                if (typeof Timegrid_parameters == "string") {
                    parseURLParameters(Timegrid_parameters);
                }
            } else {
                var heads = document.documentElement.getElementsByTagName("head");
                for (var h = 0; h < heads.length; h++) {
                    var scripts = heads[h].getElementsByTagName("script");
                    for (var s = 0; s < scripts.length; s++) {
                        var url = scripts[s].src;
                        var i = url.indexOf("timegrid-api.js");
                        if (i >= 0) {
                            Timegrid.urlPrefix = url.substr(0, i);
                            var q = url.indexOf("?");
                            if (q > 0) {
                                parseURLParameters(url.substr(q + 1));
                            }
                            return;
                        }
                    }
                }
                throw new Error("Failed to derive URL prefix for Timegrid API code files");
            }
        })();
        
        var includeJavascriptFiles;
        var includeCssFiles;
        if ("SimileAjax" in window) {
            includeJavascriptFiles = function(urlPrefix, filenames) {
                SimileAjax.includeJavascriptFiles(document, urlPrefix, filenames);
            }
            includeCssFiles = function(urlPrefix, filenames) {
                SimileAjax.includeCssFiles(document, urlPrefix, filenames);
            }
        } else {
            var getHead = function() {
                return document.getElementsByTagName("head")[0];
            };
            var includeJavascriptFile = function(url) {
                if (document.body == null) {
                    try {
                        document.write("<script src='" + url + "' type='text/javascript'></script>");
                        return;
                    } catch (e) {
                        // fall through
                    }
                }
                
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.language = "JavaScript";
                script.src = url;
                getHead().appendChild(script);
            };
            var includeCssFile = function(url) {
                if (document.body == null) {
                    try {
                        document.write("<link rel='stylesheet' href='" + url + "' type='text/css'/>");
                        return;
                    } catch (e) {
                        // fall through
                    }
                }
                
                var link = document.createElement("link");
                link.setAttribute("rel", "stylesheet");
                link.setAttribute("type", "text/css");
                link.setAttribute("href", url);
                getHead().appendChild(link);
            }
            
            includeJavascriptFiles = function(urlPrefix, filenames) {
                for (var i = 0; i < filenames.length; i++) {
                    includeJavascriptFile(urlPrefix + filenames[i]);
                }
            };
            includeCssFiles = function(urlPrefix, filenames) {
                for (var i = 0; i < filenames.length; i++) {
                    includeCssFile(urlPrefix + filenames[i]);
                }
            };
        }
        
        /*
         *  Include non-localized files
         */
        if (bundle) {
            includeJavascriptFiles(Timegrid.urlPrefix, [ "bundle.js" ]);
            includeCssFiles(Timegrid.urlPrefix, [ "bundle.css" ]);
        } else {
            includeJavascriptFiles(Timegrid.urlPrefix + "scripts/", javascriptFiles);
            includeCssFiles(Timegrid.urlPrefix + "styles/", cssFiles);
        }
        
        /*
         *  Include localized files
         */
        var loadLocale = [];
        loadLocale[defaultServerLocale] = true;
        
        var tryExactLocale = function(locale) {
            for (var l = 0; l < supportedLocales.length; l++) {
                if (locale == supportedLocales[l]) {
                    loadLocale[locale] = true;
                    return true;
                }
            }
            return false;
        }
        var tryLocale = function(locale) {
            if (tryExactLocale(locale)) {
                return locale;
            }
            
            var dash = locale.indexOf("-");
            if (dash > 0 && tryExactLocale(locale.substr(0, dash))) {
                return locale.substr(0, dash);
            }
            
            return null;
        }
        
        for (var l = 0; l < desiredLocales.length; l++) {
            tryLocale(desiredLocales[l]);
        }
        
        var defaultClientLocale = defaultServerLocale;
        var defaultClientLocales = ("language" in navigator ? navigator.language : navigator.browserLanguage).split(";");
        for (var l = 0; l < defaultClientLocales.length; l++) {
            var locale = tryLocale(defaultClientLocales[l]);
            if (locale != null) {
                defaultClientLocale = locale;
                break;
            }
        }
        
        for (var l = 0; l < supportedLocales.length; l++) {
            var locale = supportedLocales[l];
            if (loadLocale[locale]) {
                includeJavascriptFiles(Timegrid.urlPrefix + "scripts/l10n/" + locale + "/", localizedJavascriptFiles);
                includeCssFiles(Timegrid.urlPrefix + "styles/l10n/" + locale + "/", localizedCssFiles);
            }
        }
        
        Timegrid.Platform.serverLocale = defaultServerLocale;
        Timegrid.Platform.clientLocale = defaultClientLocale;
    } catch (e) {
        alert(e);
    }
})();