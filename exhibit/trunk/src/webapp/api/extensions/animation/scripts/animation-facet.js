/*==================================================
 *  Exhibit.AnimationFacet
 *==================================================
 */

/* --------------------------------------------------------------------
 * Constructor
 * -------------------------------------------------------------------- */
Exhibit.AnimationFacet = function(containerElmt, uiContext) {
	this._div = containerElmt;				// UI <div>
	this._uiContext = uiContext;
	
	this._expression = null;				// Created from ex:expression using Exhibit.ExpressionParser.parse()
	
	// ---Mode---
	// Facet can operate in three modes (see below).
	this._mode = Exhibit.AnimationFacet.MODE_NONE;
	
	// List mode : acts like a ListFacet, uses a structure (_listModePeriods)
	//   to set specific values at different periods.
	this._listModePeriods = null;			// When in list mode, which passages map to which facet values { from:<sec> , to:<sec> select:[a,b,c] }
	this._listModeCurrentPeriods = [];		// Which periods are currently 'in play'
	
	// Range mode : acts like a SliderFacet, the _rangeModePrecision determines how
	//   the data is grouped, and how often the facet changes value.  So precision of
	//   100 will group data as 'centuries', and call _notifyCollection accordingly.
	//   Data must be numberic.
	this._rangeModePrecision = null;		// When range mode, interval to group values on
	this._rangeModeMaxRange = {min:null , max:null}; 		// Max range, lowered/raised to precision boundary
	this._rangeModeCurrentRange = {min:null , max:null};	// Current value, low/raise to prec. boundary
	
	// Date mode : acts like range mode, except groups are based on days, months
	//   or years.  Data must be dates.
	this._dateModeInterval = null;
	
	this._settings = {};					// Settings from HTML
	
	this._ui = null;
	
	// _formatter = code from evaluating in _configure()
	// _cache = list mode: cache of database, collection and expression
	// _rangeIndex = used in range mode
};

/* --------------------------------------------------------------------
 * Constants etc.
 * -------------------------------------------------------------------- */

// Date mode
Exhibit.AnimationFacet.DAY = 'day';
Exhibit.AnimationFacet.MONTH = 'month';
Exhibit.AnimationFacet.YEAR = 'year';

// Data filtering mode
Exhibit.AnimationFacet.MODE_NONE = 0;
Exhibit.AnimationFacet.MODE_LIST = 1;
Exhibit.AnimationFacet.MODE_RANGE = 2;
Exhibit.AnimationFacet.MODE_DATE = 3;

// Debug
Exhibit.AnimationFacet.DEBUG1 = false;

// http://www.opinionatedgeek.com/dotnet/tools/base64encode/
Exhibit.AnimationFacet.PLAY_PNG =  "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDGw42NiWo9VwAAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAADtJREFUKM+VjzEKACAAAu+i/3+5lpYgQgU3DxVgHUfyEbYFvqDBHFvgAhsAgEGpWWRNAdMG00mmH0yObCp4Bx5kUSOtAAAAAElFTkSuQmCC";
Exhibit.AnimationFacet.PAUSE_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDGw43G3lsmGgAAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAAB1JREFUKM9jZGBg+M+ACRihNIYcEwOJYFTDSNEAAI/YAhcjCBZEAAAAAElFTkSuQmCC";

// Used to build unique function names for JavaScript timer
Exhibit.AnimationFacet._getNextAnimationUnique = function() {
	if(!Exhibit.AnimationFacet._animationCounter) {
		Exhibit.AnimationFacet._animationCounter = 0;
	}
	var r = Exhibit.AnimationFacet._animationCounter;
	Exhibit.AnimationFacet._animationCounter++;
	return r;
}

/* ex:xxx attributes in HTML */
Exhibit.AnimationFacet._settingSpecs = {
	"facetLabel":		{ type: "text" },
	"showLabel":		{ type: "boolean" , defaultValue: true },
	"type":				{ type: "text", defaultValue: "default" },
	"width":			{ type: "text" },
	"height":			{ type: "text" },
	"formatter":		{ type: "text", defaultValue: null}, // FIXME: keep this in?
	"startTime":		{ type: "int", defaultValue: 0 },  // FIXME: unsupported
	"duration":			{ type: "int", defaultValue: 60 }
};
// selections      List mode <struct>
// precision       Range mode <int>
// datePrecision   Date mode ["year"|"month"|"day"]
// expression


/* --------------------------------------------------------------------
 * Creation, configure and dispose.
 * -------------------------------------------------------------------- */

/** 
 * Manufacture object.
 */
Exhibit.AnimationFacet.create = function(configuration, containerElmt, uiContext) {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('create',configuration,containerElmt,uiContext);
	
	var uiContext = Exhibit.UIContext.create(configuration, uiContext);
	var facet = new Exhibit.AnimationFacet(containerElmt, uiContext);
	
	Exhibit.AnimationFacet._configure(facet, configuration);
	
	facet._initializeUI();
	uiContext.getCollection().addFacet(facet);
	
	return facet;
};

