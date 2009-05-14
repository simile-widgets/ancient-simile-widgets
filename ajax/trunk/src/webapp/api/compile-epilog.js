(function() {
    var f = null;
    if (typeof SimileAjax_onLoad == "string") {
        f = eval(SimileAjax_onLoad);
        SimileAjax_onLoad = null;
    } else if (typeof SimileAjax_onLoad == "function") {
        f = SimileAjax_onLoad;
        SimileAjax_onLoad = null;
    }
    
    if (f != null) {
        f();
    }
})();