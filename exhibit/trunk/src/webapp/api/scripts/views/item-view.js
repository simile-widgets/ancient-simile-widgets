/*==================================================
 *  Exhibit.ItemView
 *==================================================
 */
 
Exhibit.ItemView = function(itemID, div, exhibit, configuration) {
    var myConfig = ("ItemView" in configuration) ? configuration["ItemView"] : {};
    
    var viewTemplateURL = null;
    var viewSelector = myConfig["viewSelector"];
    if (viewSelector != null) {
        viewTemplateURL = viewSelector.call(null, itemID, exhibit);
    }
    if (viewTemplateURL == null) {
        this._constructDefaultUI(itemID, div, exhibit, myConfig);
    } else {
        this._constructFromViewTemplate(itemID, div, exhibit, configuration, viewTemplateURL);
    }
};

Exhibit.ItemView._commonProperties = null;
Exhibit.ItemView.prototype._constructDefaultUI = function(itemID, div, exhibit, myConfig) {
    var database = exhibit.getDatabase();
    
    var properties = null;
    if ("properties" in myConfig) {
        properties = myConfig.properties;
    } else {
        if (Exhibit.ItemView._commonProperties == null) {
            Exhibit.ItemView._commonProperties = database.getAllProperties();
        }
        properties = Exhibit.ItemView._commonProperties;
    }
    
    var label = database.getObject(itemID, "label");
    
    var exporters = exhibit.getExporters();
    var exportButtons = [];
    for (format in exporters) {
        var exporter = exporters[format].exporter;
        var icon = exporter.icon;
        exportButtons.push({
            elmt: SimileAjax.Graphics.createStructuredDataCopyButton(
                icon.url, icon.width, icon.height, function() {
                    return exporter.exportOne(itemID, exhibit);
                }
            )
        });
    }    
    
    var template = {
        elmt:       div,
        className:  "exhibit-item-view",
        children: [
            {   tag:        "div",
                className:  "exhibit-item-view-title",
                title:      label,
                children:   [ label ].concat(exportButtons)
            },
            {   tag:        "div",
                className:  "exhibit-item-view-body",
                children: [
                    {   tag:        "table",
                        className:  "exhibit-item-view-properties",
                        field:      "propertiesTable"
                    }
                ]
            }
        ]
    };
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    
    var pairs = Exhibit.ViewPanel.getPropertyValuesPairs(
        itemID, properties, database);
        
    for (var j = 0; j < pairs.length; j++) {
        var pair = pairs[j];
        
        var tr = dom.propertiesTable.insertRow(j);
        tr.className = "exhibit-item-view-property";
        
        var tdName = tr.insertCell(0);
        tdName.className = "exhibit-item-view-property-name";
        tdName.innerHTML = pair.propertyLabel + ": ";
        
        var tdValues = tr.insertCell(1);
        tdValues.className = "exhibit-item-view-property-values";
        
        if (pair.valueType == "item") {
            for (var m = 0; m < pair.values.length; m++) {
                if (m > 0) {
                    tdValues.appendChild(document.createTextNode(", "));
                }
                tdValues.appendChild(exhibit.makeItemSpan(pair.values[m]));
            }
        } else {
            for (var m = 0; m < pair.values.length; m++) {
                if (m > 0) {
                    tdValues.appendChild(document.createTextNode(", "));
                }
                tdValues.appendChild(exhibit.makeValueSpan(pair.values[m], pair.valueType));
            }
        }
    }
};

Exhibit.ItemView._compiledTemplates = {};

Exhibit.ItemView.prototype._constructFromViewTemplate = 
    function(itemID, div, exhibit, configuration, viewTemplateURL) {
    
    var job = {
        itemView:       this,
        itemID:         itemID,
        div:            div,
        exhibit:          exhibit,
        configuration:  configuration
    };
    
    var compiledTemplate = Exhibit.ItemView._compiledTemplates[viewTemplateURL];
    if (compiledTemplate == null) {
        Exhibit.ItemView._startCompilingTemplate(viewTemplateURL, job);
    } else if (!compiledTemplate.compiled) {
        compiledTemplate.jobs.push(job);
    } else {
        Exhibit.ItemView._performConstructFromViewTemplateJob(compiledTemplate, job);
    }
};

