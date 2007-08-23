/**
 * @name Timegrid.PropertyLayout
 * @author masont
 */

/**
 * PropertyLayout is a subclass of Layout that provides Timegrid with layouts
 * that place events into rows and columns based on arbitrary properties, in
 * addition to temporal values (hour, day, week, etc.).
 *
 * @constructor
 */
Timegrid.PropertyLayout = function(eventSource, params) {
    Timegrid.PropertyLayout.superclass.call(this, eventSource, params);
    var self = this;
    
    this.xSize = 0;
    this.ySize = 0;
    this.iterable = false;
    this.title = Timegrid.PropertyLayout.l10n.makeTitle();
    this.property = "title";

    this.xMapper = function(obj) {
        return self.values.indexOf(obj.event.getProperty(self.property));
    };
    this.yMapper = function(obj) { 
        var time = self.timezoneMapper(obj.time);
        return (time.getHours() + time.getMinutes() / 60.0) - self.dayStart;
    };

    this.configure(params);

    this.dayEnd = this.dayend || 24;
    this.dayStart = this.daystart || 0;
    this.ySize  = this.dayEnd - this.dayStart;    

    this.eventSource = eventSource;
    this.initializeGrid();
};
Timegrid.LayoutFactory.registerLayout("property", Timegrid.PropertyLayout);

Timegrid.PropertyLayout.prototype.initializeGrid = function() {
    this.startTime   = new Date(this.eventSource.getEarliestDate()) || new Date();
    this.endTime     = new Date(this.eventSource.getLatestDate()) || new Date();
    this.values      = new DStructs.Array();
    this.updateGrid();
};

Timegrid.PropertyLayout.prototype.updateGrid = function() {
    this.computeDimensions();
    this.eventGrid = new Timegrid.Grid([], this.xSize, this.ySize,
                                       this.xMapper, this.yMapper);
    if (this.startTime) {
        var iterator = this.eventSource.getEventIterator(this.startTime,
                                                         this.endTime);
        while (iterator.hasNext()) {
            var eps = Timegrid.PropertyLayout.getEndpoints(iterator.next());
            this.eventGrid.addAll(eps);
        }
    }
};

Timegrid.PropertyLayout.prototype.computeDimensions = function() {
    var iterator = this.eventSource.getEventIterator(this.startTime,
                                                     this.endTime);
    this.values.clear();
    while (iterator.hasNext()) {
        this.values.push(iterator.next().getProperty(this.property));
    }
    this.values = this.values.uniq();
    this.xSize = this.values.length;
};

Timegrid.PropertyLayout.prototype.renderEvents = function(doc) {
    var eventContainer = doc.createElement("div");
    $(eventContainer).addClass("timegrid-events");
    var currentEvents = {};
    var currentCount = 0;
    for (x = 0; x < this.xSize; x++) {
        for (y = 0; y < this.ySize; y++) {
            var endpoints = this.eventGrid.get(x,y).sort(function(a, b) {
                return a.time - b.time;
            });
            for (var i = 0; i < endpoints.length; i++) {
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

Timegrid.PropertyLayout.prototype.renderEvent = function(evt, x, y) {
    var jediv = this.mini ? $("<div><div></div></div>") : 
                            $("<div><div>" + evt.getText() + "</div></div>");
    var length = (evt.getEnd() - evt.getStart()) / (1000 * 60 * 60.0);
    jediv.addClass("timegrid-event");
    if (!this.mini) {
        jediv.addClass('timegrid-rounded-shadow');
    }
    jediv.css("height", this.yCell * length);
    jediv.css("top", this.yCell * y);
    jediv.css("left", this.xCell * x + '%');
    if (evt.getColor()) { jediv.css('background-color', evt.getColor()); }
    if (evt.getTextColor()) { jediv.css('color', evt.getTextColor()); }
    return jediv.get()[0]; // Return the actual DOM element
};

Timegrid.PropertyLayout.prototype.getXLabels = function() {
    return this.values;
};

Timegrid.PropertyLayout.prototype.getYLabels = function() {
    var date = (new Date()).clearTime();
    var labels = [];
    for (var i = +this.dayStart; i < +this.dayEnd; i++) {
        date.setHours(i);
        labels.push(date.format(Timegrid.PropertyLayout.l10n.yLabelFormat));
    }
    return labels;
};

Timegrid.PropertyLayout.getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
};
