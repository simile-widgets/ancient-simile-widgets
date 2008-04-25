 
Exhibit.SliderFacet.slider = function(div, facet, precision, horizontal) {
	this._horizontal = horizontal;
	if (horizontal) {
		this.horizontalSlider(div, facet, precision);
	}else {
	    this._div = div;
	    this._facet = facet;
	    if (facet._maxRange.min % 1>0) {
	    	precision = .01;
	    	size = 4;
	    }else {
	    	precision = 1;
	    	size = 2;
	    }
	    this._prec = precision || .1;
	    
	    
	    this._range = {min: facet._maxRange.min,  // round down
			   max: facet._maxRange.max}; // round up
	
	    this._scaleFactor = null;
	    this._slider1 = {};
	    this._slider2 = {};
	
		var self = this;
		
	    this._dom = SimileAjax.DOM.createDOMFromString(
	        div,
		'<div class="exhibit-slider-display">' +
		    '<input type="text" size="'+size+'" id="minDisplay" class="exhibit-slider-minDisplay"></input>' +
		'</div>' +
	        '<div class="exhibit-slider-bar2" id="bar">' +
		    '<div class="exhibit-slider-handle2" id="slider1"></div>' +
		    '<div class="exhibit-slider-handle2" id="slider2"></div>' +
		    (this._facet._settings.histogram? '<canvas class="exhibit-slider-histogram2" id="histogram"></canvas>' : '') +
		'</div>'+
		'<div class="exhibit-slider-display">' +
		    '<input type="text" size="'+size+'" id="maxDisplay" class="exhibit-slider-maxDisplay"></input>' +
		'</div>'
	    );
	
	    this._scaleFactor = (this._range.max - this._range.min)/this._dom.bar.offsetHeight;
	    
	    this._slider1 = new Exhibit.SliderFacet.slider.slider(this._dom.slider1, this);
	    this._slider2 = new Exhibit.SliderFacet.slider.slider(this._dom.slider2, this);
	    
	    console.log(Math.max(facet._selection.min, this._range.min)+" "+Math.min(facet._selection.max, this._range.max));
	    this._setSlider(this._slider1, (facet._selection.min!=null)?Math.max(facet._selection.min, this._range.min):this._range.min);
    	this._setSlider(this._slider2, (facet._selection.max!=null)?Math.min(facet._selection.max, this._range.max):this._range.max);
	    this._registerDragging();
	    
	    SimileAjax.WindowManager.registerEvent(self._dom.minDisplay, "change", 
	                function(elmt, evt, target) {self.validateInput(self._slider1, self._dom.minDisplay.value); });
	                
	    SimileAjax.WindowManager.registerEvent(self._dom.maxDisplay, "change", 
	                function(elmt, evt, target) {self.validateInput(self._slider2, self._dom.maxDisplay.value); }); 
	    
	    if(this._dom.histogram) {
		this._dom.histogram.width = this._dom.bar.offsetWidth;
		this._dom.histogram.height = this._dom.bar.offsetHeight;
	    } else {
		this._dom.bar.style.borderTop = '1px solid black';
	    }
    }
};


Exhibit.SliderFacet.slider.prototype.horizontalSlider = function(div, facet, precision) {
	this._div = div;
    this._facet = facet;
    this._prec = precision || .1;
    this._range = {min: parseFloat(Exhibit.Util.round(facet._maxRange.min-precision/2, this._prec)),  // round down
		   max: parseFloat(Exhibit.Util.round(facet._maxRange.max+precision/2, this._prec))}; // round up

    this._scaleFactor = null;
    this._slider1 = {};
    this._slider2 = {};

    this._dom = SimileAjax.DOM.createDOMFromString(
        div,
	'<div class="exhibit-slider-display">' +
	    '<div id="minDisplay" class="exhibit-slider-minDisplay"></div>' +
	    '<div id="maxDisplay" class="exhibit-slider-maxDisplay"></div>' +
	'</div>' +
        '<div class="exhibit-slider-bar" id="bar">' +
	    '<div class="exhibit-slider-handle" id="slider1"></div>' +
	    '<div class="exhibit-slider-handle" id="slider2"></div>' +
	    (this._facet._settings.histogram? '<canvas class="exhibit-slider-histogram" id="histogram"></canvas>' : '') +
	'</div>'
    );

    this._scaleFactor = (this._range.max - this._range.min)/this._dom.bar.offsetWidth;

    this._slider1 = new Exhibit.SliderFacet.slider.slider(this._dom.slider1, this);
    this._slider2 = new Exhibit.SliderFacet.slider.slider(this._dom.slider2, this);
    this._setSlider(this._slider1, this._range.min);
    this._setSlider(this._slider2, this._range.max);

    this._registerDragging();
    
    if(this._dom.histogram) {
		this._dom.histogram.width = this._dom.bar.offsetWidth;
		this._dom.histogram.height = this._dom.bar.offsetHeight;
    } else {
		this._dom.bar.style.borderTop = '1px solid black';
    }
};


