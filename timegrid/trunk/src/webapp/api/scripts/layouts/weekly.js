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
Timegrid.WeekLayout = function(eventSource, params) {
    params.n = 7;
    params.title = params.title || Timegrid.WeekLayout.l10n.makeTitle();
    Timegrid.WeekLayout.superclass.call(this, eventSource, params);
};
Timegrid.LayoutFactory.registerLayout("week", Timegrid.WeekLayout);
$.inherit(Timegrid.WeekLayout, Timegrid.NDayLayout);
