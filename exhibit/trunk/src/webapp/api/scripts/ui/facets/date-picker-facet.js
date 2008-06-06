/*==================================================
 *  Exhibit.DatePickerFacet
 *==================================================
 */

Exhibit.DatePickerFacet = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;

    this._expression = null;
    this._settings = {};
    this._dom = null;
    this._datePicker = null;
    
    this._range = {min: null, max: null}; //currently selected range
    this._dateFormat = 'y-MM-dd';
};

Exhibit.DatePickerFacet._settingsSpecs = {
    "facetLabel":       { type: "text" },
    "dateFormat":       { type: "text" }
};

Exhibit.DatePickerFacet.create = function(configuration, containerElmt, uiContext) {
    var uiContext = Exhibit.UIContext.create(configuration, uiContext);
    var facet = new Exhibit.DatePickerFacet(containerElmt, uiContext);

    Exhibit.DatePickerFacet._configure(facet, configuration);

    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);

    return facet;
};

Exhibit.DatePickerFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var uiContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    var facet = new Exhibit.DatePickerFacet(
  	  containerElmt != null? containerElmt : configElmt,
  	  uiContext
    );

    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.DatePickerFacet._settingsSpecs, facet._settings);

    try {
        var expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString != null && expressionString.length > 0) {
            facet._expression = Exhibit.ExpressionParser.parse(expressionString);
        }
    } catch (e) {
        SimileAjax.Debug.exception(e, "DatePickerFacet: Error processing configuration of date range facet");
    }

    Exhibit.DatePickerFacet._configure(facet, configuration);
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);

    return facet;
};

Exhibit.DatePickerFacet._configure = function(facet, configuration) {
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.DatePickerFacet._settingsSpecs, facet._settings);

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
};

Exhibit.DatePickerFacet.prototype._initializeUI = function() {
    var self = this;
    
    this._dom = this.constructFacetFrame(this._div, this._settings.facetLabel);
    
    if (this._range.min != null && this._range.max != null) {
        this._dom.range_min.value = this._range.min;
        this._dom.range_max.value = this._range.max;
    }
    
    this._datePicker = Exhibit.DatePickerFacet.DatePicker.create(this._dom.DatePicker, this, new Date());
    
    SimileAjax.WindowManager.registerEvent(this._dom.range_min, "keyup",
        function(elmt, evt, target) { self._onDateFieldChange(elmt, evt); });
    SimileAjax.WindowManager.registerEvent(this._dom.range_max, "keyup",
        function(elmt, evt, target) { self._onDateFieldChange(elmt, evt); });
};

Exhibit.DatePickerFacet.prototype.constructFacetFrame = function(div, facetLabel) {
  var self = this;
  var domString = ["<div class='exhibit-facet-header'>",
                        "<div class='exhibit-facet-header-filterControl' id='clearSelectionsDiv' title='",
                            Exhibit.FacetUtilities.l10n.clearSelectionsTooltip, "'>",
                            "<span id='filterCountSpan'></span>",
                            "<img id='checkImage' />",
                        "</div>",
                        "<span class='exhibit-facet-header-title'>", facetLabel, "</span>",
                    "</div>",
                    "<div class='exhibit-date-picker' id='DatePicker'></div>",
                    "<div class='exhibit-date-picker-text'><input type='text' id='range_min' size='10' style='width:auto;'> - ",
                    "<input type='text' id='range_max' size='10' style='width:auto;'></div>"].join('');

  var dom = SimileAjax.DOM.createDOMFromString(div, domString,
      { checkImage: Exhibit.UI.createTranslucentImage("images/black-check.png") });
  dom.setSelectionCount = function(display, count) {
      this.filterCountSpan.innerHTML = count;
      this.clearSelectionsDiv.style.display = display ? "block" : "none";
  };
  SimileAjax.WindowManager.registerEvent(dom.clearSelectionsDiv, "click", function(elmt, evt, target) { self._clearSelections(); });
  return dom;
};

Exhibit.DatePickerFacet.prototype.hasRestrictions = function() {
  return (this._range.min != null && this._range.max != null);
};

Exhibit.DatePickerFacet.prototype.clearAllRestrictions = function() {
  var restrictions = this._range;
  if (this.hasRestrictions) {
      this._range = {min: null, max: null};
      this._notifyCollection();
  }
  this._dom.range_min.value = "";
  this._dom.range_max.value = "";

  return restrictions;
};

Exhibit.DatePickerFacet.prototype.applyRestrictions = function(restrictions) {
  this.setRange(restrictions);
};

Exhibit.DatePickerFacet.prototype.restrict = function(items) {
    if (!this.hasRestrictions()) {
      this._dom.setSelectionCount(this.hasRestrictions(), 0);
      return items;
    }
    else{
      var path = this._expression.getPath();
      var database = this._uiContext.getDatabase();
    
      var set = new Exhibit.Set();
      min = SimileAjax.DateTime.parseIso8601DateTime(this._range.min);
      max = SimileAjax.DateTime.parseIso8601DateTime(this._range.max);
      set.addSet(path.rangeBackward(min, max.setUTCDate(max.getUTCDate() + 1), false, items, database).values);
      this._dom.setSelectionCount(this.hasRestrictions(), Math.floor((max - min)/(24*60*60*1000)));
      return set;
    }
};

