# Event Attributes and Data Formats #

Timeline Event data can use any of the following popular formats:
  * XML
  * JSON
  * SPARQL [more info](http://www.wasab.dk/morten/2006/07/sparql-timeline/)

An [Event Source](Timeline_EventSourceClass.md) controls the loading of data sources into a timeline. Also see [loading events dynamically](Timeline_LoadEventsDynamically.md).

## Event attributes and data formats ##
There is only one underlying meaning of Timeline event attributes. But the event attributes are arranged slightly differently in the different data transport formats. Each format's adapter reads the incoming data and stores it in the Timeline. For example, in the XML format, the events are a series of elements under the root element. In JSON, the root hash has an _events_ array, whose order is not important. In the sections below, the data attributes are described. The placement of the attributes is described in the XML and JSON Data Formats sections.

## Event attributes ##
Defaults are used if an event does not specify an attribute value. start attribute is required.
See [Event Display options](Timeline_Event_Display.md) for examples of the different ways to display an event on a Timeline

### Basic Event Attributes ###
  * start - in full date format (e.g. "May 20 1961 00:00:00 GMT-0600"). See next section for alternative formats.
  * latestStart - for imprecise beginnings - same date format as start
  * earliestEnd - for imprecise ends - same date format as start
  * end - same date format as start
  * durationEvent - XML and SPARQL: "true" or "false". JSON: true or false. Only applies to events with start/end times.
    * **true** -- the event occurs over a time duration. No icon. The event will be drawn as a dark blue tape. The tape color is set with the _color attribute_. Default color is #58A0DC
    * **false** -- the event is focused on a specific "instant" (shown with the icon). The event will be drawn as a blue dot icon (default) with a pale blue tape. The tape is the default color (or _color attribute_ color), with opacity set to 20. To change the opacity, change the theme's instant: {impreciseOpacity:  20} value. Maximum 100.
  * title - text title that goes next to the tape in the Timeline. Also shown in the bubble. The title attribute is optional. Leave it out if you want just an icon or icon and tape. The description will be shown in the bubble when the icon or tape is clicked.

### Date Time Formats ###
The default date time parser uses the Javascript Date parser built into the browser.

**Recommended formats**
  * The format of "May 10 1961 00:00:00 GMT-0600" is unambiguous and is the default.
  * The RFC 2822 format of "Thu, 21 Dec 2000 16:01:07 +0200" also works fine by default.
  * The JSON data format used by Timeline supports explicit date objects. Eg new Date(Date.UTC(2008,0,17,20,00,00,0)). See [Using JS Date objects](Timeline_EventSourceJSON_jsDate.md). This format also loads in the least time since no parsing is needed.
  * A subset of the ISO 8601 format. This is also the [xsd:dateTime](http://books.xmlschemata.org/relaxng/ch19-77049.html) format from XML. Examples: "1995-02-04 10:20:01Z", "1995-02-04T10:20:01Z", "1995-02-04T10:20:01+5:00". To use this date format, your data file must specify the date-time-format. See the Timeline attributes section, below. The ISO 8601 parser used by Timeline is from Dojo Toolkit. [Documentation.](http://api.dojotoolkit.org/jsdoc/dojo/1.2/dojo.date.stamp.fromISOString)

**Formats that are not recommended**
  * The format "5/10/1961 00:00:00 GMT-0600" is ambiguous. (May 10 or October 5). It may work differently depending on the locale settings of the computer the browser is running on and the sophistication of the browser.
  * The format "5 10 1961 00:00:00 GMT-0600" is also ambiguous. In addition, while Firefox, Safari and Chrome seem to understand it, IE does not.

**Programming tips for proper date time formats**
  * Php -- use date("r", $event\_date)

### Additional Event Attributes ###
  * icon - url. This image will appear next to the title text in the timeline if (no end date) or (durationEvent = false). If a start and end date are supplied, and durationEvent is true, the icon is not shown. If icon attribute is not set, a default icon from the theme is used.
  * image - url to an image that will be displayed in the bubble
  * link - url. The bubble's title text be a hyper-link to this address.
  * color - color of the text and tape (duration events) to display in the timeline. If the event has durationEvent = false, then the bar's opacity will be applied (default 20%). See durationEvent, above.
  * textColor - color of the label text on the timeline. If not set, then the _color_ attribute will be used.
  * tapeImage and tapeRepeat Sets the background image and repeat style for the event's _tape_ (or 'bar') on the Timeline. Overrides the color setting for the tape. Repeat style should be one of {repeat | repeat-x | repeat-y}, repeat is the default. See the Cubism example for a demonstration. Only applies to duration events.
  * caption - additional event information shown when mouse is hovered over the Timeline tape or label. Uses the html _title_ property. Looks like a tooltip. Plain text only. See the cubism example.
  * classname - added to the HTML classnames for the event's label and tape divs. Eg classname attribute 'hot\_event' will result in div classes of 'timeline-event-label hot\_event' and 'timeline-event-tape hot\_event' for the event's Timeline label and tape, respectively.
  * description - will be displayed inside the bubble with the event's title and image.
    * XML Format: the description is stored as the text content of the event element (see below). Note: the XML standard requires that an element's text content must be escaped/formatted HTML.
    * JSON Format: the description key of the event hash

Notes:
  * url's can be absolute or relative. The base address for relative urls is the directory of event file.

### Event Attributes for Developers ###
  * trackNum - used to override the automatic layout of events on the Timeline.
  * eventID - a _cookie_ attribute that is stored, not used by the Timeline library. If you write a custom labeller or event bubble filler, the attribute can be obtained using the getEventID() method on the event object.


### Organizing event types ###
You have two options for translating your event types to the user. For example, suppose most of your events are of type 'regular,' and some are of type 'special.' You want the special events to be visually distinct on the Timeline. Two options:
  * Special events would have attribute classname = 'special'. Regular events would not set classname or set it to 'regular'. Then use CSS rules to change the color, font, background image, etc of the special event's labels and tapes on the Timeline. The additional CSS rules can be specified in your HTML file or a CSS file.
  * Special events would explicitly use the event attributes color, textColor, tapeImage and tapeRepeat to change the look of the special events. Attribute icon could also be used to change the icon image.

### Deprecated Event attributes ###
The following event attributes are still supported, but you should not use them for new event sources. Support may be removed at the next major release.
  * hoverText - superseded by the caption attribute
  * isDuration - "true" or "false". Only applies to events with start/end times. This attribute is correctly interpreted by the XML and SPARQL format handlers. It's negated (a bug) by the JSON format handler. See [issue 33](https://code.google.com/p/simile-widgets/issues/detail?id=33). This attribute is replaced by attribute durationEvent

## Timeline attributes ##
These attributes are specified once per Timeline. They are then used for all events in the Timeline. They are optional.
  * wiki-url - Base url used to gin up url's for each event; by appending the wiki-section and the event's title; often a MediaWiki wiki URL
  * wiki-section - MediaWiki wiki section
  * date-time-format - Which parser should be used for dates/times. Values: "iso8601" or "Gregorian". Default is "Gregorian".

## Which Data Format? ##
If another department will be creating the data file for you, your choices may be limited. For example, XML may be the preferred data exchange format for your organization. If you have more control over the data source, you may wish to try the JSON format with calls to the Date object. This format will give you the fastest load times. You can also write a Javascript adapter (similar to the existing XML, JSON and SPARCL adapters) to directly interpret a different data format.

## XML Data Format ##
The XML format used for Timeline includes the above attributes in the following format:

Everything is contained within a **`<data>`** element.  The **`<data>`** element can have the Timeline attributes listed above:
  * wiki-url
  * wiki-section
  * date-time-format

The data element contains one or more child elements of type **`<event>`**, the order is not significant.

Each **`<event>`** element can include any of the event attributes listed above. For example:
  * start, latestStart, end, etc
  * The _text content_ of the event element is the event's _description._ The information must be escaped/formatted HTML.
  * `Note in the example below how <i> is properly encoded as &lt;i&gt;`

The xml document must be served with a content-type that the browser thinks is xml: "text/xml, application/xml or ends in +xml" (per [the XMLHttpRequest spec](http://www.w3.org/TR/XMLHttpRequest/#xml-response-entity-body)). If it's not, you could get this cryptic error, which I include here as search bait:

```
TypeError: xml has no properties "XmlHttp: Error handling onReadyStateChange"
\[Exception... "'XmlHttp: Error handling onReadyStateChange' when calling method: \[nsIOnReadyStateChangeHandler::handleEvent]" 
nsresult: "0x8057001e (NS_ERROR_XPC_JS_THREW_STRING)" location: "<unknown>" data: no]
fDone(XMLHttpRequest readyState=4 status=200)timeplot-bundle.j... (line 177)
_onReadyStateChange(XMLHttpRequest readyState=4 status=200, function(), function())simile-ajax-bundl... (line 2429)
onreadystatechange()
```

### XML Examples ###

```
<data 
  wiki-url="http://simile.mit.edu/shelf/" 
  wiki-section="Simile JFK Timeline">
    <event 
       start="Sat May 20 1961 00:00:00 GMT-0600" 
       title="'Bay of Pigs' Invasion">
    </event>
    <event 
       start="Wed May 01 1963 00:00:00 GMT-0600" 
       end="Sat Jun 01 1963 00:00:00 GMT-0600" 
       isDuration="true" 
       title="Oswald moves to New Orleans">
         Oswald moves to New Orleans, and finds employment at the William <!-- The event's description -->
         B. Riley Coffee Company. &lt;i&gt;ref. Treachery in Dallas, p 320&lt;/i&gt;
    </event>
    <event>
      ...
    </event>
</data>
```

## JSON Data Format ##
See http://json.org for general information about JSON.

The JSON format used for Timeline includes the above attributes in the following format:

_Everything_ is contained in a single base object **`{}`** The base object can include the Timeline attributes:
  * wiki-url
  * wiki-section
  * date-time-format

The base object also contains the _events_ attribute. Its value is an array of _event_ objects. The events can be in any order, they do not have to be ordered by date.

Each event object can include the event attributes listed above as key : value pairs. For example:
  * start, latestStart, earliestEnd, etc
  * description is also stored as member of the event object.

As noted in the Event attributes section above, the Timeline JSON data format will accept references to the Javascript Date object as an alternative to date strings. Note that your data set will no longer strictly qualify as JSON if you include Date objects in it. (But it will load faster!)

### Caveats ###
JSON true, false values must not include quotes. See durationEvent, below.

JSON arrays and objects should _not_ have trailing commas before closing brackets or braces. If present, they will cause problems with some JS engines. Eg, the one in Internet Explorer.

### JSON Examples ###

```
{ 
  'wiki-url':"http://simile.mit.edu/shelf/", 
  'wiki-section':"Simile JFK Timeline", 
  'dateTimeFormat': 'Gregorian',
  'events': [
    {
       'start':"Sat May 20 1961 00:00:00 GMT-0600",
       'title':"'Bay of Pigs' Invasion",
       'durationEvent':false // Notes: not "false". And no trailing comma.
     }, {
       'start':"Wed May 01 1963 00:00:00 GMT-0600" ,
       'end':"Sat Jun 01 1963 00:00:00 GMT-0600" ,
       'durationEvent':true,
       'title':"Oswald moves to New Orleans",
       'description':"Oswald moves to New Orleans, and finds employment at the
William B. Riley Coffee Company. <i>ref. Treachery in Dallas, p 320</i>"
     }, {
      ...
     } ]    // Note: Do NOT include a trailing comma! (Breaks on IE)
}

```

**Please do not leave comments here, they are not read. Use the [mailing list.](http://groups.google.com/group/simile-widgets/) Thanks.**