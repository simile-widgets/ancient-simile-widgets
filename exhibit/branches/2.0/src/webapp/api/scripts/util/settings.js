/*==================================================
 *  Exhibit.SettingsUtilities
 *
 *  Utilities for various parts of Exhibit to 
 *  collect their settings.
 *==================================================
 */
Exhibit.SettingsUtilities = new Object();

/*--------------------------------------------------
 *  Static settings
 *--------------------------------------------------
 */
Exhibit.SettingsUtilities.collectSettings = function(config, specs, settings) {
    Exhibit.SettingsUtilities._internalCollectSettings(
        function(field) { return config[field]; },
        specs,
        settings
    );
};

Exhibit.SettingsUtilities.collectSettingsFromDOM = function(configElmt, specs, settings) {
    Exhibit.SettingsUtilities._internalCollectSettings(
        function(field) { return Exhibit.getAttribute(configElmt, field); },
        specs,
        settings
    );
};

Exhibit.SettingsUtilities._internalCollectSettings = function(f, specs, settings) {
    for (var field in specs) {
        var spec = specs[field];
        
        var name = field;
        if ("name" in spec) {
            name = spec.name;
        }
        
        if (!(name in settings) && "defaultValue" in spec) {
            settings[name] = spec.defaultValue;
        }
        
        var value = f(field);
        if (value == null) {
            continue;
        }
        value = value.trim();
        if (value.length == 0) {
            continue;
        }
        
        var type = "text";
        if ("type" in spec) {
            type = spec.type;
        }
        
        var dimensions = 1;
        if ("dimensions" in spec) {
            dimensions = spec.dimensions;
        }
        
        try {
            if (dimensions > 1) {
                var separator = ",";
                if ("separator" in spec) {
                    separator = spec.separator;
                }
                
                var a = value.split(separator);
                if (a.length != dimensions) {
                    throw new Error("Expected a tuple of " + dimensions + " dimensions separated with " + separator + " but got " + value);
                } else {
                    for (var i = 0; i < a.length; i++) {
                        a[i] = Exhibit.SettingsUtilities._parseSetting(a[i].trim(), type, spec);
                    }
                    
                    settings[name] = a;
                }
            } else {
                settings[name] = Exhibit.SettingsUtilities._parseSetting(value, type, spec);
            }
        } catch (e) {
            SimileAjax.Debug.exception(e);
        }
    }
};

Exhibit.SettingsUtilities._parseSetting = function(s, type, spec) {
    if (type == "text") {
        return s;
    } else if (type == "float") {
        var f = parseFloat(s);
        if (isNaN(f)) {
            throw new Error("Expected a floating point number but got " + s);
        } else {
            return f;
        }
    } else if (type == "int") {
        var n = parseInt(s);
        if (isNaN(n)) {
            throw new Error("Expected an integer but got " + s);
        } else {
            return n;
        }
    } else if (type == "boolean") {
        s = s.toLowerCase();
        if (s == "true") {
            return true;
        } else if (s == "false") {
            return false;
        } else {
            throw new Error("Expected either 'true' or 'false' but got " + s);
        }
    } else if (type == "function") {
        try {
            if (typeof s == "string") {
                s = eval(s);
            }
            if (typeof s == "function") {
                return s;
            }
        } catch (e) {
            // silent
        }
        
        throw new Error("Expected a function or the name of a function but got " + s);
    } else if (type == "enum") {
        var choices = spec.choices;
        for (var i = 0; i < choices.length; i++) {
            if (choices[i] == s) {
                return s;
            }
        }
        throw new Error("Expected one of " + choices.join(", ") + " but got " + s);
    } else {
        throw new Error("Unknown setting type " + type);
    }
};

/*--------------------------------------------------
 *  Accessors
 *--------------------------------------------------
 */
Exhibit.SettingsUtilities.createAccessors = function(config, specs, accessors) {
    Exhibit.SettingsUtilities._internalCreateAccessors(
        function(field) { return config[field]; },
        specs,
        accessors
    );
};

Exhibit.SettingsUtilities.createAccessorsFromDOM = function(configElmt, specs, accessors) {
    Exhibit.SettingsUtilities._internalCreateAccessors(
        function(field) { return Exhibit.getAttribute(configElmt, field); },
        specs,
        accessors
    );
};

Exhibit.SettingsUtilities._internalCreateAccessors = function(f, specs, accessors) {
    for (var field in specs) {
        var spec = specs[field];
        var accessorName = spec.accessorName;
        var accessor = null;
        var isTuple = false;
        
        var createOneAccessor = function(spec2) {
            isTuple = false;
            if ("bindings" in spec2) {
                return Exhibit.SettingsUtilities._createBindingsAccessor(f, spec2.bindings);
            } else if ("bindingNames" in spec2) {
                isTuple = true;
                return Exhibit.SettingsUtilities._createTupleAccessor(f, spec2);
            } else {
                return Exhibit.SettingsUtilities._createElementalAccessor(f, spec2);
            }
        };
        
        if ("alternatives" in spec) {
            var alternatives = spec.alternatives;
            for (var i = 0; i < alternatives.length; i++) {
                accessor = createOneAccessor(alternatives[i]);
                if (accessor != null) {
                    break;
                }
            }
        } else {
            accessor = createOneAccessor(spec);
        }
        
        if (accessor != null) {
            if (isTuple) {
                accessors[accessorName] = function(value, database, visitor) {
                    accessor(value, database, visitor, {});
                };
            } else {
                accessors[accessorName] = accessor;
            }
        } else if (!(accessorName in accessors)) {
            accessors[accessorName] = function(value, database, visitor) {};
        }
    }
};