Exhibit.DatePickerFacet.prototype._notifyCollection = function() {
  this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.DatePickerFacet.prototype._clearSelections = function() {
  this.clearAllRestrictions();
  this._datePicker.update();
  this._dom.setSelectionCount(this.hasRestrictions(), 0);
};

Exhibit.DatePickerFacet.prototype.update = function(items) {
  // Nothing to do here
};

Exhibit.DatePickerFacet.prototype._onDateFieldChange = function(elmt, evt) {
  
  if (this._dom.range_min.value && 
      Exhibit.DatePickerFacet.DateUtil.parseDate(this._dom.range_min.value) &&
      this._dom.range_max.value && 
      Exhibit.DatePickerFacet.DateUtil.parseDate(this._dom.range_max.value)) {

    min_date = Exhibit.DatePickerFacet.DateUtil.parseDate(this._dom.range_min.value);
    max_date = Exhibit.DatePickerFacet.DateUtil.parseDate(this._dom.range_max.value);
    
    if (min_date && max_date) {
      var self = this;

      // If max is less than min, reverse
      if (max_date < min_date) {
        old_min = this._dom.range_min.value;
        this._dom.range_min.value = this._dom.range_max.value;
        this._dom.range_max.value = old_min;
      }

      var newRange = {min: this._dom.range_min.value,
                      max: this._dom.range_max.value};

      if (newRange.min != this._range.min || newRange.max != this._range.max) {
          var self = this;
          var oldRange = this._range;

          SimileAjax.History.addLengthyAction(
              function() { self.setRange(newRange);self._datePicker.update(); },
              function() { self.setRange(oldRange);self._datePicker.update(); },
              "Clear date range search" //TODO: Internationalize
          );
      }
    }
    
  }  
};

Exhibit.DatePickerFacet.prototype.setRange = function(range) {
    if (range.min != null && range.max != null) {
        min_date = Exhibit.DatePickerFacet.DateUtil.parseDate(range.min);
        max_date = Exhibit.DatePickerFacet.DateUtil.parseDate(range.max);
    
        this._dom.range_min.value = Exhibit.DatePickerFacet.DateUtil.formatDate(min_date, this._dateFormat);
        this._dom.range_max.value = Exhibit.DatePickerFacet.DateUtil.formatDate(max_date, this._dateFormat);
    }

    if (range.min != this._range.min || range.max != this._range.max) {
        this._range = range;
        this._notifyCollection();
    }
};

Exhibit.DatePickerFacet.prototype.dateInCurrentRange = function(date) {
  if (this._range.min != null && this._range.max != null) {
      min_date = Exhibit.DatePickerFacet.DateUtil.parseDate(this._range.min);
      max_date = Exhibit.DatePickerFacet.DateUtil.parseDate(this._range.max);
      // alert
    return (date >= (min_date-24*60*60*1000)) && (date <= max_date);
  }
  else {
    return false;
  }
};

Exhibit.DatePickerFacet.prototype.dateRangeInCurrentRange = function(range) {
  return this.dateInCurrentRange(range.min) && this.dateInCurrentRange(range.max);
};

Exhibit.DatePickerFacet.prototype.changeDate = function(date) {
  this._datePicker.update(Exhibit.DatePickerFacet.DateUtil.parseDate(date));
};

Exhibit.DatePickerFacet.prototype.selectDate = function(date) {
  if (this._dom.range_min.value.trim() != '' && this._dom.range_max.value.trim() != '') {
    this._dom.range_min.value = '';
    this._dom.range_max.value = '';
  }
  
  // Start higlighting if this is the first date selection
  if (this._dom.range_min.value.trim() == '' && this._dom.range_max.value.trim() == '') {
    this._datePicker.startHighlighting(date);
  }
  
  if (this._dom.range_min.value.trim() == '') {
    this._dom.range_min.value = date;
  }
  else{
    this._dom.range_max.value = date;
    this._datePicker.stopHighlighting();
  }
    
  this._onDateFieldChange();
};

Exhibit.DatePickerFacet.prototype.selectRange = function(fromDate, toDate) {
  this._dom.range_min.value = fromDate;
  this._dom.range_max.value = toDate;
  this._onDateFieldChange();
};

Exhibit.DatePickerFacet.prototype.dateHasItems = function(date) {
  var path = this._expression.getPath();
  var database = this._uiContext.getDatabase();
  var items = database.getAllItems();
  var toDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  toDate = new Date(toDate.setDate(toDate.getDate()+1));
  return path.rangeBackward(date, toDate, false, items, database).count > 0;
};