 /**
 * A script for creating an Exhibit using the HTML Table Importer.
 */

function createExhibit() {

	var dataTable = document.getElementById(data);	
	if (hideTable) {
		dataTable.setAttribute("style", "display:none");
	}
	
	var th, ths = dataTable.getElementsByTagName("th");
	for( var col = 0; th = ths[col]; col++ ) {
		var label = columns[col];
		th.setAttribute('ex:name', label);
	}

	window.database = Exhibit.Database.create();
	window.exhibit = Exhibit.create(window.database);
	Exhibit.HtmlTableImporter.loadTable(dataTable, window.database); 
	
	var exhibitDiv = document.createElement('div');
	exhibitDiv.innerHTML = "<table width='100%'><tr valign='top'><td><div id='view'></div></div></td><td width='20%' id='facets'></td></tr></table>";
	dataTable.parentNode.insertBefore(exhibitDiv, dataTable);
	
	var configurationComponents = [];
	configurationComponents.push(
		{   elmt:    document.getElementById("view"),
			role:    "view"
		});
	// facets = array of names ["name1", "name2"]
	if (facets) {
		for ( var i = 0; facet = facets[i]; i++) {
			var facetDiv = document.createElement("div"); 
			document.getElementById("facets").appendChild(facetDiv);
			configurationComponents.push(
				{   elmt:		facetDiv,
					role:		"facet",
					expression: "." + facet[i]
				});
		}
	}
	window.exhibit.configure({
		components: configurationComponents
	});
}

addOnloadHook(createExhibit);