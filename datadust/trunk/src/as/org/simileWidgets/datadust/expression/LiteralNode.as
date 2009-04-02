package org.simileWidgets.datadust.expression {
    public class LiteralNode implements INode {
        protected var _value:*;
        
        public function LiteralNode(value:*) {
            _value = value;
        }
        
        public function eval(ctx:Context):* {
            return _value;
        }
    }
}
