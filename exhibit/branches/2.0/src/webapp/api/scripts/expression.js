/*==================================================
 *  Exhibit.Expression
 *  http://simile.mit.edu/wiki/Exhibit/API/Expression
 *==================================================
 */
Exhibit.Expression = new Object();

Exhibit.Expression.parse = function(s) {
    var expressions = Exhibit.Expression.parseSeveral(s);
    if (expressions.length > 1) {
        throw new Error("Expected only one expression");
    }
    
    return expressions[0];
};

Exhibit.Expression.parseSeveral = function(s) {
    var tokens = Exhibit.Expression._tokenize(s);
    
    var x = -1;
    var token;
    var consumeToken = function() {
        ++x;
        token = x < tokens.length ? tokens[x] : null;
    };
    consumeToken();
    
    var parseFactor = function() {
        if (token == null) {
            throw new Error("Missing factor");
        }
        
        var result = null;
        
        switch (token.type) {
        case Exhibit.Expression._Token.NUMBER:
            result = new Exhibit.Expression._Constant(token.value, "number");
            break;
        case Exhibit.Expression._Token.STRING:
            result = new Exhibit.Expression._Constant(token.value, "text");
            break;
        case Exhibit.Expression._Token.PATH:
            result = token.value;
            break;
        case Exhibit.Expression._Token.FUNCTION:
            var name = token.value;
            consumeToken();
            
            if (token.type == Exhibit.Expression._Token.DELIMITER && token.value == "(") {
                consumeToken();
                
                result = new Exhibit.Expression._FunctionCall(name, parseExpressionList());
                
                if (token == null || token.type != Exhibit.Expression._Token.DELIMITER || token.value != ")") {
                    throw new Error("Missing ) after function call");
                }
            } else {
                throw new Error("Missing ( after function name");
            }
            break;
        case Exhibit.Expression._Token.CONTROL:
            var name = token.value;
            consumeToken();
            
            if (token.type == Exhibit.Expression._Token.DELIMITER && token.value == "(") {
                consumeToken();
                
                result = new Exhibit.Expression._ControlCall(name, parseExpressionList());
                
                if (token == null || token.type != Exhibit.Expression._Token.DELIMITER || token.value != ")") {
                    throw new Error("Missing ) to end " + name);
                }
            } else {
                throw new Error("Missing ( to start " + name);
            }
            break;
        case Exhibit.Expression._Token.DELIMITER:
            if (token.value == "(") {
                consumeToken();
                
                result = parseExpression();
                if (token == null || token.type != Exhibit.Expression._Token.DELIMITER || token.value != ")") {
                    throw new Error("Missing )");
                }
                break;
            } // else, fall through
        default:
            throw new Error("Unexpected token " + token);
        }
        
        consumeToken();
        return result;
    };
    var parseTerm = function() {
        var term = parseFactor();
        while (token != null && 
            token.type == Exhibit.Expression._Token.OPERATOR && 
            (token.value == "*" || token.value == "/")) {
            var operator = token.value;
            consumeToken();
            
            term = new Exhibit.Expression._Operator(operator, [ term, parseFactor() ]);
        }
        return term;
    };
    var parseSubExpression = function() {
        var subExpression = parseTerm();
        while (token != null && 
            token.type == Exhibit.Expression._Token.OPERATOR && 
            (token.value == "+" || token.value == "-")) {
            var operator = token.value;
            consumeToken();
            
            subExpression = new Exhibit.Expression._Operator(operator, [ subExpression, parseTerm() ]);
        }
        return subExpression;
    };
    var parseExpression = function() {
        var expression = parseSubExpression();
        while (token != null && 
            token.type == Exhibit.Expression._Token.OPERATOR && 
            (token.value == "=" || 
             token.value == "!=" || 
             token.value == "<" || 
             token.value == "<=" || 
             token.value == ">" || 
             token.value == ">=" ||
             token.value == "+" ||
             token.value == "-" ||
             token.value == "*" ||
             token.value == "/"
            )) {
            var operator = token.value;
            consumeToken();
            
            expression = new Exhibit.Expression._Operator(operator, [ expression, parseSubExpression() ]);
        }
        return expression;
    };
    var parseExpressionList = function() {
        var expressions = [ parseExpression() ];
        while (token != null && token.type == Exhibit.Expression._Token.DELIMITER && token.value == ",") {
            consumeToken();
            
            expressions.push(parseExpression());
        }
        return expressions;
    }
    
    var roots = parseExpressionList();
    if (token != null) {
        throw new Error("Extra text found at the end of the code");
    }
    
    var expressions = [];
    for (var r = 0; r < roots.length; r++) {
        expressions.push(new Exhibit.Expression._Impl(roots[r]));
    }
    
    return expressions;
};

