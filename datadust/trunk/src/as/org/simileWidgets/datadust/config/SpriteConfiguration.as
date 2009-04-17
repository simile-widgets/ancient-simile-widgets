package org.simileWidgets.datadust.config {
    import flare.vis.data.Data;
    import flare.vis.Visualization;
    import flare.animate.FunctionSequence;

    public class SpriteConfiguration {
        protected var _lineColorConfig:IPropertyConfiguration;
        protected var _lineWidthConfig:IPropertyConfiguration;
        protected var _alphaConfig:IPropertyConfiguration;
        protected var _visibleConfig:IPropertyConfiguration;
        
        public function SpriteConfiguration(group:String, jsConfig:Object, jsBaseConfig:Object) {
            _lineColorConfig =  Utilities.getPropertyConfiguration(group, jsConfig, jsBaseConfig, "lineColor", "lineColor",    0,          "color");
            _lineWidthConfig =  Utilities.getPropertyConfiguration(group, jsConfig, jsBaseConfig, "lineWidth", "lineWidth",    0,          "number");
            _alphaConfig =      Utilities.getPropertyConfiguration(group, jsConfig, jsBaseConfig, "alpha",     "alpha",        1,          "number");
            _visibleConfig =    Utilities.getPropertyConfiguration(group, jsConfig, jsBaseConfig, "visible",   "visible",      true,       "boolean");
        }
        
        public function get lineColorConfig():IPropertyConfiguration {
            return _lineColorConfig;
        }
        
        public function get lineWidthConfig():IPropertyConfiguration {
            return _lineWidthConfig;
        }
        
        public function get alphaConfig():IPropertyConfiguration {
            return _alphaConfig;
        }
        
        public function get visibleConfig():IPropertyConfiguration {
            return _visibleConfig;
        }
        
        public function configure(vis:Visualization, seq:FunctionSequence):void {
            if (_lineColorConfig != null) { _lineColorConfig.configure(vis, seq); }
            if (_lineWidthConfig != null) { _lineWidthConfig.configure(vis, seq); }
            if (_alphaConfig != null) { _alphaConfig.configure(vis, seq); }
            if (_visibleConfig != null) { _visibleConfig.configure(vis, seq); }
        }
    }
}
