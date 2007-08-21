/**
 * @name Timegrid.RecurringEventSource
 * @author masont
 */
 
/**
 * A type of EventSource that allows the creation and display of recurring 
 * events that are not tied to a specific date, e.g. 8am on MWF.
 *
 * @constructor
 */
Timegrid.RecurringEventSource = function() {
    Timegrid.RecurringEventSource.superclass.call(this);
    
    /* 
     * The actual array containing event prototypes is kept private, and only
     * accessed/modified through priviledged methods created here, in the
     * constructor. 
     */
    var eventPrototypes = new DStructs.Array();
    
    //========================= Privileged Methods ==========================//
    
    /** Sets this source's event prototypes to the given prototypes */
    this.setEventPrototypes = function(a) {
        eventPrototypes.clear();
        this.addAllEventPrototypes(a);
    };
    
    /** Adds the given event prototype to this event source */
    this.addEventPrototype = function(eventPrototype) {
        eventPrototypes.push(eventPrototype);
        this._fire("onAddMany", []);
    };

    /** Adds all of the event prototypes from the given array */
    this.addAllEventPrototypes = function(a) {
        eventPrototypes.addAll(a);
        this._fire("onAddMany", []);
    };
    
    /** Removes the given event prototype from this source's prototypes */
    this.removeEventPrototype = function(eventPrototype) {
        return eventPrototypes.remove(eventPrototype);
    };
    
    /** Removes all of the event prototypes from this source */
    this.clearEventPrototypes = function() {
        eventPrototypes.clear();
        this._fire("onClear", []);
    };

    /** Generates events from event prototypes */
    this.generateEvents = function(startDate, endDate) {
        var result = new DStructs.Array();
        eventPrototypes.each(function(ep) {
            result.addAll(ep.generateEvents(startDate, endDate));
        });
        return result;
    };
};
$.inherit(Timegrid.RecurringEventSource, Timegrid.ListenerAware);

Timegrid.RecurringEventSource.prototype.loadXML = function(xml, url) {
    
};
Timegrid.RecurringEventSource.prototype.loadJSON = function(data, url) {
    
};
Timegrid.RecurringEventSource.prototype.getEventIterator = function(startDate, endDate) {
    return this.generateEvents(startDate, endDate).iterator();
};
Timegrid.RecurringEventSource.prototype.getEarliestDate = function() {
    return (new Date()).clearTime().setDay(0);
};
Timegrid.RecurringEventSource.prototype.getLatestDate = function() {
    return (new Date()).clearTime().setDay(7);
};

Timegrid.RecurringEventSource.EventPrototype = function(dayArray, start, end, 
        text, description, image, link, icon, color, textColor) {
    var id = "e" + Math.floor(Math.random() * 1000000);
    var days = new DStructs.Array(); days.addAll(dayArray);

    this.getDays = function() { return days; };
    this.getStart = function() { return start; };
    this.getEnd = function() { return end; };
    
    this.getID = function() { return id; }
    this.getText = function() { 
        return SimileAjax.HTML.deEntify(text); 
    };
    this.getDescription = function() { 
        return SimileAjax.HTML.deEntify(description); 
    };
    this.getImage = function() { 
        return (image != null && image != "") ? image : null;
    };
    this.getLink = function() {
        return (link != null && link != "") ? link : null;
    };
    this.getIcon = function() { 
        return (icon != null && icon != "") ? icon : null;
    };
    this.getColor = function() {
        return (color != null && color != "") ? color : null;
    };
    this.getTextColor = function() {
        return (textColor != null && textColor != "") ? textColor : null;
    }
    this.generateFrom = function(date) {
        if (!this.getDays().contains(date.getDay())) { return false; }
        var startTime = new Date(this.getStart());
        var endTime = new Date(this.getEnd());
        startTime.setDate(date.getDate());
        startTime.setMonth(date.getMonth());
        startTime.setFullYear(date.getFullYear());
        endTime.setDate(date.getDate());
        endTime.setMonth(date.getMonth());
        endTime.setFullYear(date.getFullYear());
        return new Timegrid.DefaultEventSource.Event(startTime, endTime, null,
                null, false, text, description, image, link, icon, color,
                textColor);
    };
};

Timegrid.RecurringEventSource.EventPrototype.prototype = {
    generateEvents: function(start, end) {
        var events = new DStructs.Array();
        for (var date = new Date(start); date < end; date.add('d', 1)) {
            var event = this.generateFrom(date);
            if (event) { events.push(event); }
        }
        return events;
    }
};
