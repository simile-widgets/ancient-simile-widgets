/*==================================================
 *  Exhibit.XMLImporter
 *==================================================
 */

Exhibit.XMLImporter = { };
Exhibit.importers["application/xml"] = Exhibit.XMLImporter;

Exhibit.XMLImporter.getXMLDocument = function (docURL) {
	var xmlDoc = null;
	SimileAjax.jQuery.ajax({ url: docURL,
		     type: 'GET',
		     dataType: 'xml',
		     async: false, //Need this due to failure of getting XMLDoc from server
		     success: function (data) { xmlDoc = data; }
	});
	if (xmlDoc) {
		return xmlDoc;
	} else {
		alert('Error finding xml doc ' + docURL);
		return;
	}
}

//APPENDS PROPERTIES (NAME SPECIFIED BY USER) TO ARRAY
Exhibit.XMLImporter.appendUserPropertyToArray = function(node,configuration,objectToAppend) {
	var referenceIndex = configuration.propertyTags.indexOf(node.nodeName);
	var array = objectToAppend[configuration.propertyNames[referenceIndex]];
	// check if property list has been initialized
	if  (typeof objectToAppend[configuration.propertyNames[referenceIndex]] == 'string') {
		array = [array];
		array.push(SimileAjax.jQuery(node).text());
	} else {
	    array.push(SimileAjax.jQuery(node).text());
	}
	return array;
}

// APPENDS PROPERTIES (NAME NOT SPECIFIED BY USER) TO ARRAY
Exhibit.XMLImporter.appendPropertyToArray = function(node,configuration,objectToAppend) {
	var array = objectToAppend[node.nodeName];

	if (typeof array == 'string') {
		array = [array];
		array.push(SimileAjax.jQuery(node).text());
	} else {
	    array.push(SimileAjax.jQuery(node).text());
	}
	return array;
}

//GETS ALL ITEMS OF CONFIGURATION.ITEMTAG[INDEX]
Exhibit.XMLImporter.getItems = function(xmlDoc, object,index,configuration) {
	var self = this;
	SimileAjax.jQuery(configuration.itemTag[index],xmlDoc).each(function() {
        var propertyList = [];
        var queue = [];
        SimileAjax.jQuery(this).children().each(function() { queue.push(this); });								  
        objectToAppend = {};
        
        while (queue.length > 0) {
            var node = queue.pop();

	    if (SimileAjax.jQuery(node).text().length <= 0) continue; //don't include empty strings as values of properties
            var nodeType = self.determineType(node,configuration);
        
            if (nodeType == 'property') {
                // IF MULTIPLE PROPERTIES OF SAME NODENAME, APPEND TO ARRAY
                if (propertyList.indexOf(node.nodeName)>=0) {
                    // check if user specified property name
                    if (configuration.propertyTags.indexOf(node.nodeName)>=0) {
                        objectToAppend[configuration.propertyNames[index]]= self.appendUserPropertyToArray(node,configuration,objectToAppend);
                    } else {	
                        // Use tag name as property name
                        objectToAppend[node.nodeName]= self.appendPropertyToArray(node,configuration,objectToAppend);
                    }
                } else {
                    //IF SINGLE VALUE APPEND TO STRING VALUE
                    
                    // APPLY USER SPECIFIED PROPERTY NAMES
                    if (configuration.propertyTags.indexOf(node.nodeName)>=0) {
                        var referenceIndex = configuration.propertyTags.indexOf(node.nodeName);
                        objectToAppend[configuration.propertyNames[referenceIndex]] = SimileAjax.jQuery(node).text();
                    } else {
                        //ELSE, USE TAG NODENAME
                        objectToAppend[node.nodeName] = SimileAjax.jQuery(node).text();
                    }
                }
                
                propertyList.push(node.nodeName);
            } else if (nodeType == 'Item') {
                var referenceIndex = configuration.itemTag.indexOf(node.nodeName);
                var tempObject = self.configureItem(node,{},configuration,referenceIndex);
        
                objectToAppend[tempObject.type] = tempObject.label;
            } else if (nodeType == 'fakeItem') {
                SimileAjax.jQuery(node).children().each(function() { queue.push(this); } );																				
            } else {
                alert('error: nodetype not understood');
            }
        }
        
        objectToAppend = self.configureItem(this, objectToAppend,configuration,index);
        object.items.push(objectToAppend);
    });
    
    return object;
}

