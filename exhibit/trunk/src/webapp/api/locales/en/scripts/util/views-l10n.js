/*==================================================
 *  Exhibit.ViewUtilities Norwegian (Bokmål) localization
 *==================================================
 */

if (!("l10n" in Exhibit.ViewUtilities)) {
    Exhibit.ViewUtilities.l10n = {};
}

Exhibit.ViewUtilities.l10n.unplottableMessageFormatter = function(totalCount, unplottableItems, uiContext) {
    var count = unplottableItems.length;
    
    return String.substitute(
        "<a class='exhibit-action exhibit-views-unplottableCount' href='javascript:void' id='unplottableCountLink'>%0</a> "+
        "av tilsammen <class class='exhibit-views-totalCount'>%1</span> kan ikke bli vist.",
        [ count == 1 ? (count + " result") : (count + " results"), totalCount ]
    );
};
