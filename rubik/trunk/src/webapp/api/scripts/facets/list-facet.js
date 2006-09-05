/*==================================================
 *  Rubik.ListFacet
 *==================================================
 */
 
Rubik.ListFacet = function(rubik, facet, div, configuration) {
    this._rubik = rubik;
    this._configuration = configuration;
    
    this._property = facet.property;
    this._forward = facet.forward;
    this._facetLabel = facet.facetLabel;
    
    this._dom = null;
    this._groupingDom = null;
    
    this._constructFrame(div, facet);
    this._constructBody(facet);
};

Rubik.ListFacet.prototype.dispose = function() {
    var div = this._dom.elmt;
    var parentNode = div.parentNode;
    var height = div.offsetHeight;
    div.style.overflow = "hidden";
    
    var f = function(current, step) {
        if (step == 0) {
            parentNode.removeChild(div);
        } else {
            div.style.height = Math.floor(height * current / 100) + "px";
            div.style.opacity = Math.round(current / 10) / 10;
        }
    };
    SimileAjax.Graphics.createAnimation(f, 100, 0, 500).run();
    
    if (this._groupingDom != null) {
        this._groupingDom.elmt.parentNode.removeChild(this._groupingDom.elmt);
        this._groupingDom = null;
    }
    this._rubik = null;
    this._configuration = null;
    this._dom = null;
};

Rubik.ListFacet.prototype.update = function(facet) {
    this._dom.valuesDiv.innerHTML = "";
    this._constructBody(facet);
};

