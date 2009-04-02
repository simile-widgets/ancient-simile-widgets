package org.simileWidgets.datadust.expression {
    public class IdentifierNode implements INode {
        protected var _name:String;
        
        public function IdentifierNode(name:String) {
            _name = name;
        }
        
        public function eval(ctx:Context):* {
            return ctx.getIdentifier(_name);
        }
    }
}
