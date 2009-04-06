package org.simileWidgets.datadust.config {
    import flare.vis.data.Data;
    import flare.vis.data.DataSprite;
    import org.simileWidgets.datadust.expression.Expression;
    
    public class Utilities {
        static public function getDelegate(o1:Object, o2:Object, field:String, def:*):* {
            return (o1 != null && o1.hasOwnProperty(field)) ? o1[field] :
                (o2 != null && o2.hasOwnProperty(field) ? o2[field] : def);
        }
        
        static public function getObjectField(o1:Object, field:String):Object {
            return o1 != null && o1.hasOwnProperty(field) ? o1[field] : {};
        }
        
        static public function getPropertyConfiguration(group:String, o1:Object, o2:Object, configField:String, propertyName:String, def:*, format:String):IPropertyConfiguration {
            var o:* = getDelegate(o1, o2, configField, def);
            var config:IPropertyConfiguration = null;
            if (o != null) {
                if (o is Number || o is String) {
                    config = new ConstantPropertyEncoder(group, propertyName, parseStaticPropertyValue(o, format));
                } else {
                    switch (format) {
                    case "size":
                        config = new SizeExpressionEncoder(propertyName, o);
                        break;
                        
                    case "shape":
                        config = new ShapeExpressionEncoder(propertyName, o);
                        break;
                        
                    case "color":
                        config = new ColorExpressionEncoder(group, propertyName, o);
                        break;
                        
                    case "number":
                        config = new AsIsExpressionEncoder(group, propertyName, o);
                        break;
                    }
                }
            }
            return config;
        }
        
        static public function parseStaticPropertyValue(o:*, format:String):* {
            switch (format) {
            case "color" :
                return o is Number ? o : stringToColor(o);
                
            case "number" :
                return o is Number ? o : parseFloat(o);
                
            default:
                return o;
            }
        }
        
        static public function toHex2Digits(c:uint):String {
            var n:String = Number(c).toString(16);
            return (n.length == 2) ? n : "0" + n;
        }
        
        static public function stringToColor(value:String):uint {
            if (value.length >= 4 && value.charAt(0) == "#") {
                value = value.substr(1);
                
                var r:uint, g:uint, b:uint;
                if (value.length == 3) {
                    r = parseInt(value.substr(0, 1), 16);
                    g = parseInt(value.substr(1, 1), 16);
                    b = parseInt(value.substr(2, 1), 16);
                    
                    return ((r + r * 16) << 16) | ((g + g * 16) << 8) | (b + b * 16);
                } else if (value.length == 6) {
                    r = parseInt(value.substr(0, 2), 16);
                    g = parseInt(value.substr(2, 2), 16);
                    b = parseInt(value.substr(4, 2), 16);
                    
                    return (r << 16) | (g << 8) | b;
                }
            }
            return 0;
        }
        
        static public function colorToString(c:uint):String {
            return "#" + toHex2Digits((c >> 16) & 0xFF) + toHex2Digits((c >> 8) & 0xFF) + toHex2Digits(c & 0xFF);
        }
        
    }
}