/**
 * Create facet using <div>'s attributes.
 *   configElmt = <div>
 */
Exhibit.AnimationFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('createFromDOM',configElmt,containerElmt,uiContext);
	
	// Look for ex:configuration in <div>, otherwise returns {} (empty Object)
	// FIXME: Legacy code?
	/*var configuration = Exhibit.getConfigurationFromDOM(configElmt);*/
	// Create Exhibit context for this facet
	var uiContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
	// Create facet
	var facet = new Exhibit.AnimationFacet(
		containerElmt != null ? containerElmt : configElmt, 
		uiContext
	);
	
	// Use _settingSpecs to extract _settings from <div>.  As the UI gets a 
	// chance to extend this with bespoke settings, don't pass in the original...
	/*var ss = {}
	for(var k in Exhibit.AnimationFacet._settingSpecs) {
		ss[k] = Exhibit.AnimationFacet._settingSpecs[k]
	}
	facet._ui.extendSettingSpecs(ss);  // Want to add some more..?
	Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, ss, facet._settings);*/
	Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.AnimationFacet._settingSpecs, facet._settings);
	
	// Configure using ex:xxx attrs in <div>
	try {
		// Parse ex:expression to _expression
		var expressionString = Exhibit.getAttribute(configElmt, "expression");
		if (expressionString != null && expressionString.length > 0) {
			facet._expression = Exhibit.ExpressionParser.parse(expressionString);
		}
		if(facet._expression == null) { 
			SimileAjax.Debug.exception(e2, "AnimationFacet: no expression specified; using .label");
			facet._expression = '.label';
		}
		
		// List mode
		var selections = Exhibit.getAttribute(configElmt, "selections");
		if(selections!=null && selections.length>0) {
			try {
				facet._listModePeriods = eval(selections);
				facet._mode = Exhibit.AnimationFacet.MODE_LIST;
			} catch(e2) {
				SimileAjax.Debug.exception(e2, "AnimationFacet: Selections needs to be valid JSON structure");
			}
		} else {
			// ex:selectionSequence
			try {
				var sequence = Exhibit.getAttribute(configElmt, "selectionSequence");
				var dur = facet._settings.duration;
				if(!dur) { dur = 60; }
				if(sequence!=null && sequence.length>0) {
					var a = sequence.split(',');
					var b = [];
					var d = Math.floor(dur/a.length);
					for(var i=0;i<a.length;i++) {
						b.push({
							from: i*d , 
							to: i*d+d , 
							select: [ $.trim(a[i]) ]
						});
					}
				}
				facet._listModePeriods = b;
				facet._mode = Exhibit.AnimationFacet.MODE_LIST;
			} catch(e2) {
				SimileAjax.Debug.exception(e2, "AnimationFacet: Selection sequence or duration is invalid");
			}
		}
		// Range mode
		var precision = Exhibit.getAttribute(configElmt,"precision");
		if(precision!=null && precision.length>0) {
			try {
				facet._rangeModePrecision = parseInt(precision);
				facet._mode = Exhibit.AnimationFacet.MODE_RANGE;
			} catch(e2) {
				SimileAjax.Debug.exception(e2, "AnimationFacet: Precision needs to be integer");
			}
		}
		// Date mode
		var datePrecision = Exhibit.getAttribute(configElmt,"datePrecision");
		if(datePrecision!=null && datePrecision.length>0) {
			try {
				var arr = [ Exhibit.AnimationFacet.DAY,Exhibit.AnimationFacet.MONTH,Exhibit.AnimationFacet.YEAR ];
				for(var i=0;i<arr.length;i++) {
					if(datePrecision.toLowerCase() == arr[i]) {
						facet._dateModeInterval = arr[i];
						facet._mode = Exhibit.AnimationFacet.MODE_DATE;
					}
				}
			} catch(e2) {
				SimileAjax.Debug.exception(e2, "AnimationFacet: Date precision needs to be year, month or day");
			}
		}
		// Error?
		if(facet._mode == Exhibit.AnimationFacet.MODE_NONE) {
			SimileAjax.Debug.exception(e2, "AnimationFacet: need to define either ex:selections, ex:precision or ex:datePrecision");
		}
	} catch (e) {
		SimileAjax.Debug.exception(e, "AnimationFacet: Error processing configuration of animation facet");
	}
	// Apply _settings
	// FIXME: configuration appears to be legacy code.
	Exhibit.AnimationFacet._configure(facet/*, configuration*/);
	
	facet._initializeUI();
	uiContext.getCollection().addFacet(facet);
	
	return facet;
};

/** 
 * Configure facet using ex:configuration object returned by Exhibit.getConfigurationFromDOM() .
 */
