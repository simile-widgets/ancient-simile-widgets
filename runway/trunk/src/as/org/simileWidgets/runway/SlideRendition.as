package org.simileWidgets.runway {
    import flash.display.*;
    import flash.geom.*;
    import flash.events.Event;
    import flash.events.IOErrorEvent;
    import flash.text.TextField;
    import flash.text.TextFormat;
    import flash.text.TextFormatAlign;
    import flash.system.LoaderContext;
    import flash.net.URLRequest;
    
    public class SlideRendition extends Sprite {
        static private const MODE_DISPOSED:int = -1;
        static private const MODE_START:int = 0;
        static private const MODE_LOADING:int = 1;
        static private const MODE_NO_IMAGE:int = 2;
        static private const MODE_GOOD_IMAGE:int = 3;
        static private const MODE_BAD_IMAGE:int = 4;
        
        private var _runway:Runway;
        private var _slide:Slide;
        private var _slideFrame:SlideFrame;
        
        private var _mode:Number = MODE_START;
        
        private var _text:TextField;
        private var _loader:Loader;
        
        private var _prototypeBitmapData:BitmapData;
        private var _bitmap:Bitmap;
        
        public function SlideRendition(runway:Runway, slide:Slide, slideFrame:SlideFrame) {
            _runway = runway;
            _slide = slide;
            _slideFrame = slideFrame;
            
            _text = new TextField();
            addChild(_text);
            
            rerender();
        }
        
        public function dispose():void {
            _disposeLoader();
            _disposeBitmaps();
            
            removeChild(_text);
            _text = null;
            
            _runway = null;
            _slide = null;
            _slideFrame = null;
            
            _mode = MODE_DISPOSED;
        }
        
        public function prepare():void {
            if (_mode === MODE_START) {
                var imageURL:String = _slide.imageURL;
                if (imageURL == null) {
                    _mode = MODE_NO_IMAGE;
                } else {
                    _mode = MODE_LOADING;
                    
                    var loaderContext:LoaderContext = new LoaderContext();
                    loaderContext.checkPolicyFile = true;
                    
                    _loader = new Loader();
                    _loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, onImageError);
                    _loader.contentLoaderInfo.addEventListener(Event.INIT, onImageLoaded);
                    _loader.load(new URLRequest(imageURL), loaderContext);
                }
                
                rerender();
            }
        }
        
        public function rerender():void {
            graphics.clear();
            if (_bitmap != null) {
                var scale:Number = imageScale;
                _bitmap.scaleX = scale;
                _bitmap.scaleY = scale;
                
                _text.visible = false;
            } else {
                var slideSize:Number = _runway.geometry.slideSizePixels;
                
                graphics.beginFill(_runway.theme.slideBackgroundColor);
                graphics.lineStyle();
                graphics.drawRect(0, 0, slideSize, slideSize);
                graphics.endFill();
                
                _text.x = 0;
                _text.y = 2 * slideSize / 3;
                _text.width = slideSize;
                _text.height = slideSize;
                _text.visible = true;
                _text.border = false;
                _text.wordWrap = true;
                
                switch (_mode) {
                case MODE_NO_IMAGE:
                    _text.text = "No Image";
                    break;
                case MODE_LOADING:
                    _text.text = "Loading";
                    break;
                case MODE_BAD_IMAGE:
                    _text.text = "Bad Image";
                    break;
                case MODE_START:
                    _text.text = "Initializing";
                    break;
                default:
                    _text.text = "Error";
                }
                
                var format:TextFormat = new TextFormat();
                format.font = "Arial";
                format.size = 12;
                format.bold = true;
                format.align = TextFormatAlign.CENTER;
                
                _text.setTextFormat(format);
            }
            _drawReflection();
        }
        
        public function get scaledWidth():Number {
            if (_bitmap != null) {
                return Math.round(_prototypeBitmapData.width * imageScale);
            } else {
                return _runway.geometry.slideSizePixels;
            }
        }
        
        public function get scaledHeight():Number {
            if (_bitmap != null) {
                return Math.round(_prototypeBitmapData.height * imageScale);
            } else {
                return _runway.geometry.slideSizePixels;
            }
        }
        
        public function get imageScale():Number {
            if (_bitmap != null) {
                var slideSize:Number = _runway.geometry.slideSizePixels;
                return Math.min(1.0, slideSize / Math.max(_prototypeBitmapData.width, _prototypeBitmapData.height));
            } else {
                return 0;
            }
        }
        
        private function onImageLoaded(e:Event):void {
            //trace("Loaded image " + _slide.imageURL);
            
            _preparePrototypeBitmapData();
            _bitmap = new Bitmap(_prototypeBitmapData);
            addChild(_bitmap);
            
            _disposeLoader();
            _mode = MODE_GOOD_IMAGE;
            
            rerender();
            
            _slideFrame.onRenditionChanged();
        }
        
        private function onImageError(e:Event):void {
            //trace("Error loading image " + _slide.imageURL);
            
            _disposeLoader();
            _mode = MODE_BAD_IMAGE;
            
            rerender();
        }
        
        private function _preparePrototypeBitmapData():void {
            var originalBitmapData:BitmapData = Bitmap(_loader.content).bitmapData;
            
            var scaleWidth:Number = Math.max(1.0, _runway.geometry.maxSlideSizePixels / Math.max(1, originalBitmapData.width));
            var scaleHeight:Number = Math.max(1.0, _runway.geometry.maxSlideSizePixels / Math.max(1, originalBitmapData.height));
            var scale:Number = Math.min(scaleWidth, scaleHeight);
            
            var newWidth:Number = Math.round(originalBitmapData.width * scale);
            var newHeight:Number = Math.round(originalBitmapData.height * scale);
            
            var matrix:Matrix = new Matrix();
            matrix.scale(scale, scale);
            
            _prototypeBitmapData = new BitmapData(newWidth, newHeight, originalBitmapData.transparent);
            _prototypeBitmapData.draw(originalBitmapData, matrix);
        }
        
        private function _drawReflection():void {
            if (_bitmap != null) {
                _reflectPrototypeBitmap();
            } else {
                _reflectSelf();
            }
        }
        
        private function _reflectPrototypeBitmap():void {
            _reflectBitmapData(_prototypeBitmapData, imageScale, scaledHeight);
        }
        
        private function _reflectSelf():void {
            _reflectBitmapDrawable(this, scaledWidth, scaledHeight, 1, scaledHeight);
        }
        
        private function _reflectBitmapDrawable(bitmapDrawable:IBitmapDrawable, width:int, height:int, scale:Number, top:Number):void {
            var targetBitmapData:BitmapData = new BitmapData(width, height, true, 0x00000000);
            targetBitmapData.draw(bitmapDrawable, new Matrix());
            
            _reflectBitmapData(targetBitmapData, scale, top);
            
            targetBitmapData.dispose();
        }
        
        private function _reflectBitmapData(originalBitmapData:BitmapData, scale:Number, top:Number):void {
            var reflectionBitmapData:BitmapData = new BitmapData(originalBitmapData.width, originalBitmapData.height, false, _runway.theme.effectiveBackgroundColorBottom);
            var rect:Rectangle = new Rectangle(0, 0, originalBitmapData.width, originalBitmapData.height);
            
            reflectionBitmapData.copyPixels(originalBitmapData, rect, new Point(), _runway.reflectionMask, null, true);
            
            var transform:Matrix = new Matrix();
            transform.scale(scale, -scale);
            transform.translate(0, originalBitmapData.height);
            
            graphics.beginBitmapFill(reflectionBitmapData, transform);
            graphics.drawRect(0, top, originalBitmapData.width * scale, originalBitmapData.height * scale);
            graphics.endFill();
        }
        
        private function _disposeLoader():void {
            if (_loader != null) {
                try { _loader.unloadAndStop(true); } catch (e:Error) {}
                try { _loader.close(); } catch (e:Error) {}
                
                _loader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, onImageError);
                _loader.contentLoaderInfo.removeEventListener(Event.INIT, onImageLoaded);
                _loader = null;
            }
        }
        
        private function _disposeBitmaps():void {
            if (_prototypeBitmapData != null) {
                removeChild(_bitmap);
                
                _bitmap.bitmapData = null;
                _bitmap = null;
                
                _prototypeBitmapData.dispose();
                _prototypeBitmapData = null;
            }
        }
    }
}
