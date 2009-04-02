package org.simileWidgets.datadust.config {
    import org.simileWidgets.datadust.expression.Expression;
    import flare.vis.Visualization;
    import flare.animate.FunctionSequence;

    public class ConstantPropertyEncoder implements IPropertyConfiguration {
        protected var _propertyName:String;
        protected var _value:*;
        
        public function ConstantPropertyEncoder(propertyName:String, value:*) {
            _propertyName = propertyName;
            _value = value;
        }
        
        public function configure(vis:Visualization, seq:FunctionSequence):void {
            var p:Object = {};
            p[_propertyName] = _value;
            
            if (seq == null) {
                vis.data.nodes.setProperties(p);
            } else {
                seq.push(vis.data.nodes.setLater(p), 1);
            }
        }
        
        public function encode(x:Object):* {
            return _value;
        }
    }
}
