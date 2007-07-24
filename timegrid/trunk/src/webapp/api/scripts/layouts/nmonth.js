/******************************************************************************
 * NMonthLayout
 * @fileoverview
 *   This is where the monthly layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author masont
 *****************************************************************************/

Timegrid.NMonthLayout = function(eventSource, config) {
    Timegrid.NMonthLayout.superclass.call(this, eventSource, config);
    var self = this;
    var defaults = config.getRoot();
    
    this.iterable = false; // TODO: Implement n-month iterating

    defaults.set('xSize', 7);
    defaults.set('ySize', 0); // This is re-calculated later based on n
    defaults.set('n', 3);
    defaults.set('title', config.get('n') + "-Month");
    
    // Initialize our eventSource
    this.eventSource = eventSource;
    this.startTime   = this.eventSource.getEarliestDate() || new Date();
    
    // Configure our mappers
    defaults.set('xMapper', function(obj) { return obj.time.getDay(); });
    defaults.set('yMapper', function(obj) { 
        return Math.floor((obj.time - self.startTime) /
                          (1000 * 60 * 60 * 24 * 7.0)); 
    });

    this.startTime = this.computeStartTime(this.startTime);
    
    this.initializeGrid();
};
Timegrid.LayoutFactory.registerLayout("n-month", Timegrid.NMonthLayout);

Timegrid.NMonthLayout.prototype.initializeGrid = function() {
    var config = this.config;
    this.dataStartTime = this.eventSource.getEarliestDate() || new Date();
    // Use a method to compute cell and y-labels (non-trivial).  This method
    // will also compute ySize based on n, an unfortunate grouping.
    this.computeYSize(this.startTime);
    this.computeLabels(this.startTime);

    this.endTime = this.computeEndTime(this.startTime);
    
    // Compute the cell sizes for the grid
    this.computeCellSizes();

    this.eventGrid = new Timegrid.Grid([], config.get('xSize'), 
                                       config.get('ySize'), 
                                       config.get('xMapper'), 
                                       config.get('yMapper'));
    if (this.startTime) {
        var iterator = this.eventSource.getEventIterator(this.startTime,
                                                         this.endTime);
        while (iterator.hasNext()) {
            var endpoints = Timegrid.NMonthLayout.getEndpoints(iterator.next());
            this.eventGrid.addAll(endpoints);
        }
    }
};

Timegrid.NMonthLayout.prototype.renderEvents = function(doc) {
    var config = this.config;
    var eventContainer = doc.createElement("div");
    var labelContainer = doc.createElement("div");
    var colorContainer = doc.createElement("div");
    $(eventContainer).addClass("timegrid-events");
    $(labelContainer).addClass("timegrid-month-labels");
    $(colorContainer).addClass("timegrid-month-colors");
    var i = 0;
    var dates = this.cellLabels;
    for (var y = 0; y < config.get('ySize'); y++) {
        for (var x = 0; x < config.get('xSize'); x++) {
            var endpoints = this.eventGrid.get(x,y);
            var events = $.map(endpoints, function(e) { 
                return e.type == "start" ? e.event : null;
            });
            var n = dates[i];
            var m = this.months[i];
            eventContainer.appendChild(this.renderEventList(events, x, y,
                                                                    n, m));
            colorContainer.appendChild(this.renderCellColor(x, y, m));
            i++;
        }
    }
    $(labelContainer).append($(this.renderMonthLabels()));
    return $([eventContainer, labelContainer, colorContainer]);
};

Timegrid.NMonthLayout.prototype.renderEventList = function(evts, x, y, n, m) {
    var jediv = $("<div></div>").addClass("timegrid-month-cell");
    var eList = $("<ul></ul>").addClass("timegrid-event-list");
    for (var i in evts) {
        eList.append('<li>' + evts[i].getText() + '</li>');
    }
    jediv.append(eList);
    jediv.append('<span class="timegrid-month-date-label">' + n + '</span>');
    var xCell = this.config.get('xCell');
    var yCell = this.config.get('yCell');
    jediv.css("height", yCell).css("width", xCell + "%");
    jediv.css("top", yCell * y);
    jediv.css("left", xCell * x + '%');
    return jediv.get()[0]; // Return the actual DOM element
};

Timegrid.NMonthLayout.prototype.renderCellColor = function(x, y, m) {
    var xCell = this.config.get('xCell');
    var yCell = this.config.get('yCell');
    var jcdiv = $("<div></div>").addClass("timegrid-month-cell");
    jcdiv.addClass("timegrid-month-cell-" + (m % 2 ? "odd" : "even"));
    jcdiv.css("height", yCell).css("width", xCell + "%");
    jcdiv.css("top", yCell * y);
    jcdiv.css("left", xCell * x + "%");
    return jcdiv.get()[0];
};

