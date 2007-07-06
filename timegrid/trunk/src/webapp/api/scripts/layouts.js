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
    var constructor = Timegrid[$.capitalize($.trim(name)) + 'Layout'];
    var layout;
    if (typeof constructor == 'function') {
        layout = new constructor(eventSource, params);
        return layout;
    };
    return;
};

/**
 * Instantiates a Layout object. This constructor should always be overridden.
 * @class Layout is the base class for all layouts that Timegrid supports.
 * @constructor
 */
Timegrid.Layout = function(eventSource, params) {
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
    
    this.xLabelHeight = "2em";
    this.yLabelWidth = "4em";
};

Timegrid.Layout.prototype.configure = function(params) {
    for (attr in params) {
        this[attr] = params[attr];
    }
};

Timegrid.Layout.prototype.computeCellSizes = function() {
    // Compute the cell sizes for the grid
    this.xCell = this.xCell || 100.0 / this.xSize;
    this.yCell = this.yCell || (this.gridheight - 1) / this.ySize;
};

/**
 * Renders out this layout into a DOM object with a wrapping div element as its
 * parent, returning the div.
 *
 * @param the parent element
 * @return a rendered DOM tree descended from a div element
 */
Timegrid.Layout.prototype.render = function(container) {
    var viewDiv = $("<div></div>").addClass('timegrid-view');
    $(container).append(viewDiv);
    var gridDiv = $('<div></div>').addClass('timegrid-grid');
    var gridWindowDiv = $('<div></div>').addClass('timegrid-grid-window');
    
    viewDiv.height(this.height + "px");
    if (!this.width) { this.width = viewDiv.width(); }
    viewDiv.width(this.width + "px");  
    gridWindowDiv.css("top", this.xLabelHeight).css("left", this.yLabelWidth)
                 .css("right", "0px").css("bottom", "0px");
    viewDiv.append(gridWindowDiv.append(gridDiv));
    this.gridwidth = this.gridwidth || gridWindowDiv.width() - this.scrollwidth;
    this.gridheight = this.gridheight || gridWindowDiv.height() - this.scrollwidth;
    gridDiv.height(this.gridheight + "px").width(this.gridwidth + "px");
    this.computeCellSizes();
    gridDiv.append(this.renderEvents(document));
    gridDiv.append(this.renderGridlines(document));
    
    var xLabels = this.renderXLabels();
    var yLabels = this.renderYLabels();
    var syncHorizontalScroll = function(a, b) {
        $(a).scroll(function() { b.scrollLeft = a.scrollLeft; });
        $(b).scroll(function() { a.scrollLeft = b.scrollLeft; });
    };
    var syncVerticalScroll = function(a, b) {
        $(a).scroll(function() { b.scrollTop = a.scrollTop; });
        $(b).scroll(function() { a.scrollTop = b.scrollTop; });
    };
    syncVerticalScroll(yLabels, gridWindowDiv.get(0));
    syncHorizontalScroll(xLabels, gridWindowDiv.get(0));
    viewDiv.append(xLabels).append(yLabels);
    if (!container.style.width) { $(container).width(this.width + "px"); }
    return viewDiv.get(0);
};

Timegrid.Layout.prototype.renderEvents = Timegrid.abstract("renderEvents");

Timegrid.Layout.prototype.renderGridlines = function(doc) {
    var gridlineContainer = doc.createElement("div");
    $(gridlineContainer).addClass("timegrid-gridlines");
    for (var x = 0; x < this.xSize; x++) { // Vertical lines
        var vlineDiv = $("<div></div>").addClass("timegrid-vline");
        vlineDiv.css("height", this.gridheight + "px");
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

Timegrid.Layout.prototype.renderXLabels = function() {
    var xLabelContainer = $('<div></div>').addClass('timegrid-xlabels-window');
    var xLabelsDiv = $('<div></div>').width(this.width);
    xLabelsDiv.height(this.xLabelHeight).css("top", "0px");
    xLabelsDiv.width(this.gridwidth + "px");
    xLabelContainer.append(xLabelsDiv.addClass('timegrid-xlabels'));
    xLabelContainer.height(this.xLabelHeight);
    xLabelContainer.css("right", this.scrollwidth + "px");
    xLabelContainer.css("left", this.yLabelWidth);
    var labels = this.getXLabels();
    for (i in labels) {
        var label = $('<div class="timegrid-label">' + labels[i] + '</div>');
        label.width(this.xCell + '%').css('left', i * this.xCell + '%');
        xLabelsDiv.append(label);
    }    
    return xLabelContainer.get(0);
};

Timegrid.Layout.prototype.renderYLabels = function() {
    var yLabelContainer = $('<div></div>').addClass('timegrid-ylabels-window');
    var yLabelsDiv = $('<div></div>').height(this.gridheight + "px");
    yLabelsDiv.width(this.yLabelWidth).css("left", "0px");
    yLabelContainer.append(yLabelsDiv.addClass('timegrid-ylabels'));
    yLabelContainer.width(this.yLabelWidth);
    yLabelContainer.css("top", this.xLabelHeight);
    yLabelContainer.css("bottom", this.scrollwidth + "px");
    var labels = this.getYLabels();
    for (i in labels) {
        var label = $('<div class="timegrid-label">' + labels[i] + '</div>');
        label.height(this.yCell + 'px').css('top', i * this.yCell + 'px');
        yLabelsDiv.append(label);
    }
    return yLabelContainer.get(0);
};

Timegrid.Layout.prototype.getXLabels = Timegrid.abstract("getXLabels");

Timegrid.Layout.prototype.getYLabels = Timegrid.abstract("getYLabels");