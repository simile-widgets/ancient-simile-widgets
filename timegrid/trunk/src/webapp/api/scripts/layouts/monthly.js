/******************************************************************************
 * MonthLayout
 * @fileoverview
 *   This is where the monthly layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author masont
 *****************************************************************************/

Timegrid.MonthLayout = function(eventSource, params) {
    Timegrid.MonthLayout.superclass.call(this, eventSource, params);
    this.xSize = 7;
    this.ySize = 5;
    
    // These are default values that can be overridden in configure
    this.height = 500.0;
    
    this.configure(params);
    
    // Compute the cell sizes for the grid
    this.computeCellSizes();

    // Initialize our eventSource
    this.eventSource = eventSource;
    this.startTime = this.eventSource.getEarliestDate();
    this.startTime = Timegrid.MonthLayout.getStartOfMonth(this.startTime);
    console.log(this.startTime);
    this.endTime   = Timegrid.MonthLayout.getEndOfMonth(this.startTime); 
    
    // Configure our mappers
    if (this.startTime) { var firstWeek = this.startTime.getWeekOfYear(); }
    this.xMapper = function(obj) { return obj.time.getDay(); };
    this.yMapper = function(obj) { return obj.time.getWeekOfYear() - firstWeek; };
    
    this.initializeGrid();
};
$.inherit(Timegrid.MonthLayout, Timegrid.Layout);

Timegrid.MonthLayout.prototype.initializeGrid = function() {
    this.eventGrid = new Timegrid.Grid([], this.xSize, this.ySize, 
                                       this.xMapper, this.yMapper);
    if (this.startTime) {
        var iterator = this.eventSource.getEventIterator(this.startTime,
                                                         this.endTime);
        while (iterator.hasNext()) {
            var endpoints = Timegrid.MonthLayout.getEndpoints(iterator.next());
            this.eventGrid.addAll(endpoints);
        }
    }
};

Timegrid.MonthLayout.prototype.renderEvents = function(doc) {
    var eventContainer = doc.createElement("div");
    $(eventContainer).addClass("timegrid-events");
    var currentEvents = {};
    var currentCount = 0;
    for (x = 0; x < this.xSize; x++) {
        for (y = 0; y < this.ySize; y++) {
            var endpoints = this.eventGrid.get(x,y);
            var events = $.map(endpoints, function(e) { 
                return e.type == "start" ? e.event : null;
            });
            if (events.length) {
                eventContainer.appendChild(this.renderEventList(events, x, y));
            }
        }
    }
    return eventContainer;
};

Timegrid.MonthLayout.prototype.renderEventList = function(evts, x, y) {
    console.log(evts);
    var jediv = $("<div></div>").addClass("timegrid-event");
    var eList = $("<ul></ul>").addClass("timegrid-event-list");
    for (i in evts) {
        eList.append($('<li>' + evts[i].getText() + '</li>'));
    }
    jediv.append(eList);
    jediv.css("height", this.yCell).css("width", this.xCell + "%");
    jediv.css("top", this.yCell * y);
    jediv.css("left", this.xCell * x + '%');
    return jediv.get()[0]; // Return the actual DOM element
};

Timegrid.MonthLayout.prototype.getXLabels = function() {
    return Date.dayNames;
};

Timegrid.MonthLayout.prototype.getYLabels = function() {
    return [ "Week 1", "Week 2", "Week 3", "Week 4", "Week 5" ];
};

Timegrid.MonthLayout.getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
};

Timegrid.MonthLayout.getStartOfMonth = function(date) {
    if (date) {
        var startTime = new Date(date);
        startTime.setDate(1);
        startTime.setHours(0);
        return startTime;
    }
};


Timegrid.MonthLayout.getEndOfMonth = function(date) {
    if (date) {
        var endTime = new Date(date);
        endTime.setDate(endTime.getDaysInMonth());
        endTime.setHours(24);
        return endTime;
    }
    return false;
};
