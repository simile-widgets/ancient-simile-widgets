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

};

Timegrid.Controls.Panel.prototype.render = function(container) {

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