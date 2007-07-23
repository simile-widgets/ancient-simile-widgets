/******************************************************************************
 * WeekLayout
 * @fileoverview
 *   This is where the weekly layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author masont
 *****************************************************************************/
 
 /**
  * Constructs a WeekLayout object.
  * @class WeekLayout is a subclass of Layout that implements a weekly event
  *     calendar, modeled off of the weekly view found in Google Calendar.
  * @extends Timegrid.Layout
  * @constructor
  */
Timegrid.WeekLayout = function(eventSource, config) {
    config.set('n', 7);
    config.set('title', "Week");
    Timegrid.WeekLayout.superclass.call(this, eventSource, config);
};
Timegrid.LayoutFactory.registerLayout("week", Timegrid.WeekLayout);
$.inherit(Timegrid.WeekLayout, Timegrid.NDayLayout);
