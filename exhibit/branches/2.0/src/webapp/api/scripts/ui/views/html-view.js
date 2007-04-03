/*==================================================
 *  Exhibit.HTMLView
 *==================================================
 */

Exhibit.HTMLView = function(containerElmt, uiContext) {
    var view = this;
};

Exhibit.HTMLView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.HTMLView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    return view;
};

Exhibit.HTMLView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    console.log( configElmt, containerElmt, uiContext );
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var view = new Exhibit.HTMLView(
        containerElmt != null ? containerElmt : configElmt,
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    return view;
};

Exhibit.HTMLView.prototype.dispose = function() {
    this._dom.dispose();
    this._dom = null;

    this._uiContext.dispose();
    this._uiContext = null;

    this._div.innerHTML = "";
    this._div = null;
};
