Exhibit.Scraper = function(elmt, uiContext, settings) {
    this._elmt = elmt;
    this._uiContext = uiContext;
    this._settings = settings;
    
    if (elmt.nodeName.toLowerCase() == 'a') {
        elmt.href = "javascript:";
    }
}

Exhibit.Scraper._settingSpecs = {
    "scraperInput":  { type: "text" },
    "itemType":      { type: "text", defaultValue: "item" }
};

Exhibit.UI.generateCreationMethods(Exhibit.Scraper);
Exhibit.UI.registerComponent('scraper', Exhibit.Scraper);