//FINDS THE CLOSEST PARENT NODE THAT'S IN CONFIGURATION.ITEMTAG
Exhibit.XMLImporter.getParentItem = function(itemNode,configuration) {
	if (itemNode.parentNode==null) {
		return null;
	} else if (configuration.itemTag.indexOf(itemNode.parentNode.nodeName)>=0) {
		var referenceIndex = configuration.itemTag.indexOf(itemNode.parentNode.nodeName);
		return this.configureItem(itemNode.parentNode,{},configuration,referenceIndex);
	} else {
		this.getParentItem(itemNode.parentNode,configuration);
	}
}

// SETS LABEL, TYPE, AND PARENT RELATION
Exhibit.XMLImporter.configureItem = function(myItem, object,configuration,index) {
	if (!(object.label) && configuration.labelTag[index]!=null) {
	    object['label'] = SimileAjax.jQuery(configuration.labelTag[index],myItem).eq(0).text();
	} else {
	    //DEFAULT TO FIRST PROPERTY
	    object['label'] = SimileAjax.jQuery(myItem).children().eq(0).text();
	}
	
	if (!(object.type) && configuration.itemType[index]!=null) {
		object['type'] = configuration.itemType[index];
	} else {
		//DEFAULT TO NODENAME
		object['type'] = myItem.nodeName;
	}
	
	var parentItem = this.getParentItem(myItem,configuration);
	if (parentItem) {
		if (configuration.parentRelation[index]) {
			object[configuration.parentRelation[index]] = parentItem.label;
		} else {
			//DEFAULT TO "IS A CHILD OF"
			object['isChildOf'] = parentItem.label;
		}
	}
	return object;
}
	

Exhibit.XMLImporter.configure = function(link) {
	var configuration = {
		'itemTag': [],
		'labelTag': [],
		'itemType': [],
		'parentRelation': [],
		'propertyTags': [],
		'propertyNames': []
	}


	// get itemTag, labelTag, itemType, and parentRelation
	configuration.itemTag = Exhibit.getAttribute(link,'ex:itemTags',',') || [];
	configuration.labelTag = Exhibit.getAttribute(link,'ex:labelTags',',') || [];
	configuration.itemType = Exhibit.getAttribute(link,'ex:itemTypes',',') || [];
	configuration.parentRelation = Exhibit.getAttribute(link,'ex:parentRelations',',') || [];
	configuration.propertyNames = Exhibit.getAttribute(link,'ex:propertyNames',',') || [];
	configuration.propertyTags = Exhibit.getAttribute(link,'ex:propertyTags',',') || [];
	
	return configuration;
}

Exhibit.XMLImporter.determineType = function(node,configuration) {
	if (configuration.itemTag.indexOf(node.nodeName)>=0) {
        return "Item";
    } else if (SimileAjax.jQuery(node).children().length == 0) {
		return 'property';
	} else {
		return 'fakeItem';
	}
}
																		
Exhibit.XMLImporter.load = function (link,database,cont) {
    var self = this;
    var url = typeof link == "string" ? link : link.href;
    url = Exhibit.Persistence.resolveURL(url);

    var fError = function(statusText, status, xmlhttp) {
        Exhibit.UI.hideBusyIndicator();
        Exhibit.UI.showHelp(Exhibit.l10n.failedToLoadDataFileMessage(url));
        if (cont) cont();
    };
	
    var fDone = function() {
        Exhibit.UI.hideBusyIndicator();
        try {
            var o = null;
            try {
		xmlDoc = Exhibit.XMLImporter.getXMLDocument(url);
		var configuration = self.configure(link);
                o = { 
		    'items': []
		};
		for (index=0; index < configuration.itemTag.length; index++)		    {
		    o = Exhibit.XMLImporter.getItems(xmlDoc,o,index,configuration);
		}
				
            } catch (e) {
                Exhibit.UI.showJsonFileValidation(Exhibit.l10n.badJsonMessage(url, e), url);
            }
            
            if (o != null) {
                database.loadData(o, Exhibit.Persistence.getBaseURL(url));
            }
        } catch (e) {
            SimileAjax.Debug.exception(e, "Error loading Exhibit JSON data from " + url);
        } 

		finally {
            if (cont) cont();
        }
    };
	
    Exhibit.UI.showBusyIndicator();
    SimileAjax.XmlHttp.get(url, fError, fDone);
}	
						  