/******************************************************************************
 * Layouts
 *   This is where we define all of the different default layouts that Timegrid
 *   is capable of, e.g. month, week, n-day, etc.
 *****************************************************************************/

Timegrid.LayoutFactory = function() {};

/**
 * Instantiates a Timegrid layout with the given parameter hash.
 */
Timegrid.LayoutFactory.createLayout = function(name, eventSource, params) {
    var layout = new Timegrid.WeekLayout(params);
    layout.initializeGrid(eventSource);
    return layout;
};

Timegrid.Layout = new function() {};

Timegrid.Layout.render = new function() {

};

Timegrid.Layout.initializeGrid = new function(eventSource) {
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
