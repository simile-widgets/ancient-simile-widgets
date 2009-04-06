package org.simileWidgets.datadust.config {
    import flash.filters.GlowFilter;
    import flare.animate.FunctionSequence;
    import flare.display.TextSprite;
    import flare.vis.Visualization;
    import flare.vis.data.DataSprite;
    import flare.vis.data.NodeSprite;
    import flare.vis.data.EdgeSprite;
    import flare.vis.data.DataList;
    import flare.vis.events.SelectionEvent;
    import flare.vis.events.TooltipEvent;
    import flare.vis.controls.HoverControl;
    import flare.vis.controls.SelectionControl;
    import flare.vis.controls.TooltipControl;
    import flare.scale.ScaleType;
    import org.simileWidgets.datadust.expression.Expression;

    public class Configuration {
        protected var _nodesConfig:NodesConfiguration;
        protected var _edgesConfig:EdgesConfiguration;
        protected var _tooltipExpression:Expression;
        
        public function Configuration(jsConfig:Object, jsBaseConfig:Object) {
            _nodesConfig = new NodesConfiguration(
                Utilities.getObjectField(jsConfig, "nodes"), 
                Utilities.getObjectField(jsBaseConfig, "nodes"));
                
            _edgesConfig = new EdgesConfiguration(
                Utilities.getObjectField(jsConfig, "edges"), 
                Utilities.getObjectField(jsBaseConfig, "edges"));

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
        
        public function get edgesConfig():EdgesConfiguration {
            return _edgesConfig;
        }
        
        public function get tooltipExpression():Expression {
            return _tooltipExpression;
        }
        
        public function configure(vis:Visualization, seq:FunctionSequence):void {
            vis.controls.add(new HoverControl(
                NodeSprite,
                HoverControl.MOVE_AND_RETURN, // by default, move highlighted items to front
                function(e:SelectionEvent):void { // mouse over
                    e.item.filters = [new GlowFilter(0xFFFF55, 0.8, 6, 6, 10)];
                },
                function(e:SelectionEvent):void { // mouse out
                    var selection:DataList = vis.data.group("selected");
                    if (!selection.contains(e.item)) {
                        e.item.filters = null;
                    }
                }
            ));
            
            vis.controls.add(new SelectionControl(
                DataSprite,
                function(e:SelectionEvent):void {
                    var selection:DataList = vis.data.group("selected");
                    
                    for each (var d:DataSprite in e.items) {
                        if (selection.contains(d)) {
                            selection.remove(d);
                            d.filters = null;
                        } else {
                            selection.add(d);
                            d.filters = [new GlowFilter(0xFFFF55, 0.8, 6, 6, 10)];
                        }
                    }
                },
                function(e:SelectionEvent):void {
                },
                vis
            ));
            
            if (_tooltipExpression != null) {
                vis.controls.add(new TooltipControl(
                    DataSprite, 
                    null,
                    function(e:TooltipEvent):void {
                        var text:String = tooltipExpression.eval(e.node);
                        if (text != null) {
                            TextSprite(e.tooltip).htmlText = text;
                        }
                    }
                ));
            }
            
            if (seq != null) {
                seq.push(vis.updateLater("main"), 2);
            }
            _nodesConfig.configure(vis, seq);
            _edgesConfig.configure(vis, seq);
        }
    }
}
