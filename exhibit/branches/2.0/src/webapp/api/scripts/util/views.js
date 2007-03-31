/*==================================================
 *  Exhibit.ViewUtilities
 *
 *  Utilities for various parts of Exhibit to 
 *  collect their settings.
 *==================================================
 */
Exhibit.ViewUtilities = new Object();

Exhibit.ViewUtilities.openBubbleForItems = function(anchorElmt, arrayOfItemIDs, bubbleWidth, bubbleHeight, lensRegistry, exhibit) {
    var coords = SimileAjax.DOM.getPageCoordinates(anchorElmt);
    var bubble = SimileAjax.Graphics.createBubbleForPoint(
        document, 
        coords.left + Math.round(elmt.offsetWidth / 2), 
        coords.top + Math.round(elmt.offsetHeight / 2), 
        bubbleWidth, // px
        bubbleHeight // px
    );
    Exhibit.ViewUtilities.fillBubbleWithItems(bubble.content, arrayOfItemIDs, lensRegistry, exhibit);
};

Exhibit.ViewUtilities.fillBubbleWithItems = function(bubbleElmt, arrayOfItemIDs, lensRegistry, exhibit) {
    if (bubbleElmt == null) {
        bubbleElmt = document.createElement("div");
    }
    
    if (arrayOfItemIDs.length > 1) {
        var ul = document.createElement("ul");
        for (var i = 0; i < arrayOfItemIDs.length; i++) {
            var li = document.createElement("li");
            li.appendChild(Exhibit.UI.makeItemSpan(arrayOfItemIDs[i], null, null, lensRegistry, exhibit));
            ul.appendChild(li);
        }
        bubbleElmt.appendChild(ul);
    } else {
        var itemLensDiv = document.createElement("div");
        var itemLens = lensRegistry.createLens(arrayOfItemIDs[0], itemLensDiv, exhibit);
        bubbleElmt.appendChild(itemLensDiv);
    }
    
    return bubbleElmt;
};
