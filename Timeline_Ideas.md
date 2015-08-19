Some of these appear be already implemented... (i.e. Default display date is now current date)

  * Support for event classes. Each event would be assigned a class; on the timeline, classes would be distinguished by colors, and optionally, grouping (i.e., events of a particular class are vertically adjacent to the others in the class, and each class could be separated by a thin horizontal line).
  * Key support (left, right, up, down, home, end, pgup, pgdn, space to scroll slowly, n/p to go next/previous event, Esc to close bubble) - Steven Madson has showed me [some code](http://smadson.net/timeline/) but I haven't had time to look at it.
  1. Related suggestion: direction arrows for alternative navigation (alternative to click and drag)
  * Make it really easy to pick between defaulting to GMT, and the current viewer's timezone (in my case, +1030), or to 'guess' it from the data (for instance, I'm using it to track job history in our work applications, so everything is printed out by PHP as GMT+1030) - maybe an attribute on the root element of the XML file?
  * Vertical layout doesn't appear to render things properly - yes, I wasn't sure how to do the layout
  * In a similar fashion to google calendar's quick add, it would be really, really decent to be able to press a hot key; type; then jump to a certain point. "Tomorrow" , "1854, 27 mar, 3pm", etc.
  * The default mouse cursor should be a MOVE icon (div { cursor: move; }) - or maybe w-resize or s-resize?
  * Type to Find feature:
  1. searches the data loaded already and scrolls to first match (next match, prev match, etc)
  1. or clears data, and sends to query off to the backend (you might watch to use Lucene or something on your webserver) and refetches data.
  * Being able to limit a certain band from Date 1 to Date 2 would be good; I don't care about events "before 1985 and after 2006"; so I'd like to stop scrolling there.
  * Indicate that there are more events in either edge of the timeline (maybe a tiny arrow indicator or even the number of events remaining to be seen in that direction)
  * Timeline's trick of writing 

&lt;script&gt;

s and 

&lt;link&gt;

s into the document as it loads doesn't work on application/xhtml+xml resources.
  * Ability to add google maps to the info window, so each event can be placed on the map.
  * Ability to add video and/or flash to the info window.
  * A [SpanHighlightDecorator](SpanHighlightDecoratorClass.md) appears to use tables when drawing the labels. If borders are globally set for parts of a table on the site that Timeline is being used on, those labels have a border around them (even if the labels are empty). Timeline should probably defend against this with something along the lines of:
```
.timeline-container table, .timeline-container td {
  border: 0;
}
```
  * Add a loading bar / status, in case the data is created dynamically and could be a bit long to appear
  * Find a way to make the labels of duration events elastic so that they can accept text up to the limit of their extent. Labels too long for the duration event would be written outside the duration bar up to a fixed width as they are now.
  * Option to have the timeline load with the current date centered instead of some arbitarary date. This would make it more useful as a personal calendar (which is what I want to do!).
  1. That's possible right now: just add some code to use ''setCenterVisibleDate'' to jump to the date you want. See function ''tardis'' in [this code](http://www.astronomer.me.uk/logs/by-timeline/log-timeline.js) for example.
  1. Here's an easier way: in the onLoad() function where you create the bandInfo object, set the date as follows:
```
	    var dt = new Date(); // today
	    var d = Timeline.DateTime.parseGregorianDateTime(dt.toUTCString());
            var bandInfos = [
                Timeline.createBandInfo({
                    width:          "100%", 
                    intervalUnit:   Timeline.DateTime.DAY, 
                    intervalPixels: 200,
                    eventSource:    eventSource,
                    date:           d,
                    theme:          theme
                })
            ];
```

  * Render time stamps to only the amount of precision known. Given date precision, for instance, not appending a superfluous "00:00:00 GMT" suggesting second precision data.
  * Allow backslash-n or other syntax in the description field for pretty printing.
  * Allow updates of the input xml or JSON files to trigger a refresh event.
  * Allow the multiple paramater to update JSON painted data; multiple 24, 1440, etc show no bars for  hours or minutes respectively.
  * Allow annotations - large brace or bracket over a group of events to label them.
  * Allow dependencies so that merged datasets in a single timeline don't sort themselves by time, obscuring relationships that would be obvious if the datasets were in different, parallel timelines.
  * Allow navigation along CHAINS of events.
  * Remove duplicate events (same startdate and title) when loading multiple XML files. I don't really care which one. It could be first in or last in that gets kept.
  * A getCount method for the number of events currently highlighted and a getCount for the number of events filtered.
  * Add support for microformats for sucking in contact information in [hCard](http://microformats.org/wiki/hcard) and event information in [hCalendar](http://microformats.org/wiki/hcalendar).
  * Ability to single-click on a date label to center on that date.
  * Ability to easily create a band with a view width that shows the entire lifespan from the earliest event the latest.  It wouldn't scroll, but clicking it would center the other bands on that date.  It would not necessarily need labels or an interval unit, just markers for all the events.  It would show all the events at the same time, with the layout, amount, and distribution of events in a single band.
  * Write a Timeline wrap-up as a [MediaWiki markup extension](http://meta.wikimedia.org/wiki/Extending_wiki_markup).
  * Present instantaneous events with imprecise time as a div with borders except on top (something like |