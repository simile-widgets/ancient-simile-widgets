package org.simileWidgets.datadust.expression {
    internal class Scanner {
        protected var _text:String;
        protected var _maxIndex:int;
        protected var _index:int;
        protected var _token:Object;
        
        static public var DELIMITER:int     = 0;
        static public var NUMBER:int        = 1;
        static public var STRING:int        = 2;
        static public var IDENTIFIER:int    = 3;
        static public var OPERATOR:int      = 4;

        public function Scanner(text:String, startIndex:int = 0) {
            _text = text + " "; // make it easier to parse
            _maxIndex = text.length;
            _index = startIndex;
            
            next();
        }
        
        public function get token():Object {
            return _token;
        }

        public function get index():int {
            return _index;
        }

        public function next():void {
            _token = null;
            
            while (_index < _maxIndex && " \t\r\n".indexOf(_text.charAt(_index)) >= 0) {
                _index++;
            }
            
            if (_index < _maxIndex) {
                var c1:String = _text.charAt(_index);
                var c2:String = _text.charAt(_index + 1);
                var cs:String = c1 + c2;
                var i:int;
                
                if (cs == ">=" || cs == "<=" || cs == "==" || cs == "!=" || cs == "<>") {
                    _token = {
                        type:   OPERATOR,
                        value:  cs,
                        start:  _index,
                        end:    _index + 2
                    };
                    _index += 2;
                } else if ("." == c1) {
                    _token = {
                        type:   OPERATOR,
                        value:  c1,
                        start:  _index,
                        end:    _index + 1
                    };
                    _index++;
                } else if ("+-*/=".indexOf(c1) >= 0) {
                    this._token = {
                        type:   OPERATOR,
                        value:  c1,
                        start:  this._index,
                        end:    this._index + 1
                    };
                    _index++;
                } else if ("(){}[],".indexOf(c1) >= 0) {
                    _token = {
                        type:   DELIMITER,
                        value:  c1,
                        start:  _index,
                        end:    _index + 1
                    };
                    _index++;
                } else if ("\"'".indexOf(c1) >= 0) { // quoted strings
                    i = _index + 1;
                    while (i < _maxIndex) {
                        if (_text.charAt(i) == c1 && _text.charAt(i - 1) != "\\") {
                            break;
                        }
                        i++;
                    }
                    
                    if (i < _maxIndex) {
                        _token = {
                            type:   STRING,
                            value:  _text.substring(_index + 1, i).replace(/\\'/g, "'").replace(/\\"/g, '"'),
                            start:  _index,
                            end:    i + 1
                        };
                        _index = i + 1;
                    } else {
                        throw new Error("Unterminated string starting at " + _index);
                    }
                } else if (_isDigit(c1)) { // number
                    i = _index;
                    while (i < _maxIndex && _isDigit(_text.charAt(i))) {
                        i++;
                    }
                    
                    if (i < _maxIndex && _text.charAt(i) == ".") {
                        i++;
                        while (i < _maxIndex && _isDigit(_text.charAt(i))) {
                            i++;
                        }
                    }
                    
                    _token = {
                        type:   NUMBER,
                        value:  parseFloat(_text.substring(_index, i)),
                        start:  _index,
                        end:    i
                    };
                    _index = i;
                } else { // identifier
                    i = _index;
                    while (i < _maxIndex) {
                        var c:String = _text.charAt(i);
                        if ("()[]{},.+-*/^<>=! \t".indexOf(c) < 0) {
                            i++;
                        } else {
                            break;
                        }
                    }
                    _token = {
                        type:   IDENTIFIER,
                        value:  _text.substring(_index, i),
                        start:  _index,
                        end:    i
                    };
                    _index = i;
                }
            }
        }

        protected function _isDigit(c:String):Boolean {
            return "0123456789".indexOf(c) >= 0;
        }

    }
}
