# Hotzones #

This was a part of getting started but was broken out because it's a more advanced topic and hopefully this page will grow beyond this initial simple example

## Adding Hotzones to the [Getting Started](Timeline_GettingStarted.md) example ##

Now we load [example2.xml](Timeline_Example_XML2.md), which contains a few more details for "Trip to Beijing" and discover that the days starting on August 2, 2006, are quite cramped:

![http://simile.mit.edu/mediawiki/images/6/6d/Timeline-howto-image6.jpg](http://simile.mit.edu/mediawiki/images/6/6d/Timeline-howto-image6.jpg)

To solve this problem, we will '''distort''' the time of those days, producing the effect of zooming in. Because we want time to flow differently than before—we want time spans to be mapped to pixels in a different way, we need a different kind of ether (and a different kind of ether painter to go with it), add the following code:

```
   ...
     Timeline.createHotZoneBandInfo({
         zones: [
             {   start:    "Aug 01 2006 00:00:00 GMT-0500",
                 end:      "Sep 01 2006 00:00:00 GMT-0500",
                 magnify:  10,
                 unit:     Timeline.DateTime.WEEK
             },
             {   start:    "Aug 02 2006 00:00:00 GMT-0500",
                 end:      "Aug 04 2006 00:00:00 GMT-0500",
                 magnify:  7,
                 unit:     Timeline.DateTime.DAY
             },
             {   start:    "Aug 02 2006 06:00:00 GMT-0500",
                 end:      "Aug 02 2006 12:00:00 GMT-0500",
                 magnify:  5,
                 unit:     Timeline.DateTime.HOUR
             }
         ],
         timeZone:       -5,
   ...
         timeZone:       -5,
 
```

Gives you this...

```
 function onLoad() {
   var eventSource = new Timeline.DefaultEventSource();
   var bandInfos = [
     Timeline.createHotZoneBandInfo({
         zones: [
             {   start:    "Aug 01 2006 00:00:00 GMT-0500",
                 end:      "Sep 01 2006 00:00:00 GMT-0500",
                 magnify:  10,
                 unit:     Timeline.DateTime.WEEK
             },
             {   start:    "Aug 02 2006 00:00:00 GMT-0500",
                 end:      "Aug 04 2006 00:00:00 GMT-0500",
                 magnify:  7,
                 unit:     Timeline.DateTime.DAY
             },
             {   start:    "Aug 02 2006 06:00:00 GMT-0500",
                 end:      "Aug 02 2006 12:00:00 GMT-0500",
                 magnify:  5,
                 unit:     Timeline.DateTime.HOUR
             }
         ],
         timeZone:       -5,
         eventSource:    eventSource,
         date:           "Jun 28 2006 00:00:00 GMT",
         width:          "70%", 
         intervalUnit:   Timeline.DateTime.MONTH, 
         intervalPixels: 100
     }),
     Timeline.createBandInfo({
         timeZone:       -5,
         eventSource:    eventSource,
         date:           "Jun 28 2006 00:00:00 GMT",
         width:          "30%", 
         intervalUnit:   Timeline.DateTime.YEAR, 
         intervalPixels: 200
     })
   ];
   bandInfos[1].syncWith = 0;
   bandInfos[1].highlight = true;
   bandInfos[1].eventPainter.setLayout(bandInfos[0].eventPainter.getLayout());
   
   tl = Timeline.create(document.getElementById("my-timeline"), bandInfos);
   Timeline.loadXML("example1.xml", function(xml, url) { eventSource.loadXML(xml, url); });
 }
```

In the resulting timeline below, the whole month of August 2006 is stretched out 10 times, showing weekly intervals; the two days of August 2nd and August 3rd are stretched out another 7 times; and then the time between 6am to noon on August 2nd is stretched out another 5 times, showing hourly intervals. All this stretching is done to the upper band only, so if you pan the upper band, observe how the lower band's highlight grows and shrinks.

![http://simile.mit.edu/mediawiki/images/8/8c/Timeline-howto-image7.jpg](http://simile.mit.edu/mediawiki/images/8/8c/Timeline-howto-image7.jpg)

Of course, panning the lower band over the hot zones of the upper band now makes the upper band a little jumpy. We can distort the lower band to reduce this effect by , adding the following code:

```
   ...
     Timeline.createHotZoneBandInfo({
         zones: [
             {   start:    "Aug 01 2006 00:00:00 GMT-0500",
                 end:      "Sep 01 2006 00:00:00 GMT-0500",
                 magnify:  20,
                 unit:     Timeline.DateTime.WEEK
             }
         ], 
```

Gives you this...

```
 function onLoad() {
   var eventSource = new Timeline.DefaultEventSource();
   var bandInfos = [
     Timeline.createHotZoneBandInfo({
         zones: [
             {   start:    "Aug 01 2006 00:00:00 GMT-0500",
                 end:      "Sep 01 2006 00:00:00 GMT-0500",
                 magnify:  10,
                 unit:     Timeline.DateTime.WEEK
             },
             {   start:    "Aug 02 2006 00:00:00 GMT-0500",
                 end:      "Aug 04 2006 00:00:00 GMT-0500",
                 magnify:  7,
                 unit:     Timeline.DateTime.DAY
             },
             {   start:    "Aug 02 2006 06:00:00 GMT-0500",
                 end:      "Aug 02 2006 12:00:00 GMT-0500",
                 magnify:  5,
                 unit:     Timeline.DateTime.HOUR
             }
         ],
         timeZone:       -5,
         eventSource:    eventSource,
         date:           "Jun 28 2006 00:00:00 GMT",
         width:          "70%", 
         intervalUnit:   Timeline.DateTime.MONTH, 
         intervalPixels: 100
     }),
     Timeline.createHotZoneBandInfo({
         zones: [
             {   start:    "Aug 01 2006 00:00:00 GMT-0500",
                 end:      "Sep 01 2006 00:00:00 GMT-0500",
                 magnify:  20,
                 unit:     Timeline.DateTime.WEEK
             }
         ],
         timeZone:       -5,
         eventSource:    eventSource,
         date:           "Jun 28 2006 00:00:00 GMT",
         width:          "30%", 
         intervalUnit:   Timeline.DateTime.YEAR, 
         intervalPixels: 200
     })
   ];
   bandInfos[1].syncWith = 0;
   bandInfos[1].highlight = true;
   bandInfos[1].eventPainter.setLayout(bandInfos[0].eventPainter.getLayout());
   
   tl = Timeline.create(document.getElementById("my-timeline"), bandInfos);
   Timeline.loadXML("example1.xml", function(xml, url) { eventSource.loadXML(xml, url); });
 }

```

The resulting timeline below still needs a few more iteration to make it smooth. Put that's an overview of hotzones.

![http://simile.mit.edu/mediawiki/images/1/10/Timeline-howto-image8.jpg](http://simile.mit.edu/mediawiki/images/1/10/Timeline-howto-image8.jpg)