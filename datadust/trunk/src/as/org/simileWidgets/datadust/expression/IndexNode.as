package org.simileWidgets.datadust.expression {
    public class IndexNode implements INode {
        protected var _objNode:INode;
        protected var _index:*;
        
        public function IndexNode(objNode:INode, index:*) {
            _objNode = objNode;
            _index = index;
        }
        
        public function eval(ctx:Context):* {
            var o:* = _objNode.eval(ctx);
            return (o != null && o is Object) ? o[_index] : null;
        }
    }
}
