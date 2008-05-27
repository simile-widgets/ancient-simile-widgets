/*==================================================
 *  Exhibit.OrderedDictionary
 *==================================================
 */

Exhibit.OrderedDictionary = function() {
    this._values = {};
    this._keyOrder = [];
}

Exhibit.OrderedDictionary.prototype.size = function() {
    return this._keyOrder.length;
}

Exhibit.OrderedDictionary.prototype.put = function(key, val) {
    if (!key || !val) { throw new TypeError() }
    if (!this._values[key]) {
        this._keyOrder.push(key); // only add to _keyOrder if key is new
    }
    this._values[key] = val;
}

Exhibit.OrderedDictionary.prototype.get = function(key, alt) {
    if (!this._values[key] && alt) {
        this.put(key, alt);
    }
    return this._values[key];
}

Exhibit.OrderedDictionary.prototype.rekey = function(old, newKey) {
    var i = this._keyOrder.indexOf(old);
    if (i == -1) { throw new Error("Cannot find key " + old) }

    this._keyOrder[i] = newKey;
    var val = this._values[old];
    delete this._values[old];
    this._values[newKey] = val;
}

Exhibit.OrderedDictionary.prototype.values = function() {
    return this._keyOrder.map(this.get, this);
}

Exhibit.OrderedDictionary.prototype.remove = function(key) {
    function not(val) { return function(x) { return x != val } }
    var val = this.get(key);
    if (val) {
        delete this._values[key];
        this._keyOrder = this._keyOrder.filter(not(key));
        return val;
    }
}


//=============================================================================
// Testing code
//=============================================================================


Exhibit.OrderedDictionary.test = function() {
    function assert(is, expected) {
        if (is != expected) { 
            throw new Error("expected " + expected + ", is " + is) 
        }
    }
    
    var dict = new Exhibit.OrderedDictionary();
    
    assert(dict.get('test'), null);
    assert(dict.size(), 0);
    assert(dict.values().length, 0);
    
    dict.put('foo', 'bar');
    dict.get('default', 'default value');
    dict.put('foo', 'baz')
    
    assert(dict.get('foo'), 'baz');
    assert(dict.get('default'), 'default value');
    
    var vals = dict.values();
    
    assert(dict.size(), 2);
    assert(vals.length, 2);
    assert(vals[0], 'baz');
    assert(vals[1], 'default value');
    
    dict.remove('foo');
    
    vals = dict.values();
    
    assert(vals.length, 1);
    assert(vals[0], 'default value');
    
    dict.rekey('foo', 'new key');
    assert(dict.get('new key'), 'default value');
}
