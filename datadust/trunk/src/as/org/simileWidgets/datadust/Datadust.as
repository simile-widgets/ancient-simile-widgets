package org.simileWidgets.datadust {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.Rectangle;
    import flare.animate.*;
    import flare.data.*;
    import flare.vis.*;
    import flare.vis.data.Data;
    import flare.vis.data.NodeSprite;
    import flare.vis.controls.HoverControl;
    import flare.vis.events.SelectionEvent;
    import flare.scale.*;
    import flash.net.URLLoader;
    import flash.text.TextField;
    import flash.text.TextFormat;
    import flash.text.TextLineMetrics;
    import flash.text.TextFormatAlign;
    import flash.text.TextFieldType;
    import org.simileWidgets.datadust.config.Utilities;
    import org.simileWidgets.datadust.config.Configuration;
    import org.simileWidgets.datadust.config.IPropertyConfiguration;
    import org.simileWidgets.datadust.expression.Expression;
    
    public class Datadust extends DatadustBase {
        protected var _data:Data;
        protected var _vis:Visualization;
        protected var _popup:TextField;
        protected var _configurations:Array = [];
        protected var _activeConfiguration:Number = -1;

        public function Datadust(boundingWidth:Number, boundingHeight:Number) {
            super(boundingWidth, boundingHeight);
            
            _popup = new TextField();
            
            var stageDetector:StageDetector = new StageDetector(this);
            stageDetector.addEventListener(StageDetector.ADDED_TO_STAGE, _addedToStageListener);
            stageDetector.addEventListener(StageDetector.REMOVED_FROM_STAGE, _removedFromStageListener);
        }
        
        protected function _addedToStageListener(e:Event):void {
            addEventListener(Event.ENTER_FRAME, _enterFrameListener);
        }
        
        protected function _removedFromStageListener(e:Event):void {
            removeEventListener(Event.ENTER_FRAME, _enterFrameListener);
        }
        
        protected function _enterFrameListener(e:Event):void {
        }
        
        public function init(config:*):void {
            var f:Function = function():void {
                if (config.hasOwnProperty("prepare")) {
                    Utilities.prepareData(_data, config["prepare"]);
                }
                _internalInit(config);
            };
            
            if (config.hasOwnProperty("sources")) {
                _loadDataSources(config["sources"], f);
            } else if (config.hasOwnProperty("source")) {
                _loadDataSources([ config["source"] ], f);
            }
        }
        
        protected function _loadDataSources(sources:*, f:Function):void {
            var i:int = 0;
            var next:Function = function():void {
                if (i < sources.length) {
                    _loadDataSource(sources[i++], next);
                } else {
                    f();
                }
            };
            next();
        }
        
        protected function _loadDataSource(source:*, f:Function):void {
            var dataSchema:DataSchema = null;
            var hasColumnHeadings:Boolean = source.hasOwnProperty("hasColumnHeadings") ? source["hasColumnHeadings"] : false;
            
            if (!hasColumnHeadings && source.hasOwnProperty("columns")) {
                dataSchema = new DataSchema();
                
                var columns:Array = source["columns"];
                for (var i:int = 0; i < columns.length; i++) {
                    var column:* = columns[i];
                    if (column is String) {
                        dataSchema.addField(new DataField(column, DataUtil.STRING));
                    } else {
                        dataSchema.addField(new DataField(column.name, column.type == "number" ? DataUtil.NUMBER : DataUtil.STRING));
                    }
                }
            }
            
            var ds:DataSource = new DataSource(
                source["url"],
                source["format"],
                dataSchema
            );
            
            var loader:URLLoader = ds.load();
            loader.addEventListener(
                Event.COMPLETE, 
                function(evt:Event):void {
                    var ds:DataSet = loader.data as DataSet;
                    
                    if (hasColumnHeadings && source.hasOwnProperty("columns")) {
                        ds = _readjustColumns(ds, source["columns"]);
                    }
                    _addDataSet(ds, source);
                    
                    f();
                }
            );
        }
        
        protected function _readjustColumns(ds:DataSet, columns:Array):DataSet {
            var columnMap:Object = {};
            for (var i:int = 0; i < columns.length; i++) {
                var column:Object = columns[i];
                columnMap[column.name] = column.type;
            }
            
            var dataSchema:DataSchema = new DataSchema();
            var fields:Array = ds.nodes.schema.fields;
            for (i = 0; i < fields.length; i++) {
                var field:DataField = fields[i];
                if (columnMap.hasOwnProperty(field.name)) {
                    dataSchema.addField(new DataField(
                        field.name, 
                        columnMap[field.name] == "number" ? DataUtil.NUMBER : DataUtil.STRING));
                } else {
                    dataSchema.addField(field);
                }
            }
            
            for each (var tuple:Object in ds.nodes.data) {
                for (i = 0; i < columns.length; i++) {
                    column = columns[i];
                    if (column.type == "number") {
                        var name:String = column.name;
                        if (tuple.hasOwnProperty(name)) {
                            tuple[name] = DataUtil.parseValue(tuple[name], DataUtil.NUMBER);
                        }
                    }
                }
            }
            return new DataSet(new DataTable(ds.nodes.data, dataSchema));
        }
        
        protected function _addDataSet(ds:DataSet, source:*):void {
            /*
             *  Pre-processing
             */
            if (source.hasOwnProperty("group")) {
                ds = _group(ds, source["group"]);
            }
            if (source.hasOwnProperty("prepare")) {
                ds = Utilities.prepareDataSet(ds, source["prepare"]);
            }
        
            if (_data == null) {
                _data = Data.fromDataSet(ds);
            } else if (source.hasOwnProperty("join")) {
                var joins:* = source["join"];
                if (joins is Array) {
                    _join(ds, joins);
                } else {
                    _join(ds, [ joins ]);
                }
            } else {
                for each (var tuple:Object in ds.nodes.data) {
                    _data.addNode(tuple);
                }
            }
        }
        
        protected function _group(ds:DataSet, criteria:*):DataSet {
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
        
        protected function _join(ds:DataSet, joins:Array):void {
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
            
            _data.nodes.visit(function(node:NodeSprite):void {
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
        
        protected function _internalInit(config:*):void {
            if ("configs" in config) {
                var configs:Array = config["configs"];
                for (var i:int = 0; i < configs.length; i++) {
                    var jsConfig:Object = configs[i];
                    var jsBaseConfigIndex:Number = jsConfig.hasOwnProperty("baseConfig")  ? jsConfig["baseConfig"] : -1;
                    var jsBaseConfig:Object = (jsBaseConfigIndex >= 0 && jsBaseConfigIndex < configs.length && jsBaseConfigIndex != i) ?
                        configs[jsBaseConfigIndex] : null;
                        
                    _configurations.push(new Configuration(jsConfig, jsBaseConfig));
                }
            }
            
            var initialConfigurationIndex:Number = config.hasOwnProperty("initialConfig") ? config["initialConfig"] : 0;
            selectConfiguration(initialConfigurationIndex);
        }
        
        public function selectConfiguration(index:int):void {
            if (index < 0 || index >= _configurations.length) {
                return;
            }
            
            var config:Configuration = _configurations[index];
            if (_vis == null) {
                _vis = new Visualization(_data);
                _vis.bounds = new Rectangle(100, 50, boundingWidth - 150, boundingHeight - 100);
                addChild(_vis);
                
                _vis.controls.add(new HoverControl(
                    NodeSprite,
                    HoverControl.MOVE_AND_RETURN, // by default, move highlighted items to front
                    function(e:SelectionEvent):void { // mouse over
                        e.node.lineWidth = 2;
                        e.node.lineColor = 0x88ff0000;
                        showPopup(config, e.cause, e.node);
                    },
                    function(e:SelectionEvent):void { // mouse out
                        var lwpc:IPropertyConfiguration = config.nodesConfig.lineWidthConfig;
                        e.node.lineWidth = lwpc != null ? lwpc.encode(e.node) : 0;
                        
                        var lcpc:IPropertyConfiguration = config.nodesConfig.lineColorConfig;
                        e.node.lineColor = lcpc != null ? lcpc.encode(e.node) : 0;
                        
                        removeChild(_popup);
                    }
                ));
                
                config.configure(_vis, null);
                
                _vis.update();
            } else {
                _vis.continuousUpdates = false;
                _vis.operators.clear();
                
                var seq:FunctionSequence = new FunctionSequence();
                
                config.configure(_vis, seq);
                seq.play();
            }
            _activeConfiguration = index;
        }
        
        protected function showPopup(config:Configuration, e:MouseEvent, node:NodeSprite):void {
            var tooltipExpression:Expression = config.tooltipExpression;
            if (tooltipExpression == null) {
                return;
            }
            
            var text:String = tooltipExpression.eval(node);
            if (text == null) {
                return;
            }
            
            var x:Number = e.stageX - e.localX;
            var y:Number = e.stageY - e.localY;
            var w:Number = node.width;
            var h:Number = node.height;
                    
            addChild(_popup);
            _popup.width = 500;
            _popup.text = text;
            _popup.background = true;
            _popup.backgroundColor = 0x88eeeeee;
            _popup.type = TextFieldType.DYNAMIC;
                    
            var format:TextFormat = new TextFormat();
            format.font = "Helvetica";
            format.size = 15;
            _popup.setTextFormat(format);
            
            var metrics:TextLineMetrics = _popup.getLineMetrics(0);
            
            _popup.width = metrics.width + 5;
            _popup.height = metrics.height + 5;
            if (x + w + _popup.width > boundingWidth) {
                _popup.x = x - _popup.width - 3;
            } else {
                _popup.x = x + w + 3;
            }
            
            if (y > 20) {
                _popup.y = y - 10;
            } else {
                _popup.y = y + 10;
            }
        }
    }
}