Exhibit.AnimationFacet._configure = function(facet, configuration) {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('_configure',facet,configuration);
	
	// Use _settingSpecs to extract _settings from configuration object (created from ex:configuration)
	// FIXME: is this legacy code, or is ex:configuration still a valid attr?
	/*Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.AnimationFacet._settingSpecs, facet._settings);*/
	
	// FIXME: Why is this needed?  'configuration' is a JSON structure in ex:configuration.
	// Surely other ex:xxx attrs are better?
	/*if ("expression" in configuration) {
		facet._expression = Exhibit.ExpressionParser.parse(configuration.expression);
	}
	if ("selection" in configuration) {
		var selection = configuration.selection;
		for (var i = 0; i < selection.length; i++) {
			facet._valueSet.add(selection[i]);
		}
	}*/
    
	// If facetLabel is missing, try to use ex:expression
	if (!("facetLabel" in facet._settings)) {
		facet._settings.facetLabel = "Animation facet";
		if (facet._expression != null && facet._expression.isPath()) {
		var segment = facet._expression.getPath().getLastSegment();
		var property = facet._uiContext.getDatabase().getProperty(segment.property);
			if (property != null) {
				facet._settings.facetLabel = segment.forward ? property.getLabel() : property.getReverseLabel();
			}
		}
	}
		
	if ("formatter" in facet._settings) {
		var formatter = facet._settings.formatter;
		if (formatter != null && formatter.length > 0) {
			try {
				facet._formatter = eval(formatter);
			} catch (e) {
				SimileAjax.Debug.log(e);
			}
		}
	}
	
	// Mode specific config
	if(facet._mode == Exhibit.AnimationFacet.MODE_LIST) {
		// Create cache based on database, collection and expression
		facet._cache = new Exhibit.FacetUtilities.Cache(
			facet._uiContext.getDatabase(),
			facet._uiContext.getCollection(),
			facet._expression
		);
	} else if(facet._mode == Exhibit.AnimationFacet.MODE_RANGE) {
		// Put min down, and max up, to precision boundaries.
		var r;
		var database = facet._uiContext.getDatabase();
		if(facet._expression.getPath()){
			var path = facet._expression.getPath();
			var propertyID = path.getLastSegment().property;
			var property = database.getProperty(propertyID);
			r = property.getRangeIndex();
		} else {
			var expression = facet._expression;
			r = new Exhibit.Database._RangeIndex(
				facet._uiContext.getCollection().getAllItems(),
				function(item, f) {
					expression.evaluateOnItem(item,database).values.visit(
						function(value) {
							if(typeof value != "number") { value = parseFloat(value); }
							if(!isNaN(value)) { f(value); }
						}
					);
				}
			);
		}
		facet._rangeModeMaxRange = {
			min: facet._minRangePrecision(r.getMin()) ,
			max: facet._maxRangePrecision(r.getMax())
		};
		// Build range index (FIXME: can this be optimised into above?)
		var database = facet._uiContext.getDatabase();
		var getter = function(item, f) {
			facet._expression.evaluateOnItem(item, database).values.visit(function(value) {
				if (typeof value != "number") { value = parseFloat(value); }
				if (!isNaN(value)) { f(value); }
			});
		};
		facet._rangeIndex = new Exhibit.Database._RangeIndex(
			facet._uiContext.getCollection().getAllItems(),
			getter
		);
	} else if(facet._mode == Exhibit.AnimationFacet.MODE_DATE) {
	}
}

/**
 * Free resources.
 */
Exhibit.AnimationFacet.prototype.dispose = function() {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('dispose');
	
	this._ui.dispose();

	if(this._cache) { 
		this._cache.dispose();
		this._cache = null;
	}
	if(this._rangeIndex) {
		this._rangeIndex = null;
	}
	
	this._uiContext.getCollection().removeFacet(this);
	this._uiContext = null;
	
	this._div.innerHTML = "";
	this._div = null;
	
	this._expression = null;
	this._settings = null;

	this._listModePeriods = null;
	this._listModeCurrentPeriods = null;
	this._listModeValueSet = null;
	this._rangeModeMaxRange = null;
	this._rangeModeCurrentRange = null;
};

/* --------------------------------------------------------------------
 * Filter and restrict.
 * -------------------------------------------------------------------- */

/**
 * Called when Exhibit is re-evaluating.  True usually triggers a
 * call to restrict(), otherwise straight to update().
 */
Exhibit.AnimationFacet.prototype.hasRestrictions = function() {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('hasRestrictions');
	
	if(this._mode == Exhibit.AnimationFacet.MODE_LIST) {
		return this._listModeCurrentPeriods.length > 0;
	} else if(this._mode == Exhibit.AnimationFacet.MODE_RANGE) {
		var min = (this._rangeModeCurrentRange.min!=null && this._rangeModeCurrentRange.min!=this._rangeModeMaxRange.min);
		var max = (this._rangeModeCurrentRange.max!=null && this._rangeModeCurrentRange.max!=this._rangeModeMaxRange.max);
		return (min||max);
	} else if(this._mode == Exhibit.AnimationFacet.MODE_DATE) {
		// TODO
		return false;
	} else {
		return false;
	}
};

/**
 * If hasRestrictions() is true, this is called to perform filtering.
 * Typically update() is called after this.
 */
