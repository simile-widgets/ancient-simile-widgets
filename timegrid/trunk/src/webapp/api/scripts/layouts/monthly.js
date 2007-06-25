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
    this.xMapper = function(evt) {};
    this.yMapper = function(evt) {};
};
$.inherit(Timegrid.MonthLayout, Timegrid.Layout);

