/*==================================================
 *  Simile Exhibit API
 *
 *  Include Exhibit in your HTML file as follows:
 *    <script src="http://simile.mit.edu/exhibit/api/exhibit-api.js" type="text/javascript"></script>
 *
 *==================================================
 */

(function() {
    var loadMe = function() {
        if (typeof window.Exhibit != "undefined") {
            return;
        }
    
        window.Exhibit = {
            loaded:     false,
            namespace:  "http://simile.mit.edu/2006/11/exhibit#"
        };
    
        var javascriptFiles = [
            "exhibit.js",
            "util/set.js",
            
            "expression.js",
            "database.js",
            "browse-engine.js",
            
            "control-panel.js",
            
            "browse-panel.js",
            "facets/list-facet.js",
            
            "view-panel.js",
            "views/ordered-view-frame.js",
            "views/tile-view.js",
            "views/map-view.js",
            "views/timeline-view.js",
            "views/thumbnail-view.js",
            "views/tabular-view.js",
            "lens.js",
            
            "exporters/rdf-xml-exporter.js",
            "exporters/semantic-wikitext-exporter.js",
            "exporters/exhibit-json-exporter.js",
            "exporters/tsv-exporter.js",
            "exporters/bibtex-exporter.js"
        ];
        var cssFiles = [
            "exhibit.css"
        ];
        
        var theme = "classic";
        var locales = [ "en" ];
        var gmapKey = null;
        
        var includeMap = false;
        var includeTimeline = false;
        
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
                    includeMap = true;
                } else if (p.name == "views") {
                    var views = p.value.split(",");
                    for (var j = 0; j < views.length; j++) {
                        var view = views[j];
                        if (view == "timeline") {
                            includeTimeline = true;
                        } else if (view == "map") {
                            includeMap = true;
                        }
                    }
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
        if (gmapKey != null && includeMap) {
            SimileAjax.includeJavascriptFile(
                document, 
                "http://maps.google.com/maps?file=api&v=2&key=" + gmapKey
            );
        }
        if (includeTimeline) {
            SimileAjax.includeJavascriptFile(
                document, 
                "http://simile.mit.edu/timeline/api/timeline-api.js"
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
    };
    
    /*
     *  Load SimileAjax if it's not already loaded
     */
    if (typeof SimileAjax == "undefined") {
        window.SimileAjax_onLoad = loadMe;
        
        var url = "http://simile.mit.edu/ajax/api/simile-ajax-api.js";
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
