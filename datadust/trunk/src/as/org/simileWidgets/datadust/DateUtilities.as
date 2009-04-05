package org.simileWidgets.datadust {
    public class DateUtilities {
        static private var _dateRegexp:RegExp = new RegExp(
            "^(-?)([0-9]{4})(" + [
                "(-?([0-9]{2})(-?([0-9]{2}))?)", // -month-dayOfMonth
                "(-?([0-9]{3}))",                // -dayOfYear
                "(-?W([0-9]{2})(-?([1-7]))?)"    // -Wweek-dayOfWeek
            ].join("|") + ")?$",
            "i"
        );
        static private var _timezoneRegexp:RegExp = new RegExp(
            "Z|(([-+])([0-9]{2})(:?([0-9]{2}))?)$",
            "i"
        );
        static private var _timeRegexp:RegExp = new RegExp(
            "^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(\.([0-9]+))?)?)?$",
            "i"
        );
        
        static public var timezoneOffset:Number = new Date().getTimezoneOffset();
        
        static public function setIso8601Date(dateObject:Date, string:String):Date {
            /*
             *  This function has been adapted from dojo.date, v.0.3.0
             *  http://dojotoolkit.org/.
             */

            var d:Array = string.match(_dateRegexp);
            if (d == null) {
                throw new Error("Invalid date string: " + string);
            }

            var sign:int = (d[1] == "-") ? -1 : 1; // BC or AD
            var year:Number = sign * Number(d[2]);
            var month:String = d[5];
            var date:String = d[7];
            var dayofyear:String = d[9];
            var week:String = d[11];
            var dayofweek:String = (d[13]) ? d[13] : "1";

            dateObject.setUTCFullYear(year);
            if (dayofyear != null) { 
                dateObject.setUTCMonth(0);
                dateObject.setUTCDate(Number(dayofyear));
            } else if (week != null) {
                dateObject.setUTCMonth(0);
                dateObject.setUTCDate(1);
                var gd:Number = dateObject.getUTCDay();
                var day:Number =  (gd) ? gd : 7;
                var offset:Number = Number(dayofweek) + (7 * Number(week));

                if (day <= 4) { 
                    dateObject.setUTCDate(offset + 1 - day); 
                } else { 
                    dateObject.setUTCDate(offset + 8 - day); 
                }
            } else {
                if (month) { 
                    dateObject.setUTCDate(1);
                    dateObject.setUTCMonth(Number(month) - 1); 
                }
                if (date) { 
                    dateObject.setUTCDate(Number(date)); 
                }
            }

            return dateObject;
        }

        static public function setIso8601Time(dateObject:Date, string:String):Date {
            /*
             *  This function has been adapted from dojo.date, v.0.3.0
             *  http://dojotoolkit.org/.
             */

            var d:Array = string.match(_timeRegexp);
            if (d == null) {
                throw new Error("Invalid time string: " + string);
                return null;
            }
            
            var hours:Number = Number(d[1]);
            var mins:Number = (d[3] != null) ? Number(d[3]) : 0;
            var secs:Number = (d[5] != null) ? Number(d[5]) : 0;
            var ms:Number = d[7] ? (Number("0." + d[7]) * 1000) : 0;

            dateObject.setUTCHours(hours);
            dateObject.setUTCMinutes(mins);
            dateObject.setUTCSeconds(secs);
            dateObject.setUTCMilliseconds(ms);

            return dateObject;
        }

        static public function setIso8601(dateObject:Date, string:String):Date {
            /*
             *  This function has been adapted from dojo.date, v.0.3.0
             *  http://dojotoolkit.org/.
             */

            var offset:* = undefined;
            var comps:Array = (string.indexOf("T") == -1) ? string.split(" ") : string.split("T");
            
            setIso8601Date(dateObject, comps[0]);
            if (comps.length == 2) { 
                // first strip timezone info from the end
                var d:Array = comps[1].match(_timezoneRegexp);
                if (d != null) {
                    if (d[0] == 'Z') {
                        offset = 0;
                    } else {
                        offset = (Number(d[3]) * 60) + Number(d[5]);
                        offset *= ((d[2] == '-') ? 1 : -1);
                    }
                    comps[1] = comps[1].substr(0, comps[1].length - d[0].length);
                }

                setIso8601Time(dateObject, comps[1]); 
            }
            if (offset == undefined) {
                offset = dateObject.getTimezoneOffset(); // local time zone if no tz info
            }
            dateObject.setTime(dateObject.getTime() + offset * 60000);

            return dateObject;
        }

        static public function parseIso8601DateTime(string:String):Date {
            try {
                return setIso8601(new Date(0), string);
            } catch (e:Error) {
            }
            return null;
        }
    }
}
