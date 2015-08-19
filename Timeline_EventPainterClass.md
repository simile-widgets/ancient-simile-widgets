# Introduction #

An '''event painter''' is an object made use of by a [band](Timeline_BandClass.md) to paint [events](Timeline_EventClass.md).

## Interface ##

An event painter must expose the following Javascript interface:

### **`constructor ( params )`** ###
**`params`** is an object whose fields carry initialization settings for the event painter. Different event painter classes require different fields in this initialization object. Refer to the documentation of each event painter class for details see [Event Painter Implementations](Timeline_EventPainterImplementations.md).

### **`initialize ( band, timeline )`** ###
The event painter is to paint the events in the given [band](Timeline_BandClass.md) of the given [timeline](Timeline_TimelineClass.md). This method is called by the band itself as it is being initialized. Client code is not supposed to call this method.

### **`paint ()`** ###
(Re)paint events. The band will call this method when it needs to be (re)painted, at construction time as well as whenever its origin is shifted. Client code is not supposed to call this method.

### **`softPaint ()`** ###
(Re)paint any event that is positioned relative to the visible area of the band. The band will call this method whenever it is scrolled. Client code is not supposed to call this method.