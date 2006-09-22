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
    
    var label = database.getLiteralProperty(itemID, "label");
    
    var rdfCopyButton = SimileAjax.Graphics.createStructuredDataCopyButton(
        Exhibit.urlPrefix + "images/rdf-copy-button.png", 16, 16, function() {
            return exhibit.serializeItem(itemID, "rdf/xml");
        }
    );
    
    var template = {
        elmt:       div,
        className:  "exhibit-item-view",
        children: [
            { elmt: rdfCopyButton },
            {   tag:        "div",
                className:  "exhibit-item-view-title",
                title:      label,
                children:   [ label, { elmt: rdfCopyButton } ]
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
        content:            null,
        condition:          null,
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
        
        if (name == "content") {
            templateNode.content = Exhibit.ItemView._parseTemplateExpression(value);
        } else if (name == "if-exists") {
            templateNode.condition = {
                test:       "exists",
                expression: Exhibit.ItemView._parseTemplateExpression(value)
            };
        } else if (name == "style") {
            var styles = value.split(";");
            for (var s = 0; s < styles.length; s++) {
                var pair = styles[s].split(":");
                if (pair.length > 1) {
                    templateNode.styles.push({
                        name:   Exhibit.ItemView._trimString(pair[0]),
                        value:  Exhibit.ItemView._trimString(pair[1])
                    });
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
                    expression: Exhibit.ItemView._parseTemplateExpression(value)
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

Exhibit.ItemView._parseTemplateExpression = function(s) {
    var expression = {
        root:  "value",
        path:  []
    };
    if (s.length > 0) {
        var dotBang = s.search(/[\.!]/);
        if (dotBang > 0) {
            expression.root = s.substr(0, dotBang);
        }
        
        var regex = /[\.!][^\.!]+/g;
        var result;
        while ((result = regex.exec(s)) != null) {
            var segment = result[0];
            
            var dotBang = segment.substr(0,1);
            var property = segment.substr(1);
            var isList = false;
            
            var at = property.indexOf("@");
            if (at > 0) {
                if (property.substr(at + 1) == "list") {
                    isList = true;
                }
                property = property.substr(0, at);
            }
            expression.path.push({
                property:   property,
                forward:    dotBang == ".",
                isList:     isList
            });
        }
    }
    return expression;
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
            if (Exhibit.ItemView._executeExpression(
                    value, 
                    valueType,
                    templateNode.condition.expression, 
                    database
                ).count == 0) {
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
            
            Exhibit.ItemView._executeExpression(
                value, valueType, attribute.expression, database).values.visit(function(v) { values.push(v); });
                
            elmt.setAttribute(attribute.name, values.join(";"));
        }
    }
    
    var children = templateNode.children;
    if (templateNode.content != null) {
        var results = Exhibit.ItemView._executeExpression(value, valueType, templateNode.content, database);
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
    parentElmt.appendChild(elmt);
};

Exhibit.ItemView._executeExpression = function(value, valueType, expression, database) {
    var count = 1;
    var set = new Exhibit.Set();
    set.add(eval(expression.root));
    
    for (var i = 0; i < expression.path.length; i++) {
        var segment = expression.path[i];
        if (segment.forward) {
            /* if (i == expression.path.length - 1 && segment.isList && set.size() == 1) {
                set.visit(function(value) {
                    set = database.getListProperty(value, segment.property);
                    count = set.length;
                });
            } else */ {
                set = database.getObjectsUnion(set, segment.property);
                count = set.size();
            }
            
            var property = database.getProperty(segment.property);
            valueType = property != null ? property.getValueType() : "text";
        } else {
            set = database.getSubjectsUnion(set, segment.property);
            count = set.size();
            valueType = "item";
        }
    }
    
    return {
        valueType:  valueType,
        values:     set,
        count:      count
    };
};

Exhibit.ItemView._constructElmtWithAttributes = function(value, valueType, templateNode, parentElmt, database) {
    var elmt = document.createElement(templateNode.tag);
    
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


