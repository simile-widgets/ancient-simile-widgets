/*==================================================
 *  Rubik.BrowsePanel
 *==================================================
 */
 
Rubik.BrowsePanel = function(rubik, browseDiv, configuration) {
    this._rubik = rubik;
    this._database = rubik.getDatabase();
    this._browseEngine = rubik.getBrowseEngine();
    this._browseDiv = browseDiv;
    
    this._showProperties = [];
    if (configuration != null) {
        if ("properties" in configuration) {
            var entries = configuration.properties;
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var sp;
                if (typeof entry == "string") {
                    sp = {
                        property: entry,
                        forward:  true
                    };
                } else {
                    sp = {
                        property: entry.property,
                        forward:  ("forward" in entry) ? (entry.forward) : true
                    }
                }
                this._showProperties.push(sp);
            }
        }
        if ("sliding" in configuration && configuration.sliding) {
            this._supportSliding = true;
        }
    }
    
    this._facetInfos = [];
    this._groupingProperty = "";
    
    var browsePanel = this;
    var reconstruct = function() { browsePanel._reconstruct(); };
    this._browseEngine.addListener({
        onRootCollectionSet: reconstruct,
        onRestrict: reconstruct
    });
    
    //this._reconstruct();
}

Rubik.BrowsePanel.prototype._reconstruct = function(scrollInfo) {
    var facetPaneBody = this._browseDiv;
    facetPaneBody.innerHTML = "";
    
    var browser = this;
    var facets = this._browseEngine.getFacets();
    for (var i = 0; i < facets.length; i++) {
        var facet = facets[i];
        /* if (facet.count > 1 || (facet.count == 1 && facet.values[0].count < this._itemCount)) */ 
        if (facet.count > 0) {
            var property = facet.property;
            var forward = facet.forward;
            
            var facetKey = property + ":" + forward;
            var facetInfo = this._facetInfos[facetKey];
            if (facetInfo == null) {
                facetInfo = [];
                this._facetInfos[facetKey] = facetInfo;
            }
            
            var count = facet.filteredCount;
            var valuesText = count + " " + (count > 1 ? facet.pluralValueLabel : facet.valueLabel);
            
            var template = {
                tag: "div",
                className: "facet-box",
                children: [
                    {   tag: "div",
                        className: "facet-title",
                        children: [ 
                            facet.label + ": ",
                            {   tag: "span",
                                className: "facet-count",
                                children: facet.slidable ?
                                    [   {   tag:        "a",
                                            href:       "javascript:",
                                            title:      (count > 1 ? "Focus on these " : "Focus on this ") + valuesText,
                                            field:      "slideLink"
                                        },
                                        facet.filteredCount < facet.count ? " filtered" : " total"
                                    ] :
                                    [   valuesText + (facet.filteredCount < facet.count ? " filtered" : " total")
                                    ]
                            }
                        ]
                    },
                    {   tag: "div",
                        className: facet.grouped ? "facet-body-long" : "facet-body",
                        field: "valuesDiv"
                    }
                ]
            };
            if (facet.groupable) {
                var footerTemplate = {
                    tag: "div",
                    className: "facet-footer",
                    children: [
                        {   tag:        "a",
                            href:       "javascript:",
                            children:   [ "group by" ],
                            field:      "groupLink"
                        }
                    ]
                }
                
                if (facet.grouped) {
                    footerTemplate.children.push(" | ");
                    footerTemplate.children.push({
                        tag:        "a",
                        href:       "javascript:",
                        children:   "collapse",
                        field:      "collapseLink"
                    });
                    footerTemplate.children.push(" | ");
                    footerTemplate.children.push({
                        tag:        "a",
                        href:       "javascript:",
                        children:   "expand",
                        field:      "expandLink"
                    });
                }
                
                template.children.push(footerTemplate);
            }
            
            var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
            dom.property = property;
            dom.forward = forward;
            if ("slideLink" in dom) {
                dom.onSlideLinkClick = function(elmt, evt, target) {
                    browser._performSliding(dom.elmt, this.property, this.forward);
                    
                    SimileAjax.DOM.cancelEvent(evt);
                    return false;
                };
                SimileAjax.DOM.registerEventWithObject(dom.slideLink, "click", dom, dom.onSlideLinkClick);
            }
            if ("groupLink" in dom) {
                dom.onGroupLinkClick = function(elmt, evt, target) {
                    browser._performGrouping(dom.elmt, this.property, this.forward);
                    
                    SimileAjax.DOM.cancelEvent(evt);
                    return false;
                };
                SimileAjax.DOM.registerEventWithObject(dom.groupLink, "click", dom, dom.onGroupLinkClick);
            }
            if ("collapseLink" in dom) {
                dom.onCollapseLinkClick = function(elmt, evt, target) {
                    browser._performCollapsingGroups(dom.elmt, this.property, this.forward);
                    
                    SimileAjax.DOM.cancelEvent(evt);
                    return false;
                };
                SimileAjax.DOM.registerEventWithObject(dom.collapseLink, "click", dom, dom.onCollapseLinkClick);
            }
            if ("expandLink" in dom) {
                dom.onExpandLinkClick = function(elmt, evt, target) {
                    browser._performExpandingGroups(dom.elmt, this.property, this.forward);
                    
                    SimileAjax.DOM.cancelEvent(evt);
                    return false;
                };
                SimileAjax.DOM.registerEventWithObject(dom.expandLink, "click", dom, dom.onExpandLinkClick);
            }
            
            /*
             *  Facet body
             */
            var f = function(values, containerDiv, level) {
                for (var j = 0; j < values.length; j++) {
                    var value = values[j];
                    
                    var expanded;
                    var valueKey = value.value + ":" + value.level;
                    if (Rubik.BrowsePanel._groupingProperty == facetKey) {
                        expanded = (level == 0);
                        facetInfo[valueKey] = expanded;
                    } else {
                        expanded = ((valueKey in facetInfo) && facetInfo[valueKey]);
                    }
                    
                    var valueTemplate = {
                        tag: "div",
                        className: "facet-value" + (facet.filteredCount < facet.count && value.filtered ? " facet-value-filtered" : ""),
                        title: value.label,
                        children: [
                            {   tag: "div",
                                className: SimileAjax.Platform.browser.isIE ? "facet-value-count-ie" : "facet-value-count-ff",
                                children: [ value.count ]
                            },
                            {   tag: "input",
                                type: "checkbox",
                                field: "checkbox"
                            }
                        ]
                    };
                    if (value.children.length > 0) {
                        valueTemplate.children.push({
                            tag: "span",
                            className: "facet-value-control",
                            children: [
                                {   tag: "img",
                                    src: expanded ? "images/minus.gif" : "images/plus.gif",
                                    title: "Expand to see values in this group",
                                    field: "expandImg"
                                }
                            ]
                        });
                    }
                    valueTemplate.children.push(value.label);
                    
                    var valueDom = SimileAjax.DOM.createDOMFromTemplate(document, valueTemplate);
                    valueDom.property = property;
                    valueDom.forward = forward;
                    valueDom.level = value.level;
                    valueDom.value = value.value;
                    valueDom.checkbox.checked = value.selected;
                    
                    valueDom.onCheckboxClick = function(elmt, evt, target) {
                        browser._performFiltering(dom.valuesDiv, elmt, this.property, this.forward, this.level, this.value);
                        
                        SimileAjax.DOM.cancelEvent(evt);
                        return false;
                    };
                    SimileAjax.DOM.registerEventWithObject(valueDom.checkbox, "click", valueDom, valueDom.onCheckboxClick);
                    
                    if ("expandImg" in valueDom) {
                        valueDom.onExpandImgClick = function(elmt, evt, target) {
                            browser._performTogglingGroup(elmt);
                            
                            SimileAjax.DOM.cancelEvent(evt);
                            return false;
                        };
                        SimileAjax.DOM.registerEventWithObject(valueDom.expandImg, "click", valueDom, valueDom.onExpandImgClick);
                    }
                    
                    containerDiv.appendChild(valueDom.elmt);
                    if (value.children.length > 0) {
                        var childrenDiv = document.createElement("div");
                        childrenDiv.className = "facet-value-children";
                        if (!expanded) {
                            childrenDiv.style.display = "none";
                        }
                        
                        arguments.callee(value.children, childrenDiv, level+1);
                        
                        containerDiv.appendChild(childrenDiv);
                    }
                }
            }
            f(facet.values, dom.valuesDiv, 0);
            
            facetPaneBody.appendChild(dom.elmt);
            if (scrollInfo) {
                if (property == scrollInfo.property && forward == scrollInfo.forward) {
                    dom.valuesDiv.scrollTop = scrollInfo.scrollTop;
                }
            }
        }
    }
};