Exhibit.Expression._delimiters = { "(":true, ")":true, ",":true };
Exhibit.Expression._tokenizeNoStringLiterals = function(s) {
    s = s.replace(/\s+/g, ' ').
        replace(/\s?\(\s?/g, ' ( ').
        replace(/\s?\)\s?/g, ' ) ').
        replace(/\s\+\s/g, ' + ').
        replace(/\s\-\s/g, ' - ').
        replace(/\s\*\s/g, ' * ').
        replace(/\s\/\s/g, ' / ').
        replace(/\s?\,\s?/g, ' , ').
        trim();
        
    var tokens = s.split(" ");
    var results = [];
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i].trim();
        if (token == "") {
            // continue;
        } else if (token in Exhibit.Expression._delimiters) {
            results.push(new Exhibit.Expression._Token(Exhibit.Expression._Token.DELIMITER, token));
        } else if (token in Exhibit.Expression._operators) {
            results.push(new Exhibit.Expression._Token(Exhibit.Expression._Token.OPERATOR, token));
        } else if (token in Exhibit.Functions) {
            results.push(new Exhibit.Expression._Token(Exhibit.Expression._Token.FUNCTION, token));
        } else if (token == "foreach") {
            results.push(new Exhibit.Expression._Token(Exhibit.Expression._Token.CONTROL, token));
        } else {
            var n = parseFloat(token);
            if (isNaN(n)) {
                results.push(new Exhibit.Expression._Token(
                    Exhibit.Expression._Token.PATH,
                    Exhibit.Expression._parsePath(token)
                ));
            } else {
                results.push(new Exhibit.Expression._Token(Exhibit.Expression._Token.NUMBER, n));
            }
        }
    }
    return results;
};

Exhibit.Expression._tokenize = function(s) {
    var tokens = [];
    
    var findClosingDelimiter = function(d) {
        var start = 0;
        while (start < s.length) {
            var closing = s.indexOf(d, start);
            if (closing > 0) {
                if (s.substr(closing - 1, 1) == "\\") {
                    start = closing + 1;
                    continue;
                }
            }
            return closing;
        }
        return -1;
    }
    
    while (s.length > 0) {
        var delimiter = "'";
        var opening = s.indexOf(delimiter);
        if (opening < 0) {
            delimiter = '"';
            opening = s.indexOf(delimiter);
        }
        
        if (opening < 0) {
            break;
        } else {
            tokens = tokens.concat(Exhibit.Expression._tokenizeNoStringLiterals(s.substr(0, opening)));
            s = s.substr(opening + 1);
            
            var closing = findClosingDelimiter(delimiter);
            if (closing >= 0) {
                tokens.push(new Exhibit.Expression._Token(Exhibit.Expression._Token.STRING, s.substr(0, closing)));
                s = s.substr(closing + 1);
            } else {
                throw new Error("String missing closing delimiter");
            }
        }
    }
    
    if (s.length > 0) {
        tokens = tokens.concat(Exhibit.Expression._tokenizeNoStringLiterals(s));
    }
    
    return tokens;
};

