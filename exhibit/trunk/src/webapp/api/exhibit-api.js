/*==================================================
 *  Simile Exhibit API
 *
 *  Include Exhibit in your HTML file as follows:
 *    <script src="http://simile.mit.edu/ajax/api/simile-ajax-api.js" type="text/javascript"></script>
 *    <script src="http://simile.mit.edu/exhibit/api/exhibit-api.js" type="text/javascript"></script>
 *
 *  You do need to include the Simile Ajax API 
 *  BEFORE you include Exhibit.
 *
 *==================================================
 */

if (typeof Exhibit == "undefined") {
    var Exhibit = {
        loaded:     false
    };
    
    (function() {
        var javascriptFiles = [
            "exhibit.js",
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
            "exhibit.css",
            
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
        
        if (typeof Exhibit_urlPrefix == "string") {
            Exhibit.urlPrefix = Exhibit_urlPrefix;
            if ("Exhibit_parameters" in window) {
                processURLParameters(Exhibit_parameters);
            }
        } else {
            var url = SimileAjax.findScript(document, "exhibit-api.js");
            if (url == null) {
                Exhibit.error = new Error("Failed to derive URL prefix for Simile Exhibit API code files");
                return;
            }
            Exhibit.urlPrefix = url.substr(0, url.indexOf("exhibit-api.js"));
        
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
        SimileAjax.includeJavascriptFiles(document, Exhibit.urlPrefix + "scripts/", javascriptFiles);
        SimileAjax.includeCssFiles(document, Exhibit.urlPrefix + "styles/", cssFiles);
        
        /*
         *  Theme and localization
         */
        SimileAjax.includeJavascriptFiles(
            document, 
            Exhibit.urlPrefix + "themes/", 
            [ theme + "/theme.js" ]
        );
        
        var localeFiles = [];
        for (var i = 0; i < locales.length; i++) {
            localeFiles.push(locales[i] + "/locale.js");
        };
        SimileAjax.includeJavascriptFiles(document, Exhibit.urlPrefix + "locales/", localeFiles);
        
        Exhibit.loaded = true;
    })();
}
