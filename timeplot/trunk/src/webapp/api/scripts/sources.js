/*==================================================
 *  Default Data Source
 *==================================================*/

Timeplot.DefaultEventSource = Timeline.DefaultEventSource;

Timeplot.DefaultEventSource.prototype.loadText = function(text, separator, url) {

    if (text == null) {
        return;
    }

    this._events.maxValues = new Array
    var base = this._getBaseURL(url);
    
    var dateTimeFormat = 'iso8601';
    var parseDateTimeFunction = this._events.getUnit().getParser(dateTimeFormat);

    var data = this._parseText(text, separator);
    
    var added = false;
    
    if (data){
        for (var i = 0; i < data.length; i++){
            var row = data[i];
            var evt = new Timeline.DefaultEventSource.NumericEvent(
                parseDateTimeFunction(row[0]),
                row.slice(1)
            );
            this._events.add(evt);
            added = true;
        }
    }

    if (added) {
        this._fire("onAddMany", []);
    }
}

/*
 * Adapted from http://www.kawa.net/works/js/jkl/js/jkl-parsexml.js by Yusuke Kawasaki
 */
Timeplot.DefaultEventSource.prototype._parseText = function (text, separator) {
    text = text.replace( /\r\n?/g, "\n" ); // normalize newlines
    var pos = 0;
    var len = text.length;
    var table = [];
    while (pos < len) {
        var line = [];
        while (pos < len) {
            if (text.charAt(pos) == '"') {            // "..." quoted column
                var nextquote = text.indexOf('"', pos+1 );
                while ( nextquote<len && nextquote > -1 ) {
                    if ( text.charAt(nextquote+1) != '"' ) {
                        break;                          // end of column
                    }
                    nextquote = text.indexOf( '"', nextquote+2 );
                }
                if ( nextquote < 0 ) {
                    // unclosed quote
                } else if ( text.charAt(nextquote+1) == separator ) { // end of column
                    var quoted = text.substr( pos+1, nextquote-pos-1 );
                    quoted = quoted.replace(/""/g,'"');
                    line[line.length] = quoted;
                    pos = nextquote+2;
                    continue;
                } else if ( text.charAt(nextquote+1) == "\n" || // end of line
                            len==nextquote+1 ) {                // end of file
                    var quoted = text.substr( pos+1, nextquote-pos-1 );
                    quoted = quoted.replace(/""/g,'"');
                    line[line.length] = quoted;
                    pos = nextquote+2;
                    break;
                } else {
                    // invalid column
                }
            }
            var nextcomma = text.indexOf( separator, pos );
            var nextnline = text.indexOf( "\n", pos );
            if ( nextnline < 0 ) nextnline = len;
            if ( nextcomma > -1 && nextcomma < nextnline ) {
                line[line.length] = text.substr( pos, nextcomma-pos );
                pos = nextcomma+1;
            } else {                                    // end of line
                line[line.length] = text.substr( pos, nextnline-pos );
                pos = nextnline+1;
                break;
            }
        }
        if ( line.length >= 0 ) {
            table[table.length] = line;                 // push line
        }
    }
    if ( table.length < 0 ) return;                     // null data
    return table;
}

// -----------------------------------------------------------------------

Timeplot.DefaultEventSource.NumericEvent = function(time, values) {
    this._id = "e" + Math.floor(Math.random() * 1000000);
    this._time = time;
    this._values = values;
};

Timeline.DefaultEventSource.NumericEvent.prototype = {
    getID:          function() { return this._id; },
    getTime:        function() { return this._time; },
    getValues:      function() { return this._values; },

    // these are required by the EventSource
    getStart:       function() { return this._time; },
    getEnd:         function() { return this._time; }
};

// -----------------------------------------------------------------------

Timeplot.DataSource = function(eventSource) {
	this._eventSource = eventSource;
    var source = this;
    this._processingListener = {
        onAddMany: function() { source._process(); },
        onClear:   function() { source._clear(); }
    }
    this.addListener(this._processingListener);
    this._listeners = [];
};

Timeplot.DataSource.prototype = {
  
    _clear: function() {
    	this._data = null;
    	this._range = null;
    },
    
    _process: function() {
    	this._data = {
    		times: new Array(),
    		values: new Array()
    	};
        this._range = {
            earliestDate: new Date(),
            latestDate: new Date(),
            mix: 0,
            max: 0
        };
    },

    getRange: function() {
        return this._range;
    },
    
    getData: function() {
        return this._data;
    },

    addListener: function(listener) {
    	this._eventSource.addListener(listener);
    },

    removeListener: function(listener) {
    	this._eventSource.removeListener(listener);
    },
    
    replaceListener: function(oldListener, newListener) {
    	this.removeListener(oldListener);
    	this.addListener(newListener);
    }
    
}

// -----------------------------------------------------------------------

/**
 * Data Source that extracts the time series out of a single column 
 * from the events
 */
Timeplot.ColumnSource = function(eventSource, column) {
	// FIXME(SM): how can we call the overloaded constructor instead of
	// repeating all the same actions here?
    this._eventSource = eventSource;
    this._listeners = [];
    var source = this;
    this._processingListener = {
        onAddMany: function() { source._process(); },
        onClear:   function() { source._clear(); }
    }
    this.addListener(this._processingListener);
    this._column = column - 1;
};

Object.extend(Timeplot.ColumnSource.prototype,Timeplot.DataSource.prototype);

Timeplot.ColumnSource.prototype.dispose = function() {
    this.removeListener(this._processingListener);
    this._clear();
}

Timeplot.ColumnSource.prototype._process = function() {
	var count = this._eventSource.getCount();
	var times = new Array(count);
	var values = new Array(count);
	var min = Number.MAX_VALUE;
	var max = Number.MIN_VALUE;
	var i = 0;
	
	var iterator = this._eventSource.getAllEventIterator();
	while (iterator.hasNext()) {
		var event = iterator.next();
		var time = event.getTime();
		times[i] = time;
		var value = this._getValue(event);
        if (!isNaN(value)) {
           if (value < min) {
               min = value;
           }
           if (value > max) {
               max = value;
           }    
            values[i] = value;
        }
		i++;
	}

    this._data = {
        times: times,
        values: values
    };
    
    this._range = {
        earliestDate: this._eventSource.getEarliestDate(),
        latestDate: this._eventSource.getLatestDate(),
        min: min,
        max: max
    };
}

Timeplot.ColumnSource.prototype._getValue = function(event) {
    return parseInt(event.getValues()[this._column]);
}

// ---------------------------------------------------------------

/**
 * Data Source that generates the time series out of the difference
 * between the first and the second column
 */
Timeplot.ColumnDiffSource = function(eventSource, column1, column2) {
    // FIXME(SM): how can we call the overloaded constructor instead of
    // repeating all the same actions here?
    this._eventSource = eventSource;
    this._listeners = [];
    var source = this;
    this._processingListener = {
        onAddMany: function() { source._process(); },
        onClear:   function() { source._clear(); }
    }
    this.addListener(this._processingListener);
    this._column1 = column1 - 1;
    this._column2 = column2 - 1;
};

Object.extend(Timeplot.ColumnDiffSource.prototype,Timeplot.ColumnSource.prototype);

Timeplot.ColumnDiffSource.prototype._getValue = function(event) {
    var a = parseInt(event.getValues()[this._column1]);
    var b = parseInt(event.getValues()[this._column2])
    return a - b;
}