Exhibit.AnimationFacet.prototype.restrict = function(items) {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('restrict',items);

	if(this._mode == Exhibit.AnimationFacet.MODE_LIST) {
		// Build list of items based on periods currently 'selected'
		if (this._listModeCurrentPeriods.length == 0) {
			return items;
		} else {
			var valueSet = new Exhibit.Set();
			for(var i=0;i<this._listModeCurrentPeriods.length;i++) {
				var p = this._listModeCurrentPeriods[i];
				for(var j=0;j<p.select.length;j++) { valueSet.add(p.select[j]); }
			}
			return this._cache.getItemsFromValues(valueSet, items);
		}
	} else if(this._mode == Exhibit.AnimationFacet.MODE_RANGE) {
		var min = this._rangeModeCurrentRange.min;
		var max = this._rangeModeCurrentRange.max;
		if(this._expression.isPath()){
			var path = this._expression.getPath();
			var database = this._uiContext.getDatabase();
			// Ret: { valueType:'item'|prop value type , values:Exhibit.Set , count:set.size }
			return path.rangeBackward(min,max , false, items, database).values;  // max,min,inclusive,filter,database
		} else {
			// Ret: Exhibit.Set
			return this._rangeIndex.getSubjectsInRange(min,max , false, null, items);
		}
	} else if(this._mode == Exhibit.AnimationFacet.MODE_DATE) {
		// TODO
	}
};

/**
 * Clear restrictions.
 */
Exhibit.AnimationFacet.prototype.clearAllRestrictions = function() {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('clearAllRestrictions');
	Exhibit.AnimationFacet.testRemoteLog();
	
	// Remember current settings, so we can return them
	if(this.hasRestrictions()) {
		if(this._mode == Exhibit.AnimationFacet.MODE_LIST) {
			this._listModeCurrentPeriods = [];
		} else if(this._mode == Exhibit.AnimationFacet.MODE_RANGE) {
			this._rangeModeCurrentRange.min = this._rangeModeMaxRange.min;
			this._rangeModeCurrentRange.max = this._rangeModeMaxRange.max;
		}
		
		// Record pre for logging
		var preUpdateSize = SimileAjax.RemoteLog.logActive ? this._uiContext.getCollection().countRestrictedItems() : 0;
		// Update collection
		this._notifyCollection();
		// Record post for logging
		var postUpdateSize = SimileAjax.RemoteLog.logActive ? this._uiContext.getCollection().countRestrictedItems() : 0;
		var totalSize = SimileAjax.RemoteLog.logActive ? this._uiContext.getCollection().countAllItems() : 0;
				
		SimileAjax.RemoteLog.possiblyLog({
			facetType:"AnimationFacet", 
			facetLabel:this._settings.facetLabel, 
			operation:"clearAllRestrictions",
			exhibitSize:totalSize,
			preUpdateSize:preUpdateSize,
			postUpdateSize:postUpdateSize
		});
	}
};

/**
 * Add values to current filter.
 *   restrictions: list of values to add to current filter
 */
Exhibit.AnimationFacet.prototype.applyRestrictions = function(restrictions) {
	/*
	if(Exhibit.AnimationFacet.DEBUG1) console.log('applyRestrictions',restrictions);
	Exhibit.AnimationFacet.testRemoteLog();
	
	// Rememeber for logging
	var oldRestrictionSize = SimileAjax.RemoteLog.logActive ? this._valueSet.size() : 0;
	
	this._valueSet = new Exhibit.Set();
	for (var i = 0; i < restrictions.selection.length; i++) {
		this._valueSet.add(restrictions.selection[i]);
	}
	this._selectMissing = restrictions.selectMissing;
	
	// Record pre for logging
	var newRestrictionSize = SimileAjax.RemoteLog.logActive ? this._valueSet.size() : 0;
	var preUpdateSize = SimileAjax.RemoteLog.logActive ? this._uiContext.getCollection().countRestrictedItems() : 0;
	// Update collection
	this._notifyCollection();
	// Record post for logging
	var postUpdateSize = SimileAjax.RemoteLog.logActive ? this._uiContext.getCollection().countRestrictedItems() : 0;
	var totalSize = SimileAjax.RemoteLog.logActive ? this._uiContext.getCollection().countAllItems() : 0;
	
	var restricted = "";
	if (newRestrictionSize > 0) {
		arr = Array();
		for (k in this._valueSet._hash) {
			arr.push(k);
		}
		restricted = arr.join("##");
	}
	
	SimileAjax.RemoteLog.possiblyLog({
		facetType:"AnimationFacet", 
		facetLabel:this._settings.facetLabel, 
		operation:"applyRestrictions",
		exhibitSize:totalSize,
		selectedValues:restricted,
		preUpdateSize:preUpdateSize,
		postUpdateSize:postUpdateSize,        
		oldRestrictionSize:oldRestrictionSize,
		newRestrictionSize:newRestrictionSize        
	});
	*/
};

/**
 * Add or remove a selection value.
 */
