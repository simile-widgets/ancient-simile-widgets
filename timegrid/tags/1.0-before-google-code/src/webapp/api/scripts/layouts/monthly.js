/******************************************************************************
 * MonthLayout
 * @fileoverview
 *   This is where the monthly layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author masont
 *****************************************************************************/

Timegrid.MonthLayout = function(eventSource, params) {
    params.n = 1;
    params.title = params.title || Timegrid.MonthLayout.l10n.makeTitle();
    Timegrid.MonthLayout.superclass.call(this, eventSource, params);
};
Timegrid.LayoutFactory.registerLayout("month", Timegrid.MonthLayout);
$.inherit(Timegrid.MonthLayout, Timegrid.NMonthLayout);

