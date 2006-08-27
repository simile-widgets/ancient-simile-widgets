/*==================================================
 *  Set
 *==================================================
 */
 
Rubik.Set = function(a) {
    this._hash = {};
    this._count = 0;
    
    if (a instanceof Array) {
        for (var i = 0; i < a.length; i++) {
            this.add(a[i]);
        }
    }
}

Rubik.Set.prototype.add = function(o) {
    if (!(o in this._hash)) {
        this._hash[o] = true;
        this._count++;
        return true;
    }
    return false;
}

Rubik.Set.prototype.addSet = function(set) {
    for (o in set._hash) {
        this.add(o);
    }
}

Rubik.Set.prototype.remove = function(o) {
    if (o in this._hash) {
        delete this._hash[o];
        this._count--;
        return true;
    }
    return false;
}

Rubik.Set.prototype.contains = function(o) {
    return (o in this._hash);
}

Rubik.Set.prototype.size = function() {
    return this._count;
}

Rubik.Set.prototype.toArray = function() {
    var a = [];
    for (o in this._hash) {
        a.push(o);
    }
    return a;
}

Rubik.Set.prototype.visit = function(f) {
    for (o in this._hash) {
        f(o);
    }
}
