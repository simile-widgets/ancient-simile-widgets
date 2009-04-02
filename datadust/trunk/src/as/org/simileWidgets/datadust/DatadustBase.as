package org.simileWidgets.datadust {
    import flash.display.*;
    
    public class DatadustBase extends Sprite {
        protected var _boundingWidth:Number;
        protected var _boundingHeight:Number;
        
        public function DatadustBase(boundingWidth:Number, boundingHeight:Number) {
            _boundingWidth = boundingWidth;
            _boundingHeight = boundingHeight;
        }
        
        public function get boundingWidth():Number {
            return _boundingWidth;
        }
        
        public function set boundingWidth(newBoundingWidth:Number):void {
            newBoundingWidth = Math.round(Math.max(100, newBoundingWidth));
            if (_boundingWidth != newBoundingWidth) {
                _boundingWidth = newBoundingWidth;
            }
        }
        
        public function get boundingHeight():Number {
            return _boundingHeight;
        }
        public function set boundingHeight(newBoundingHeight:Number):void {
            newBoundingHeight = Math.round(Math.max(100, newBoundingHeight));
            if (_boundingHeight != newBoundingHeight) {
                _boundingHeight = newBoundingHeight;
            }
        }
    }
}