Rubik.ListFacet.prototype._constructFrame = function(div, facet) {
    var rubik = this._rubik;
    var listFacet = this;
    
    var template = {
        elmt:       div,
        className:  "rubik-facet-frame",
        style:      { height: "1px" },
        children: [
            {   tag:        "div",
                className:  "rubik-facet",
                field:      "innerFacetDiv",
                children: [
                    {   tag:        "div",
                        className:  "rubik-facet-header",
                        children: [ 
                            {   tag:        "div",
                                className:  "rubik-facet-header-filterControl",
                                field:      "clearSelectionsDiv",
                                title:      "Clear these selections",
                                children:   [
                                    "",
                                    {   elmt: SimileAjax.Graphics.createTranslucentImage(
                                            document, Rubik.urlPrefix + "images/black-check-no-border.png")
                                    }
                                ]
                            },
                            {   tag:        "span",
                                className:  "rubik-facet-header-title",
                                children:   [ facet.facetLabel ]
                            },
                            {   tag:        "span",
                                className:  "rubik-facet-header-details",
                                children:   []
                            }
                        ]
                    },
                    {   tag:        "div",
                        className:  "rubik-facet-body",
                        field:      "valuesDiv"
                    }
                ]
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
        template.children[0].children.push(footerTemplate);
    }
    
    template.children[0].children.push({
        tag: "div",
        className: "rubik-facet-resizer",
        field: "resizerDiv"
    });
    
    this._dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    
    var onClearSelectionsClick = function(elmt, evt, target) {
        listFacet._clearSelections();
        SimileAjax.DOM.cancelEvent(evt);
        return false;
    };
    SimileAjax.WindowManager.registerEvent(this._dom.clearSelectionsDiv, "click", onClearSelectionsClick);
        
    SimileAjax.WindowManager.registerForDragging(
        this._dom.resizerDiv,
        {   onDragStart: function() {
                this._height = listFacet._dom.valuesDiv.offsetHeight;
            },
            onDragBy: function(diffX, diffY) {
                this._height += diffY;
                listFacet._dom.valuesDiv.style.height = Math.max(50, this._height) + "px";
            },
            onDragEnd: function() {
            }
        }
    );
    
    /*
     *  Animate opening up facet
     */
    var facetDiv = div.firstChild;
    var f = function(current, step) {
        if (step == 0) {
            div.style.overflow = "visible";
            div.style.opacity = 1;
            div.style.height = "";
        } else {
            var height = facetDiv.offsetHeight;
            div.style.height = Math.floor(height * current / 100) + "px";
            div.style.opacity = Math.round(current / 10) / 10;
        }
    };
    SimileAjax.Graphics.createAnimation(f, 0, 100, 300).run();
};

Rubik.ListFacet.prototype._constructBody = function(facet) {
    var listFacet = this;
    var createImage = function(url) {
        return SimileAjax.Graphics.createTranslucentImage(document, Rubik.urlPrefix + url);
    };
    
    var constructValue = function(value, containerDiv, level) {
        var classes = [ "rubik-facet-value" ];
        if (value.selected) {
            classes.push("rubik-facet-value-selected");
        }
        
        var expanded = true;
        var valueTemplate = {
            tag:        "div",
            className:  classes.join(" "),
            title:      value.label,
            children: [
                {   tag:        "div",
                    className:  "rubik-facet-value-count",
                    children:   [ value.count ]
                },
                {   elmt:       createImage("images/gray-check-no-border.png"),
                    className:  "rubik-facet-grayCheck"
                },
                {   elmt:       createImage("images/no-check-no-border.png"),
                    className:  "rubik-facet-noCheck"
                },
                {   elmt:       createImage("images/black-check-no-border.png"),
                    className:  "rubik-facet-blackCheck"
                }
            ]
        };
        if (value.children.length > 0) {
            valueTemplate.children.push({
                tag:        "span",
                className:  "rubik-facet-value-control",
                children: [
                    {   elmt:   createImage(expanded ? "images/minus.png" : "images/plush.gif"),
                        title:  "Expand to see values in this group",
                        field:  "expandImg"
                    }
                ]
            });
        }
        valueTemplate.children.push(value.label);
        
        var valueDom = SimileAjax.DOM.createDOMFromTemplate(document, valueTemplate);
        valueDom.value = value.value;
        valueDom.selected = value.selected;
        valueDom.level = level;
        containerDiv.appendChild(valueDom.elmt);
        
        var onValueCheckboxClick = function(elmt, evt, target) {
            listFacet._filter(valueDom);
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        };
        SimileAjax.WindowManager.registerEvent(valueDom.elmt, "click", onValueCheckboxClick);
        
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
    
    if (facet.selectedCount > 0) {
        this._dom.innerFacetDiv.className = "rubik-facet rubik-facet-hasSelection";
    } else {
        this._dom.innerFacetDiv.className = "rubik-facet";
    }
    this._dom.clearSelectionsDiv.firstChild.nodeValue = facet.selectedCount;
};

Rubik.ListFacet.prototype._filter = function(valueDom) {
    var facetLabel = this._facetLabel;
    var property = this._property;
    var forward = this._forward;
    var level = valueDom.level;
    var value = valueDom.value;
    var checked = !valueDom.selected;
    var browseEngine = this._rubik.getBrowseEngine();
    
    SimileAjax.History.addAction({
        perform: function() {
            browseEngine.setValueRestriction(
                property, forward, level, value, checked
            );
        },
        undo: function() {
            browseEngine.setValueRestriction(
                property, forward, level, value, !checked
            );
        },
        label: facetLabel + " = " + value,
        uiLayer: SimileAjax.WindowManager.getBaseLayer()
    });
};

Rubik.ListFacet.prototype._slide = function() {
};

Rubik.ListFacet.prototype._clearSelections = function() {
    var state = {};
    var property = this._property;
    var forward = this._forward;
    var browseEngine = this._rubik.getBrowseEngine();
    SimileAjax.History.addAction({
        perform: function() {
            state.restrictions = browseEngine.clearFacetRestrictions(property, forward);
        },
        undo: function() {
            browseEngine.applyFacetRestrictions(property, forward, state.restrictions);
        },
        label: "clear selections",
        uiLayer: SimileAjax.WindowManager.getBaseLayer()
    });
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