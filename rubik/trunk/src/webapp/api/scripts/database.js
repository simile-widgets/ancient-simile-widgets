/*==================================================
 *  Rubik.Database
 *==================================================
 */
Rubik.Database = function() {
    this._types = {};
    this._properties = {};
    this._propertyArray = {};
    
    this._listeners = new SimileAjax.ListenerQueue();
    
    this._spo = {};
    this._ops = {};
    this._listpso = {};
    this._items = new Rubik.Set();
    
    /*
     *  Predefined types and properties
     */
    
    var itemType = new Rubik.Database._Type("Item");
    itemType._uri = "http://simile.mit.edu/rubik/type#Item";
    itemType._label = "Item";
    itemType._pluralLabel = "Items";
    this._types["Item"] = itemType;
    
    var labelProperty = new Rubik.Database._Property("label");
    labelProperty._uri = "http://www.w3.org/2000/01/rdf-schema#label";
    labelProperty._valueType = "text";
    labelProperty._label = "label";
    labelProperty._pluralLabel = "labels";
    labelProperty._reverseLabel = "label of";
    labelProperty._reversePluralLabel = "labels of";
    labelProperty._groupingLabel = "labels";
    labelProperty._reverseGroupingLabel = "things being labelled";
    this._properties["label"] = labelProperty;
    
    var typeProperty = new Rubik.Database._Property("type");
    typeProperty._uri = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    typeProperty._valueType = "text";
    typeProperty._label = "type";
    typeProperty._pluralLabel = "types";
    typeProperty._reverseLabel = "type of";
    typeProperty._reversePluralLabel = "types of";
    typeProperty._groupingLabel = "types";
    typeProperty._reverseGroupingLabel = "things of these types";
    this._properties["type"] = typeProperty;
    
    var uriProperty = new Rubik.Database._Property("uri");
    uriProperty._uri = "http://simile.mit.edu/rubik/property#uri";
    uriProperty._valueType = "url";
    uriProperty._label = "URI";
    uriProperty._pluralLabel = "URIs";
    uriProperty._reverseLabel = "URI of";
    uriProperty._reversePluralLabel = "URIs of";
    uriProperty._groupingLabel = "URIs";
    uriProperty._reverseGroupingLabel = "things named by these URIs";
    this._properties["uri"] = uriProperty;
};

Rubik.Database.prototype.addListener = function(listener) {
    this._listeners.add(listener);
};

Rubik.Database.prototype.removeListener = function(listener) {
    this._listeners.remove(listener);
};

Rubik.Database.prototype.loadTypes = function(typeEntries, baseURI) {
    this._listeners.fire("onBeforeLoadingTypes", []);
    try {
        var lastChar = baseURI.substr(baseURI.length - 1)
        if (lastChar == "#") {
            baseURI = baseURI.substr(0, baseURI.length - 1) + "/";
        } else if (lastChar != "/" && lastChar != ":") {
            baseURI += "/";
        }
    
        var spo = this._spo;
        var ops = this._ops;
        var indexPut = Rubik.Database._indexPut;
        var indexTriple = function(s, p, o) {
            indexPut(spo, s, p, o);
            indexPut(ops, o, p, s);
        };
        
        for (typeID in typeEntries) {
            var typeEntry = typeEntries[typeID];
            
            var type;
            if (typeID in this._types) {
                type = this._types[typeID];
            } else {
                type = new Rubik.Database._Type(typeID);
                this._types[typeID] = type;
            };
            
            type._uri = ("uri" in typeEntry) ? 
                typeEntry.uri : 
                (baseURI + "type#" + encodeURIComponent(typeID));
            type._label = ("label" in typeEntry) ? 
                typeEntry.label : 
                typeID;
            type._pluralLabel = ("pluralLabel" in typeEntry) ? 
                typeEntry.pluralLabel : 
                type._label;
        }
        
        this._listeners.fire("onAfterLoadingTypes", []);
    } catch(e) {
        this._listeners.fire("onFailedLoadingTypes", []);
        throw e;
    }
};

