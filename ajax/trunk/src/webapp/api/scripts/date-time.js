/*==================================================
 *  Date/Time Utility Functions
 *==================================================
 */

SimileAjax.DateTime = new Object();

SimileAjax.DateTime._dateRegexp = new RegExp(
    "^([0-9]{4})((-?([0-9]{2})(-?([0-9]{2}))?)|" +
    "(-?([0-9]{3}))|(-?W([0-9]{2})(-?([1-7]))?))?$"
);
SimileAjax.DateTime._timezoneRegexp = new RegExp(
    "Z|(([-+])([0-9]{2})(:?([0-9]{2}))?)$"
);
SimileAjax.DateTime._timeRegexp = new RegExp(
    "^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(\.([0-9]+))?)?)?$"
);

SimileAjax.DateTime.setIso8601Date = function(dateObject, string) {
    /*
     *  This function has been adapted from dojo.date, v.0.3.0
     *  http://dojotoolkit.org/.
     */
     
    var d = string.match(SimileAjax.DateTime._dateRegexp);
    if(!d) {
        throw new Error("Invalid date string: " + string);
    }
    
    var year = d[1];
    var month = d[4];
    var date = d[6];
    var dayofyear = d[8];
    var week = d[10];
    var dayofweek = (d[12]) ? d[12] : 1;

    dateObject.setUTCFullYear(year);
    if (dayofyear) { 
        dateObject.setUTCMonth(0);
        dateObject.setUTCDate(Number(dayofyear));
    } else if (week) {
        dateObject.setUTCMonth(0);
        dateObject.setUTCDate(1);
        var gd = dateObject.getUTCDay();
        var day =  (gd) ? gd : 7;
        var offset = Number(dayofweek) + (7 * Number(week));
        
        if (day <= 4) { 
            dateObject.setUTCDate(offset + 1 - day); 
        } else { 
            dateObject.setUTCDate(offset + 8 - day); 
        }
    } else {
        if (month) { 
            dateObject.setUTCDate(1);
            dateObject.setUTCMonth(month - 1); 
        }
        if (date) { 
            dateObject.setUTCDate(date); 
        }
    }
    
    return dateObject;
};

SimileAjax.DateTime.setIso8601Time = function (dateObject, string) {
    /*
     *  This function has been adapted from dojo.date, v.0.3.0
     *  http://dojotoolkit.org/.
     */
     
    // first strip timezone info from the end
    var d = string.match(SimileAjax.DateTime._timezoneRegexp);

    var offset = 0; // local time if no tz info
    if (d) {
        if (d[0] != 'Z') {
            offset = (Number(d[3]) * 60) + Number(d[5]);
            offset *= ((d[2] == '-') ? 1 : -1);
        }
        string = string.substr(0, string.length - d[0].length);
    }

    // then work out the time
    var d = string.match(SimileAjax.DateTime._timeRegexp);
    if(!d) {
        dojo.debug("invalid time string: " + string);
        return false;
    }
    var hours = d[1];
    var mins = Number((d[3]) ? d[3] : 0);
    var secs = (d[5]) ? d[5] : 0;
    var ms = d[7] ? (Number("0." + d[7]) * 1000) : 0;

    dateObject.setUTCHours(hours);
    dateObject.setUTCMinutes(mins);
    dateObject.setUTCSeconds(secs);
    dateObject.setUTCMilliseconds(ms);
    
    return dateObject;
};

SimileAjax.DateTime.setIso8601 = function (dateObject, string){
    /*
     *  This function has been copied from dojo.date, v.0.3.0
     *  http://dojotoolkit.org/.
     */
     
    var comps = (string.indexOf("T") == -1) ? string.split(" ") : string.split("T");
    
    SimileAjax.DateTime.setIso8601Date(dateObject, comps[0]);
    if (comps.length == 2) { 
        SimileAjax.DateTime.setIso8601Time(dateObject, comps[1]); 
    }
    return dateObject;
};

SimileAjax.DateTime.parseIso8601DateTime = function (string) {
    try {
        return SimileAjax.DateTime.setIso8601(new Date(0), string);
    } catch (e) {
        return null;
    }
};
