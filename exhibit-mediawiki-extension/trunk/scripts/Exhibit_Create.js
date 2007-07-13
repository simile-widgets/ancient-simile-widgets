/**
 * A script for creating an Exhibit using the HTML Table Importer.
 */

function createExhibit() {

	var dataTable = document.getElementById(data);	
	var th, ths = dataTable.getElementsByTagName("th");
	for( col = 0; th = ths[col]; col++ ) {
		var label = columns[col];
		th.setAttribute('ex:name', label);
	}

	var viewClass = $('div.view').attr('viewClass');	
	var lens = $('div.lens').get();	
	var facets = [];

	window.database = Exhibit.Database.create();
	Exhibit.HtmlTableImporter.loadTable(dataTable, window.database); 
	window.exhibit = Exhibit.create(window.database);
	
	var exhibitDiv = document.createElement('div');
	exhibitDiv.innerHTML = "<table width='100%'><tr valign='top'><td><div id='view'></div></div></td><td width='20%' id='facets'></td></tr></table>";
	dataTable.parentNode.insertBefore(exhibitDiv, dataTable);
	
	var configurationComponents = [
		{   elmt:    document.getElementById("view"),
			role:    "view"
		}
	];
	for (index in facets) {
		if (facets[index]) {
			var degreeFacetDiv = document.createElement("div");
			document.getElementById("facets").appendChild(degreeFacetDiv);
			configurationComponents.push(
				{   elmt:        degreeFacetDiv,
					role:        "facet",
					expression:  "." + index
				});
		}
	};
	window.exhibit.configure({
		components: configurationComponents
	});
}

addOnloadHook(createExhibit);