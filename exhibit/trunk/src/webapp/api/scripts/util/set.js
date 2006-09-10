/*==================================================
 *  Exhibit.Set
 *==================================================
 */
 
Exhibit.Set = function(a) {
    this._hash = {};
    this._count = 0;
    
    if (a instanceof Array) {
        for (var i = 0; i < a.length; i++) {
            this.add(a[i]);
        }
    }
}

Exhibit.Set.prototype.add = function(o) {
    if (!(o in this._hash)) {
        this._hash[o] = true;
        this._count++;
        return true;
    }
    return false;
}

Exhibit.Set.prototype.addSet = function(set) {
    for (o in set._hash) {
        this.add(o);
    }
}

Exhibit.Set.prototype.remove = function(o) {
    if (o in this._hash) {
        delete this._hash[o];
        this._count--;
        return true;
    }
    return false;
}

Exhibit.Set.prototype.contains = function(o) {
    return (o in this._hash);
}

Exhibit.Set.prototype.size = function() {
    return this._count;
}

Exhibit.Set.prototype.toArray = function() {
    var a = [];
    for (o in this._hash) {
        a.push(o);
    }
    return a;
}

Exhibit.Set.prototype.visit = function(f) {
    for (o in this._hash) {
        f(o);
    }
}
