# Timeline Basics #

![http://simile.mit.edu/mediawiki/images/3/33/Timeline-sample.jpg](http://simile.mit.edu/mediawiki/images/3/33/Timeline-sample.jpg)

A timeline contains one or more [Bands](Timeline_BandClass.md), which can be panned infinitely by dragging with the mouse pointer, using the mouse scroll-wheel or the keyboard's arrow buttons. A band can be configured to synchronize with another band such that panning one band also scrolls the other.

## Creating your own Timeline ##
See [Getting started](Timeline_GettingStarted.md)

## Implementation Details ##
A timeline is implemented as a _div_ element that contains inner _div_ elements as its bands. The band _div's_ are cropped and positioned relative to the timeline _div_.

![http://simile.mit.edu/mediawiki/images/4/49/Timeline-band-illustration.jpg](http://simile.mit.edu/mediawiki/images/4/49/Timeline-band-illustration.jpg)

A band _div_ itself contains several inner elements that implements various parts of the band. For example, the two timelines above show labels for days, weeks, months, and years. The bands also have different background colors, and the weekly band of the second timeline has weekend markings. All of these visual elements are "painted" by adding HTML elements to the band _div's_ at the appropriate positions.

As a band is panned, its _div_ is shifted horizontally or vertically, carrying all of its visual elements along. When either end of the band _div_ approaches the visible (non-cropped) area, the band _div_ is re-centered, its coordinate origin is changed, and then its various visual elements are re-"painted" relative to the new coordinate origin. All of this "paging" is done as seamlessly as possible so that the user experiences smooth, '''infinite''' panning.

A band is responsible for supporting panning as well as coordinating its various sub-components:
  * an [ether](Timeline_EtherClass.md), whose sole responsibility is mapping between pixel coordinates and dates/times;
  * an [ether painter](Timeline_EtherPainterClass.md), which paints date/time labels and the background of the band as well as the highlight (the lighter part of the lower band in the first timeline above);
  * zero or more [decorators](Timeline_DecoratorClass.md), which further decorate the background of the band; and
  * an [event painter](Timeline_EventPainterClass.md), which paints the events.

The band also takes an [event source](Timeline_EventSourceClass.md) which provides events to be displayed in that band. Different bands can have different event sources. This flexibility allows for '''timeline mashups''', as exemplified [here](http://simile.mit.edu/timeline/examples/religions/religions.html). Various sub-components that do painting take a [theme](Timeline_ThemeClass.md), which stores default visual and behavioral settings.

**If you have questions, please use the [mailing list](http://groups.google.com/group/simile-widgets/). Comments posted here are NOT read**