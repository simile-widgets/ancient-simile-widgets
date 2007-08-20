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
 * @class Layout is the base class for all layouts that Timegrid supports.
 * @constructor
 */
Timegrid.Layout = function(eventSource, params) {
    var self = this;
    this.params = params;
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
    this.timezoneMapper = function(date) { 
        if (typeof self.timezoneoffset != "undefined") {
            return date.toTimezone(self.timezoneoffset);
        }
        return date;
    };
    this.xMapper = function(obj) { return self.timezoneMapper(obj.time); };
    this.yMapper = function(obj) { return self.timezoneMapper(obj.time); };
    
    this.xLabelHeight = 24;
    this.yLabelWidth = 48;
    this.tabHeight = 18;
};

Timegrid.Layout.prototype.addXMapper = function(f) {
    var old = this.xMapper;
    this.xMapper = function(obj) { return f(old(obj)); };
};

Timegrid.Layout.prototype.addYMapper = function(f) {
    var old = this.yMapper;
    this.yMapper = function(obj) { return f(old(obj)); };
};

Timegrid.Layout.prototype.configure = function(params) {
    for (attr in params) {
        this[attr] = params[attr.toLowerCase()];
    }
};

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
 * @param the parent element
 * @return a rendered DOM tree descended from a div element
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
        this.width = this.gridwidth || $(this._container).width(); 
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

Timegrid.Layout.prototype.renderEvents = Timegrid.abstract("renderEvents");

Timegrid.Layout.prototype.renderGridlines = function(doc) {
    var gridlineContainer = document.createElement("div");
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

Timegrid.Layout.prototype.renderXLabels = function() {
    var xLabelContainer = document.createElement("div");
    xLabelContainer.className = 'timegrid-xlabels-window';
    xLabelContainer.style.height = this.xLabelHeight + "px";
    xLabelContainer.style.width = this.width - this.yLabelWidth + "px";
    xLabelContainer.style.right = this.scrollwidth + "px";
    xLabelContainer.style.left = this.yLabelWidth + "px";
    
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

Timegrid.Layout.prototype.renderYLabels = function() {
    var yLabelContainer = document.createElement("div");
    yLabelContainer.className = 'timegrid-ylabels-window';
    yLabelContainer.style.width = this.yLabelWidth + "px";
    yLabelContainer.style.height = this.height - this.xLabelHeight + "px";
    yLabelContainer.style.top = this.xLabelHeight + "px";
    yLabelContainer.style.bottom = this.scrollwidth + "px";
    
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

Timegrid.Layout.prototype.getXLabels = Timegrid.abstract("getXLabels");

Timegrid.Layout.prototype.getYLabels = Timegrid.abstract("getYLabels");