Exhibit.SettingsUtilities._createBindingsAccessor = function(f, bindingSpecs) {
    var bindings = [];
    for (var i = 0; i < bindingSpecs.length; i++) {
        var bindingSpec = bindingSpecs[i];
        var accessor = null;
        var isTuple = false;
        
        if ("bindingNames" in bindingSpec) {
            isTuple = true;
            accessor = Exhibit.SettingsUtilities._createTupleAccessor(f, bindingSpec);
        } else {
            accessor = Exhibit.SettingsUtilities._createElementalAccessor(f, bindingSpec);
        }
        
        if (accessor == null) {
            if (!("optional" in bindingSpec) || !bindingSpec.optional) {
                return null;
            }
        } else {
            bindings.push({
                bindingName:    bindingSpec.bindingName, 
                accessor:       accessor, 
                isTuple:        isTuple
            });
        }
    }
    
    return function(value, database, visitor) {
        Exhibit.SettingsUtilities._evaluateBindings(value, database, visitor, bindings);
    };
};

Exhibit.SettingsUtilities._createTupleAccessor = function(f, spec) {
    var value = f(spec.attributeName);
    if (value == null) {
        return null;
    }
    value = value.trim();
    if (value.length == 0) {
        return null;
    }
    
    try {
        var expression = Exhibit.Expression.parse(value);
        
        var parsers = [];
        var bindingTypes = spec.types;
        for (var i = 0; i < bindingTypes.length; i++) {
            parsers.push(Exhibit.SettingsUtilities._typeToParser(bindingTypes[i]));
        }
        
        var bindingNames = spec.bindingNames;
        var separator = ",";
        if ("separator" in spec) {
            separator = spec.separator;
        }
        
        return function(itemID, database, visitor, tuple) {
            expression.evaluateOnItem(itemID, database).values.visit(
                function(v) { 
                    var a = v.split(separator);
                    if (a.length == parsers.length) {
                        for (var i = 0; i < bindingNames.length; i++) {
                            tuple[bindingNames[i]] = null;
                            parsers[i](a[i], function(v) { tuple[bindingNames[i]] = v; });
                        }
                        visitor(tuple);
                    }
                }
            );
        };
    } catch (e) {
        SimileAjax.Debug.exception(e);
        return null;
    }
};

Exhibit.SettingsUtilities._createElementalAccessor = function(f, spec) {
    var value = f(spec.attributeName);
    if (value == null) {
        return null;
    }
    value = value.trim();
    if (value.length == 0) {
        return null;
    }
    
    var bindingType = "text";
    if ("type" in spec) {
        bindingType = spec.type;
    }
    
    try {
        var expression = Exhibit.Expression.parse(value);
        
        var parser = Exhibit.SettingsUtilities._typeToParser(bindingType);
        
        return function(itemID, database, visitor) {
            expression.evaluateOnItem(itemID, database).values.visit(
                function(v) { return parser(v, visitor); }
            );
        };
    } catch (e) {
        SimileAjax.Debug.exception(e);
        return null;
    }
}

Exhibit.SettingsUtilities._typeToParser = function(type) {
    switch (type) {
    case "text":    return Exhibit.SettingsUtilities._textParser;
    case "float":   return Exhibit.SettingsUtilities._floatParser;
    case "int":     return Exhibit.SettingsUtilities._intParser;
    case "date":    return Exhibit.SettingsUtilities._dateParser;
    case "boolean": return Exhibit.SettingsUtilities._booleanParser;
    default:
        throw new Error("Unknown setting type " + type);
    }
}

Exhibit.SettingsUtilities._textParser = function(v, f) {
    return f(v);
};

Exhibit.SettingsUtilities._floatParser = function(v, f) {
    var n = parseFloat(v);
    if (!isNaN(n)) {
        return f(n);
    }
    return false;
};

Exhibit.SettingsUtilities._intParser = function(v, f) {
    var n = parseInt(v);
    if (!isNaN(n)) {
        return f(n);
    }
    return false;
};

Exhibit.SettingsUtilities._dateParser = function(v, f) {
    if (v instanceof Date) {
        return f(v);
    } else if (typeof v == "number") {
        var d = new Date(0);
        d.setUTCFullYear(v);
        return f(d);
    } else {console.log(v);
        var d = SimileAjax.DateTime.parseIso8601DateTime(v.toString());
        if (d != null) {
            return f(d);
        }
    }
    return false;
};

Exhibit.SettingsUtilities._booleanParser = function(v, f) {
    v = v.toString().toLowerCase();
    if (v == "true") {
        return f(true);
    } else if (v == "false") {
        return f(false);
    }
    return false;
};

Exhibit.SettingsUtilities._evaluateBindings = function(value, database, visitor, bindings) {
    var maxIndex = bindings.length - 1;
    var f = function(tuple, index) {
        var binding = bindings[index];
        var visited = false;
        
        var recurse = index == maxIndex ? function() { visitor(tuple); } : function() { f(tuple, index + 1); };
        if (binding.isTuple) {
            binding.accessor(
                value, 
                database, 
                function() { visited = true; recurse(); }, 
                tuple
            );
        } else {
            var bindingName = binding.bindingName;
            binding.accessor(
                value, 
                database, 
                function(v) { visited = true; tuple[bindingName] = v; recurse(); }
            );
        }
        
        if (!visited) { recurse(); }
    };
    f({}, 0);
};
