package org.simileWidgets.datadust.config {
    import flare.data.DataSet;
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
        
        static public function getPropertyConfiguration(o1:Object, o2:Object, configField:String, propertyName:String, def:*, format:String):IPropertyConfiguration {
            var o:* = getDelegate(o1, o2, configField, def);
            var config:IPropertyConfiguration = null;
            if (o != null) {
                if (o is Number || o is String) {
                    config = new ConstantPropertyEncoder(propertyName, parseStaticPropertyValue(o, format));
                } else {
                    switch (format) {
                    case "size":
                        config = new SizeExpressionEncoder(propertyName, o);
                        break;
                        
                    case "shape":
                        config = new ShapeExpressionEncoder(propertyName, o);
                        break;
                        
                    case "color":
                        config = new ColorExpressionEncoder(propertyName, o);
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
        
        static public function prepareData(data:Data, config:*):void {
            if (!(config is Array)) {
                config = [ config ];
            }
            
            var expression:Expression;
            
            for (var i:int = 0; i < config.length; i++) {
                var entry:Object = config[i];
                if (entry.hasOwnProperty("operation")) {
                    var operation:String = entry["operation"];
                    switch (operation) {
                    case "sort":
                        expression = Expression.parse(entry["expression"]);
                        
                        var ascending:Boolean = entry.hasOwnProperty("ascending") ? entry["ascending"] : true;
                        var property:String = entry.hasOwnProperty("property") ? entry["property"] : "rank";
                        
                        data.nodes.sortBy(expression.text);
                        
                        var rank:Number = ascending ? 0 : data.nodes.length - 1;
                        data.nodes.visit(ascending ?
                            function(node:DataSprite):void { node.data[property] = rank++; } :
                            function(node:DataSprite):void { node.data[property] = rank--; }
                        );
                        break;
                        
                    case "filter":
                        expression = Expression.parse(entry["expression"]);
                        
                        data.nodes.visit(function(node:DataSprite):void { 
                            if (true !== expression.eval(node)) {
                                data.nodes.remove(node);
                            }
                        });
                        break;
                    }
                }
            }
        }
        
        static public function prepareDataSet(ds:DataSet, config:*):DataSet {
            if (!(config is Array)) {
                config = [ config ];
            }
            
            var expression:Expression;
            
            for (var i:int = 0; i < config.length; i++) {
                var entry:Object = config[i];
                if (entry.hasOwnProperty("operation")) {
                    var operation:String = entry["operation"];
                    switch (operation) {
                    case "sort":
                        expression = Expression.parse(entry["expression"]);
                        
                        var ascending:Boolean = entry.hasOwnProperty("ascending") ? entry["ascending"] : true;
                        var property:String = entry.hasOwnProperty("property") ? entry["property"] : "rank";
                        
                        var comp:Function = ascending ? function(a:Object, b:Object):Number {
                            var va:Number = expression.eval({ data: a });
                            var vb:Number = expression.eval({ data: b });
                            return va - vb;
                        } : function(a:Object, b:Object):Number {
                            var va:Number = expression.eval({ data: a });
                            var vb:Number = expression.eval({ data: b });
                            return vb - va;
                        };
                        ds.nodes.data.sort(comp);
                        
                        if (entry.hasOwnProperty("head")) {
                            var head:int = entry["head"];
                            if (head < 0) {
                                ds.nodes.data = ds.nodes.data.slice(0, Math.max(0, ds.nodes.data.length + head));
                            } else {
                                ds.nodes.data = ds.nodes.data.slice(0, Math.min(ds.nodes.data.length, head));
                            }
                        }
                        if (entry.hasOwnProperty("tail")) {
                            var tail:int = entry["tail"];
                            if (tail < 0) {
                                ds.nodes.data = ds.nodes.data.slice(Math.min(ds.nodes.data.length, -tail));
                            } else {
                                ds.nodes.data = ds.nodes.data.slice(ds.nodes.data.length - Math.min(ds.nodes.data.length, tail));
                            }
                        }
                        
                        for (var j:int = 0; j < ds.nodes.data.length; j++) {
                            ds.nodes.data[j][property] = j;
                        }

                        break;
                    }
                }
            }
            return ds;
        }
    }
}
