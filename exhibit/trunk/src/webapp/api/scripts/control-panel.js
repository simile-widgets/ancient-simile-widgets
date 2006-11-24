/*======================================================================
 *  Exhibit.ControlPanel
 *  http://simile.mit.edu/wiki/Exhibit/API/ControlPanel
 *======================================================================
 */
 
Exhibit.ControlPanel = function(exhibit, div, configuration) {
    if (configuration == null) {
        var o = Exhibit.getAttribute(div, "configuration");
        if (o != null && o.length > 0) {
            try {
                o = eval(o);
                if (typeof o == "object") {
                    configuration = o;
                } else {
                    SimileAjax.Debug.log(
                        "The ex:configuration attribute value in <div id=\"exhibit-control-panel\"> does not evaluate to an object"
                    );
                }
            } catch (e) {
                SimileAjax.Debug.exception(
                    "The ex:configuration attribute value in <div id=\"exhibit-browse-panel\"> is not a valid Javascript expression",
                    e
                );
            }
        }
    }
    
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    
    var s = Exhibit.getAttribute(this._div, "exporters");
    if (s != null && s.length > 0) {
        var showHelp = function(expr) {
            Exhibit.showHelp(
                Exhibit.ControlPanel.l10n.badExporterExpressionMessage(expr),
                Exhibit.docRoot + "Exhibit/Configuring_Exporters"
            );
        };
        
        var a = s.split(",");
        for (var i = 0; i < a.length; i++) {
            var expr = a[i].trim();
            try {
                var o = eval(expr);
                if (typeof o == "object") {
                    exhibit.addExporter(o);
                } else {
                    showHelp(expr);
                    break;
                }
            } catch (e) {
                SimileAjax.Debug.exception("ControlPanel failed to parse ex:exporters", e);
                showHelp(expr);
                break;
            }
        }
    }
    
    this._initializeUI();
}

Exhibit.ControlPanel.prototype.getState = function() {
    return null;
};

Exhibit.ControlPanel.prototype.setState = function(state) {
};

Exhibit.ControlPanel.prototype._initializeUI = function() {
};
