/*==================================================
 *  Processing Data Source
 *==================================================*/

Timeplot.Processor = function(dataSource, operator, params) {
    this._dataSource = dataSource;
    this._operator = operator;
    this._params = params;

    this._data = {
        times: new Array(),
        values: new Array()
    };

    this._range = {
        earliestDate: null,
        latestDate: null,
        min: 0,
        max: 0
    };

    var processor = this;
    this._processingListener = {
        onAddMany: function() { processor._process(); },
        onClear:   function() { processor._clear(); }
    }
    this.addListener(this._processingListener);
};

Timeplot.Processor.prototype = {

    _clear: function() {
        this.removeListener(this._processingListener);
        this._dataSource._clear();
    },

    _process: function() {
        // this method requires the dataSource._process() method to be
        // called first as to setup the data and range used below
        // this should be guaranteed by the order of the listener registration  

        var data = this._dataSource.getData();
        var range = this._dataSource.getRange();

        var newValues = this._operator(data, this._params);
        var newValueRange = Timeplot.Math.range(newValues);

        this._data = {
            times: data.times,
            values: newValues
        };

        this._range = {
            earliestDate: range.earliestDate,
            latestDate: range.latestDate,
            min: newValueRange.min,
            max: newValueRange.max
        };
    },

    getRange: function() {
        return this._range;
    },

    getData: function() {
        return this._data;
    },

    addListener: function(listener) {
        this._dataSource.addListener(listener);
    },

    removeListener: function(listener) {
        this._dataSource.removeListener(listener);
    }
}
