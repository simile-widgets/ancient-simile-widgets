package org.simileWidgets.runway {
    import flash.display.*;
    import flash.events.*;

    import flare.animate.Transitioner;
    import flare.animate.Tween;
    
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
                var center:int = 2;//Math.round(records.length / 2);
                _platform.x = -_geometry.spreadPixels * center;
                
                for (var i:int = 0; i < records.length; i++) {
                    var record:Object = records[i];
                    if (!("id" in record)) {
                        record["id"] = "r" + Math.round(1000000 * Math.random());
                    }
                    
                    var slide:Slide = new Slide(record);
                    var slideFrame:SlideFrame = new SlideFrame(this, slide);
                    
                    _slides.push(slide);
                    _slideFrames.push(slideFrame);
                    
                    if (i == center) {
                        _centerStand.addChild(slideFrame);
                    } else if (i < center) {
                        _leftConveyer.addChild(slideFrame);
                    } else {
                        _rightConveyer.addChildAt(slideFrame, 0);
                    }
                    
                    slideFrame.setStandingPosition(i == center ? SIDE_CENTER : (i < center ? SIDE_LEFT : SIDE_RIGHT), i);
                    slideFrame.prepare();
                }
                trace("Added " + records.length);
                focus(0);
            } else {
                // Don't know what to do yet
            }
        }
        
        public function focus(index:int):void {
        }
        
        private function enterFrameListener(e:Event):void {
            _ensureCleanBackground();
            if (_ensureCleanSettings()) {
            }
        }
    }
}
