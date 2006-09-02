/*==================================================
 *  Debug Utility Functions
 *==================================================
 */

SimileAjax.Debug = new Object();

SimileAjax.Debug.log = function(msg) {
};

SimileAjax.Debug.exception = function(e) {
    //alert("Caught exception: " + (SimileAjax.Platform.isIE ? e.message : e));
    console.error(e);
};

