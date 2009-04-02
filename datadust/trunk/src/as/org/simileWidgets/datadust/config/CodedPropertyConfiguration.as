package org.simileWidgets.datadust.config {
    import org.simileWidgets.datadust.expression.Expression;
    import flare.vis.Visualization;

    public class CodedPropertyConfiguration implements IConfiguration {
        protected var _propertyName:String;
        protected var _expression:Expression;
        
        public function CodedPropertyConfiguration(propertyName:String, o:Object) {
            _propertyName = propertyName;
            _expression = Expression.parse("expression" in o ? o["expression"] : "null");
        }
        
        public function configure(vis:Visualization):void {
            
        }
    }
}
