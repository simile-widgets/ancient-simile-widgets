

/* browse-engine-l10n.js */

Exhibit.BrowseEngine.l10n={errorParsingFacetExpressionMessage:function(expression){return"The expression '"+expression+"' used to specify a facet is not valid.";}};

/* browse-panel-l10n.js */

Exhibit.BrowsePanel.l10n={notConfigureMessage:"You have not configured the Browse Panel.",learnHowMessage:"Learn How!"};

/* control-panel-l10n.js */

Exhibit.ControlPanel.l10n={badExporterExpressionMessage:function(expr){return"The expression '"+expr+"' in the ex:exporters attribute value\n"+"of <div id=\"exhibit-control-panel\"> does not evaluate to a Javascript object.";}};

/* database-l10n.js */

Exhibit.Database.l10n={itemType:{label:"Item",pluralLabel:"Items"},labelProperty:{label:"label",pluralLabel:"labels",reverseLabel:"label of",reversePluralLabel:"labels of",groupingLabel:"labels",reverseGroupingLabel:"things being labelled"},typeProperty:{label:"type",pluralLabel:"types",reverseLabel:"type of",reversePluralLabel:"types of",groupingLabel:"types",reverseGroupingLabel:"things of these types"},uriProperty:{label:"URI",pluralLabel:"URIs",reverseLabel:"URI of",reversePluralLabel:"URIs of",groupingLabel:"URIs",reverseGroupingLabel:"things named by these URIs"},sortLabels:{"text":{ascending:"a - z",descending:"z - a"},"number":{ascending:"smallest first",descending:"largest first"},"date":{ascending:"earliest first",descending:"latest first"},"boolean":{ascending:"false first",descending:"true first"},"item":{ascending:"a - z",descending:"z - a"}}};

/* exhibit-l10n.js */

Exhibit.l10n={missingLabel:"missing",missingSortKey:"(missing)",notApplicableSortKey:"(n/a)",itemLinkLabel:"link",busyIndicatorMessage:"Working...",showDocumentationMessage:"We will show the relevant documentation after this message.",showJavascriptValidationMessage:"We will explain the error in details after this message.",showJsonValidationMessage:"We will explain the error in details after this message.",showJsonValidationFormMessage:"We will browse to a web service where you can upload and check your code after this message.",badJsonMessage:function(url,e){return"The JSON data file\n  "+url+"\ncontains errors:\n\n"+e;},failedToLoadDataFileMessage:function(url){return"We cannot locate the data file\n  "+url+"\nCheck that the file name is correct.";},copyButtonLabel:"Copy",copyAllButtonLabel:"Copy All",copyDialogBoxCloseButtonLabel:"Close",copyDialogBoxPrompt:"Copy this code to your clipboard as you would copy any text. Press ESC to close this dialog box.",focusDialogBoxCloseButtonLabel:"Close",rdfXmlExporterLabel:"RDF/XML",smwExporterLabel:"Semantic wikitext",exhibitJsonExporterLabel:"Exhibit JSON",tsvExporterLabel:"Tab Separated Values",composeListString:function(a){var s="";for(var i=0;i<a.length;i++){if(i>0){if(i<a.length-1){s+=", ";}else if(a.length<3){s+=" and ";}else{s+=", and ";}}
s+=a[i];}
return s;},createListDelimiter:function(parentElmt,count){var f=function(){if(f.index>0&&f.index<count){if(count>2){parentElmt.appendChild(document.createTextNode((f.index==count-1)?", and ":", "));}else{parentElmt.appendChild(document.createTextNode(" and "));}}
f.index++;};f.index=0;return f;}};

/* lens-l10n.js */

Exhibit.Lens.l10n={editButtonLabel:"Edit",saveButtonLabel:"Save"};

/* list-facet-l10n.js */

