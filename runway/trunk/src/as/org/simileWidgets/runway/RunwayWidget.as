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
            
            _runway = new Runway(stage.stageWidth, stage.stageHeight, new Theme(null), new Geometry(true, 0));
            addChild(_runway);
            
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
                if (root.loaderInfo.parameters.hasOwnProperty("onReady")) {
                    ExternalInterface.call(root.loaderInfo.parameters["onReady"]);
                }
            } else {
                trace("External interface is not available for this container.");
            }
        }
        
        public function getFoo(a:Array):String {
            //new Foo();
            return a.join(";");
        }
        
        private function resizeListener(e:Event):void {
            _runway.boundingWidth = stage.stageWidth;
            _runway.boundingHeight = stage.stageHeight;
        }
        
        private function setupCallbacks():void {
            try {
                ExternalInterface.addCallback("setRecords", _runway.setRecords); 
                ExternalInterface.addCallback("setThemeName", _runway.setThemeName); 
                
                ExternalInterface.addCallback("select", _runway.select); 
            } catch (e:Error) {
                trace("Error adding callbacks");
            }
        }
    }
}
