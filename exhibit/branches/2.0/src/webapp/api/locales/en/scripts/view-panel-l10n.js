/*==================================================
 *  Exhibit.ViewPanel English localization
 *==================================================
 */
 
Exhibit.ViewPanel.l10n = {
    createSelectViewActionTitle: function(viewLabel) {
        return "select " + viewLabel + " view";
    },
    missingViewClassMessage: "The specification for one of the views is missing the viewClass field.",
    viewClassNotFunctionMessage: function(expr) {
        return "The viewClass attribute value '" + expr + "' you have specified\n" +
            "for one of the views does not evaluate to a Javascript function.";
    },
    badViewClassMessage: function(expr) {
        return "The viewClass attribute value '" + expr + "' you have specified\n" +
            "for one of the views is not a valid Javascript expression.";
    }
};
