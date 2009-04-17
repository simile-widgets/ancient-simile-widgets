package org.simileWidgets.datadust.config {
    import flare.vis.Visualization;
    import flare.vis.data.Data;
    import flare.animate.FunctionSequence;
    import org.simileWidgets.datadust.expression.Expression;

    public class EdgesConfiguration extends SpriteConfiguration {
        public function EdgesConfiguration(jsConfig:Object, jsBaseConfig:Object) {
            super(Data.EDGES, jsConfig, jsBaseConfig);
        }
        
        public override function configure(vis:Visualization, seq:FunctionSequence):void {
            super.configure(vis, seq);
        }
    }
}