Exhibit.AnimationFacet.prototype.setSelection = function(value, selected) {
	/*if(Exhibit.AnimationFacet.DEBUG1) console.log('setSelection',value,selected);
	Exhibit.AnimationFacet.testRemoteLog();
	
	var oldRestrictionSize = SimileAjax.RemoteLog.logActive ? this._valueSet.size() : 0;
	
	if (selected) {
		this._valueSet.add(value);
	} else {
		this._valueSet.remove(value);
	}
	
	var newRestrictionSize = SimileAjax.RemoteLog.logActive ? this._listModeValueSet.size() : 0;
	var preUpdateSize = SimileAjax.RemoteLog.logActive ? this._uiContext.getCollection().countRestrictedItems() : 0;
	this._notifyCollection();
	var postUpdateSize = SimileAjax.RemoteLog.logActive ? this._uiContext.getCollection().countRestrictedItems() : 0;
	var totalSize = SimileAjax.RemoteLog.logActive ? this._uiContext.getCollection().countAllItems() : 0;
	
	var restricted = "";
	if (newRestrictionSize > 0) {
		arr = Array();
		for (k in this._valueSet._hash) {
			arr.push(k);
		}
		restricted = arr.join("##");
	}
	
	SimileAjax.RemoteLog.possiblyLog({
		facetType:"AnimationFacet", 
		facetLabel:this._settings.facetLabel, 
		operation:"setSelection", 
		value:value, 
		selected:selected,
		exhibitSize:totalSize,
		selectedValues:restricted,
		preUpdateSize:preUpdateSize,
		postUpdateSize:postUpdateSize,
		oldRestrictionSize:oldRestrictionSize,
		newRestrictionSize:newRestrictionSize        
	});*/
}


/** 
 * Update UI.
 */
Exhibit.AnimationFacet.prototype.update = function(items) {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('update',items);
	//this._updateMarkers(this._computeFacetListMode(items));
};

/*Exhibit.AnimationFacet.prototype._computeFacetListMode = function(items) {
	var database = this._uiContext.getDatabase();
	var r = this._cache.getValueCountsFromItems(items);
	var entries = r.entries;
	
	// FIXME: This entries structure is ultimately passed to _updateMarkers, which
	// expects a Exhibit.Set -- fudge it by adding necessary functions.
	entries.contains = function(v) {
		for(var i=0;i<this.length;i++) {
			if(this[i].value == v) { return true; }
		}
		return false;
	}
	entries.size = function() {
		return this.length;
	}
	
	return entries;
}*/


Exhibit.AnimationFacet.prototype._notifyCollection = function() {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('_notifyCollection');
	this._uiContext.getCollection().onFacetUpdated(this);
};

/** Build UI. */
Exhibit.AnimationFacet.prototype._initializeUI = function() {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('_initializeUI');
	
	// Create UI implementation.
	switch(this._settings['type']) {
		case 'youtube' :
			this._ui = new Exhibit.AnimationFacet.YouTube(this);
			break;
		case 'slideshare' :
			this._ui = new Exhibit.AnimationFacet.SlideShare(this);
			break;
		case 'inline' : 
			this._ui = new Exhibit.AnimationFacet.Inline(this);
			break;
		case 'default' : default:
			this._ui = new Exhibit.AnimationFacet.DefaultUI(this);
			break;
	}
	// Playback expression
	this._ui.setDuration(this._settings.duration);
	
	var html = this._ui.initUI();	// Create
	$(this._div).html(html);		// Install
	this._ui.postInitUI();			// Post install
}

/** Clear restrictions, spawned as thread. */
Exhibit.AnimationFacet.prototype._clearSelections = function() {
	if(Exhibit.AnimationFacet.DEBUG1) console.log('_clearSelections');
	var state = {};
	var self = this;
	SimileAjax.History.addLengthyAction(
		function() { state.restrictions = self.clearAllRestrictions(); },
		function() { self.applyRestrictions(state.restrictions); },
		String.substitute(
			Exhibit.FacetUtilities.l10n["facetClearSelectionsActionTitle"],
			[ this._settings.facetLabel ])
	);
};

/*
Exhibit.AnimationFacet.prototype.exportFacetSelection = function() { 
	if(Exhibit.AnimationFacet.DEBUG1) console.log('exportFacetSelection');
	var s = []; 
	this._valueSet.visit(function(v) { 
		s.push(v); 
	}); 
	if (s.length > 0) {
		return s.join(',');  
	}
}; 
Exhibit.AnimationFacet.prototype.importFacetSelection = function(settings) { 
	var self = this; 
	
	self.applyRestrictions({ selection: settings.split(','), selectMissing: self._selectMissing }); 
}

/* This is a hack to enable facet for work in 2.2.0 */ 
Exhibit.AnimationFacet.testRemoteLog = function() {
	if(!SimileAjax['RemoteLog']) {
		SimileAjax.RemoteLog = { logActive: false }
		SimileAjax.RemoteLog.possiblyLog = function(a) {}
	}
}

/* Accepts secs from slider; figures out if _notifyCollection must be 
  called to update Exhibit. */
