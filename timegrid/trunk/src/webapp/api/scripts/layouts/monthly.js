/******************************************************************************
 * MonthLayout
 * @fileoverview
 *   This is where the monthly layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author masont
 *****************************************************************************/

Timegrid.MonthLayout = function(params) {
    Timegrid.MonthLayout.superclass.call(this, params);
    this.xSize = 7;
    this.ySize = 5;
    this.xMapper = function(obj) { return obj.time.getDay(); };
    this.yMapper = function(obj) { return obj.time.getWeekOfYear(); };
};
$.inherit(Timegrid.MonthLayout, Timegrid.Layout);