Exhibit.Expression._parsePath = function(s) {
    var path = new Exhibit.Expression.Path();
    if (s.length > 0) {
        var dotBang = s.search(/[\.!]/);
        if (dotBang > 0) {
            path.setRootName(s.substr(0, dotBang));
            s = s.substr(dotBang);
        } else if (dotBang < 0) {
            path.setRootName(s);
            s = "";
        }
        
        var regex = /[\.!][^\.!]+/g;
        var result;
        while ((result = regex.exec(s)) != null) {
            var segment = result[0];
            
            var dotBang = segment.substr(0,1);
            var property = segment.substr(1);
            var isList = false;
            
            var at = property.indexOf("@");
            if (at > 0) {
                if (property.substr(at + 1) == "list") {
                    isList = true;
                }
                property = property.substr(0, at);
            }
            path.appendSegment(
                property,
                dotBang == ".",
                isList
            );
        }
    }
    return path;
};

/*==================================================
 *  Exhibit.Expression._Token
 *==================================================
 */
 
Exhibit.Expression._Token = function(type, value) {
    this.type = type;
    this.value = value;
};

Exhibit.Expression._Token.DELIMITER = 0;
Exhibit.Expression._Token.CONTROL   = 1;
Exhibit.Expression._Token.PATH      = 2;
Exhibit.Expression._Token.OPERATOR  = 3;
Exhibit.Expression._Token.FUNCTION  = 4;
Exhibit.Expression._Token.NUMBER    = 5;
Exhibit.Expression._Token.STRING    = 6;

/*==================================================
 *  Exhibit.Expression._Impl
 *==================================================
 */
Exhibit.Expression._Impl = function(rootNode) {
    this._rootNode = rootNode;
};

Exhibit.Expression._Impl.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return this._rootNode.evaluate(roots, rootValueTypes, defaultRootName, database);
};

Exhibit.Expression._Impl.prototype.evaluateOnItem = function(itemID, database) {
    return this.evaluate(
        { "value" : itemID }, 
        { "value" : "item" }, 
        "value",
        database
    );
};

Exhibit.Expression._Impl.prototype.evaluateSingle = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var results = this._rootNode.evaluate(roots, rootValueTypes, defaultRootName, database);
    var result = { value: null, valueType: results.valueType };
    results.values.visit(function(v) { result.value = v; return true; });
    
    return result;
};

Exhibit.Expression._Impl.prototype.evaluateSingleOnItem = function(itemID, database) {
    return this.evaluateSingle(
        { "value" : itemID }, 
        { "value" : "item" }, 
        "value",
        database
    );
};

Exhibit.Expression._Impl.prototype.testExists = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return this.isPath() ?
        this._rootNode.testExists(roots, rootValueTypes, defaultRootName, database) :
        false;
};

Exhibit.Expression._Impl.prototype.isPath = function() {
    return this._rootNode instanceof Exhibit.Expression.Path;
};

Exhibit.Expression._Impl.prototype.getPath = function() {
    return this.isPath() ? this._rootNode : null;
};

/*==================================================
 *  Exhibit.Expression.Path
 *==================================================
 */
Exhibit.Expression.Path = function() {
    this._rootName = null;
    this._segments = [];
};

Exhibit.Expression.Path.create = function(property, forward) {
    var path = new Exhibit.Expression.Path();
    path._segments.push({ property: property, forward: forward, isList: false });
    return path;
};

Exhibit.Expression.Path.prototype.setRootName = function(rootName) {
    this._rootName = rootName;
};

Exhibit.Expression.Path.prototype.appendSegment = function(property, forward, isList) {
    this._segments.push({
        property:   property,
        forward:    forward,
        isList:     isList
    });
};

Exhibit.Expression.Path.prototype.getSegment = function(index) {
    if (index < this._segments.length) {
        var segment = this._segments[index];
        return {
            property:   segment.property,
            forward:    segment.forward
        };
    } else {
        return null;
    }
};

