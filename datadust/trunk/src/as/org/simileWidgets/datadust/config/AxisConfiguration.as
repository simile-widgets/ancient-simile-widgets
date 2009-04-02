package org.simileWidgets.datadust.config {
    import org.simileWidgets.datadust.expression.Expression;

    public class AxisConfiguration {
        protected var _scaleType:String;
        protected var _expression:Expression;
        protected var _stacked:Boolean;
        
        public function AxisConfiguration(jsConfig:Object, jsBaseConfig:Object) {
            _scaleType = Utilities.getDelegate(jsConfig, jsBaseConfig, "scale", "linear");
            _stacked = Utilities.getDelegate(jsConfig, jsBaseConfig, "stacked", false);
            _expression = Expression.parse(Utilities.getDelegate(jsConfig, jsBaseConfig, "expression", "rank"));
        }
        
        public function get expression():Expression {
            return _expression;
        }
        
        public function get stacked():Boolean {
            return _stacked;
        }
        
        public function get scaleType():String {
            return _scaleType;
        }
    }
}
