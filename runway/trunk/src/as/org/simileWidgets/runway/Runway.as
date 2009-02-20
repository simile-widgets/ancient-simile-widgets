package org.simileWidgets.runway {
    import flash.display.*;
    import flash.events.*;
    import flash.ui.Keyboard;
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
        
        private var _transition:Transition = null;
        
        public function Runway(boundingWidth:Number, boundingHeight:Number, theme:Theme, geometry:Geometry) {
            super(boundingWidth, boundingHeight, theme, geometry);
            
            _leftConveyer = new Sprite();
            _platform.addChild(_leftConveyer);
            
            _rightConveyer = new Sprite();
            _platform.addChild(_rightConveyer);
            
            _centerStand = new Sprite();
            _platform.addChild(_centerStand);
            
            _centerIndex = -1;
            
            var stageDetector:StageDetector = new StageDetector(this);
            stageDetector.addEventListener(StageDetector.ADDED_TO_STAGE, _addedToStageListener);
            stageDetector.addEventListener(StageDetector.REMOVED_FROM_STAGE, _removedFromStageListener);
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
            
            if (_transition != null && _transition.running) {
                _transition.stop();
                _transition = null;
            }
            
            var i:int;
            var batch:int = Math.abs(_centerIndex - index);
            var duration:Number = 0.3 + Math.min(batch, 5) * 0.15;
            const maxBatch:int = 10;
            
            var allAnimations:Parallel = new Parallel();
            allAnimations.easing = Easing.easeOutSine; //Easing.easeOutExpo;
            
            var slideFrame:SlideFrame = _slideFrames[index];
            _centerStand.addChild(slideFrame);
            slideFrame.readyToMoveCenter(allAnimations, duration);
            
            if (_centerIndex >= 0 && index < _centerIndex) {
                // The new focus is on the left of the old focus, so things get moved to the right.
                
                i = Math.max(0, _centerIndex);
                
                if (batch > maxBatch) {
                    // Minimize the amount of animations when there is a large batch.
                    for (; i > index + maxBatch; i--) {
                        slideFrame = _slideFrames[i];
                        _rightConveyer.addChild(slideFrame);
                        slideFrame.setStandingPosition(Runway.SIDE_RIGHT);
                    }
                }
                
                for (; i > index; i--) {
                    slideFrame = _slideFrames[i];
                    _rightConveyer.addChild(slideFrame);
                    slideFrame.readyToMoveSideway(allAnimations, Runway.SIDE_RIGHT, batch, i - index, duration);
                }
            } else {
                // The new focus is on the right of the old focus, so things get moved to the left.
                
                i = Math.max(0, _centerIndex);
                
                if (batch > maxBatch) {
                    // Minimize the amount of animations when there is a large batch.
                    for (; i < index - maxBatch; i++) {
                        slideFrame = _slideFrames[i];
                        _leftConveyer.addChild(slideFrame);
                        slideFrame.setStandingPosition(Runway.SIDE_LEFT);
                    }
                }
                
                for (; i < index; i++) {
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
            
            _transition = allAnimations;
            _transition.play();
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
        
        private function _addedToStageListener(e:Event):void {
            addEventListener(Event.ENTER_FRAME, _enterFrameListener);
            stage.addEventListener(KeyboardEvent.KEY_UP, _keyUpListener);
        }
        
        private function _removedFromStageListener(e:Event):void {
            removeEventListener(Event.ENTER_FRAME, _enterFrameListener);
            stage.removeEventListener(KeyboardEvent.KEY_UP, _keyUpListener);
        }
        
        private function _enterFrameListener(e:Event):void {
            var rerender:Boolean = false;
            if (_ensureCleanBackground()) {
                rerender = true;
            }
            if (_ensureCleanSettings()) {
                rerender = true;
            }
            
            if (rerender) {
                for each (var slideFrame:SlideFrame in _slideFrames) {
                    slideFrame.rerender();
                }
            }
        }
        
        private function _keyUpListener(e:KeyboardEvent):void {
            switch (e.keyCode) {
            case Keyboard.LEFT:
            case Keyboard.UP:
                if (_centerIndex > 0) {
                    focus(_centerIndex - 1);
                }
                break;
            case Keyboard.PAGE_UP:
                focus(Math.max(0, _centerIndex - 5));
                break;
            case Keyboard.RIGHT:
            case Keyboard.DOWN:
                if (_centerIndex < _slideFrames.length - 1) {
                    focus(_centerIndex + 1);
                }
                break;
            case Keyboard.PAGE_DOWN:
                focus(Math.min(_slideFrames.length - 1, _centerIndex + 5));
                break;
            case Keyboard.HOME:
                focus(0);
                break;
            case Keyboard.END:
                focus(_slideFrames.length - 1);
                break;
            }
        }
    }
}
