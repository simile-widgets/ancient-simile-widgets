/******************************************************************************
 * NDayLayout
 * @fileoverview
 *   This is where the n-day layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author masont
 *****************************************************************************/
 
 /**
  * Constructs an NDayLayout object.
  * @class NDayLayout is a subclass of Layout that implements an n-day event
  *   calendar, modeled off of the weekly view found in Google Calendar.
  * @extends Timegrid.Layout
  * @constructor
  */
Timegrid.NDayLayout = function(eventSource, params) {
    Timegrid.NDayLayout.superclass.call(this, eventSource, params);
    var self = this;
    
    // Specifications for a week layout
    this.xSize = 7;
    this.ySize = 24;
    this.iterable = true;
        
    // These are default values that can be overridden in configure
    this.n = 3;

    this.xMapper = function(obj) { 
        var time = self.timezoneMapper(obj.time);
        var start = self.timezoneMapper(self.startTime);
        var ivl = new SimileAjax.DateTime.Interval(time - start); 
        return ivl.days; 
    };
    this.yMapper = function(obj) { 
        var time = self.timezoneMapper(obj.time);
        return (time.getHours() + time.getMinutes() / 60.0) - self.dayStart;
    };
    
    this.configure(params);
    
    this.title = params.title || Timegrid.NDayLayout.l10n.makeTitle(this.n);
    this.xSize = this.n;
    this.dayEnd = this.dayend || 24;
    this.dayStart = this.daystart || 0;
    this.ySize  = this.dayEnd - this.dayStart;
    this.computeCellSizes();
    
    this.eventSource = eventSource;
    this.initializeGrid(eventSource);
};
Timegrid.LayoutFactory.registerLayout("n-day", Timegrid.NDayLayout);

Timegrid.NDayLayout.prototype.initializeGrid = function() {
    this.startTime = this.computeStartTime();
    this.startTime.setHours(0);
    this.endTime = this.computeEndTime(this.startTime); 
    
    this.updateGrid();
};

Timegrid.NDayLayout.prototype.updateGrid = function() {
    var now = new Date();
    if (now.isBetween(this.startTime, this.endTime)) { this.now = now; }
    
    this.endpoints = [];
    if (this.startTime) {
        var iterator = this.eventSource.getEventIterator(this.startTime,
                                                         this.endTime);
        while (iterator.hasNext()) {
            var ends = Timegrid.NDayLayout.getEndpoints(iterator.next());
            this.endpoints.push(ends[0]);
            this.endpoints.push(ends[1]);
        }
    }
    this.endpoints.sort(function(a, b) { 
        var diff = a.time - b.time;
        if (!diff) {
            return a.type == "start" ? 1 : -1;
        } else {
            return diff;
        }
    });
};

Timegrid.NDayLayout.prototype.renderEvents = function(doc) {
    var eventContainer = doc.createElement("div");
    $(eventContainer).addClass("timegrid-events");
    var currentEvents = {};
    var currentCount = 0;
    for (var i = 0; i < this.endpoints.length; i++) {
        var endpoint = this.endpoints[i];
        var x = this.xMapper(endpoint);
        var y = this.yMapper(endpoint);
        if (endpoint.type == "start") {
            // Render the event
            var eventDiv = this.renderEvent(endpoint.event, x, y);
            eventContainer.appendChild(eventDiv);
            // Push the event div onto the current events set
            currentEvents[endpoint.event.getID()] = eventDiv;
            currentCount++;
            // Adjust widths and offsets as necessary
            var hIndex = 0;
            for (var id in currentEvents) {
                var eDiv = currentEvents[id];
                var newWidth = this.xCell / currentCount;
                var newLeft = this.xCell * x + newWidth * hIndex;
                $(eDiv).css("width", newWidth + "%");
                $(eDiv).css("left", newLeft + "%");
                hIndex++;
            }
        } else if (endpoint.type == "end") {
            // Pop event from current events set
            delete currentEvents[endpoint.event.getID()];
            currentCount--;
        }
    }
    var nowDiv = this.renderNow();
    if (nowDiv) { 
        return $([eventContainer, nowDiv]); 
    } else {
        return eventContainer;
    }
};