Exhibit.ListFacet.l10n={clearSelectionsTooltip:"Clear these selections",groupByLink:"group by",collapseLink:"collapse",expandLink:"expand",toggleGroupTooltip:"Toggle group",groupByLabel:"Group by",groupTheGroupsByLabel:"Group the groups by"};

/* map-view-l10n.js */

Exhibit.MapView.l10n={viewLabel:"Map",viewTooltip:"View items on a map",mixedLegendKey:"Mixed",colorLegendTitle:"Color Legend",formatMappableCount:function(count){return"Only "+count+" can be plotted on map.";}};

/* ordered-view-frame-l10n.js */

Exhibit.OrderedViewFrame.l10n={thenSortByLabel:"then by...",removeOrderLabel:"Remove this order",formatSortActionTitle:function(propertyLabel,sortLabel){return"Sorted by "+propertyLabel+" ("+sortLabel+")";},formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){return"Removed order by "+propertyLabel+" ("+sortLabel+")";},resetActionTitle:"Reset",formatDontShowAll:function(limitCount){return"Show only the first "+limitCount+" results";},formatShowAll:function(count){return"Show all "+count+" results";},createSortingControlsTemplate:function(thenSortByActionLink){return["sorted by: ",{tag:"span",field:"ordersSpan"},"; ",{elmt:thenSortByActionLink,title:"Further sort the items",field:"thenByLink"}];},groupedAsSorted:"grouped as sorted",groupAsSortedActionTitle:"grouped as sorted",ungroupActionTitle:"ungrouped"};

/* tabular-view-l10n.js */

Exhibit.TabularView.l10n={viewLabel:"Table",viewTooltip:"View items in a table",resetActionTitle:"Reset",columnHeaderSortTooltip:"Click to sort by this column",columnHeaderReSortTooltip:"Click to sort in the reverse order",makeSortActionTitle:function(label,ascending){return(ascending?"sorted ascending by ":"sorted descending by ")+label;}};

/* thumbnail-view-l10n.js */

Exhibit.ThumbnailView.l10n={viewLabel:"Thumbnails",viewTooltip:"View items as thumbnails"};

/* tile-view-l10n.js */

Exhibit.TileView.l10n={viewLabel:"Tiles",viewTooltip:"View items as tiles in a list"};

/* timeline-view-l10n.js */

Exhibit.TimelineView.l10n={viewLabel:"Timeline",viewTooltip:"View items on a timeline",colorLegendTitle:"Color Legend",relayoutButtonLabel:"Re-Layout",formatMappableCount:function(count){return"Only "+count+" can be plotted on the timeline.";}};

/* view-panel-l10n.js */

Exhibit.ViewPanel.l10n={resetFiltersLabel:"reset",createSelectViewActionTitle:function(viewLabel){return"select "+viewLabel+" view";},createNoResultsTemplate:function(countClass,typesClass,detailsClass){return[{tag:"span",className:countClass,children:["0"]},{tag:"span",className:typesClass,children:[" results"]},". ",{tag:"span",className:detailsClass,children:["Remove some filters to get some results."]}];},createResultsSummaryTemplate:function(countClass,typesClass,detailsClass,resetActionLink){return[{tag:"span",className:countClass,field:"itemCountSpan"},{tag:"span",className:typesClass,field:"typesSpan"},{tag:"span",className:detailsClass,field:"noFilterDetailsSpan",style:{display:"none"},children:["total"]},{tag:"span",className:detailsClass,field:"filteredDetailsSpan",style:{display:"none"},children:[" filtered from ",{tag:"span",field:"originalCountSpan"}," originally (",{elmt:resetActionLink,title:"Clear all filters and see the original items"},")"]}];},missingViewClassMessage:"The specification for one of the views is missing the viewClass field.",viewClassNotFunctionMessage:function(expr){return"The viewClass attribute value '"+expr+"' you have specified\n"+"for one of the views does not evaluate to a Javascript function.";},badViewClassMessage:function(expr){return"The viewClass attribute value '"+expr+"' you have specified\n"+"for one of the views is not a valid Javascript expression.";}};

