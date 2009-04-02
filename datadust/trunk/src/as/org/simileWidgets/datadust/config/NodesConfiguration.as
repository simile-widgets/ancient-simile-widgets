package org.simileWidgets.datadust.config {
    import flare.vis.Visualization;
    import flare.animate.FunctionSequence;
    import org.simileWidgets.datadust.expression.Expression;

    public class NodesConfiguration {
        protected var _shapeConfig:IPropertyConfiguration;
        protected var _fillColorConfig:IPropertyConfiguration;
        protected var _lineColorConfig:IPropertyConfiguration;
        protected var _sizeConfig:IPropertyConfiguration;
        protected var _lineWidthConfig:IPropertyConfiguration;
        protected var _alphaConfig:IPropertyConfiguration;
        protected var _iconConfig:IPropertyConfiguration;
        
        public function NodesConfiguration(jsConfig:Object, jsBaseConfig:Object) {
            _shapeConfig =      Utilities.getPropertyConfiguration(jsConfig, jsBaseConfig, "shape",     "shape",        null,       "text");
            _fillColorConfig =  Utilities.getPropertyConfiguration(jsConfig, jsBaseConfig, "fillColor", "fillColor",    0x88000000, "color");
            _lineColorConfig =  Utilities.getPropertyConfiguration(jsConfig, jsBaseConfig, "lineColor", "lineColor",    0,          "color");
            _sizeConfig =       Utilities.getPropertyConfiguration(jsConfig, jsBaseConfig, "size",      "size",         null,       "size");
            _lineWidthConfig =  Utilities.getPropertyConfiguration(jsConfig, jsBaseConfig, "lineWidth", "lineWidth",    0,          "number");
            _alphaConfig =      Utilities.getPropertyConfiguration(jsConfig, jsBaseConfig, "alpha",     "alpha",        null,       "number");
            _iconConfig =       Utilities.getPropertyConfiguration(jsConfig, jsBaseConfig, "icon",      "icon",         null,       "text");
        }
        
        public function get shapeConfig():IPropertyConfiguration {
            return _shapeConfig;
        }
        
        public function get fillColorConfig():IPropertyConfiguration {
            return _fillColorConfig;
        }
        
        public function get lineColorConfig():IPropertyConfiguration {
            return _lineColorConfig;
        }
        
        public function get sizeConfig():IPropertyConfiguration {
            return _sizeConfig;
        }
        
        public function get lineWidthConfig():IPropertyConfiguration {
            return _lineWidthConfig;
        }
        
        public function get alphaConfig():IPropertyConfiguration {
            return _alphaConfig;
        }
        
        public function get iconConfig():IPropertyConfiguration {
            return _iconConfig;
        }
        
        public function configure(vis:Visualization, seq:FunctionSequence):void {
            if (_shapeConfig != null) { _shapeConfig.configure(vis, seq); }
            if (_fillColorConfig != null) { _fillColorConfig.configure(vis, seq); }
            if (_lineColorConfig != null) { _lineColorConfig.configure(vis, seq); }
            if (_sizeConfig != null) { _sizeConfig.configure(vis, seq); }
            if (_lineWidthConfig != null) { _lineWidthConfig.configure(vis, seq); }
            if (_alphaConfig != null) { _alphaConfig.configure(vis, seq); }
            if (_iconConfig != null) { _iconConfig.configure(vis, seq); }
        }
    }
}
