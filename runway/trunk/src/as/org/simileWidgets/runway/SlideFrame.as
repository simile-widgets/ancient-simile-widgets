package org.simileWidgets.runway {
    import flash.display.*;

    public class SlideFrame extends Sprite {
        private var _runway:Runway;
        private var _rendition:SlideRendition;
        private var _side:int;
        
        public function SlideFrame(runway:Runway, slide:Slide) {
            _runway = runway;
            _rendition = new SlideRendition(runway, slide, this);
            addChild(_rendition);
        }
        
        public function dispose():void {
            _runway = null;
            
            _rendition.dispose();
            _rendition = null;
        }
        
        public function prepare():void {
            _rendition.prepare();
        }
        
        public function setStandingPosition(side:int, index:int):void {
            _side = side;
            
            var p:Object = _calculateStandingPosition(side, index);
            this.x = p.x;
            this.y = p.y;
            this.z = p.z;
            this.rotationY = p.rotationY;
            
            _positionRendition();
        }
        
        public function onRenditionChanged():void {
            _positionRendition();
        }
        
        protected function _calculateStandingPosition(side:int, index:int):Object {
            var slideSize:int = _runway.geometry.slideSizePixels;
            
            switch (side) {
            case Runway.SIDE_LEFT:
                return {
                    x: _runway.geometry.spreadPixels * index - _runway.geometry.centerSpreadPixels,
                    y: 0,
                    z: _runway.geometry.recedePixels,
                    rotationY: -_runway.geometry.tilt
                };
            case Runway.SIDE_RIGHT:
                return {
                    x: _runway.geometry.spreadPixels * index + _runway.geometry.centerSpreadPixels - 
                        Math.round(slideSize * Math.cos(_runway.geometry.tilt * Math.PI / 180)),
                    y: 0,
                    z: _runway.geometry.recedePixels + 
                        Math.round(slideSize * Math.sin(_runway.geometry.tilt * Math.PI / 180)),
                    rotationY: _runway.geometry.tilt
                };
            
            case Runway.SIDE_CENTER:
            default:
                return {
                    x: _runway.geometry.spreadPixels * index - Math.round(slideSize / 2),
                    y: 0,
                    z: 0,
                    rotationY: 0
                };
            }
        }
        
        protected function _positionRendition():void {
            _rendition.y = _runway.geometry.slideSizePixels - _rendition.scaledHeight;
            if (_side == Runway.SIDE_RIGHT) {
                _rendition.x = _runway.geometry.slideSizePixels - _rendition.scaledWidth;
            } else if (_side == Runway.SIDE_CENTER) {
                _rendition.x = (_runway.geometry.slideSizePixels - _rendition.scaledWidth) / 2;
            }
        }
    }
}
