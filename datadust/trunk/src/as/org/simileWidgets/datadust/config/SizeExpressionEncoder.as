package org.simileWidgets.datadust.config {
    import flare.vis.Visualization;
    import flare.vis.operator.encoder.SizeEncoder;
    import flare.vis.data.Data;
    import flare.animate.FunctionSequence;
    
    public class SizeExpressionEncoder extends ExpressionEncoder {
        public function SizeExpressionEncoder(propertyName:String, o:Object) {
            super(propertyName, o["expression"]);
        }
        
        public override function configure(vis:Visualization, seq:FunctionSequence):void {
            addOperator(vis, seq, new SizeEncoder(_expression.text, Data.NODES));
        }
    }
}
