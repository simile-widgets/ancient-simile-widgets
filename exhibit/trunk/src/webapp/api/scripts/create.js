/*======================================================================
 *  Exhibit
 *  Code to automatically create the exhibit if there is no onload
 *  handler on the body element.
 *======================================================================
 */
(function() {
    if (typeof window.onload == "undefined") {
        window.onload = function() { Exhibit.create(); };
    }
})();