Exhibit.Expression.Path.prototype.getLastSegment = function() {
    return this.getSegment(this._segments.length - 1);
};

Exhibit.Expression.Path.prototype.getSegmentCount = function() {
    return this._segments.length;
};

Exhibit.Expression.Path.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var rootName = this._rootName != null ? this._rootName : defaultRootName;
    
    var set = new Exhibit.Set();
    var root = roots[rootName];
    if (root instanceof Exhibit.Set) {
        set.addSet(root);
    } else {
        set.add(root);
    }
    
    return this._walkForward(set, rootValueTypes[rootName], database);
};

Exhibit.Expression.Path.prototype.evaluateBackward = function(
    value,
    valueType,
    filter,
    database
) {
    var set = new Exhibit.Set();
    set.add(value);
    
    return this._walkBackward(set, valueType, filter, database);
}

Exhibit.Expression.Path.prototype.walkForward = function(
    values,
    valueType,
    database
) {
    return this._walkForward(new Exhibit.Set(values), valueType, database);
};

Exhibit.Expression.Path.prototype.walkBackward = function(
    values,
    valueType,
    filter,
    database
) {
    return this._walkBackward(new Exhibit.Set(values), valueType, filter, database);
};

Exhibit.Expression.Path.prototype._walkForward = function(set, valueType, database) {
    for (var i = 0; i < this._segments.length; i++) {
        var segment = this._segments[i];
        if (segment.forward) {
            set = database.getObjectsUnion(set, segment.property);
            
            var property = database.getProperty(segment.property);
            valueType = property != null ? property.getValueType() : "text";
        } else {
            set = database.getSubjectsUnion(set, segment.property);
            valueType = "item";
        }
    }
    
    return {
        valueType:  valueType,
        values:     set,
        count:      set.size()
    };
};

Exhibit.Expression.Path.prototype._walkBackward = function(set, valueType, filter, database) {
    for (var i = this._segments.length - 1; i >= 0; i--) {
        var segment = this._segments[i];
        if (segment.forward) {
            set = database.getSubjectsUnion(set, segment.property, null, i == 0 ? filter : null);
            valueType = "item";
        } else {
            set = database.getObjectsUnion(set, segment.property, null, i == 0 ? filter : null);
            
            var property = database.getProperty(segment.property);
            valueType = property != null ? property.getValueType() : "text";
        }
    }
    
    return {
        valueType:  valueType,
        values:     set,
        count:      set.size()
    };
};

Exhibit.Expression.Path.prototype.rangeBackward = function(
    from,
    to,
    filter,
    database
) {
    var set = new Exhibit.Set();
    var valueType = "item";
    if (this._segments.length > 0) {
        var segment = this._segments[0];
        if (segment.forward) {
            database.getSubjectsInRange(segment.property, from, to, false, set, this._segments.length == 1 ? filter : null);
        } else {
            throw new Error("Last path of segment must be forward");
        }
                
        for (var i = this._segments.length - 1; i > 0; i--) {
            segment = this._segments[i];
            if (segment.forward) {
                set = database.getSubjectsUnion(set, segment.property, null, i == 0 ? filter : null);
                valueType = "item";
            } else {
                set = database.getObjectsUnion(set, segment.property, i == 0 ? filter : null);
                
                var property = database.getProperty(segment.property);
                valueType = property != null ? property.getValueType() : "text";
            }
        }
    }
    return {
        valueType:  valueType,
        values:     set,
        count:      set.size()
    };
};

Exhibit.Expression.Path.prototype.testExists = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return this.evaluate(roots, rootValueTypes, defaultRootName, database).count > 0;
};

/*==================================================
 *  Exhibit.Expression._Constant
 *==================================================
 */
Exhibit.Expression._Constant = function(value, valueType) {
    this._value = value;
    this._valueType = valueType;
};

Exhibit.Expression._Constant.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var set = new Exhibit.Set();
    set.add(this._value);
    
    return {
        valueType:  this._valueType,
        values:     set,
        count:      1
    };
};

