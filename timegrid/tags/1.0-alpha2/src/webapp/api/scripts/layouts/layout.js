/**
 * @fileOverview
 *   This is where we define the entrypoint for  all of the different default 
 *   layouts that Timegrid is capable of, e.g. month, week, n-day, etc. Both
 *   LayoutFactory and the common Layout superclass are defined in this file.
 * @author masont
 */

/**
 * Constructs a LayoutFactory object.
 *
 * @class LayoutFactory is a simple factory class that abstracts the process of
 *     selecting and instantiating Layout objects.
 * @constructor
 */
Timegrid.LayoutFactory = function() {};

Timegrid.LayoutFactory._constructors = {};

/**
 * Registers a layout class with this layout factory.  Automatically places the
 * given layout under the common Layout superclass, and binds the name string
 * to the constructor.
 *
 * @param {String} name the name to bind to the given constructor
 * @param {Function} constructor the constructor to a layout class
 */
Timegrid.LayoutFactory.registerLayout = function(name, constructor) {
    $.inherit(constructor, Timegrid.Layout);
    Timegrid.LayoutFactory._constructors[name] = constructor;
};

/**
 * Instantiates a Timegrid layout with the given parameter hash.
 *
 * @param {String} name the name of the layout
 * @param {EventSource} eventSource an EventSource object to layout and render
 * @param params a hash of parameters to be passed into the desired layout
 * @return {Timegrid.Layout} a Timegrid.Layout instance of the specified subclass
 */
Timegrid.LayoutFactory.createLayout = function(name, eventSource, params) {
    var constructor = Timegrid.LayoutFactory._constructors[name];
    if (typeof constructor == 'function') {
        layout = new constructor(eventSource, $.clone(params));
        return layout;
    } else {
        throw "No such layout!";   
    };
    return;
};

/**
 * Instantiates a Layout object. This constructor should always be overridden.
 *
 * @class Layout is the base class for all layouts that Timegrid supports.
 * @constructor
 * @param {EventSource} eventSource the eventSource to pull events from
 * @param {Object} params a parameter hash
 */
Timegrid.Layout = function(eventSource, params) {
    var self = this;
    /**
     * An object containing a parameter hash
     * @type Object
     */
    this.params = params;
    /**
     * The number of columns in the grid
     * @type Number
     */
    this.xSize = 0;
    /**
     * The number of rows in the grid
     * @type Number
     */
    this.ySize = 0;
    /**
     * A function to map date objects to a custom timezone
     * @type Function
     */
    this.timezoneMapper = function(date) { 
        if (typeof self.timezoneoffset != "undefined") {
            return date.toTimezone(self.timezoneoffset);
        }
        return date;
    };
    /**
     * A function to map endpoints to an integer x-coordinate
     * @type Function
     */
    this.xMapper = function(obj) { return self.timezoneMapper(obj.time); };
    /**
     * A function to map endpoints to an integer y-coordinate
     * @type Function
     */
    this.yMapper = function(obj) { return self.timezoneMapper(obj.time); };
    /**
     * The height of the horizontal labels in pixels
     * @type Number
     */
    this.xLabelHeight = 24;
    /**
     * The width of the vertical labels in pixels
     * @type Number
     */
    this.yLabelWidth = 48;
    /**
     * The height of the tabs that page between views in pixels
     * @type Number
     */
    this.tabHeight = 18;
};

/**
 * Takes a parameter hash and extends this layout with it, flattening key names
 * to lowercase as it goes.  This is done to eliminate browser-specific
 * attribute case sensitivity.
 *
 * @param {Object} params a parameter hash
 */
Timegrid.Layout.prototype.configure = function(params) {
    for (var attr in params) {
        this[attr] = params[attr.toLowerCase()];
    }
};

/**
 * Computes the grid dimensions (gridheight, gridwidth, ycell, xcell) for this
 * layout.  This is relatively complex since any of the above values can be
 * either user-specified or computed.
 */
Timegrid.Layout.prototype.computeCellSizes = function() {
    // Compute the cell sizes for the grid
    this.xCell = this.params.xCell || this.params.xcell || 100.0 / this.xSize;
    this.yCell = this.params.yCell || this.params.ycell ||
                 (this.gridheight - 1) / this.ySize;
    if (this.params.yCell || this.params.ycell) {
        this.gridheight = this.yCell * this.ySize;
    }
    if (this.params.xCell || this.params.xcell) {
        this.gridwidth = this.xCell * this.xSize;
    }
};

