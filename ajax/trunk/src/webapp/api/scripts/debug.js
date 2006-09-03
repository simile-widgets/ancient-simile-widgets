/*==================================================
 *  Debug Utility Functions
 *==================================================
 */

SimileAjax.Debug = new Object();

SimileAjax.Debug.log = function(msg) {
    var f;
    if ("console" in window && "log" in window.console) { // FireBug installed
        f = function(msg2) {
            console.log(msg2);
        }
    } else {
        f = function(msg2) {
            alert(msg2);
        }
    }
    SimileAjax.Debug.log = f;
    f(msg);
};

SimileAjax.Debug.exception = function(e) {
    var f;
    if ("console" in window && "error" in window.console) { // FireBug installed
        f = function(e2) {
            console.error("%o", e2);
        }
    } else {
        f = SimileAjax.Platform.browser.isIE ?
            function(e2) {
                alert("Caught exception: " + e2.message);
            } :
            function(e2) {
                alert("Caught exception: " + e2);
            };
    }
    SimileAjax.Debug.exception = f;
    f(e);
};

SimileAjax.Debug.objectToString = function(o) {
    return SimileAjax.Debug._objectToString(o, "");
};

SimileAjax.Debug._objectToString = function(o, indent) {
    var indent2 = indent + " ";
    if (typeof o == "object") {
        var s = "{";
        for (n in o) {
            s += indent2 + n + ": " + SimileAjax.Debug._objectToString(o[n], indent2) + "\n";
        }
        s += indent + "}";
        return s;
    } else if (typeof o == "array") {
        var s = "[";
        for (var n = 0; n < o.length; n++) {
            s += SimileAjax.Debug._objectToString(o[n], indent2) + "\n";
        }
        s += indent + "]";
        return s;
    } else {
        return o;
    }
};