Rubik.BrowsePanel.prototype._performFiltering = function(valuesDiv, checkbox, property, forward, level, value) {
    var scrollTop = valuesDiv.scrollTop;
    
    this._browseEngine.setValueRestriction(property, forward, level, value, checkbox.checked);
    
    this._reconstruct({
        property:   property,
        forward:    forward,
        scrollTop:  scrollTop
    });
};

Rubik.BrowsePanel.prototype._performSliding = function(div) {
    var browser = this;
    performLongTask(function() {
        var property = div.getAttribute("property");
        var forward = div.getAttribute("forward") == "true";
        browser._browseEngine.slide(property, forward);
        
        browser._facetInfos = [];
        browser._reconstruct();

        advanceHistory();
    }, "please wait...");
};

Rubik.BrowsePanel.prototype.setLocation = function(newLocation) {
    var browser = this;
    performLongTask(function() {
        browser._browseEngine.focus(newLocation);
        browser._facetInfos = [];
        browser._reconstruct();
    }, "please wait...");
};

Rubik.BrowsePanel.prototype.reset = function() {
    var browser = this;
    performLongTask(function() {
        browser._browseEngine.truncate(1);
        browser._browseEngine.clearAllCurrentFilters();
        browser._facetInfos = [];
        browser._reconstruct();
        
        setHistoryPosition(browser._focusIndex);
    }, "please wait...");
};

