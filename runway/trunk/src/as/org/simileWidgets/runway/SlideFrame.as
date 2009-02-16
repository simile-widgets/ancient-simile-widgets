package org.simileWidgets.runway {
    import flash.display.*;

    public class SlideFrame extends Sprite {
        private var _runway:Runway;
        private var _rendition:SlideRendition;
        
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
            var p:Object = _calculateStandingPosition(side, index);
            this.x = p.x;
            this.y = p.y;
            this.z = p.z;
            this.rotationY = p.rotationY;
        }
        
        protected function _calculateStandingPosition(side:int, index:int):Object {
            var slideSize:int = _runway.slideSizePixels;
            
            switch (side) {
            case Runway.SIDE_LEFT:
                return {
                    x: _runway.spreadPixels * index - _runway.centerSpreadPixels,
                    y: 0,
                    z: _runway.recedePixels,
                    rotationY: -_runway.tilt
                };
            case Runway.SIDE_RIGHT:
                return {
                    x: _runway.spreadPixels * index + _runway.centerSpreadPixels - 
                        Math.round(slideSize * Math.cos(_runway.tilt * Math.PI / 180)),
                    y: 0,
                    z: _runway.recedePixels + 
                        Math.round(slideSize * Math.sin(_runway.tilt * Math.PI / 180)),
                    rotationY: _runway.tilt
                };
            
            case Runway.SIDE_CENTER:
            default:
                return {
                    x: _runway.spreadPixels * index - Math.round(slideSize / 2),
                    y: 0,
                    z: 0,
                    rotationY: 0
                };
            }
        }
    }
}
