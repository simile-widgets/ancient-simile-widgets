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
          	axisLabelsPlacement: "left",
            max: 100,
            min: 0
          })
       })
    ];

    var plotInfo4 = [
       Timeplot.createPlotInfo({
          id: "plot1",
          dataSource: new Timeplot.ColumnSource(eventSource,1),
          valueGeometry: new Timeplot.DefaultValueGeometry({
            gridColor: new Timeplot.Color("#000000"),
            axisLabelsPlacement: "left",
            max: 100,
            min: 0
          }),
          timeGeometry: new Timeplot.DefaultTimeGeometry({
            gridColor: new Timeplot.Color("#000000"),
            axisLabelsPlacement: "top"
          })
       })
    ];
    
    var plotInfo5 = [
       Timeplot.createPlotInfo({
          id: "plot1",
          dataSource: new Timeplot.ColumnSource(eventSource,1),
          valueGeometry: new Timeplot.DefaultValueGeometry({
            gridColor: "#000000",
            axisLabelsPlacement: "left",
            max: 100,
            min: 0
          }),
          timeGeometry: new Timeplot.DefaultTimeGeometry({
            gridColor: new Timeplot.Color("#000000"),
            axisLabelsPlacement: "top"
          }),
          lineColor: "#ff0000",
          fillColor: "#cc8080"
       })
    ];

    var plotInfo6 = [
       Timeplot.createPlotInfo({
          id: "plot1",
          dataSource: new Timeplot.ColumnSource(eventSource,1),
          valueGeometry: new Timeplot.DefaultValueGeometry({
            gridColor: "#000000",
            axisLabelsPlacement: "left",
            max: 100,
            min: 0
          }),
          timeGeometry: new Timeplot.DefaultTimeGeometry({
            gridColor: new Timeplot.Color("#000000"),
            axisLabelsPlacement: "top"
          }),
          lineColor: "#ff0000",
          fillColor: "#cc8080",
          showValues: true
       })
    ];

    var timeGeometry1 = new Timeplot.DefaultTimeGeometry({
        gridColor: new Timeplot.Color("#000000"),
        axisLabelsPlacement: "top"
    });

    var valueGeometry = new Timeplot.DefaultValueGeometry({
        gridColor: "#000000",
        min: 0,
        max: 100
    });
      
    var plotInfo7 = [
	    Timeplot.createPlotInfo({
		  id: "plot1",
		  dataSource: new Timeplot.ColumnSource(eventSource,1),
		  timeGeometry: timeGeometry1,
          valueGeometry: valueGeometry,
		  lineColor: "#ff0000",
		  fillColor: "#cc8080",
		  showValues: true
		}),
		Timeplot.createPlotInfo({
		  id: "plot2",
		  dataSource: new Timeplot.ColumnSource(eventSource,3),
          timeGeometry: timeGeometry1,
          valueGeometry: valueGeometry,
		  lineColor: "#D0A825",
		  showValues: true
		})
    ];

    var eventSource2 = new Timeplot.DefaultEventSource();

    var timeGeometry2 = new Timeplot.DefaultTimeGeometry({
        gridColor: new Timeplot.Color("#000000"),
        axisLabelsPlacement: "top"
    });

    var plotInfo8 = [
        Timeplot.createPlotInfo({
          id: "plot1",
          dataSource: new Timeplot.ColumnSource(eventSource,1),
          timeGeometry: timeGeometry2,
          valueGeometry: valueGeometry,
          lineColor: "#ff0000",
          fillColor: "#cc8080",
          showValues: true
        }),
        Timeplot.createPlotInfo({
          id: "plot2",
          dataSource: new Timeplot.ColumnSource(eventSource,3),
          timeGeometry: timeGeometry2,
          valueGeometry: valueGeometry,
          lineColor: "#D0A825",
          showValues: true
        }),
        Timeplot.createPlotInfo({
          id: "plot3",
          timeGeometry: timeGeometry2,
          eventSource: eventSource2,
          lineColor: "#03212E"
        })
    ];
                  
    timeplots[0] = Timeplot.create(document.getElementById("timeplot0"), plotInfo0);
    timeplots[1] = Timeplot.create(document.getElementById("timeplot1"), plotInfo1);
    timeplots[2] = Timeplot.create(document.getElementById("timeplot2"), plotInfo2);
    timeplots[3] = Timeplot.create(document.getElementById("timeplot3"), plotInfo3);
    timeplots[4] = Timeplot.create(document.getElementById("timeplot4"), plotInfo4);
    timeplots[5] = Timeplot.create(document.getElementById("timeplot5"), plotInfo5);
    timeplots[6] = Timeplot.create(document.getElementById("timeplot6"), plotInfo6);
    timeplots[7] = Timeplot.create(document.getElementById("timeplot7"), plotInfo7);
    timeplots[8] = Timeplot.create(document.getElementById("timeplot8"), plotInfo8);

    timeplots[1].loadText("../examples/bush/bush_ratings.txt", ",", eventSource);
    timeplots[1].loadXML("../examples/bush/bush_events.xml", eventSource2);
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
