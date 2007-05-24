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
            params:     { bundle:true },
            namespace:  "http://simile.mit.edu/2006/11/exhibit#",
            importers:  {}
        };
    
        var javascriptFiles = [
            "exhibit.js",
            "persistence.js",
            
            "util/set.js",
            "util/util.js",
            "util/settings.js",
            "util/views.js",
            "util/facets.js",
            
            "data/database.js",
            "data/expression.js",
            "data/expression-parser.js",
            "data/functions.js",
            "data/collection.js",
            
            "data/importers/exhibit-json-importer.js",
            "data/importers/html-table-importer.js",
            "data/importers/jsonp-importer.js",
            
            "data/exporters/rdf-xml-exporter.js",
            "data/exporters/semantic-wikitext-exporter.js",
            "data/exporters/exhibit-json-exporter.js",
            "data/exporters/tsv-exporter.js",
            "data/exporters/bibtex-exporter.js",
            
            "ui/ui.js",
            "ui/ui-context.js",
            "ui/lens.js",
            
            "ui/facets/list-facet.js",
            "ui/facets/numeric-range-facet.js",
            
            "ui/widgets/logo.js",
            "ui/widgets/collection-summary-widget.js",
            "ui/widgets/resizable-div-widget.js",
            "ui/widgets/legend-widget.js",
            "ui/widgets/option-widget.js",
            "ui/widgets/toolbox-widget.js",
            
            "ui/views/view-panel.js",
            "ui/views/ordered-view-frame.js",
            "ui/views/tile-view.js",
            "ui/views/thumbnail-view.js",
            "ui/views/map-view.js",
            "ui/views/timeline-view.js",
            "ui/views/tabular-view.js",
            "ui/views/scatter-plot-view.js",
            "ui/views/pivot-table-view.js",
            "ui/views/html-view.js"
        ];
        var cssFiles = [
            "exhibit.css",
            "browse-panel.css",
            "lens.css",
            
            "util/facets.css",
            "util/views.css",
            
            "widgets/collection-summary-widget.css",
            "widgets/resizable-div-widget.css",
            "widgets/legend-widget.css",
            "widgets/option-widget.css",
            "widgets/toolbox-widget.css",
            
            "views/view-panel.css",
            "views/tile-view.css",
            "views/map-view.css",
            "views/timeline-view.css",
            "views/thumbnail-view.css",
            "views/tabular-view.css",
            "views/scatter-plot-view.css",
            "views/pivot-table-view.css"
        ];
        
        var locales = [ "en" ];

        var includeMap = false;
        var includeTimeline = false;
        
        var defaultClientLocales = ("language" in navigator ? navigator.language : navigator.browserLanguage).split(";");
        for (var l = 0; l < defaultClientLocales.length; l++) {
            var locale = defaultClientLocales[l];
            if (locale != "en") {
                var segments = locale.split("-");
                if (segments.length > 1 && segments[0] != "en") {
                    locales.push(segments[0]);
                }
                locales.push(locale);
            }
        }

        var paramTypes = { bundle:Boolean, js:Array, css:Array };
        if (typeof Exhibit_urlPrefix == "string") {
            Exhibit.urlPrefix = Exhibit_urlPrefix;
            if ("Exhibit_parameters" in window) {
                SimileAjax.parseURLParameters(Exhibit_parameters,
                                              Exhibit.params,
                                              paramTypes);
            }
        } else {
            var url = SimileAjax.findScript(document, "/exhibit-api.js");
            if (url == null) {
                Exhibit.error = new Error("Failed to derive URL prefix for Simile Exhibit API code files");
                return;
            }
            Exhibit.urlPrefix = url.substr(0, url.indexOf("exhibit-api.js"));
        
            SimileAjax.parseURLParameters(url, Exhibit.params, paramTypes);
        }

        if (Exhibit.params.locale) { // ISO-639 language codes,
            // optional ISO-3166 country codes (2 characters)
            if (Exhibit.params.locale != "en") {
                var segments = Exhibit.params.locale.split("-");
                if (segments.length > 1 && segments[0] != "en") {
                    locales.push(segments[0]);
                }
                locales.push(Exhibit.params.locale);
            }
        }
        if (Exhibit.params.gmapkey) {
            includeMap = true;
        }
        if (Exhibit.params.views) {
            var views = Exhibit.params.views.split(",");
            for (var j = 0; j < views.length; j++) {
                var view = views[j];
                if (view == "timeline") {
                    includeTimeline = true;
                } else if (view == "map") {
                    includeMap = true;
                }
            }
        }

        var scriptURLs = Exhibit.params.js || [];
        var cssURLs = Exhibit.params.css || [];
        
        /*
         *  External components
         */
        if (includeMap && Exhibit.params.gmapkey) {
            scriptURLs.push("http://maps.google.com/maps?file=api&v=2&key=" + Exhibit.params.gmapkey);
        }
        if (includeTimeline) {
            scriptURLs.push("http://static.simile.mit.edu/timeline/api/timeline-api.js");
        }
        
        /*
         *  Core scripts and styles
         */
        if (Exhibit.params.bundle) {
            scriptURLs.push(Exhibit.urlPrefix + "bundle.js");
            cssURLs.push(Exhibit.urlPrefix + "bundle.css");
        } else {
            SimileAjax.prefixURLs(scriptURLs, Exhibit.urlPrefix + "scripts/", javascriptFiles);
            SimileAjax.prefixURLs(cssURLs, Exhibit.urlPrefix + "styles/", cssFiles);
        }
        
        /*
         *  Localization
         */
        for (var i = 0; i < locales.length; i++) {
            scriptURLs.push(Exhibit.urlPrefix + "locales/" + locales[i] + "/locale.js");
        };
        
        if (Exhibit.params.callback) {
            window.SimileAjax_onLoad = function() {
                eval(Exhibit.params.callback + "()");
            }
        } else {
            scriptURLs.push(Exhibit.urlPrefix + "scripts/create.js");
        }

        SimileAjax.includeJavascriptFiles(document, "", scriptURLs);
        SimileAjax.includeCssFiles(document, "", cssURLs);
        Exhibit.loaded = true;
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
