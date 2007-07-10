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
};

Timegrid.Controls.Panel.prototype.render = function(container) {
    var first = true;
    var titles = $.map(this._layouts, function(l) { return l.title; });
    var tabSet = new Timegrid.Controls.TabSet(titles, this._layouts);
    tabSet.render(container);
    tabSet.switchTo(titles[0]);
};

/*
 * TabSet is a style of control that generates a set of tabs.  These tabs can
 * be configured to switch between different views, time slices, or data
 * sources.
 */
Timegrid.Controls.TabSet = function(titles, layouts) {
    this._layoutMap = {};
    for (i in titles) {
        this._layoutMap[titles[i]] = layouts[i];
    }
    this._tabs            = {};
    this._renderedLayouts = {};
    this._iterators       = {};
    this.current = "";
};

Timegrid.Controls.TabSet.prototype.render = function(container) {
    this._container = container;
    var self = this;
    var tabDiv = $('<div></div>').addClass('timegrid-tabs');
    $(container).prepend(tabDiv);
    var makeCallback = function(title) {
        return function() { self.switchTo(title); }; 
    };
    for (title in this._layoutMap) {
        var tab = $('<span><a href="#">' + title + '</a></span>')
                    .click(makeCallback(title))
                    .addClass('timegrid-tab');
        tabDiv.append(tab);
        this._tabs[title] = tab;
    }
    $('.timegrid-tab').corner("30px top");
};

Timegrid.Controls.TabSet.prototype.switchTo = function(title) {
    if (this.current) { 
        this._renderedLayouts[this.current].hide();
        this._tabs[this.current].removeClass('timegrid-tab-active'); 
    }
    if (this._renderedLayouts[title]) {
        this._renderedLayouts[title].show();
    } else if (this._layoutMap[title]) {
        this._renderedLayouts[title] = $(this._layoutMap[title].render(this._container)).show();
    }
    if (this._iDiv) {
        this._iDiv.empty();
    }
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
                   .wrap('<a href="#"></a>').parent()
                   .addClass('timegrid-iterator-prev')
                   .click(makePrevCallback(this._layout));
    var nextLink = $('<img alt="Next" src="' + Timegrid.urlPrefix + '/images/go-next.png"></img>')
                   .wrap('<a href="#"></a>').parent()
                   .addClass('timegrid-iterator-next')
                   .click(makeNextCallback(this._layout));
    this._div.append(prevLink);
    this._div.append('<span>' + this._layout.getCurrent() + '</span>');
    this._div.append(nextLink);
    return this._div;
};