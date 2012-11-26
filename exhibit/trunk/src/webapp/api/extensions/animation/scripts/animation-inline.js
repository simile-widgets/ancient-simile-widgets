/* --------------------------------------------------------------------
 * Default UI
 * -------------------------------------------------------------------- */

Exhibit.AnimationFacet._settingSpecs['inlineshowplay'] =  { type:"boolean" ,  defaultValue:true };
Exhibit.AnimationFacet._settingSpecs['inlinemodernstyle'] =  { type:"boolean" ,  defaultValue:false };

/** Constructor. */
Exhibit.AnimationFacet.Inline = function(facet) {
	this._duration = 0;						// Duration, from _settings (in seconds)
	this._dom = null;						// Handy DOM bits inside <div>
	this._facet = facet;					// Parent
	
	this._animationStartTime = 0;			// Millis when animation began (or restarted on drag)
	this._animationStartPosition = 0;		// Pixels
	this._animationFrameDelay = 100;		// Animate every 250 millis
	this._animationPlaying = false;			// Playing or paused?
	this._dragging = false;					// Thumb being dragged?
	// JavaScript timers need come code to eval, making it hard to point to functions 
	// inside specific objects.  Create a unique function at Exhibit.AnimationFacet 
	// level, and use it to redirect timer calls.
	this._animationGlueFunc = '__animation_glue__'+Exhibit.AnimationFacet._getNextAnimationUnique();
	var self = this;
	Exhibit.AnimationFacet.Inline[this._animationGlueFunc] = function() {
		self._animate();
	}
}

// http://www.opinionatedgeek.com/dotnet/tools/base64encode/
Exhibit.AnimationFacet.Inline.PLAY_PNG  = "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAAXNSR0IArs4c6QAAAAZiS0dEAMkAyQDJYYDmDgAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wJBw06OtKSuKQAAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAAVxJREFUKM+dk89KAlEUxn83fAxh3qSFT+HONrlyE25mV+3O20T0D6KEQgwtC5mNJCLq6KhMiuhCZ+Fp4U0TRKy7ufcc+H3ng/NdRORCRA75xzEiovadA85d133eFz4ASCaTxOPxBPAkIo/7OokBOI6D4zg0m03y+XzC9/2EiOSAU9d18zttZ7PZjWar1aJQKNDpdAAegbNtIkZENJPJ2Mp21WCAdrtFsVQiCAKAB+uksAGnj9NrEECXQvbC933K5TL9fh/g3jp5MSKiR6nUilmpGgMoqmCskN/2qVQqhGEIcBIDmEfRehwKan7cY4But4vneQyHQ4A7u9LiEp7NwSib3iEIAqrVKqPRCODWQqWNVUXR3E4y6EIZDAbUap+Mx2OAGwu9bt3zLIpgoYRfIfV6nclkor+gt50h6fd6NBoNptOpAtcWKu+VMM/zFLiy0Pu+2Y4Blxb6+Ouv+gZldbw7tlbjQQAAAABJRU5ErkJggg==";
Exhibit.AnimationFacet.Inline.PAUSE_PNG = "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAAXNSR0IArs4c6QAAAAZiS0dEAMkAyQDJYYDmDgAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wJBw4TAryQIYgAAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAAP9JREFUKM99kt1xg0AMhD95aCHjspxuoASoybzThtNFbO1FebgfYAzWw83N7Wm10srGcQxOYhgG+4R3AH3fvwHTNLX7Gd4BpPQHnBYgpQQYEOXcVJYcyqNtOMZxJOMiCAx7l+2ekysYtlfh7phRqq9xqcxJwuW4HEkAfN9urbK7kDvy/G+tLLVettxf12tLXkcSRJZRem6y61wy6K9nTnY14rC1964xH8Tv85VJisxDn+XKom0v/ufxWKdd4NjgOTk5UXqyjZPLslCtjMhYGNTPxSrxKc7wS5UtCVexo8xgGIbWc8VcanvRrMLidENTmTbsF6UDmOf7R9n3eT58/wfel7gwBDKMLAAAAABJRU5ErkJggg==";
Exhibit.AnimationFacet.Inline.THUMB_PNG = "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAAXNSR0IArs4c6QAAAAZiS0dEAMwAzADM38FfGgAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wIFAsaGOk3cJEAAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAAgpJREFUKM+dkz9OG0EYxX8zOxvJiMiDwQYbS4QQ2lRIMQoSDRAuwAFSUeQCewSuQJUDcISUSLELKsoAKeKVRdaWEVpEpJ1/KXaxUJQ0mW70vd8370lvBH+ck5OTj8ARsAU0gClwAZwlSfL5uVY8g94Cp0DvzeYmGxuvaTZbTMZjbm6+c3X1DWAAHCdJcjmDK/CL1rq1836HzmoHFUUIKQFwzjEajTg/P+fu7i4D9pMkuZTVw6da69b+wQEr7RWiKEKpmDiOiZVCRYp2u83hh0O01q3KIVGV8dPu7i6NhQZRHBEphVKKOH6BEBBCIPiAkAKt61xfX3f39vZ+SOBobe0Vi4uLBIAAVGLnLd5DCB5fTllaarK+vg5wJIGtbneV4EMp8h7nHNZZTGEwpsA5h3cO78t5t9sF2FJAo16v47xDOomQorRKQCIJhHKhtbMFekEDNBQwnU6nzdpcrYQBPMjII4SoUgS8c1jncM4xmUwAphK4SNMUZx3WWIy1GGswxlCYorReFBhjsNZinSUdpgAXEjhL05TxZFzmNBZjSvgp8+xuDNnPjOFwCHD2VJL+y/n53rvtHnO1OYSURELO+hdCmfvx1yOD/oA8zwdJkmw/leQ4f3jIBv0BWZZhi8qyMRRFgSkKsiyj/7VPnucZcPzPbnc6HZaXl9Fac39/z+3tLaPR6O/d/t9f9RsoTTP4+32UigAAAABJRU5ErkJggg==";
Exhibit.AnimationFacet.Inline.SHAFT_PNG = "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAAXNSR0IArs4c6QAAAAZiS0dEAIgAiACIdJABBgAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wIFAsiBOqpkCUAAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAAbZJREFUKM+dk81uGjEUhT+PPd3WDT8TKBLQNG/ArpHYTJM8Eo/AQ7FDKqRpXqAhVdCgERqqUETSxQy2s5iBkDbNond1fe1zjn3uteCP6Pf7/Ct6vd6ztXgJ9PH4mKOjD1QqVX4uFtzc/OD6+vtfJGIfqLXm5NMJ9fd1lJQIzwPAGEMcxwyHQ5bL5Y7A27Jprfl8esph7RApJUr5+L6PrxRKKmq1Gudn52itdzeQW9Vut8vBuwOkL5FKoZTC998gBDjncNYhPIHWb5lMJoRhmCs3my1KpRIOwAHFYWM3WAvOWWy+S7lcod1uA6AAN53eMp3e8nq4fX9zcBAEhe8CnCtcFLmOcOAEooDmiWNbUK12C+GeuHcnd4htnlO6vS6ri/GFaDQadDodlFRIJZFS4nneDuScxVqLMYaN2XD59ZIoilAAs9mMZqtJpVzBOoe1NgdvX1vUjDEsFguiKMpbNRgMCMOQX3dLqkEVKSW2cNvaJ0VjDA+/H7j6dkWaps+HZH1/z3g0JkkSNmlGmqVkWUaapmRpSpIkjL6MWK/Xr892vV4nCAK01qxWK+bzOXEcvzzb//urHgE3adNcFxKl0AAAAABJRU5ErkJggg==";

