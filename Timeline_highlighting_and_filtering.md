# Introduction #
The Timeline library includes highlighting and filtering api calls.

## Highlighting ##
An event can have highlighting added on a per-band basis.
  * Use the band's getHighlightMatcher and setHighlightMatcher to add your highlighting function.
  * Your function will have argument evnt -- an event object
  * Your function returns the highlighting\_index (integer) for the event:
> > 0 - no highlighting
    1. 9 - highlighting indexes. -- Uses the highlighting css in the css file.

### Example ###
See the JFK Timeline for an example of adding highlighting to a Timeline

## Filtering ##
Bands include a filtering option. Each event in a band with a filter either will pass the filter and be shown in the band, or will be stopped by the filter and not shown.
  * Use the band's getFilterMatcher and setFilterMatcher to add your filter function.
  * Your function will have argument evnt -- an event object
  * Your function returns true if the event passes the filter, or false.

Filters are binary: either an event passes the filter procedure and will thus be shown on the timeline or it doesn't, and the event will be omitted.

If you want additional logic for the _user interface_ then you can make your filter procedure as elaborate as you'd like: eg multiple boxes that "or" the boxes' content against the event name/description; check boxes for different pre-defined event types, ANDing and ORing of expressions; filtering using drop down menus of different event 'categories' etc.

Note that the filter can also look into additional event attributes that are not part of the formal Timeline event attributes. This is done through the method event.getProperty

See also: [Multiple filter boxes](Timeline_multiple_filter_boxes.md)

### Example ###
See the JFK Timeline for an example of adding filtering to a Timeline
