/*==================================================
 *  Exhibit classic theme (common stuff)
 *==================================================
 */
 
Exhibit.Theme = {
    urlPrefix:  Exhibit.urlPrefix + "themes/classic/",
    createTranslucentImage: function(doc, url) {
        return SimileAjax.Graphics.createTranslucentImage(
            doc, Exhibit.Theme.urlPrefix + url
        );
    },
    
    createPopupMenuDom: function(element) {
        var div = document.createElement("div");
        div.className = "exhibit-menu-popup exhibit-ui-protection";
        
        var dom = {
            elmt: div,
            close: function() {
                document.body.removeChild(this.elmt);
            },
            open: function() {
                var self = this;
                this.layer = SimileAjax.WindowManager.pushLayer(function() { self.close(); }, true);
                    
                var docWidth = document.body.offsetWidth;
                var docHeight = document.body.offsetHeight;
            
                var coords = SimileAjax.DOM.getPageCoordinates(element);
                div.style.top = (coords.top + element.scrollHeight) + "px";
                div.style.right = (docWidth - (coords.left + element.scrollWidth)) + "px";
            
                document.body.appendChild(this.elmt);
            },
            appendMenuItem: function(label, icon, onClick) {
                var self = this;
                var a = document.createElement("a");
                a.className = "exhibit-menu-item";
                a.href = "javascript:";
                SimileAjax.WindowManager.registerEvent(a, "click", function(elmt, evt, target) {
                    onClick(elmt, evt, target);
                    SimileAjax.WindowManager.popLayer(self.layer);
                    SimileAjax.DOM.cancelEvent(evt);
                    return false;
                });
                
                var div = document.createElement("div");
                a.appendChild(div);
        
                div.appendChild(SimileAjax.Graphics.createTranslucentImage(document, 
                    icon != null ? icon : (Exhibit.Theme.urlPrefix + "images/blank-16x16.png")));
                    
                div.appendChild(document.createTextNode(label));
                
                this.elmt.appendChild(a);
            },
            appendSeparator: function() {
                var hr = document.createElement("hr");
                this.elmt.appendChild(hr);
            }
        };
        return dom;
    },
    createCopyButton: function(all) {
        var button = document.createElement("button");
        button.className = "exhibit-copyButton";
        button.innerHTML = all ? Exhibit.l10n.copyAllButtonLabel : Exhibit.l10n.copyButtonLabel;
        return button;
    },
    createCopyDialogBox: function(string) {
        var template = {
            tag:        "div",
            className:  "exhibit-copyDialog exhibit-ui-protection",
            children: [
                {   tag:        "button",
                    field:      "closeButton",
                    children:    [ Exhibit.l10n.copyDialogBoxCloseButtonLabel ]
                },
                {   tag:        "p",
                    children:   [ Exhibit.l10n.copyDialogBoxPrompt ]
                },
                {   tag:        "div",
                    field:      "textAreaContainer"
                }
            ]
        };
        var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
        dom.textAreaContainer.innerHTML = 
            "<textarea wrap='off' rows='15'>" + string + "</textarea>";
            
        dom.close = function() {
            document.body.removeChild(dom.elmt);
        };
        dom.open = function() {
            dom.elmt.style.top = (document.body.scrollTop + 100) + "px";
            
            document.body.appendChild(dom.elmt);
            dom.layer = SimileAjax.WindowManager.pushLayer(function() { dom.close(); }, false);
            
            var textarea = dom.textAreaContainer.firstChild;
            textarea.select();
            
            SimileAjax.WindowManager.registerEvent(
                dom.closeButton, 
                "click", 
                function(elmt, evt, target) {
                    SimileAjax.WindowManager.popLayer(dom.layer);
                    SimileAjax.DOM.cancelEvent(evt);
                    return false;
                }, 
                dom.layer
            );
            SimileAjax.WindowManager.registerEvent(
                textarea, 
                "keyup", 
                function(elmt, evt, target) {
                    if (evt.keyCode == 27) { // ESC
                        SimileAjax.WindowManager.popLayer(dom.layer);
                        SimileAjax.DOM.cancelEvent(evt);
                        return false;
                    }
                    return true;
                }, 
                dom.layer
            );
        };
        
        return dom;
    },
    createFocusDialogBox: function(itemID, exhibit, configuration) {
        var template = {
            tag:        "div",
            className:  "exhibit-focusDialog exhibit-ui-protection",
            children: [
                {   tag:        "div",
                    className:  "exhibit-focusDialog-viewContainer",
                    field:      "viewContainer"
                },
                {   tag:        "div",
                    className:  "exhibit-focusDialog-controls",
                    children: [
                        {   tag:        "button",
                            field:      "closeButton",
                            children:    [ Exhibit.l10n.focusDialogBoxCloseButtonLabel ]
                        }
                    ]
                }
            ]
        };
        var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
        dom.close = function() {
            document.body.removeChild(dom.elmt);
        };
        dom.open = function() {
            dom.layer = SimileAjax.WindowManager.pushLayer(function() { dom.close(); }, false);
            var lens = new Exhibit.Lens(itemID, dom.viewContainer, exhibit, configuration);
            
            dom.elmt.style.top = (document.body.scrollTop + 100) + "px";
            document.body.appendChild(dom.elmt);
            
            SimileAjax.WindowManager.registerEvent(
                dom.closeButton, 
                "click", 
                function(elmt, evt, target) {
                    SimileAjax.WindowManager.popLayer(dom.layer);
                    SimileAjax.DOM.cancelEvent(evt);
                    return false;
                }, 
                dom.layer
            );
        };
        
        return dom;
    },
    createBusyIndicator: function() {
        var urlPrefix = Exhibit.Theme.urlPrefix;
        var containerDiv = document.createElement("div");
        if (SimileAjax.Graphics.pngIsTranslucent) {
            
            var topDiv = document.createElement("div");
            topDiv.style.height = "33px";
            topDiv.style.background = "url(" + urlPrefix + "images/message-top-left.png) top left no-repeat";
            topDiv.style.paddingLeft = "44px";
            containerDiv.appendChild(topDiv);
            
            var topRightDiv = document.createElement("div");
            topRightDiv.style.height = "33px";
            topRightDiv.style.background = "url(" + urlPrefix + "images/message-top-right.png) top right no-repeat";
            topDiv.appendChild(topRightDiv);
            
            var middleDiv = document.createElement("div");
            middleDiv.style.background = "url(" + urlPrefix + "images/message-left.png) top left repeat-y";
            middleDiv.style.paddingLeft = "44px";
            containerDiv.appendChild(middleDiv);
            
            var middleRightDiv = document.createElement("div");
            middleRightDiv.style.background = "url(" + urlPrefix + "images/message-right.png) top right repeat-y";
            middleRightDiv.style.paddingRight = "44px";
            middleDiv.appendChild(middleRightDiv);
            
            var contentDiv = document.createElement("div");
            middleRightDiv.appendChild(contentDiv);
            
            var bottomDiv = document.createElement("div");
            bottomDiv.style.height = "55px";
            bottomDiv.style.background = "url(" + urlPrefix + "images/message-bottom-left.png) bottom left no-repeat";
            bottomDiv.style.paddingLeft = "44px";
            containerDiv.appendChild(bottomDiv);
            
            var bottomRightDiv = document.createElement("div");
            bottomRightDiv.style.height = "55px";
            bottomRightDiv.style.background = "url(" + urlPrefix + "images/message-bottom-right.png) bottom right no-repeat";
            bottomDiv.appendChild(bottomRightDiv);
        } else {
            containerDiv.style.border = "2px solid #7777AA";
            containerDiv.style.padding = "20px";
            containerDiv.style.background = "white";
            SimileAjax.Graphics.setOpacity(containerDiv, 90);
            
            var contentDiv = document.createElement("div");
            containerDiv.appendChild(contentDiv);
        }
        
        containerDiv.className = "exhibit-busyIndicator";
        contentDiv.className = "exhibit-busyIndicator-content";
        
        var img = document.createElement("img");
        img.src = urlPrefix + "images/progress-running.gif";
        contentDiv.appendChild(img);
        contentDiv.appendChild(document.createTextNode(" " + Exhibit.l10n.busyIndicatorMessage));
        
        return containerDiv;
    }
};
