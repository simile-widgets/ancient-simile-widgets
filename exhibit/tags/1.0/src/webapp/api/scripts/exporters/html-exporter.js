/*==================================================
 *  Exhibit.HTMLExporter
 *==================================================
 */
 
Exhibit.HTMLExporter = {
    getLabel: function() {
        return Exhibit.l10n.htmlExporterLabel;
    }
};

Exhibit.HTMLExporter.exportOne = function(itemID, exhibit) {
    return Exhibit.HTMLExporter._getGeneratedViewHTML(exhibit);
};

Exhibit.HTMLExporter.exportMany = function(set, exhibit) {
    return Exhibit.HTMLExporter._getGeneratedViewHTML(exhibit);
};

Exhibit.HTMLExporter._getGeneratedViewHTML = function(exhibit) {
    return exhibit.getViewPanel().getGeneratedViewHTML().replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
