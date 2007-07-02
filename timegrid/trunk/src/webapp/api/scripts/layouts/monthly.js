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
    this.width = 600.0;
    
    this.configure(params);
    
    // Compute the cell sizes for the grid
    this.gridheight = this.gridheight || this.height - this.scrollwidth;
    this.xCell = this.xCell || 100.0 / this.xSize;
    this.yCell = this.yCell || (this.gridheight - 1) / this.ySize;

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
            for (i in endpoints) {
                var endpoint = endpoints[i];
                if (endpoint.type == "start") {
                    // Render the event
                    var eventDiv = this.renderEvent(endpoint.event, x, y);
                    eventContainer.appendChild(eventDiv);
                    // Push the event div onto the current events set
                    currentEvents[endpoint.event.getID()] = eventDiv;
                    currentCount++;
                    // Adjust widths and offsets as necessary
                    var hIndex = 0;
                    for (id in currentEvents) {
                        var eDiv = currentEvents[id];
                        var newWidth = this.xCell / currentCount;
                        $(eDiv).css("width", newWidth + "%");
                        $(eDiv).css("left", this.xCell * x + newWidth * hIndex + "%");
                        hIndex++;
                    }
                } else if (endpoint.type == "end") {
                    // Pop event from current events set
                    delete currentEvents[endpoint.event.getID()];
                    currentCount--;
                }
            }
        }
    }
    return eventContainer;
};

Timegrid.MonthLayout.prototype.renderEvent = function(evt, x, y) {
    var jediv = $("<div>" + evt.getText() + "</div>");
    jediv.addClass("timegrid-event");
    jediv.css("height", this.yCell);
    jediv.css("top", this.yCell * y);
    jediv.css("left", this.xCell * x + '%');
    return jediv.get()[0]; // Return the actual DOM element
};

Timegrid.MonthLayout.prototype.getXLabels = function() {
    return Date.dayNames;
};

Timegrid.MonthLayout.prototype.getYLabels = function() {
    return [ "1", "2", "3", "4", "5" ];
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
