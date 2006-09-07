/*==================================================
 *  Rubik.ItemView
 *==================================================
 */
 
Rubik.ItemView = function(itemID, div, rubik, configuration) {
    var myConfig = ("ItemView" in configuration) ? configuration["ItemView"] : {};
    
    var viewTemplateURL = null;
    var viewSelector = myConfig["viewSelector"];
    if (viewSelector != null) {
        viewTemplateURL = viewSelector.call(null, itemID, rubik);
    }
    if (viewTemplateURL == null) {
        this._constructDefaultUI(itemID, div, rubik, myConfig);
    } else {
        this._constructFromViewTemplate(itemID, div, rubik, configuration, viewTemplateURL);
    }
};

Rubik.ItemView._commonProperties = null;
Rubik.ItemView.prototype._constructDefaultUI = function(itemID, div, rubik, myConfig) {
    var database = rubik.getDatabase();
    
    var properties = null;
    if ("properties" in myConfig) {
        properties = myConfig.properties;
    } else {
        if (Rubik.ItemView._commonProperties == null) {
            Rubik.ItemView._commonProperties = database.getAllProperties();
        }
        properties = Rubik.ItemView._commonProperties;
    }
    
    div.innerHTML = "";
    
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
        itemID, properties, database);
        
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

Rubik.ItemView._compiledTemplates = {};

Rubik.ItemView.prototype._constructFromViewTemplate = 
    function(itemID, div, rubik, configuration, viewTemplateURL) {
    
    var job = {
        itemView:       this,
        itemID:         itemID,
        div:            div,
        rubik:          rubik,
        configuration:  configuration
    };
    
    var compiledTemplate = Rubik.ItemView._compiledTemplates[viewTemplateURL];
    if (compiledTemplate == null) {
        compiledTemplate = Rubik.ItemView._startCompilingTemplate(viewTemplateURL);
        Rubik.ItemView._compiledTemplates[viewTemplateURL] = compiledTemplate;
        
        compiledTemplate.jobs.push(job);
    } else if (!compiledTemplate.compiled) {
        compiledTemplate.jobs.push(job);
    } else {
        Rubik.ItemView._performConstructFromViewTemplateJob(compiledTemplate, job);
    }
};

Rubik.ItemView._performConstructFromViewTemplateJob = function(compiledTemplate, job) {
};

Rubik.ItemView._startCompilingTemplate = function(viewTemplateURL) {
    var compiledTemplate = {
        url:        viewTemplateURL,
        template:   null,
        compiled:   false,
        jobs:       []
    };
    
    var fError = function(statusText, status, xmlhttp) {
        SimileAjax.Debug.log("Failed to load view template from " + viewTemplateURL + "\n" + statusText);
    };
    var fDone = function(xmlhttp) {
        try {
            compiledTemplate.template = Rubik.ItemView._compileTemplateXml(xmlhttp.responseXML.documentElement);
            compiledTemplate.compiled = true;
            
            for (var i = 0; i < compiledTemplate.jobs.length; i++) {
                try {
                    Rubik.ItemView._performConstructFromViewTemplateJob(
                        compiledTemplate, compiledTemplate.jobs[i]);
                } catch (e) {
                    SimileAjax.Debug.exception(e);
                }
            }
            compiledTemplate.jobs = null;
        } catch (e) {
            SimileAjax.Debug.exception(e);
        }
    };
    
    SimileAjax.XmlHttp.get(viewTemplateURL, fError, fDone);

    return compiledTemplate;
};

Rubik.ItemView._compileTemplateXml = function(xml) {
    console.log(xml);
};
