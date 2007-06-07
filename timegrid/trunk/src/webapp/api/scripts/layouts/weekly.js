
Timegrid.WeekLayout = function(params) {
    Timegrid.WeekLayout.superclass.call(this, params);
    this.xSize = 7;
    this.ySize = 24;
    this.xMapper = function(obj) { return obj.time.getDay(); };
    this.yMapper = function(obj) { return obj.time.getHours(); };
    
    this.height = 500.0;
    this.width = 700.0;
    this.xCell = 100.0 / this.xSize; // x positions are calculated in %
    this.yCell = (this.height - 1) / this.ySize;
    
    this.yCell = 40;
    this.configure(params);
};
Timegrid.extend(Timegrid.WeekLayout, Timegrid.Layout);

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

/**
 * Renders out this layout into a DOM object with a wrapping div element as its
 * parent, returning the div.
 *
 * @param the parent document
 * @return a rendered DOM tree descended from a div element
 */
Timegrid.WeekLayout.prototype.render = function(doc) {
    var timegridDiv = doc.createElement("div");
    timegridDiv.style.height = this.height;
    timegridDiv.style.width = this.width;
    $(timegridDiv).addClass("timegrid-container");
    timegridDiv.appendChild(this.renderEvents(doc));
    timegridDiv.appendChild(this.renderGridlines(doc));
    return timegridDiv;
};

Timegrid.WeekLayout.prototype.renderEvents = function(doc) {
    var eventContainer = doc.createElement("div");
    $(eventContainer).addClass("timegrid-events");
    var currentEvents = {};
    var currentCount = 0; // We need to keep track of how many 
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
                } else {
                    // Pop event from current events set
                    delete currentEvents[endpoint.event.getID()];
                    currentCount--;
                }
            }
        }
    }
    return eventContainer;
};

Timegrid.WeekLayout.prototype.renderGridlines = function(doc) {
    var gridlineContainer = doc.createElement("div");
    $(gridlineContainer).addClass("timegrid-gridlines");
    for (var x = 0; x < this.xSize; x++) {
        var vlineDiv = $("<div></div>").addClass("timegrid-vline");
        vlineDiv.css("height", this.ySize * this.yCell);
        vlineDiv.css("left", x * this.xCell + "%");
        $(gridlineContainer).append(vlineDiv);
    }
    for (var y = 0; y <= this.ySize; y++) {
        var hlineDiv = $("<div></div>").addClass("timegrid-hline");
        hlineDiv.css("width", "100%");
        hlineDiv.css("top", y * this.yCell);
        $(gridlineContainer).append(hlineDiv);
    }
    return gridlineContainer;
};

Timegrid.WeekLayout.prototype.renderEvent = function(evt, x, y) {
    var jediv = $("<div>" + evt.getText() + "</div>");
    jediv.addClass("timegrid-event");
    jediv.css("height", this.yCell * evt.getInterval().hours - 1);
    jediv.css("top", this.yCell * y);
    jediv.css("left", this.xCell * x + '%');
    return jediv.get()[0]; // Return the actual DOM element
};

Timegrid.WeekLayout.getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
};

