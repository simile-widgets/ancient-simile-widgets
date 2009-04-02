package org.simileWidgets.datadust.expression {
    public class ConstructNode implements INode {
        protected var _construct:String;
        protected var _argNodes:Array;
        protected var _f:Function;
        
        public function ConstructNode(construct:String, argNodes:Array) {
            _construct = construct;
            _argNodes = argNodes;
            switch(_construct) {
            case "if":
                _f = _if;
                break;
            case "default":
                _f = _default;
                break;
            default:
                _f = function(ctx:Context):* { return null; }
            }
        }
        
        public function eval(ctx:Context):* {
            return _f(ctx, _argNodes);
        }
        
        static protected function _if(ctx:Context, argNodes:Array):* {
            if (argNodes.length == 3) {
                var r:* = argNodes[0].eval(ctx);
                if (r === true) {
                    return argNodes[1].eval(ctx);
                } else {
                    return argNodes[2].eval(ctx);
                }
            }
            return null;
        }
        
        static protected function _default(ctx:Context, argNodes:Array):* {
            for (var i:int = 0; i < argNodes.length; i++) {
                var r:* = argNodes[i].eval(ctx);
                if (r != null && r != undefined) {
                    return r;
                }
            }
            return null;
        }
    }
}
