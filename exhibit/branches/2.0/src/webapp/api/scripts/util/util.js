/*==================================================
 *  Exhibit Utility Functions
 *==================================================
 */

/*
 * Augment an object by replacing its key:value pairs with those
 * from other object(s), and adding pairs from other object(s) that don't
 * exist in you.  Key:value pairs from later objects will
 * overwrite those from earlier objects.
 * 
 * If null is given as the initial object, a new one will be created.
 * 
 * This mutates and returns the object passed as oSelf. The other objects are not changed.
 */
function augment(oSelf, oOther) {
    if (oSelf == null) {
        oSelf = {};
    }
    for (var i = 1; i < arguments.length; i++) {
        var o = arguments[i];
        if (typeof(o) != 'undefined' && o != null) {
            for (var j in o) {
                oSelf[j] = o[j];
            }
        }
    }
    return oSelf;
}