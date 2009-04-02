package org.simileWidgets.datadust.config {
    import flare.vis.operator.layout.AxisLayout;
    import org.simileWidgets.datadust.expression.Expression;
    
    public class ExpressionAxisLayout extends AxisLayout {
        public function ExpressionAxisLayout(xExpression:Expression, yExpression:Expression, xStacked:Boolean=false, yStacked:Boolean=false) {
            super(xExpression.text, yExpression.text, xStacked, yStacked);
        }
    }
}
