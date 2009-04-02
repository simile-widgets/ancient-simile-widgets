package org.simileWidgets.datadust.config {
    import flare.vis.Visualization;
    import flare.animate.FunctionSequence;
    
    public interface IPropertyConfiguration {
        function configure(vis:Visualization, seq:FunctionSequence):void;
        
        function encode(x:Object):*;
    }
}