/** Destructor. */
Exhibit.AnimationFacet.Inline.prototype.dispose = function() {
	this._dom = null;
}

/** This is called to give UI's the ability to extend _settingSpecs. */
/*Exhibit.AnimationFacet.Inline.prototype.extendSettingSpecs = function(specs) {
}*/

/** Set duration, in seconds.  Impl's can ignore this, if they get their duration from media. */
Exhibit.AnimationFacet.Inline.prototype.setDuration = function(secs) {
	this._duration = secs;
}

/** Duration, in seconds. */
Exhibit.AnimationFacet.Inline.prototype.getDuration = function() {
	return this._duration;
}

/** Initialise UI, returning HTML.  This HTML is then displayed, and postInitUI() called. */
Exhibit.AnimationFacet.Inline.prototype.initUI = function() {
	var labels = new Exhibit.AnimationFacet.Labels(this._facet,0);
	
	// Build UI
	var settings = this._facet._settings;
	var showPlay = settings['inlineshowplay'];
	var html = null;
	if(!settings['inlinemodernstyle']) {
		var cssWidth = settings['width'] ? ' width:'+settings['width']+';' : 'width:100px;';
		var cssHeight = settings['height'] ? ' height:'+settings['height']+';' : ' height:10px;';
		var html = 
			'<span>'+
				((showPlay) ? '<span class="exhibit-facet-animation-button"></span>' : '')+
				'<div style="display:Inline-Block; margin-left:5px; margin-right:5px;'+cssWidth+'" class="exhibit-facet-animation-shaft-container">'+
					'<div class="exhibit-facet-animation-shaft" style="position:Relative; width:100%;'+cssHeight+'">'+
						'<div class="exhibit-facet-animation-shaft-thumb" style="position:Absolute;'+cssHeight+'"></div>'+
					'</div>'+
				'</div>'+
			'</span>';
	} else {
		var cssWidth = settings['width'] ? ' width:'+settings['width']+';' : 'width:100px;';
		var _1 = 
			"border:None; height:15px; "+
			"background-image:url(data:image/png;base64,"+Exhibit.AnimationFacet.Inline.SHAFT_PNG+"); "+
			"background-repeat:Repeat-X;";
		var _2 = 
			"border:None; width:15px; height:15px; "+
			"background-image:url(data:image/png;base64,"+Exhibit.AnimationFacet.Inline.THUMB_PNG+"); " +
			"background-repeat:None;";
		var html = 
			'<span>'+
				((showPlay) ? '<span class="exhibit-facet-animation-button"></span>' : '')+
				'<div style="display:Inline-Block; border:None; margin-left:8px; margin-right:8px;'+cssWidth+'" class="exhibit-facet-animation-shaft-container">'+
					'<div class="exhibit-facet-animation-shaft" style="position:Relative; width:100%; '+_1+'">'+
						'<div class="exhibit-facet-animation-shaft-thumb" style="position:Absolute; '+_2+'"></div>'+
					'</div>'+
				'</div>'+
			'</span>';
	}

	// Build node, and store handy refs inside structure
	var el = $(html);
	this._dom = {
		elmt: el.get()[0] ,
		shaft: $('.exhibit-facet-animation-shaft',el).get()[0] ,
		thumb: $('.exhibit-facet-animation-shaft-thumb',el).get()[0] ,
		button: $('.exhibit-facet-animation-button',el).get()[0] 
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
	// UI event code ends
	this._showPlayButton(true);
	// Install;
	//$(this._facet._div).html(this._dom.elmt);
	return this._dom.elmt;
}

/** Some UIs may need to do some work after the HTML is displayed on page. */
Exhibit.AnimationFacet.Inline.prototype.postInitUI = function() {
	this._updateThumbUI(0,false);
}

/* Show either play or pause button. */
Exhibit.AnimationFacet.Inline.prototype._showPlayButton = function(b) {
	var self = this;
	var obj = (this._facet._settings['inlinemodernstyle']) ? Exhibit.AnimationFacet.Inline : Exhibit.AnimationFacet;
	$(this._dom.button).html(
		'<img src="data:image/png;base64,' + obj[b?'PLAY_PNG':'PAUSE_PNG'] + '" />'
	);
	$('img',this._dom.button).click(
		b ?
		function(ev) { self._animateStart(); } :
		function(ev) { self._animateStop(); }
	);
}
/* Update UI, and possibly cause Exhibit to re-evaluate. */
Exhibit.AnimationFacet.Inline.prototype._updateThumbUI = function(x,considerRestrict) {
	// Update thumb position
	var w = $(this._dom.shaft).width();
	var ended = (x>w-1);
	x = (x<0) ? 0 : x;  // Lower bound
	x = (x>w-1) ? w-1 : x;  // Upper bound
	var th = $(this._dom.thumb);
	th.css('left',(x-th.width()/2)+'px');
	// What's the time (mister wolf)..?
	var t = Math.floor(this._duration * (x/w*1.0));
	// Look into possibly updating exhibit
	if(considerRestrict) {
		this._facet.updateModeParams(t);
	}
	return ended;
}

/** Start animation. */
Exhibit.AnimationFacet.Inline.prototype._animateStart = function() {
	this._animationPlaying = true;
	this._animationStartTime = (new Date()).getTime();
	this._animationStartPosition = 
		($(this._dom.thumb).offset().left) - // Thumb
		($(this._dom.shaft).offset().left) + // Shaft
		($(this._dom.thumb).width()/2);  // Middle of thumb
	this._showPlayButton(false);
	setTimeout('Exhibit.AnimationFacet.Inline.'+this._animationGlueFunc+"()",this._animationFrameDelay);
}
/** Stop/pause animation. */
Exhibit.AnimationFacet.Inline.prototype._animateStop = function() {
	this._animationPlaying = false;
	this._showPlayButton(true);
}
/** Timed function called to animate. */
Exhibit.AnimationFacet.Inline.prototype._animate = function() {
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
			setTimeout('Exhibit.AnimationFacet.Inline.'+this._animationGlueFunc+"()",this._animationFrameDelay);
		} else {
			this._animateStop();
			this._updateThumbUI(0,false);
			this._facet.clearAllRestrictions();
		}
	}
}
