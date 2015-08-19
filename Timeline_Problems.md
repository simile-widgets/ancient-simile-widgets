# Introduction #

Timelines are sophisticated Javascript/Ajax applications. You should test your Timeline pages in several different browsers before releasing it to your user base.

Remember that Apple's Safari browser can be used and tested on Windows.

# Some common Timeline problems and their solutions #

## Works properly in most browsers, but not Internet Explorer ##

### Trailing Commas ###
Most browsers ignore trailing commas in array and hash or object constructors, but IE does not. This can lead to many problems in Timeline. In the following example, the two trailing commas would work fine in every browser except IE.
```
{ 
  'wiki-url':"http://simile.mit.edu/shelf/", 
  'wiki-section':"Simile JFK Timeline", 
  'dateTimeFormat': 'iso8601',
  'events': [
    {
       'start':"Sat May 20 1961 00:00:00 GMT-0600",
       'title':"'Bay of Pigs' Invasion"
     }, {
       'start':"Wed May 01 1963 00:00:00 GMT-0600" ,
       'end':"Sat Jun 01 1963 00:00:00 GMT-0600" ,
       'isDuration':"true" ,
       'title':"Oswald moves to New Orleans",
       'description':"Oswald moves to New Orleans, and finds employment at the William B. Riley Coffee Company. <i>ref. Treachery in Dallas, p 320</i>"
     }, // trailing comma!
  ],    // trailing comma!
}

```

### Negative time periods ###
If the _start_ date for an event, hotzone or highlight is _after_ the _end_ date, the Timeline may try to draw a div with a negative width property to match your negative time period. Many browsers, including FF, silently ignore such bogus div elements. But IE is pickier and will throw an error instead of ignoring the issue.

The IE debugger works well for spotting these problems. If you don't have the debugger handy, try simplifying your Timeline. Then use stepwise refinement to add features back in. When you find a problematic feature, check its dates to see that they are valid.


## Works properly in some browsers, but not all ##

### XML Mime type and Characters ###
If you're using the XML data format, then your incoming XML file will be read and parsed by the browser, not by the Timeline library. Because this (large) task is handled by the browser, there can be browser-specific issues.

If an XML Timeline is working on some browsers but not others, check the following:

#### XML mime type ####
Your XML response should include
> Content-Type application/xml
It can be checked by examining the response headers using firebug.

#### No < & or > characters in XML ####
The XML tag bodies must not include any stray &, < or > characters. Often the ampersand characters are overlooked. All of the characters need to be escaped.
  * & has to be written as &amp;
  * > has to be written as &gt;
  * < has to be written as &lt;

Note that the semi-colon is a part of the escape sequence.

There are no exceptions to this rule. Google for "XML reserved characters" to learn more.



**If you have questions, please use the [mailing list](http://groups.google.com/group/simile-widgets/). Comments posted here are NOT read**