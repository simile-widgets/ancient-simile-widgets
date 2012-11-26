/*==================================================
 *  Exhibit.AnimationFacet, YouTube
 *==================================================
 */

Exhibit.AnimationFacet._settingSpecs['ytwidth'] =  { type:"int" ,  defaultValue:280 };
Exhibit.AnimationFacet._settingSpecs['ytheight'] = { type:"int" ,  defaultValue:170 };
Exhibit.AnimationFacet._settingSpecs['ytvideo'] =  { type:"text" , defaultValue:"ILGK83V6h9s" };
Exhibit.AnimationFacet._settingSpecs['ytshowtrack'] =  { type:"boolean" , defaultValue:true };
 
/** Constructor. */
Exhibit.AnimationFacet.YouTube = function(facet) {
	this._duration = 0;						// Duration, from _settings (in seconds)
	this._facet = facet;					// Parent
	
	this._playerId = "__youtube__"+Exhibit.AnimationFacet._getNextAnimationUnique(); // ID of this player
	this._divId = "ExhibitAnimationFacetYouTube"+this._playerId; // <div> to inject player into
	this._playerObj = null;					// YouTube player object
	
	this._$tickbox = null;
	this._hideTickbox = false;
	
	this._animationFrameDelay = 100;		// Animate every 250 millis
	this._animationPlaying = false;			// Playing or paused?
	// JavaScript timers need come code to eval, making it hard to point to functions 
	// inside specific objects.  Create a unique function at Exhibit.AnimationFacet 
	// level, and use it to redirect timer calls.
	var fn = '__animation_glue__'+Exhibit.AnimationFacet._getNextAnimationUnique();
	this._animationGlueFunc = 'Exhibit.AnimationFacet.YouTube.'+fn+'()';
	var self = this;
	Exhibit.AnimationFacet.YouTube[fn] = function() {
		self._animate();
	}
}

/* YouTube constants. */
Exhibit.AnimationFacet.YouTube.YT_UNSTARTED = -1;
Exhibit.AnimationFacet.YouTube.YT_ENDED = 0;
Exhibit.AnimationFacet.YouTube.YT_PLAYING = 1;
Exhibit.AnimationFacet.YouTube.YT_PAUSED = 2;
Exhibit.AnimationFacet.YouTube.YT_BUFFERING = 3;
Exhibit.AnimationFacet.YouTube.YT_CUED = 5;

// Map individual instances of player by ID, so this can be found in non-object scope
Exhibit.AnimationFacet.YouTube._mapVideoObjectToPlayerId = {};

/** Destructor. */
Exhibit.AnimationFacet.YouTube.prototype.dispose = function() {
	this._facet = null;
	this._playerObj = null;
	this._divId = null;
	this._playerId = null;
}

// 560x340 640x385 853x505 1280x745

/** Set duration, in seconds.  Impl's can ignore this, if they get their duration from media. */
Exhibit.AnimationFacet.YouTube.prototype.setDuration = function(secs) {}

/** Duration, in seconds. */
Exhibit.AnimationFacet.YouTube.prototype.getDuration = function() {
	return this._playerObj.getDuration();
}

/** Initialise UI, returning HTML.  This HTML is then displayed, and postInitUI() called. */
Exhibit.AnimationFacet.YouTube.prototype.initUI = function() {
	//var labels = new Exhibit.AnimationFacet.Labels(this._facet,0);
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
			'<div style="width:'+settings['ytwidth']+'px; height:'+settings['ytheight']+'px;">'+
				'<div id="'+this._divId+'"></div>'+
			'</div>'+

			(settings['ytshowtrack'] ?
				'<div style="width:'+settings['ytwidth']+'px;">'+
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
			self._facet.updateModeParams(self._playerObj.getCurrentTime());
		} else {
			self._facet.clearAllRestrictions();
		}
	});

	return $el;
}