Exhibit.SliderFacet.slider.prototype.validateInput = function(slider, value) {
	try {
		var numericValue = parseFloat(value);
		if (isNaN(numericValue)) {
			slider.value = slider.value;
		}else if (numericValue<this._range.min) {
			//alert("Input must be bigger than "+this._range.min+"!");
			slider.value = this._range.min;
			slider.div.style.top = (slider.value-this._range.min)/this._scaleFactor - 7 + 'px';
		}else if (numericValue>this._range.max) {
			//alert("Input must be smaller than "+this._range.max+"!");
			slider.value = this._range.max;
			slider.div.style.top = (slider.value-this._range.min)/this._scaleFactor - 7 + 'px';
		}else {
			slider.div.style.top = (value-this._range.min)/this._scaleFactor - 7 + 'px';
			var position = parseInt(slider.div.style.top)+7;
			slider.value = parseFloat(Exhibit.Util.round(position*this._scaleFactor+this._range.min, this._prec));		
		}
	}catch(err) {
		slider.value = slider.value;
	}
	
	this._setDisplays(slider);
	this._notifyFacet();
	return true;
}

// If you call this, it's up to you to notifyFacet if necessary
Exhibit.SliderFacet.slider.prototype.resetSliders = function(){ 
    this._setSlider(this._slider1, this._range.min);
    this._setSlider(this._slider2, this._range.max);
};

// If you call this, it's up to you to notifyFacet if necessary
Exhibit.SliderFacet.slider.prototype._setSlider = function(slider, value) {
    if (value > this._range.max) {
		value = this._range.max
    }else if (value < this._range.min) {
		value = this._range.min
    }
    value = Exhibit.Util.round(value, this._prec);

    slider.value = value;
    if (this._horizontal) {
    	slider.div.style.left = (value/this._scaleFactor-slider.offset) + 'px';
    }else {
    	slider.div.style.top = (value-this._range.min)/this._scaleFactor - 7 + 'px';
    }
    this._setDisplays(slider);
};

// Updates displays based on slider's value (i.e., slider's value should have changed recently)
Exhibit.SliderFacet.slider.prototype._setDisplays = function(slider) {
    var other = (slider == this._slider1)? this._slider2 : this._slider1;

    var min = Math.min(slider.value, other.value);
    var max = Math.max(slider.value, other.value);

    this._dom.maxDisplay.style.cssFloat = 'left';
    this._dom.minDisplay.value = min;
    this._dom.maxDisplay.value = max;
    
};

Exhibit.SliderFacet.slider.slider = function(div, self) { // individual slider handle that can be dragged
    var barEl = self._dom.bar;

    this.div = div; // containing div of handle
    
    if (self._horizontal) {
	    this.div.style.backgroundImage = 'url("'+Exhibit.urlPrefix+'images/slider-handle.png")';
	    this.offset = (this.div.offsetLeft - barEl.offsetLeft) + this.div.offsetWidth/2;
	    this.min = -this.offset; // slider's middle can reach left edge of bar
	    this.max = barEl.offsetWidth - this.offset; //slider's middle can reach right edge of bar   
    }else {
	    this.div.style.backgroundImage = 'url("'+Exhibit.urlPrefix+'images/slider-handle2.png")';
	    //this.offset =  barEl.offsetTop;
	    this.min = 0;//-this.offset; // slider's middle can reach left edge of bar
	    this.max = barEl.offsetHeight; //slider's middle can reach right edge of bar
	}
    if (self._facet._settings.histogram) {
		this.div.style.top = (this.div.offsetHeight-4)+'px';
    }
};


