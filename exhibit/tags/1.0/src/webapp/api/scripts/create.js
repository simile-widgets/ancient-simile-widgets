/*======================================================================
 *  Exhibit
 *  Code to automatically create the exhibit if there is no onload
 *  handler on the body element.
 *======================================================================
 */
(function() {
    if (window.onload == null) {
        window.onload = function() { window.exhibit = Exhibit.create(); };
    }
})();