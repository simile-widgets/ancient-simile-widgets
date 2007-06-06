
Timegrid.MonthLayout = function(params) {
    Timegrid.MonthLayout.superclass.call(this, params);
    this.xSize = 7;
    this.ySize = 5;
    this.xMapper = function(evt) {};
    this.yMapper = function(evt) {};
};
Timegrid.extend(Timegrid.MonthLayout, Timegrid.Layout);

