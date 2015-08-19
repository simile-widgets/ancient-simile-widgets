# Timeline Event Display #

## Introduction ##
In standard use, a Timeline shows events in any of six different formats, discussed below. Screenshot of the six variations:
![http://simile-widgets.googlecode.com/svn/wiki_images/Timeline-event-displays.jpg](http://simile-widgets.googlecode.com/svn/wiki_images/Timeline-event-displays.jpg)


## non-Duration Events (Instant Events) ##
  * A non-Duration event, also known as an Instant event, is focused on a specific time. An example from history would be a person's date of death since it happens at a specific instant in time. (Example display: The first event in the screen shot.)
  * The time of the instant event is marked by the icon, or more specifically, by the middle of the icon. In the examples above, note how the icon is centered on the time axis' line.
  * If the instant event could have happened sometime between two times, the event is "imprecise" in time and will be shown with a dimmed tape. History example: marking the date of birth of someone when the specific date is not precisely known. (Second example on the screen shot.)

## Duration Events ##
  * A duration event is an event that occurs over a period of time. An example from history would be the dates of a war. Duration events are shown with a solid tape, and no icon. Note how the label is aligned with the start of the solid part of the tape. See the third example on the screen shot.
  * A duration event's dates might not be know precisely. There are three cases of imprecise duration events:
    * The starting time of the event is not known precisely.
    * The ending time of the event is not known precisely.
    * Neither the start nor end times of the event are known precisely.
    * The imprecise periods of a duration event are shown using the dimmed tape. See the last three examples in the screenshot.

## Color, Icon and More ##
  * The tape image, color, label color, icon and other display changes are possible using the event attributes. See  [Event Attributes and Data Formats](Timeline_EventSources.md) for more information. By setting the classname attribute for an event, you can create further variations such as bold labels.


## Icons and Dark Tape Display Variation ##
The six variations shown above are the "standard" display formats for Timeline. But another variation is possible:
  * A Timeline can show events with an icon and a dark tape. Change the Timeline's theme to use 100% opacity for `event.instant.impreciseOpacity` If you make this change, all imprecise instant events will use a 100% opacity tape. You could then distinguish Instant events by using a different color.