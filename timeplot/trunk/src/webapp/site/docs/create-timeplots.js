var timeplots = [];

function onLoad() {
    var eventSource = new Timeplot.DefaultEventSource();
                
    var plotInfo0 = [
       Timeplot.createPlotInfo({
          id: "plot1"
       })
    ];

    var plotInfo1 = [
       Timeplot.createPlotInfo({
          id: "plot1",
          dataSource: new Timeplot.ColumnSource(eventSource,1)
       })
    ];

    var plotInfo2 = [
       Timeplot.createPlotInfo({
          id: "plot1",
          dataSource: new Timeplot.ColumnSource(eventSource,1),
          valueGeometry: new Timeplot.DefaultValueGeometry({
            max: 100,
            min: 0
          })
       })
    ];

    var plotInfo3 = [
       Timeplot.createPlotInfo({
          id: "plot1",
          dataSource: new Timeplot.ColumnSource(eventSource,1),
          valueGeometry: new Timeplot.DefaultValueGeometry({
          	gridColor: new Timeplot.Color("#000000"),
            max: 100,
            min: 0
          })
       })
    ];

    var red = new Timeplot.Color("#880000");

    var plotInfo4 = [
       Timeplot.createPlotInfo({
          id: "plot1",
          dataSource: new Timeplot.ColumnSource(eventSource,1),
          valueGeometry: new Timeplot.DefaultValueGeometry({
            gridColor: new Timeplot.Color("#000000"),
            max: 100,
            min: 0
          }),
          lineColor: red,
          fillColor: red.lighten(150)
       })
    ];
                
    timeplots[0] = Timeplot.create(document.getElementById("timeplot0"), plotInfo0);
    timeplots[1] = Timeplot.create(document.getElementById("timeplot1"), plotInfo1);
    timeplots[2] = Timeplot.create(document.getElementById("timeplot2"), plotInfo2);
    timeplots[3] = Timeplot.create(document.getElementById("timeplot3"), plotInfo3);
    timeplots[4] = Timeplot.create(document.getElementById("timeplot4"), plotInfo4);

    timeplots[1].loadText("../examples/bush/bush_ratings.txt", ",", eventSource);
}

var resizeTimerID = null;
function onResize() {
    if (resizeTimerID == null) {
        resizeTimerID = window.setTimeout(function() {
            resizeTimerID = null;
            for (var i = 0; i < timeplots.length; i++) {
                timeplots[i].repaint();
            }
        }, 500);
    }
}
