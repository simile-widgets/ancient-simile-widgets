this is incomplete....

## Lazy Loading ##

Register for scrolling events on one band and react to it, e.g.,
```
    tl.getBand(0).addOnScrollListener(function(band) {
       var minDate = band.getMinDate();
       var maxDate = band.getMaxDate();
       if (... need to reload events ...) {
          eventSource.clear();
          tl.loadXML(...);
       }
    });
```