Exhibit.ItemView._startCompilingTemplate = function(viewTemplateURL, job) {
    var compiledTemplate = {
        url:        viewTemplateURL,
        template:   null,
        compiled:   false,
        jobs:       [ job ]
    };
    Exhibit.ItemView._compiledTemplates[viewTemplateURL] = compiledTemplate;
    
    var fError = function(statusText, status, xmlhttp) {
        SimileAjax.Debug.log("Failed to load view template from " + viewTemplateURL + "\n" + statusText);
    };
    var fDone = function(xmlhttp) {
        try {
            compiledTemplate.template = Exhibit.ItemView._compileTemplate(xmlhttp.responseXML.documentElement);
            compiledTemplate.compiled = true;
            
            for (var i = 0; i < compiledTemplate.jobs.length; i++) {
                try {
                    Exhibit.ItemView._performConstructFromViewTemplateJob(
                        compiledTemplate, compiledTemplate.jobs[i]);
                } catch (e) {
                    SimileAjax.Debug.exception("ItemView: Error constructing view template in job queue", e);
                }
            }
            compiledTemplate.jobs = null;
        } catch (e) {
            SimileAjax.Debug.exception("ItemView: Error compiling view template and processing template job queue", e);
        }
    };
    
    SimileAjax.XmlHttp.get(viewTemplateURL, fError, fDone);

    return compiledTemplate;
};

Exhibit.ItemView._compileTemplate = function(rootNode) {
    return Exhibit.ItemView._processTemplateNode(rootNode);
};

Exhibit.ItemView._processTemplateNode = function(node) {
    if (node.nodeType == 1) {
        return Exhibit.ItemView._processTemplateElement(node);
    } else {
        return node.nodeValue.replace(/\s+/g, " ");
    }
};

Exhibit.ItemView._startingSpaces = /^\s+/;
Exhibit.ItemView._endingSpaces = /\s+$/;
Exhibit.ItemView._trimString = function(s) {
    return s.replace(Exhibit.ItemView._startingSpaces, '').replace(Exhibit.ItemView._endingSpaces, '');
};

Exhibit.ItemView._processTemplateElement = function(elmt) {
    var templateNode = {
        tag:                elmt.tagName,
        control:            null,
        condition:          null,
        content:            null,
        contentAttributes:  null,
        attributes:         [],
        styles:             [],
        children:           null
    };
    
    var attributes = elmt.attributes;
    for (var i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];
        var name = attribute.nodeName;
        var value = attribute.nodeValue;
        
        if (name == "cellspacing") {
            name = "cellSpacing";
        } else if (name == "cellpadding") {
            name = "cellPadding";
        } else if (name == "bgcolor") {
            name = "bgColor";
        }
        
        if (name == "control") {
            templateNode.control = value;
        } else if (name == "content") {
            templateNode.content = Exhibit.Expression.parse(value);
        } else if (name == "if-exists") {
            templateNode.condition = {
                test:       "exists",
                expression: Exhibit.Expression.parse(value)
            };
        } else if (name == "style") {
            var styles = value.split(";");
            for (var s = 0; s < styles.length; s++) {
                var pair = styles[s].split(":");
                if (pair.length > 1) {
                    var n = Exhibit.ItemView._trimString(pair[0]);
                    var v = Exhibit.ItemView._trimString(pair[1]);
                    if (n == "float") {
                        n = SimileAjax.Platform.browser.isIE ? "styleFloat" : "cssFloat";
                    } else if (n == "-moz-opacity") {
                        n = "MozOpacity";
                    } else {
                        if (n.indexOf("-") > 0) {
                            var segments = n.split("-");
                            n = segments[0];
                            for (var x = 1; x < segments.length; x++) {
                                n += segments[x].substr(0, 1).toUpperCase() + segments[x].substr(1);
                            }
                        }
                    }
                    templateNode.styles.push({ name: n, value: v });
                }
            }
        } else {
            var x = name.indexOf("-content");
            if (x > 0) {
                if (templateNode.contentAttributes == null) {
                    templateNode.contentAttributes = [];
                }
                templateNode.contentAttributes.push({
                    name:       name.substr(0, x),
                    expression: Exhibit.Expression.parse(value)
                });
            } else {
                templateNode.attributes.push({
                    name:   name,
                    value:  value
                });
            }
        }
    }
    
    var childNode = elmt.firstChild;
    if (childNode != null) {
        templateNode.children = [];
        while (childNode != null) {
            templateNode.children.push(Exhibit.ItemView._processTemplateNode(childNode));
            childNode = childNode.nextSibling;
        }
    }
    return templateNode;
};

