/******************************************************************************
 * NMonthLayout
 * @fileoverview
 *   This is where the monthly layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author masont
 *****************************************************************************/

Timegrid.NMonthLayout = function(eventSource, params) {
    Timegrid.NMonthLayout.superclass.call(this, eventSource, params);

    this.xSize = 7;
    this.ySize = 0; // This is re-calculated later based on n
    this.n     = 3;
    this.iterable = false;

    this.configure(params);
    this.title = this.n + "-Month";
    
    
    // Initialize our eventSource
    this.eventSource = eventSource;
    this.startTime   = this.eventSource.getEarliestDate() || new Date();
    this.startTime   = this.computeStartTime(this.startTime);
    
    // Configure our mappers
    if (this.startTime) { var firstWeek = this.startTime.getWeekOfYear(); }
    this.xMapper = function(obj) { return obj.time.getDay(); };
    this.yMapper = function(obj) { return obj.time.getWeekOfYear() - firstWeek; };
    // Use a method to compute cell and y-labels (non-trivial).  This method
    // will also compute ySize based on n, an unfortunate grouping.
    this.computeYSize(this.startTime);
    this.computeLabels(this.startTime);

    this.endTime = this.computeEndTime(this.startTime);
    
    // Compute the cell sizes for the grid
    this.computeCellSizes();
    
    this.initializeGrid();
};
Timegrid.LayoutFactory.registerLayout("n-month", Timegrid.NMonthLayout);

Timegrid.NMonthLayout.prototype.initializeGrid = function() {
    this.eventGrid = new Timegrid.Grid([], this.xSize, this.ySize, 
                                       this.xMapper, this.yMapper);
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
    var eventContainer = doc.createElement("div");
    $(eventContainer).addClass("timegrid-events");
    var i = 0;
    var dates = this.cellLabels;
    for (y = 0; y < this.ySize; y++) {
        for (x = 0; x < this.xSize; x++) {
            var endpoints = this.eventGrid.get(x,y);
            var events = $.map(endpoints, function(e) { 
                return e.type == "start" ? e.event : null;
            });
            var n = dates[i];
            var m = this.months[i];
            eventContainer.appendChild(this.renderEventList(events, x, y,
                                                                    n, m));
            i++;
        }
    }
    return eventContainer;
};

Timegrid.NMonthLayout.prototype.renderEventList = function(evts, x, y, n, m) {
    var jediv = $("<div></div>").addClass("timegrid-month-cell");
    jediv.addClass("timegrid-month-cell-" + (m % 2 ? "odd" : "even"));
    var eList = $("<ul></ul>").addClass("timegrid-event-list");
    for (i in evts) {
        eList.append('<li>' + evts[i].getText() + '</li>');
    }
    jediv.append(eList);
    jediv.append('<span class="timegrid-month-date-label">' + n + '</span>');
    jediv.css("height", this.yCell).css("width", this.xCell + "%");
    jediv.css("top", this.yCell * y);
    jediv.css("left", this.xCell * x + '%');
    return jediv.get()[0]; // Return the actual DOM element
};

Timegrid.NMonthLayout.prototype.getXLabels = function() {
    return Date.dayNames;
};

Timegrid.NMonthLayout.prototype.getYLabels = function() {
    return this.yLabels;
};

Timegrid.NMonthLayout.prototype.computeStartTime = function(date) {
    if (date) {
        var startTime = new Date(date);
        startTime.setDate(1);
        startTime.setHours(0);
        // Roll back to the first day on the grid
        while (this.xMapper({ time: startTime }) > 0 &&
               this.yMapper({ time: startTime }) >= 0) {
            startTime.setHours(-24);
        }
        return startTime;
    }
};

Timegrid.NMonthLayout.prototype.computeEndTime = function(date) {
    if (date) {
        var endTime = new Date(date);
        endTime.addDays(this.ySize * 7);
        return endTime;
    }
    return false;
};

Timegrid.NMonthLayout.prototype.computeYSize = function(date) {
    var gridStart = { time: new Date(date) };
    var month = date.getMonth();
    this.ySize = 0;
    while (this.xMapper(gridStart) > 0 && this.yMapper(gridStart) >= 0) {
        gridStart.time.setHours(-24);
    }
    gridStart.time.addDays(7);
    for (var months = 0; months < this.n; gridStart.time.addDays(7)) {
        if (gridStart.time.getMonth() != month) { 
            month = gridStart.time.getMonth();
            months++;
        }
        this.ySize++;
    }
};

Timegrid.NMonthLayout.prototype.computeLabels = function(date) {
    var gridStart = { time: new Date(date) };
    this.cellLabels = [];
    this.months = [];
    this.yLabels = [];

    gridStart.time = this.computeStartTime(gridStart.time);
    
    // Iterate through and collect the tasty data
    while (this.xMapper(gridStart) < this.xSize && 
           this.yMapper(gridStart) < this.ySize) {
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

