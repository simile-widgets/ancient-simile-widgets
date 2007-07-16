 /**
 * A script for creating an Exhibit using the HTML Table Importer.
 */

function createExhibit() {
	if (!disabled) {
		window.database = Exhibit.Database.create();
		window.exhibit = Exhibit.create(window.database);	
		for(var i = 0; dataSource[i]; i++) {
			var dataTable = document.getElementById(dataSource[i]);	
			var th, ths = dataTable.getElementsByTagName("th");
			var cols = columns[i].split(',');
			for(var col = 0; th = ths[col]; col++) {
				var label = cols[col];
				th.setAttribute('ex:name', label);
			}	
			console.log(hideTable[i]);
			if (hideTable[i] == "true") { // BUG: true/false is messed up
				dataTable.setAttribute("style", "display:none");
			}
			Exhibit.HtmlTableImporter.loadTable(dataTable, window.database); 
		}

		
		var dataTable0 = document.getElementById(dataSource[0]);
		var exhibitDiv = document.createElement('div');
		exhibitDiv.innerHTML = "<table width='100%'><tr valign='top'><td><div id='view'></div></div></td><td width='20%' id='facets'></td></tr></table>";
		dataTable0.parentNode.insertBefore(exhibitDiv, dataTable0);
		
		var configurationComponents = [];
		configurationComponents.push(
			{   elmt:    document.getElementById("view"),
				role:    "view"
			});
		// facets = ["name1", "name2", ... "nameN"]
		if (facets) {
			for ( var i = 0; facet = facets[i]; i++) {
				var facetDiv = document.createElement("div"); 
				document.getElementById("facets").appendChild(facetDiv);
				configurationComponents.push(
					{   elmt:		facetDiv,
						role:		"facet",
						expression: "." + facet
					});
			}
		}
		window.exhibit.configure({
			components: configurationComponents
		});
	}
}

addOnloadHook(createExhibit);