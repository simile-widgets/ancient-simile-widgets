package org.simileWidgets.runway {
    import flash.display.*;

    public class Theme {
        static internal const GRADIENT_NONE:String = "none";
        static internal const GRADIENT_SINGLE:String = "single";
        static internal const GRADIENT_DOUBLE:String = "double";
        
        protected var _reflectivity:Number;      // alpha of reflection
        protected var _reflectionExtent:Number;  // of slideSize, how far the reflection extents until it fades to nothing
        
        protected var _backgroundGradient:String;
        protected var _backgroundColor:uint;
        protected var _backgroundColorTop:uint;
        protected var _backgroundColorMiddle:uint;
        protected var _backgroundColorBottom:uint;
        
        protected var _backgroundImageURL:String;
        protected var _backgroundImageAlign:String;
        protected var _backgroundImageRepeat:String;
        protected var _backgroundImageOpacity:Number;
        
        protected var _slideBackgroundColor:uint;
        
        protected var _showTitle:Boolean;
        protected var _titleFontFamily:String;
        protected var _titleFontSize:Number;
        protected var _titleFontBold:Boolean;
        protected var _titleColor:uint;
        
        protected var _showSubtitle:Boolean;
        protected var _subtitleFontFamily:String;
        protected var _subtitleFontSize:Number;
        protected var _subtitleFontBold:Boolean;
        protected var _subtitleColor:uint;
        
        public var dirty:Boolean = true;
        
        public function Theme(themeName:String) {
            _copyFrom(Themes.names[themeName || Themes.defaultName]);
        }
        
        public function resetThemeName(themeName:String):void {
            _copyFrom(Themes.names[themeName || Themes.defaultName]);
        }
        
        private function _copyFrom(themeObject:Object):void {
            for (var n:String in themeObject) {
                if (themeObject.hasOwnProperty(n)) {
                    this[n] = themeObject[n];
                }
            }
        }
        
        public function get reflectivity():Number {
            return _reflectivity;
        }
        public function set reflectivity(v:Number):void {
            v = _limit(v, 0.1, 1.0);
            if (_reflectivity != v) {
                _reflectivity = v;
                dirty = true;
            }
        }

        public function get reflectionExtent():Number {
            return _reflectionExtent;
        }
        public function set reflectionExtent(v:Number):void {
            v = _limit(v, 0.1, 1.0);
            if (_reflectionExtent != v) {
                _reflectionExtent = v;
                dirty = true;
            }
        }
        
        public function get backgroundGradient():String {
            return _backgroundGradient;
        }
        public function set backgroundGradient(v:String):void {
            v = v != null ? v.toLowerCase() : v;
            if (_backgroundGradient != v) {
                _backgroundGradient = v;
                dirty = true;
            }
        }
        
        public function get backgroundColor():uint {
            return _backgroundColor;
        }
        public function set backgroundColor(v:uint):void {
            if (_backgroundColor != v) {
                _backgroundColor = v;
                dirty = true;
            }
        }
        
        public function get backgroundColorTop():uint {
            return _backgroundColorTop;
        }
        public function set backgroundColorTop(v:uint):void {
            if (_backgroundColorTop != v) {
                _backgroundColorTop = v;
                dirty = true;
            }
        }
        
        public function get backgroundColorMiddle():uint {
            return _backgroundColorMiddle;
        }
        public function set backgroundColorMiddle(v:uint):void {
            if (_backgroundColorMiddle != v) {
                _backgroundColorMiddle = v;
                dirty = true;
            }
        }
        
        public function get backgroundColorBottom():uint {
            return _backgroundColorBottom;
        }
        public function set backgroundColorBottom(v:uint):void {
            if (_backgroundColorBottom != v) {
                _backgroundColorBottom = v;
                dirty = true;
            }
        }
        
        public function get effectiveBackgroundColorBottom():uint {
            switch (_backgroundGradient) {
            case GRADIENT_SINGLE:
            case GRADIENT_DOUBLE:
                return _backgroundColorBottom;
            default:
                return _backgroundColor;
            }
        }
        
        public function get backgroundImageURL():String {
            return _backgroundImageURL;
        }
        public function set backgroundImageURL(v:String):void {
            if (_backgroundImageURL != v) {
                _backgroundImageURL = v;
                dirty = true;
            }
        }
        
        public function get backgroundImageAlign():String {
            return _backgroundImageAlign;
        }
        public function set backgroundImageAlign(v:String):void {
            v = v != null ? v.toLowerCase() : v;
            if (_backgroundImageAlign != v) {
                _backgroundImageAlign = v;
                dirty = true;
            }
        }
        
        public function get backgroundImageRepeat():String {
            return _backgroundImageRepeat;
        }
        public function set backgroundImageRepeat(v:String):void {
            v = v != null ? v.toLowerCase() : v;
            if (_backgroundImageRepeat != v) {
                _backgroundImageRepeat = v;
                dirty = true;
            }
        }
        
        public function get backgroundImageOpacity():Number {
            return _backgroundImageOpacity;
        }
        public function set backgroundImageOpacity(v:Number):void {
            v = _limit(v, 0.1, 1.0);
            if (_backgroundImageOpacity != v) {
                _backgroundImageOpacity = v;
                dirty = true;
            }
        }
        
        public function get slideBackgroundColor():uint {
            return _slideBackgroundColor;
        }
        public function set slideBackgroundColor(v:uint):void {
            if (_slideBackgroundColor != v) {
                _slideBackgroundColor = v;
                dirty = true;
            }
        }
        
        public function get showTitle():Boolean {
            return _showTitle;
        }
        public function set showTitle(v:Boolean):void {
            if (_showTitle != v) {
                _showTitle = v;
                dirty = true;
            }
        }
        
        public function get titleFontFamily():String {
            return _titleFontFamily;
        }
        public function set titleFontFamily(v:String):void {
            if (_titleFontFamily != v) {
                _titleFontFamily = v;
                dirty = true;
            }
        }
        
        public function get titleFontSize():Number {
            return _titleFontSize;
        }
        public function set titleFontSize(v:Number):void {
            v = _limit(v, 6, 72);
            if (_titleFontSize != v) {
                _titleFontSize = v;
                dirty = true;
            }
        }
        
        public function get titleFontBold():Boolean {
            return _titleFontBold;
        }
        public function set titleFontBold(v:Boolean):void {
            if (_titleFontBold != v) {
                _titleFontBold = v;
                dirty = true;
            }
        }
        
        public function get titleColor():uint {
            return _titleColor;
        }
        public function set titleColor(v:uint):void {
            if (_titleColor != v) {
                _titleColor = v;
                dirty = true;
            }
        }
        
        public function get showSubtitle():Boolean {
            return _showSubtitle;
        }
        public function set showSubtitle(v:Boolean):void {
            if (_showSubtitle != v) {
                _showSubtitle = v;
                dirty = true;
            }
        }
        
        public function get subtitleFontFamily():String {
            return _subtitleFontFamily;
        }
        public function set subtitleFontFamily(v:String):void {
            if (_subtitleFontFamily != v) {
                _subtitleFontFamily = v;
                dirty = true;
            }
        }
        
        public function get subtitleFontSize():Number {
            return _subtitleFontSize;
        }
        public function set subtitleFontSize(v:Number):void {
            v = _limit(v, 6, 72);
            if (_subtitleFontSize != v) {
                _subtitleFontSize = v;
                dirty = true;
            }
        }
        
        public function get subtitleFontBold():Boolean {
            return _subtitleFontBold;
        }
        public function set subtitleFontBold(v:Boolean):void {
            if (_subtitleFontBold != v) {
                _subtitleFontBold = v;
                dirty = true;
            }
        }
        
        public function get subtitleColor():uint {
            return _subtitleColor;
        }
        public function set subtitleColor(v:uint):void {
            if (_subtitleColor != v) {
                _subtitleColor = v;
                dirty = true;
            }
        }
        
        private function _limit(v:Number, min:Number, max:Number):Number {
            return Math.max(min, Math.min(max, v));
        }
    }
}
