if (Codework == undefined) var Codework = function () {};

/**
 * @property {Number} methodId The id of the method.
 */
Codework.Method = function (associated_with, code, arity) {
	/** @type Object */		this._associated_with = associated_with;
	/** @type String */		this._code            = code;
    /** 
     * Only used in older browsers.
     * @type Boolean */	this._arity           = arity || 1;
	
	/** The arguments. */
	this._args = [];
}

Codework.Method.CURRENT_CLASS_STACK    = [];
Codework.Method.CURRENT_INVOCANT_STACK = [];

Codework.Method.prototype.associated_with = function () {
    return this._associated_with;
}

Codework.Method.prototype.arity = function () {
    return this._arity;
}

/*
NOTE:
we ignore the arity value for now in call(), it is really
just there to support multi-methods anyway :)
*/

Codework.Method.prototype.call = function (inv, args) {
    Codework.Method.CURRENT_CLASS_STACK.push(this._associated_with);
    Codework.Method.CURRENT_INVOCANT_STACK.push(inv);
    var rval = this._code(inv, args);
    Codework.Method.CURRENT_INVOCANT_STACK.pop();
    Codework.Method.CURRENT_CLASS_STACK.pop();
    return rval;
}

Codework.Method.prototype.toString = function () {
    return "Codework.Method=[" + this.associated_with() + "]";
}
