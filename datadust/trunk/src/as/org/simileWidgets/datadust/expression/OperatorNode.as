package org.simileWidgets.datadust.expression {
    public class OperatorNode implements INode {
        protected var _operatorName:String;
        protected var _argNodes:Array;
        protected var _f:Function;
        
        public function OperatorNode(operatorName:String, argNodes:Array) {
            _operatorName = operatorName;
            _argNodes = argNodes;
            
            switch (operatorName) {
            case "+":   _f = _plus; break;
            case "-":   _f = _minus; break;
            case "*":   _f = _multiply; break;
            case "/":   _f = _divide; break;
            
            case ">":   _f = _greater; break;
            case ">=":  _f = _greaterEqual; break;
            case "<":   _f = _less; break;
            case "<=":  _f = _lessEqual; break;
            case "=":
            case "==":
                        _f = _equal; break;
            case "!=":
            case "<>":
                        _f = _notEqual; break;
            default:
                _f = function(ctx:Context):* { return null; };
            }
        }
        
        public function eval(ctx:Context):* {
            var args:Array = [];
            for (var i:int = 0; i < _argNodes.length; i++) {
                args.push(_argNodes[i].eval(ctx));
            }
            return _f.apply(null, args);
        }
        
        static protected function _plus(a:*, b:*):* { return a + b; }
        static protected function _minus(a:*, b:*):* { return a - b; }
        static protected function _multiply(a:*, b:*):* { return a * b; }
        static protected function _divide(a:*, b:*):* { return a / b; }
        
        static protected function _greater(a:*, b:*):* { return a > b; }
        static protected function _greaterEqual(a:*, b:*):* { return a >= b; }
        static protected function _less(a:*, b:*):* { return a < b; }
        static protected function _lessEqual(a:*, b:*):* { return a <= b; }
        static protected function _equal(a:*, b:*):* { return a == b; }
        static protected function _notEqual(a:*, b:*):* { return a != b; }
    }
}
