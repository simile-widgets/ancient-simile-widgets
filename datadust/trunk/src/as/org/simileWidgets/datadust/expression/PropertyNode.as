package org.simileWidgets.datadust.expression {
    public class PropertyNode implements INode {
        protected var _objNode:INode;
        protected var _propertyName:String;
        
        public function PropertyNode(objNode:INode, propertyName:String) {
            _objNode = objNode;
            _propertyName = propertyName;
        }
        
        public function eval(ctx:Context):* {
            var o:* = _objNode.eval(ctx);
            return (o != null && o is Object && o.hasOwnProperty(_propertyName)) ? o[_propertyName] : null;
        }
    }
}
