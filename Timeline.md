# Timeline Documentation #
![http://simile-widgets.googlecode.com/svn/wiki_images/Sundial.png](http://simile-widgets.googlecode.com/svn/wiki_images/Sundial.png)

This page serves as an entry point to the documentation of the [Simile Widgets](http://code.google.com/p/simile-widgets/) **Timeline** component. To reference the previous documentation hosted at MIT please refer to [html](http://simile.mit.edu/timeline/docs/) or [wiki](http://simile.mit.edu/wiki/Timeline).  We'll try to move all existing (as of September 2nd, 2007) over by September 5th and we'll update that wiki to point here.

Timeline allows web site creators to embed interactive timelines into their sites.  It requires only that visitors have Javascript enabled.  It's often referred to as "Google Maps" for time.

## Call for Help ##

We need your help to make this documentation better.  If you have information or examples, please contribute.

This wiki still references images and examples from the MIT site.  Almost all the content was migrated from that site.  Overtime those artifacts will be migrated here as well.

## Examples ##
  * [Timeline examples](http://simile-widgets.googlecode.com/svn/timeline/tags/latest/src/webapp/examples/index.html)
  * [In the Wild](Timeline_In_the_Wild.md) Examples of Timeline in use around the world.

## How-Tos ##

### Getting Started ###
  * [The Basics](Timeline_Basics.md), briefly how timelines work
  * [Timeline releases and access](Timeline_Releases_and_Access.md) options
  * [How events are shown on a Timeline](Timeline_Event_Display.md)
  * [Getting started](Timeline_GettingStarted.md), a step by step tutorial
  * [Understanding Initialization](Timeline_UnderstandingInitialization.md) - walk through of Timeline initialization and defaults
  * [Event Attributes and Data Formats](Timeline_EventSources.md) -- Describes event attributes and how to load event sources using XML, JSON or SPARQL
  * [Common problems and solutions](Timeline_Problems.md)

### Controlling Timeline Appearance and Behavior ###
  * [Creating Hotzones](Timeline_CreatingHotzones.md) -- A Hotzone is a section of the Timeline with a different resolution, usually higher resolution. Depending on your project, an alternative is to enable mouse-wheel zooming.
  * [How to create and change the Themes](Timeline_CreatingNewThemes.md)
  * [Custom Event Click Handler](Timeline_CustomEventClickHandler.md) - Using your own handler instead of showing a bubble
  * [Custom Detail display](Timeline_CustomEventDetailDisplay.md) - Customizing the popup bubble
  * [Add a day label](Timeline_DayLabel.md) - Adding a day label with your month when your interval unit are days
  * [Mouse-wheel Scrolling and Zooming](MouseWheelScrollingAndZooming.md) - Use the mouse-wheel to zoom your Timeline--an alternative to Hotzones
  * [Vertical Scrollbar](Timeline_VerticalScrollbar.md) - Adding a vertical scrollbar
  * [Custom Date Ranges](Timeline_CustomDateRanges.md) - How to create additional date/time range units
  * [Moving the Timeline via Javascript](Timeline_Moving_the_Timeline_via_Javascript.md)
  * [http://www.linuxjournal.com/article/9301](http://www.linuxjournal.com/article/9301) -- good info on changing themes AND some good info on loading data

### Timeline Client UI Ideas ###
The Timeline library is called by client software on your html page. Your client software can add additional User Interface (UI) features.
  * [Highlighting and Filtering Controls](Timeline_highlighting_and_filtering.md)
  * [Multiple filter boxes](Timeline_multiple_filter_boxes.md)
  * [Highlighting Weekends](Timeline_highlighting_weekends.md)

### Loading data ###
  * [Data stored in the Timeline file vs an external data file](Timeline_DataInTheTimelineFile.md)
  * [Loading external data file without a web server](Timeline_DataExternalNoWebServer.md)
  * [Load Events Dynamically](Timeline_LoadEventsDynamically.md)
  * [use js Date()](Timeline_EventSourceJSON_jsDate.md) with JSON
  * [EditGrid](Timeline_EditGridXSLT.md) - Convert an EditGrid spreadsheet to Timeline XML format
  * [Gnome Planner](Timeline_GnomePlanner.md) - Convert plans from the Gnome project management tool "Planner" to Timeline XML format
  * [Sharepoint Lists ](Timeline_SharePointLists.md) - Convert SharePoint List into Timeline XML format
  * http://apassant.net/home/2006/07/rss2timeline/ - Display RSS feeds
  * http://www.semanticweb.gr/SWEvents/timeline_ics.php?icsurl=http://www.semanticweb.gr/SWEvents/SWEvents.ics - Display an iCal (.ics) URL
  * http://code.google.com/apis/gdata/cal_simile_sample.html Google Calendar - Display Google Calendar using JSON feed source
  * http://code.google.com/p/timemap/ - Load JSON or KML onto both a google map and a timeline simultaneously

### Timeline generators as a service ###
  * http://www.mytimelines.net/ - Displays Atom, RDF and RSS feeds
  * http://www.mytimelines.net/create-an-icalendar-timeline/ - Displays iCalendar files
  * http://timeline.to/ - Universal Timeline Aggregator - Displays Atom and RSS feeds

### Sites and Software incorporating Timelines ###
  * [TimeMap](http://code.google.com/p/timemap/) - Integrates Timeline with Google Maps
  * http://mqlx.com/~david/parallax/ - search engine for freebase.org
  * http://semantic-mediawiki.org/wiki/Help:Timeline_format - Semantic MediaWiki
  * http://jrochelle.googlepages.com/97g-timeline-about.html Google Spreadsheet - has a timeline gadget based on Timeline
  * http://www.zotero.org/documentation/timelines - Zotero Firefox extension embeds Timeline

### Language or Framework Support ###
  * http://code.google.com/p/gwtsimiletimeline/ - GWT API library to support SIMILE Timeline within the GWT framework.
  * http://code.google.com/p/similetimelinerailshelper/ - Rails helper
  * http://project.dahukanna.net/tiddlywiki/timeline/sampletimeline220b5.html - TiddlyWiki Integration
  * http://www.zkoss.org/smalltalks/timeline1/timeline1.dsp - integrated into ZK OOS
  * http://bakery.cakephp.org/articles/view/timeline-helper - integration with the CakePHP framework
  * Wordpress [plugin](http://www.freshlabs.de/journal/archives/2006/10/wordpress-plugin-simile-timeline/) by freshlabs
  * Drupal [module](http://drupal.org/project/timeline)

### API ###
  * [Timelines](Timeline_TimelineClass.md)
  * [Bands](Timeline_BandClass.md)
  * [Ether](Timeline_EtherClass.md)
  * [Ether Painters](Timeline_EtherPainterClass.md)
  * [Decorators](Timeline_DecoratorClass.md)
  * [Event Sources](Timeline_EventSourceClass.md)
  * [Event Painters](Timeline_EventPainterClass.md)
  * [Layouts](Timeline_LayoutClass.md)
  * [Themes](Timeline_ThemeClass.md)
  * [Labellers](Timeline_LabellerClass.md)

## Guidelines ##
  * [How to update the Timeline software](How_To_Commit_Code.md)
  * [Accessibility Guidelines](Timeline_Accessibility.md)
  * [Usability Guidelines](Timeline_Usability.md)

## Similar Tools ##

  * The Historical Event Markup and Linking Project http://www.heml.org generates SVG [timelines](http://www.heml.org/heml-cocoon/sample-timeline), [maps](http://www.heml.org/heml-cocoon/sample-map) and animated maps from documents conforming to its XML markup language for historical events. The markup language, defined in XML Schemas http://heml.mta.ca/Schemas/2003-09-17/heml.xsd, associates events with persons, locations, and keywords, employs multiple calendrical schemes and is multilingual. There is a Heml [xhtml language](http://www.heml.org/heml-cocoon/sample-xhtml) available, too. The project's past five years of development are recorded in its SVN server http://heml.mta.ca/viewsvn/?do=browse&project=heml_svn&path=/. RDF/Heml ideas were presented at the WWW2006 conference http://www2006.org/programme/files/xhtml/p199/pp199-robertson-xhtml.html.

  * [LongView](http://www.longnow.org/about/longview.php), a project of the [The Long Now Foundation](http://www.longnow.org/), is a server side python script for generating HTML timelines from simple datafiles of comma separated values. It requires Python version 2.3. For generating its graphical elements, LongView also depends on the python [GD module](http://newcenturycomputers.net/projects/gdmodule.html), which itself depends on Thomas Boutell's GD library (linked to from the python GD module home page). [Biotechnology Milestones 08000BC - 02022](http://redpuma.net/longview/tree/biotech-html/) is an example of LongView in use. Detailed instructions for installation and use are to be found at [http://www.longnow.org/about/LongViewReadMe.php](http://www.longnow.org/about/LongViewReadMe.php).

  * [WikiTimeLine](http://www.mediawiki.org/wiki/Extension:WikiTimeLine) a WikiMedia extension.  See an example [WikiTimeScale.org](http://www.wikitimescale.org)

**If you have questions, please use the [mailing list](http://groups.google.com/group/simile-widgets/). Comments posted here are NOT read**