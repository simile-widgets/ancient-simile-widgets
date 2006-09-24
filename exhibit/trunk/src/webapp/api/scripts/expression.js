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
            expression.rootName = s.substr(0, dotBang);
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
            expression.path.push({
                property:   property,
                forward:    dotBang == ".",
                isList:     isList
            });
        }
    }
    return expression;
};

Exhibit.Expression._Impl = function() {
    this.rootName = null;
    this.path = [];
};

Exhibit.Expression._Impl.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var count = 1;
    var set = new Exhibit.Set();
    
    var rootName = this.rootName != null ? this.rootName : defaultRootName;
    var valueType = rootValueTypes[rootName];
    set.add(roots[rootName]);
    
    for (var i = 0; i < this.path.length; i++) {
        var segment = this.path[i];
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

Exhibit.Expression._Impl.prototype.evaluateSingle = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var count = 1;
    
    var rootName = this.rootName != null ? this.rootName : defaultRootName;
    var value = roots[rootName];
    var valueType = rootValueTypes[rootName];
    
    for (var i = 0; i < this.path.length && value != null; i++) {
        var segment = this.path[i];
        if (segment.forward) {
            /* if (i == expression.path.length - 1 && segment.isList && set.size() == 1) {
                set.visit(function(value) {
                    set = database.getListProperty(value, segment.property);
                    count = set.length;
                });
            } else */ {
                value = database.getLiteralProperty(value, segment.property);
            }
            
            var property = database.getProperty(segment.property);
            valueType = property != null ? property.getValueType() : "text";
        } else {
            value = database.getInverseProperty(value, segment.property);
            valueType = "item";
        }
    }
    
    return {
        valueType:  valueType,
        value:      value
    };
};

Exhibit.Expression._Impl.prototype.testExists = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return this.evaluateSingle(roots, rootValueTypes, defaultRootName, database).value != null;
};