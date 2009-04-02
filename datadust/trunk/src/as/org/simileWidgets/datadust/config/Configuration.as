package org.simileWidgets.datadust.config {
    import flare.animate.FunctionSequence;
    import flare.vis.Visualization;
    import flare.scale.ScaleType;
    import org.simileWidgets.datadust.expression.Expression;

    public class Configuration {
        protected var _nodesConfig:NodesConfiguration;
        protected var _tooltipExpression:Expression;
        
        public function Configuration(jsConfig:Object, jsBaseConfig:Object) {
            _nodesConfig = new NodesConfiguration(
                Utilities.getObjectField(jsConfig, "nodes"), 
                Utilities.getObjectField(jsBaseConfig, "nodes"));
                
            _tooltipExpression = Expression.parse(Utilities.getDelegate(
                jsConfig == null ? null : jsConfig["tooltip"], 
                jsBaseConfig == null ? null : jsBaseConfig["tooltip"], 
                "expression", 
                null
            ));
        }
        
        public function get nodesConfig():NodesConfiguration {
            return _nodesConfig;
        }
        
        public function get tooltipExpression():Expression {
            return _tooltipExpression;
        }
        
        public function configure(vis:Visualization, seq:FunctionSequence):void {
            if (seq != null) {
                seq.push(vis.updateLater("main"), 2);
            }
            _nodesConfig.configure(vis, seq);
        }
    }
}
