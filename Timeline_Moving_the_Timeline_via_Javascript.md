# Introduction #

The user can move the Timeline via dragging the Timeline with the mouse, using the mouse-wheel, arrow keys, etc. In addition, you can add HTML controls to your page that will move the Timelins to specific dates.

# Details #

_Bands_ provide three methods for moving their Timeline. Any other bands will move too, if they are connected to the band that you're moving. The methods are:

  * band\_object.setMinVisibleDate(date) -- set the left side of the visible part of the Timeline to a specific date
  * band\_object.setMaxVisibleDate(date) -- set the right side of the visible part of the Timeline to a specific date
  * band\_object.setCenterVisibleDate(date) -- set the center of the visible part of the Timeline to a specific date

## Examples ##
```
tl.getBand(0).setCenterVisibleDate(Timeline.DateTime.parseGregorianDateTime(date))
```

### Example Page ###
See the date anchor elements (1 AD, 250 AD, etc) at the top of the Religion Timelines example.

Source: http://simile-widgets.googlecode.com/svn/timeline/trunk/src/webapp/examples/religions/religions.html