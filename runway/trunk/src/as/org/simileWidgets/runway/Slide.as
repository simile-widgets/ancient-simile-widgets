package org.simileWidgets.runway {
    public class Slide {
        private var _record:Object;
        
        public function Slide(record:Object) {
            _record = record;
        }
        
        public function dispose():void {
            _record = null;
        }
        
        public function get id():String {
            return String(_record["id"]);
        }
        
        public function get imageURL():String {
            return ("image" in _record) ? String(_record["image"]) : null;
        }
        
        public function get title():String {
            return ("title" in _record) ? String(_record["title"]) : ("image" in _record ? String(_record["image"]) : "Untitled");
        }
        
        public function get subtitle():String {
            return ("subtitle" in _record) ? String(_record["subtitle"]) : null;
        }
        
        public function get record():Object {
            return _record;
        }
        
        public function getProperty(name:String):* {
            return _record[name];
        }
    }
}
