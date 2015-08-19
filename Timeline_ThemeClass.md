## Introduction ##

The theme controls the visual appearance of the timeline. The default theme is the ClassicTheme, which can be created with **`Timeline.getDefaultTheme()`**. The theme is set for each timeband separately by setting the theme parameter in Timeline.createBandInfo(params). Here's information on [creating new themes](Timeline_CreatingNewThemes.md).

# **`ClassicTheme`** #
Offers reasonable defaults and is used as a basis for most if not all timeline examples.

## **`firstDayOfWeek`** ##
Defaults to 0, which stands for Sunday.

## **`ether`** ##
Controls the Ether for this theme.

### **`highlightColor`** ###
The color for the highlight, can be set to any value that is used in CSS, i.e. color names like "white", "red" as well as RGB values like "#6666cc" or "#66c".

### **`highlightOpacity`** ###
The opacity of the highlight, which is a value between 0 (not visible) to 100 (full opacity).

### **`interval`** ###

### **`mouseWheel`** ###
The behavior of the mouse-wheel when over a band. Set to one of:
  * scroll -- _default value in the default theme._ The mouse-wheel will move the Timeline forward/backward in time. Similar effect as the arrow keys.
  * zoom -- The mouse-wheel will change the scale of the Timeline. An alternative to Hotzones. See MouseWheelScrollingAndZooming
  * default -- mouse wheel controls vertical scrolling (if there is a vertical scrollbar)

## **`event`** ##
Controls the appearance of events for this theme.
### **`track`** ###
  * height: The height of the track, measured in pixel.
  * gap: The gap between two tracks, measured in pixel.
### **`overviewTrack`** ###
  * offset:     20,     // px
  * tickHeight: 6,      // px
  * height:     2,      // px
  * gap:        1       // px

### **`tape`** ###
### **`instant`** ###
Controls the appearance of instantaneous events. There are two type of such events, precise and imprecise events. Both types of events can be shown differently using the properties below:
  * icon: The URL of the icon that is shown for this event.
  * iconWidth: The width of the icon in pixel.
  * iconHeight: The height of the icon in pixel.
  * impreciseColor: The color in which the tape is drawn for imprecise events.
  * impreciseOpacity: The opacity of the tape for imprecise events.

### **`duration`** ###
### **`label`** ###
### **`highlightColors`** ###
### **`bubble`** ###
The bubble is shown when the user clicks on an event. The following parameters control the bubble:
  * width: The width of the bubble in pixel.
  * height: The height of the bubble in pixel.
  * titleStyler, bodyStyler, imageStyler, wikiStyler, timeStyler: The five stylers are used to determine the CSS class for different parts of the bubble. Each styler is actually a method which has a DOM element as a parameter and sets the class name of this element to "timeline-event-bubble-<styler name>" where "<styler name>" must be replaced by "title", "body", "image", "wiki" and "time" respectively.