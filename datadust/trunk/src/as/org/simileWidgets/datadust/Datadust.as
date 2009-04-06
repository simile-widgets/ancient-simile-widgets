package org.simileWidgets.datadust {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.Rectangle;
    import flare.animate.*;
    import flare.data.*;
    import flare.vis.*;
    import flare.vis.data.Data;
    import flare.vis.data.NodeSprite;
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
    import org.simileWidgets.datadust.vis.FormattedCartesianAxes;
    
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
                createVisualization();
                
                config.configure(_vis, null);
                
                _vis.update();
            } else {
                _vis.continuousUpdates = false;
                _vis.controls.clear();
                _vis.operators.clear();
                
                var seq:FunctionSequence = new FunctionSequence();
                
                config.configure(_vis, seq);
                /*
                seq.push(function(t:Transition):void {
                    trace("Done transitioning");
                }, null);
                */
                seq.play();
            }
            _activeConfiguration = index;
        }
        
        protected function createVisualization():void {
            _vis = new Visualization(_data, new FormattedCartesianAxes());
            _vis.bounds = new Rectangle(100, 50, boundingWidth - 150, boundingHeight - 100);
            _vis.data.addGroup("selected");
            addChild(_vis);
        }
    }
}
