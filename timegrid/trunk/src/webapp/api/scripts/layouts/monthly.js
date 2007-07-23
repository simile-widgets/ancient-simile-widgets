/******************************************************************************
 * MonthLayout
 * @fileoverview
 *   This is where the monthly layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author masont
 *****************************************************************************/

Timegrid.MonthLayout = function(eventSource, config) {
    config.set('n', 1);
    config.set('title', 'Month');
    Timegrid.MonthLayout.superclass.call(this, eventSource, config);
};
Timegrid.LayoutFactory.registerLayout("month", Timegrid.MonthLayout);
$.inherit(Timegrid.MonthLayout, Timegrid.NMonthLayout);

