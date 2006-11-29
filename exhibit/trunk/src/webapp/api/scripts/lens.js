/*==================================================
 *  Exhibit.Lens
 *  http://simile.mit.edu/wiki/Exhibit/API/Lens
 *==================================================
 */
 
Exhibit.Lens = function(itemID, div, exhibit, configuration) {
    var myConfig = ("Lens" in configuration) ? configuration["Lens"] : {};
    
    var lensTemplate = null;
    var lensSelector = myConfig["lensSelector"];
    if (lensSelector != null) {
        lensTemplate = lensSelector.call(null, itemID, exhibit);
    }
    if (lensTemplate == null) {
        this._constructDefaultUI(itemID, div, exhibit, myConfig);
    } else if (typeof lensTemplate == "string") {
        this._constructFromLensTemplateURL(itemID, div, exhibit, configuration, lensTemplate);
    } else {
        this._constructFromLensTemplateDOM(itemID, div, exhibit, configuration, lensTemplate);
    }
};

Exhibit.Lens._commonProperties = null;
Exhibit.Lens.prototype._constructDefaultUI = function(itemID, div, exhibit, myConfig) {
    var database = exhibit.getDatabase();
    
    var properties = null;
    if ("properties" in myConfig) {
        properties = myConfig.properties;
    } else {
        if (Exhibit.Lens._commonProperties == null) {
            Exhibit.Lens._commonProperties = database.getAllProperties();
        }
        properties = Exhibit.Lens._commonProperties;
    }
    
    var label = database.getObject(itemID, "label");
    var template = {
        elmt:       div,
        className:  "exhibit-lens",
        children: [
            {   tag:        "div",
                className:  "exhibit-lens-title",
                title:      label,
                children:   [ 
                    {   elmt:       exhibit.makeCopyButton(itemID),
                        className:  "exhibit-copyButton exhibit-lens-copyButton"
                    },
                    label + " (",
                    {   tag:        "a",
                        href:       exhibit.getItemLink(itemID),
                        target:     "_blank",
                        children:   [ Exhibit.l10n.itemLinkLabel ]
                    },
                    ")"
                ]
            },
            {   tag:        "div",
                className:  "exhibit-lens-body",
                children: [
                    {   tag:        "table",
                        className:  "exhibit-lens-properties",
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
        tr.className = "exhibit-lens-property";
        
        var tdName = tr.insertCell(0);
        tdName.className = "exhibit-lens-property-name";
        tdName.innerHTML = pair.propertyLabel + ": ";
        
        var tdValues = tr.insertCell(1);
        tdValues.className = "exhibit-lens-property-values";
        
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

Exhibit.Lens._compiledTemplates = {};
Exhibit.Lens._handlers = [
    "onblur", "onfocus", 
    "onkeydown", "onkeypress", "onkeyup", 
    "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onclick",
    "onresize", "onscroll"
];

Exhibit.Lens.prototype._constructFromLensTemplateURL = 
    function(itemID, div, exhibit, configuration, lensTemplateURL) {
    
    var job = {
        lens:           this,
        itemID:         itemID,
        div:            div,
        exhibit:        exhibit,
        configuration:  configuration
    };
    
    var compiledTemplate = Exhibit.Lens._compiledTemplates[lensTemplateURL];
    if (compiledTemplate == null) {
        Exhibit.Lens._startCompilingTemplate(lensTemplateURL, job);
    } else if (!compiledTemplate.compiled) {
        compiledTemplate.jobs.push(job);
    } else {
        job.template = compiledTemplate;
        Exhibit.Lens._performConstructFromLensTemplateJob(job);
    }
};

Exhibit.Lens.prototype._constructFromLensTemplateDOM = 
    function(itemID, div, exhibit, configuration, lensTemplateNode) {
    
    var job = {
        lens:           this,
        itemID:         itemID,
        div:            div,
        exhibit:        exhibit,
        configuration:  configuration
    };
    
    var id = lensTemplateNode.id;
    if (id == null || id.length == 0) {
        id = "exhibitlensTemplate" + Math.floor(Math.random() * 10000);
        lensTemplateNode.id = id;
    }
    
    var compiledTemplate = Exhibit.Lens._compiledTemplates[id];
    if (compiledTemplate == null) {
        compiledTemplate = {
            url:        id,
            template:   Exhibit.Lens._compileTemplate(lensTemplateNode, false),
            compiled:   true,
            jobs:       []
        };
        Exhibit.Lens._compiledTemplates[id] = compiledTemplate;
    }
    job.template = compiledTemplate;
    Exhibit.Lens._performConstructFromLensTemplateJob(job);
};

Exhibit.Lens._startCompilingTemplate = function(lensTemplateURL, job) {
    var compiledTemplate = {
        url:        lensTemplateURL,
        template:   null,
        compiled:   false,
        jobs:       [ job ]
    };
    Exhibit.Lens._compiledTemplates[lensTemplateURL] = compiledTemplate;
    
    var fError = function(statusText, status, xmlhttp) {
        SimileAjax.Debug.log("Failed to load view template from " + lensTemplateURL + "\n" + statusText);
    };
    var fDone = function(xmlhttp) {
        try {
            compiledTemplate.template = Exhibit.Lens._compileTemplate(
                xmlhttp.responseXML.documentElement, true);
            compiledTemplate.compiled = true;
            
            for (var i = 0; i < compiledTemplate.jobs.length; i++) {
                try {
                    var job = compiledTemplate.jobs[i];
                    job.template = compiledTemplate;
                    Exhibit.Lens._performConstructFromLensTemplateJob(job);
                } catch (e) {
                    SimileAjax.Debug.exception("Lens: Error constructing lens template in job queue", e);
                }
            }
            compiledTemplate.jobs = null;
        } catch (e) {
            SimileAjax.Debug.exception("Lens: Error compiling lens template and processing template job queue", e);
        }
    };
    
    SimileAjax.XmlHttp.get(lensTemplateURL, fError, fDone);

    return compiledTemplate;
};

Exhibit.Lens._compileTemplate = function(rootNode, isXML) {
    return Exhibit.Lens._processTemplateNode(rootNode, isXML);
};

Exhibit.Lens._processTemplateNode = function(node, isXML) {
    if (node.nodeType == 1) {
        return Exhibit.Lens._processTemplateElement(node, isXML);
    } else {
        return node.nodeValue;
    }
};

Exhibit.Lens._processTemplateElement = function(elmt, isXML) {
    var templateNode = {
        tag:                elmt.tagName,
        control:            null,
        condition:          null,
        content:            null,
        contentAttributes:  null,
        attributes:         [],
        styles:             [],
        handlers:           [],
        children:           null
    };
    
    var attributes = elmt.attributes;
    for (var i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];
        var name = attribute.nodeName;
        var value = attribute.nodeValue;
        
        if (value == null || typeof value != "string" || value.length == 0 || name == "contentEditable") {
            continue;
        }
        if (name.length > 3 && name.substr(0,3) == "ex:") {
            name = name.substr(3);
            if (name == "control") {
                templateNode.control = value;
            } else if (name == "content") {
                templateNode.content = Exhibit.Expression.parse(value);
            } else if (name == "if-exists") {
                templateNode.condition = {
                    test:       "exists",
                    expression: Exhibit.Expression.parse(value)
                };
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
                }
            }
        } else {
            if (name == "style") {
                Exhibit.Lens._processStyle(templateNode, value);
            } else if (name != "id") {
                if (name == "class") {
                    if (SimileAjax.Platform.browser.isIE) {
                        name = "className";
                    }
                } else if (name == "cellspacing") {
                    name = "cellSpacing";
                } else if (name == "cellpadding") {
                    name = "cellPadding";
                } else if (name == "bgcolor") {
                    name = "bgColor";
                }
                
                templateNode.attributes.push({
                    name:   name,
                    value:  value
                });
            }
        }
    }
    
    if (!isXML && SimileAjax.Platform.browser.isIE) {
        /*
         *  IE swallows style and event handler attributes of HTML elements.
         *  So our loop above will not catch them.
         */
         
        /* Need to handle this for IE
        var style = elmt.getAttribute("style");
        if (style != null && style.length > 0) {
            Exhibit.Lens._processStyle(templateNode, value);
        }
        */
        
        var handlers = Exhibit.Lens._handlers;
        for (var h = 0; h < handlers.length; h++) {
            var handler = handlers[h];
            var code = elmt[handler];
            if (code != null) {
                templateNode.handlers.push({ name: handler, code: code });
            }
        }
    }
    
    var childNode = elmt.firstChild;
    if (childNode != null) {
        templateNode.children = [];
        while (childNode != null) {
            templateNode.children.push(Exhibit.Lens._processTemplateNode(childNode, isXML));
            childNode = childNode.nextSibling;
        }
    }
    return templateNode;
};

Exhibit.Lens._processStyle = function(templateNode, styleValue) {
    var styles = styleValue.split(";");
    for (var s = 0; s < styles.length; s++) {
        var pair = styles[s].split(":");
        if (pair.length > 1) {
            var n = pair[0].trim();
            var v = pair[1].trim();
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
};

Exhibit.Lens._performConstructFromLensTemplateJob = function(job) {
    Exhibit.Lens._constructFromLensTemplateNode(
        job.itemID, "item", job.template.template, job.div, job.exhibit, job);
        
    var node = job.div.firstChild;
    var tagName = node.tagName;
    if (tagName == "span") {
        node.style.display = "inline";
    } else {
        node.style.display = "block";
    }
};

Exhibit.Lens._constructFromLensTemplateNode = function(
    value, valueType, templateNode, parentElmt, exhibit, job
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
    
    var elmt = Exhibit.Lens._constructElmtWithAttributes(value, valueType, templateNode, parentElmt, database);
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
    var handlers = templateNode.handlers;
    for (var h = 0; h < handlers.length; h++) {
        var handler = handlers[h];
        elmt[handler.name] = handler.code;
    }
    
    var children = templateNode.children;
    if (templateNode.control != null) {
        switch (templateNode.control) {
        case "copy-button":
            elmt.appendChild(exhibit.makeCopyButton(value));
            break;
        case "edit-button":
            var button = Exhibit.Lens.theme.createEditButton();
            var handler = function(elmt, evt, target) {
                Exhibit.Lens._showEditForm(job);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            }
            SimileAjax.WindowManager.registerEvent(
                button, "click", handler, SimileAjax.WindowManager.getHighestLayer());
                
            elmt.appendChild(button);
            break;
        case "item-link":
            var a = document.createElement("a");
            a.innerHTML = Exhibit.l10n.itemLinkLabel;
            a.href = exhibit.getItemLink(value);
            a.target = "_blank";
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
                    Exhibit.Lens._constructFromLensTemplateNode(
                        childValue, results.valueType, children[i], elmt, exhibit, job);
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
            Exhibit.Lens._constructDefaultValueList(results.values, results.valueType, elmt, exhibit);
        }
    } else if (children != null) {
        for (var i = 0; i < children.length; i++) {
            Exhibit.Lens._constructFromLensTemplateNode(value, valueType, children[i], elmt, exhibit, job);
        }
    }
};

Exhibit.Lens._constructElmtWithAttributes = function(value, valueType, templateNode, parentElmt, database) {
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

Exhibit.Lens._constructDefaultValueList = function(values, valueType, parentElmt, exhibit) {
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


Exhibit.Lens._showEditForm = function(job) {
    job.div.innerHTML = "";
    
    Exhibit.Lens._constructEditFromLensTemplateNode(
        job.itemID, "item", job.template.template, job.div, job.exhibit, job);
        
    var node = job.div.firstChild;
    var tagName = node.tagName;
    if (tagName == "span") {
        node.style.display = "inline";
    } else {
        node.style.display = "block";
    }
};

Exhibit.Lens._constructEditFromLensTemplateNode = function(
    value, valueType, templateNode, parentElmt, exhibit, job
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
    
    var elmt = Exhibit.Lens._constructEditElmtWithAttributes(value, valueType, templateNode, parentElmt, database);
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
    var handlers = templateNode.handlers;
    for (var h = 0; h < handlers.length; h++) {
        var handler = handlers[h];
        elmt[handler.name] = handler.code;
    }
    
    var children = templateNode.children;
    if (templateNode.control != null) {
        switch (templateNode.control) {
        case "copy-button":
            elmt.appendChild(exhibit.makeCopyButton(value));
            break;
        case "edit-button":
            var button = Exhibit.Lens.theme.createSaveButton();
            var handler = function(elmt, evt, target) {
                Exhibit.Lens._saveEdit(job);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            }
            SimileAjax.WindowManager.registerEvent(
                button, "click", handler, SimileAjax.WindowManager.getHighestLayer());
                
            elmt.appendChild(button);
            break;
        case "item-link":
            var a = document.createElement("a");
            a.innerHTML = Exhibit.l10n.itemLinkLabel;
            a.href = exhibit.getItemLink(value);
            a.target = "_blank";
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
                    Exhibit.Lens._constructEditFromLensTemplateNode(
                        childValue, results.valueType, children[i], elmt, exhibit, job);
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
            Exhibit.Lens._constructEditDefaultValueList(results.values, results.valueType, elmt, exhibit);
        }
    } else if (children != null) {
        for (var i = 0; i < children.length; i++) {
            Exhibit.Lens._constructEditFromLensTemplateNode(value, valueType, children[i], elmt, exhibit, job);
        }
    }
};

Exhibit.Lens._constructEditElmtWithAttributes = function(value, valueType, templateNode, parentElmt, database) {
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

Exhibit.Lens._constructEditDefaultValueList = function(values, valueType, parentElmt, exhibit) {
    var processOneValue = (valueType == "item") ?
        function(value) {
            addDelimiter();
            var text = document.createElement("input");
            text.type = "text";
            text.value = value;
            parentElmt.appendChild(text);
        } :
        function(value) {
            addDelimiter();
            var text = document.createElement("input");
            text.type = "text";
            text.value = value;
            parentElmt.appendChild(text);
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

