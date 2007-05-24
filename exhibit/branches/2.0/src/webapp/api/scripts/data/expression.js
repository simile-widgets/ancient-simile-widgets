/*==================================================
 *  Exhibit.Expression
 *  http://simile.mit.edu/wiki/Exhibit/API/Expression
 *==================================================
 */
Exhibit.Expression = new Object();

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

Exhibit.Expression.Path.prototype.appendSegment = function(property, hopOperator) {
    this._segments.push({
        property:   property,
        forward:    hopOperator.charAt(0) == ".",
        isArray:    hopOperator.length > 1
    });
};

Exhibit.Expression.Path.prototype.getSegment = function(index) {
    if (index < this._segments.length) {
        var segment = this._segments[index];
        return {
            property:   segment.property,
            forward:    segment.forward,
            isArray:    segment.isArray
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
    
    if (this._name in Exhibit.Functions) {
        return Exhibit.Functions[this._name].f(args);
    } else {
        throw new Error("No such function named " + this._name);
    }
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