Timegrid.NMonthLayout.prototype.renderMonthLabels = function() {
    var xCell = this.config.get('xCell');
    var yCell = this.config.get('yCell');
    return $.map(this.monthStarts, function(monthStart) {
        var monthString = monthStart.date.getMonthName();
        var mDiv = $('<div><span>' + monthString + '</span></div>');
        mDiv.addClass('timegrid-month-label');
        mDiv.css('top', yCell * monthStart.i + "px");
        var height = monthStart.height * yCell;
        mDiv.height(height + "px");
        mDiv.children().css('line-height', height + "px");
        return mDiv.get(0);
    });
};

Timegrid.NMonthLayout.prototype.getXLabels = function() {
    return Date.dayNames;
};

Timegrid.NMonthLayout.prototype.getYLabels = function() {
    return this.yLabels;
};

Timegrid.NMonthLayout.prototype.goPrevious = function() {
    this.endTime = this.startTime;
    this.startTime = this.computeStartTime(this.endTime);
    this.initializeGrid();
    this.render();
};

Timegrid.NMonthLayout.prototype.goNext = function() {
    this.startTime = this.endTime;
    this.endTime = this.computeEndTime(this.startTime);
    this.initializeGrid();
    this.render();
};

Timegrid.NMonthLayout.prototype.getCurrent = function() {
    var start = this.monthStarts[0].date;
    var end   = this.monthStarts[this.monthStarts.length - 1].date;
    return start.getMonthName() + " " + start.getFullYear() + " - " +
           end.getMonthName()   + " " + end.getFullYear();
};

// Requires: this.xMapper
Timegrid.NMonthLayout.prototype.computeStartTime = function(date) {
    if (date) {
        var startTime = new Date(date);
        startTime.setDate(1);
        startTime.setHours(0);
        // Roll back to the first day on the grid
        while (this.config.get('xMapper')({ time: startTime }) > 0) {
            startTime.setHours(-24);
        }
        return startTime;
    }
};

Timegrid.NMonthLayout.prototype.computeEndTime = function(date) {
    if (date) {
        var endTime = new Date(date);
        endTime.addDays(this.config.get('ySize') * 7);
        return endTime;
    }
    return false;
};

// Requires: this.startTime, this.xMapper, this.yMapper, this.n
// Changes:  computes this.ySize, this.monthStarts
Timegrid.NMonthLayout.prototype.computeYSize = function(date) {
    var config = this.config;
    var gridStart = { time: new Date(date) };
    var month = this.dataStartTime.getMonth();
    var ySize = 0;
    this.monthStarts = [{ i: ySize, date: new Date(this.dataStartTime) }]; 
    while (config.get('xMapper')(gridStart) > 0 && 
           config.get('yMapper')(gridStart) >= 0) {
        gridStart.time.setHours(-24);
    }
    gridStart.time.addDays(7);
    for (; this.monthStarts.length <= config.get('n'); gridStart.time.addDays(7)) {
        if (gridStart.time.getMonth() != month) { 
            month = gridStart.time.getMonth();
            var year = gridStart.time.getFullYear();
            this.monthStarts.push({i: ySize, date: new Date(gridStart.time)});
            var old = this.monthStarts[this.monthStarts.length - 2];
            old.height = ySize - old.i + 1;
        }
        ySize++;
    }
    config.set('ySize', ySize);
    this.monthStarts.pop();
};

// Requires: this.startTime, this.xMapper, this.yMapper, this.ySize, this.xSize
// Changes:  computes this.cellLabels, this.months, this.yLabels
Timegrid.NMonthLayout.prototype.computeLabels = function(date) {
    var config = this.config;
    var gridStart = { time: new Date(date) };
    this.cellLabels = [];
    this.months = [];
    this.yLabels = [];

    // Iterate through and collect the tasty data
    while (config.get('xMapper')(gridStart) < config.get('xSize') && 
           config.get('yMapper')(gridStart) < config.get('ySize')) {
        var d = gridStart.time;
        this.cellLabels.push(d.getDate());
        this.months.push(d.getMonth());
        if (d.getDay() == 0) { 
            this.yLabels.push("W" + d.getWeekOfYear()); 
        }
        d.setHours(24);
    }
};

Timegrid.NMonthLayout.getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
};

