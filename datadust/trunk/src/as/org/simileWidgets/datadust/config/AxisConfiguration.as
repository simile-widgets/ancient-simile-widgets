package org.simileWidgets.datadust.config {
    import flare.animate.FunctionSequence;
    import flare.vis.Visualization;
    import flare.vis.axis.Axis;
    import org.simileWidgets.datadust.expression.Expression;
    import org.simileWidgets.datadust.vis.ExpressionAxisLayout;

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
        
        public function configure(vis:Visualization, axisLayout:ExpressionAxisLayout, axis:Axis, seq:FunctionSequence):void {
        }
    }
}
