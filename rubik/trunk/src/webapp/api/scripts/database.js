/*==================================================
 *  Rubik.Database
 *==================================================
 */
Rubik.Database = function() {
    this._spo = {};
    this._ops = {};
    this._items = new Rubik.Set();
    this._listeners = [];
};


Rubik.Database.prototype.addListener = function(listener) {
    this._listeners.push(listener);
};

Rubik.Database.prototype.removeListener = function(listener) {
    var listeners = this._listeners;
    for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] == listener) {
            listeners.splice(i, 1);
            break;
        }
    }
};

Rubik.Database.prototype._fire = function(handlerName, args) {
    var listeners = [].concat(this._listeners);
    for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        if (handlerName in listener) {
            try {
                listener[handlerName].apply(listener, args);
            } catch (e) {
                SimileAjax.Debug.exception(e);
            }
        }
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

Rubik.Database.prototype.loadItems = function(items, url) {
    var spo = this._spo;
    var ops = this._ops;
    var indexPut = Rubik.Database._indexPut;
    var indexTriple = function(s, p, o) {
        indexPut(spo, s, p, o);
        indexPut(ops, o, p, s);
    };
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var label = item.label;
        var id = ("id" in item) ? item.id : label;
        var uri = ("uri" in item) ? item.uri : (url + "item#" + id);
        
        this._items.add(id);
        
        indexTriple(id, "label", label);
        for (p in item) {
            var v = item[p];
            if (v instanceof Array) {
                for (var j = 0; j < v.length; j++) {
                    indexTriple(id, p, v[j]);
                }
            } else if (p != "uri" && p != "label" && p != "id") {
                indexTriple(id, p, v);
            }
        }
    }
    
    this._fire("onLoadItems", []);
}

Rubik.Database.prototype.getItems = function() {
    return this._items;
}

Rubik.Database.prototype._get = function(index, x, y, set, filter) {
    if (!set) {
        set = new Rubik.Set();
    }
    this._indexFillSet(index, x, y, set, filter);
    return set;
}

Rubik.Database.prototype._getUnion = function(index, xSet, y, set, filter) {
    if (!set) {
        set = new Rubik.Set();
    }
    
    var database = this;
    xSet.visit(function(x) {
        database._indexFillSet(index, x, y, set, filter);
    });
    return set;
}

Rubik.Database.prototype._countDistinctUnion = function(index, xSet, y, filter) {
    var count = 0;
    var database = this;
    xSet.visit(function(x) {
        count += database._indexCountDistinct(index, x, y, filter);
    });
    return count;
}

Rubik.Database.prototype._countDistinct = function(index, x, y, filter) {
    return this._indexCountDistinct(index, x, y, filter);
}

Rubik.Database.prototype.getObjects = function(s, p, set, filter) {
    return this._get(this._spo, s, p, set, filter);
}

Rubik.Database.prototype.countDistinctObjects = function(s, p, set, filter) {
    return this._countDistinct(this._spo, s, p, filter);
}

Rubik.Database.prototype.getObjectsUnion = function(subjects, p, set, filter) {
    return this._getUnion(this._spo, subjects, p, set, filter);
}

Rubik.Database.prototype.countDistinctObjectsUnion = function(subjects, p, filter) {
    return this._countDistinctUnion(this._spo, subjects, p, filter);
}

Rubik.Database.prototype.getSubjects = function(o, p, set, filter) {
    return this._get(this._ops, o, p, set, filter);
}

Rubik.Database.prototype.countDistinctSubjects = function(o, p, set, filter) {
    return this._countDistinct(this._ops, o, p, filter);
}

Rubik.Database.prototype.getSubjectsUnion = function(objects, p, set, filter) {
    return this._getUnion(this._ops, objects, p, set, filter);
}

Rubik.Database.prototype.countDistinctSubjectsUnion = function(objects, p, filter) {
    return this._countDistinctUnion(this._ops, objects, p, filter);
}

Rubik.Database.prototype.getLiteralProperty = function(s, p) {
    var hash = this._spo[s];
    if (hash) {
        var array = hash[p];
        if (array) {
            return array[0];
        }
    }
    return null;
}
