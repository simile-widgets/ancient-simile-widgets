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
        Rubik.ItemView._startCompilingTemplate(viewTemplateURL, job);
    } else if (!compiledTemplate.compiled) {
        compiledTemplate.jobs.push(job);
    } else {
        Rubik.ItemView._performConstructFromViewTemplateJob(compiledTemplate, job);
    }
};

Rubik.ItemView._startCompilingTemplate = function(viewTemplateURL, job) {
    var compiledTemplate = {
        url:        viewTemplateURL,
        template:   null,
        compiled:   false,
        jobs:       [ job ]
    };
    Rubik.ItemView._compiledTemplates[viewTemplateURL] = compiledTemplate;
    
    var fError = function(statusText, status, xmlhttp) {
        SimileAjax.Debug.log("Failed to load view template from " + viewTemplateURL + "\n" + statusText);
    };
    var fDone = function(xmlhttp) {
        try {
            compiledTemplate.template = Rubik.ItemView._compileTemplate(xmlhttp.responseXML.documentElement);
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

Rubik.ItemView._compileTemplate = function(rootNode) {
    return Rubik.ItemView._processTemplateNode(rootNode);
};

Rubik.ItemView._processTemplateNode = function(node) {
    if (node.nodeType == 1) {
        return Rubik.ItemView._processTemplateElement(node);
    } else {
        return node.nodeValue.replace(/\s+/g, " ");
    }
};

Rubik.ItemView._startingSpaces = /^\s+/;
Rubik.ItemView._endingSpaces = /\s+$/;
Rubik.ItemView._trimString = function(s) {
    return s.replace(Rubik.ItemView._startingSpaces, '').replace(Rubik.ItemView._endingSpaces, '');
};

Rubik.ItemView._processTemplateElement = function(elmt) {
    var templateNode = {
        tag:        elmt.tagName,
        content:    null,
        condition:  null,
        attributes: [],
        styles:     [],
        children:   null
    };
    
    var attributes = elmt.attributes;
    for (var i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];
        var name = attribute.nodeName;
        var value = attribute.nodeValue;
        
        if (name == "content") {
            templateNode.content = Rubik.ItemView._parseTemplateExpression(value);
        } else if (name == "if-exists") {
            templateNode.condition = {
                test:       "exists",
                expression: Rubik.ItemView._parseTemplateExpression(value)
            };
        } else if (name == "style") {
            var styles = value.split(";");
            for (var s = 0; s < styles.length; s++) {
                var pair = styles[s].split(":");
                if (pair.length > 1) {
                    templateNode.styles.push({
                        name:   Rubik.ItemView._trimString(pair[0]),
                        value:  Rubik.ItemView._trimString(pair[1])
                    });
                }
            }
        } else {
            templateNode.attributes.push({
                name:   name,
                value:  value
            });
        }
    }
    
    var childNode = elmt.firstChild;
    if (childNode != null) {
        templateNode.children = [];
        while (childNode != null) {
            templateNode.children.push(Rubik.ItemView._processTemplateNode(childNode));
            childNode = childNode.nextSibling;
        }
    }
    return templateNode;
};

Rubik.ItemView._parseTemplateExpression = function(s) {
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

Rubik.ItemView._performConstructFromViewTemplateJob = function(compiledTemplate, job) {
    Rubik.ItemView._constructFromViewTemplateNode(
        job.itemID, "item", compiledTemplate.template, job.div, job.rubik);
};

Rubik.ItemView._constructFromViewTemplateNode = function(
    value, valueType, templateNode, parentElmt, rubik
) {
    if (typeof templateNode == "string") {
        parentElmt.appendChild(document.createTextNode(templateNode));
        return;
    }
    
    var database = rubik.getDatabase();
    if (templateNode.condition != null) {
        if (templateNode.condition.test == "exists") {
            if (Rubik.ItemView._executeExpression(
                    value, 
                    valueType,
                    templateNode.condition.expression, 
                    database
                ).count == 0) {
                return;
            }
        }
    }
    
    var elmt = Rubik.ItemView._constructElmtWithAttributes(value, valueType, templateNode, parentElmt, database);
    var children = templateNode.children;
    if (templateNode.content != null) {
        var results = Rubik.ItemView._executeExpression(value, valueType, templateNode.content, database);
        if (children != null) {
            var processOneValue = function(childValue) {
                for (var i = 0; i < children.length; i++) {
                    Rubik.ItemView._constructFromViewTemplateNode(
                        childValue, results.valueType, children[i], elmt, rubik);
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
            Rubik.ItemView._constructDefaultValueList(results.values, results.valueType, elmt, rubik);
        }
    } else if (children != null) {
        for (var i = 0; i < children.length; i++) {
            Rubik.ItemView._constructFromViewTemplateNode(value, valueType, children[i], elmt, rubik);
        }
    }
    parentElmt.appendChild(elmt);
};

Rubik.ItemView._executeExpression = function(value, valueType, expression, database) {
    var count = 1;
    var set = new Rubik.Set();
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

Rubik.ItemView._constructElmtWithAttributes = function(value, valueType, templateNode, parentElmt, database) {
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

Rubik.ItemView._constructDefaultValueList = function(values, valueType, parentElmt, rubik) {
    var database = rubik.getDatabase();
    var first = true;
    var index = 0;
    var addDelimiter = function() {
        var last = (++index == count);
        if (first) {
            first = false;
        } else if (count > 2) {
            parentElmt.appendChild(document.createTextNode(last ? ", and " : ", "));
        } else {
            parentElmt.appendChild(document.createTextNode(" and "));
        }
    };
    var processOneValue = (valueType == "item") ?
        function(value) {
            addDelimiter();
            parentElmt.appendChild(rubik.makeItemSpan(value));
        } :
        function(value) {
            addDelimiter();
            parentElmt.appendChild(rubik.makeValueSpan(value, valueType));
        };
        
    if (values instanceof Array) {
        var count = values.length;
        for (var i = 0; i < values.length; i++) {
            processOneValue(values[i]);
        }
    } else {
        var count = values.size();
        values.visit(processOneValue);
    }
};