Exhibit.AnimationFacet.prototype.updateModeParams = function(secs) {
	// Build set from values in periods covering 'secs' time
	if(this._mode == Exhibit.AnimationFacet.MODE_LIST) {
		// console.log('++ List mode');
		// Work through _listModePeriods, looking for matches
		var periods = [];
		for(var i=0;i<this._listModePeriods.length;i++) {
			var p = this._listModePeriods[i];
			if(secs>=p.from && secs<p.to) { periods.push(p); }
		}
		// Do we need to notify collection (triggering a fresh restriction?)
		var rebuild = false;
		if(periods.length != this._listModeCurrentPeriods.length) {
			rebuild=true;
		} else {
			for(var i=0;i<this._listModeCurrentPeriods.length;i++) {
				if(periods[i] != this._listModeCurrentPeriods[i]) { 
					rebuild=true;
					break;
				}
			}
		}
		// console.log(periods,rebuild);
		if(rebuild) { 
			this._listModeCurrentPeriods = periods; 
			this._notifyCollection();
		}
	} else if(this._mode == Exhibit.AnimationFacet.MODE_RANGE) {
		// Translate secs into value within range
		var rng = this._rangeModeMaxRange.max - this._rangeModeMaxRange.min;
		var pos = secs / this._ui.getDuration();
		var val = Math.floor(this._rangeModeMaxRange.min + rng*pos);
		// Translate val into lower and upper bound, using precision
		var min = this._minRangePrecision(val);
		var max = this._maxRangePrecision(val);
		if(this._rangeModeCurrentRange.min!=min || this._rangeModeCurrentRange.max!=max) {
			this._rangeModeCurrentRange.min = min;
			this._rangeModeCurrentRange.max = max;
			this._notifyCollection();
		}
	} else if(this._mode == Exhibit.AnimationFacet.MODE_DATE) {
		// TODO
	}
}
/*Exhibit.AnimationFacet.prototype._updateMarkers = function(vset) {
	var d = this._ui.getDuration();
	var w = $(this._dom.shaft).width();
	var toPixels = function(secs) { return Math.floor((w/d) * secs); }
	var h = '';
	var showAll = vset.size()==0;
	switch(this._mode) {
		case Exhibit.AnimationFacet.MODE_LIST :
			for(var i=0;i<this._listModePeriods.length;i++) {
				var s = this._listModePeriods[i];
				for(var j=0;j<s.select.length;j++) {
					if(showAll || vset.contains(s.select[j])) {
						h = h + '<div style="position:Absolute; left:'+toPixels(s.from)+'px; width:'+toPixels(s.to-s.from)+'px;"></div>';
						break;
					}
				}
			}
			break;
		case Exhibit.AnimationFacet.MODE_RANGE :
			break;
		case Exhibit.AnimationFacet.MODE_DATE :
			break;
	}
	$(this._dom.markers).empty().append(h);
}*/

/* Lower value (inc neg) to range boundary, using precision. */
Exhibit.AnimationFacet.prototype._minRangePrecision = function(v) {
	var pr = this._rangeModePrecision;         // Say pr=100 ...
	v -= ((v>=0) ? v%pr : pr-Math.abs(v%pr));  // ... -5 becomes -100, 5 becomes 0
	return v;
}
/* Raise value (inc neg) to range boundary, using precision. */
Exhibit.AnimationFacet.prototype._maxRangePrecision = function(v) {
	var pr = this._rangeModePrecision;         // Say pr=100 ...
	v += ((v>=0) ? pr-v%pr : Math.abs(v%pr));  // ... -5 becomes 0, 5 becomes 100
	return v;
}

/*
 * Label object.
 * Different modes label the standard time bar in different ways.
 * config:  
 *    base - the numbering system doesn't have to start at 0 
 *      (useful for slideshare, where slides labeled from 1 not 0)
 *    secs - flag, false means numbers formated as mm:ss
 *    inclusiveBounds - upper label shifted down to become inclusive
 *      end time rather than duration (so 3:00 becames 2:59). Handy
 *      for slideshare where upper label should be last slide number.
 */
Exhibit.AnimationFacet.Labels = function(facet,secs,config) {
	if(facet._mode == Exhibit.AnimationFacet.MODE_LIST) {
		if(config == undefined) {
			config = { base:0 , showAsSeconds:false , inclusiveBounds:false };
		}
		var f = (config.showAsSeconds) ? 
			function(secs) {
				return secs + config.base;
			} :
			function(secs) {
				var m = Math.floor(secs/60);
				var s = Math.ceil(secs%60);
				return m+':'+(s<10?'0':'')+s;
			};
		this.timeLabel = f(secs);
		this.lowerLabel = f(0);
		this.upperLabel = f(facet._ui.getDuration() - (config.inclusiveBounds?1:0) );	
	} else if(facet._mode == Exhibit.AnimationFacet.MODE_RANGE) {
		var rng = facet._rangeModeMaxRange.max - facet._rangeModeMaxRange.min;
		var pos = secs / facet._ui.getDuration();
		this.timeLabel = Math.floor(facet._rangeModeMaxRange.min + rng*pos);
		this.lowerLabel = facet._rangeModeMaxRange.min;
		this.upperLabel = facet._rangeModeMaxRange.max;
	//} else if(facet._mode == Exhibit.AnimationFacet.MODE_DATE) {
	} else {
		this.timeLabel = '?';
		this.lowerLabel = 'Lower';
		this.upperLabel = 'Upper';
	}
}

