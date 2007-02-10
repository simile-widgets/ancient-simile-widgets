/*==================================================
 *  String Utility Functions and Constants
 *==================================================
 */

String.prototype.trim = function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
};
