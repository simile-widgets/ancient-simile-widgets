/*==================================================
 *  Exhibit.ExhibitJSONImporter
 *==================================================
 */
 
Exhibit.ExhibitJSONImporter = {
};
Exhibit.importers["application/json"] = Exhibit.ExhibitJSONImporter;

Exhibit.ExhibitJSONImporter.load = function(link, database, cont) {
    var url = Exhibit.Persistence.resolveURL(link.href);

    var fError = function(statusText, status, xmlhttp) {
        Exhibit.UI.hideBusyIndicator();
        Exhibit.UI.showHelp(Exhibit.l10n.failedToLoadDataFileMessage(url));
        if (cont) cont();
    };
    
    var fDone = function(xmlhttp) {
        Exhibit.UI.hideBusyIndicator();
        try {
            var o = null;
            try {
                o = eval("(" + xmlhttp.responseText + ")");
            } catch (e) {
                Exhibit.UI.showJsonFileValidation(Exhibit.l10n.badJsonMessage(url, e), url);
            }
            
            if (o != null) {
                database.loadData(o, Exhibit.Persistence.getBaseURL(url));
            }
        } catch (e) {
            SimileAjax.Debug.exception("Error loading Exhibit JSON data from " + url, e);
        } finally {
            if (cont) cont();
        }
    };

    Exhibit.UI.showBusyIndicator();
    SimileAjax.XmlHttp.get(url, fError, fDone);
};
