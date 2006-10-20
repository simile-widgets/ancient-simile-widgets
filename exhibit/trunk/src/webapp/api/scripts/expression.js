/*==================================================
 *  Exhibit.Expression
 *==================================================
 */
Exhibit.Expression = new Object();

Exhibit.Expression.parse = function(s) {
    var expression = new Exhibit.Expression._Impl();
    if (s.length > 0) {
        var dotBang = s.search(/[\.!]/);
        if (dotBang > 0) {
            expression._path.setRootName(s.substr(0, dotBang));
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
            expression._path.appendSegment(
                property,
                dotBang == ".",
                isList
            );
        }
    }
    return expression;
};

Exhibit.Expression._Impl = function() {
    this._path = new Exhibit.Expression.Path();
};

Exhibit.Expression._Impl.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return this._path.evaluate(roots, rootValueTypes, defaultRootName, database);
};

Exhibit.Expression._Impl.prototype.evaluateSingle = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return this._path.evaluateSingle(roots, rootValueTypes, defaultRootName, database);
};

Exhibit.Expression._Impl.prototype.testExists = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return this._path.testExists(roots, rootValueTypes, defaultRootName, database);
};

Exhibit.Expression._Impl.prototype.isPath = function() {
    return true;
};

Exhibit.Expression._Impl.prototype.getPath = function() {
    return this._path;
};

/*==================================================
 *  Exhibit.Expression.Path
 *==================================================
 */
Exhibit.Expression.Path = function() {
    this._rootName = null;
    this._segments = [];
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

Exhibit.Expression.Path.prototype.getSegmentCount = function() {
    return this._segments.length;
};

Exhibit.Expression.Path.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var count = 1;
    var set = new Exhibit.Set();
    
    var rootName = this._rootName != null ? this._rootName : defaultRootName;
    var valueType = rootValueTypes[rootName];
    set.add(roots[rootName]);
    
    for (var i = 0; i < this._segments.length; i++) {
        var segment = this._segments[i];
        if (segment.forward) {
            /* if (i == expression.path.length - 1 && segment.isList && set.size() == 1) {
                set.visit(function(value) {
                    set = database.getListProperty(value, segment.property);
                    count = set.length;
                });
            } else */ {
                set = database.getObjectsUnion(set, segment.property);
                count = set.size();
            }
            
            var property = database.getProperty(segment.property);
            valueType = property != null ? property.getValueType() : "text";
        } else {
            set = database.getSubjectsUnion(set, segment.property);
            count = set.size();
            valueType = "item";
        }
    }
    
    return {
        valueType:  valueType,
        values:     set,
        count:      count
    };
};

Exhibit.Expression.Path.prototype.evaluateSingle = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var count = 1;
    
    var rootName = this._rootName != null ? this._rootName : defaultRootName;
    var value = roots[rootName];
    var valueType = rootValueTypes[rootName];
    
    for (var i = 0; i < this._segments.length && value != null; i++) {
        var segment = this._segments[i];
        if (segment.forward) {
            /* if (i == expression.path.length - 1 && segment.isList && set.size() == 1) {
                set.visit(function(value) {
                    set = database.getListProperty(value, segment.property);
                    count = set.length;
                });
            } else */ {
                value = database.getObject(value, segment.property);
            }
            
            var property = database.getProperty(segment.property);
            valueType = property != null ? property.getValueType() : "text";
        } else {
            value = database.getSubject(value, segment.property);
            valueType = "item";
        }
    }
    
    return {
        valueType:  valueType,
        value:      value
    };
};

Exhibit.Expression.Path.prototype.testExists = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return this.evaluateSingle(roots, rootValueTypes, defaultRootName, database).value != null;
};

