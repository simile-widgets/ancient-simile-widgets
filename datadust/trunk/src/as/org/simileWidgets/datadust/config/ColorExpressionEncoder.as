package org.simileWidgets.datadust.config {
    import flare.vis.Visualization;
    import flare.vis.operator.encoder.ColorEncoder;
    import flare.vis.data.Data;
    import flare.scale.ScaleType;
    import flare.animate.FunctionSequence;
    
    public class ColorExpressionEncoder extends ExpressionEncoder {
        public function ColorExpressionEncoder(propertyName:String, o:Object) {
            super(propertyName, o["expression"]);
        }
        
        public override function configure(vis:Visualization, seq:FunctionSequence):void {
            addOperator(vis, seq, new ColorEncoder(_expression.text, Data.NODES, _propertyName, ScaleType.CATEGORIES));
        }
    }
}
