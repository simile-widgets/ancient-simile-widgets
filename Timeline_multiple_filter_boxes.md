# Introduction #

A filter for a Timeline band is binary: either an event passes the filter or it doesn't. But the user interface for the filter can be elaborate.

In this example by Discussion Forum contributor Paul Thomas, pepsipaul, he updates the setupfiltercontrols.js file (in the examples directory of the Timeline source).

The new user interface provides three input text boxes and a "Filter" button to the user. If an event matches the text in any of the boxes, then the event passes the filter. This is "ORing" together the input boxes.

# Details #

```

I have made a semi-finished version of multiple filters. 
numOfFilters is a variable used to simply state the amount of filter 
input boxes there are. I changed the perform filtering method within 
the setupfiltercontrols.js 


 // --- Revised setupFilterHighlightControls.js ----

function centerTimeline(date) {
    tl.getBand(0).setCenterVisibleDate(Timeline.DateTime.parseGregorianDateTime(date));
}


var numOfFilters = 4;

function setupFilterHighlightControls(div, timeline, bandIndices, theme) {
   
    // Init Handler
    var handler = function(elmt, evt, target) {
        onKeyPress(timeline, bandIndices, table);
    };
   
   
    // Create Table
    var table = document.createElement("table");
   
    // First Row
    var tr = table.insertRow(0);
    var td = tr.insertCell(0);
    td.innerHTML = "Filters:";
   
      
    // Second Row
    tr = table.insertRow(1);
    tr.style.verticalAlign = "top";
   
    /* Create the text inputs for the filters and add eventListeners */
    for(var i=0; i<numOfFilters; i++) {     
        td = tr.insertCell(i); 
        var input = document.createElement("input");
        input.type = "text";
        //SimileAjax.DOM.registerEvent(input, "keypress", handler);
        td.appendChild(input);
        input.id = "filter"+i;     
    }
   
    // Third Row
    tr = table.insertRow(2);
    td = tr.insertCell(0);
       td.innerHTML = "Highlights:";
   
   
    // Fourth Row
       tr = table.insertRow(3);
   
       /* Create the text inputs for the highlights and add event listeners */
       for (var i = 0; i < theme.event.highlightColors.length; i++) {
           td = tr.insertCell(i);
       
           input = document.createElement("input");
           input.type = "text";
           SimileAjax.DOM.registerEvent(input, "keypress", handler);
           td.appendChild(input);
       
        input.id = "highlight"+i;
       
        var divColor = document.createElement("div");
        divColor.style.height = "0.5em";
        divColor.style.background = theme.event.highlightColors[i];
        td.appendChild(divColor);
    }
   
    // Fifth Row
      
    tr = table.insertRow(4);
    td = tr.insertCell(0);
   
    // create the filter button
    var filterButton = document.createElement("button");
    filterButton.innerHTML = "Filter";
    filterButton.id = "filter"
    filterButton.className = "buttons"
    SimileAjax.DOM.registerEvent(filterButton, "click", handler);
    td.appendChild(filterButton);
   
   
    // create the clear all button
    td = tr.insertCell(1);
    var highlightButton = document.createElement("button");
    highlightButton.innerHTML = "Clear All";
    highlightButton.id = "clearAll"
    highlightButton.className = "buttons"
    SimileAjax.DOM.registerEvent(highlightButton, "click", function() {
        clearAll(timeline, bandIndices, table);
    });
    td.appendChild(highlightButton);
   
   
    // Append the table to the div
    div.appendChild(table);
}

var timerID = null;
var filterMatcherGlobal = null;
var highlightMatcherGlobal = null;

function onKeyPress(timeline, bandIndices, table) {
    if (timerID != null) {
        window.clearTimeout(timerID);
    }
    timerID = window.setTimeout(function() {
        performFiltering(timeline, bandIndices, table);
    }, 300);
}
function cleanString(s) {
    return s.replace(/^\s+/, '').replace(/\s+$/, '');
}

function performFiltering(timeline, bandIndices, table) {
    timerID = null;
    var tr = table.rows[1];
   
    // Add all filter inputs to a new array
    var filterInputs = new Array();
    for(var i=0; i<numOfFilters; i++) {
      filterInputs.push(cleanString(tr.cells[i].firstChild.value));
    }
   
    var filterMatcher = null;
    var filterRegExes = new Array();
    for(var i=0; i<filterInputs.length; i++) {
        /* if the filterInputs are not empty create a new regex for each one and add them
        to an array */
        if (filterInputs[i].length > 0){
                        filterRegExes.push(new RegExp(filterInputs[i], "i"));
        }
                filterMatcher = function(evt) {
                        /* iterate through the regex's and check them against the evtText
                        if match return true, if not found return false */
                        if(filterRegExes.length!=0){
                           
                            for(var j=0; j<filterRegExes.length; j++) {
                                    if(filterRegExes[j].test(evt.getText()) == true){
                                        return true;
                                    }
                            }
                        }
                        else if(filterRegExes.length==0){
                            return true;
                        }    
                   return false;
                };
    }
   
    var regexes = [];
    var hasHighlights = false;
    tr=table.rows[3];
    for (var x = 0; x < tr.cells.length; x++) {
        var input = tr.cells[x].firstChild;
        var text2 = cleanString(input.value);
        if (text2.length > 0) {
            hasHighlights = true;
            regexes.push(new RegExp(text2, "i"));
        } else {
            regexes.push(null);
        }
    }
    var highlightMatcher = hasHighlights ? function(evt) {
        var text = evt.getText();
        var description = evt.getDescription();
        for (var x = 0; x < regexes.length; x++) {
            var regex = regexes[x];
            //if (regex != null && (regex.test(text) || regex.test (description))) {
            if (regex != null && regex.test(text)) {
                return x;
            }
        }
        return -1;
    } : null;
   
    // Set the matchers and repaint the timeline
    filterMatcherGlobal = filterMatcher;
    highlightMatcherGlobal = highlightMatcher;   
    for (var i = 0; i < bandIndices.length; i++) {
        var bandIndex = bandIndices[i];
        timeline.getBand(bandIndex).getEventPainter().setFilterMatcher(filterMatcher);
        timeline.getBand(bandIndex).getEventPainter ().setHighlightMatcher(highlightMatcher);
    }
    timeline.paint();
}



function clearAll(timeline, bandIndices, table) {
   
    // First clear the filters
    var tr = table.rows[1];
    for (var x = 0; x < tr.cells.length; x++) {
        tr.cells[x].firstChild.value = "";
    }
   
    // Then clear the highlights
    var tr = table.rows[3];
    for (var x = 0; x < tr.cells.length; x++) {
        tr.cells[x].firstChild.value = "";
    }
   
    // Then re-init the filters and repaint the timeline
    for (var i = 0; i < bandIndices.length; i++) {
        var bandIndex = bandIndices[i];
        timeline.getBand(bandIndex).getEventPainter().setFilterMatcher(null);
        timeline.getBand(bandIndex).getEventPainter().setHighlightMatcher(null);
    }
    timeline.paint();
}

```