/*==================================================
 *  Exhibit.Functions
 *  http://simile.mit.edu/wiki/Exhibit/API/Expression
 *==================================================
 */
Exhibit.Functions = {};

Exhibit.Functions["union"] = {
    f: function(args) {
        var set = new Exhibit.Set();
        if (args.length == 0) {
            return { valueType: "text", values: set, count: 0 };
        } else {
            var valueType = args[0].valueType;
            set.addSet(args[0].values);
            
            for (var i = 1; i < args.length; i++) {
                var arg = args[i];
                if (valueType == arg.valueType) {
                    set.addSet(arg.values);
                }
            }
            
            return { valueType: valueType, values: set, count: set.size() };
        }
    }
};

Exhibit.Functions["contains"] = {
    f: function(args) {
        var result = args[0].values.size() > 0;
        args[1].values.visit(function(v) {
            if (!args[0].values.contains(v)) {
                result = false;
            }
        });
        
        var set = new Exhibit.Set();
        set.add(result);
        
        return {
            valueType:  "boolean",
            values:     set,
            count:      set.size()
        };
    }
};

Exhibit.Functions["count"] = {
    f: function(args) {
        var set = new Exhibit.Set();
        set.add(args[0].values.size());
        
        return {
            valueType:  "number",
            values:     set,
            count:      set.size()
        };
    }
};

Exhibit.Functions["add"] = {
    f: function(args) {
        var total = 0;
        for (var i = 0; i < args.length; i++) {
            args[i].values.visit(function(v) {
                if (v != null) {
                    if (typeof v == "number") {
                        total += v;
                    } else {
                        var n = parseFloat(v);
                        if (!isNaN(n)) {
                            total += n;
                        }
                    }
                }
            });
        }
        
        var set = new Exhibit.Set();
        set.add(total);
        
        return {
            valueType:  "number",
            values:     set,
            count:      set.size()
        };
    }
};

// Note: arguments expanding to multiple items get concatenated in random order
Exhibit.Functions["concat"] = {
    f: function(args) {
        var result = [];
        for (var i = 0; i < args.length; i++) {
            args[i].values.visit(function(v) {
                if (v != null) {
                    result.push(v);
                }
            });
        }

        var set = new Exhibit.Set();
        set.add(result.join(''));

        return {
            valueType:  "text",
            values:     set,
            count:      set.size()
        };
    }
};

Exhibit.Functions["multiply"] = {
    f: function(args) {
        var product = 1;
        for (var i = 0; i < args.length; i++) {
            args[i].values.visit(function(v) {
                if (v != null) {
                    if (typeof v == "number") {
                        product *= v;
                    } else {
                        var n = parseFloat(v);
                        if (!isNaN(n)) {
                            product *= n;
                        }
                    }
                }
            });
        }
        
        var set = new Exhibit.Set();
        set.add(total);
        
        return {
            valueType:  "number",
            values:     set,
            count:      set.size()
        };
    }
};

Exhibit.Functions["date-range"] = {
    _parseDate: function (v) {
        if (v == null) {
            return Number.NEGATIVE_INFINITY;
        } else if (v instanceof Date) {
            return v.getTime();
        } else {
            try {
                return SimileAjax.DateTime.parseIso8601DateTime(v).getTime();
            } catch (e) {
                return Number.NEGATIVE_INFINITY;
            }
        }
    },
    _factors: {
        second:     1000,
        minute:     60 * 1000,
        hour:       60 * 60 * 1000,
        day:        24 * 60 * 60 * 1000,
        week:       7 * 24 * 60 * 60 * 1000,
        month:      30 * 24 * 60 * 60 * 1000,
        quarter:    3 * 30 * 24 * 60 * 60 * 1000,
        year:       365 * 24 * 60 * 60 * 1000,
        decade:     10 * 365 * 24 * 60 * 60 * 1000,
        century:    100 * 365 * 24 * 60 * 60 * 1000
    },
    _computeRange: function(from, to, interval) {
        var range = to - from;
        if (isFinite(range)) {
            if (interval in this._factors) {
                range = Math.round(range / this._factors[interval]);
            }
            return range;
        }
        return null;
    },
    f: function(args) {
        var self = this;
        
        var from = Number.POSITIVE_INFINITY;
        args[0].values.visit(function(v) {
            from = Math.min(from, self._parseDate(v));
        });
        
        var to = Number.NEGATIVE_INFINITY;
        args[1].values.visit(function(v) {
            to = Math.max(to, self._parseDate(v));
        });
        
        var interval = "day";
        args[2].values.visit(function(v) {
            interval = v;
        });
            
        var set = new Exhibit.Set();
        var range = this._computeRange(from, to, interval);
        if (range != null) {
            set.add(range);
        }
        
        return {
            valueType:  "number",
            values:     set,
            count:      set.size()
        };
    }
};

Exhibit.Functions["distance"] = {
    _units: {
        km:         1e3,
        mile:       1609.344
    },
    _computeDistance: function(from, to, unit, roundTo) {
        var range = from.distanceFrom(to);
        if (!roundTo) roundTo = 1;
        if (isFinite(range)) {
            if (this._units.hasOwnProperty(unit)) {
                range = range / this._units[unit];
            }
            return Exhibit.Util.round(range, roundTo);
        }
        return null;
    },
    f: function(args) {
        var self = this;
        var data = {};
        var name = ["origo", "lat", "lng", "unit", "round"];
        for (var i = 0, n; n = name[i]; i++) {
            args[i].values.visit(function(v) { data[n] = v; });
        }

        var latlng = data.origo.split(",");
        var from = new GLatLng( latlng[0], latlng[1] );
        var to = new GLatLng( data.lat, data.lng );
        var set = new Exhibit.Set();
        var range = this._computeDistance(from, to, data.unit, data.round);
        if (range != null) {
            set.add(range);
        }

        return {
            valueType:  "number",
            values:     set,
            count:      set.size()
        };
    }
};
