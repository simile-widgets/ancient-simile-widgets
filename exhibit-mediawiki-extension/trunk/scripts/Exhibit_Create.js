 /**
 * A script for creating an Exhibit using the HTML Table Importer.
 */

function createExhibit() {
	/*
	 * Data: We're using the HTML table importer to get the data for the exhibit.
	 */
	window.database = Exhibit.Database.create();
	window.exhibit = Exhibit.create(window.database);			
	for(var i = 0; i < sourceData.length; i++) {
		var dataTable = document.getElementById(sourceData[i]);	
		var th, ths = dataTable.getElementsByTagName("th");
		var columns = sourceColumns[i].split(',');	
		if (columns[0] !== "") {                   //TODO: make more thorough test--look for label
			for(var c = 0; c < ths.length; c++) {
				var label = columns[c];
				ths[c].setAttribute('ex:name', label);
			}	
		} else {
			ths[0].setAttribute('ex:name', 'label');
			for (var c = 1; c < ths.length; c++) {
				var label = ths[c].textContent.toLowerCase();
				label = label.replace(/\s/g,'');
				ths[c].setAttribute('ex:name', label);
			}
		}
		if (sourceHideTable[i] == "false") { // BUG: hideTable[i] is a string, not a boolean
		} else { dataTable.setAttribute("style", "display:none");}
		Exhibit.HtmlTableImporter.loadTable(dataTable, window.database); 
	}

	var exhibitDiv = document.getElementById('exhibitLocation');
	exhibitDiv.innerHTML = "<table width='100%'><tr valign='top'><td><div id='view'></div></td><td width='20%' id='facets'></td></tr></table>";		

	/*
	 * Configuration: We're creating HTML strings that specify the configurations, 
	 * formatted in the same form as specifications in the HTML of a regular exhibit.
	 */
	if (facets && (facets[0] !== "")) {
		var leftFacets = [];
		var rightFacets = [];
		var topFacets = [];
		var bottomFacets = [];
		var facetHTML = "";
		for (var i = 0; i < facets.length; i++) {
			var attrs = facets[i].split(';');
			var attrHTML = "";
			for (var j = 0; j < attrs.length; j++) {
				attrHTML = attrHTML + ' ex:' + attrs[j];
			}
			
			var facetDiv = document.createElement('div');
			facetDiv.innerHTML = '<div ex:role="facet" ' + attrHTML + ' ></div>';
			
			var facetPosition = 'right';			
			if (facetDiv.lastChild.getAttribute('ex:position')) { facetPosition = facetDiv.lastChild.getAttribute('ex:position'); }			
			if (facetPosition == 'left') { leftFacets.push(facetDiv.lastChild); }
			if (facetPosition == 'right') { rightFacets.push(facetDiv.lastChild); }
			if (facetPosition == 'top') { topFacets.push(facetDiv); }
			if (facetPosition == 'bottom') { bottomFacets.push(facetDiv); }
		}
		for (var i = 0; i < topFacets.length; i++) {
			document.getElementById('top-facets').appendChild(topFacets[i]);
			topFacets[i].lastChild.setAttribute('style', 'padding: 2px; float: left; width: 15em');
		}
		for (var i = 0; i < bottomFacets.length; i++) {
			document.getElementById('bottom-facets').appendChild(bottomFacets[i]);
			bottomFacets[i].lastChild.setAttribute('style', 'padding: 2px; float: left; width: 15em');
		}
		for (var i = 0; i < leftFacets.length; i++) { 
			var leftFacetTd = document.getElementById('left-facets');
			leftFacetTd.setAttribute('width', '20%');
			leftFacetTd.appendChild(leftFacets[i]);
		}	
		for (var i = 0; i < rightFacets.length; i++) { 
			var rightFacetTd = document.getElementById('right-facets');
			rightFacetTd.setAttribute('width', '20%');
			rightFacetTd.appendChild(rightFacets[i]);
		}
	}
	
	if (views && (views[0] !== "")) {
		var viewHTML = "";
		for (var i = 0; i < views.length; i++) {
			var attrs = views[i].split(';');
			var attrHTML = "";
			for (var j = 0; j < attrs.length; j++) {
				attrHTML = attrHTML + ' ex:' + attrs[j];
			}
			viewHTML = viewHTML + '<div ex:role="view" ' + attrHTML + ' ></div>';
		}
		var returnHTML = '<div id="exhibit-view-panel" ex:role="viewPanel">' + viewHTML + '</div>';
		document.getElementById("view").innerHTML = returnHTML;
	} else {
		document.getElementById("view").innerHTML = '<div ex:role="view"></div>';
	}
	
	window.exhibit.configureFromDOM();
}

addOnloadHook(createExhibit);