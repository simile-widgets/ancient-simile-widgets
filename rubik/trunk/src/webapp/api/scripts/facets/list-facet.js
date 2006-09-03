/*==================================================
 *  Rubik.ListFacet
 *==================================================
 */
 
Rubik.ListFacet = function(rubik, facet, div, configuration) {
    this._rubik = rubik;
    this._configuration = configuration;
    
    this._property = facet.property;
    this._forward = facet.forward;
    
    this._constructFrame(div, facet);
    this._constructBody(facet);
};

Rubik.ListFacet.prototype._constructFrame = function(div, facet) {
    var count = facet.filteredCount;
    var valuesText = count + " " + (count > 1 ? facet.pluralValueLabel : facet.valueLabel);
    var tooltip = (count > 1 ? "Focus on these " : "Focus on this ") + valuesText;
    
    var rubik = this._rubik;
    var listFacet = this;
    
    var onSlideLinkClick = function(elmt, evt, target) {
        listFacet._performSliding();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    
    var template = {
        elmt:       div,
        className:  "rubik-facet",
        children: [
            {   tag:        "div",
                className:  "rubik-facet-header",
                children: [ 
                    {   tag:        "span",
                        className:  "rubik-facet-header-title",
                        children:   [ facet.facetLabel ]
                    },
                    {   tag:        "span",
                        className:  "rubik-facet-header-details",
                        children: [
                            facet.slidable ?
                                {   elmt:  rubik.makeActionLink(valuesText, onSlideLinkClick),
                                    title: tooltip,
                                    field: "slideLink"
                                } :
                                valuesText,
                            facet.filteredCount < facet.count ? " filtered" : " total"
                        ]
                    }
                ]
            },
            {   tag:        "div",
                className:  facet.grouped ? "facet-body-long" : "rubik-facet-body",
                field:      "valuesDiv"
            }
        ]
    };
    
    if (facet.groupable) {
        var onGroupLinkClick = function(elmt, evt, target) {
            listFacet._performGrouping();
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        };
        var footerTemplate = {
            tag:        "div",
            className:  "rubik-facet-footer",
            children: [
                {   elmt:  rubik.makeActionLink("group by", onGroupLinkClick),
                    field: "groupLink"
                },
            ]
        }
        
        if (facet.grouped) {
            var onCollapseLinkClick = function(elmt, evt, target) {
                listFacet._performCollapsingGroups();
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            };
            var onExpandLinkClick = function(elmt, evt, target) {
                listFacet._performExpandingGroups();
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            };
            
            footerTemplate.children.push(" | ");
            footerTemplate.children.push({
                elmt:  rubik.makeActionLink("collapse", onCollapseLinkClick),
                field: "collapseLink"
            });
            footerTemplate.children.push(" | ");
            footerTemplate.children.push({
                elmt:  rubik.makeActionLink("expand", onExpandLinkClick),
                field: "expandLink"
            });
        }
        template.children.push(footerTemplate);
    }
    
    this._dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
};

Rubik.ListFacet.prototype._constructBody = function(facet) {
    var listFacet = this;
    var constructValue = function(value, containerDiv, level) {
        var expanded = true;
        var valueTemplate = {
            tag:        "div",
            className:  "rubik-facet-value" + (facet.filteredCount < facet.count && value.filtered ? " facet-value-filtered" : ""),
            title:      value.label,
            children: [
                {   tag:        "div",
                    className:  "rubik-facet-value-count",
                    children:   [ value.count ]
                },
                {   tag:        "input",
                    type:       "checkbox",
                    field:      "checkbox"
                }
            ]
        };
        if (value.children.length > 0) {
            valueTemplate.children.push({
                tag:        "span",
                className:  "rubik-facet-value-control",
                children: [
                    {   tag:    "img",
                        src:    expanded ? "images/minus.gif" : "images/plus.gif",
                        title:  "Expand to see values in this group",
                        field:  "expandImg"
                    }
                ]
            });
        }
        valueTemplate.children.push(value.label);
        
        var valueDom = SimileAjax.DOM.createDOMFromTemplate(document, valueTemplate);
        valueDom.value = value.value;
        valueDom.level = level;
        containerDiv.appendChild(valueDom.elmt);
        
        var onValueCheckboxClick = function(elmt, evt, target) {
            listFacet._performFiltering(valueDom);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        };
        valueDom.checkbox.checked = value.selected;
        SimileAjax.WindowManager.registerEvent(valueDom.checkbox, "click", onValueCheckboxClick);
        
        if ("expandImg" in valueDom) {
            var onExpandImgClick = function(elmt, evt, target) {
                listFacet._performTogglingGroup(valueDom);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            };
            SimileAjax.DOM.registerEvent(valueDom.expandImg, "click", onExpandImgClick);
        }
        
        if (value.children.length > 0) {
            var childrenDiv = document.createElement("div");
            childrenDiv.className = "rubik-facet-value-children";
            if (!expanded) {
                childrenDiv.style.display = "none";
            }
            constructValues(value.children, childrenDiv, level + 1);
            containerDiv.appendChild(childrenDiv);
        }
    };
    var constructValues = function(values, containerDiv, level) {
        for (var j = 0; j < values.length; j++) {
            constructValue(values[j], containerDiv, level);
        }
    };
    constructValues(facet.values, this._dom.valuesDiv, -1);
};

Rubik.ListFacet.prototype._performFiltering = function(valueDom) {
    this._rubik.getBrowseEngine().setValueRestriction(
        this._property, 
        this._forward, 
        valueDom.level, 
        valueDom.value, 
        valueDom.checkbox.checked
    );
};

Rubik.ListFacet.prototype._performSliding = function() {
    this._rubik.getBrowseEngine().slide(
        this._property, 
        this._forward
    );
};

Rubik.ListFacet.prototype._performGrouping = function(elmt) {
    var browsePanel = this;
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    
    var coords = SimileAjax.DOM.getPageCoordinates(elmt.parentNode.parentNode);
    document.getElementById("grouping-box").style.top = coords.top + "px";
    
    this._fillDialogBoxBody(property, forward);
    this._groupingProperty = property + ":" + forward;
    
    var dialogBox = document.getElementById("grouping-box");
    dialogBox.style.display = "block";
}

Rubik.ListFacet.prototype._closeDialogBox = function() {
    var dialogBox = document.getElementById("grouping-box");
    dialogBox.style.display = "none";
    
    this._groupingProperty = "";
}

Rubik.ListFacet.prototype._fillDialogBoxBody = function(property, forward) {
    var browsePanel = this;
    
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
            
            SimileAjax.DOM.registerEvent(option, "click", function(elmt) { browsePanel._performChoosingGroupingOption(elmt); return true; });
            
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
            SimileAjax.DOM.registerEvent(clearA, "click", function(elmt) { browsePanel._performClearingGrouping(elmt); return true; });
            
            headingDiv.appendChild(clearA);
        }
        
        dialogBoxBody.appendChild(groupingBoxDiv);
    }
}

