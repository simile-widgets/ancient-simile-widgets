package org.simileWidgets.datadust.config {
    import flare.vis.data.Data;
    import flare.vis.Visualization;
    import flare.animate.FunctionSequence;

    public class NodesConfiguration extends SpriteConfiguration {
        protected var _shapeConfig:IPropertyConfiguration;
        protected var _fillColorConfig:IPropertyConfiguration;
        protected var _sizeConfig:IPropertyConfiguration;
        
        public function NodesConfiguration(jsConfig:Object, jsBaseConfig:Object) {
            super(Data.NODES, jsConfig, jsBaseConfig);
            _shapeConfig =      Utilities.getPropertyConfiguration(Data.NODES, jsConfig, jsBaseConfig, "shape",     "shape",        null,       "text");
            _fillColorConfig =  Utilities.getPropertyConfiguration(Data.NODES, jsConfig, jsBaseConfig, "fillColor", "fillColor",    0x88000000, "color");
            _sizeConfig =       Utilities.getPropertyConfiguration(Data.NODES, jsConfig, jsBaseConfig, "size",      "size",         null,       "size");
        }
        
        public function get shapeConfig():IPropertyConfiguration {
            return _shapeConfig;
        }
        
        public function get fillColorConfig():IPropertyConfiguration {
            return _fillColorConfig;
        }
        
        public function get sizeConfig():IPropertyConfiguration {
            return _sizeConfig;
        }
        
        public override function configure(vis:Visualization, seq:FunctionSequence):void {
            super.configure(vis, seq);
            if (_shapeConfig != null) { _shapeConfig.configure(vis, seq); }
            if (_fillColorConfig != null) { _fillColorConfig.configure(vis, seq); }
            if (_sizeConfig != null) { _sizeConfig.configure(vis, seq); }
        }
    }
}