/** Some UIs may need to do some work after the HTML is displayed on page. */
Exhibit.AnimationFacet.YouTube.prototype.postInitUI = function() {
	var settings = this._facet._settings;
	
	var ytURL = 'http://www.youtube.com/v/';
	swfobject.embedSWF(
		ytURL+
			settings['ytvideo']+			// ID of YouTube video
			"?version=3"+					// V3 of API
			"&enablejsapi=1"+				// Allow script access
			"&title=Video+facet"+			// Title banner
			"&autohide=2"+					// Show or hide controls?
			"&color=white"+					// Progress bar colour
			"&egm=0"+						// Enhanced genie menu?
			"&border=0"+					// Border around player?
			"&iv_load_policy=3"+			// Show annotations? (1=yes, 3=no)
			"&modestbranding=1"+			// Show YouTube logo?
			//"&probably_logged_in=0"+ 		// Get rid of 'watch later' button
			"&rel=0"+						// Load related vidoes?
			"&showinfo=0"+					// Show info before start (title)
			"&fs=0"+						// Full screen allowed?
			"&playerapiid="+this._playerId, // Player ID
		this._divId, 						// Div ID
		settings['ytwidth'], settings['ytheight'], // Width, height
		"8", 								// Flash version
		null, 								// Express install SWF (optional)
		null, 								// FlashVars (optional)
		{	allowScriptAccess: "always" , 
			wmode: 'transparent' , 
			allowfullscreen: 'true' },	// Params for embedSWF Flash code
		{ id: this._playerId }			// Attrs for embedSWF HTML code
	);
	Exhibit.AnimationFacet.YouTube._mapVideoObjectToPlayerId[this._playerId] = this;
}

/** Timed function called to animate. */
Exhibit.AnimationFacet.YouTube.prototype._animate = function() {
	if(this._animationPlaying) {
		this._update();
		setTimeout(this._animationGlueFunc,this._animationFrameDelay);
	}
}

/** Events end up here (see onYouTubePlayerReady()). */
Exhibit.AnimationFacet.YouTube.prototype._onStateChange = function(state) {
	switch(state) {
		case Exhibit.AnimationFacet.YouTube.YT_PLAYING :
			//this._animationLastTime = (new Date()).getTime();
			this._animationPlaying = true;
			this._disableTickbox(true);
			this._update();
			setTimeout(this._animationGlueFunc,this._animationFrameDelay);
			break;
		case Exhibit.AnimationFacet.YouTube.YT_PAUSED :
			this._animationPlaying = false;
			this._disableTickbox(false);
			this._update();
			break;
		case Exhibit.AnimationFacet.YouTube.YT_ENDED :
			this._animationPlaying = false;
			this._disableTickbox(false);
			this._updateLabels(0);
			this._facet.clearAllRestrictions();
			break;
	}
}

Exhibit.AnimationFacet.YouTube.prototype._disableTickbox = function(b) {
	this._$tickbox.attr('disabled',b);
	if(this._hideTickbox) {
		this._$tickbox.css('display',(b?'None':'Inline'));
	}
}

Exhibit.AnimationFacet.YouTube.prototype._update = function(secs) {
	var secs = (secs==undefined) ? this._playerObj.getCurrentTime() : secs;
	this._updateLabels(secs);
	this._facet.updateModeParams(secs);
	this._$tickbox.attr('checked',this._facet.hasRestrictions()?'checked':'');
}

Exhibit.AnimationFacet.YouTube.prototype._updateLabels = function(secs) {
	if(!this._facet._settings['ytshowtrack']) { return; }
	
	var dur = this.getDuration();
	if(dur==0) { return; }

	var labels = new Exhibit.AnimationFacet.Labels(this._facet,Math.floor(secs));
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

/**
 * Called by YT when video player is ready.  Creates a redirect for
 * event handling callbacks.
 */
function onYouTubePlayerReady(pid) {
	var self = Exhibit.AnimationFacet.YouTube._mapVideoObjectToPlayerId[pid];
	// Redirect Exhibit.AnimationFacet.YouTube.__EVENT_HANDLER__<pid>() to obj._onStateChange()
	// Create a new function which redirects to a prototype function.
	var n = '__EVENT_HANDLER__'+pid;
	Exhibit.AnimationFacet.YouTube[n] = function(state) { 
		self._onStateChange(state);
	}
	self._playerObj = document.getElementById(pid);
	self._playerObj.addEventListener('onStateChange','Exhibit.AnimationFacet.YouTube.'+n);
}
