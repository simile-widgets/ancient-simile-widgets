 /**
 * A script for creating an Exhibit using the HTML Table Importer.
 */

function createExhibit() {
	if (!disabled) {
		// loading data and creating exhibit
		window.database = Exhibit.Database.create();
		window.exhibit = Exhibit.create(window.database);			
		for(var i = 0; sourceData[i]; i++) {
			var dataTable = document.getElementById(sourceData[i]);	
			var th, ths = dataTable.getElementsByTagName("th");
			var columns = sourceColumns[i].split(',');
			for(var c = 0; th = ths[c]; c++) {
				var label = columns[c];
				console.log(label);
				th.setAttribute('ex:name', label);
			}
			if (sourceHideTable[i] == "false") { // BUG: hideTable[i] is a string, not a boolean
			} else { dataTable.setAttribute("style", "display:none");}
			Exhibit.HtmlTableImporter.loadTable(dataTable, window.database); 
		}

		// configuring exhibit
		var topTable = document.getElementById(sourceData[0]);
		var exhibitDiv = document.createElement('div');
		exhibitDiv.innerHTML = "<table width='100%'><tr valign='top'><td><div id='view'></div></div></td><td width='20%' id='facets'></td></tr></table>";
		topTable.parentNode.insertBefore(exhibitDiv, topTable);		
		var configurationComponents = [];
		configurationComponents.push(
			{   elmt:    document.getElementById("view"),
				role:    "view",
				viewClass: Exhibit.TileView
				/*columns: [
					{	expression: ".degree",
						uiContext:  Exhibit.UIContext.create({}, view._uiContext, true),
						styler:     null,
						label:      "Degree",
						format:     "list"
					}
				]*/
			});
		if (facetExpressions) {
			for ( var i = 0; expression = facetExpressions[i]; i++) {
				var facetDiv = document.createElement("div"); 
				document.getElementById("facets").appendChild(facetDiv);
				configurationComponents.push(
					{   elmt:		facetDiv,
						role:		"facet",
						expression: "." + expression
					});
			}
		}
		window.exhibit.configure({
			components: configurationComponents
		});
	}
}

addOnloadHook(createExhibit);