Timegrid.NDayLayout.prototype.renderEvent = function(evt, x, y) {
    var ediv = document.createElement('div');
    var tediv = document.createElement('div');
    if (!this.mini) { tediv.innerHTML = evt.getText(); }
    ediv.appendChild(tediv);
    var length = (evt.getEnd() - evt.getStart()) / (1000 * 60 * 60.0);
    var className = "timegrid-event";
    if (!this.mini) {
       className += ' timegrid-rounded-shadow';
    }
    ediv.className = className;
    ediv.style.height = this.yCell * length + "px";
    ediv.style.top = this.yCell * y + "px";
    ediv.style.left = this.xCell * x + '%';
    if (evt.getColor()) { ediv.style.backgroundColor = evt.getColor(); }
    if (evt.getTextColor()) { ediv.style.color = evt.getTextColor(); }
    return ediv; // Return the actual DOM element
};

Timegrid.NDayLayout.prototype.renderNow = function() {
    // If we aren't looking at the current time, return
    if (!this.now) { return; }
    
    var nowX = this.xMapper({ time: this.now });
    var nowY = Math.floor(this.yMapper({ time: this.now }));
    
    var rectDiv = $('<div></div>').addClass('timegrid-week-highlights');
    var yRect = $('<div></div>').height(this.yCell + "px")
                                .width(this.xCell * this.xSize + "%")
                                .css('top', nowY * this.yCell + "px")
                                .addClass('timegrid-week-highlight');
    var xRect = $('<div></div>').height(this.yCell * this.ySize + "px")
                                .width(this.xCell + "%")
                                .css('left', nowX * this.xCell + "%")
                                .addClass('timegrid-week-highlight');
    rectDiv.append(xRect).append(yRect);
    return rectDiv.get(0);
};

Timegrid.NDayLayout.prototype.getXLabels = function() {
    var date = new Date(this.startTime);
    var labels = [];
    var format = this.mini ? Timegrid.NDayLayout.l10n.mini.xLabelFormat :
                             Timegrid.NDayLayout.l10n.xLabelFormat;
    while (date < this.endTime) {
        labels.push(date.format(format));
        date.setHours(24);
    }
    return labels;
};

Timegrid.NDayLayout.prototype.getYLabels = function() {
    var date = (new Date()).clearTime();
    var labels = [];
    var format = this.mini ? Timegrid.NDayLayout.l10n.mini.yLabelFormat :
                             Timegrid.NDayLayout.l10n.yLabelFormat;
    for (var i = +this.dayStart; i < +this.dayEnd; i++) {
        date.setHours(i);
        labels.push(date.format(format));
    }
    return labels;
};

Timegrid.NDayLayout.prototype.goPrevious = function() {
    this.endTime = this.startTime;
    this.startTime = this.computeStartTime(this.endTime);
    this.updateGrid();
    this.render();
};

Timegrid.NDayLayout.prototype.goNext = function() {
    this.startTime = this.endTime;
    this.endTime = this.computeEndTime(this.startTime);
    this.updateGrid();
    this.render();
};

Timegrid.NDayLayout.prototype.getCurrent = function() {
    this.endTime.add('s', -1);
    var result = Timegrid.NDayLayout.l10n.makeRange(this.startTime,
                                                    this.endTime);
    this.endTime.add('s', 1);
    return result;
};

Timegrid.NDayLayout.prototype.computeStartTime = function(date) {
    if (date) {
        var startTime = new Date(date);
        startTime.add('d', 0 - this.n);
        startTime.setHours(0);
        return startTime;
    } else {
        var startTime = new Date(this.eventSource.getEarliestDate()) ||
                        new Date();
        startTime.clearTime();
        return startTime;
    }
};

Timegrid.NDayLayout.prototype.computeEndTime = function(date) {
    if (date) {
        var endTime = new Date(date);
        endTime.add('d', this.n);
        endTime.setHours(0);
        return endTime;
    }
    return false;
};

Timegrid.NDayLayout.getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
};

