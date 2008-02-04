 
Exhibit.SliderFacet.slider = function(div, facet, precision) {
    this._div = div;
    this._facet = facet;
    this._prec = precision || .1;

    this._range = facet._maxRange;
    this._min = this._range.min = Math.floor(this._range.min/this._prec) * this._prec; //current min value
    this._max = this._range.max = Math.ceil(this._range.max/this._prec) * this._prec; //current max value

    this._scaleFactor = null;
    this._minSlider = {div: null, offset: null, min: null, max: null};
    this._maxSlider = {div: null, offset: null, min: null, max: null};

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

    var min = this._minSlider;
    min.div = this._dom.minHandle;
    min.offset = min.div.offsetWidth/2;
    min.min = function(){ return -min.offset; };
    min.max = fucntion(){ return min.div.offsetLeft - this._dom.bar.offsetLeft; };

    var max = this._maxSlider;
    max.div = this._dom.maxHandle;
    max.offset = max.div.offsetWidth/2 + min.div.offsetWidth;
    max.min = function(){ return min.div.offsetLeft + min.offset - this._dom.bar.offsetLeft - max.offset; }
    max.max = function(){ return this._dom.bar.offsetWidth - max.offset; }
};

Exhibit.SliderFacet.slider.prototype._registerDragging = function() {
    var startDrag = function(slider) {
	return function(e) {
	    e = e || window.event;

	    onMove = onDrag(slider, e.screenX);

	    if(addEventListener) {
		document.addEventListener('mousemove', onMove, false);
		document.addEventListener('mouseup', endDrag(slider, onMove), false);
	    };
	};
    };

    var onDrag = function(slider, origX) {
	return function(e) {
	    e = e || window.event; // CHECK IN IE!!!!!!!
	    
	    dx = e.screenX - origX;
	    newLeft = parseInt(slider.div.style.left) + dx;
	    if (newLeft < slider.min()) {
		newLeft = slider.min();
	    }
	    if (newLeft > slider.max()) {
		newLeft = slider.max();
	    }
	    slider.div.style.left = newLeft + 'px';
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
    this._dom.minHandle.style.left = 0;
    this._dom.maxHandle.style.left = 0;
    var self = this;

    //min slider
    SimileAjax.WindowManager.registerForDragging(
         this._dom.minHandle,
         { onDragStart: function() {
		 this._minHandle = self._dom.minHandle;
		 this._offset = this._minHandle.offsetWidth/2

		 this._left = parseInt(this._minHandle.style.left);
		 this._min = -this._offset;
		 this._max = self._dom.maxHandle.offsetLeft - self._dom.bar.offsetLeft;
	     },

	     onDragBy: function(dx, dy) {
		 this._left += dx;
		 if (this._left < this._min) {
		     this._left = this._min;
		 } 
		 else if (this._left > this._max) {
		     this._left = this._max;
		 }
		 this._minHandle.style.left = this._left + 'px';

		 self._dom.minDisplay.innerHTML = Math.round((this._left+this._offset)*self._scaleFactor+self._range.min);
	     },
	     
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

		 //self._dom.maxDisplay.innerHTML = Exhibit.Util.round((this._left+this._offset)*self._scaleFactor+self._range.min, self._prec);
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