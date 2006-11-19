/*======================================================================
 *  Exhibit.ControlPanel
 *  http://simile.mit.edu/wiki/Exhibit/API/ControlPanel
 *======================================================================
 */
 
Exhibit.ControlPanel = function(exhibit, div, configuration) {
    if (configuration == null) {
        var o = Exhibit.getAttribute(div, "configuration");
        try {
            o = eval(o);
            if (typeof o == "object") {
                configuration = o;
            }
        } catch (e) {
        }
    }
    
    this._exhibit = exhibit;
    this._div = div;
    this._configuration = configuration;
    
    var s = Exhibit.getAttribute(this._div, "exporters");
    if (s != null && s.length > 0) {
        var a = s.split(",");
        for (var i = 0; i < a.length; i++) {
            try {
                var o = eval(a[i].trim());
                if (typeof o == "object") {
                    exhibit.addExporter(o);
                }
            } catch (e) {
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
