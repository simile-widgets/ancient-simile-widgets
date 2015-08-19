# Introduction #

You'd like your Timeline to make a visual distinction between weekdays and weekends.

# Discussion #

You can shade the background of a time period by using a "decorator"
For an example, see the JFK timeline.

Tol accomplish our goal, we will create decorators for each weekend.

You may want to use a null label for the weekend rather than a label of "weekend"

_Note_ The ability to use null labels for decorators is only in Timeline version 2.3.0 and later.

## Suggested algorithm ##
First, find the start of the first weekend that is 7 days (or fewer) before your first event. That way you'll be sure to color the weekend that is **before** your first event.
Then loop, adding 7 days to the first weekend date, through your last event date + 7 days.

For every iteration, add a weekend highlighter.

The Javascript date object's methods should be adequate for all of the above calculations.
You may also want to use the start and end features which limit the entire Timeline (instead of being infinite.)

## Software Options ##
You can write the software to generate multiple decorators in Javascript, which would run on the browser. This method has the advantage of smaller Javascript files and can lead to more generic solutions.

Or you can write the software on your host system, and then include the simple Timeline.SpanHighlightDecorator calls in your html file. This approach enables you to use your favorite host language (php, Java, perl, Ruby, etc).

A Timeline forum contributor, Wayne, chose the latter method and used Java on his host system. His results are here:
[forum posting](http://groups.google.com/group/simile-widgets/browse_thread/thread/6fe8b9218ec5bd9c)





