/*==================================================
 *  Exhibit.OrderedDictionary
 *==================================================
 */
 
 
//=============================================================================
// OrderedDictionary functionality
//=============================================================================
 

Exhibit.OrderedDictionary = function() {
    this._values = {};
    this._keyOrder = [];
}

Exhibit.OrderedDictionary.prototype.put = function(key, val) {
    if (!val) { throw new TypeError() }
    if (!this._values[key]) {
        this._keyOrder.push(key); // only add to _keyOrder if key is a new key
    }
    this._values[key] = val;
}

Exhibit.OrderedDictionary.prototype.get = function(key, alt) {
    if (!this._values[key] && alt) {
        this.put(key, alt);
    }
    return this._values[key];
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
// Javascript 1.6 extensions
//=============================================================================


if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };
}


if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };
}


//=============================================================================
// Testing code
//=============================================================================


Exhibit.OrderedDictionary.test = function() {
    function assert(is, expected) {
        if (is != expected) { throw new Error("expected " + expected + ", is " + is) }
    }
    
    var dict = new Exhibit.OrderedDictionary();
    
    assert(dict.get('test'), null);
    assert(dict.values().length, 0);
    
    dict.put('foo', 'bar');
    dict.get('default', 'default value');
    dict.put('foo', 'baz')
    
    assert(dict.get('foo'), 'baz');
    assert(dict.get('default'), 'default value');
    
    var vals = dict.values();
    
    assert(vals.length, 2);
    assert(vals[0], 'baz');
    assert(vals[1], 'default value');
    
    dict.remove('foo');
    
    vals = dict.values();
    
    assert(vals.length, 1);
    assert(vals[0], 'default value')
    
}