Rubik.BrowsePanel.prototype._performClearingFilters = function() {
    var browser = this;
    performLongTask(function() {
        browser._browseEngine.clearAllCurrentFilters();
        browser._reconstruct();
    }, "please wait...");
}

Rubik.BrowsePanel.prototype._performGrouping = function(elmt) {
    var browser = this;
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    
    var coords = SimileAjax.DOM.getPageCoordinates(elmt.parentNode.parentNode);
    document.getElementById("grouping-box").style.top = coords.top + "px";
    
    this._fillDialogBoxBody(property, forward);
    this._groupingProperty = property + ":" + forward;
    
    var dialogBox = document.getElementById("grouping-box");
    dialogBox.style.display = "block";
}

Rubik.BrowsePanel.prototype._closeDialogBox = function() {
    var dialogBox = document.getElementById("grouping-box");
    dialogBox.style.display = "none";
    
    this._groupingProperty = "";
}

Rubik.BrowsePanel.prototype._fillDialogBoxBody = function(property, forward) {
    var browser = this;
    
    var dialogBoxBody = document.getElementById("grouping-box-body");
    dialogBoxBody.innerHTML = "";
    
    var groups = this._browseEngine.getGroups(property, forward);
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var groupingOptions = group.groupingOptions;
        
        var groupingBoxDiv = document.createElement("div");
        groupingBoxDiv.className = "grouping-box";
        
        var headingDiv = document.createElement("div");
        headingDiv.className = "grouping-heading";
        headingDiv.appendChild(document.createTextNode(i == 0 ? "Group by " : "Group the groups by "));
        
        groupingBoxDiv.appendChild(headingDiv);
        
        var hasSelection = false;
        for (var j = 0; j < groupingOptions.length; j++) {
            var groupingOption = groupingOptions[j];
            
            var groupingOptionDiv = document.createElement("div");
            groupingOptionDiv.className = "grouping-option";
            
            var option = document.createElement("input");
            option.type = "radio";
            option.name = "level" + i;
            option.checked = groupingOption.selected;
            option.defaultChecked = groupingOption.selected;
            
            option.setAttribute("property", property);
            option.setAttribute("forward", forward ? "true" : "false");
            option.setAttribute("groupingProperty", groupingOption.property);
            option.setAttribute("groupingForward", groupingOption.forward ? "true" : "false");
            option.setAttribute("level", i);
            
            SimileAjax.DOM.registerEvent(option, "click", function(elmt) { browser._performChoosingGroupingOption(elmt); return true; });
            
            groupingOptionDiv.appendChild(option);
            
            if (groupingOption.selected) {
                hasSelection = true;
            }
            
            groupingOptionDiv.appendChild(document.createTextNode(groupingOption.label));
            
            groupingBoxDiv.appendChild(groupingOptionDiv);
        }
        
        if (hasSelection) {
            var clearA = document.createElement("a");
            clearA.setAttribute("property", property);
            clearA.setAttribute("forward", forward ? "true" : "false");
            clearA.setAttribute("level", i);
            clearA.href = "javascript:void";
            clearA.innerHTML = "(ungroup)";
            SimileAjax.DOM.registerEvent(clearA, "click", function(elmt) { browser._performClearingGrouping(elmt); return true; });
            
            headingDiv.appendChild(clearA);
        }
        
        dialogBoxBody.appendChild(groupingBoxDiv);
    }
}

