/*==================================================
 *  DOM Utility Functions
 *==================================================
 */

SimileAjax.DOM = new Object();

SimileAjax.DOM.registerEventWithObject = function(elmt, eventName, obj, handler) {
    SimileAjax.DOM.registerEvent(elmt, eventName, function(elmt2, evt, target) {
        return handler.call(obj, elmt2, evt, target);
    });
};

SimileAjax.DOM.registerEvent = function(elmt, eventName, handler) {
    var handler2 = function(evt) {
        evt = (evt) ? evt : ((event) ? event : null);
        if (evt) {
            var target = (evt.target) ? 
                evt.target : ((evt.srcElement) ? evt.srcElement : null);
            if (target) {
                target = (target.nodeType == 1 || target.nodeType == 9) ? 
                    target : target.parentNode;
            }
            
            return handler(elmt, evt, target);
        }
        return true;
    }
    
    if (SimileAjax.Platform.browser.isIE) {
        elmt.attachEvent("on" + eventName, handler2);
    } else {
        elmt.addEventListener(eventName, handler2, false);
    }
};

SimileAjax.DOM.getPageCoordinates = function(elmt) {
    var left = 0;
    var top = 0;
    
    if (elmt.nodeType != 1) {
        elmt = elmt.parentNode;
    }
    
    while (elmt != null) {
        left += elmt.offsetLeft;
        top += elmt.offsetTop;
        
        elmt = elmt.offsetParent;
    }
    return { left: left, top: top };
};

SimileAjax.DOM.getEventRelativeCoordinates = function(evt, elmt) {
    if (SimileAjax.Platform.browser.isIE) {
        return {
            x: evt.offsetX,
            y: evt.offsetY
        };
    } else {
        var coords = SimileAjax.DOM.getPageCoordinates(elmt);
        return {
            x: evt.pageX - coords.left,
            y: evt.pageY - coords.top
        };
    }
};

SimileAjax.DOM.cancelEvent = function(evt) {
    evt.returnValue = false;
    evt.cancelBubble = true;
    if ("preventDefault" in evt) {
        evt.preventDefault();
    }
};

