/*======================================================================
 *  Exhibit
 *  Code to automatically create the exhibit if there is no onload
 *  handler on the body element.
 *======================================================================
 */
(function() {
    if (window.onload == null) {
        var f = function() {
            if (document.body.onload == null || document.body.onload == f) {
                window.exhibit = Exhibit.create();
            }
        };
        
        window.onload = f;
    }
})();