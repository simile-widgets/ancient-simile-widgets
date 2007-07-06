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
    var titles = [];
    var views = $.map(this._layouts, function(l) {
        titles.push(l.title);
        return $(l.render(container)).hide();
    });
    var tabSet = new Timegrid.Controls.TabSet(titles, views);
    tabSet.render(container);
    tabSet.switchTo(0);
};

/*
 * TabSet is a style of control that generates a set of tabs.  These tabs can
 * be configured to switch between different views, time slices, or data
 * sources.
 */
Timegrid.Controls.TabSet = function(titles, views) {
    this._titles = titles;
    this._views  = views;
    this._tabs   = [];
    this.current = 0;
};

Timegrid.Controls.TabSet.prototype.render = function(container) {
    var self = this;
    var tabDiv = $('<div></div>').addClass('timegrid-tabs');
    $(container).prepend(tabDiv);
    var makeCallback = function(index) {
        return function() { self.switchTo(index); }; 
    };
    for (i in this._views) {
        var tab = $('<span><a href="#">' + this._titles[i] + '</a></span>')
                    .click(makeCallback(i))
                    .addClass('timegrid-tab');
        tabDiv.append(tab);
        this._tabs.push(tab);
    }
    $('.timegrid-tab').corner("30px top");
};

Timegrid.Controls.TabSet.prototype.switchTo = function(index) {
    $.map(this._views, function(v) { v.hide(); });
    $.map(this._tabs, function(t) { t.removeClass('timegrid-tab-active'); });
    this.current = index;
    this._views[this.current].show();
    this._tabs[this.current].addClass('timegrid-tab-active');
};

/*
 * Iterator is a style of control that generates a textual label for the
 * current selection and a set of arrows for moving to either the previous
 * or next selection.  Can be used for views, time, or sources.
 */
Timegrid.Controls.Iterator = function(args) {

};

Timegrid.Controls.Iterator.prototype.render = function(container) {

};