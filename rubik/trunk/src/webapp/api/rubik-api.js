/*==================================================
 *  Simile Rubik API
 *
 *  Include Rubik in your HTML file as follows:
 *    <script src="http://simile.mit.edu/ajax/api/simile-ajax-api.js" type="text/javascript"></script>
 *    <script src="http://simile.mit.edu/rubik/api/rubik-api.js" type="text/javascript"></script>
 *
 *  You do need to include the Simile Ajax API 
 *  BEFORE you include Rubik.
 *
 *==================================================
 */

if (typeof Rubik == "undefined") {
    var Rubik = {
        loaded:     false
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
            "views/ordered-view-frame.js",
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
        
        var theme = "classic";
        var locales = [ "en" ];
        var gmapKey = null;
        
        var processURLParameters = function(parameters) {
            for (var i = 0; i < parameters.length; i++) {
                var p = parameters[i];
                if (p.name == "theme") {
                    theme = p.value;
                } else if (p.name == "locale") {
                    // ISO-639 language codes, optional ISO-3166 country codes (2 characters)
                    var segments = p.value.split("-");
                    if (segments.length > 1) {
                        locales.push(segments[0]);
                    }
                    locales.push(p.value);
                } else if (p.name == "gmapkey") {
                    gmapKey = p.value;
                }
            }
        };
        
        if (typeof Rubik_urlPrefix == "string") {
            Rubik.urlPrefix = Rubik_urlPrefix;
            if ("Rubik_parameters" in window) {
                processURLParameters(Rubik_parameters);
            }
        } else {
            var url = SimileAjax.findScript(document, "rubik-api.js");
            if (url == null) {
                Rubik.error = new Error("Failed to derive URL prefix for Simile Rubik API code files");
                return;
            }
            Rubik.urlPrefix = url.substr(0, url.indexOf("rubik-api.js"));
        
            processURLParameters(SimileAjax.parseURLParameters(url));
        }
        
        /*
         *  External components
         */
        if (gmapKey != null) {
            SimileAjax.includeJavascriptFile(
                document, 
                "http://maps.google.com/maps?file=api&v=2&key=" + gmapKey
            );
        }
        
        /*
         *  Core scripts and styles
         */
        SimileAjax.includeJavascriptFiles(document, Rubik.urlPrefix + "scripts/", javascriptFiles);
        SimileAjax.includeCssFiles(document, Rubik.urlPrefix + "styles/", cssFiles);
        
        /*
         *  Theme and localization
         */
        SimileAjax.includeJavascriptFiles(
            document, 
            Rubik.urlPrefix + "themes/", 
            [ theme + "/theme.js" ]
        );
        
        var localeFiles = [];
        for (var i = 0; i < locales.length; i++) {
            localeFiles.push(locales[i] + "/locale.js");
        };
        SimileAjax.includeJavascriptFiles(document, Rubik.urlPrefix + "locales/", localeFiles);
        
        Rubik.loaded = true;
    })();
}
