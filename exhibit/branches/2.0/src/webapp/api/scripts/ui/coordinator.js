/*======================================================================
 *  Exhibit.Coordinator
 *======================================================================
 */
Exhibit.Coordinator = function(uiContext) {
    this._uiContext = uiContext;
}

Exhibit.Coordinator.create = function(configuration, uiContext) {
    var coordinator = new Exhibit.Coordinator(uiContext);
    
    return coordinator;
};

Exhibit.Coordinator.createFromDOM = function(div, uiContext) {
    var coordinator = new Exhibit.Coordinator(Exhibit.UIContext.createFromDOM(div, uiContext, false));
    
    return coordinator;
};

Exhibit.Coordinator.prototype.dispose = function() {
    this._uiContext.dispose();
    this._uiContext = null;
};

