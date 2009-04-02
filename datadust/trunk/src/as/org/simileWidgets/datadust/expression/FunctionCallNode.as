package org.simileWidgets.datadust.expression {
    public class FunctionCallNode implements INode {
        protected var _functionName:String;
        protected var _argNodes:Array;
        
        public function FunctionCallNode(functionName:String, argNodes:Array) {
            _functionName = functionName;
            _argNodes = argNodes;
        }
        
        public function eval(ctx:Context):* {
            var f:Function = ctx.getIdentifier(_functionName);
            if (f != null && f is Function) {
                var args:Array = [];
                for (var i:int = 0; i < _argNodes.length; i++) {
                    args.push(_argNodes[i].eval(ctx));
                }
                return f.apply(null, args);
            }
            return null;
        }
    }
}
