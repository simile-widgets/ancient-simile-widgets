package org.simileWidgets.datadust.vis {
    import flare.vis.operator.encoder.Encoder;
    import flare.animate.Transitioner;
    import flare.vis.data.Data;
    import org.simileWidgets.datadust.expression.Expression;
    
    public class ExpressionPropertyEncoder extends Encoder {
        public function ExpressionPropertyEncoder(
            expression:Expression,
            group:String = Data.NODES, 
            target:String = "alpha"
        ) {
            super(expression.text, target, group);
        }
        
        protected override function encode(val:Object):* {
            return val;
        }
    }
}