# Timeline Class #

## **`HORIZONTAL`** ##
''static'', 0.

## **`VERTICAL`** ##
''static'', 1.

## **`create ( div, bandInfos, orientation )`** ##
''static'', return a timeline created inside the given **`div`** in the given **`orientation`** (or horizontal by default) and containing [Timeline\_bands](Timeline_bands.md) initialized based on the settings in the **`bandInfos`** array.

### **`bandInfos`** ###
Each element of bandInfos is an object with the following fields:
#### **`width`** ####
''required'', how much of the timeline's space this band takes up, expressed as a percent in a string, e.g., "30%".
#### **`eventSource`** ####
''required'', an event source that provides events to be painted on this band, e.g., **`new Timeline.DefaultEventSource()`**. It can be null, which means the band is empty.
#### **`timeZone`** ####
''required'', a number specifying the time zone in which the band will be marked with date/time intervals. For example, to have hourly labels on the band painted by Eastern Standard Time, specify -5.
#### **`ether`** ####
''required'', an [ether](Timeline_EtherClass.md).
#### **`etherPainter`** ####
''required'', an [ether painter](Timeline_EtherPainterClass.md).
#### **`eventPainter`** ####
''required'', an [event painter](Timeline_EventPainterClass.md).

You can use the static utility methods **`createBandInfo`** and **`createHotZoneBandInfo`** below to create elements of bandInfos, or you can construct them yourself.

## **`createBandInfo ( params ) `** ##
''static'', create an object whose fields store various settings to initialize a band that will have a linear ether. Some initialization settings are read directly from the fields of params, some are constructed from the fields of params, and some are filled in by default. This is a utility function for your convenience—you don't have to use it to create a band.

### **`params`** ###
**`params`** is an object with the following fields (in no particular order):
#### **`width`** ####
''required'', how much of the timeline's space this band takes up, expressed as a percent in a string, e.g., "30%".
#### **`intervalUnit`** ####
''required'', a time unit from Timeline.DateTime, e.g., Timeline.DateTime.WEEK.
#### **`intervalPixels`** ####
''required'', the number of pixels that the time unit above is mapped to, e.g., 100.
#### **`eventSource`** ####
''optional'', an event source that provides events to be painted on this band, e.g., new Timeline.DefaultEventSource(). The default is null, which means the band is empty.
#### **`theme`** ####
''optional'', a theme that provides visual setting defaults for how the band's visual elements are to be painted, e.g., Timeline.ClassicTheme.create(). The default is Timeline.getDefaultTheme().
#### **`date`** ####
''optional'', a String or a Date (to be parsed by Timeline.DateTime.parseGregorianDateTime()) on which the band should be centered initially. The default is the current date/time when Timeline.createBandInfo() is called.
#### **`timeZone`** ####
''optional'', a number specifying the time zone in which the band will be marked with date/time intervals. For example, to have hourly labels on the band painted by Eastern Standard Time, specify -5. The default is 0, meaning GMT.
#### **`showEventText`** ####
''optional'', a boolean specifying whether event titles are to be painted. The default is true.
#### **`trackGap`** ####
''optional'', the number of em (dependent on the current font) to be left between adjacent tracks on which events are painted. The default value is retrieved from the provided or default theme. E.g., 0.5.
#### **`trackHeight`** ####
''optional'', the height of each track in em (dependent on the current font). The default value is retrieved from the provided or default theme. E.g., 1.5.

## **`createHotZoneBandInfo ( params ) `** ##
''static'', create an object whose fields store various settings to initialize a band that will have a hot-zone ether. It works much like the static method **`createBandInfo`** above, except that **`params`** needs one extra field:
### **`params`** ###
#### **`zones`** ####
''required'', an array describing the hot zones. Each element of this array is an object with the following fields:
#### **`startTime`** ####
''required'', a String or a Date object that specifies the beginning date/time of the zone. It is parsed by Timeline.DateTime.parseGregorianDateTime() to get a Date object.
#### **`endTime`** ####
''required'', a String or a Date object that specifies the ending date/time of the zone. It is parsed by Timeline.DateTime.parseGregorianDateTime() to get a Date object.
#### **`magnify`** ####
''required'', a number specifying the magnification of the mapping in this zone. A greater-than-1 number causes more pixels to be mapped to the same time interval, resulting in a zoom-in effect.
#### **`unit`** ####
''required'', one of the Gregorian calendar unit defined in Timeline.DateTime, e.g., Timeline.DateTime.MINUTE. This argument specifies the interval at which ticks and labels are painted on the band's background inside this hot-zone.
#### **`multiple`** ####
''optional'', default to 1. A label is painted for every multiple of unit. For example, if unit is Timeline.DateTime.MINUTE and multiple is 15, then there is a label for every 15 minutes (i.e., 15, 30, 45,...).

## **`getDefaultTheme ()`** ##
''static'', return the default theme.

## **`setDefaultTheme ( theme ) `** ##
''static'', set the default theme.

## **`loadXML ( url, f ) `** ##
''static'', asynchronously load an XML file at the given url and then call f to process it. f is passed 2 parameters: an XML document object and url.

## **`isHorizontal () `** ##
Return whether this timeline is horizontal.

## **`isVertical () `** ##
Return whether this timeline is vertical.

## **`getDocument () `** ##
Return the HTML document that this timeline belongs to.

## **`getBandCount () `** ##
Return the number of bands in this timeline.

## **`getBand ( index ) `** ##
Return the band at the given index.

## **`layout () `** ##
Re-lay out the timeline. Call this when the size of the timeline has changed.

## **`paint () `** ##
Re-paint the timeline. Call this when you want to force a repaint, say, to update event highlights and filters.

## **`getPixelLength () `** ##
Return the timeline div's width if the timeline is horizontal, and height if the timeline is vertical. In other words, it returns the scrolling dimension of the timeline.

## **`getPixelWidth () `** ##
Return the timeline div's height if the timeline is horizontal, and width if the timeline is vertical. In other words, it returns the non-scrolling dimension of the timeline.

## **`addDiv ( div ) `** ##
Add the given div to the timeline's div.

## **`removeDiv ( div ) `** ##
Remove the given div from the timeline's div.