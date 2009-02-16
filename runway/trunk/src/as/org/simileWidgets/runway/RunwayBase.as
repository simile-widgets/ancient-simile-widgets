package org.simileWidgets.runway {
    import flash.display.*;
    import flash.geom.Matrix;
    import flash.geom.Point;
    import flash.geom.PerspectiveProjection;
    
    public class RunwayBase extends Sprite {
        protected var _boundingWidth:Number;
        protected var _boundingHeight:Number;
        
        protected var _fixedSlideSize:Boolean = false; // false means slides are resized based on container
        
        protected var _slideSize:Number = 0.5;     // in pixels if fixedSlideSize is true, 
                                                   // or otherwise, ratio of container's height
                                    
        protected var _spread:Number = 0.5;        // of slideSize
        protected var _centerSpread:Number = 0.5;  // of slideSize
        protected var _recede:Number = 0.5;        // of slideSize
        protected var _tilt:Number = 60;           // degrees
        protected var _horizon:Number = 0.5;       // of container's height, from top
        
        protected var _reflectivity:Number = 0.7;      // alpha of reflection
        protected var _reflectionExtent:Number = 0.5;  // of slideSize, how far the reflection extents until it fades to nothing
        protected var _reflectionTint:String = null;
        
        protected var _backgroundGradient:String = "double";
        protected var _backgroundColor:uint = 0x0;
        protected var _backgroundColorTop:uint = 0x0;
        protected var _backgroundColorMiddle:uint = 0x444444;
        protected var _backgroundColorBottom:uint = 0x222222;
        
        protected var _backgroundImageURL:String = null;
        protected var _backgroundImageAlign:String = "middle center";
        protected var _backgroundImageRepeat:String = "repeat";
        protected var _backgroundImageOpacity:Number = 1.0;
        
        public var slideBorderThickness:Number = 1.0;
        public var slideBorderColor:uint = 0x888888;
        public var slideBackgroundColor:uint = 0x666666;
        
        protected var _settingsDirty:Boolean = true;
        protected var _backgroundDirty:Boolean = true;
        
        /*
         *  These are calculated.
         */
        protected var _slideSizePixels:Number;
        protected var _recedePixels:Number;
        protected var _spreadPixels:Number;
        protected var _centerSpreadPixels:Number;
        
        protected var _mask:Sprite;
        protected var _platformView:Sprite;
        protected var _platform:Sprite;
        
        public function RunwayBase(boundingWidth:Number, boundingHeight:Number) {
            this.boundingWidth = boundingWidth;
            this.boundingHeight = boundingHeight;
            
            _platformView = new Sprite();
            _platformView.transform.perspectiveProjection = new PerspectiveProjection();
            addChild(_platformView);
            
            _platform = new Sprite();
            _platformView.addChild(_platform);
            
            _recalculate();
            _setPerspective();
        }
        
        public function get boundingWidth():Number {
            return _boundingWidth;
        }
        public function set boundingWidth(newBoundingWidth:Number):void {
            newBoundingWidth = Math.round(Math.max(100, newBoundingWidth));
            if (_boundingWidth != newBoundingWidth) {
                _boundingWidth = newBoundingWidth;
                _backgroundDirty = true;
            }
        }
        
        public function get boundingHeight():Number {
            return _boundingHeight;
        }
        public function set boundingHeight(newBoundingHeight:Number):void {
            newBoundingHeight = Math.round(Math.max(100, newBoundingHeight));
            if (_boundingHeight != newBoundingHeight) {
                _boundingHeight = newBoundingHeight;
                _settingsDirty = true;
                _backgroundDirty = true;
            }
        }
        
        public function forceLayout():void {
            _settingsDirty = true;
            _backgroundDirty = true;
        }
        
        public function get fixedSlideSize():Boolean {
            return _fixedSlideSize;
        }
        public function set fixedSlideSize(newFixedSlideSize:Boolean):void {
            if (_fixedSlideSize != newFixedSlideSize) {
                _fixedSlideSize = newFixedSlideSize;
                _settingsDirty = true;
            }
        }

        public function get slideSize():Number {
            return _slideSize;
        }
        public function set slideSize(newSlideSize:Number):void {
            newSlideSize = Math.max(50, Math.min(Runway.MAX_SLIDE_SIZE, newSlideSize));
            if (_slideSize != newSlideSize) {
                _slideSize = newSlideSize;
                _settingsDirty = true;
            }
        }
        
        public function get spread():Number {
            return _spread;
        }
        public function set spread(newSpread:Number):void {
            newSpread = Math.max(0.1, Math.min(1.0, newSpread));
            if (_spread != newSpread) {
                _spread = newSpread;
                _settingsDirty = true;
            }
        }
        
        public function get centerSpread():Number {
            return _centerSpread;
        }
        public function set centerSpread(newCenterSpread:Number):void {
            newCenterSpread = Math.max(0.1, Math.min(1.0, newCenterSpread));
            if (_centerSpread != newCenterSpread) {
                _centerSpread = newCenterSpread;
                _settingsDirty = true;
            }
        }
        
        public function get recede():Number {
            return _recede;
        }
        public function set recede(newRecede:Number):void {
            newRecede = Math.max(0.1, Math.min(1.0, newRecede));
            if (_recede != newRecede) {
                _recede = newRecede;
                _settingsDirty = true;
            }
        }
        
        public function get tilt():Number {
            return _tilt;
        }
        public function set tilt(newTilt:Number):void {
            newTilt = Math.max(10, Math.min(80, newTilt));
            if (_tilt != newTilt) {
                _tilt = newTilt;
                _settingsDirty = true;
            }
        }

        public function get horizon():Number {
            return _horizon;
        }
        public function set horizon(newHorizon:Number):void {
            newHorizon = Math.max(0.1, Math.min(0.9, newHorizon));
            if (_horizon != newHorizon) {
                _horizon = newHorizon;
                _settingsDirty = true;
            }
        }
        
        public function get reflectivity():Number {
            return _reflectivity;
        }
        public function set reflectivity(newReflectivity:Number):void {
            newReflectivity = Math.max(0.1, Math.min(1.0, newReflectivity));
            if (_reflectivity != newReflectivity) {
                _reflectivity = newReflectivity;
                _settingsDirty = true;
            }
        }

        public function get reflectionExtent():Number {
            return _reflectionExtent;
        }
        public function set reflectionExtent(newReflectionExtent:Number):void {
            newReflectionExtent = Math.max(0.1, Math.min(1.0, newReflectionExtent));
            if (_reflectionExtent != newReflectionExtent) {
                _reflectionExtent = newReflectionExtent;
                _settingsDirty = true;
            }
        }
        
        public function get slideSizePixels():Number {
            _ensureCleanSettings();
            return _slideSizePixels;
        }
        
        public function get recedePixels():Number {
            _ensureCleanSettings();
            return _recedePixels;
        }
        
        public function get spreadPixels():Number {
            _ensureCleanSettings();
            return _spreadPixels;
        }
        
        public function get centerSpreadPixels():Number {
            _ensureCleanSettings();
            return _centerSpreadPixels;
        }
        
        protected function _ensureCleanSettings():Boolean {
            if (_settingsDirty) {
                _recalculate();
                return true;
            }
            return false;
        }
        protected function _ensureCleanBackground():Boolean {
            if (_backgroundDirty) {
                _redrawBackground();
                return true;
            }
            return false;
        }
        
        protected function _recalculate():void {
            _slideSizePixels = Math.round(_fixedSlideSize ? _slideSize : _slideSize * boundingHeight);
            
            _recedePixels = Math.round(_slideSizePixels * _recede);
            _spreadPixels = Math.round(_slideSizePixels * _spread);
            _centerSpreadPixels = Math.round(_slideSizePixels * _centerSpread);
            
            _settingsDirty = false;
        }
        
        protected function _redrawBackground():void {
            _setPerspective();
            
            graphics.clear();
            
            var mtx:Matrix = new Matrix();
            mtx.createGradientBox(boundingWidth, boundingHeight, Math.PI / 2);
                
            if (_backgroundGradient == "single") {
                graphics.beginGradientFill(
                    GradientType.LINEAR,
                    [ _backgroundColorTop, _backgroundColorBottom ], 
                    [ 1.0, 1.0 ],
                    [ 0x00, 0xFF ], 
                    mtx, 
                    SpreadMethod.PAD
                );
            } else if (_backgroundGradient == "double") {
                graphics.beginGradientFill(
                    GradientType.LINEAR,
                    [ _backgroundColorTop, _backgroundColorMiddle, _backgroundColorBottom ], 
                    [ 1.0, 1.0, 1.0 ],
                    [ 0x00, Math.round(_horizon * 0xFF), 0xFF ], 
                    mtx, 
                    SpreadMethod.PAD
                );
            } else {
                graphics.beginFill(_backgroundColor, 1.0);
                graphics.lineStyle();
            }
            
            graphics.drawRect(0, 0, boundingWidth, boundingHeight);
            graphics.endFill();
            
            _backgroundDirty = false;
        }
        
        protected function _setPerspective():void {
            _platformView.x = boundingWidth / 2;
            _platformView.y = 0;
            _platformView.transform.perspectiveProjection.projectionCenter = new Point(0, boundingHeight / 2);
            _platformView.transform.perspectiveProjection.fieldOfView = 45;
            
            _platformView.graphics.clear();
            _platformView.graphics.lineStyle(1, 0xFFFFFF);
            _platformView.graphics.moveTo(0, 0);
            _platformView.graphics.lineTo(0, boundingHeight);
            _platformView.graphics.moveTo(0, boundingHeight / 2);
            _platformView.graphics.lineTo(boundingWidth / 2, boundingHeight / 2);
            
            _platform.y = Math.round((boundingHeight - slideSizePixels) / 3);
        }
    }
}
