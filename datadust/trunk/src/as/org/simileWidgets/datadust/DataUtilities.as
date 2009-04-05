package org.simileWidgets.datadust {
    import flare.data.*;
    import flare.vis.data.*;
    import org.simileWidgets.datadust.expression.Expression;
    
    public class DataUtilities {
        static public function columnTypeToDataType(type:String):int {
            switch (type) {
            case "number":
                return DataUtil.NUMBER;
            case "boolean":
                return DataUtil.BOOLEAN;
            }
            return DataUtil.STRING;
        }
        
        static public function createDataSchemaFromColumns(columns:Array):DataSchema {
            var dataSchema:DataSchema = new DataSchema();
            
            for (var i:int = 0; i < columns.length; i++) {
                var column:* = columns[i];
                if (column is String) {
                    dataSchema.addField(new DataField(column, DataUtil.STRING));
                } else {
                    dataSchema.addField(new DataField(column.name, columnTypeToDataType(column.type)));
                }
            }
            return dataSchema;
        }
        
        static public function readjustColumns(ds:DataSet, columns:Array, readjustAll:Boolean):DataSet {
            var columnMap:Object = {};
            var hasDates:Boolean = false;
            for (var i:int = 0; i < columns.length; i++) {
                var column:Object = columns[i];
                columnMap[column.name] = column.type;
                if (column.type == "date") {
                    hasDates = true;
                }
            }
            
            if (!readjustAll && !hasDates) {
                return ds;
            }
            
            var dataSchema:DataSchema = new DataSchema();
            var fields:Array = ds.nodes.schema.fields;
            for (i = 0; i < fields.length; i++) {
                var field:DataField = fields[i];
                if (columnMap.hasOwnProperty(field.name)) {
                    dataSchema.addField(new DataField(
                        field.name, 
                        columnTypeToDataType(columnMap[field.name])));
                } else {
                    dataSchema.addField(field);
                }
            }
            
            for each (var tuple:Object in ds.nodes.data) {
                for (i = 0; i < columns.length; i++) {
                    column = columns[i];
                    if (readjustAll || (column.type == "date")) {
                        var name:String = column.name;
                        if (tuple.hasOwnProperty(name)) {
                            if (column.type == "number") {
                                tuple[name] = DataUtil.parseValue(tuple[name], DataUtil.NUMBER);
                            } else if (column.type == "date") {
                                tuple[name] = DateUtilities.parseIso8601DateTime(tuple[name]);
                            }
                        }
                    }
                }
            }
            return new DataSet(new DataTable(ds.nodes.data, dataSchema));
        }
        
        static public function prepareData(data:Data, config:*):void {
            if (!(config is Array)) {
                config = [ config ];
            }
            
            var groupExpression:Expression;
            var sortExpression:Expression;
            var ascending:Boolean;
            var property:String;
            
            for (var i:int = 0; i < config.length; i++) {
                var entry:Object = config[i];
                if (entry.hasOwnProperty("operation")) {
                    var operation:String = entry["operation"];
                    switch (operation) {
                    case "sort":
                        sortExpression = Expression.parse(entry["expression"]);
                        ascending = entry.hasOwnProperty("ascending") ? entry["ascending"] : true;
                        property = entry.hasOwnProperty("property") ? entry["property"] : "rank";
                        
                        data.nodes.sortBy(sortExpression.text);
                        
                        var rank:Number = ascending ? 0 : data.nodes.length - 1;
                        data.nodes.visit(ascending ?
                            function(node:DataSprite):void { node.data[property] = rank++; } :
                            function(node:DataSprite):void { node.data[property] = rank--; }
                        );
                        break;
                        
                    case "connect":
                        groupExpression = entry.hasOwnProperty("group") ? Expression.parse(entry["group"]) : null;
                        sortExpression = Expression.parse(entry["sort"]);
                        ascending = entry.hasOwnProperty("ascending") ? entry["ascending"] : true;
                        
                        var processGroup:Function = function(nodes:*):void {
                            var pairs:Array = [];
                            if (nodes is DataList) {
                                nodes.visit(function(node:NodeSprite):void {
                                    pairs.push({ node: node, value: sortExpression.eval(node) });
                                });
                            } else {
                                for each (var node:NodeSprite in nodes) {
                                    pairs.push({ node: node, value: sortExpression.eval(node) });
                                }
                            }
                            pairs = pairs.sort(
                                function(p1:Object, p2:Object):int { return DataUtilities.compare(p1.value, p2.value); },
                                ascending ? 0 : Array.DESCENDING
                            );
                            
                            for (var j:int = 1; j < pairs.length; j++) {
                                var node1:NodeSprite = pairs[j - 1].node;
                                var node2:NodeSprite = pairs[j].node;
                                
                                data.addEdgeFor(node1, node2, true);
                            }
                        };
                        
                        if (groupExpression == null) {
                            processGroup(data.nodes);
                        } else {
                            var groups:Object = {};
                            data.nodes.visit(function(node:NodeSprite):void {
                                var value:* = groupExpression.eval(node);
                                if (groups.hasOwnProperty(value)) {
                                    groups[value].push(node);
                                } else {
                                    groups[value] = [ node ];
                                }
                            });
                            for (var v:String in groups) {
                                processGroup(groups[v]);
                            }
                        }
                        break;
                        
                    case "filter":
                        var expression:Expression = Expression.parse(entry["expression"]);
                        
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
        
        static public function group(ds:DataSet, criteria:*):DataSet {
            if (!criteria.hasOwnProperty("key") || !criteria.hasOwnProperty("group")) {
                return ds;
            }
            
            var rows:Array = [];
            var map:Object = {};
            var keyField:String = criteria["key"];
            var groupField:String = criteria["group"];
            
            for each (var tuple:Object in ds.nodes.data) {
                var key:* = tuple[keyField];
                var groupKey:* = String(tuple[groupField]);
                
                var newTuple:*;
                if (map.hasOwnProperty(key)) {
                    newTuple = map[key];
                } else {
                    newTuple = {};
                    newTuple[keyField] = key;
                    newTuple[groupField] = {};
                    
                    map[key] = newTuple;
                    rows.push(newTuple);
                }
                
                var group:Object = newTuple[groupField];
                var groupEntry:Object = group[groupKey] = { "key" : groupKey };
                
                for (var field:String in tuple) {
                    if (field != keyField && field != groupField) {
                        groupEntry[field] = tuple[field];
                    }
                }
            }
            
            return new DataSet(new DataTable(rows));
        }
        
        static public function joinNodes(data:Data, ds:DataSet, joins:Array):void {
            var joins2:Array = [];
            for (var i:int = 0; i < joins.length; i++) {
                var join:* = joins[i];
                if (join is String) {
                    joins2.push({ ours: join, theirs: join });
                } else {
                    joins2.push(join);
                }
            }
            
            var map:Object = {};
            for each (var tuple:Object in ds.nodes.data) {
                var a:Array = [];
                for (var j:int = 0; j < joins2.length; j++) {
                    a.push(tuple[joins2[j].ours]);
                }
                var key:String = a.join("|");
                map[key] = tuple;
            }
            
            data.nodes.visit(function(node:NodeSprite):void {
                var theirTuple:Object = node.data;
                
                var a:Array = [];
                for (var j:int = 0; j < joins2.length; j++) {
                    a.push(theirTuple[joins2[j].theirs]);
                }
                var key:String = a.join("|");
                
                if (map.hasOwnProperty(key)) {
                    var ourTuple:Object = map[key];
                    for (var name:String in ourTuple) {
                        theirTuple[name] = ourTuple[name];
                    }
                }
            });
        }
        
        static public function toComparable(d:*):* {
            if (d != null) {
                if (d is Date) {
                    return d.time;
                }
            }
            return d;
        }
        
        static public function compare(d1:*, d2:*):Number {
            var v1:* = toComparable(d1);
            var v2:* = toComparable(d2);
            return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
        }
    }
}