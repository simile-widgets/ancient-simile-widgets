/*==================================================
 *  Exhibit.AnimationFacet, SlideShare
 *==================================================
 */

/*
 * Note: the current version of the Slideshare JavaScript API has no support 
 * for events, meaning polling is required to find out when the current slide
 * had changed.
 * Note 2: at this time, there does not appear to be an approved way to use the
 * HTML5 SlideShare player in this way.
 */

Exhibit.AnimationFacet._settingSpecs['sswidth'] =  { type:"int" ,  defaultValue:598 };
Exhibit.AnimationFacet._settingSpecs['ssheight'] = { type:"int" ,  defaultValue:480 };
Exhibit.AnimationFacet._settingSpecs['ssslides'] =  { type:"text" , defaultValue:"simile-exhibit-vgsom-12312308" };
Exhibit.AnimationFacet._settingSpecs['sslabelfromone'] =  { type:"boolean" , defaultValue:false };
Exhibit.AnimationFacet._settingSpecs['ssshowtrack'] =  { type:"boolean" , defaultValue:true };
 
/** Constructor. */
Exhibit.AnimationFacet.SlideShare = function(facet) {
	this._duration = -1;					// Duration, from slides
	this._facet = facet;					// Parent
	
	this._playerId = "ExhibitAnimationFacetSlideShare__slideshare__"+Exhibit.AnimationFacet._getNextAnimationUnique(); // ID of this player
	this._playerObj = null;					// SlideShare player object
	this._lastSlide = -1;					// Keep track of the last slide shown
	
	this._$tickbox = null;
	this._hideTickbox = false;
	
	this._animationFrameDelay = 100;		// Animate every 250 millis
	this._animationPlaying = false;			// Playing or paused?
	// JavaScript timers need come code to eval, making it hard to point to functions 
	// inside specific objects.  Create a unique function at Exhibit.AnimationFacet 
	// level, and use it to redirect timer calls.
	var fn = '__animation_glue__'+Exhibit.AnimationFacet._getNextAnimationUnique();
	this._animationGlueFunc = 'Exhibit.AnimationFacet.SlideShare.'+fn+'()';
	var self = this;
	Exhibit.AnimationFacet.SlideShare[fn] = function() {
		self._animate();
	}
}

// Map individual instances of player by ID, so this can be found in non-object scope
Exhibit.AnimationFacet.SlideShare._mapVideoObjectToPlayerId = {};

/** Destructor. */
Exhibit.AnimationFacet.SlideShare.prototype.dispose = function() {
	this._facet = null;
	this._playerObj = null;
	this._playerId = null;
}

/** Set duration, in seconds.  Impl's can ignore this, if they get their duration from media. */
Exhibit.AnimationFacet.SlideShare.prototype.setDuration = function(secs) {}

/** Duration, in seconds (really 'slides'). */
Exhibit.AnimationFacet.SlideShare.prototype.getDuration = function() {
	if(this._duration < 0) {
		var c = this._playerObj.getCurrentSlide();
		this._playerObj.last();
		this._duration = this._playerObj.getCurrentSlide();
		this._playerObj.jumpTo(c);
	}
	return this._duration;
}

