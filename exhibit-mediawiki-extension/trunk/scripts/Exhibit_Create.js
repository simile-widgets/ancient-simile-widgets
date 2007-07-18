 /**
 * A script for creating an Exhibit using the HTML Table Importer.
 */

function createExhibit() {
	/*
	 * <data>
	 * We're using the HTML table importer to get the data for the exhibit.
	 */
	window.database = Exhibit.Database.create();
	window.exhibit = Exhibit.create(window.database);			
	for(var i = 0; sourceData[i]; i++) {
		var dataTable = document.getElementById(sourceData[i]);	
		var th, ths = dataTable.getElementsByTagName("th");
		var columns = sourceColumns[i].split(',');
		for(var c = 0; th = ths[c]; c++) {
			var label = columns[c];
			th.setAttribute('ex:name', label);
		}
		if (sourceHideTable[i] == "false") { // BUG: hideTable[i] is a string, not a boolean
		} else { dataTable.setAttribute("style", "display:none");}
		Exhibit.HtmlTableImporter.loadTable(dataTable, window.database); 
	}

	var topTable = document.getElementById(sourceData[0]);
	var exhibitDiv = document.createElement('div');
	exhibitDiv.innerHTML = "<table width='100%'><tr valign='top'><td><div id='view'></div></div></td><td width='20%' id='facets'></td></tr></table>";
	topTable.parentNode.insertBefore(exhibitDiv, topTable);		

	/*
	 * <configuration>
	 * We're creating HTML strings that specify the configurations, formatted in the 
	 * same form as specifications in the HTML of a regular exhibit.
	 */

	if (facets) {
		var facetHTML = "";
		for (var i = 0; facet = facets[i]; i++) {
			var attrs = facet.split(';');
			var attrHTML = "";
			for (var j = 0; j < attrs.length; j++) {
				attrHTML = attrHTML + ' ex:' + attrs[j];
			}
			facetHTML = facetHTML + '<div ex:role="facet" ' + attrHTML + ' ></div>';
		}
		//console.log(facetHTML);
		document.getElementById("facets").innerHTML = facetHTML;
	}
	
	console.log(views);
	if (views) {
		var viewHTML = "";
		for (var i = 0; view = views[i]; i++) {
			var attrs = view.split(';');
			var attrHTML = "";
			for (var j = 0; j < attrs.length; j++) {
				attrHTML = attrHTML + ' ex:' + attrs[j];
			}
			viewHTML = viewHTML + '<div ex:role="view" ' + attrHTML + ' ></div>';
		}
		console.log(viewHTML);
		document.getElementById("view").innerHTML = viewHTML;
	}
	
	window.exhibit.configureFromDOM();
}

addOnloadHook(createExhibit);