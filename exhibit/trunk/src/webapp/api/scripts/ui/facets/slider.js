 
Exhibit.SliderFacet.slider = function(div, facet, precision) {
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
        '<div class="exhibit-slider-bar" id="bar">' +
	    '<div class="exhibit-slider-handle" id="slider1"></div>' +
	    '<div class="exhibit-slider-handle" id="slider2"></div>' +
	    (this._facet._settings.histogram? '<canvas class="exhibit-slider-histogram" id="histogram"></canvas>' : '') +
	'</div>' +
	'<div class="exhibit-slider-display">' +
	    '<span id="display1"></span> - <span id="display2"></span>' +
	'</div>'
    );
    this._dom.display1.innerHTML = this._range.min;
    this._dom.display2.innerHTML = this._range.max;

    this._scaleFactor = (this._range.max - this._range.min)/this._dom.bar.offsetWidth;

    this._slider1 = new Exhibit.SliderFacet.slider.slider(this._dom.slider1, this._dom.display1, this);
    this._slider2 = new Exhibit.SliderFacet.slider.slider(this._dom.slider2, this._dom.display2, this);
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

// If you call this, it's up to you to notifyFacet if necessary
Exhibit.SliderFacet.slider.prototype.resetSliders = function(){ 
    this._setSlider(this._minSlider, this._range.min);
    this._setSlider(this._maxSlider, this._range.max);
};

// If you call this, it's up to you to notifyFacet if necessary
Exhibit.SliderFacet.slider.prototype._setSlider = function(slider, value) {
    if (value > this._range.max) {
	value = this._range.max
    }
    else if (value < this._range.min) {
	value = this._range.min
    }
    value = Exhibit.Util.round(value, this._prec);

    slider.value = value;
    slider.div.style.left = (value/this._scaleFactor-slider.offset) + 'px';
    slider.display.innerHTML = value;
};

Exhibit.SliderFacet.slider.slider = function(div, displayEl, self) { // individual slider handle that can be dragged
    var barEl = self._dom.bar;

    this.div = div;
    this.div.style.backgroundImage = 'url("'+Exhibit.urlPrefix+'images/slider-handle.png")';
    this.display = displayEl;
    this.offset = (this.div.offsetLeft - barEl.offsetLeft) + this.div.offsetWidth/2;
    this.min = -this.offset; // slider's middle can reach left edge of bar
    this.max = barEl.offsetWidth - this.offset; //slider's middle can reach right edge of bar
    this.setDisplay = function(left) {
	var position = parseInt(this.div.style.left) + this.offset;
	this.display.innerHTML = Exhibit.Util.round(position*self._scaleFactor+self._range.min, self.prec);
    }

    if (self._facet._settings.histogram) {
	this.div.style.top = this.div.offsetHeight+'px';
    }
}

Exhibit.SliderFacet.slider.prototype._initSliders = function() {
    this._dom.minHandle.style.left = 0;
    this._dom.maxHandle.style.left = 0;

    var self = this;

    var min = this._minSlider;
    min.value = this._range.min;
    min.div = this._dom.minHandle;
    min.div.style.backgroundImage = 'url("'+Exhibit.urlPrefix+'images/right-arrow.png")';
    min.display = this._dom.minDisplay;
    min.offset = min.div.offsetWidth;
    min.min = function(){ return -min.offset; };
    min.max = function(){ return parseFloat(max.div.style.left) + max.offset - min.offset; };

    if (!this._facet._settings.histogram) {
	min.div.style.top = -min.div.offsetHeight/2 + 'px';
    }

    var max = this._maxSlider;
    max.value = this._range.max;
    max.div = this._dom.maxHandle;
    max.div.style.backgroundImage = 'url("'+Exhibit.urlPrefix+'images/left-arrow.png")';
    max.display = this._dom.maxDisplay;
    max.offset = min.div.offsetWidth;
    max.min = function(){ return parseFloat(min.div.style.left) + min.offset - max.offset; };
    max.max = function(){ return self._dom.bar.offsetWidth - max.offset; };

    if (!this._facet._settings.histogram) {
	max.div.style.top = -max.div.offsetHeight/2 + 'px';
    }

    min.setDisplay = max.setDisplay = function(left) {
	this.display.innerHTML = Exhibit.Util.round((left+this.offset)*self._scaleFactor+self._range.min, self._prec);
    };

    this.resetSliders();
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
	var origX = e.screenX;
	var origLeft = parseInt(slider.div.style.left);
	var min = slider.min;
	var max = slider.max;

	return function(e) {
	    e = e || window.event; // CHECK IN IE!!!!!!!

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
	    setTimeout(function(){ slider.setDisplay(); }, 0);
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

	    slider.value = slider.display.innerHTML;
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

Exhibit.SliderFacet.slider.prototype._registerDragging2 = function() {
    var self = this;

    var dragStart = function(slider) {
	return function() {
	    this.left = parseInt(slider.div.style.left);
	    this.min = slider.min();
	    this.max = slider.max();
	};
    };

    var onDrag = function(slider) {
	return function(dx, dy) {
	    this.left += dx;
	    left = this.left;
	    if (this.left < this.min) {
		this.left = this.min;
	    }
	    if (this.left > this.max) {
		this.left = this.max;
	    }
	    slider.div.style.left = this.left + 'px';

	    //setTimeout keeps setDisplay from slowing down the dragging
	    //I'm not entirely sure why, but I think it might have something to do with it putting the call in a new environment
	    setTimeout(function(){ slider.setDisplay(left); }, 0);
	};
    };

    //min slider
    SimileAjax.WindowManager.registerForDragging(
         this._dom.minHandle,
           { onDragStart: dragStart(this._minSlider),
		 
	     onDragBy: onDrag(this._minSlider),
	     
	     onDragEnd: function() {
		 self._min = self._dom.minDisplay.innerHTML;
		 self._notifyFacet();
	     }
	 }
    );

    //max slider
    SimileAjax.WindowManager.registerForDragging(
	 this._dom.maxHandle,
         { onDragStart: dragStart(this._maxSlider),

	   onDragBy: onDrag(this._maxSlider),

	   onDragEnd: function() {
		self._min = self._minSlider.display.innerHTML;
		self._notifyFacet();
	   }
	 }
    );

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

    var width = this._dom.bar.offsetWidth/n;  // width of each bar
    var maxHeight = this._dom.bar.offsetHeight;
    var ratio = maxHeight/maxVal;

    for (var i=0; i<n; i++){
	var height = Math.round(data[i]*ratio);
	ctx.fillRect(i*width, maxHeight-height, width, height)
    }

};

