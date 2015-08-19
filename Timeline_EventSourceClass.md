## Introduction ##

## Interface ##
Straight from the code:

Timeline.DefaultEventSource.Event.prototype

Event Methods:
  * getID:          function() { return this._id; },
  * isInstant:      function() { return this._instant; },
  * isImprecise:    function() { return this._start != this._latestStart || this._end != this._earliestEnd; },
  * getStart:       function() { return this._start; },
  * getEnd:         function() { return this._end; },
  * getLatestStart: function() { return this._latestStart; },
  * getEarliestEnd: function() { return this._earliestEnd; },
  * getText:        function() { return this._text; },
  * getDescription: function() { return this._description; },
  * getImage:       function() { return this._image; },
  * getLink:        function() { return this._link; },
  * getIcon:        function() { return this._icon; },
  * getColor:       function() { return this._color; },
  * getTextColor:   function() { return this._textColor; },
  * getProperty:
  * getWikiURL:     function() { return this._wikiURL; },
  * getWikiSection: function() { return this.