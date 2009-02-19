package org.simileWidgets.runway {
    import flash.display.*;
    import flash.events.Event;
    import flash.events.MouseEvent;
    import flare.animate.Parallel;
    import flare.animate.Tween;
    import flare.animate.Easing;

    public class SlideFrame extends Sprite {
        private var _runway:Runway;
        private var _rendition:SlideRendition;
        private var _side:int;
        private var _index:int;
        
        public function SlideFrame(runway:Runway, slide:Slide, index:int) {
            _runway = runway;
            _index = index;
            
            _rendition = new SlideRendition(runway, slide, this);
            addChild(_rendition);
            
            addEventListener(MouseEvent.CLICK, _clickListener);
        }
        
        public function dispose():void {
            removeEventListener(MouseEvent.CLICK, _clickListener);
            
            _rendition.dispose();
            _rendition = null;
            
            _runway = null;
        }
        
        public function prepare():void {
            _rendition.prepare();
        }
        
        public function setStandingPosition(side:int):void {
            _side = side;
            
            var p:Object = _calculateStandingPosition(side, _index);
            this.x = p.x;
            this.y = p.y;
            this.z = p.z;
            this.rotationY = p.rotationY;
            
            _positionRendition();
        }
        
        public function readyToMoveSideway(animations:Parallel, side:int, movingBatchCount:int, howFar:int, duration:Number):void {
            var p:Object = _calculatePosition(side, _index, _runway.geometry.tilt / 2);
            
            this.x = p.x;
            this.y = p.y;
            this.z = p.z - (_runway.geometry.recedePixels * howFar / movingBatchCount);
            this.rotationY = p.rotationY;
            
            _side = side;
            
            p = _calculateStandingPosition(_side, _index);
            animations.add(
                new Tween(
                    this, 
                    duration, 
                    {
                        x: p.x,
                        y: p.y,
                        z: p.z,
                        rotationY: p.rotationY
                    }
                )
            );
            animations.add(
                new Tween(
                    _rendition, 
                    duration, 
                    {
                        x: _side == Runway.SIDE_LEFT ? 0 : (_runway.geometry.slideSizePixels - _rendition.scaledWidth)
                    }
                )
            );                        
        }
        
        public function readyToMoveCenter(animations:Parallel, duration:Number):void {
            var p:Object = _calculatePosition(_side, _index, _runway.geometry.tilt / 2);
            
            this.x = p.x;
            this.y = p.y;
            this.z = p.z;
            this.rotationY = p.rotationY;
            
            _side = Runway.SIDE_CENTER;
            
            p = _calculateStandingPosition(_side, _index);
            animations.add(
                new Tween(
                    this, 
                    duration, 
                    {
                        x: p.x,
                        y: p.y,
                        z: p.z,
                        rotationY: p.rotationY
                    }
                )
            );
            animations.add(
                new Tween(
                    _rendition, 
                    duration, 
                    {
                        x: (_runway.geometry.slideSizePixels - _rendition.scaledWidth) / 2
                    }
                )
            );
        }
        
        internal function onRenditionChanged():void {
            _positionRendition();
        }
        
        protected function _calculateStandingPosition(side:int, index:int):Object {
            return _calculatePosition(side, index, _runway.geometry.tilt);
        }
        
        protected function _calculatePosition(side:int, index:int, tilt:Number):Object {
            var slideSize:int = _runway.geometry.slideSizePixels;
            
            switch (side) {
            case Runway.SIDE_LEFT:
                return {
                    x: _runway.geometry.spreadPixels * index - _runway.geometry.centerSpreadPixels,
                    y: 0,
                    z: _runway.geometry.recedePixels,
                    rotationY: -tilt
                };
            case Runway.SIDE_RIGHT:
                return {
                    x: _runway.geometry.spreadPixels * index + _runway.geometry.centerSpreadPixels - 
                        Math.round(slideSize * Math.cos(tilt * Math.PI / 180)),
                    y: 0,
                    z: _runway.geometry.recedePixels + 
                        Math.round(slideSize * Math.sin(tilt * Math.PI / 180)),
                    rotationY: tilt
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
        
        private function _clickListener(e:Event):void {
            _runway.onSlideFrameClick(this, _side);
        }
    }
}
