## Introduction ##

Using the js Date() object in a json event source offers substantial performance improvements over XML event source or json using iso8601 strings for the dates.

```
{'start': new Date(1216,2,15),
'end': new Date(1216,2,18)
}
```

**Notes**
  * Using Date() objects obviates the need for an explicit 'dateTimeFormat': 'iso8601', declaration at the top of the file.
  * The JSON standard does not allow object declarations. So your event data set will no longer be valid JSON. But it will work fine with Timeline.
  * The Date object will use the timezone of the browser. To use a specific GMT time, use `new Date(Date.UTC(2008,0,17,20,00,00,0))`
  * the js Date() object takes seven arguments, first three are required:
    * `Date(year, month, day, hours, minutes, seconds, milliseconds)`
    * `Date` and `Date.UTC` use zero-indexed months: 0 => Jan, 1 => Feb, ..., 11 => Dec