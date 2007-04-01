/*==================================================
 *  Exhibit.ViewPanel classic theme
 *==================================================
 */
 
Exhibit.ViewPanel.theme = new Object();

Exhibit.ViewPanel.theme.constructDom = function(
    div,
    viewLabels,
    viewTooltips,
    onSelectView
) {
    var l10n = Exhibit.ViewPanel.l10n;
    var template = {
        elmt: div,
        className: "exhibit-viewPanel exhibit-ui-protection",
        children: [
            {   tag:        "div",
                className:  "exhibit-viewPanel-viewSelection",
                field:      "viewSelectionDiv"
            },
            {   tag:        "div",
                className:  "exhibit-viewPanel-viewContainer",
                field:      "viewContainerDiv"
            }
        ]
    };
    var dom = SimileAjax.DOM.createDOMFromTemplate(template);
    dom.getViewContainer = function() {
        return dom.viewContainerDiv;
    };
    dom.setViewIndex = function(index) {
        if (viewLabels.length > 1) {
            dom.viewSelectionDiv.innerHTML = "";
            
            var appendView = function(i) {
                var selected = (i == index);
                if (i > 0) {
                    dom.viewSelectionDiv.appendChild(document.createTextNode(" \u2022 "));
                }
                
                var span = document.createElement("span");
                span.className = selected ? 
                    "exhibit-viewPanel-viewSelection-selectedView" :
                    "exhibit-viewPanel-viewSelection-view";
                span.title = viewTooltips[i];
                span.innerHTML = viewLabels[i];
                
                if (!selected) {
                    var handler = function(elmt, evt, target) {
                        onSelectView(i);
                        SimileAjax.DOM.cancelEvent(evt);
                        return false;
                    }
                    SimileAjax.WindowManager.registerEvent(span, "click", handler);
                }
                dom.viewSelectionDiv.appendChild(span);
            };
            
            for (var i = 0; i < viewLabels.length; i++) {
                appendView(i);
            }
        }
    };
    
    return dom;
};
