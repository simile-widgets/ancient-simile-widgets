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

Timegrid.LayoutFactory._constructors = {};

Timegrid.LayoutFactory.registerLayout = function(name, constructor) {
    $.inherit(constructor, Timegrid.Layout);
    Timegrid.LayoutFactory._constructors[name] = constructor;
};

/**
 * Instantiates a Timegrid layout with the given parameter hash.
 *
 * @param {String} name the name of the layout
 * @param {Timegrid.DefaultEventSource} eventSource an EventSource object to layout and render
 * @param params a hash of parameters to be passed into the desired layout
 * @return {Timegrid.Layout} a Timegrid.Layout instance of the specified subclass
 */
Timegrid.LayoutFactory.createLayout = function(name, eventSource, config) {
    var constructor = Timegrid.LayoutFactory._constructors[name];
    if (typeof constructor == 'function') {
        layout = new constructor(eventSource, config);
        return layout;
    } else {
        throw "No such layout!";   
    };
    return;
};

/**
 * Instantiates a Layout object. This constructor should always be overridden.
 * @class Layout is the base class for all layouts that Timegrid supports.
 * @constructor
 */
Timegrid.Layout = function(eventSource, config) {
    this.config = config;
    var defaults = this.config.getRoot();
    /**
     * The number of columns in the grid.
     * @type int
     */
    defaults.set('xSize', 0);
    /**
     * The number of rows in the grid.
     * @type int
     */
    defaults.set('ySize', 0);
    defaults.set('xMapper', function(obj) { return 0; });
    defaults.set('yMapper', function(obj) { return 0; });
    
    defaults.set('xLabelHeight', "2em");
    defaults.set('yLabelWidth', "4em");
    
    defaults.set('height', 500);
};

Timegrid.Layout.prototype.configure = function(params) {
    for (attr in params) {
        this[attr] = params[attr];
    }
};

Timegrid.Layout.prototype.computeCellSizes = function() {
    var xSize = this.config.get('xSize');
    var ySize = this.config.get('ySize');
    var gridheight = this.config.get('gridheight');
    // Compute the cell sizes for the grid
    var defaults = this.config.getRoot();
    defaults.set('xCell', 100.0 / xSize);
    defaults.set('yCell', (gridheight - 1) / ySize);
};

/**
 * Renders out this layout into a DOM object with a wrapping div element as its
 * parent, returning the div.
 *
 * @param the parent element
 * @return a rendered DOM tree descended from a div element
 */
Timegrid.Layout.prototype.render = function(container) {
    var config = this.config;
    var defaults = config.getRoot();
    if (container) {
        this._container = container;
        this._viewDiv = $("<div></div>").addClass('timegrid-view');
        $(this._container).append(this._viewDiv);
    } else { 
        this._viewDiv.empty();
    }
    var gridDiv = $('<div></div>').addClass('timegrid-grid');
    var gridWindowDiv = $('<div></div>').addClass('timegrid-grid-window');
    
    if (this._container.style.height) { 
        defaults.set('height', $(this._container).height()); 
    }
    $(this._container).height(config.get('height') + "px");
    defaults.set('width', $(this._container).width()); 
    if (config.containsInThis('width')) {
        $(this._container).width(config.get('width') + "px");
    }
    $(this._container).css('position', 'relative');
    gridWindowDiv.css("top", config.get('xLabelHeight'))
                 .css("left", config.get('yLabelWidth'))
                 .css("right", "0px").css("bottom", "0px");
    this._viewDiv.append(gridWindowDiv.append(gridDiv));
    defaults.set('gridwidth', gridWindowDiv.width() - config.get('scrollwidth'));
    defaults.set('gridheight', gridWindowDiv.height() - config.get('scrollwidth'));
    gridDiv.height(config.get('gridheight') + "px")
           .width(config.get('gridwidth') + "px");
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
    this._viewDiv.append(xLabels).append(yLabels);
    $('.timegrid-view:visible .timegrid-rounded-shadow').prettybox(4,7,1,0.7);
    return this._viewDiv.get(0);
};

Timegrid.Layout.prototype.renderEvents = Timegrid.abstract("renderEvents");

Timegrid.Layout.prototype.renderGridlines = function(doc) {
    var config = this.config;
    var gridlineContainer = doc.createElement("div");
    $(gridlineContainer).addClass("timegrid-gridlines");
    for (var x = 0; x < config.get('xSize'); x++) { // Vertical lines
        var vlineDiv = $("<div></div>").addClass("timegrid-vline");
        vlineDiv.css("height", config.get('gridheight') + "px");
        vlineDiv.css("left", x * config.get('xCell') + "%");
        $(gridlineContainer).append(vlineDiv);
    }
    for (var y = 0; y <= config.get('ySize'); y++) { // Horizontal lines
        var hlineDiv = $("<div></div>").addClass("timegrid-hline");
        hlineDiv.css("width", "100%");
        hlineDiv.css("top", y * config.get('yCell'));
        $(gridlineContainer).append(hlineDiv);
    }
    return gridlineContainer;
};

Timegrid.Layout.prototype.renderXLabels = function() {
    var config = this.config;
    var xLabelContainer = $('<div></div>').addClass('timegrid-xlabels-window');
    var xLabelsDiv = $('<div></div>').width(config.get('width'));
    xLabelsDiv.height(config.get('xLabelHeight')).css("top", "0px");
    xLabelsDiv.width(config.get('gridwidth') + "px");
    xLabelContainer.append(xLabelsDiv.addClass('timegrid-xlabels'));
    xLabelContainer.height(config.get('xLabelHeight'));
    xLabelContainer.css("right", config.get('scrollwidth') + "px");
    xLabelContainer.css("left", config.get('yLabelWidth'));
    var labels = this.getXLabels();
    for (i in labels) {
        var label = $('<div class="timegrid-label">' + labels[i] + '</div>');
        label.width(config.get('xCell') + '%')
             .css('left', i * config.get('xCell') + '%');
        xLabelsDiv.append(label);
    }    
    return xLabelContainer.get(0);
};

Timegrid.Layout.prototype.renderYLabels = function() {
    var config = this.config;
    var yLabelContainer = $('<div></div>').addClass('timegrid-ylabels-window');
    var yLabelsDiv = $('<div></div>').height(config.get('gridheight') + "px");
    yLabelsDiv.width(config.get('yLabelWidth')).css("left", "0px");
    yLabelContainer.append(yLabelsDiv.addClass('timegrid-ylabels'));
    yLabelContainer.width(config.get('yLabelWidth'));
    yLabelContainer.css("top", config.get('xLabelHeight'));
    yLabelContainer.css("bottom", config.get('scrollwidth') + "px");
    var labels = this.getYLabels();
    for (i in labels) {
        var label = $('<div class="timegrid-label">' + labels[i] + '</div>');
        label.height(config.get('yCell') + 'px')
             .css('top', i * config.get('yCell') + 'px');
        yLabelsDiv.append(label);
    }
    return yLabelContainer.get(0);
};

Timegrid.Layout.prototype.getXLabels = Timegrid.abstract("getXLabels");

Timegrid.Layout.prototype.getYLabels = Timegrid.abstract("getYLabels");