Rubik.BrowsePanel.prototype._performChoosingGroupingOption = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    var groupingProperty = elmt.getAttribute("groupingProperty");
    var groupingForward = elmt.getAttribute("groupingForward") == "true";
    var level = parseInt(elmt.getAttribute("level"));

    this._browseEngine.group(property, forward, level, groupingProperty, groupingForward);
    this._fillDialogBoxBody(property, forward);
    this._reconstructFacetPane();
}

Rubik.BrowsePanel.prototype._performClearingGrouping = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    var level = parseInt(elmt.getAttribute("level"));
    
    this._browseEngine.ungroup(property, forward, level);
    this._fillDialogBoxBody(property, forward);
    this._reconstructFacetPane();
}

Rubik.BrowsePanel.prototype._performTogglingGroup = function(elmt) {
    var checkbox = elmt.previousSibling;
    var property = checkbox.getAttribute("property");
    var forward = checkbox.getAttribute("forward") == "true";
    var level = checkbox.getAttribute("level");
    var value = checkbox.getAttribute("value");
   
    var facetKey = property + ":" + forward;
    var facetInfo = Rubik.BrowsePanel._facetInfos[facetKey];
    if (facetInfo == null) {
        facetInfo = [];
        Rubik.BrowsePanel._facetInfos[facetKey] = facetInfo;
    }
    var valueKey = value + ":" + level;
            
    var childrenDiv = elmt.parentNode.nextSibling;
    if (childrenDiv.style.display == "none") {
        elmt.firstChild.src = "images/minus.gif";
        childrenDiv.style.display = "block";
        facetInfo[valueKey] = true;
    } else {
        elmt.firstChild.src = "images/plus.gif";
        childrenDiv.style.display = "none";
        facetInfo[valueKey] = false;
    }
}

Rubik.BrowsePanel.prototype._performCollapsingGroups = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    
    var facetKey = property + ":" + forward;
    var facetInfo = Rubik.BrowsePanel._facetInfos[facetKey];
    if (facetInfo == null) {
        facetInfo = [];
        this._facetInfos[facetKey] = facetInfo;
    }
    
    var browser = this;
    var f = function(div) {
        for (var i = 0; i < div.childNodes.length; i++) {
            var elmt = div.childNodes[i];
            if (elmt.className == "facet-value-children") {
                arguments.callee(elmt);
            } else {
                var controlSpan = elmt.childNodes[2];
                if (controlSpan.className == "facet-value-control") {
                    var checkbox = controlSpan.previousSibling;
                    var level = checkbox.getAttribute("level");
                    var value = checkbox.getAttribute("value");
                    var valueKey = value + ":" + level;
                    
                    elmt.nextSibling.style.display = "none";
                    controlSpan.firstChild.src = "images/plus.gif";
                    
                    facetInfo[valueKey] = false;
                }
            }
        }
    }
    
    var valuesDiv = elmt.parentNode.previousSibling;
    f(valuesDiv);
}

Rubik.BrowsePanel.prototype._performExpandingGroups = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    
    var facetKey = property + ":" + forward;
    var facetInfo = Rubik.BrowsePanel._facetInfos[facetKey];
    if (facetInfo == null) {
        facetInfo = [];
        this._facetInfos[facetKey] = facetInfo;
    }
    
    var f = function(div) {
        for (var i = 0; i < div.childNodes.length; i++) {
            var elmt = div.childNodes[i];
            if (elmt.className == "facet-value-children") {
                arguments.callee(elmt);
            } else {
                var controlSpan = elmt.childNodes[2];
                if (controlSpan.className == "facet-value-control") {
                    var checkbox = controlSpan.previousSibling;
                    var level = checkbox.getAttribute("level");
                    var value = checkbox.getAttribute("value");
                    var valueKey = value + ":" + level;
                    
                    elmt.nextSibling.style.display = "block";
                    controlSpan.firstChild.src = "images/minus.gif";
                    
                    facetInfo[valueKey] = true;
                }
            }
        }
    }
    
    var valuesDiv = elmt.parentNode.previousSibling;
    f(valuesDiv);
}