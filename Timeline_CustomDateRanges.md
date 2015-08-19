[Timeline](Timeline_TimelineClass.md) has built-in date ranges for each of the normal discrete units of time.  This includes milliseconds to minutes to decades to millennia.  However, you may have timelines that would be better visualized using a measure of time that does not fit into one of these units, such as a quarter of an hour.  Adding new units of time in Timeline is quick and easy.  The two files you will need to change are **`date-time.js`** and **`labellers.js`**.

The examples here will use a new "quarter-hour" unit.

## Editing date-time.js ##

Add a constant to the **`Timeline.DateTime`** object:
```
   Timeline.DateTime.QUARTERHOUR = 4;
```
If you insert your constant in its "logical" place among the rest of the constants, be sure to remember to shift the values of the other constants accordingly.
Add a **`gregorianUnitLength`** constant:
```
   a[d.QUARTERHOUR] = a[d.MINUTE] * 15;
```
Add a **`case`** for the **`roundDownToInterval`** member function:
```
   case Timeline.DateTime.QUARTERHOUR:
   date2.setUTCMilliseconds(0);
   date2.setUTCSeconds(0);
   var x = date2.getUTCMinutes();
   x=(x-(x%15))/15;
   date2.setUTCMinutes((x-(x%multiple))*15);
   break;
```
Add a **`case`** for the **`incrementByInterval`** member function:
```
   case Timeline.DateTime.QUARTERHOUR:
   date.setTime(date.getTime() + Timeline.DateTime.gregorianUnitLengths[Timeline.DateTime.QUARTERHOUR]);
    break;
```

## Editing labelers.js ##

These edits are not strictly necessary, as Timeline will default to showing an ISO date for any units of time that it does not recognize.  However, a full date may not be appropriate for small units of time.

Add a **`case`** for the **`defaultLabelInterval`** member function:
```
    case Timeline.DateTime.QUARTERHOUR:
    var m = date.getUTCMinutes();
    if (m == 0) {
        text = date.getUTCHours() + "hr";
        emphasized = true;
    } else {
        text = ":" + m;
    }
    break;
```

## Usage ##

You should now be able to use the new unit of time in your constructor:
```
    Timeline.createBandInfo({
    eventSource:    eventSource,
    intervalUnit:   Timeline.DateTime.QUARTERHOUR, 
    // ...
```

## Alternatives ##

The [JFK example](http://simile.mit.edu/timeline/examples/jfk/jfk.html) shows how you can get Timeline to mark every so many minutes using the **`multiple`** field.