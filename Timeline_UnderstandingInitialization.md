# Understanding Initialization #

**`Timeline.createBandInfo()`** fills in default settings, for constructing a band in a timeline. Defaults can be changed using parms.  What **`Timeline.createBandInfo()`** does is something like this (in pseudo-code):

```
 Timeline.createBandInfo = function(params) {
   return {
     width:          params.width,
     eventSource:    params.eventSource, //(or null by default)
     timeZone:       params.timeZone, //offset from GMT (default is 0)
     ether:          new Timeline.LinearEther({
                       interval: f(params.intervalUnit), //the number of milliseconds in params.intervalUnit 
                       pixelsPerInterval: params.intervalPixels,
                       centersOn: params.date  //or the current date by defaul
                     }),
     etherPainter:   new Timeline.GregorianEtherPainter({
                       unit:      params.intervalUnit,
                       theme:     params.theme, //or the default theme
                     }),
     eventPainter:   new Timeline.DurationEventPainter({
                       showText:  params.showEventText, //or true by default
                       theme:     params.theme, //or the default theme...same theme above
                       trackHeight: params.trackHeight, //orr the default track height in the theme
                       trackGap:    params.trackHeight, //or the default track gap in the theme
                       layout:     new Timeline.StaticTrackBasedLayout({
                                      eventSource: //same as the same eventSource above
                                      ether:       //same ether above
                                      showText:    //same showText value above
                                      theme:       //same theme above
                                    })
                     })
   }
 };
```

In other words, **`Timeline.createBandInfo()`** takes an object whose fields store initialization settings and returns yet another object whose fields stores initialization settings that **`Timeline.create()`** can understand.

**`Timeline.createBandInfo()`** does the work of routing each initialization setting that you give it to the appropriate place(s). For example, **`params.intervalUnit`** is referenced twice above, once to construct an [ether](Timeline_EtherClass.md) and once to construct an [ether painter](Timeling_EtherPainter.md). Whatever default setting that **`Timeline.createBandInfo()`** doesn't provide is provided by the [theme](Timeline_ThemeClass.md).