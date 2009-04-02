package org.simileWidgets.datadust {
    import flash.external.ExternalInterface;
    import flash.system.Security;
    import flash.display.Sprite;
    import flash.display.StageQuality;
    import flash.events.*;

    public class DatadustWidget extends Sprite {
        private var _datadust:Datadust;
        
        public function DatadustWidget() {
            stage.frameRate = 24;
            stage.quality = StageQuality.BEST;
            stage.scaleMode = flash.display.StageScaleMode.NO_SCALE;
            stage.align = flash.display.StageAlign.TOP_LEFT;
            stage.addEventListener(Event.RESIZE, resizeListener);
            
            _datadust = new Datadust(stage.stageWidth, stage.stageHeight);
            addChild(_datadust);
            
            for (var n:String in root.loaderInfo.parameters) {
                switch (n) {
                // special cases, like on* and initial properties: continue;
                case "onReady":
                    continue;
                }
                
                setProperty(n, root.loaderInfo.parameters[n]);
            }
            
            if (ExternalInterface.available) {
                Security.allowDomain('*'); // This allows Javascript from any web page to call us.
                setupCallbacks();
                
                if (root.loaderInfo.parameters.hasOwnProperty("onReady")) {
                    ExternalInterface.call(root.loaderInfo.parameters["onReady"]);
                }
            } else {
                trace("External interface is not available for this container.");
            }
        }
        
        private function resizeListener(e:Event):void {
            _datadust.boundingWidth = stage.stageWidth;
            _datadust.boundingHeight = stage.stageHeight;
        }
        
        private function setupCallbacks():void {
            try {
                ExternalInterface.addCallback("init", _datadust.init);
                ExternalInterface.addCallback("selectConfiguration", _datadust.selectConfiguration);
                
                ExternalInterface.addCallback("getProperty", getProperty);
                ExternalInterface.addCallback("setProperty", setProperty);
            } catch (e:Error) {
                trace("Error adding callbacks");
            }
        }
        
        private function getProperty(name:String):* {
            return undefined;
        }
        
        private function setProperty(name:String, value:*):void {
        }
    }
}
