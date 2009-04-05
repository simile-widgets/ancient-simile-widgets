package org.simileWidgets.datadust.vis {
    import flare.vis.axis.*;
    import flare.vis.Visualization;
    
    public class FormattedCartesianAxes extends CartesianAxes {
        public function FormattedCartesianAxes(vis:Visualization = null) {
            super(vis);
        }
        
        protected override function createAxis():Axis {
            return new FormattedAxis();
        }
    }
}