/*==================================================
 *  Rubik.ItemView
 *==================================================
 */
 
Rubik.ItemView = function(itemID, div, rubik, configuration) {
    this._constructUI(itemID, div, rubik, configuration);
};

Rubik.ItemView.prototype._constructUI = function(itemID, div, rubik, configuration) {
    div.innerHTML = "";
    
    var database = rubik.getDatabase();
    var label = database.getLiteralProperty(itemID, "label");
    
    var rdfCopyButton = SimileAjax.Graphics.createStructuredDataCopyButton(
        Rubik.urlPrefix + "images/rdf-copy-button.png", 16, 16, function() {
            return rubik.serializeItem(itemID, "rdf/xml");
        }
    );
    
    var template = {
        elmt:       div,
        className:  "rubik-item-view",
        children: [
            { elmt: rdfCopyButton },
            {   tag:        "div",
                className:  "rubik-item-view-title",
                title:      label,
                children:   [ label, { elmt: rdfCopyButton } ]
            },
            {   tag:        "div",
                className:  "rubik-item-view-body",
                children: [
                    {   tag:        "table",
                        className:  "rubik-item-view-properties",
                        field:      "propertiesTable"
                    }
                ]
            }
        ]
    };
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    
    var pairs = Rubik.ViewPanel.getPropertyValuesPairs(
        itemID, configuration.properties, database);
        
    for (var j = 0; j < pairs.length; j++) {
        var pair = pairs[j];
        
        var tr = dom.propertiesTable.insertRow(j);
        tr.className = "rubik-item-view-property";
        
        var tdName = tr.insertCell(0);
        tdName.className = "rubik-item-view-property-name";
        tdName.innerHTML = pair.propertyLabel + ": ";
        
        var tdValues = tr.insertCell(1);
        tdValues.className = "rubik-item-view-property-values";
        
        if (pair.valueType == "item") {
            for (var m = 0; m < pair.values.length; m++) {
                if (m > 0) {
                    tdValues.appendChild(document.createTextNode(", "));
                }
                tdValues.appendChild(rubik.makeItemSpan(pair.values[m]));
            }
        } else {
            for (var m = 0; m < pair.values.length; m++) {
                if (m > 0) {
                    tdValues.appendChild(document.createTextNode(", "));
                }
                tdValues.appendChild(rubik.makeValueSpan(pair.values[m], pair.valueType));
            }
        }
    }
};