Rubik.Database.prototype.loadProperties = function(propertyEntries, baseURI) {
    this._listeners.fire("onBeforeLoadingProperties", []);
    try {
        var lastChar = baseURI.substr(baseURI.length - 1)
        if (lastChar == "#") {
            baseURI = baseURI.substr(0, baseURI.length - 1) + "/";
        } else if (lastChar != "/" && lastChar != ":") {
            baseURI += "/";
        }
    
        for (propertyID in propertyEntries) {
            var propertyEntry = propertyEntries[propertyID];
            
            var property;
            if (propertyID in this._properties) {
                property = this._properties[propertyID];
            } else {
                property = new Rubik.Database._Property(propertyID);
                this._properties[propertyID] = property;
            };
            
            property._uri = ("uri" in propertyEntry) ? propertyEntry.uri : (baseURI + "property#" + encodeURIComponent(propertyID));
            property._valueType = ("valueType" in propertyEntry) ? propertyEntry.valueType : "text";
                // text, number, date, boolean, item
            
            property._label = ("label" in propertyEntry) ? propertyEntry.label : propertyID;
            property._pluralLabel = ("pluralLabel" in propertyEntry) ? propertyEntry.pluralLabel : property._label;
            
            property._reverseLabel = ("reverseLabel" in propertyEntry) ? propertyEntry.reverseLabel : ("!" + property._label);
            property._reversePluralLabel = ("reversePluralLabel" in propertyEntry) ? propertyEntry.reversePluralLabel : ("!" + property._pluralLabel);
            
            property._groupingLabel = ("groupingLabel" in propertyEntry) ? propertyEntry.groupingLabel : property._label;
            property._reverseGroupingLabel = ("reverseGroupingLabel" in propertyEntry) ? propertyEntry.reverseGroupingLabel : property._reverseLabel;
        }
        this._propertyArray = null;
        
        this._listeners.fire("onAfterLoadingProperties", []);
    } catch(e) {
        this._listeners.fire("onFailedLoadingProperties", []);
        throw e;
    }
};

Rubik.Database.prototype.loadItems = function(itemEntries, baseURI) {
    this._listeners.fire("onBeforeLoadingItems", []);
    try {
        var lastChar = baseURI.substr(baseURI.length - 1);
        if (lastChar == "#") {
            baseURI = baseURI.substr(0, baseURI.length - 1) + "/";
        } else if (lastChar != "/" && lastChar != ":") {
            baseURI += "/";
        }
        
        var spo = this._spo;
        var ops = this._ops;
        var indexPut = Rubik.Database._indexPut;
        var indexTriple = function(s, p, o) {
            indexPut(spo, s, p, o);
            indexPut(ops, o, p, s);
        };
        
        for (var i = 0; i < itemEntries.length; i++) {
            var itemEntry = itemEntries[i];
            if (!("label" in itemEntry)) {
                SimileAjax.Debug.warn("Item entry has no label", itemEntry);
            } else {
                this._loadItem(itemEntry, indexTriple, baseURI);
            }
        }
        
        this._propertyArray = null;
        
        this._listeners.fire("onAfterLoadingItems", []);
    } catch(e) {
        this._listeners.fire("onFailedLoadingItems", []);
        throw e;
    }
};

Rubik.Database.prototype.getType = function(typeID) {
    return this._types[typeID];
};

Rubik.Database.prototype.getProperty = function(propertyID) {
    return this._properties[propertyID];
};

Rubik.Database.prototype.getAllItems = function() {
    var items = new Rubik.Set();
    items.addSet(this._items);
    
    return items;
};

Rubik.Database.prototype.getAllProperties = function() {
    if (this._propertyArray == null) {
        this._propertyArray = [];
        for (propertyID in this._properties) {
            this._propertyArray.push(propertyID);
        }
    }
    
    return [].concat(this._propertyArray);
};

