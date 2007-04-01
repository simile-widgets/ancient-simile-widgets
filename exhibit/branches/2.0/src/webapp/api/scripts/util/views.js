/*==================================================
 *  Exhibit.ViewUtilities
 *
 *  Utilities for views' code.
 *==================================================
 */
Exhibit.ViewUtilities = new Object();

Exhibit.ViewUtilities.openBubbleForItems = function(anchorElmt, arrayOfItemIDs, uiContext) {
    var coords = SimileAjax.DOM.getPageCoordinates(anchorElmt);
    var bubble = SimileAjax.Graphics.createBubbleForPoint(
        coords.left + Math.round(elmt.offsetWidth / 2), 
        coords.top + Math.round(elmt.offsetHeight / 2), 
        uiContext.getSetting("bubbleWidth"), // px
        uiContext.getSetting("bubbleHeight") // px
    );
    Exhibit.ViewUtilities.fillBubbleWithItems(bubble.content, arrayOfItemIDs, uiContext);
};

Exhibit.ViewUtilities.fillBubbleWithItems = function(bubbleElmt, arrayOfItemIDs, uiContext) {
    if (bubbleElmt == null) {
        bubbleElmt = document.createElement("div");
    }
    
    if (arrayOfItemIDs.length > 1) {
        var ul = document.createElement("ul");
        for (var i = 0; i < arrayOfItemIDs.length; i++) {
            var li = document.createElement("li");
            li.appendChild(Exhibit.UI.makeItemSpan(arrayOfItemIDs[i], null, uiContext));
            ul.appendChild(li);
        }
        bubbleElmt.appendChild(ul);
    } else {
        var itemLensDiv = document.createElement("div");
        var itemLens = uiContext.getLensRegistry().createLens(arrayOfItemIDs[0], itemLensDiv, uiContext);
        bubbleElmt.appendChild(itemLensDiv);
    }
    
    return bubbleElmt;
};
