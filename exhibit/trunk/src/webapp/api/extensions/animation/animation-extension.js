/*==================================================
 *  Simile Exhibit Animation Facet Extension
 *==================================================
 */

(function() {
	if (typeof(Exhibit)=="undefined") 
	alert("cannot load extensions before Exhibit");
	
	var isCompiled = ("Exhibit_AnimationExtension_isCompiled" in window) && 
					window.Exhibit_AnimationExtension_isCompiled;
	
	Exhibit.AnimationExtension = {
		params: {
			bundle:     true,
			service:    "none"
		} 
	};
	
	var javascriptFiles = [
		"animation-facet.js",
		"animation-inline.js" ,
		"swfobject.js",
		"animation-youtube.js" ,
		"animation-slideshare.js"
	];
	var cssFiles = [
		"animation-facet.css"
	];
	
	var paramTypes = { bundle: Boolean };
	// Where is our base?
	if (typeof Exhibit_AnimationExtension_urlPrefix == "string") {
		// Check Exhibit_AnimationExtension_parameters
		Exhibit.AnimationExtension.urlPrefix = Exhibit_AnimationExtension_urlPrefix;
		if ("Exhibit_AnimationExtension_parameters" in window) {
			SimileAjax.parseURLParameters(Exhibit_AnimationExtension_parameters,
										Exhibit.AnimationExtension.params,
										paramTypes);
		}
	} else {
		// Look for JS file
		var url = SimileAjax.findScript(document, "/animation-extension.js");
		if (url == null) {
			SimileAjax.Debug.exception(new Error("Failed to derive URL prefix for Simile Exhibit Animation Extension code files"));
			return;
		}
		Exhibit.AnimationExtension.urlPrefix = url.substr(0, url.indexOf("animation-extension.js"));
		SimileAjax.parseURLParameters(url, Exhibit.AnimationExtension.params, paramTypes);
	}
	
	var scriptURLs = [];
	var cssURLs = [];
	
	/*if ((Exhibit.AnimationExtension.params.service == "google") &&
	!("google" in window && "maps" in window.google)) {
		scriptURLs.push("http://maps.googleapis.com/maps/api/js?sensor=false");
	} else if (Exhibit.AnimationExtension.params.service == "openlayers") {
	scriptURLs.push("http://www.openlayers.org/api/OpenLayers.js");
		scriptURLs.push("http://www.openstreetmap.org/openlayers/OpenStreetMap.js");
	} else {
		scriptURLs.push("http://dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=5");
	}*/
	
	if (Exhibit.AnimationExtension.params.bundle) {
		scriptURLs.push(Exhibit.AnimationExtension.urlPrefix + "animation-extension-bundle.js");
		cssURLs.push(Exhibit.AnimationExtension.urlPrefix + "animation-extension-bundle.css");
	} else {
		SimileAjax.prefixURLs(scriptURLs, Exhibit.AnimationExtension.urlPrefix + "scripts/", javascriptFiles);
		SimileAjax.prefixURLs(cssURLs, Exhibit.AnimationExtension.urlPrefix + "styles/", cssFiles);
	}
	
	for (var i = 0; i < Exhibit.locales.length; i++) {
		scriptURLs.push(Exhibit.AnimationExtension.urlPrefix + "locales/" + Exhibit.locales[i] + "/animation-locale.js");
	};
	
	if (!isCompiled) {
		SimileAjax.includeJavascriptFiles(document, "", scriptURLs);
		SimileAjax.includeCssFiles(document, "", cssURLs);
	}
})();