/* --------------------------------------------------------------------
 * Default UI
 * -------------------------------------------------------------------- */

/** Constructor. */
Exhibit.AnimationFacet.DefaultUI = function(facet) {
	this._duration = 0;						// Duration, from _settings (in seconds)
	this._dom = null;						// Handy DOM bits inside <div>
	this._facet = facet;					// Parent
	
	this._currentTimePosition = 0;
	
	this._animationStartTime = 0;			// Millis when animation began (or restarted on drag)
	this._animationStartPosition = 0;		// Pixels
	this._animationFrameDelay = 100;		// Animate every 250 millis
	this._animationPlaying = false;			// Playing or paused?
	this._dragging = false;					// Thumb being dragged?
	// Timed callback: odd behaviour using setInterval(obj.func) -- func is called 
	// with 'this' set to 'window' not 'obj'.  This is a work around.
	this._animationGlueFunc = '__animation_glue__'+Exhibit.AnimationFacet._getNextAnimationUnique();
	var self = this;
	Exhibit.AnimationFacet.DefaultUI[this._animationGlueFunc] = function() {
		self._animate();
	}
}

/** Destructor. */
Exhibit.AnimationFacet.DefaultUI.prototype.dispose = function() {
	this._dom = null;
}

/** This is called to give UI's the ability to extend _settingSpecs. */
/*Exhibit.AnimationFacet.DefaultUI.prototype.extendSettingSpecs = function(specs) {
}*/

/** Set duration, in seconds.  Impl's can ignore this, if they get their duration from media. */
Exhibit.AnimationFacet.DefaultUI.prototype.setDuration = function(secs) {
	this._duration = secs;
}

/** Duration, in seconds. */
Exhibit.AnimationFacet.DefaultUI.prototype.getDuration = function() {
	return this._duration;
}

/** Initialise UI, returning HTML.  This HTML is then displayed, and postInitUI() called. */
Exhibit.AnimationFacet.DefaultUI.prototype.initUI = function() {
	var labels = new Exhibit.AnimationFacet.Labels(this._facet,0);
	
	// Build UI
	var settings = this._facet._settings;
	var cssHeight = settings['height'] ? ' height:'+settings['height'] : '10px';
	var html = 
		'<div>'+
			'<div class="exhibit-facet-header" style="position:Relative;">'+
				'<span class="exhibit-facet-header-filterControl" style="position:Absolute; display:Inline-Block; vertical-align:Middle; right:0px; top:0px; text-align:Right; white-space:NoWrap;">'+ // FIXME: width should be inherit, if not for IE8 bug
					'<span class="exhibit-facet-animation-button"></span>&nbsp;'+
					'<input type="checkbox" class="exhibit-facet-animation-tickbox" />'+
				'</span>'+
				((settings['showLabel']) ? '<span class="exhibit-facet-header-title">'+settings['facetLabel']+'</span>' : '')+
			'</div>'+
			'<div class="exhibit-facet-animation-shaft-container">'+
				'<div class="exhibit-facet-animation-shaft" style="position:Relative; width:100%;'+cssHeight+'">'+
					'<div class="exhibit-facet-animation-shaft-markers" style="'+cssHeight+'"></div>'+
					'<div class="exhibit-facet-animation-shaft-thumb" style="position:Absolute;'+cssHeight+'"></div>'+
				'</div>'+
			'</div>'+
			'<div class="exhibit-facet-animation-labels" style="position:Relative; height:1em;">'+
				'<div style="position:Absolute; left:0px;">'+labels.lowerLabel+'</div>'+
				'<div style="position:Absolute; right:0px;">'+labels.upperLabel+'</div>'+
				'<div class="exhibit-facet-animation-labels-time" style="text-align:Center"></div>'+
			'</div>'+
		'</div>';

	// Build node, and store handy refs inside structure
	var el = $(html);
	this._dom = {
		elmt: el.get()[0] ,
		shaft: $('.exhibit-facet-animation-shaft',el).get()[0] ,
		thumb: $('.exhibit-facet-animation-shaft-thumb',el).get()[0] ,
		time: $('.exhibit-facet-animation-labels-time',el).get()[0] ,
		button: $('.exhibit-facet-animation-button',el).get()[0] ,
		tickbox: $('input.exhibit-facet-animation-tickbox',el).get()[0] ,
		markers: $('.exhibit-facet-animation-shaft-markers',el).get()[0]
	};
	
	// UI event code starts
	var self = this;
	$(this._dom.shaft)  // Attach mouse down to shaft
		.mousedown(function(ev) {
			if(ev.which==1) {
				ev.preventDefault();
				self._dragging = true;
			}
		});
	$(document)  // Attach movement and up to document as a whole
		.mousemove(function(ev) {
			if(self._dragging && ev.which==1) { 
				ev.preventDefault();
				var x = ev.pageX - $(self._dom.shaft).offset().left;
				self._updateThumbUI(x,false);
			}
		})
		.mouseup(function(ev) {
			if(self._dragging && ev.which==1) {
				ev.preventDefault();
				var x = ev.pageX - $(self._dom.shaft).offset().left;
				if(!self._updateThumbUI(x,true)) {  // true if x off end of shaft
					self._animationStartTime = (new Date()).getTime();
					self._animationStartPosition = x;
				}
				self._dragging = false;
			}
		});
	// Tickbox -- activate or deactivate filtering
	$(this._dom.tickbox).click(function(ev) {
		var $this = $(this);
		if($this.attr('checked')) { 
			self._facet.updateModeParams(self._currentTimePosition);
		} else {
			self._facet.clearAllRestrictions();
		}
	});
	// UI event code ends
	this._showPlayButton(true);
	// Install;
	//$(this._facet._div).html(this._dom.elmt);
	return this._dom.elmt;
}

