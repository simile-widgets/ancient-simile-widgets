
Timegrid.WeekLayout = function(params) {
    Timegrid.WeekLayout.superclass.call(this, params);
    this.xSize = 7;
    this.ySize = 24;
    this.xMapper = function(obj) { return obj.time.getDay(); };
    this.yMapper = function(obj) { return obj.time.getHours(); };
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
            console.log(endpoints[0].time);
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
    var layoutDiv = doc.createElement("div");
    var table = doc.createElement("table");
    var thead = doc.createElement("tr");
    var days = ["", "Sunday", "Monday", "Tuesday", "Wednesday", 
                "Thursday", "Friday", "Saturday"];
    for (i in days) {
        var th = doc.createElement("th");
        th.innerHTML = days[i];
        thead.appendChild(th);
    }
    table.appendChild(thead);
    layoutDiv.appendChild(table);
    for (y = 0; y < this.ySize; y++) {
        var row = doc.createElement("tr");
        table.appendChild(row);
        var hcell = doc.createElement("td");
        hcell.innerHTML = "<h3>" + y + "</h3>";
        row.appendChild(hcell);
        for (x = 0; x < this.xSize; x++) {
            var cell = doc.createElement("td");
            var elist = doc.createElement("ul");
            var endpoints = this.eventGrid.get(x,y);
            row.appendChild(cell);
            cell.appendChild(elist);
            for (i in endpoints) {
                var ediv = doc.createElement("div");
                var jediv = $(ediv); // jQuery!
                var endpoint = endpoints[i];
                jediv.addClass("timegrid-event");
                jediv.css("height", 30 * event.getInterval().hours);
                ediv.innerHTML = event.getText();
                elist.appendChild(ediv);
            }
        }
    }
    
    return layoutDiv;
};

Timegrid.WeekLayout.getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
}

