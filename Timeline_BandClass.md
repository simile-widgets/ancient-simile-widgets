# Timeline Band Class #

Note that you cannot directly create a Band object. You can only retrieve Band objects from a [Timeline](Timeline_TimelineClass.md) object.

## **`addOnScrollListener ( listener )`** ##
Add a listener for scroll events. **`listener`** is a function that will receive a single argument, this band object.

## **`removeOnScrollListener ( listener )`** ##
Remove the given scroll listener

## **`getLocale ()`** ##
Return the locale of this band, e.g., "en-US".

## **`getTimeZone ()`** ##
Return the time zone of this band, e.g., -5 (Eastern Standard Time).

## **`getViewLength ()`** ##
Return the pixel width of the band's visible area if the timeline is horizontal, and the pixel height if vertical.

## **`getTotalViewLength ()`** ##
Return the pixel width of the band's (visible and cropped) if the timeline is horizontal, and the pixel height if vertical.

## **`getViewWidth ()`** ##
Return the pixel height of the band if the timeline is horizontal, and the pixel width if vertical.

## **`getViewOffset ()`** ##
Return the scroll offset of the band's **`div`** relative to the visible area. This is always negative.

## **`getMinDate(), getMaxDate(), getMinVisibleDate(), getMaxVisibleDate(), getCenterVisibleDate(), setMinVisibleDate( date ), setMaxVisibleDate( date ), setCenterVisibleDate( date )`** ##
The diagram below illustrates what these methods do:

![http://simile.mit.edu/mediawiki/images/0/0c/Timeline-ether-coordinates.jpg](http://simile.mit.edu/mediawiki/images/0/0c/Timeline-ether-coordinates.jpg)

## **`dateToPixelOffset ( date )`** ##
Return the pixel offset relative to the starting edge of the band's div (not the visible area) corresponding to the given date.

## **`pixelOffsetToDate ( pixels )`** ##
Return the date corresponding to the given pixel offset (relative to the starting edge of the band's **`div`**, not the visible area).

## **`createLayerDiv ( zIndex )`** ##
Create and return a **`div`** that acts like a layer inside the band, ordered in the z dimension among other layers of that band. Child elements of this **`div`** can then be positioned relative to the band.

## **`removeLayerDiv ( div )`** ##
Remove an existing layer **`div`**.

## **`openBubbleForPoint ( pageX, pageY, width, height )`** ##
Open an information bubble at the given page coordinates, large enough to accommodate content of the given dimensions in pixels. The bubble will be automatically positioned around the given coordinates, pointing to it.

## **`closeBubble ()`** ##
Close any open information bubble.

## **`getLabeller ()`** ##
Return the [labeller](Timeline_LabellerClass.md) of this band.

## **`getIndex ()`** ##
Return the index of this band in its containing timeline, e.g., 0 for the first band.

## **`getEther ()`** ##
Return the [ether](Timeline_EtherClass.md) of this band.

## **`getEtherPainter ()`** ##
Return the [ether painter](Timeline_EtherPainterClass.md) of this band.

## **`getEventSource ()`** ##
Return the [event source](Timeline_EventSourceClass.md) of this band.

## **`getEventPainter ()`** ##
Return the [event painter](Timeline_EventPainterClass.md) of this band.

## **`layout ()`** ##
Trigger a re-layout.

## **`paint ()`** ##
Trigger a repaint.

## **`softPaint ()`** ##
Trigger a soft repaint.