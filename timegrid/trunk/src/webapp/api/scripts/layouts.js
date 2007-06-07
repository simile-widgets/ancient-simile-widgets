/******************************************************************************
 * Layouts
 *   This is where we define the entrypoint for  all of the different default 
 *   layouts that Timegrid is capable of, e.g. month, week, n-day, etc.
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

Timegrid.Layout = function() {
    this.xSize = 0;
    this.ySize = 0;
    this.xMapper = function() {};
    this.yMapper = function() {};
};