Rubik.Database.prototype._loadItem = function(itemEntry, indexFunction, baseURI) {
    var label = itemEntry.label;
    var id = ("id" in itemEntry) ? itemEntry.id : label;
    var uri = ("uri" in itemEntry) ? itemEntry.uri : (baseURI + "item#" + encodeURIComponent(id));
    var type = ("type" in itemEntry) ? itemEntry.type : "Item";
    
    this._items.add(id);
    
    indexFunction(id, "uri", uri);
    indexFunction(id, "label", label);
    indexFunction(id, "type", type);
    
    this._ensureTypeExists(type, baseURI);
    
    for (p in itemEntry) {
        if (p != "uri" && p != "label" && p != "id" && p != "type") {
            this._ensurePropertyExists(p, baseURI);
            
            var v = itemEntry[p];
            if (v instanceof Array) {
                //Rubik.Database._indexPutList(this._listpso, p, id, v);
                
                for (var j = 0; j < v.length; j++) {
                    indexFunction(id, p, v[j]);
                }
            } else {
                indexFunction(id, p, v);
            }
        }
    }
};

Rubik.Database.prototype.getProperty = function(propertyID) {
    return this._properties[propertyID];
};

Rubik.Database.prototype._ensureTypeExists = function(typeID, baseURI) {
    if (!(typeID in this._types)) {
        var type = new Rubik.Database._Type(typeID);
        
        type._uri = baseURI + "type#" + encodeURIComponent(typeID);
        type._label = typeID;
        type._pluralLabel = type._label;
        
        this._types[typeID] = type;
    }
};

Rubik.Database.prototype._ensurePropertyExists = function(propertyID, baseURI) {
    if (!(propertyID in this._properties)) {
        var property = new Rubik.Database._Property(propertyID);
        
        property._uri = baseURI + "property#" + encodeURIComponent(propertyID);
        property._valueType = "text";
        
        property._label = propertyID;
        property._pluralLabel = property._label;
        
        property._reverseLabel = "!" + property._label;
        property._reversePluralLabel = "!" + property._pluralLabel;
        
        property._groupingLabel = property._label;
        property._reverseGroupingLabel = property._reverseLabel;
        
        this._properties[propertyID] = property;
    }
};

Rubik.Database._indexPut = function(index, x, y, z) {
    var hash = index[x];
    if (!hash) {
        hash = {};
        index[x] = hash;
    }
    
    var array = hash[y];
    if (!array) {
        array = new Array();
        hash[y] = array;
    } else {
        for (var i = 0; i < array.length; i++) {
            if (z == array[i]) {
                return;
            }
        }
    }
    array.push(z);
};

Rubik.Database._indexPutList = function(index, x, y, list) {
    var hash = index[x];
    if (!hash) {
        hash = {};
        index[x] = hash;
    }
    
    var array = hash[y];
    if (!array) {
        hash[y] = list;
    } else {
        hash[y] = hash[y].concat(list);
    }
};

Rubik.Database.prototype._indexFillSet = function(index, x, y, set, filter) {
    var hash = index[x];
    if (hash) {
        var array = hash[y];
        if (array) {
            if (filter) {
                for (var i = 0; i < array.length; i++) {
                    var z = array[i];
                    if (filter.contains(z)) {
                        set.add(z);
                    }
                }
            } else {
                for (var i = 0; i < array.length; i++) {
                    set.add(array[i]);
                }
            }
        }
    }
};

Rubik.Database.prototype._indexCountDistinct = function(index, x, y, filter) {
    var count = 0;
    var hash = index[x];
    if (hash) {
        var array = hash[y];
        if (array) {
            if (filter) {
                for (var i = 0; i < array.length; i++) {
                    if (filter.contains(array[i])) {
                        count++;
                    }
                }
            } else {
                count = array.length;
            }
        }
    }
    return count;
};

Rubik.Database.prototype._get = function(index, x, y, set, filter) {
    if (!set) {
        set = new Rubik.Set();
    }
    this._indexFillSet(index, x, y, set, filter);
    return set;
};

