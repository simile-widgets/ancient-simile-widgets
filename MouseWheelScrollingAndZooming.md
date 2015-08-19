# Introduction #

When displaying a Timeline, the mouse-wheel can act in any of three ways while the mouse is over a Timeline band:
  * Scroll -- the mouse-wheel will scroll the Timeline forward and backward in time. This is similar to pressing the arrow keys. Difference is that holding down an arrow key will accelerate the scrolling speed. This action is set by the default theme.
  * Zoom -- the mouse-wheel will change the timescale of the Timeline. Zooming is an alternative to using Hotzones to change the timescale.
  * Default -- the mouse-wheel will scroll the container or window depending on where the vertical scrollbars are (if any). The Timeline will be neither scrolled or zoomed.

Change the mouse-wheel behavior in your theme file.

## User Interface Tips ##
It can be confusing to your users to have the mouse-wheel scroll the page when the mouse in some places on the browser screen and either scroll or zoom a Timeline when the mouse in other places.

You may wish to design your pages to eliminate the vertical scroll bar. This can be done by resizing the height of the items on your page when the viewport size is changed.

## Known issue: Apple Multi-Touch scrolling ##
Mac computers can be configured to use "Multi-Touch" trackpad gestures. The scrolling multi-touch appears to send mouse-wheel events to both the Timeline (causing a scroll or zoom) and to the entire window, causing a scroll if the window has a scrollbar. Work-arounds: Plan your page to not have a vertical scrollbar or set the Timeline mouseWheel option to 'default'.
Thank you Jon Crump for the report.

# Zooming #

To use the mouse-wheel for zooming:
  * Change the mouseWheel setting in your theme.
  * Decide on the intervalPixels and intervalUnit steps that you would like the user to be able to zoom to. The BandInfo object's intervalUnit and intervalPixels parameters must correspond with one of these steps, and the index of this default step must be passed along as the zoomIndex.

Zooming example in action: See the file webapp/docs/create-timelines.html (only available in the source files at this time)

## Example ##
  * See the zoomIndex and zoomSteps fields below

```
function onLoad() {
  var eventSource = new Timeline.DefaultEventSource();
  var bandInfos = [
        Timeline.createBandInfo({
            date:           "Jun 28 2006 00:00:00 GMT",
            width:          "70%", 
            intervalUnit:   Timeline.DateTime.MONTH, 
            intervalPixels: 100,
            eventSource:    eventSource,
            zoomIndex:      10,
            zoomSteps:      new Array(
              {pixelsPerInterval: 280,  unit: Timeline.DateTime.HOUR},
              {pixelsPerInterval: 140,  unit: Timeline.DateTime.HOUR},
              {pixelsPerInterval:  70,  unit: Timeline.DateTime.HOUR},
              {pixelsPerInterval:  35,  unit: Timeline.DateTime.HOUR},
              {pixelsPerInterval: 400,  unit: Timeline.DateTime.DAY},
              {pixelsPerInterval: 200,  unit: Timeline.DateTime.DAY},
              {pixelsPerInterval: 100,  unit: Timeline.DateTime.DAY},
              {pixelsPerInterval:  50,  unit: Timeline.DateTime.DAY},
              {pixelsPerInterval: 400,  unit: Timeline.DateTime.MONTH},
              {pixelsPerInterval: 200,  unit: Timeline.DateTime.MONTH},
              {pixelsPerInterval: 100,  unit: Timeline.DateTime.MONTH} // DEFAULT zoomIndex
            )
        }),
        Timeline.createBandInfo({
            date:           "Jun 28 2006 00:00:00 GMT",
            width:          "30%", 
            intervalUnit:   Timeline.DateTime.YEAR, 
            intervalPixels: 200,
            showEventText:  false, 
            trackHeight:    0.5,
            trackGap:       0.2,
            eventSource:    eventSource,
            overview:       true
        })
  ];
  bandInfos[1].syncWith = 0;
  bandInfos[1].highlight = true;
  
  tl = Timeline.create(document.getElementById("my-timeline"), bandInfos);
  Timeline.loadXML("example2.xml", function(xml, url) { eventSource.loadXML(xml, url); });
}


```