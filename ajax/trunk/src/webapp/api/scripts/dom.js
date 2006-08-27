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

SimileAjax.DOM.createDOMFromTemplate = function(doc, template) {
    var result = {};
    result.elmt = SimileAjax.DOM._createDOMFromTemplate(doc, template, result, null);
    
    return result;
};

SimileAjax.DOM._createDOMFromTemplate = function(doc, templateNode, result, parentElmt) {
    if (typeof templateNode == "string") {
        var node = doc.createTextNode(templateNode);
        if (parentElmt != null) {
            parentElmt.appendChild(node);
        }
        return node;
    } else {
        var elmt = null;
        if ("tag" in templateNode) {
            var tag = templateNode.tag;
            if (parentElmt != null) {
                if (tag == "tr") {
                    elmt = parentElmt.insertRow(parentElmt.rows.length);
                } else if (tag == "td") {
                    elmt = parentElmt.insertCell(parentElmt.cells.length);
                }
            }
            if (elmt == null) {
                elmt = doc.createElement(templateNode.tag);
                if (parentElmt != null) {
                    parentElmt.appendChild(elmt);
                }
            }
        } else {
            elmt = templateNode.elmt;
            if (parentElmt != null) {
                parentElmt.appendChild(elmt);
            }
        }
        
        for (attribute in templateNode) {
            var value = templateNode[attribute];
            
            if (attribute == "field") {
                result[value] = elmt;
                
            } else if (attribute == "className") {
                elmt.className = value;
            } else if (attribute == "id") {
                elmt.id = value;
            } else if (attribute == "title") {
                elmt.title = value;
            } else if (attribute == "type" && elmt.tagName == "input") {
                elmt.type = value;
                
            } else if (attribute == "children") {
                for (var i = 0; i < value.length; i++) {
                    Longwell.DOM._createDOMFromTemplate(doc, value[i], result, elmt);
                }
            } else if (attribute != "tag" && attribute != "elmt") {
                elmt.setAttribute(attribute, value);
            }
        }
        return elmt;
    }
}