/*==================================================
 *  Exhibit.JSONPImporter
 *==================================================
 */

Exhibit.JSONPImporter = {
    _callbacks: {}
};
Exhibit.importers["application/jsonp"] = Exhibit.JSONPImporter;

// cont gets called with the original feed (so you can pick up details from the
// feed from user code that were of interest to you but not the exhibit itself,
// for instance). load returns the callback that the JSONP payload should call,
// so that even partial static JSONP implementations (with a fixed callback
// name) can assign that variable with the return value, and things will
// work out, as much as they can (i e concurrent requests can get mixed up).
Exhibit.JSONPImporter.load = function(
    link, database, cont, fConvert, staticJSONPCallback, charset
) {
    var url = link;
    if (typeof link != "string") {
        url = Exhibit.Persistence.resolveURL(link.href);
        fConvert = Exhibit.getAttribute(link, "converter");
        staticJSONPCallback = Exhibit.getAttribute(link, "jsonp-callback");
        charset = Exhibit.getAttribute(link, "charset");
    }
    if (typeof fConvert == "string") {
        var name = fConvert;
        name = name.charAt(0).toLowerCase() + name.substring(1) + "Converter";
        if (name in Exhibit.JSONPImporter) {
            fConvert = Exhibit.JSONPImporter[name];
        } else {
            try {
                fConvert = eval(fConvert);
            } catch (e) {
                fConvert = null;
                // silent
            }
        }
    }

    var next = Exhibit.JSONPImporter._callbacks.next || 1;
    Exhibit.JSONPImporter._callbacks.next = next + 1;

    var callbackName = "cb" + next.toString(36);
    var callbackURL = url;
    if (callbackURL.indexOf("?") == -1)
        callbackURL += "?";

    var lastChar = callbackURL.charAt(callbackURL.length - 1);
    if (lastChar != "=") {
        if (lastChar != "&" && lastChar != "?")
            callbackURL += "&";
        callbackURL += "callback=";
    }

    var callbackFull = "Exhibit.JSONPImporter._callbacks." + callbackName;
    callbackURL += callbackFull;
    var cleanup = function( failedURL ) {
        try {
            Exhibit.UI.hideBusyIndicator();

            delete Exhibit.JSONPImporter._callbacks[callbackName+"_fail"];
            delete Exhibit.JSONPImporter._callbacks[callbackName];
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        } finally {
            if (failedURL) {
                prompt("Failed to load javascript file:", failedURL);
                cont && cont(undefined); // got no json! signal with undefined
            }
        }
    };

    Exhibit.JSONPImporter._callbacks[callbackName+"_fail"] = cleanup;
    Exhibit.JSONPImporter._callbacks[callbackName] = function(json) {
        try {
            cleanup(null);
            database.loadData(fConvert ? fConvert(json, url) : json,
                              Exhibit.Persistence.getBaseURL(url));
        } finally {
            if (cont) cont(json);
        }
    };
    if (staticJSONPCallback) { // fallback for partial JSONP support feeds
        callbackURL = url; // url callback parameter not supported; do not pass
        eval(staticJSONPCallback + "=" + callbackFull);
    }

    var fail = callbackFull + "_fail('"+ callbackURL +"');";
    var script = SimileAjax.includeJavascriptFile(document,
                                                  callbackURL,
                                                  fail,
                                                  charset);
    Exhibit.UI.showBusyIndicator();
    return Exhibit.JSONPImporter._callbacks[callbackName];
};

// Does 90% of the feed conversion for 90% of all (well designed) JSONP feeds.
// Pass the raw json object, an optional index to drill into to get at the
// array of items ("feed.entry", in the case of Google Spreadsheets -- pass
// null, if the array is already the top container, as in a Del.icio.us feed),
// an object mapping the wanted item property name to the properties to pick
// them up from, and an optional similar mapping with conversion callbacks to
// perform on the data value before storing it in the item property. These
// callback functions are invoked with the value, the object it was picked up
// from, its index in the items array, the items array and the feed as a whole
// (for the cases where you need to look up properties from the surroundings).
// Returning the undefined value your converter means the property is not set.
Exhibit.JSONPImporter.transformJSON = function(json, index, mapping, converters) {
    var objects = json, items = [];
    if (index) {
        index = index.split(".");
        while (index.length) {
            objects = objects[index.shift()];
        }
    }
    for (var i = 0, object; object = objects[i]; i++) {
        var item = {};
        for (var name in mapping) {
            var index = mapping[name];
            if (!mapping.hasOwnProperty(name) || // gracefully handle poisoned
                !object.hasOwnProperty(index)) continue; // Object.prototype
            var property = object[index];
            if (converters && converters.hasOwnProperty(name)) {
                property = converters[name](property, object, i, objects, json);
            }
            if (typeof property != "undefined") {
                item[name] = property;
            }
        }
        items.push(item);
    }
    return items;
};

Exhibit.JSONPImporter.deliciousConverter = function(json, url) {
    var items = Exhibit.JSONPImporter.transformJSON(json, null,
        { label:"u", note:"n", description:"d", tags:"t" });
    return { items:items, properties:{ url:{ valueType:"url" } } };
};

Exhibit.JSONPImporter.googleSpreadsheetsConverter = function(json, url) {
    var items = [];
    var properties = {};
    var types = {};
    var valueTypes = { "text" : true, "number" : true, "item" : true, "url" : true, "boolean" : true };

    var entries = json.feed.entry;
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var item = { label: entry.title.$t };
        var fields = entry.content.$t;

        var openBrace = fields.indexOf("{");
        while (openBrace >= 0) {
            var closeBrace = fields.indexOf("}", openBrace+1);
            if (closeBrace < 0) {
                break;
            }

            var fieldSpec = fields.substring(openBrace+1, closeBrace).trim().split(":");
            openBrace = fields.indexOf("{", closeBrace+1);

            var fieldValues = openBrace > 0 ? fields.substring(closeBrace+1, openBrace) : fields.substr(closeBrace+1);
            fieldValues = fieldValues.replace(/^\:\s+|,\s+$/g, "");

            var fieldName = fieldSpec[0].trim();
            var property = properties[fieldName];
            if (!(property)) {
                var fieldDetails = fieldSpec.length > 1 ? fieldSpec[1].split(",") : [];
                property = {};

                for (var d = 0; d < fieldDetails.length; d++) {
                    var detail = fieldDetails[d].trim();
                    var property = { single: false };
                    if (detail in valueTypes) {
                        property.valueType = detail;
                    } else if (detail == "single") {
                        property.single = true;
                    }
                }

                properties[fieldName] = property;
            }

            if (!property.single) {
                fieldValues = fieldValues.split(";");
                for (var v = 0; v < fieldValues.length; v++) {
                    fieldValues[v] = fieldValues[v].trim();
                }
            }
            item[fieldName] = fieldValues;
        }
        items.push(item);
    }

    return { types:types, properties:properties, items:items };
};