/**
 * Renders out this layout into a DOM object with a wrapping div element as its
 * parent, returning the div.
 *
 * @param {Element} container the parent element
 * @return {Element} a rendered DOM tree descended from a div element
 */
Timegrid.Layout.prototype.render = function(container) {
    if (this.mini) {
        this.scrollwidth = 0;
        this.tabHeight = 0;
        this.xLabelHeight = 24;
        this.yLabelWidth = 24;
    }
    if (!(this.params.height && this.params.gridheight)) {
        this.scrollwidth = 0;
    }
    if (container) {
        this._container = container;
        this._viewDiv = $("<div></div>").addClass('timegrid-view')
                                        .css('top', this.tabHeight + "px");
        $(this._container).append(this._viewDiv);
    } else { 
        this._viewDiv.empty();
    }
    var gridDiv = $('<div></div>').addClass('timegrid-grid');
    var gridWindowDiv = $('<div></div>').addClass('timegrid-grid-window');
    if (!this.scrollwidth) { gridWindowDiv.css('overflow', 'visible'); }
    
    if (!this.params.height) { 
        this.height = this._container.style.height ? 
            $(this._container).height() : 3 + this.scrollwidth + this.tabHeight
                                            + this.xLabelHeight + 
                                              (this.gridheight || 500); 
    }
    $(this._container).height(this.height + "px");
    if (!this.params.width) { 
        this.width = this.params.gridwidth || $(this._container).width(); 
    } else {
        $(this._container).width(this.width + "px");
    }
    $(this._container).css('position', 'relative');
    this._viewDiv.height(this.height - this.tabHeight + "px");

    gridWindowDiv.css("top", this.xLabelHeight).css("left", this.yLabelWidth)
                 .css("right", "0px").css("bottom", "0px");
    this._viewDiv.append(gridWindowDiv.append(gridDiv));
    
    var windowHeight = this._viewDiv.height() - gridWindowDiv.position().top - 2;
    var windowWidth = this._viewDiv.width() - gridWindowDiv.position().left - 2;
    gridWindowDiv.height(windowHeight).width(windowWidth);
    
    this.gridwidth = this.gridwidth || gridWindowDiv.width() - this.scrollwidth;
    this.gridheight = this.gridheight || gridWindowDiv.height() - this.scrollwidth;
    gridDiv.height(this.gridheight + "px").width(this.gridwidth + "px");
    this.computeCellSizes();
    this._gridDiv = gridDiv;
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
    
    if (!this.mini) {
        if ($.browser.msie) {
            $('.timegrid-view:visible .timegrid-rounded-shadow', 
              this._container).prettybox(4,0,0,1);
        } else {
            $('.timegrid-view:visible .timegrid-rounded-shadow', 
              this._container).prettybox(4,7,1,0.7);
        }
    }

    return this._viewDiv.get(0);
};

Timegrid.Layout.prototype.renderChanged = function() {
    this.initializeGrid();
    this._gridDiv.empty();
    this._gridDiv.append(this.renderEvents(document));
    this._gridDiv.append(this.renderGridlines(document));
    if (this.renderedStartTime && this.renderedStartTime != this.startTime) {
        this.renderXLabels();
        this.renderYLabels();
    }
    this.renderedStartTime = this.startTime;
    if (!this.mini) {
        if ($.browser.msie) {
            $('.timegrid-view:visible .timegrid-rounded-shadow', 
              this._container).prettybox(4,0,0,1);
        } else {
            $('.timegrid-view:visible .timegrid-rounded-shadow', 
              this._container).prettybox(4,7,1,0.7);
        }
    }
};

/**
 * An abstract method to render events for this layout.  This method is where
 * specific layout implementations hook into the main rendering loop.  While 
 * generally used to render events, this method can return any valid input to
 * the jQuery <code>append</code> method, which is then appended under the grid
 * <code>div</code> element.
 * 
 * @function
 * @param {Document} doc the document to create elements from
 * @return {Content} any valid argument to jQuery's append, to be appended under
 *   the grid <code>div</code>
 */
Timegrid.Layout.prototype.renderEvents = Timegrid.abstract("renderEvents");

/**
 * Renders the gridlines for this layout.  Gridlines are represented in the DOM
 * as absolutely positioned <code>div</code> elements with one dimension set to
 * one pixel.
 *
 * @return {Element} a DOM element containing this layout's gridlines
 */
