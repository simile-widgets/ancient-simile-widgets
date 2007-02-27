/*======================================================================
 *  Exhibit UI Utilities
 *======================================================================
 */
Exhibit.UI = new Object();

/*======================================================================
 *  Help and Debugging
 *======================================================================
 */
Exhibit.UI.docRoot = "http://simile.mit.edu/wiki/";
Exhibit.UI.validator = "http://simile.mit.edu/babel/validator";

Exhibit.UI.showHelp = function(message, url, target) {
    target = (target) ? target : "_blank";
    if (url != null) {
        if (window.confirm(message + "\n\n" + Exhibit.l10n.showDocumentationMessage)) {
            window.open(url, target);
        }
    } else {
        window.alert(message);
    }
};

Exhibit.UI.showJavascriptExpressionValidation = function(message, expression) {
    var target = "_blank";
    if (window.confirm(message + "\n\n" + Exhibit.l10n.showJavascriptValidationMessage)) {
        window.open(Exhibit.UI.validator + "?expresson=" + encodeURIComponent(expression), target);
    }
};

Exhibit.UI.showJsonFileValidation = function(message, url) {
    var target = "_blank";
    if (url.indexOf("file:") == 0) {
        if (window.confirm(message + "\n\n" + Exhibit.l10n.showJsonValidationFormMessage)) {
            window.open(Exhibit.UI.validator, target);
        }
    } else {
        if (window.confirm(message + "\n\n" + Exhibit.l10n.showJsonValidationMessage)) {
            window.open(Exhibit.UI.validator + "?url=" + url, target);
        }
    }
};

/*======================================================================
 *  Status Indication and Feedback
 *======================================================================
 */
Exhibit.UI._busyIndicator = null;
Exhibit.UI._busyIndicatorCount = 0;

Exhibit.UI.showBusyIndicator = function() {
    Exhibit.UI._busyIndicatorCount++;
    if (Exhibit.UI._busyIndicatorCount > 1) {
        return;
    }
    
    if (Exhibit.UI._busyIndicator == null) {
        Exhibit.UI._busyIndicator = Exhibit.Theme.createBusyIndicator();
    }
    
    var scrollTop = ("scrollTop" in document.body) ?
        document.body.scrollTop :
        document.body.parentNode.scrollTop;
    var height = ("innerHeight" in window) ?
        window.innerHeight :
        ("clientHeight" in document.body ?
            document.body.clientHeight :
            document.body.parentNode.clientHeight);
        
    var top = Math.floor(scrollTop + height / 3);
    
    Exhibit.UI._busyIndicator.style.top = top + "px";
    document.body.appendChild(Exhibit.UI._busyIndicator);
};

Exhibit.UI.hideBusyIndicator = function() {
    Exhibit.UI._busyIndicatorCount--;
    if (Exhibit.UI._busyIndicatorCount > 0) {
        return;
    }
    
    try {
        document.body.removeChild(Exhibit.UI._busyIndicator);
    } catch(e) {
        // silent
    }
};

/*======================================================================
 *  Common UI Generation
 *======================================================================
 */
Exhibit.UI.protectUI = function(elmt) {
    SimileAjax.DOM.appendClassName(elmt, "exhibit-ui-protection");
};

Exhibit.UI.makeActionLink = function(text, handler, layer) {
    var a = document.createElement("a");
    a.href = "javascript:";
    a.className = "exhibit-action";
    a.innerHTML = text;
    
    var handler2 = function(elmt, evt, target) {
        if ("true" == elmt.getAttribute("disabled")) {
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        } else {
            return handler(elmt, evt, target);
        }
    }
    SimileAjax.WindowManager.registerEvent(a, "click", handler2, layer);
    
    return a;
};

Exhibit.UI.makeActionLinkWithObject = function(text, obj, handlerName, layer) {
    var a = document.createElement("a");
    a.href = "javascript:";
    a.className = "exhibit-action";
    a.innerHTML = text;
    
    var handler2 = function(elmt, evt, target) {
        if ("true" == elmt.getAttribute("disabled")) {
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        } else {
            return obj[handlerName].call(obj, elmt, evt, target);
        }
    }
    SimileAjax.WindowManager.registerEvent(a, "click", handler2, layer);
    
    return a;
};

Exhibit.UI.enableActionLink = function(a, enabled) {
    a.setAttribute("disabled", enabled ? "false" : "true");
    a.className = enabled ? "exhibit-action" : "exhibit-action-disabled";
};

Exhibit.UI.makeItemSpan = function(itemID, label, layer, lensRegistry, exhibit) {
    if (label == null) {
        label = database.getObject(itemID, "label");
    }
    if (label == null) {
        label = itemID;
    }
    
    var a = document.createElement("a");
    a.href = Exhibit.Persistence.getItemLink(itemID);
    a.className = "exhibit-item";
    a.innerHTML = label;
    
    var handler = function(elmt, evt, target) {
        Exhibit.UI.showItemInPopup(itemID, elmt, lensRegistry, exhibit);
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    }
    SimileAjax.WindowManager.registerEvent(a, "click", handler, layer);
    
    return a;
};

Exhibit.UI.makeValueSpan = function(label, valueType, layer) {
    var span = document.createElement("span");
    span.className = "exhibit-value";
    if (valueType == "url") {
        var a = document.createElement("a");
        a.target = "_blank";
        a.href = label;
        if (label.length > 50) {
            a.innerHTML = label.substr(0, 20) + " ... " + label.substr(label.length - 20);
        } else {
            a.innerHTML = label;
        }
        span.appendChild(a);
    } else {
        span.innerHTML = label;
    }
    return span;
};

Exhibit.UI.showItemInPopup = function(itemID, elmt, lensRegistry, exhibit) {
    var coords = SimileAjax.DOM.getPageCoordinates(elmt);
    var bubble = SimileAjax.Graphics.createBubbleForPoint(
        document, 
        coords.left + Math.round(elmt.offsetWidth / 2), 
        coords.top + Math.round(elmt.offsetHeight / 2), 
        400, // px
        300  // px
    );
    
    var itemLensDiv = document.createElement("div");
    var itemLens = lensRegistry.createLens(itemID, itemLensDiv, exhibit);
    bubble.content.appendChild(itemLensDiv);
};

Exhibit.UI.makeCopyButton = function(itemID, layer) {
    var button = Exhibit.Theme.createCopyButton(itemID == null);
    var handler = function(elmt, evt, target) {
        Exhibit.UI._showCopyMenu(elmt, itemID);
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    }
    SimileAjax.WindowManager.registerEvent(
        button, "click", handler, layer != null ? layer : SimileAjax.WindowManager.getHighestLayer());
        
    return button;
};

Exhibit.UI._showCopyMenu = function(elmt, itemID) {
    var popupDom = Exhibit.Theme.createPopupMenuDom(elmt);
    /*
    var makeMenuItem = function(exporter) {
        popupDom.appendMenuItem(
            exporter.getLabel(),
            null,
            function() {
                var text = (itemID) ?
                    exporter.exportOne(itemID, exhibit) :
                    exporter.exportMany(
                        exhibit.getBrowseEngine().getCurrentCollection().getCurrentSet(), exhibit);
                        
                Exhibit.Theme.createCopyDialogBox(text).open();
            }
        );
    }
    
    var exporters = exhibit.getExporters();
    for (var i = 0; i < exporters.length; i++) {
        makeMenuItem(exporters[i]);
    }
    */
    popupDom.open();
};

