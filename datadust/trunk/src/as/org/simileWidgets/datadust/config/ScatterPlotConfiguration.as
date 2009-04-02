package org.simileWidgets.datadust.config {
    import flare.animate.FunctionSequence;
    import flare.vis.Visualization;
    import flare.vis.axis.CartesianAxes;
    import flare.scale.ScaleType;
    import org.simileWidgets.datadust.expression.Expression;

    public class ScatterPlotConfiguration extends Configuration {
        protected var _xAxisConfig:AxisConfiguration;
        protected var _yAxisConfig:AxisConfiguration;
        
        public function ScatterPlotConfiguration(jsConfig:Object, jsBaseConfig:Object) {
            super(jsConfig, jsBaseConfig);
            
            _xAxisConfig = new AxisConfiguration(
                Utilities.getObjectField(jsConfig, "xAxis"), 
                Utilities.getObjectField(jsBaseConfig, "xAxis"));
                
            _yAxisConfig = new AxisConfiguration(
                Utilities.getObjectField(jsConfig, "yAxis"), 
                Utilities.getObjectField(jsBaseConfig, "yAxis"));
        }
        
        public function get xAxisConfig():AxisConfiguration {
            return _xAxisConfig;
        }
        
        public function get yAxisConfig():AxisConfiguration {
            return _yAxisConfig;
        }
        
        public override function configure(vis:Visualization, seq:FunctionSequence):void {
            var axisLayout:ExpressionAxisLayout = new ExpressionAxisLayout(
                _xAxisConfig.expression, 
                _yAxisConfig.expression,
                _xAxisConfig.stacked,
                _yAxisConfig.stacked
            );
            axisLayout.xScale.scaleType = _xAxisConfig.scaleType == "log" ? ScaleType.LOG : ScaleType.LINEAR;
            axisLayout.yScale.scaleType = _yAxisConfig.scaleType == "log" ? ScaleType.LOG : ScaleType.LINEAR;
            
            vis.operators.add(axisLayout);
            
            _xAxisConfig.configure(vis, axisLayout, (vis.axes as CartesianAxes).xAxis, seq);
            _yAxisConfig.configure(vis, axisLayout, (vis.axes as CartesianAxes).yAxis, seq);
            
            super.configure(vis, seq);
        }
    }
}
