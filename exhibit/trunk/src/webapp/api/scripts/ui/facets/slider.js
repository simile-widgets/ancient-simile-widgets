 
Exhibit.SliderFacet.slider = function(div, facet, precision) {
    this._div = div;
    this._facet = facet;
    this._prec = precision || .1;
    this._range = facet._maxRange;

    this._scaleFactor = null;
    this._minSlider = {};
    this._maxSlider = {};

    this._dom = SimileAjax.DOM.createDOMFromString(
        div,
        '<div class="exhibit-slider-bar" id="bar">' +
            '<div class="exhibit-slider-handle" id="minHandle"></div>' +
	    '<div class="exhibit-slider-handle" id="maxHandle"></div>' +
	'</div>' +
	'<div>' +
	    '<span id="minDisplay"></span> - <span id="maxDisplay"></span>' +
	'</div>'
    );
    this._dom.minDisplay.innerHTML = this._range.min;
    this._dom.maxDisplay.innerHTML = this._range.max;

    this._scaleFactor = (this._range.max - this._range.min)/this._dom.bar.offsetWidth;

    this._initSliders();

    this._registerDragging();
};

Exhibit.SliderFacet.slider.prototype.resetSliders = function() {
    this._setSlider(this._minSlider, this._range.min);
    this._setSlider(this._maxSlider, this._range.max);
};

Exhibit.SliderFacet.slider.prototype._setSlider = function(slider, value) {
    if (value >= this._range.max) {
	slider.div.style.left = slider.max;
    }
    if (value <= this._range.min) {
	slider.div.style.left = slider.min;
    }
    slider.div.style.left = value/this._scaleFactor + 'px';

    if (slider == this._minSlider) {
	this._range.min = value;
    } else {
	this._range.max = value;
    }
    this._notifyFacet();
};

Exhibit.SliderFacet.slider.prototype._initSliders = function() {
    this._dom.minHandle.style.left = 0;
    this._dom.maxHandle.style.left = 0;

    var self = this;

    var min = this._minSlider;
    min.value = this._range.min;
    min.div = this._dom.minHandle;
    min.display = this._dom.minDisplay;
    min.offset = min.div.offsetWidth/2;
    min.min = function(){ return -min.offset; };
    min.max = function(){ return parseInt(max.div.style.left) + max.offset - min.offset; };

    var max = this._maxSlider;
    max.value = this._range.max;
    max.div = this._dom.maxHandle;
    max.display = this._dom.maxDisplay;
    max.offset = max.div.offsetWidth/2 + min.div.offsetWidth;
    max.min = function(){ return min.div.offsetLeft + min.offset - self._dom.bar.offsetLeft - max.offset; };
    max.max = function(){ return self._dom.bar.offsetWidth - max.offset; };

    min.setDisplay = max.setDisplay = function(left) {
	this.display.innerHTML = Exhibit.Util.round((left+this.offset)*self._scaleFactor+self._range.min, self._prec);
    };
};

Exhibit.SliderFacet.slider.prototype._registerDragging = function() {
    var startDrag = function(slider) {
	return function(e) {
	    e = e || window.event;
	    
	    onMove = onDrag(e, slider);

	    if(addEventListener) {
		document.addEventListener('mousemove', onMove, false);
		document.addEventListener('mouseup', endDrag(slider, onMove), false);
	    };
	};
    };

    var onDrag = function(e, slider) {
	origX = e.screenX;
	origLeft = parseInt(slider.div.style.left);
	min = slider.min();
	max = slider.max();

	return function(e) {
	    e = e || window.event; // CHECK IN IE!!!!!!!

	    dx = e.screenX - origX;
	    newLeft = origLeft + dx;
	    if (newLeft < min) {
		newLeft = min;
	    }
	    if (newLeft > max) {
		newLeft = max;
	    }
	    slider.div.style.left = newLeft + 'px';

	    slider.setDisplay(newLeft);
	};
    };

    var endDrag = function(slider, moveListener) {
	return function(e) {
	    
	    if(removeEventListener) {
		document.removeEventListener('mousemove', moveListener, false);
		document.removeEventListener('mouseup', arguments.callee, false); //remove this function
	    }
	};
    };

    var attachListeners = function(slider) {
	if (addEventListener) {
	    slider.div.addEventListener('mousedown', startDrag(slider), false);
	}
    };

    attachListeners(this._minSlider);
    attachListeners(this._maxSlider);
	
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
	    if (this.left < this.min) {
		this.left = this.min;
	    }
	    if (this.left > this.max) {
		this.left = this.max;
	    }
	    slider.div.style.left = this.left + 'px';
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
         { onDragStart: function() {
		 var minHandle = self._dom.minHandle;
		 var bar = self._dom.bar;
		 this._maxHandle = self._dom.maxHandle;
		 this._offset = this._maxHandle.offsetWidth/2 + minHandle.offsetWidth;

		 this._left = parseInt(this._maxHandle.style.left);

		 this._min = minHandle.offsetLeft + minHandle.offsetWidth/2 - bar.offsetLeft - this._offset;
		 this._max = bar.offsetWidth - this._offset;
	     },

	     onDragBy: function(dx, dy) {
		 this._left += dx;
		 if (this._left < this._min) {
		     this._left = this._min;
		 } 
		 else if (this._left > this._max) {
		     this._left = this._max;
		 }
		 this._maxHandle.style.left = this._left + 'px';

		 self._dom.maxDisplay.innerHTML = Exhibit.Util.round((this._left+this._offset)*self._scaleFactor+self._range.min, self._prec);
	     },

	     onDragEnd: function() {
		 self._max = self._dom.maxDisplay.innerHTML;
		 self._notifyFacet();
	     }
	 }
    );
};

Exhibit.SliderFacet.slider.prototype._notifyFacet = function() {
    this._facet.changeRange( {min: this._min, max: this._max} );
};