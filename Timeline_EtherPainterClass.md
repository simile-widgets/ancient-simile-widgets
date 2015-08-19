## Introduction ##

An '''ether painter''' is an object made use of by a [band](Timeline_BandClass.md) to paint markings on its background. These markings make the mapping from pixels to date/time of the band's [| ether](Timeline_Ethers.md) visible to the user and helps them gauge when each particular event happens. An ether painter should be constructed during the initialization of a band in a timeline, and then not touched again.

## Interface ##

An ether painter must expose the following Javascript interface:

### `*constructor ( params )`**###
`*params`** is an object whose fields carry initialization settings for the ether painter. Different ether painter classes require different fields in this initialization object. Refer to the documentation of each ether painter class for details. see [Ether Painters implementations](Timeline_EtherPainterImplementations.md) below).

### `*initialize ( band, timeline )`**###
The ether painter is to paint the background of the given [band](Timeline_BandClass.md) of the given [timeline](Timeline_TimelineClass.md). This method is called by the band itself as it is being initialized. Client code is not supposed to call this method.**

### `*paint ()`**###
(Re)paint the band's background. The band will call this method when it needs to be (re)painted, at construction time as well as whenever its origin is shifted. Client code is not supposed to call this method.**

### `*softPaint ()`**###
(Re)paint any part of the band's background that is positioned relative to the visible area of the band. The band will call this method whenever it is scrolled. Client code is not supposed to call this method.**

### `*setHighlight ( startDate, endDate )`