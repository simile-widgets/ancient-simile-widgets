/******************************************************************************
 * Layouts
 * @fileoverview
 *   This is where we define the entrypoint for  all of the different default 
 *   layouts that Timegrid is capable of, e.g. month, week, n-day, etc.
 * @author masont
 *****************************************************************************/

/**
 * Constructs a LayoutFactory object.
 *
 * @class LayoutFactory is a simple factory class that abstracts the process of
 *     selecting and instantiating Layout objects.
 * @constructor
 */
Timegrid.LayoutFactory = function() {};

/**
 * Instantiates a Timegrid layout with the given parameter hash.
 *
 * @param {String} name the name of the layout
 * @param {Timegrid.DefaultEventSource} eventSource an EventSource object to layout and render
 * @param params a hash of parameters to be passed into the desired layout
 * @return {Timegrid.Layout} a Timegrid.Layout instance of the specified subclass
 */
Timegrid.LayoutFactory.createLayout = function(name, eventSource, params) {
    var layout = new Timegrid.WeekLayout(params);
    layout.initializeGrid(eventSource);
    return layout;
};

/**
 * Instantiates a Layout object. This constructor should always be overridden.
 * @class Layout is the base class for all layouts that Timegrid supports.
 * @constructor
 */
Timegrid.Layout = function() {
    /**
     * The number of columns in the grid.
     * @type int
     */
    this.xSize = 0;
    /**
     * The number of rows in the grid.
     * @type int
     */
    this.ySize = 0;
    this.xMapper = function() {};
    this.yMapper = function() {};
};

Timegrid.Layout.prototype.configure = function(params) {

};