/** Initialise UI, returning HTML.  This HTML is then displayed, and postInitUI() called. */
Exhibit.AnimationFacet.SlideShare.prototype.initUI = function() {
	var settings = this._facet._settings;
	// If the label isn't displayed, the tickbox will appear over the YT video itself.  So
	// make it disappear when not enabled.
	this._hideTickbox = !settings['showLabel'];
	
	var html = 
		'<span style="display:Inline-Block; position:Relative;">'+
			'<input type="checkbox" class="exhibit-facet-animation-tickbox" '+
				'style="display:Block; position:Absolute; right:0px; top:0px;" />'+
			'<div class="exhibit-facet-header">'+
				((settings['showLabel']) ? '<span class="exhibit-facet-header-title">'+settings['facetLabel']+'</span>' : '')+
			'</div>'+
			'<div style="width:'+settings['sswidth']+'px; height:'+settings['ssheight']+'px;">'+
				'<div id="'+this._playerId+'"></div>'+
			'</div>'+

			(settings['ssshowtrack'] ?
				'<div style="width:'+settings['sswidth']+'px;">'+
					'<div class="exhibit-facet-animation-bar-container">'+
						'<div class="exhibit-facet-animation-bar" style="position:Relative; width:0px;">'+
							/*'<div class="exhibit-facet-animation-shaft-markers" style="'+cssHeight+'"></div>'+*/
						'</div>'+
					'</div>'+
					'<div class="exhibit-facet-animation-labels" style="position:Relative; height:1em;">'+
						'<div style="position:Absolute; left:0px;">&mdash;</div>'+
						'<div style="position:Absolute; right:0px;">&mdash;</div>'+
						'<div class="exhibit-facet-animation-labels-time" style="text-align:Center"></div>'+
					'</div>'+
				'</div>' 
			:'') +
		'</span>';
	$el = $(html);
	
	// Tickbox 
	var self = this;
	this._$tickbox = $($('input.exhibit-facet-animation-tickbox',$el).get()[0]);
	if(!settings['showLabel']) { this._$tickbox.css('right','5px').css('top','5px').css('margin','0px'); }
	this._$tickbox.click(function(ev) {
		var $this = $(this);
		if($this.attr('checked')) { 
			self._facet.updateModeParams(self._playerObj.getCurrentSlide()-1);  // Starts at 1, so deduct 1
		} else {
			self._facet.clearAllRestrictions();
		}
	});

	return $el;
}

/** Some UIs may need to do some work after the HTML is displayed on page. */
Exhibit.AnimationFacet.SlideShare.prototype.postInitUI = function() {
	var settings = this._facet._settings;
	var self = this;
	
	var ssURL = 'http://static.slidesharecdn.com/swf/ssplayer2.swf';
	var flashVars = { 
		doc: settings['ssslides'] ,
		startSlide: 1 ,
		rel: 0
	};
	swfobject.embedSWF(
		ssURL,
		this._playerId, 					// Div ID
		settings['sswidth'], settings['ssheight'], // Width, height
		"8", 								// Flash version
		null, 								// Express install SWF (optional)
		flashVars, 							// FlashVars (optional)
		{	allowScriptAccess: "always" , 
			wmode: 'transparent' , 
			allowfullscreen: 'true' },		// Params for embedSWF Flash code
		{ id: this._playerId } ,			// Attrs for embedSWF HTML code
		function(ev) {
			if(ev.success) {
				// Kick off update 'thread'
				self._playerObj = $('#'+self._playerId).get()[0];
				setTimeout(self._animationGlueFunc,self._animationFrameDelay);
			} else {
				// Failure
			}
		}
	);
	Exhibit.AnimationFacet.SlideShare._mapVideoObjectToPlayerId[this._playerId] = this;
}

/** Timed function called to animate. */
Exhibit.AnimationFacet.SlideShare.prototype._animate = function() {
	if(this._playerObj.getCurrentSlide) {
		var slide = this._playerObj.getCurrentSlide()-1;  // Starts at 1, so deduct 1
		if(slide != this._lastSlide) {
			this._lastSlide = slide;
			this._updateLabels(slide);
			this._facet.updateModeParams(slide);
			this._$tickbox.attr('checked',this._facet.hasRestrictions()?'checked':'');
		}
	} else {
	}
	setTimeout(this._animationGlueFunc,this._animationFrameDelay);
}

Exhibit.AnimationFacet.SlideShare.prototype._updateLabels = function(secs) {
	if(!this._facet._settings['ssshowtrack']) { return; }
	
	var dur = this.getDuration();
	if(dur==0) { return; }

	var config = { 
		base: this._facet._settings['sslabelfromone'] , 
		showAsSeconds:true , 
		inclusiveBounds:true
	};
	var labels = new Exhibit.AnimationFacet.Labels(this._facet,Math.floor(secs),config);
	var labs = $('.exhibit-facet-animation-labels div',this._facet._div).each(function(idx) {
		switch(idx) {
			case 0: $(this).html(labels.lowerLabel); break;
			case 1: $(this).html(labels.upperLabel); break;
			case 2: $(this).html(labels.timeLabel); break;
		}
	});
	
	var barCon = $('.exhibit-facet-animation-bar-container',this._facet._div);
	var bar = $('.exhibit-facet-animation-bar',barCon);
	var w = barCon.width();  // Pixels width
	var r = (1.0 * w / dur);  // Pixels per second of duration
	bar.css('width',Math.floor(secs*r)+'px');
}
