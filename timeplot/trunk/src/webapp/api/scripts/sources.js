/*==================================================
 *  Default Data Source
 *==================================================*/

Timeplot.DefaultEventSource = Timeline.DefaultEventSource;

Timeplot.DefaultEventSource.prototype.loadText = function(text, separator, url) {

    if (text == null) {
        return;
    }

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
                //row[0],
                null,
                row.slice(1)
            );
            this._events.add(evt);
            added = true;
        }
    }

    if (added) {
        this._fire("onAddMany", []);
    }
};

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
};

// -----------------------------------------------------------------------

Timeplot.DefaultEventSource.NumericEvent = function(start, end, values) {
        
    this._id = "e" + Math.floor(Math.random() * 1000000);
    
    this._start = start;
    this._end = (end != null) ? end : start;
    
    this._values = values;
};

Timeline.DefaultEventSource.NumericEvent.prototype = {
    getID:          function() { return this._id; },
    
    getStart:       function() { return this._start; },
    getEnd:         function() { return this._end; },
    
    getValues:      function() { return this._values; }
};