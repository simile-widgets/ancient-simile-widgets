package org.simileWidgets.datadust.config {
    import flare.vis.Visualization;
    import flare.animate.FunctionSequence;
    import org.simileWidgets.datadust.expression.Expression;

    public class EdgesConfiguration {
        protected var _lineColorConfig:IPropertyConfiguration;
        protected var _lineWidthConfig:IPropertyConfiguration;
        protected var _alphaConfig:IPropertyConfiguration;
        
        public function EdgesConfiguration(jsConfig:Object, jsBaseConfig:Object) {
            _lineColorConfig =  Utilities.getPropertyConfiguration(jsConfig, jsBaseConfig, "lineColor", "lineColor",    0,          "color");
            _lineWidthConfig =  Utilities.getPropertyConfiguration(jsConfig, jsBaseConfig, "lineWidth", "lineWidth",    0,          "number");
            _alphaConfig =      Utilities.getPropertyConfiguration(jsConfig, jsBaseConfig, "alpha",     "alpha",        null,       "number");
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
        
        public function configure(vis:Visualization, seq:FunctionSequence):void {
            if (_lineColorConfig != null) { _lineColorConfig.configure(vis, seq); }
            if (_lineWidthConfig != null) { _lineWidthConfig.configure(vis, seq); }
            if (_alphaConfig != null) { _alphaConfig.configure(vis, seq); }
        }
    }
}
