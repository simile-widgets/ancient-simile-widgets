/*==================================================
 *  Classic theme
 *==================================================
 */
(function() {
    var javascriptFiles = [
        "list-facet-theme.js",
        "view-panel-theme.js",
        "ordered-view-frame-theme.js",
        "tile-view-theme.js",
        "map-view-theme.js",
        "timeline-view-theme.js",
        "thumbnail-view-theme.js"
    ];
    var cssFiles = [
        "exhibit.css",
        
        "browse-panel.css",
        "list-facet.css",
        
        "view-panel.css",
        "tile-view.css",
        "map-view.css",
        "timeline-view.css",
        "thumbnail-view.css",
        "item-view.css"
    ];

    var urlPrefix = Exhibit.urlPrefix + "themes/classic/";
    SimileAjax.includeJavascriptFiles(document, urlPrefix + "scripts/", javascriptFiles);
    SimileAjax.includeCssFiles(document, urlPrefix + "styles/", cssFiles);
})();

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
    }
};