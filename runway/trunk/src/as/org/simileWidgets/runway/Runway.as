package org.simileWidgets.runway {
    import flash.display.*;
    import flash.events.*;
    import flare.animate.*;
    
    public class Runway extends RunwayBase {
        static internal const SIDE_LEFT:int = 0;
        static internal const SIDE_RIGHT:int = 1;
        static internal const SIDE_CENTER:int = 2;
        
        static internal const THEMES:Object = {
            "arctic" : {
            },
            "pitchblack" : {
            }
        };
        
        private var _leftConveyer:Sprite;
        private var _rightConveyer:Sprite;
        private var _centerStand:Sprite;
        private var _centerIndex:Number;
        
        private var _slides:Array = [];
        private var _slideFrames:Array = [];
        
        public function Runway(boundingWidth:Number, boundingHeight:Number, theme:Theme, geometry:Geometry) {
            super(boundingWidth, boundingHeight, theme, geometry);
            
            _leftConveyer = new Sprite();
            _platform.addChild(_leftConveyer);
            
            _rightConveyer = new Sprite();
            _platform.addChild(_rightConveyer);
            
            _centerStand = new Sprite();
            _platform.addChild(_centerStand);
            
            _centerIndex = -1;
            
            addEventListener(Event.ENTER_FRAME, enterFrameListener);
        }
        
        public function setRecords(records:Object):void {
                trace("Adding " + records.length);
            if (_slides.length == 0) {
                for (var i:int = 0; i < records.length; i++) {
                    var record:Object = records[i];
                    if (!("id" in record)) {
                        record["id"] = "r" + Math.round(1000000 * Math.random());
                    }
                    
                    var slide:Slide = new Slide(record);
                    var slideFrame:SlideFrame = new SlideFrame(this, slide, i);
                    
                    _slides.push(slide);
                    _slideFrames.push(slideFrame);
                    
                    if (i == _centerIndex) {
                        _centerStand.addChild(slideFrame);
                    } else if (i < _centerIndex) {
                        _leftConveyer.addChild(slideFrame);
                    } else {
                        _rightConveyer.addChildAt(slideFrame, 0);
                    }
                    
                    slideFrame.setStandingPosition(i == _centerIndex ? SIDE_CENTER : (i < _centerIndex ? SIDE_LEFT : SIDE_RIGHT));
                    slideFrame.prepare();
                }
                trace("Added " + records.length);
                focus(0);
            } else {
                // Don't know what to do yet
            }
        }
        
        public function focus(index:int):void {
            if (index == _centerIndex || index < 0) {
                return;
            }
            
            var i:int;
            var duration:Number = 1.5;
            
            var allAnimations:Parallel = new Parallel();
            allAnimations.easing = Easing.easeOutExpo;
            
            var batch:int = Math.abs(_centerIndex - index);
            var slideFrame:SlideFrame = _slideFrames[index];
            _centerStand.addChild(slideFrame);
            slideFrame.readyToMoveCenter(allAnimations, duration);
            
            if (_centerIndex >= 0 && index < _centerIndex) {
                for (i = Math.max(0, _centerIndex); i > index; i--) {
                    slideFrame = _slideFrames[i];
                    _rightConveyer.addChild(slideFrame);
                    slideFrame.readyToMoveSideway(allAnimations, Runway.SIDE_RIGHT, batch, i - index, duration);
                }
            } else {
                for (i = Math.max(0, _centerIndex); i < index; i++) {
                    slideFrame = _slideFrames[i];
                    _leftConveyer.addChild(slideFrame);
                    slideFrame.readyToMoveSideway(allAnimations, Runway.SIDE_LEFT, batch, index - i, duration);
                }
            }
            
            allAnimations.add(
                new Tween(
                    _platform, 
                    duration, 
                    {
                        x: -_geometry.spreadPixels * index
                    }
                )
            );
            
            _centerIndex = index;
            
            allAnimations.play();
        }
        
        internal function onSlideFrameClick(slideFrame:SlideFrame, side:int):void {
            var i:int;
            if (side == SIDE_LEFT) {
                for (i = _centerIndex - 1; i >= 0; i--) {
                    if (_slideFrames[i] == slideFrame) {
                        focus(i);
                        return;
                    }
                }
            } else if (side == SIDE_RIGHT) {
                for (i = _centerIndex + 1; i < _slideFrames.length; i++) {
                    if (_slideFrames[i] == slideFrame) {
                        focus(i);
                        return;
                    }
                }
            }
        }
        
        private function enterFrameListener(e:Event):void {
            _ensureCleanBackground();
            if (_ensureCleanSettings()) {
            }
        }
    }
}
