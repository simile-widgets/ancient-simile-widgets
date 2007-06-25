/******************************************************************************
 * Utility Functions
 *****************************************************************************/

/**
 * This stuff really ought to be defined in SimileAjax...I think...but I'm
 * putting it here as an ugly hack, to make things work for now.
 */
SimileAjax.DateTime.MILLISECOND    = 0;
SimileAjax.DateTime.SECOND         = 1;
SimileAjax.DateTime.MINUTE         = 2;
SimileAjax.DateTime.HOUR           = 3;
SimileAjax.DateTime.DAY            = 4;
SimileAjax.DateTime.WEEK           = 5;
SimileAjax.DateTime.MONTH          = 6;
SimileAjax.DateTime.YEAR           = 7;
SimileAjax.DateTime.DECADE         = 8;
SimileAjax.DateTime.CENTURY        = 9;
SimileAjax.DateTime.MILLENNIUM     = 10;

SimileAjax.DateTime.EPOCH          = -1;
SimileAjax.DateTime.ERA            = -2; 

SimileAjax.DateTime.parseGregorianDateTime = function(o) {
    if (o == null) {
        return null;
    } else if (o instanceof Date) {
        return o;
    }
    
    var s = o.toString();
    if (s.length > 0 && s.length < 8) {
        var space = s.indexOf(" ");
        if (space > 0) {
            var year = parseInt(s.substr(0, space));
            var suffix = s.substr(space + 1);
            if (suffix.toLowerCase() == "bc") {
                year = 1 - year;
            }
        } else {
            var year = parseInt(s);
        }
            
        var d = new Date(0);
        d.setUTCFullYear(year);
        
        return d;
    }
    
    try {
        return new Date(Date.parse(s));
    } catch (e) {
        return null;
    }
};

SimileAjax.DateTime.gregorianUnitLengths = [];
    (function() {
        var d = SimileAjax.DateTime;
        var a = d.gregorianUnitLengths;
        
        a[d.MILLISECOND] = 1;
        a[d.SECOND]      = 1000;
        a[d.MINUTE]      = a[d.SECOND] * 60;
        a[d.HOUR]        = a[d.MINUTE] * 60;
        a[d.DAY]         = a[d.HOUR] * 24;
        a[d.WEEK]        = a[d.DAY] * 7;
        a[d.MONTH]       = a[d.DAY] * 31;
        a[d.YEAR]        = a[d.DAY] * 365;
        a[d.DECADE]      = a[d.YEAR] * 10;
        a[d.CENTURY]     = a[d.YEAR] * 100;
        a[d.MILLENNIUM]  = a[d.YEAR] * 1000;
    })();

SimileAjax.DateTime.removeTimeZoneOffset = function(date, timeZone) {
    return new Date(date.getTime() + 
        timeZone * SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR]);
};

SimileAjax.DateTime.Interval = function(ms) {
    // Conversion factors as varants to eliminate all the multiplication
    var SECONDS_CF     = 1000;
    var MINUTES_CF     = 60000;          
    var HOURS_CF       = 3600000;       
    var DAYS_CF        = 86400000;     
    var WEEKS_CF       = 604800000;   
    var FORTNIGHTS_CF  = 1209600000; 
    var MONTHS_CF      = 2592000000;
    var QUARTERS_CF    = 7776000000;
    var YEARS_CF       = 31557600000;
    var DECADES_CF     = 315576000000;
    var CENTURIES_CF   = 3155760000000;

    this.milliseconds = Math.abs(ms);
    this.seconds      = Math.round(this.milliseconds / SECONDS_CF); 
    this.minutes      = Math.round(this.milliseconds / MINUTES_CF);
    this.hours        = Math.round(this.milliseconds / HOURS_CF);
    this.days         = Math.round(this.milliseconds / DAYS_CF);
    this.weeks        = Math.round(this.milliseconds / WEEKS_CF);
    this.fortnights   = Math.round(this.milliseconds / FORTNIGHTS_CF);
    this.months       = Math.round(this.milliseconds / MONTHS_CF);
    // rounding errors!
    this.quarters     = Math.round(this.milliseconds / QUARTERS_CF);
    // rounding errors!
    this.years        = Math.round(this.milliseconds / YEARS_CF); 
    // rounding errors!
    this.decades      = Math.round(this.milliseconds / DECADES_CF); 
    // rounding errors!  
    this.centuries    = Math.round(this.milliseconds / CENTURIES_CF);  
    // rounding errors!
};

SimileAjax.DateTime.Interval.prototype.toString = function() {
    return this.milliseconds.toString();
};
