/**
 * Controls
 */

Timegrid.Controls = {};

/*
 * A panel will render controls around a set of layouts.  This should be the
 * only entrypoint into this code, in addition to the render method.
 * Possible controls include:
 *    Switching between the layouts (tabs)
 *    Iterating through time, different weeks/months, etc (arrows)
 *    Switching between data sources
 * The style and selection of which types of controls to render in the panel
 * should be easily configurable through the params hash passed in.
 */
Timegrid.Controls.Panel = function(layouts, params) {
    this._layouts = layouts;
    this._titles = $.map(this._layouts, function(l) { return l.title; });
    this._tabSet = new Timegrid.Controls.TabSet(this._titles, this._layouts);
};

Timegrid.Controls.Panel.prototype.setLayouts = function(layouts) {
    this._layouts = layouts;
    this._titles = $.map(this._layouts, function(l) { return l.title; });
    this._tabSet.setLayouts(this._titles, this._layouts);
};

Timegrid.Controls.Panel.prototype.render = function(container) {
    this._tabSet.render(container);
    this._tabSet.switchTo(this._tabSet.current || this._titles[0]);
};

Timegrid.Controls.Panel.prototype.renderChanged = function() {
    this._tabSet.renderChanged();
    this._tabSet.switchTo(this._tabSet.current || this._titles[0]);
};

/*
 * TabSet is a style of control that generates a set of tabs.  These tabs can
 * be configured to switch between different views, time slices, or data
 * sources.
 */
Timegrid.Controls.TabSet = function(titles, layouts) {
    this.setLayouts(titles, layouts);
    this.current          = "";
};

Timegrid.Controls.TabSet.prototype.setLayouts = function(titles, layouts) {
    this._tabs            = {};
    this._renderedLayouts = {};
    this._iterators       = {};
    this._layoutMap = {};
    for (var i = 0; i < titles.length; i++) {
        this._layoutMap[titles[i]] = layouts[i];
    }
};

Timegrid.Controls.TabSet.prototype.render = function(container) {
    this._container = container;
    var self = this;
    var tabDiv = $('<div></div>').addClass('timegrid-tabs');
    $(container).prepend(tabDiv);
    var makeCallback = function(title) {
        return function() { self.switchTo(title); }; 
    };
    for (var lTitle in this._layoutMap) {
        var tab = $('<div><a href="javascript:void">' + lTitle + '</a></div>')
                    .height(this._layoutMap[lTitle].tabHeight + "px")
                    .click(makeCallback(lTitle))
                    .addClass('timegrid-tab').addClass('timegrid-rounded');
        tabDiv.prepend(tab);
        this._tabs[lTitle] = tab;
    }
    if (!$.browser.msie) { $('.timegrid-tab').corner("30px top"); }
};

Timegrid.Controls.TabSet.prototype.renderChanged = function() {
    var layout = this._layoutMap[this.current];
    layout.renderChanged();
};

Timegrid.Controls.TabSet.prototype.switchTo = function(title) {
    if (this.current && this._renderedLayouts[this.current]) { 
        this._renderedLayouts[this.current].hide();
        this._tabs[this.current].removeClass('timegrid-tab-active'); 
    }
    if (this._renderedLayouts[title]) {
        this._renderedLayouts[title].show();
    } else if (this._layoutMap[title]) {
        this._renderedLayouts[title] = $(this._layoutMap[title].render(this._container)).show();
    }
    if (this._iDiv) { $(this._iDiv).empty(); }
    if (this._layoutMap[title].iterable) {
        if (!this._iterators[title]) {
            this._iterators[title] = new Timegrid.Controls.Iterator(this._layoutMap[title]);
            this._iDiv = $(this._iterators[title].render(this._container));
        } else {
            this._iDiv = $(this._iterators[title].render());
        }
    }
    this.current = title;
    this._tabs[this.current].addClass('timegrid-tab-active');
};

/*
 * Iterator is a style of control that generates a textual label for the
 * current selection and a set of arrows for moving to either the previous
 * or next selection.  Can be used for views, time, or sources.
 */
Timegrid.Controls.Iterator = function(layout) {
    this._layout = layout;
};

Timegrid.Controls.Iterator.prototype.render = function(container) {
    if (container) {
        this._container = container;
        this._div = $('<div></div>').addClass('timegrid-iterator');
        $(this._container).prepend(this._div);
    } else {
        this._div.empty();
    }
    var self = this;
    var makePrevCallback = function(layout) {
        return function() {
            layout.goPrevious();
            self.render();
        };
    };
    var makeNextCallback = function(layout) {
        return function() {
            layout.goNext();
            self.render();
        };
    };
    var prevLink = $('<img alt="Previous" src="' + Timegrid.urlPrefix + '/images/go-previous.png"></img>')
                   .wrap('<a href="javascript:void"></a>').parent()
                   .addClass('timegrid-iterator-prev')
                   .click(makePrevCallback(this._layout));
    var nextLink = $('<img alt="Next" src="' + Timegrid.urlPrefix + '/images/go-next.png"></img>')
                   .wrap('<a href="javascript:void"></a>').parent()
                   .addClass('timegrid-iterator-next')
                   .click(makeNextCallback(this._layout));
    this._div.append(prevLink);
    this._div.append(nextLink);
    this._div.append('<span>' + this._layout.getCurrent() + '</span>');
    return this._div;
};