/* browse-engine-l10n.js */

Exhibit.BrowseEngine.l10n={errorParsingFacetExpressionMessage:function(expression){return"The expression '"+expression+"' used to specify a facet is not valid.";}};

/* browse-panel-l10n.js */

Exhibit.BrowsePanel.l10n={notConfigureMessage:"You have not configured the Browse Panel.",learnHowMessage:"Learn How!"};

/* control-panel-l10n.js */

Exhibit.ControlPanel.l10n={badExporterExpressionMessage:function(expr){return"The expression '"+expr+"' in the ex:exporters attribute value\n"+"of <div id=\"exhibit-control-panel\"> does not evaluate to a Javascript object.";}};

/* database-l10n.js */

Exhibit.Database.l10n={itemType:{label:"Item",pluralLabel:"Items"},labelProperty:{label:"label",pluralLabel:"labels",reverseLabel:"label of",reversePluralLabel:"labels of",groupingLabel:"labels",reverseGroupingLabel:"things being labelled"},typeProperty:{label:"type",pluralLabel:"types",reverseLabel:"type of",reversePluralLabel:"types of",groupingLabel:"types",reverseGroupingLabel:"things of these types"},uriProperty:{label:"URI",pluralLabel:"URIs",reverseLabel:"URI of",reversePluralLabel:"URIs of",groupingLabel:"URIs",reverseGroupingLabel:"things named by these URIs"},sortLabels:{"text":{ascending:"a - z",descending:"z - a"},"number":{ascending:"smallest first",descending:"largest first"},"date":{ascending:"earliest first",descending:"latest first"},"boolean":{ascending:"false first",descending:"true first"},"item":{ascending:"a - z",descending:"z - a"}}};

/* exhibit-l10n.js */

Exhibit.l10n={missingLabel:"missing",missingSortKey:"(missing)",notApplicableSortKey:"(n/a)",itemLinkLabel:"link",busyIndicatorMessage:"Working...",showDocumentationMessage:"We will show the relevant documentation after this message.",showJavascriptValidationMessage:"We will explain the error in details after this message.",showJsonValidationMessage:"We will explain the error in details after this message.",showJsonValidationFormMessage:"We will browse to a web service where you can upload and check your code after this message.",badJsonMessage:function(url,e){return"The JSON data file\n  "+url+"\ncontains errors:\n\n"+e;},failedToLoadDataFileMessage:function(url){return"We cannot locate the data file\n  "+url+"\nCheck that the file name is correct.";},copyButtonLabel:"Copy",copyAllButtonLabel:"Copy All",copyDialogBoxCloseButtonLabel:"Close",copyDialogBoxPrompt:"Copy this code to your clipboard as you would copy any text. Press ESC to close this dialog box.",focusDialogBoxCloseButtonLabel:"Close",rdfXmlExporterLabel:"RDF/XML",smwExporterLabel:"Semantic wikitext",exhibitJsonExporterLabel:"Exhibit JSON",tsvExporterLabel:"Tab Separated Values",composeListString:function(a){var s="";for(var i=0;i<a.length;i++){if(i>0){if(i<a.length-1){s+=", ";}else if(a.length<3){s+=" and ";}else{s+=", and ";}}
s+=a[i];}
return s;},createListDelimiter:function(parentElmt,count){var f=function(){if(f.index>0&&f.index<count){if(count>2){parentElmt.appendChild(document.createTextNode((f.index==count-1)?", and ":", "));}else{parentElmt.appendChild(document.createTextNode(" and "));}}
f.index++;};f.index=0;return f;}};

/* lens-l10n.js */

Exhibit.Lens.l10n={editButtonLabel:"Edit",saveButtonLabel:"Save"};

/* list-facet-l10n.js */

Exhibit.ListFacet.l10n={clearSelectionsTooltip:"Clear these selections",groupByLink:"group by",collapseLink:"collapse",expandLink:"expand",toggleGroupTooltip:"Toggle group",groupByLabel:"Group by",groupTheGroupsByLabel:"Group the groups by"};

