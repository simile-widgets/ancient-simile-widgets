# The Timeline Theme #

The Timeline Theme is a Javascript structure used to hold constants for the Timeline library.

The theme controls many aspects of the Timeline and the individual Timeline bands. Most theme values affect only a specific band, others affect the Timeline as a whole.

Each band has its own theme setting. The first band's theme is used to control any Timeline-wide constants.

## CSS ##
Some constants are set through the Timeline css files. Those values and rules can be overridden by adding the appropriate rules to your own CSS files. Remember to load your CSS files after the Timeline library (and its CSS) has been loaded.

## Why not use CSS for more values? ##
Some Timeline geometry values are set in the theme. For example, tape height. The CSS file is not used for the geometry values since the Timeline sw places many elements exactly on the page. To correctly place the elements, the Timeline library needs to know the exact size of the elements. If the size was specified in CSS, the Timeline sw would need to learn the values from the CSS file, either directly or indirectly. Doing so would be much slower than specifying the values in the theme.

# Changing the Theme #
It is easy to change the theme. First create a standard theme. Then modify its values and finally, apply the theme to one or more bands. The same theme object can be used for more than one band. If a theme value will be different for different bands, then create additional theme objects.

```
            // Example of changing the theme from the defaults
            // The default theme is defined in 
            // http://simile-widgets.googlecode.com/svn/timeline/tags/latest/src/webapp/api/scripts/themes.js
            var theme = Timeline.ClassicTheme.create(); // create the theme
            theme.event.bubble.width = 350;   // modify it
            theme.event.bubble.height = 300;
            theme.event.track.height = 15;
            theme.event.tape.height = 8;
            
            var bandInfos = [
                Timeline.createBandInfo({
                    width:          "100%", 
                    intervalUnit:   Timeline.DateTime.DECADE, 
                    intervalPixels: 200,
                    eventSource:    eventSource,
                    date:           d,
                    theme:          theme, // Apply the theme
                    layout:         'original'  // original, overview, detailed
                })
            ];
```


**Please do not leave comments here, use the mailing list instead. Thank you.**