/*======================================================================
 *  Exhibit
 *  Code to automatically create the database if there is no onload
 *  handler on the body element, and then to create an exhibit if
 *  there's no ex:ondataload handler on the body element.
 *======================================================================
 */
(function() {
    if (document.body == null && window.onload == null) {
        var f = function() {
            if (document.body.onload == null || document.body.onload == f) {
                var fDone = function() {
                    window.exhibit = Exhibit.create();
                };
                
                try {
                    var s = Exhibit.getAttribute(document.body, "ondataload");
                    if (s != null && typeof s == "string" && s.length > 0) {
                        fDone = function() {
                            var f = eval(s);
                            if (typeof f == "function") {
                                f.call();
                            }
                        }
                    }
                } catch (e) {
                    // silent
                }
                window.database = Exhibit.Database.createAndLoad(fDone);
            }
        };
        
        window.onload = f;
    }
})();