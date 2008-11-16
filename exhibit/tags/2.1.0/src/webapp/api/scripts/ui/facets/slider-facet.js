/*==================================================
 *  Exhibit.SliderFacet
 *==================================================
 */

Exhibit.SliderFacet = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;

    this._expression = null;
    this._settings = {};

	this._selection = {min: null, max: null};
    this._range = {min: null, max: null}; //currently selected range
    this._maxRange = {min: null, max: null}; //total range of slider
};

Exhibit.SliderFacet._settingsSpecs = {
    "facetLabel":       { type: "text" },
    "scroll":           { type: "boolean", defaultValue: true },
    "height":           { type: "text" },
    "precision":        { type: "float", defaultValue: 1 },
    "histogram":        { type: "boolean", defaultValue: true },
    "height":           { type: "int", defaultValue: false },
    "width":            { type: "int", defaultValue: false },
    "horizontal":       { type: "boolean", defaultValue: true },
    "inputText":        { type: "boolean", defaultValue: true } 
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
    if ("selection" in configuration) {
        var selection = configuration.selection;
        facet._selection = {min: selection[0], max: selection[1]};
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

    this._slider = new Exhibit.SliderFacet.slider(this._dom.slider, this, this._settings.precision, this._settings.horizontal);
};

Exhibit.SliderFacet.prototype.hasRestrictions = function() {
    return (this._range.min && this._range.min != this._maxRange.min) || (this._range.max && this._range.max != this._maxRange.max);
};

Exhibit.SliderFacet.prototype.update = function(items) {
    if (this._settings.histogram) {
		var data = [];
		var n = 75; //number of bars on histogram
		var range = (this._maxRange.max - this._maxRange.min)/n //range represented by each bar
	    
		var database = this._uiContext.getDatabase();
		var path = this._expression.getPath();
		
		for(var i=0; i<n; i++) {
		    data[i] = path.rangeBackward(this._maxRange.min+i*range, this._maxRange.min+(i+1)*range, false, items, database).values.size();
		}
	
		this._slider.updateHistogram(data);
    }
};

Exhibit.SliderFacet.prototype.restrict = function(items) {
    if (!this.hasRestrictions()) {
	return items;
    }
    var path = this._expression.getPath();
    var database = this._uiContext.getDatabase();
    return path.rangeBackward(this._range.min, this._range.max, false, items, database).values;
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

Exhibit.SliderFacet.prototype.dispose = function() {
    this._uiContext.getCollection().removeFacet(this);
    this._uiContext = null;
    this._colorCoder = null;
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
    
    this._expression = null;
    this._settings = null;
    
    this._selection = null;
    this._range = null; //currently selected range
    this._maxRange = null; //total range of slider
};