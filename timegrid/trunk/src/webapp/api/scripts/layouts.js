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
    var constructor = Timegrid[$.trim($.capitalize(name)) + 'Layout'];
    var layout;
    if (typeof constructor == 'function') {
        layout = new constructor(params);
        layout.initializeGrid(eventSource);
        return layout;
    };
    return;
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
    this.xMapper = function(obj) { return 0; };
    this.yMapper = function(obj) { return 0; };
};

Timegrid.Layout.prototype.configure = function(params) {
    for (attr in params) {
        this[attr] = params[attr];
    }
};

Timegrid.Layout.prototype.render = function(doc) {
    throw "A render method must be provided for each layout.";
    return;
}

Timegrid.Layout.prototype.renderGridlines = function(doc) {
    var gridlineContainer = doc.createElement("div");
    $(gridlineContainer).addClass("timegrid-gridlines");
    gridlineContainer.style.height = this.ySize * this.yCell + "px";
    for (var x = 0; x < this.xSize; x++) { // Vertical lines
        var vlineDiv = $("<div></div>").addClass("timegrid-vline");
        vlineDiv.css("height", this.ySize * this.yCell);
        vlineDiv.css("left", x * this.xCell + "%");
        $(gridlineContainer).append(vlineDiv);
    }
    for (var y = 0; y <= this.ySize; y++) { // Horizontal lines
        var hlineDiv = $("<div></div>").addClass("timegrid-hline");
        hlineDiv.css("width", "100%");
        hlineDiv.css("top", y * this.yCell);
        $(gridlineContainer).append(hlineDiv);
    }
    return gridlineContainer;
};