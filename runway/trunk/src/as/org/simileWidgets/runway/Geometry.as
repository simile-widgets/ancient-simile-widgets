package org.simileWidgets.runway {
    public class Geometry {
        static internal const DEFAULT_SLIDE_SIZE_PIXELS:Number = 200;
        static internal const DEFAULT_SLIDE_SIZE_RATIO:Number = 0.5;
        
        static internal const MAX_SLIDE_SIZE_PIXELS:Number = 400; // for performance, we never ever go beyond 400 pixels
        static internal const MIN_SLIDE_SIZE_PIXELS:Number = 50;  // for visual sanity, we never ever go under 50 pixels
    
        public var dirty:Boolean = true;
        
        protected var _fixedSlideSize:Boolean;     // false means slides are resized based on container;
                                                   // not configurable on the fly
        
        protected var _slideSize:Number;           // in pixels if fixedSlideSize is true, 
                                                   // or otherwise, ratio of container's height
                                    
        protected var _spread:Number = 0.6;        // of slideSize
        protected var _centerSpread:Number = 0.7;  // of slideSize
        protected var _recede:Number = 1.25;       // of slideSize
        protected var _tilt:Number = 70;           // degrees
        protected var _horizon:Number = 0.5;       // of container's height, from top
        
        /*
         *  These are calculated.
         */
        protected var _slideSizePixels:Number;
        protected var _recedePixels:Number;
        protected var _spreadPixels:Number;
        protected var _centerSpreadPixels:Number;
        
        public function Geometry(fixedSlideSize:Boolean, slideSize:Number) {
            _fixedSlideSize = fixedSlideSize;
            _slideSize = fixedSlideSize ? 
                (slideSize > 0 ? _limit(slideSize, MIN_SLIDE_SIZE_PIXELS, MAX_SLIDE_SIZE_PIXELS) : DEFAULT_SLIDE_SIZE_PIXELS) : 
                (slideSize > 0 ? slideSize : DEFAULT_SLIDE_SIZE_RATIO);
        }
        
        public function get fixedSlideSize():Boolean {
            return _fixedSlideSize;
        }
        
        public function get slideSize():Number {
            return _slideSize;
        }
        public function set slideSize(newSlideSize:Number):void {trace("here");
            if (!_fixedSlideSize) {
                newSlideSize = _limit(newSlideSize, MIN_SLIDE_SIZE_PIXELS, MAX_SLIDE_SIZE_PIXELS);
                if (_slideSize != newSlideSize) {
                    _slideSize = newSlideSize;
                    dirty = true;
                }
            }
        }
        
        public function get spread():Number {
            return _spread;
        }
        public function set spread(v:Number):void {
            v = _limit(v, 0.1, 1.0);
            if (_spread != v) {
                _spread = v;
                dirty = true;
            }
        }
        
        public function get centerSpread():Number {
            return _centerSpread;
        }
        public function set centerSpread(v:Number):void {
            v = _limit(v, 0.1, 1.0);
            if (_centerSpread != v) {
                _centerSpread = v;
                dirty = true;
            }
        }
        
        public function get recede():Number {
            return _recede;
        }
        public function set recede(v:Number):void {
            v = _limit(v, 0.1, 1.0);
            if (_recede != v) {
                _recede = v;
                dirty = true;
            }
        }
        
        public function get tilt():Number {
            return _tilt;
        }
        public function set tilt(v:Number):void {
            v = _limit(v, 10, 80);
            if (_tilt != v) {
                _tilt = v;
                dirty = true;
            }
        }

        public function get horizon():Number {
            return _horizon;
        }
        public function set horizon(v:Number):void {
            v = _limit(v, 0.1, 0.9);
            if (_horizon != v) {
                _horizon = v;
                dirty = true;
            }
        }
        
        public function get maxSlideSizePixels():Number {
            return _fixedSlideSize ? slideSize : MAX_SLIDE_SIZE_PIXELS;
        }
        
        public function get slideSizePixels():Number {
            return _slideSizePixels;
        }
        
        public function get recedePixels():Number {
            return _recedePixels;
        }
        
        public function get spreadPixels():Number {
            return _spreadPixels;
        }
        
        public function get centerSpreadPixels():Number {
            return _centerSpreadPixels;
        }
        
        public function recalculate(boundingWidth:Number, boundingHeight:Number):void {
            _slideSizePixels = _fixedSlideSize ? _slideSize : 
                _limit(Math.round(_slideSize * boundingHeight), MIN_SLIDE_SIZE_PIXELS, MAX_SLIDE_SIZE_PIXELS);
            
            _recedePixels = Math.round(_slideSizePixels * _recede);
            _spreadPixels = Math.round(_slideSizePixels * _spread);
            _centerSpreadPixels = Math.round(_slideSizePixels * _centerSpread);
            
            dirty = false;
        }
        
        private function _limit(v:Number, min:Number, max:Number):Number {
            return Math.max(min, Math.min(max, v));
        }
    }
}
