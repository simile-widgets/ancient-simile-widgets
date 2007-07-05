/** 
 * Twiddle the given flick. 
 * @name twiddle.flick
 * @function
 * @param {flick} f
 */
function zipZap(zID) { // <-- NOTICE: this is NOT the named object cited above!
}

/** 
 * Join two str together. 
 * @name Concat
 * @constructor
 * @param {String} strX The first string.
 * @param {String} strY The other string.
 */
Builder.make({construct: "Concat", params: ['strX', 'strY']}); // <-- this won't be recognized.

/** 
 * Join two str together with a separator string. 
 * @name join
 * @function
 * @memberOf Concat
 * @param {String} separator.
 */
 
/** 
 * The separator character. 
 * @name separator
 * @type String
 * @type Array
 * @memberOf Concat
 */
 
 function Employee(id) {
	/**
	* id of the employee selected (could be logged user).
	* @name employeeId
	* @memberof Employee
	* @type String
	*/
	
	self.applyField(this, "employeeId", "String");
}

var Document = {
	/**
	* Title of this document.
	* @name Document.title
	* @type String
	*/
	id: generateId()
}