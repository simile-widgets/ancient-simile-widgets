package org.simileWidgets.datadust.config {
    import flare.vis.Visualization;
    import flare.vis.operator.IOperator;
    import flare.animate.FunctionSequence;
    import org.simileWidgets.datadust.expression.Expression;
    
    public class ExpressionEncoder implements IPropertyConfiguration {
        protected var _propertyName:String;
        protected var _expression:Expression;
        
        public function ExpressionEncoder(propertyName:String, s:String) {
            _propertyName = propertyName;
            _expression = Expression.parse(s);
        }
        
        public function configure(vis:Visualization, seq:FunctionSequence):void {}
        
        public function encode(x:Object):* {
            return _expression.eval(x);
        }
        
        protected function addOperator(vis:Visualization, seq:FunctionSequence, op:IOperator):void {
            vis.operators.add(op);
        }
    }
}
