package org.simileWidgets.datadust.config.encoder {
    import flare.vis.Visualization;
    import flare.animate.FunctionSequence;
    import flare.vis.operator.encoder.PropertyEncoder;
    import org.simileWidgets.datadust.config.IPropertyConfiguration;

    public class ConstantPropertyEncoder implements IPropertyConfiguration {
        protected var _group:String;
        protected var _propertyName:String;
        protected var _value:*;
        
        public function ConstantPropertyEncoder(group:String, propertyName:String, value:*) {
            _group = group;
            _propertyName = propertyName;
            _value = value;
        }
        
        public function configure(vis:Visualization, seq:FunctionSequence):void {
            var p:Object = {};
            p[_propertyName] = _value;
            
            vis.operators.add(new PropertyEncoder(p, _group));
        }
        
        public function encode(x:Object):* {
            return _value;
        }
    }
}