Exhibit.SliderFacet.slider.prototype._registerDragging = function() {
    var self = this;

    var startDrag = function(slider) {
		return function(e) {
		    e = e || window.event;
		    
		    var onMove = onDrag(e, slider);
		    
		    if (document.attachEvent) {
			document.attachEvent('onmousemove', onMove);
			document.attachEvent('onmouseup', endDrag(slider, onMove));
		    } else {
			document.addEventListener('mousemove', onMove, false);
			document.addEventListener('mouseup', endDrag(slider, onMove), false);
		    }
	
		    SimileAjax.DOM.cancelEvent(e);
		    return false;
		};
    };

    var onDrag = function(e, slider) {
		var origY = e.screenY;
		if (this._horizontal) {
			var origLeft = parseInt(slider.div.style.left);
			var min = slider.min;
			var max = slider.max;
		}else {
			var origTop = parseInt(slider.div.style.top);
			var min = slider.min - 7;
			var max = slider.max - 7;
		}
		
		return function(e) {
		    e = e || window.event
	
			if (this._horizontal) {
				var dx = e.screenX - origX;
			    var newLeft = origLeft + dx;
			    if (newLeft < min) {
				newLeft = min;
			    }
			    if (newLeft > max) {
				newLeft = max;
			    }
			    slider.div.style.left = newLeft + 'px';
		
			    //setTimeout keeps setDisplay from slowing down the dragging
			    //I'm not entirely sure why, but I think it might have something to do with it putting the call in a new environment
			    setTimeout(function(){ var position = parseInt(slider.div.style.left) + slider.offset;
				                   slider.value = parseFloat(Exhibit.Util.round(position*self._scaleFactor+self._range.min, self._prec));
						   self._setDisplays(slider); }, 0);
			}else {
			    var dx = e.screenY - origY;
			    var newTop = origTop + dx;
			    if (newTop < min) {
					newTop = min;
			    }
			    if (newTop > max) {
					newTop = max;
			    }
			    slider.div.style.top = newTop + 'px';
		
			    //setTimeout keeps setDisplay from slowing down the dragging
			    //I'm not entirely sure why, but I think it might have something to do with it putting the call in a new environment
			    setTimeout(function(){ var position = parseInt(slider.div.style.top)+7;
				                   slider.value = parseFloat(Exhibit.Util.round(position*self._scaleFactor+self._range.min, self._prec));
						   self._setDisplays(slider); }, 0);			   
			}
		};
    };

    var endDrag = function(slider, moveListener) {
		return function(e) {
		    
		    if(document.detachEvent) {
			document.detachEvent('onmousemove', moveListener);
			document.detachEvent('onmouseup', arguments.callee);
		    } else {
			document.removeEventListener('mousemove', moveListener, false);
			document.removeEventListener('mouseup', arguments.callee, false); //remove this function
		    }
	
		    self._notifyFacet();
		};
    };

    var attachListeners = function(slider) {
		if (document.attachEvent) {
		    slider.div.attachEvent('onmousedown', startDrag(slider));
		} else {
		    slider.div.addEventListener('mousedown', startDrag(slider), false);
		}
    };

    attachListeners(this._slider1);
    attachListeners(this._slider2);
	
};


Exhibit.SliderFacet.slider.prototype._notifyFacet = function() {
    var val1 = this._slider1.value;
    var val2 = this._slider2.value;
    this._facet.changeRange( {min: Math.min(val1, val2), max: Math.max(val1, val2)} );
};


Exhibit.SliderFacet.slider.prototype.updateHistogram = function(data, n) {
    // data ([numbers]): the values to graphed, in this case the attribute value of all unrestricted items
    // n (int): the number of bars in the histogram
    var n = n? n : 75;
    var histogram = this._dom.histogram;
    var ctx = histogram.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,.25)';

    ctx.clearRect(0,0, histogram.width, histogram.height);

    var maxVal = Math.max.apply(Math, data); //find the max of an array

    if (!maxVal) {
		return; //nothing to draw
    }

	if (this._horizontal) {
		var width = this._dom.bar.offsetWidth/n;  // width of each bar
	    var maxHeight = this._dom.bar.offsetHeight;
	    var ratio = maxHeight/maxVal;
	
	    for (var i=0; i<n; i++){
		var height = Math.round(data[i]*ratio);
		ctx.fillRect(i*width, maxHeight-height, width, height)
	    }
	}else {
	    var height = this._dom.bar.offsetHeight/n;  // width of each bar
	    var maxWidth = this._dom.bar.offsetWidth;
	    var ratio = maxWidth/maxVal;
	
	    for (var i=0; i<n; i++){
			var width = Math.round(data[i]*ratio);
			ctx.fillRect(0, i*height, width, height)
	    }
	}
};

