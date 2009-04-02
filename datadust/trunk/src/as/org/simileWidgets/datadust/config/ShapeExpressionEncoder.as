package org.simileWidgets.datadust.config {
    import flare.vis.Visualization;
    import flare.vis.operator.encoder.ShapeEncoder;
    import flare.animate.FunctionSequence;
    
    public class ShapeExpressionEncoder extends ExpressionEncoder {
        public function ShapeExpressionEncoder(propertyName:String, o:Object) {
            super(propertyName, o["expression"]);
        }
        
        public override function configure(vis:Visualization, seq:FunctionSequence):void {
            addOperator(vis, seq, new ShapeEncoder(_expression.text));
        }
    }
}
