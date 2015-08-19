## Introduction ##

The Ether of a band dictates how time is mapped onto the pixel space: how many pixels a time span takes up. The [ether painter](Timeline_EtherPainterClass.md) makes this mapping visible to the user by painting various markings on the background of the band, e.g., "Jun", "Jul", "2005", "2006". The [event painter](Timeline_EventPainterClass.md), paints the events that are fed to it by the [ether source](Timeline_EtherSourceClass.md). The **`Timeline.DurationEventPainter`** uses a [layout](Timeline_LayoutClass.md) to determine how to distribute the events among several [tracks](Timeline_Tracks.md)] such that events don't overlap one another.

An '''ether''' is an object used by a [band](Timeline_BandClass.md) to map between pixel coordinates and date/time.

Each band keeps a single ether. The ether keeps track of the date corresponding to the left (or top) edge of the visible area of the band. That date corresponds to pixel offset 0 (see below). The ether's sole responsibility is to return a date when given a positive or negative pixel offset, and to return a pixel offset when given a date.

![http://simile.mit.edu/mediawiki/images/0/0c/Timeline-ether-coordinates.jpg](http://simile.mit.edu/mediawiki/images/0/0c/Timeline-ether-coordinates.jpg)

An ether's mapping, abstract, is made visible to the user by an [ether painter](Timeline_EtherPainterClass.md).

## Interface ##

An ether must expose the following Javascript interface:
### **`constructor ( params ) `** ###
**`params`** is an object whose fields carry initialization settings for the ether. Different ether classes require different fields in this initialization object. Refer to the documentation of each ether class for details see [Ether Implemenations](Timeline_EtherImplementations.md) below).

### **`initialize ( timeline ) `** ###
**`timeline`** is the timeline to which this ether belongs. This method is called by the timeline itself as it is being initialized. Client code is not supposed to call this method.

### **`dateToPixelOffset ( date ) `** ###
Map the given **`date`** argument (a Javascript Date) to a pixel offset (positive or negative, float). Note that you must round the result (e.g., using **`Math.round()`**) before you can use it as a coordinate of some element, e.g.,

> elmt.style.left = Math.round(ether.dateToPixelOffset(aDate)) + "px";

### **`pixelOffsetToDate ( pixels ) `** ###
Map the given pixel offset (positive or negative, float) to a **`Date`**.

### **`setDate ( date ) `** ###
Set the date that corresponds to pixel offset 0 to the **`date`** argument.

### **`shiftPixels ( pixels ) `** ###
Shift the origin of the ether by the given number of pixels (positive or negative, float). A positive **`pixels`** makes the ether start later, a negative **`pixels`** makes it start earlier. This method is equivalent to:

> ether.setDate(ether.pixelOffsetToDate(pixels))