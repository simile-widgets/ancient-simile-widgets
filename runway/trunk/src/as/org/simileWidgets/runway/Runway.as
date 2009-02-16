package org.simileWidgets.runway {
    import flash.display.*;
    import flash.events.*;

    import flare.animate.Transitioner;
    import flare.animate.Tween;
    
    import flare.animate.*;
    
    public class Runway extends RunwayBase {
        static internal const MAX_SLIDE_SIZE:Number = 400; // pixels
        
        static internal const SIDE_LEFT:int = 0;
        static internal const SIDE_RIGHT:int = 1;
        static internal const SIDE_CENTER:int = 2;
        
        private var _leftConveyer:Sprite;
        private var _rightConveyer:Sprite;
        private var _centerStand:Sprite;
        private var _centerIndex:Number;
        
        private var _slides:Array = [];
        private var _slideFrames:Array = [];
        
        public function Runway(boundingWidth:Number, boundingHeight:Number) {
            super(boundingWidth, boundingHeight);
            
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
                    var slideFrame:SlideFrame = new SlideFrame(this, slide);
                    
                    _slides.push(slide);
                    _slideFrames.push(slideFrame);
                    
                    _rightConveyer.addChildAt(slideFrame, 0);
                    
                    slideFrame.setStandingPosition(i == 0 ? SIDE_CENTER : SIDE_RIGHT, i);
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