Exhibit.ItemView._performConstructFromViewTemplateJob = function(compiledTemplate, job) {
    Exhibit.ItemView._constructFromViewTemplateNode(
        job.itemID, "item", compiledTemplate.template, job.div, job.exhibit);
};

Exhibit.ItemView._constructFromViewTemplateNode = function(
    value, valueType, templateNode, parentElmt, exhibit
) {
    if (typeof templateNode == "string") {
        parentElmt.appendChild(document.createTextNode(templateNode));
        return;
    }
    
    var database = exhibit.getDatabase();
    if (templateNode.condition != null) {
        if (templateNode.condition.test == "exists") {
            if (!templateNode.condition.expression.testExists(
                    { "value" : value }, 
                    { "value" : valueType },
                    "value",
                    database
                )) {
                return;
            }
        }
    }
    
    var elmt = Exhibit.ItemView._constructElmtWithAttributes(value, valueType, templateNode, parentElmt, database);
    if (templateNode.contentAttributes != null) {
        var contentAttributes = templateNode.contentAttributes;
        for (var i = 0; i < contentAttributes.length; i++) {
            var attribute = contentAttributes[i];
            var values = [];
            
            attribute.expression.evaluate(
                { "value" : value }, 
                { "value" : valueType }, 
                "value",
                database
            ).values.visit(function(v) { values.push(v); });
                
            elmt.setAttribute(attribute.name, values.join(";"));
        }
    }
    
    var children = templateNode.children;
    if (templateNode.control != null) {
        switch (templateNode.control) {
        case "copy-button":
            elmt.appendChild(exhibit.makeCopyButton(value));
            break;
        case "item-link":
            var a = document.createElement("a");
            a.innerHTML = Exhibit.l10n.itemLinkLabel;
            a.href = exhibit.getItemLink(value);
            a.target = "new";
            elmt.appendChild(a);
        }
    } else if (templateNode.content != null) {
        var results = templateNode.content.evaluate(
            { "value" : value }, 
            { "value" : valueType }, 
            "value",
            database
        );
        if (children != null) {
            var processOneValue = function(childValue) {
                for (var i = 0; i < children.length; i++) {
                    Exhibit.ItemView._constructFromViewTemplateNode(
                        childValue, results.valueType, children[i], elmt, exhibit);
                }
            };
            if (results.values instanceof Array) {
                for (var i = 0; i < results.values.length; i++) {
                    processOneValue(results.values[i]);
                }
            } else {
                results.values.visit(processOneValue);
            }
        } else {
            Exhibit.ItemView._constructDefaultValueList(results.values, results.valueType, elmt, exhibit);
        }
    } else if (children != null) {
        for (var i = 0; i < children.length; i++) {
            Exhibit.ItemView._constructFromViewTemplateNode(value, valueType, children[i], elmt, exhibit);
        }
    }
};

Exhibit.ItemView._constructElmtWithAttributes = function(value, valueType, templateNode, parentElmt, database) {
    var elmt;
    switch (templateNode.tag) {
    case "tr":
        elmt = parentElmt.insertRow(parentElmt.rows.length);
        break;
    case "td":
        elmt = parentElmt.insertCell(parentElmt.cells.length);
        break;
    default:
        elmt = document.createElement(templateNode.tag);
        parentElmt.appendChild(elmt);
    }
    
    var attributes = templateNode.attributes;
    for (var i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];
        elmt.setAttribute(attribute.name, attribute.value);
    }
    var styles = templateNode.styles;
    for (var i = 0; i < styles.length; i++) {
        var style = styles[i];
        elmt.style[style.name] = style.value;
    }
    return elmt;
};

Exhibit.ItemView._constructDefaultValueList = function(values, valueType, parentElmt, exhibit) {
    var processOneValue = (valueType == "item") ?
        function(value) {
            addDelimiter();
            parentElmt.appendChild(exhibit.makeItemSpan(value));
        } :
        function(value) {
            addDelimiter();
            parentElmt.appendChild(exhibit.makeValueSpan(value, valueType));
        };
        
    if (values instanceof Array) {
        var addDelimiter = Exhibit.l10n.createListDelimiter(parentElmt, values.length);
        for (var i = 0; i < values.length; i++) {
            processOneValue(values[i]);
        }
    } else {
        var addDelimiter = Exhibit.l10n.createListDelimiter(parentElmt, values.size());
        values.visit(processOneValue);
    }
    addDelimiter();
};


