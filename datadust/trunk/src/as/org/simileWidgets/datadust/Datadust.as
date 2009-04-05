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
    import org.simileWidgets.datadust.config.ScatterPlotConfiguration;
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
                    DataUtilities.prepareData(_data, config["prepare"]);
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
            var hasColumnHeadings:Boolean = 
                source.hasOwnProperty("hasColumnHeadings") ? source["hasColumnHeadings"] : false;
            
            if (!hasColumnHeadings && source.hasOwnProperty("columns")) {
                dataSchema = DataUtilities.createDataSchemaFromColumns(source["columns"]);
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
                    
                    if (source.hasOwnProperty("columns")) {
                        ds = DataUtilities.readjustColumns(ds, source["columns"], hasColumnHeadings);
                    }
                    _addDataSet(ds, source);
                    
                    f();
                }
            );
        }
        
        protected function _addDataSet(ds:DataSet, source:*):void {
            /*
             *  Pre-processing
             */
            if (source.hasOwnProperty("group")) {
                ds = DataUtilities.group(ds, source["group"]);
            }
            if (source.hasOwnProperty("prepare")) {
                ds = DataUtilities.prepareDataSet(ds, source["prepare"]);
            }
        
            if (_data == null) {
                _data = Data.fromDataSet(ds);
            } else if (source.hasOwnProperty("join")) {
                var joins:* = source["join"];
                DataUtilities.joinNodes(_data, ds, (joins is Array) ? joins : [joins]);
            } else {
                for each (var tuple:Object in ds.nodes.data) {
                    _data.addNode(tuple);
                }
            }
        }
        
        protected function _internalInit(config:*):void {
            if ("configs" in config) {
                var configs:Array = config["configs"];
                for (var i:int = 0; i < configs.length; i++) {
                    var jsConfig:Object = configs[i];
                    var jsBaseConfigIndex:Number = jsConfig.hasOwnProperty("baseConfig")  ? jsConfig["baseConfig"] : -1;
                    var jsBaseConfig:Object = (jsBaseConfigIndex >= 0 && jsBaseConfigIndex < configs.length && jsBaseConfigIndex != i) ?
                        configs[jsBaseConfigIndex] : null;
                        
                    var chartType:String = Utilities.getDelegate(jsConfig, jsBaseConfig, "chartType", "scatter");
                    
                    switch (chartType) {
                    case "scatter":
                        _configurations.push(new ScatterPlotConfiguration(jsConfig, jsBaseConfig));
                    }
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