Rubik.ListFacet.prototype._performChoosingGroupingOption = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    var groupingProperty = elmt.getAttribute("groupingProperty");
    var groupingForward = elmt.getAttribute("groupingForward") == "true";
    var level = parseInt(elmt.getAttribute("level"));

    this._browseEngine.group(property, forward, level, groupingProperty, groupingForward);
    this._fillDialogBoxBody(property, forward);
    this._constructFacetPane();
}

Rubik.ListFacet.prototype._performClearingGrouping = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    var level = parseInt(elmt.getAttribute("level"));
    
    this._browseEngine.ungroup(property, forward, level);
    this._fillDialogBoxBody(property, forward);
    this._constructFacetPane();
}

Rubik.ListFacet.prototype._performTogglingGroup = function(elmt) {
    var checkbox = elmt.previousSibling;
    var property = checkbox.getAttribute("property");
    var forward = checkbox.getAttribute("forward") == "true";
    var level = checkbox.getAttribute("level");
    var value = checkbox.getAttribute("value");
   
    var facetKey = property + ":" + forward;
    var facetInfo = Rubik.ListFacet._facetInfos[facetKey];
    if (facetInfo == null) {
        facetInfo = [];
        Rubik.ListFacet._facetInfos[facetKey] = facetInfo;
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

Rubik.ListFacet.prototype._performCollapsingGroups = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    
    var facetKey = property + ":" + forward;
    var facetInfo = Rubik.ListFacet._facetInfos[facetKey];
    if (facetInfo == null) {
        facetInfo = [];
        this._facetInfos[facetKey] = facetInfo;
    }
    
    var browsePanel = this;
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

Rubik.ListFacet.prototype._performExpandingGroups = function(elmt) {
    var property = elmt.getAttribute("property");
    var forward = elmt.getAttribute("forward") == "true";
    
    var facetKey = property + ":" + forward;
    var facetInfo = Rubik.ListFacet._facetInfos[facetKey];
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