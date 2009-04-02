package org.simileWidgets.datadust.config {
    import flare.animate.FunctionSequence;
    import flare.vis.Visualization;
    import flare.scale.ScaleType;
    import org.simileWidgets.datadust.expression.Expression;

    public class Configuration {
        protected var _chartType:String;
        protected var _xAxisConfig:AxisConfiguration;
        protected var _yAxisConfig:AxisConfiguration;
        protected var _nodesConfig:NodesConfiguration;
        protected var _tooltipExpression:Expression;
        
        public function Configuration(jsConfig:Object, jsBaseConfig:Object) {
            _chartType = Utilities.getDelegate(jsConfig, jsBaseConfig, "chartType", "scatter");
            
            _xAxisConfig = new AxisConfiguration(
                Utilities.getObjectField(jsConfig, "xAxis"), 
                Utilities.getObjectField(jsBaseConfig, "xAxis"));
                
            _yAxisConfig = new AxisConfiguration(
                Utilities.getObjectField(jsConfig, "yAxis"), 
                Utilities.getObjectField(jsBaseConfig, "yAxis"));
                
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
        
        public function get xAxisConfig():AxisConfiguration {
            return _xAxisConfig;
        }
        
        public function get yAxisConfig():AxisConfiguration {
            return _yAxisConfig;
        }
        
        public function get nodesConfig():NodesConfiguration {
            return _nodesConfig;
        }
        
        public function get tooltipExpression():Expression {
            return _tooltipExpression;
        }
        
        public function configure(vis:Visualization, seq:FunctionSequence):void {
            var axisLayout:ExpressionAxisLayout = new ExpressionAxisLayout(
                _xAxisConfig.expression, 
                _yAxisConfig.expression,
                _xAxisConfig.stacked,
                _yAxisConfig.stacked
            );
            axisLayout.xScale.scaleType = _xAxisConfig.scaleType == "log" ? ScaleType.LOG : ScaleType.LINEAR;
            axisLayout.yScale.scaleType = _yAxisConfig.scaleType == "log" ? ScaleType.LOG : ScaleType.LINEAR;
            
            vis.operators.add(axisLayout);
            if (seq != null) {
                seq.push(vis.updateLater("main"), 2);
            }
            
            _nodesConfig.configure(vis, seq);
        }
    }
}
