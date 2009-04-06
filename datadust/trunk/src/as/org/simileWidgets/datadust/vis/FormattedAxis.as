package org.simileWidgets.datadust.vis {
    import flare.vis.axis.*;
    import flare.scale.*;
    import mx.core.FontAsset;
    import flash.text.AntiAliasType;
    
    public class FormattedAxis extends Axis {
        public function FormattedAxis(axisScale:Scale = null) {
            super(axisScale);
        }
        
        protected override function updateLabel(label:AxisLabel):void  {
            label.extraHtmlText = "";
            
            label.font = "Helvetica";
            label.size = 14;
            label.bold = false;
            label.color = 0xFF000000;
            
            super.updateLabel(label);
            if (axisScale.scaleType == ScaleType.LOG && label.value is Number) {
                formatLogValue(label, label.value as Number, 1);
            }
        }
        
        protected function formatLogValue(label:AxisLabel, n:Number, significantDigits:Number):void {
            if (n >= 1000 || n <= 0.001) {
                var exp:Number = Math.round(log10(n));
                var factor:Number = n / Math.pow(10, exp);
                
                if (!isNaN(factor) && !isNaN(exp)) {
                    if (Math.abs(factor - 1) < 0.01) { // almost 1
                        label.text = "10";
                    } else {
                        if (factor > 5) {
                            factor /= 10;
                            exp += 1;
                        }
                        label.text = roundToSignificantDigits(factor, significantDigits) + "x10";
                    }
                    label.extraText = String(exp);
                    
                    label.bold = ((exp % 3) == 0);
                    label.color = ((exp % 3) == 0) ? 0xFF000000 : 0xFF888888;
                }
            }
        }
        
        static protected function log10(n:Number):Number {
            return Math.log(n) / Math.log(10);
        }
        
        static protected function roundToSignificantDigits(n:Number, significantDigits:Number):Number {
            var factor:Number = Math.pow(10, significantDigits);
            return Math.round(n * factor) / factor;
        }
    }
}