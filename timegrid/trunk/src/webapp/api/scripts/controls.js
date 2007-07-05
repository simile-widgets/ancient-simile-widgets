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
    var views = $.map(this._layouts, function(l) {
        var elmt = l.render(container);
        if (first) { 
            $(elmt).show(); first = false; 
        } else {
            $(elmt).hide();
        }
        return { title: l.title, elmt: elmt }; 
    });
    var links = $.map(views, function(v) {
        var callback = function() {
            $.map(views, function(v) {$(v.elmt).hide();});
            $(v.elmt).show();
        };
        return $('<a href="#">' + v.title + '</a>').click(callback).get(0);
    });
    $(container).prepend(links);
};

/*
 * TabSet is a style of control that generates a set of tabs.  These tabs can
 * be configured to switch between different views, time slices, or data
 * sources.
 */
Timegrid.Controls.TabSet = function(args) {

};

Timegrid.Controls.TabSet.prototype.render = function(container) {

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