/******************************************************************************
 * WeekLayout
 * @fileoverview
 *   This is where the weekly layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author masont
 *****************************************************************************/
 
 /**
  * Constructs a WeekLayout object.
  * @class WeekLayout is a subclass of Layout that implements a weekly event
  *     calendar, modeled off of the weekly view found in Google Calendar.
  * @extends Timegrid.Layout
  * @constructor
  */
Timegrid.WeekLayout = function(params) {
    Timegrid.WeekLayout.superclass.call(this, params);
    this.xSize = 7;
    this.ySize = 24;
    this.xMapper = function(obj) { return obj.time.getDay(); };
    this.yMapper = function(obj) { return obj.time.getHours(); };
    
    // These are default values that can be overridden in configure
    this.height = 500.0;
    this.width = 700.0;
    
    this.configure(params);
    
    this.xCell = this.xCell || 100.0 / this.xSize; // x positions are calculated in %
    this.yCell = this.yCell || (this.gridheight - 1) / this.ySize; // y positions are pixels
};
$.inherit(Timegrid.WeekLayout, Timegrid.Layout);

Timegrid.WeekLayout.prototype.initializeGrid = function(eventSource) {
    this.eventSource = eventSource;
    this.eventGrid = new Timegrid.Grid([], this.xSize, this.ySize, 
                                           this.xMapper, this.yMapper);
    this.startTime = eventSource.getEarliestDate();
    if (this.startTime) {
        // Here we compute the end of the week based on start time
        this.endTime = new Date(this.startTime);
        this.endTime.setDate(this.endTime.getDate() + 
                             (6 - this.endTime.getDay()));
        this.endTime.setHours(24);
        // We only want events for one week
        var iterator = eventSource.getEventIterator(this.startTime,
                                                    this.endTime);
        while (iterator.hasNext()) {
            var endpoints = Timegrid.WeekLayout.getEndpoints(iterator.next());
            this.eventGrid.addAll(endpoints);
        }
    }
};

Timegrid.WeekLayout.prototype.renderEvents = function(doc) {
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

Timegrid.WeekLayout.prototype.renderEvent = function(evt, x, y) {
    var jediv = $("<div>" + evt.getText() + "</div>");
    jediv.addClass("timegrid-event");
    jediv.css("height", this.yCell * evt.getInterval().hours);
    jediv.css("top", this.yCell * y);
    jediv.css("left", this.xCell * x + '%');
    return jediv.get()[0]; // Return the actual DOM element
};

Timegrid.WeekLayout.prototype.getXLabels = function() {
    return [ "Sunday", "Monday", "Tuesday", "Wednesday",
             "Thursday", "Friday", "Saturday" ];
};

Timegrid.WeekLayout.prototype.getYLabels = function() {
    return [ "12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am",
             "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
             "6pm", "7pm", "8pm", "9pm", "10pm", "11pm" ];
};

Timegrid.WeekLayout.getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
};