/*==================================================
 *  Exhibit.Expression._Operator
 *==================================================
 */
Exhibit.Expression._Operator = function(operator, args) {
    this._operator = operator;
    this._args = args;
};

Exhibit.Expression._Operator.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var set = new Exhibit.Set();
    
    var args = [];
    for (var i = 0; i < this._args.length; i++) {
        args.push(this._args[i].evaluate(roots, rootValueTypes, defaultRootName, database));
    }
    
    var operator = Exhibit.Expression._operators[this._operator];
    var f = operator.f;
    if (operator.argumentType == "number") {
        args[0].values.visit(function(v1) {
            if (!(typeof v1 == "number")) {
                v1 = parseFloat(v1);
            }
        
            args[1].values.visit(function(v2) {
                if (!(typeof v2 == "number")) {
                    v2 = parseFloat(v2);
                }
                
                set.add(f(v1, v2));
            });
        });
    } else {
        args[0].values.visit(function(v1) {
            args[1].values.visit(function(v2) {
                set.add(f(v1, v2));
            });
        });
    }
    
    return {
        valueType:  operator.valueType,
        values:     set,
        count:      set.size()
    };
};

Exhibit.Expression._operators = {
    "+" : {
        argumentType: "number",
        valueType: "number",
        f: function(a, b) { return a + b; }
    },
    "-" : {
        argumentType: "number",
        valueType: "number",
        f: function(a, b) { return a - b; }
    },
    "*" : {
        argumentType: "number",
        valueType: "number",
        f: function(a, b) { return a * b; }
    },
    "/" : {
        argumentType: "number",
        valueType: "number",
        f: function(a, b) { return a / b; }
    },
    "=" : {
        valueType: "boolean",
        f: function(a, b) { return a == b; }
    },
    "<" : {
        argumentType: "number",
        valueType: "boolean",
        f: function(a, b) { return a < b; }
    },
    ">" : {
        argumentType: "number",
        valueType: "boolean",
        f: function(a, b) { return a > b; }
    },
    "<=" : {
        argumentType: "number",
        valueType: "boolean",
        f: function(a, b) { return a <= b; }
    },
    ">=" : {
        argumentType: "number",
        valueType: "boolean",
        f: function(a, b) { return a >= b; }
    }
}

/*==================================================
 *  Exhibit.Expression._FunctionCall
 *==================================================
 */
Exhibit.Expression._FunctionCall = function(name, args) {
    this._name = name;
    this._args = args;
};

Exhibit.Expression._FunctionCall.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var args = [];
    for (var i = 0; i < this._args.length; i++) {
        args.push(this._args[i].evaluate(roots, rootValueTypes, defaultRootName, database));
    }
    
    return Exhibit.Functions[this._name].f(args);
};

/*==================================================
 *  Exhibit.Expression._ControlCall
 *==================================================
 */
Exhibit.Expression._ControlCall = function(name, args) {
    this._name = name;
    this._args = args;
};

Exhibit.Expression._ControlCall.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var self = this;
    if (this._name == "foreach") {
        var collection = this._args[0].evaluate(roots, rootValueTypes, defaultRootName, database);
        
        var oldValue = roots["value"];
        var oldValueType = rootValueTypes["value"];
        rootValueTypes["value"] = collection.valueType;
        
        var results = new Exhibit.Set();
        var valueType = "text";
        
        collection.values.visit(function(element) {
            roots["value"] = element;
            
            var r = self._args[1].evaluate(roots, rootValueTypes, defaultRootName, database);
            valueType = r.valueType;
            results.addSet(r.values);
        });
        
        roots["value"] = oldValue;
        rootValueTypes["value"] = oldValueType;
        
        return {
            valueType:  valueType,
            values:     results,
            count:      results.size()
        };
    }
    return {
        valueType:  "text",
        values:     new Exhibit.Set(),
        count:      0
    };
};
