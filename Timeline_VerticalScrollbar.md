Add the following CSS to your timeline container.

```
.your-timeline-container { overflow-x:hidden; overflow-y:scroll;}
```
This will enabled a vertical scrollbar when you have many events but you will notice that timeline doesn't draw itself completely in the lower part like so:

![http://simile.mit.edu/mediawiki/images/7/7e/Before.jpg](http://simile.mit.edu/mediawiki/images/7/7e/Before.jpg)

it's because its height is calculated with the container's starting height. If you take a quick look in the DOM using Firebug, ''you'll notice the '''height''' is within the '''container's style attribute'''''.  Bingo! now we just need to find the function that does the calculation or that adds the height to the container.

Find the '''setBandShiftAndWidth''' function in the '''timeline.js''' file and modify the following line :

```
this._div.style.height = width + "px";
```

to

```
this._div.style.height = "100%";
```

Change the mouseWheel setting in your theme to 'default'
See MouseWheelScrollingAndZooming and Timeline\_ThemeClass

thats it!

here's what it looks like now:

![http://simile.mit.edu/mediawiki/images/e/e4/Really_now.jpg](http://simile.mit.edu/mediawiki/images/e/e4/Really_now.jpg)