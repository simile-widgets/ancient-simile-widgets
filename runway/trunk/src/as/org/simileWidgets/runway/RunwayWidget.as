package org.simileWidgets.runway {
    import flash.external.ExternalInterface;
    import flash.system.Security;
    import flash.display.Sprite;
    import flash.display.StageQuality;
    import flash.events.*;

    [SWF(frameRate="30")]
    public class RunwayWidget extends Sprite {
        private var _runway:Runway;
        
        public function RunwayWidget() {
            stage.frameRate = 24;
            stage.quality = StageQuality.BEST;
            
            stage.scaleMode = flash.display.StageScaleMode.NO_SCALE;
            stage.align = flash.display.StageAlign.TOP_LEFT;
            stage.addEventListener(Event.RESIZE, resizeListener);
            
            var fixedSlideSize:Boolean = true;
                /*  TODO: I haven't figured out how to do the reflections properly
                    if the size keeps changing.
                    ("fixedSlideSize" in root.loaderInfo.parameters) ?
                        (root.loaderInfo.parameters["fixedSlideSize"] == "true") : true; */
            var slideSize:Number = ("slideSize" in root.loaderInfo.parameters) ?
                Number(root.loaderInfo.parameters["slideSize"]) : 0;
            var theme:Theme = ("theme" in root.loaderInfo.parameters) ?
                new Theme(root.loaderInfo.parameters["theme"]) : new Theme(null);
            var geometry:Geometry =
                new Geometry(fixedSlideSize, slideSize);
                
            _runway = new Runway(stage.stageWidth, stage.stageHeight, theme, geometry);
            addChild(_runway);
            
            for (var n:String in root.loaderInfo.parameters) {
                switch (n) {
                case "onSelect":
                case "onReady":
                case "onZoom":
                case "onTitleClick":
                case "onSubtitleClick":
                case "theme":
                case "fixedSlideSize":
                case "slideSize":
                    continue;
                }
                
                setProperty(n, root.loaderInfo.parameters[n]);
            }
            
            if (ExternalInterface.available) {
                Security.allowDomain('*'); // This allows Javascript from any web page to call us.
                setupCallbacks();
                
                if (root.loaderInfo.parameters.hasOwnProperty("onSelect")) {
                    _runway.addEventListener(
                        "select", 
                        function(e:Event):void {
                            ExternalInterface.call(root.loaderInfo.parameters["onSelect"], _runway.selectedIndex, _runway.selectedID);
                        }
                    );
                }
                if (root.loaderInfo.parameters.hasOwnProperty("onZoom")) {
                    _runway.addEventListener(
                        "zoom", 
                        function(e:Event):void {
                            ExternalInterface.call(root.loaderInfo.parameters["onZoom"], _runway.selectedIndex, _runway.selectedID);
                        }
                    );
                }
                if (root.loaderInfo.parameters.hasOwnProperty("onTitleClick")) {
                    _runway.titleTextField.addEventListener(
                        MouseEvent.CLICK, 
                        function(e:MouseEvent):void {
                            ExternalInterface.call(root.loaderInfo.parameters["onTitleClick"], _runway.selectedIndex, _runway.selectedID);
                        }
                    );
                }
                if (root.loaderInfo.parameters.hasOwnProperty("onSubtitleClick")) {
                    _runway.subtitleTextField.addEventListener(
                        MouseEvent.CLICK, 
                        function(e:MouseEvent):void {
                            ExternalInterface.call(root.loaderInfo.parameters["onSubtitleClick"], _runway.selectedIndex, _runway.selectedID);
                        }
                    );
                }
                if (root.loaderInfo.parameters.hasOwnProperty("onReady")) {
                    ExternalInterface.call(root.loaderInfo.parameters["onReady"]);
                }
            } else {
                trace("External interface is not available for this container.");
            }
        }
        
        private function resizeListener(e:Event):void {
            _runway.boundingWidth = stage.stageWidth;
            _runway.boundingHeight = stage.stageHeight;
        }
        
        private function setupCallbacks():void {
            try {
                ExternalInterface.addCallback("setThemeName", _runway.setThemeName);
                ExternalInterface.addCallback("setProperty", setProperty);
                ExternalInterface.addCallback("getProperty", getProperty);
                
                ExternalInterface.addCallback("clearRecords", _runway.clearRecords);
                ExternalInterface.addCallback("addRecords", _runway.addRecords);
                ExternalInterface.addCallback("setRecords", _runway.setRecords);
                ExternalInterface.addCallback("select", _runway.select);
                
                ExternalInterface.addCallback("getSelectedIndex", function():int { return _runway.selectedIndex; });
                ExternalInterface.addCallback("getSelectedID", function():String { return _runway.selectedID; });
                ExternalInterface.addCallback("getSlideCount", function():int { return _runway.slideCount; });
            } catch (e:Error) {
                trace("Error adding callbacks");
            }
        }
        
        private function getProperty(name:String):* {
            if (_isStringThemeProperty(name)) {
                return _runway.theme[name];
            } else if (_isColorThemeProperty(name)) {
                return _colorToString(_runway.theme[name]);
            } else if (_isBooleanThemeProperty(name)) {
                return _runway.theme[name];
            } else if (_isNumberThemeProperty(name)) {
                return _runway.theme[name];
            } else if (_isNumberGeometryProperty(name)) {
                return _runway.geometry[name];
            }
            return undefined;
        }
        
        private function setProperty(name:String, value:*):void {
            if (_isStringThemeProperty(name)) {
                _runway.theme[name] = value;
            } else if (_isColorThemeProperty(name)) {
                _runway.theme[name] = _stringToColor(value);
            } else if (_isBooleanThemeProperty(name)) {
                _runway.theme[name] = (value is Boolean) ? value : (value == "true");
            } else if (_isNumberThemeProperty(name)) {
                _runway.theme[name] = (value is Number) ? value : Number(value);
            } else if (_isNumberGeometryProperty(name)) {
                _runway.geometry[name] = (value is Number) ? value : Number(value);
            }
        }
        
        private function _isStringThemeProperty(name:String):Boolean {
            switch (name) {
            case "backgroundGradient" :
            case "backgroundImageURL" :
            case "backgroundImageAlign" :
            case "backgroundImageRepeat" :
            case "titleFontFamily" :
            case "subtitleFontFamily" :
                return true;
            }
            return false;
        }
        
        private function _isBooleanThemeProperty(name:String):Boolean {
            switch (name) {
            case "fixedSlideSize" :
            case "showTitle" :
            case "showSubtitle" :
            case "titleFontBold" :
            case "subtitleFontBold" :
                return true;
            }
            return false;
        }
        
        private function _isNumberThemeProperty(name:String):Boolean {
            switch (name) {
            case "reflectivity" :
            case "reflectionExtent" :
            case "backgroundImageOpacity" :
            case "titleFontSize" :
            case "subtitleFontSize" :
                return true;
            }
            return false;
        }
        
        private function _isColorThemeProperty(name:String):Boolean {
            switch (name) {
            case "backgroundColor" :
            case "backgroundColorTop" :
            case "backgroundColorMiddle" :
            case "backgroundColorBottom" :
            case "titleColor" :
            case "subtitleColor" :
                return true;
            }
            return false;
        }
        
        private function _isNumberGeometryProperty(name:String):Boolean {
            switch (name) {
            case "slideSize" :
            case "spread" :
            case "centerSpread" :
            case "recede" :
            case "tilt" :
            case "centerOffset" :
            case "fieldOfView" :
                return true;
            }
            return false;
        }
        
        private function _toHex2Digits(c:uint):String {
            var n:String = Number(c).toString(16);
            return (n.length == 2) ? n : "0" + n;
        }
        
        private function _stringToColor(value:String):uint {
            if (value.length >= 4 && value.charAt(0) == "#") {
                value = value.substr(1);
                
                var r:uint, g:uint, b:uint;
                if (value.length == 3) {
                    r = parseInt(value.substr(0, 1), 16);
                    g = parseInt(value.substr(1, 1), 16);
                    b = parseInt(value.substr(2, 1), 16);
                    
                    return ((r + r * 16) << 16) | ((g + g * 16) << 8) | (b + b * 16);
                } else if (value.length == 6) {
                    r = parseInt(value.substr(0, 1), 16);
                    g = parseInt(value.substr(1, 1), 16);
                    b = parseInt(value.substr(2, 1), 16);
                    
                    return (r << 16) | (g << 8) | b;
                }
            }
            return 0;
        }
        
        private function _colorToString(c:uint):String {
            return "#" + _toHex2Digits((c >> 16) & 0xFF) + _toHex2Digits((c >> 8) & 0xFF) + _toHex2Digits(c & 0xFF);
        }
    }
}