Timegrid.Layout.prototype.renderGridlines = function() {
    if (this._gridlineContainer) { return this._gridlineContainer; }
    var gridlineContainer = document.createElement("div");
    this._gridlineContainer = gridlineContainer;
    gridlineContainer.className = 'timegrid-gridlines';
    
    for (var x = 0; x < this.xSize; x++) { // Vertical lines
        var vlineDiv = document.createElement('div');
        vlineDiv.className = 'timegrid-vline';
        vlineDiv.style.height = this.gridheight + "px";
        vlineDiv.style.left = x * this.xCell + "%";
        gridlineContainer.appendChild(vlineDiv);
    }
    for (var y = 0; y <= this.ySize; y++) { // Horizontal lines
        var hlineDiv = document.createElement('div');
        hlineDiv.className = 'timegrid-hline';
        hlineDiv.style.width = "100%";
        hlineDiv.style.top = y * this.yCell + "px";
        gridlineContainer.appendChild(hlineDiv);
    }
    return gridlineContainer;
};

/**
 * Renders the horizontal column labels that run above the grid.  The labels 
 * themselves are provided by the implementing layout subclasses by
 * <code>getXLabels()</code>
 *
 * @return {Element} a DOM element containing the horizontal labels
 */
Timegrid.Layout.prototype.renderXLabels = function() {
    this._xLabelContainer = this._xLabelContainer ||
                            document.createElement("div");
    var xLabelContainer = this._xLabelContainer;
    xLabelContainer.innerHTML = "";
    xLabelContainer.className = 'timegrid-xlabels-window';
    xLabelContainer.style.height = this.xLabelHeight + "px";
    xLabelContainer.style.width = this.width - this.yLabelWidth - 
                                  this.scrollwidth - 2 + "px";
    xLabelContainer.style.left = this.yLabelWidth - 1 + "px";
    
    var xLabelsDiv = document.createElement("div");
    xLabelsDiv.className = 'timegrid-xlabels';
    xLabelsDiv.style.height = this.xLabelHeight + "px"
    xLabelsDiv.style.width = this.gridwidth + "px";
    xLabelsDiv.style.top = "0px";
    xLabelContainer.appendChild(xLabelsDiv);
    
    var labels = this.getXLabels();
    for (var i = 0; i < labels.length; i++) {
        var label = document.createElement("div");
        label.className = 'timegrid-label';
        label.innerHTML = labels[i];
        label.style.width = this.xCell + '%';
        label.style.left = (i * this.xCell) + '%';
        xLabelsDiv.appendChild(label);
    }    
    return xLabelContainer;
};

/**
 * Renders the vertical row labels that run along the side of the grid.  The 
 * labels themselves are provided by the implementing layout subclasses by
 * <code>getYLabels()</code>
 *
 * @return {Element} a DOM element containing the vertical labels
 */
Timegrid.Layout.prototype.renderYLabels = function() {
    this._yLabelContainer = this._yLabelContainer || 
                            document.createElement("div");
    var yLabelContainer = this._yLabelContainer;
    yLabelContainer.innerHTML = "";
    yLabelContainer.className = 'timegrid-ylabels-window';
    yLabelContainer.style.width = this.yLabelWidth + "px";
    yLabelContainer.style.height = this.height - this.xLabelHeight -
                                   this.scrollwidth - this.tabHeight - 2 + "px";
    yLabelContainer.style.top = this.xLabelHeight - 1 + "px";
    
    var yLabelsDiv = document.createElement("div");
    yLabelsDiv.className = 'timegrid-ylabels';
    yLabelsDiv.style.height = this.gridheight + "px";
    yLabelsDiv.style.width = this.yLabelWidth + "px";
    yLabelsDiv.style.left = "0px";
    yLabelContainer.appendChild(yLabelsDiv);
    
    var labels = this.getYLabels();
    var labelDivs = [];
    for (var i = 0; i < labels.length; i++) {
        var label = document.createElement('div');
        label.className = 'timegrid-label';
        label.innerHTML = labels[i];
        label.style.height = this.yCell + 'px';
        label.style.top = i * this.yCell + 'px';
        
        yLabelsDiv.appendChild(label);
    }
    
    return yLabelContainer;
};

/**
 * An abstract method to get the horizontal column labels for this layout.  This
 * method must be implemented by all layout types subclassing Layout.
 *
 * @function
 * @return {Array} an array of strings to use as column labels
 */
Timegrid.Layout.prototype.getXLabels = Timegrid.abstract("getXLabels");

/**
 * An abstract method to get the vertical row labels for this layout.  This
 * method must be implemented by all layout types subclassing Layout.
 *
 * @function
 * @return {Array} an array of strings to use as row labels
 */
Timegrid.Layout.prototype.getYLabels = Timegrid.abstract("getYLabels");