/* map-view-l10n.js */

Exhibit.MapView.l10n={viewLabel:"Map",viewTooltip:"View items on a map",mixedLegendKey:"Mixed",colorLegendTitle:"Color Legend",formatMappableCount:function(count){return"Only "+count+" can be plotted on map.";}};

/* ordered-view-frame-l10n.js */

Exhibit.OrderedViewFrame.l10n={thenSortByLabel:"then by...",removeOrderLabel:"Remove this order",formatSortActionTitle:function(propertyLabel,sortLabel){return"Sorted by "+propertyLabel+" ("+sortLabel+")";},formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){return"Removed order by "+propertyLabel+" ("+sortLabel+")";},resetActionTitle:"Reset",formatDontShowAll:function(limitCount){return"Show only the first "+limitCount+" results";},formatShowAll:function(count){return"Show all "+count+" results";},createSortingControlsTemplate:function(thenSortByActionLink){return["sorted by: ",{tag:"span",field:"ordersSpan"},"; ",{elmt:thenSortByActionLink,title:"Further sort the items",field:"thenByLink"}];},groupedAsSorted:"grouped as sorted",groupAsSortedActionTitle:"grouped as sorted",ungroupActionTitle:"ungrouped"};

/* tabular-view-l10n.js */

Exhibit.TabularView.l10n={viewLabel:"Table",viewTooltip:"View items in a table",resetActionTitle:"Reset",columnHeaderSortTooltip:"Click to sort by this column",columnHeaderReSortTooltip:"Click to sort in the reverse order",makeSortActionTitle:function(label,ascending){return(ascending?"sorted ascending by ":"sorted descending by ")+label;}};

/* thumbnail-view-l10n.js */

Exhibit.ThumbnailView.l10n={viewLabel:"Thumbnails",viewTooltip:"View items as thumbnails"};

/* tile-view-l10n.js */

Exhibit.TileView.l10n={viewLabel:"Tiles",viewTooltip:"View items as tiles in a list"};

/* timeline-view-l10n.js */

Exhibit.TimelineView.l10n={viewLabel:"Timeline",viewTooltip:"View items on a timeline",colorLegendTitle:"Color Legend",relayoutButtonLabel:"Re-Layout",formatMappableCount:function(count){return"Only "+count+" can be plotted on the timeline.";}};

/* view-panel-l10n.js */

Exhibit.ViewPanel.l10n={resetFiltersLabel:"reset",createSelectViewActionTitle:function(viewLabel){return"select "+viewLabel+" view";},createNoResultsTemplate:function(countClass,typesClass,detailsClass){return[{tag:"span",className:countClass,children:["0"]},{tag:"span",className:typesClass,children:[" results"]},". ",{tag:"span",className:detailsClass,children:["Remove some filters to get some results."]}];},createResultsSummaryTemplate:function(countClass,typesClass,detailsClass,resetActionLink){return[{tag:"span",className:countClass,field:"itemCountSpan"},{tag:"span",className:typesClass,field:"typesSpan"},{tag:"span",className:detailsClass,field:"noFilterDetailsSpan",style:{display:"none"},children:["total"]},{tag:"span",className:detailsClass,field:"filteredDetailsSpan",style:{display:"none"},children:[" filtered from ",{tag:"span",field:"originalCountSpan"}," originally (",{elmt:resetActionLink,title:"Clear all filters and see the original items"},")"]}];},missingViewClassMessage:"The specification for one of the views is missing the viewClass field.",viewClassNotFunctionMessage:function(expr){return"The viewClass attribute value '"+expr+"' you have specified\n"+"for one of the views does not evaluate to a Javascript function.";},badViewClassMessage:function(expr){return"The viewClass attribute value '"+expr+"' you have specified\n"+"for one of the views is not a valid Javascript expression.";}};