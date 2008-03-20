/*==================================================
 *  Exhibit.SliderFacet
 *==================================================
 */

Exhibit.SliderFacet = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;

    this._expression = null;
    this._settings = {};

    this._range = {min: null, max: null}; //currently selected range
    this._maxRange = {min: null, max: null}; //total range of slider
};

Exhibit.SliderFacet._settingsSpecs = {
    "facetLabel":       { type: "text" },
    "scroll":           { type: "boolean", defaultValue: true },
    "height":           { type: "text" },
    "precision":        { type: "float", defaultValue: 1 }
};

Exhibit.SliderFacet.create = function(configuration, containerElmt, uiContext) {
    var uiContext = Exhibit.UIContext.create(configuration, uiContext);
    var facet = new Exhibit.SliderFacet(containerElmt, uiContext);

    Exhibit.SliderFacet._configure(facet, configuration);

    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);

    return facet;
};

Exhibit.SliderFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var uiContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    var facet = new Exhibit.SliderFacet(
	containerElmt != null? containerElmt : configElmt,
	uiContext
    );

    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.SliderFacet._settingsSpecs, facet._settings);

    try {
        var expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString != null && expressionString.length > 0) {
            facet._expression = Exhibit.ExpressionParser.parse(expressionString);
        }
    } catch (e) {
        SimileAjax.Debug.exception(e, "SliderFacet: Error processing configuration of slider facet");
    }

    Exhibit.SliderFacet._configure(facet, configuration);
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);

    return facet;
};

Exhibit.SliderFacet._configure = function(facet, configuration) {
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.SliderFacet._settingsSpecs, facet._settings);

    if ("expression" in configuration) {
	facet._expression = Exhibit.ExpressionParser.parse(configuration.expression);
    }

    if (!("facetLabel" in facet._settings)) {
	facet._settings.facetLabel = "missing ex:facetLabel";
	if (facet._expression != null && facet._expression.isPath()) {
	    var segment = facet._expression.getPath().getLastSegment();
	    var property = facet._uiContext.getDatabase().getProperty(segment.property);
	    if (property != null) {
		facet._settings.facetLabel = segment.forward ? property.getLabel() : property.getReverseLabel();
	    }
	}
    }

    facet._maxRange = facet._getMaxRange();
};

Exhibit.SliderFacet.prototype._initializeUI = function() {
    this._dom = SimileAjax.DOM.createDOMFromString(
       this._div,
       "<div class='exhibit-facet-header'>" +
           "<span class='exhibit-facet-header-title'>" + this._settings.facetLabel + "</span>" +
       "</div>" +
       "<div class='exhibit-slider' id='slider'></div>"
    );

    this._slider = new Exhibit.SliderFacet.slider(this._dom.slider, this, this._settings.precision);
};

Exhibit.SliderFacet.prototype.hasRestrictions = function() {
    return (this._range.min && this._range.min != this._maxRange.min) || (this._range.max && this._range.max != this._maxRange.max);
};

Exhibit.SliderFacet.prototype.update = function(items) {
    // do nothing
};

Exhibit.SliderFacet.prototype.restrict = function(items) {
    if (!this.hasRestrictions()) {
	return items;
    }
    var path = this._expression.getPath();
    var database = this._uiContext.getDatabase();
    return path.rangeBackward(this._range.min, this._range.max, items, database).values;
};

Exhibit.SliderFacet.prototype._getMaxRange = function() {
    var path = this._expression.getPath();
    var database = this._uiContext.getDatabase();
    var propertyID = path.getLastSegment().property;
    var property = database.getProperty(propertyID);
    var rangeIndex = property.getRangeIndex();

    return {min: rangeIndex.getMin(), max: rangeIndex.getMax()};
};

Exhibit.SliderFacet.prototype.changeRange = function(range) {
    this._range = range;
    this._notifyCollection();
};

Exhibit.SliderFacet.prototype._notifyCollection = function() {
    this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.SliderFacet.prototype.clearAllRestrictions = function() {
    this._slider.resetSliders();
    this._range = this._maxRange;
};