/*==================================================
 *  Exhibit.XMLImporter
 *==================================================
 */


/*
An XML node can represent three things:
* an item
* a relationship between a parent node (item) and child node (item)
* both, ie the node represents and item that is implicitly related to the containing node

ex:itemTags specifies tags that represent items
By default, the type of an item equals its itemTag
ex:itemTypes overrides this default
If an item C is a descendant of another item A, C becomes the value of some property of A
By default:
* if the (immediate) parent of C is NOT an item tag, then that tag names the property
* if the (immediate) parent of C IS an item tag, then C's tag names the property (even while it might also name C's type)
ex:parentRelation (one per itemTag) overrides this default.  It specifies, for each item tag, 
the property whose value is items with that tag.  In other words, if I see that tag, 
I infer it is the value of that property of the ancestor item 

After items have been constructed, labelProperty specifies which property of an item should become the item's label
Note that this property might not be a direct tag; it might have bubbled up from some far descendant


*/

Exhibit.XMLImporter = { };
Exhibit.importers["application/xml"] = Exhibit.XMLImporter;

Exhibit.XMLImporter.getItems = function(xmlDoc, configuration) {
    var items=[];
    function maybeAdd(item, property, value) {
	if (item && property.length > 0 && value.length > 0) {
	    if (item[property]) {
		item[property].push(value);
	    }
	    else {
		item[property]=[value];
	    }
	}
    }
    function visit(node,parentItem,parentProperty) { 
	//gather data from node into parentItem 
	//associated by parentProperty
	var tag=node.tagName;
	var jQ=SimileAjax.jQuery(node);
	var children = jQ.children();
	if (tag in configuration.itemType) {
	    //found a new item
	    var item={type: configuration.itemType[tag]};
	    items.push(item);
	    parentProperty = configuration.parentRelation[tag] || parentProperty;
	    if (children.length == 0) {
		//strange to have item with no children (no properties)
		//hopefully there is text and that can be item's label
		item.label=jQ.text();
	    }
	    else {
		children.each(function() {
		    visit(this, item, null);
		});
		if (configuration.labelProperty[tag] != "label") {
		    var label=item[configuration.labelProperty[tag]] || [];
		    if (label.length > 0)
			item.label = label[0];
		}
	    }
	    maybeAdd(parentItem,parentProperty,item.label);
	    parentItem=item; //for incorporating attributes
	}
	else {
	    //non item tag
	    if (children.length == 0) {
		//no children; look for text
		if ((parentItem != null) && (jQ.text().length >= 0))  {
		    var property=configuration.propertyNames[tag] || tag;
		    maybeAdd(parentItem, property, jQ.text());
		}
	    }
	    else {
		children.each(function() {
		    visit(this,parentItem,tag);
		});
	    }
	}
	//now process attributes
	var attrMap=node.attributes;
	if (attrMap) {
	    for (i=0; i<attrMap.length; i++) {
		var attr=attrMap[i].nodeName;
		maybeAdd(parentItem, 
			 configuration.propertyNames[attr] || attr, 
			 jQ.attr(attr));
	    }
	}
    }

    visit(xmlDoc,null,null);
    return items;
}	

Exhibit.XMLImporter.configure = function(link) {
    var configuration = {
	'labelProperty': [],
	'itemType': [],
	'parentRelation': [],
	'propertyNames': {}
    }


	// get itemTag, labelTag, itemType, and parentRelation
    var itemTag = Exhibit.getAttribute(link,'ex:itemTags',',') || ["item"];
    var labelProperty = Exhibit.getAttribute(link,'ex:labelProperties',',') || [];
    var itemType = Exhibit.getAttribute(link,'ex:itemTypes',',') || [];
    var parentRelation = Exhibit.getAttribute(link,'ex:parentRelations',',') || [];

    for (i=0; i<itemTag.length; i++) {
	var tag=itemTag[i];
	configuration.itemType[tag] = itemType[i] || tag;
	configuration.labelProperty[tag] = labelProperty[i] || "label";
	configuration.parentRelation[tag] = parentRelation[i] || "child";
    }

    var propertyNames = Exhibit.getAttribute(link,'ex:propertyNames',',') || [];
    var propertyTags = Exhibit.getAttribute(link,'ex:propertyTags',',') || [];
    for (i=0; i< propertyTags.length; i++) {
	configuration.propertyNames[propertyTags[i]] = (i < propertyNames.length) ? propertyNames[i] : propertyTags[i];
    }
	
    return configuration;
}
																		
Exhibit.XMLImporter.load = function (link,database,cont) {
    var self = this;
    var url = typeof link == "string" ? link : link.href;
    var configuration;

    try {
	configuration = self.configure(link);
	url = Exhibit.Persistence.resolveURL(url);
    } catch(e) {
	SimileAjax.Debug.exception(e, "Error configuring XML importer for " + url);
	return;
    }

    var fError = function(xmlhttp, statusText, error) {
        Exhibit.UI.hideBusyIndicator();
	if (statusText == "parsererror") {
	    Exhibit.UI.showHelp("Invalid XML at " + url);
	}
	else {
            Exhibit.UI.showHelp(Exhibit.l10n.failedToLoadDataFileMessage(url));
	}
        if (cont) cont();
    };

    var fDone = function(xmlDoc) {
        try {
	    var o = Exhibit.XMLImporter.getItems(xmlDoc,configuration);
            database.loadData({items: o}, Exhibit.Persistence.getBaseURL(url));
        } catch (e) {
            SimileAjax.Debug.exception(e, "Error loading data from " + url);
        } finally {
            Exhibit.UI.hideBusyIndicator();
            if (cont) cont();
        }
    };
	
    Exhibit.UI.showBusyIndicator();
    SimileAjax.jQuery.ajax({ url: url,
			     type: 'GET',
			     dataType: 'xml',
			     async: false, //Need this due to failure of getting XMLDoc from server
			     success: fDone,
			     error: fError
			  });
}	
						  