/** Some UIs may need to do some work after the HTML is displayed on page. */
Exhibit.AnimationFacet.DefaultUI.prototype.postInitUI = function() {
	this._updateThumbUI(0,false);
}

/* Show either play or pause button. */
Exhibit.AnimationFacet.DefaultUI.prototype._showPlayButton = function(b) {
	var self = this;
	$(this._dom.button).html(
		'<img src="data:image/png;base64,'+
		Exhibit.AnimationFacet[b?'PLAY_PNG':'PAUSE_PNG']+
		'" />'
	);
	$('img',this._dom.button).click(
		b ?
		function(ev) { self._animateStart(); } :
		function(ev) { self._animateStop(); }
	);
	// Tickbox
	$(this._dom.tickbox).attr('disabled',!b);
}
/* Update UI, and possibly cause Exhibit to re-evaluate. */
Exhibit.AnimationFacet.DefaultUI.prototype._updateThumbUI = function(x,considerRestrict) {
	// Update thumb position
	var w = $(this._dom.shaft).width();
	var ended = (x>w-1);
	x = (x<0) ? 0 : x;  // Lower bound
	x = (x>w-1) ? w-1 : x;  // Upper bound
	var th = $(this._dom.thumb);
	th.css('left',(x-th.width()/2)+'px');
	// What's the time (mister wolf)..?
	this._currentTimePosition = Math.floor(this._duration * (x/w*1.0));
	var labels = new Exhibit.AnimationFacet.Labels(this._facet,this._currentTimePosition);
	$(this._dom.time).html(labels.timeLabel);
	// Look into possibly updating exhibit
	if(considerRestrict) {
		this._facet.updateModeParams(this._currentTimePosition);
		// Update tickbox
		$(this._dom.tickbox).attr('checked',this._facet.hasRestrictions()?'checked':'');
	}
	return ended;
}

/** Start animation. */
Exhibit.AnimationFacet.DefaultUI.prototype._animateStart = function() {
	this._animationPlaying = true;
	this._animationStartTime = (new Date()).getTime();
	this._animationStartPosition = 
		($(this._dom.thumb).offset().left) - // Thumb
		($(this._dom.shaft).offset().left) + // Shaft
		($(this._dom.thumb).width()/2);  // Middle of thumb
	this._showPlayButton(false);
	setTimeout('Exhibit.AnimationFacet.DefaultUI.'+this._animationGlueFunc+"()",this._animationFrameDelay);
}
/** Stop/pause animation. */
Exhibit.AnimationFacet.DefaultUI.prototype._animateStop = function() {
	this._animationPlaying = false;
	this._showPlayButton(true);
}
/** Timed function called to animate. */
Exhibit.AnimationFacet.DefaultUI.prototype._animate = function() {
	// Where should the thumb be this frame?
	var timeElapsed = (new Date()).getTime()-this._animationStartTime;
	var sh_w = $(this._dom.shaft).width();
	var pixelsPerMillisecond = sh_w/(this._duration*1000.0);
	var distanceTravelled = timeElapsed * pixelsPerMillisecond;
	var pos = this._animationStartPosition + distanceTravelled;
	var ended  = false;
	// Don't to timer update of UI if dragging thumb
	if(!this._dragging) {
		ended = this._updateThumbUI(pos,true);
	}
	// If thumb didn't hit end of shaft, schedule next timer event
	if(this._animationPlaying) {
		if(!ended) {
			setTimeout('Exhibit.AnimationFacet.DefaultUI.'+this._animationGlueFunc+"()",this._animationFrameDelay);
		} else {
			this._animateStop();
			this._updateThumbUI(0,false);
			this._facet.clearAllRestrictions();
		}
	}
}


/* --------------------------------------------------------------------
 * Debug
 * -------------------------------------------------------------------- */
 
Exhibit.AnimationFacet.__augment = function(obj) {
	for(var f in obj) {
		if(f.indexOf('_X_')>=0) { continue; }
		if(typeof obj[f] == 'function') {
			obj['_X_'+f] = obj[f];
			obj[f] = function() {
				var ret = obj['_X_'+f].apply(obj,arguments);
				// console.log('CALL: '+f,arguments,ret);
				return ret;
			}
		}
	}
}
