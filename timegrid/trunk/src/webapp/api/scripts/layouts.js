/******************************************************************************
 * Layouts
 *   This is where we define all of the different default layouts that Timegrid
 *   is capable of, e.g. month, week, n-day, etc.
 *****************************************************************************/

Timegrid.DEFAULT_LAYOUT = "week";
Timegrid.LayoutFactory = new Object();

/**
 * Instantiates a Timegrid layout with the given parameter hash.
 *
 * @param {String} name the name of the layout
 * @param eventSource an EventSource object to layout and render
 * @param params a hash of parameters to be passed into the desired layout
 * @return a Timegrid.Layout instance of the specified subclass
 */
Timegrid.LayoutFactory.createLayout = function(name, eventSource, params) {
    var layout = new Timegrid.WeekLayout(params);
    layout.initializeGrid(eventSource);
    return layout;
};

Timegrid.Layout = new function() {
    this.a = "a";
};

Timegrid.Layout.prototype.render = new function(parentNode) {

};

Timegrid.Layout.prototype.initializeGrid = new function(eventSource) {
    this.eventSource = eventSource;
    this.eventGrid = new EventGrid([], this.xSize, this.ySize, 
                                   this.xMapper, this.yMapper);
    var iterator = eventSource.getAllEventIterator();
    while (iterator.hasNext()) {
        this.eventGrid.add(iterator.next());
    }
};

Timegrid.WeekLayout = new function(params) {
    this.xSize = 7;
    this.ySize = 24;
    this.xMapper = function(evt) { return evt.getStart().getDay(); };
    this.yMapper = function(evt) { return evt.getStart().getHours(); };
};
Timegrid.WeekLayout.prototype = new Timegrid.Layout();

Timegrid.MonthLayout = new function(params) {
    this.xSize = 7;
    this.ySize = 5;
    this.xMapper = function(evt) {};
    this.yMapper = function(evt) {};
};
Timegrid.MonthLayout.prototype = new Timegrid.Layout();
