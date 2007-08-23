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

Timegrid.WeekLayout.prototype.computeStartTime = function(date) {
    if (date) {
        // We don't need to make sure it's the start of the week, once it's
        // been set properly already.
        var startTime = new Date(date);
        startTime.add('d', 0 - this.n);
        return startTime;
    } else {
        var startTime = new Date(this.eventSource.getEarliestDate()) ||
                        new Date();
        var newStartTime = new Date(startTime);
        newStartTime.clearTime().setDay(Date.l10n.firstDayOfWeek);
        return newStartTime > startTime ? this.computeStartTime(newStartTime) :
                                          newStartTime;
    }
};

