# This stuff might be out of date... proceed as appropriate #

## Getting the information out of SharePoint ##

Get an XML representation of the list with: "/_vti\_bin/owssvr.dll"_

[link to a public demo site that has list](http://sharepoint.great-webs.net/mrk/_vti_bin/owssvr.dll?XMLDATA=1&List={285B963A-1233-45CA-8AD1-E91539ECD3AA}&View={715480BB-D550-4D3B-8350-1D7ECEAFD62E}&RowLimit=0&RootFolder=)

To find the path use "Export to spreadsheet" action in the List View, and extract the path to XML info.

Once we look at the XML we can see we only need the info from "

&lt;z:row&gt;

" tags.

## Parsing the row of information ##

XSLT can be used, but author choose JavaScript and **`date.js'** http://www.datejs.com/
to parse the date to a standard one.

## The Code ##

[questions? email me](mailto:israel.fruchter@gmail.com)

```
class="javascript" style="border: 1px solid #b4d0dc; background-color: #ecf8ff;">

<html>
  <head>
    <script src="http://simile.mit.edu/timeline/api/timeline-api.js" type="text/javascript"></script>
    <script  src="date.js" type="text/javascript"></script>
	<script>
var tl;
var eventSource = new Timeline.DefaultEventSource();

function openXMLfile(url)
{
	if (document.implementation && document.implementation.createDocument)
	{
		xmlDoc = document.implementation.createDocument("", "", null);
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			} catch (e) {
			alert("Permission UniversalBrowserRead denied.");
			}
		xmlDoc.async=false;
		xmlDoc.load(url);
		return(xmlDoc);
	}
	else if (window.ActiveXObject)
	{
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async="false";
		xmlDoc.load(url);
		return(xmlDoc);
 	}
	else
	{
		alert('Your browser can\'t handle this script');
		return;
	}
	
}

function takeEventOut(url)
{
	var rows;
	xmlDoc = openXMLfile(url);
	
	if (document.implementation && document.implementation.createDocument)
	{
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			} catch (e) {
			alert("Permission UniversalBrowserRead denied.");
			}
		var rows = xmlDoc.getElementsByTagName("row");
	}
	else if (window.ActiveXObject)
	{
		rows = xmlDoc.getElementsByTagName("z:row");
	}
	else
	{
		alert('Your browser can\'t handle this script');
		return;
	}
	
	for (j=0;j<rows.length;j++)
	{
		// taking the event info from the xml
		var dateEvent = Date.parseExact
			(rows.item(j).getAttribute('ows_DueDate'), "yyyy-M-dd hh:mm:ss");
		// adding 2 week so it will look good
		var endEvent = new Date(dateEvent);
		endEvent.addWeeks(2);
		var title = rows.item(j).getAttribute('ows_LinkTitle');
		var status = rows.item(j).getAttribute('ows_Status');
		var priority = rows.item(j).getAttribute('ows_Priority');
		var icon;
		switch (priority)
		{
			case "Low":
				icon = "http://www.brandspankingnew.net/img/feed-icon-12x12.gif";
				break;
			case "High":
				icon = "http://www.brandspankingnew.net/img/feed-icon-12x12.gif";
				break;
			case "Normal":
				icon = "http://www.brandspankingnew.net/img/feed-icon-12x12.gif";
				break;
			default:
				icon = "http://www.brandspankingnew.net/img/feed-icon-12x12.gif";
				break;
		}
		// chossing color for the event
		var color;
		switch (status)
		{
			case "In Progress":
				color = "green";
				break
			case "Not Started":
				color = "red";
				break
			default:
				color = "blue";
				break
		}
		/*id, start, end, 
		latestStart, earliestEnd, instant,  
		text, description, image, link,  icon, color, textColor */
		var evt = new Timeline.DefaultEventSource.Event( 
         		dateEvent , //start
         		endEvent, //end
         		0 ,
         		0 ,
         		true, //instant
         		title, //text
				status +" <b>" + priority + "</b>", 
				icon,0 ,icon ,color  //description
      			);
		// adding it to the source
		 eventSource.add(evt);

	}	

	
}

function onLoad()
{
        /* this will cause an error, cause it need to be in one line */
	takeEventOut("http://sharepoint.great-webs.net/mrk/_vti_bin/owssvr.dll?
	XMLDATA=1&List={285B963A-1233-45CA-8AD1-E91539ECD3AA}
	&View={715480BB-D550-4D3B-8350-1D7ECEAFD62E}&RowLimit=0&RootFolder=");
	//create the timeline
  	var bandInfos = [
    	Timeline.createBandInfo({
        	trackGap:       0.2,
        	width:          "70%",
		date:		"7 Jul 2005",
        	intervalUnit:   Timeline.DateTime.DAY, 
        	intervalPixels: 50,
        	eventSource: eventSource
    		}),
    	Timeline.createBandInfo({
        	showEventText:  false,
        	trackHeight:    0.5,
        	trackGap:       0.2,
        	width:          "30%",
		date:		"7 Jul 2005",			
        	intervalUnit:   Timeline.DateTime.MONTH, 
        	intervalPixels: 150,
        	eventSource: eventSource
    		})
  	];
  	bandInfos[1].syncWith = 0;
  	bandInfos[1].highlight = true;
  	tl = Timeline.create(document.getElementById("my-timeline"), bandInfos); 
}

var resizeTimerID = null;
function onResize() {
    if (resizeTimerID == null) {
        resizeTimerID = window.setTimeout(function() {
            resizeTimerID = null;
            tl.layout();
        }, 500);
    }
}

    </script>
  </head>
  <body onload="onLoad();" onresize="onResize();">
     <div id="my-timeline" style="height: 500px; border: 1px solid #aaa"></div>
  </body>
</html>

```