Rubik.Database.prototype._getUnion = function(index, xSet, y, set, filter) {
    if (!set) {
        set = new Rubik.Set();
    }
    
    var database = this;
    xSet.visit(function(x) {
        database._indexFillSet(index, x, y, set, filter);
    });
    return set;
};

Rubik.Database.prototype._countDistinctUnion = function(index, xSet, y, filter) {
    var count = 0;
    var database = this;
    xSet.visit(function(x) {
        count += database._indexCountDistinct(index, x, y, filter);
    });
    return count;
};

Rubik.Database.prototype._countDistinct = function(index, x, y, filter) {
    return this._indexCountDistinct(index, x, y, filter);
};

Rubik.Database.prototype.getObjects = function(s, p, set, filter) {
    return this._get(this._spo, s, p, set, filter);
};

Rubik.Database.prototype.countDistinctObjects = function(s, p, filter) {
    return this._countDistinct(this._spo, s, p, filter);
};

Rubik.Database.prototype.getObjectsUnion = function(subjects, p, set, filter) {
    return this._getUnion(this._spo, subjects, p, set, filter);
};

Rubik.Database.prototype.countDistinctObjectsUnion = function(subjects, p, filter) {
    return this._countDistinctUnion(this._spo, subjects, p, filter);
};

Rubik.Database.prototype.getSubjects = function(o, p, set, filter) {
    return this._get(this._ops, o, p, set, filter);
};

Rubik.Database.prototype.countDistinctSubjects = function(o, p, filter) {
    return this._countDistinct(this._ops, o, p, filter);
};

Rubik.Database.prototype.getSubjectsUnion = function(objects, p, set, filter) {
    return this._getUnion(this._ops, objects, p, set, filter);
};

Rubik.Database.prototype.countDistinctSubjectsUnion = function(objects, p, filter) {
    return this._countDistinctUnion(this._ops, objects, p, filter);
};

Rubik.Database.prototype.getLiteralProperty = function(s, p) {
    var hash = this._spo[s];
    if (hash) {
        var array = hash[p];
        if (array) {
            return array[0];
        }
    }
    return null;
};

Rubik.Database.prototype.getInverseProperty = function(o, p) {
    var hash = this._ops[o];
    if (hash) {
        var array = hash[p];
        if (array) {
            return array[0];
        }
    }
    return null;
};

Rubik.Database.prototype.getListProperty = function(s, p) {
    var hash = this._listpso[p];
    if (hash) {
        return hash[s];
    }
    return null;
};

Rubik.Database.prototype.getTypeLabels = function(set) {
    var typeIDSet = this.getObjectsUnion(set, "type", null, null);
    var labels = [];
    var pluralLabels = [];
    
    var database = this;
    typeIDSet.visit(function(typeID) {
        var type = database.getType(typeID);
        if (type != null) {
            labels.push(type.getLabel());
            pluralLabels.push(type.getPluralLabel());
        }
    });
    
    return [ labels, pluralLabels ];
};

/*==================================================
 *  Rubik.Database._Type
 *==================================================
 */
Rubik.Database._Type = function(id) {
    this._id = id;
};

Rubik.Database._Type.prototype = {
    getID:          function() { return this._id; },
    getURI:         function() { return this._uri; },
    getLabel:       function() { return this._label; },
    getPluralLabel: function() { return this._pluralLabel; },
    getSuperTypeID: function() { return this._superTypeID; }
};

/*==================================================
 *  Rubik.Database._Property
 *==================================================
 */
Rubik.Database._Property = function(id) {
    this._id = id;
};

Rubik.Database._Property.prototype = {
    getID:          function() { return this._id; },
    getURI:         function() { return this._uri; },
    getValueType:   function() { return this._valueType; },
    
    getLabel:               function() { return this._label; },
    getPluralLabel:         function() { return this._pluralLabel; },
    getReverseLabel:        function() { return this._reverseLabel; },
    getReversePluralLabel:  function() { return this._reversePluralLabel; },
    getGroupingLabel:       function() { return this._groupingLabel; },
    getGroupingPluralLabel: function() { return this._groupingPluralLabel; }
};
