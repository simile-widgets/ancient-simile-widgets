package org.simileWidgets.datadust.expression {
    import flare.util.Property;

    public class Expression extends Property {
        protected var _rootNode:INode;
        protected var _text:String;
        
        static protected var _defaultContext:Context = null;
        
        public function Expression(rootNode:INode, text:String) {
            super(text);
            _rootNode = rootNode;
            _text = text;
            
            if (_defaultContext == null) {
                _defaultContext = Context.createDefaultContext();
            }
        }
        
        public function get text():String {
            return _text;
        }
        
        public override function eval(x:Object = null):* {
            if (_rootNode == null) {
                return null;
            }
            
            var ctx:Context = _defaultContext;
            if (x != null) {
                ctx.setIdentifier("this", x);
                ctx.setIdentifier("data", x["data"]);
            }
            
            var v:* = _rootNode.eval(ctx);
            
            //trace(_text + " = " + v + " " + (typeof v));
            return v;
        }
        
        public override function getValue(x:Object):* {
            return eval(x);
        }

        static public function parse(s:String):Expression {
            if (s == null) {
                return null;
            }
            
            var scanner:Scanner = new Scanner(s);
            var token:Object = scanner.token;
            var next:Function = function():void { scanner.next(); token = scanner.token; };
            var makePosition:Function = function():int { return token != null ? token.start : scanner.index; };
            var makeErrorString:Function = function(msg:String):String {
                return msg + ", at offset " + makePosition() + " while parsing \"" + s + "\"";
            };
            
            var parsePath:Function = function(node:INode):INode {
                while (token != null) {
                    if (token.type == Scanner.OPERATOR && token.value == ".") {
                        next();
                        
                        if (token != null && token.type == Scanner.IDENTIFIER) {
                            node = new PropertyNode(node, token.value);
                            next();
                        } else {
                            throw new Error(makeErrorString("Missing property name"));
                        }
                    } else if (token.type == Scanner.DELIMITER && token.value == "[") {
                        next();
                        
                        if (token != null && (token.type == Scanner.NUMBER || token.type == Scanner.STRING)) {
                            node = new IndexNode(node, token.value);
                            next();
                            
                            if (token != null && token.type == Scanner.DELIMITER && token.value == "]") {
                                next();
                            } else {
                                throw new Error(makeErrorString("Missing ]"));
                            }
                        } else {
                            throw new Error(makeErrorString("Missing index number or string"));
                        }
                    } else {
                        break;
                    }
                }
                return node;
            };
            var parseFactor:Function = function():INode {
                if (token == null) {
                    throw new Error(makeErrorString("Missing factor"));
                }
                
                var result:INode = null;
                
                switch (token.type) {
                case Scanner.NUMBER:
                    result = new LiteralNode(token.value);
                    next();
                    break;
                case Scanner.STRING:
                    result = new LiteralNode(token.value);
                    next();
                    break;
                case Scanner.IDENTIFIER:
                    var identifier:String = token.value;
                    next();
                    
                    if (identifier == "if" || identifier == "default") {
                        if (token != null && token.type == Scanner.DELIMITER && token.value == "(") {
                            next();
                            result = new ConstructNode(identifier, parseOptionalExpressionList());
                            
                            if (token != null && token.type == Scanner.DELIMITER && token.value == ")") {
                                next();
                            } else {
                                throw new Error(makeErrorString("Missing )"));
                            }
                        } else {
                            throw new Error(makeErrorString("Missing ( after " + identifier));
                        }
                    } else {
                        if (token != null && token.type == Scanner.DELIMITER && token.value == "(") {
                            next();
                            result = new FunctionCallNode(identifier, parseOptionalExpressionList());
                            
                            if (token != null && token.type == Scanner.DELIMITER && token.value == ")") {
                                next();
                            } else {
                                throw new Error(makeErrorString("Missing )"));
                            }
                        } else {
                            result = parsePath(new IdentifierNode(identifier));
                        }
                    }
                    break;
                case Scanner.OPERATOR:
                    if (token.value == "-" || token.value == "+") {
                        var op:String = token.value;
                        next();
                        
                        var factor:INode = new parseFactor();
                        result = op == "+" ? factor : (new OperatorNode("*", [ new LiteralNode(-1), factor ]));
                    }
                    break;
                    
                case Scanner.DELIMITER:
                    if (token.value == "(") {
                        next();
                        
                        result = parseExpression();
                        if (token != null && token.type == Scanner.DELIMITER && token.value == ")") {
                            next();
                            break;
                        } else {
                            throw new Error(makeErrorString("Missing )"));
                        }
                    }
                    break;
                }
                
                if (result == null) {
                    throw new Error(makeErrorString("Unexpected text \"" + token.value + "\""));
                }
                return result;
            };
            var parseTerm:Function = function():INode {
                var term:INode = parseFactor();
                while (token != null && token.type == Scanner.OPERATOR && 
                    (token.value == "*" || token.value == "/")) {
                    var operator:String = token.value;
                    next();
                    
                    term = new OperatorNode(operator, [ term, parseFactor() ]);
                }
                return term;
            };
            var parseSubExpression:Function = function():INode {
                var subExpression:INode = parseTerm();
                while (token != null && token.type == Scanner.OPERATOR && 
                    (token.value == "+" || token.value == "-")) {
                    
                    var operator:String = token.value;
                    next();
                    
                    subExpression = new OperatorNode(operator, [ subExpression, parseTerm() ]);
                }
                return subExpression;
            };
            var parseExpression:Function = function():INode {
                var expression:INode = parseSubExpression();
                while (token != null && token.type == Scanner.OPERATOR && 
                    (token.value == "=" || token.value == "==" ||
                     token.value == "<>" || token.value == "!=" || 
                     token.value == "<" || token.value == "<=" || 
                     token.value == ">" || token.value == ">=")) {
                    
                    var operator:String = token.value;
                    next();
                    
                    expression = new OperatorNode(operator, [ expression, parseSubExpression() ]);
                }
                return expression;
            };
            var parseOptionalExpressionList:Function = function():Array {
                return (token != null && token.type == Scanner.DELIMITER && token.value == ")") ? [] :
                    parseExpressionList();
            }
            var parseExpressionList:Function = function():Array {
                var expressions:Array = [ parseExpression() ];
                while (token != null && token.type == Scanner.DELIMITER && token.value == ",") {
                    next();
                    expressions.push(parseExpression());
                }
                return expressions;
            }
            
            var exp:Expression = new Expression(parseExpression(), s);
            __cache[s] = exp;
            
            return exp;
        }
        
        static public function parse2(s:String):Expression {
            // cheap parsing for now
            var node:INode = null;
            
            var parts:Array = s.split(".");
            if (parts.length > 1) {
                for (var i:int = 0; i < parts.length; ++i) {
                    if (parts[i].length > 0) {
                        if (node == null) {
                            node = new IdentifierNode(parts[i]);
                        } else {
                            node = new PropertyNode(node, parts[i]);
                        }
                    }
                }
            }
            
            var exp:Expression = new Expression(node, s);
            __cache[s] = exp;
            
            return exp;
        }
    }
    
}
