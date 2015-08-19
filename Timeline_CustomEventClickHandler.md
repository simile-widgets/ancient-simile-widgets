If you want to use your own handler instead of showing the bubble when clicking on an event, use the following Javascript code after loading the .js files:

```
  Timeline.OriginalEventPainter.prototype._showBubble = function(x, y, evt) {
   alert (evt.getDescription ());
   }
```

In this example just an alert is generated when you click on an event, instead of the usual bubble being shown.

If you would like to have a page load when the user clicks on an event, instead of a bubble, use the following code after loading your timeline:

```
  Timeline.OriginalEventPainter.prototype._showBubble = function(x, y, evt) {
   document.location.href=evt.getLink();
  }
```

Beware that both of these calls can limit functionality. When a user clicks inside of the containing div (which is displaying as a block, so it may extend outside of the title), the action will execute. Since the same area can be used for navigating through the Timeline, there may be a inadvertent calls to the showBubble function.