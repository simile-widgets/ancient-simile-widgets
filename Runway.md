# Runway 1.0 #

SIMILE Widget Runway lets you display images in a rich interactive visualization similar to that of Apple iTunes, known as Cover Flow. Runway is a Flash-based implementation. Here is [the project page and live demo](http://www.simile-widgets.org/runway/).

Just like all the other SIMILE widgets, Runway is open source under the BSD license, and completely free for you to use. Of course, we would appreciate that you give us due credits by at least linking back to http://www.simile-widgets.org/runway/ from where you use it. Enjoy!

# How to Use #

## Step 1. Cross Domain Policy ##

Make sure that the site(s) where the image files are located make available a crossdomain.xml policy file giving permission to Runway to load those image files. Suppose that the image files are coming from http://example.com/, then there must be a http://example.com/crossdomain.xml file

```
<?xml version="1.0"?>
<!DOCTYPE cross-domain-policy SYSTEM "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">
<cross-domain-policy>
  <allow-access-from domain="*" />
</cross-domain-policy>
```

Here is [such a file](http://www.freebase.com/crossdomain.xml) on [freebase.com Freebase], which grants access to all Flash widgets (including Runway) from all domains.

If you want a more restrictive policy, consult Adobe's [technote on cross domain policy](http://kb.adobe.com/selfservice/viewContent.do?externalId=tn_14213).

## Step 2. Prepare the Data ##

Runway right now only takes data in Javascript. Here is an example Javascript file containing data for Runway: http://www.simile-widgets.org/runway/data.js. If you know Javascript, then you can get data in any other form from any other source as long as you can transform it into such an array before feeding it into Runway.

## Step 3. Writing the HTML and Javascript ##

It's best that you look at the source code of http://www.simile-widgets.org/runway/index.html, copy it (together with the data file above) locally, and tweak it for your purpose.

There are a few important details to note. First, the inclusion of the Runway API
```
    <script src="http://api.simile-widgets.org/runway/1.0/runway-api.js" language="javascript"></script>
```
Then the placeholder for where the Runway widget will be rendered
```
   <div id="the-widget" style="height: 400px;"></div>
```
Then the Javascript code to construct the Runway widget
```
widget = Runway.createOrShowInstaller(
    document.getElementById("the-widget"),
    {
        // examples of initial settings
        // slideSize: 200,
        // backgroundColorTop: "#fff",
        
        // event handlers
        onReady: function() {
            widget.setRecords(records);
        }
    }
);
```

## Step 4. Security Issues ##

When you're testing your .html file locally (through a file:/// URL), you would need to tell Flash to "trust" that file. This is done by pointing your browser at

http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html

That page embeds a Flash interface for you to configure the Flash player. Open the dropdown labeled "Edit locations..." and choose "Add location...". Then click "Browse for files...". When you see the file dialog box, change its extension filter (bottom right corner) from "Flash Movies (`*`.swf)" to "All files (`*`.`*`)". Then find your .html file.

You should now be able to open your .html file in the browser.

If you see a background gradient where the Runway widget is supposed to be, but no images, it means that the Flash has been loaded successfully, but it cannot access the images. You might want to double-check step 1 to see if the images have the right permission.

# Properties (Settings) #

There is 1 property that you can only change when you construct the Runway widget: `slideSize` (in number of pixels). At the moment, you cannot change the slide size on-the-fly.

You can also set the theme at construction time with the `theme` property. But you can switch theme on-the-fly using the `setThemeName(name)` method.

For all the other properties, please see [this live demo](http://www.simile-widgets.org/runway/) and play with the settings panel on the right.

# Development #

You need to download the [Flex SDK](http://opensource.adobe.com/wiki/display/flexsdk/Downloads).

Download the source code through [our SVN](http://code.google.com/p/simile-widgets/source/checkout), using this URL for the Runway project:
```
http://simile-widgets.googlecode.com/svn/runway/trunk/
```

The source code contains a README.txt file that gives some hints on how to debug Runway.