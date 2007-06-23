

/* collection-summary-widget-l10n.js */



Exhibit.CollectionSummaryWidget.l10n={
resetFiltersLabel:"Reset All Filters",
resetFiltersTooltip:"Clear all filters and see the original items",
resetActionTitle:"Reset all filters",

allResultsTemplate:
"<span class='%0' id='currentCountSpan'>0</span> <span class='%1' id='typesSpan'>results</span> total.",

noResultsTemplate:
"<span class='%0'>0</span> <span class='%1' id='typesSpan'>results</span>. (<span id='resetActionLink'></span>)",

filteredResultsTemplate:
"<span class='%0' id='currentCountSpan'>0</span> <span class='%1' id='typesSpan'>results</span> "+
"filtered from <span id='originalCountSpan'>0</span> originally. (<span id='resetActionLink'></span>)"
};


/* database-l10n.js */


Exhibit.Database.l10n={
itemType:{
label:"Item",
pluralLabel:"Items"
},
labelProperty:{
label:"label",
pluralLabel:"labels",
reverseLabel:"label of",
reversePluralLabel:"labels of",
groupingLabel:"labels",
reverseGroupingLabel:"things being labelled"
},
typeProperty:{
label:"type",
pluralLabel:"types",
reverseLabel:"type of",
reversePluralLabel:"types of",
groupingLabel:"types",
reverseGroupingLabel:"things of these types"
},
uriProperty:{
label:"URI",
pluralLabel:"URIs",
reverseLabel:"URI of",
reversePluralLabel:"URIs of",
groupingLabel:"URIs",
reverseGroupingLabel:"things named by these URIs"
},
sortLabels:{
"text":{
ascending:"a - z",
descending:"z - a"
},
"number":{
ascending:"smallest first",
descending:"largest first"
},
"date":{
ascending:"earliest first",
descending:"latest first"
},
"boolean":{
ascending:"false first",
descending:"true first"
},
"item":{
ascending:"a - z",
descending:"z - a"
}
}
};


/* exhibit-l10n.js */



Exhibit.l10n={
missingLabel:"missing",
missingSortKey:"(missing)",
notApplicableSortKey:"(n/a)",
itemLinkLabel:"link",

busyIndicatorMessage:"Working...",
showDocumentationMessage:"We will show the relevant documentation after this message.",
showJavascriptValidationMessage:"We will explain the error in details after this message.",

showJsonValidationMessage:"We will explain the error in details after this message.",
showJsonValidationFormMessage:"We will browse to a web service where you can upload and check your code after this message.",

badJsonMessage:function(url,e){
return"The JSON data file\n  "+url+"\ncontains errors:\n\n"+e;
},
failedToLoadDataFileMessage:function(url){
return"We cannot locate the data file\n  "+url+"\nCheck that the file name is correct.";
},


exportButtonLabel:"Export",
exportAllButtonLabel:"Export All",
exportDialogBoxCloseButtonLabel:"Close",
exportDialogBoxPrompt:
"Copy this code to your clipboard as you would copy any text. Press ESC to close this dialog box.",


focusDialogBoxCloseButtonLabel:"Close",


rdfXmlExporterLabel:"RDF/XML",
smwExporterLabel:"Semantic wikitext",
exhibitJsonExporterLabel:"Exhibit JSON",
tsvExporterLabel:"Tab Separated Values",
htmlExporterLabel:"Generated HTML of this view",


composeListString:function(a){
var s="";
for(var i=0;i<a.length;i++){
if(i>0){
if(i<a.length-1){
s+=", ";
}else if(a.length<3){
s+=" and ";
}else{
s+=", and ";
}
}
s+=a[i];
}
return s;
},
createListDelimiter:function(parentElmt,count){
var f=function(){
if(f.index>0&&f.index<count){
if(count>2){
parentElmt.appendChild(document.createTextNode(
(f.index==count-1)?", and ":", "));
}else{
parentElmt.appendChild(document.createTextNode(" and "));
}
}
f.index++;
};
f.index=0;

return f;
}
};


/* lens-l10n.js */



Exhibit.Lens.l10n={
editButtonLabel:"Edit",
saveButtonLabel:"Save"
};


/* ordered-view-frame-l10n.js */



Exhibit.OrderedViewFrame.l10n={
removeOrderLabel:"Remove this order",

sortingControlsTemplate:
"sorted by: <span id='ordersSpan'></span>; <a id='thenSortByAction' href='javascript:void' class='exhibit-action' title='Further sort the items'>then by...</a>",

formatSortActionTitle:function(propertyLabel,sortLabel){
return"Sorted by "+propertyLabel+" ("+sortLabel+")";
},
formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){
return"Removed order by "+propertyLabel+" ("+sortLabel+")";
},

groupedAsSortedOptionLabel:"grouped as sorted",
groupAsSortedActionTitle:"group as sorted",
ungroupAsSortedActionTitle:"ungroup as sorted",

showAllActionTitle:"show all results",
dontShowAllActionTitle:"show first few results",
formatDontShowAll:function(limitCount){
return"Show only the first "+limitCount+" results";
},
formatShowAll:function(count){
return"Show all "+count+" results";
}
};

/* pivot-table-view-l10n.js */



Exhibit.PivotTableView.l10n={
viewLabel:"Scatter Plot",
viewTooltip:"View items on a pivot table",
formatMappableCount:function(count){
return"Only "+count+" can be plotted.";
}
};


/* scatter-plot-view-l10n.js */



Exhibit.ScatterPlotView.l10n={
viewLabel:"Scatter Plot",
viewTooltip:"View items on a scatter plot",
mixedLegendKey:"Mixed",
colorLegendTitle:"Color Legend",
formatMappableCount:function(count){
return"Only "+count+" can be plotted.";
}
};


/* tabular-view-l10n.js */



Exhibit.TabularView.l10n={
viewLabel:"Table",
viewTooltip:"View items in a table",
resetActionTitle:"Reset",

columnHeaderSortTooltip:"Click to sort by this column",
columnHeaderReSortTooltip:"Click to sort in the reverse order",
makeSortActionTitle:function(label,ascending){
return(ascending?"sorted ascending by ":"sorted descending by ")+label;
}
};


/* thumbnail-view-l10n.js */



Exhibit.ThumbnailView.l10n={
viewLabel:"Thumbnails",
viewTooltip:"View items as thumbnails"
};


/* tile-view-l10n.js */



Exhibit.TileView.l10n={
viewLabel:"Tiles",
viewTooltip:"View items as tiles in a list"
};


/* ui-context-l10n.js */



if(!("l10n"in Exhibit.UIContext)){
Exhibit.UIContext.l10n={};
}

Exhibit.UIContext.l10n["eng"]={
initialSettings:{
"bubbleWidth":400,
"bubbleHeight":300
}
};


/* facets-l10n.js */



Exhibit.FacetUtilities.l10n={
clearSelectionsTooltip:"Clear these selections",
facetSelectActionTitle:"Select %0 in facet %1",
facetUnselectActionTitle:"Unselect %0 in facet %1",
facetSelectOnlyActionTitle:"Select only %0 in facet %1",
facetClearSelectionsActionTitle:"Clear selections in facet %0",
facetTextSearchActionTitle:"Text search %0",
facetClearTextSearchActionTitle:"Clear text search"
};


/* views-l10n.js */



Exhibit.ViewUtilities.l10n={
unplottableMessageFormatter:function(totalCount,unplottableItems,uiContext){
var count=unplottableItems.length;

return String.substitute(
"<a class='exhibit-action exhibit-views-unplottableCount' href='javascript:void' id='unplottableCountLink'>%0</a> "+
"out of <class class='exhibit-views-totalCount'>%1</span> cannot be plotted.",
[count==1?(count+" result"):(count+" results"),totalCount]
);
}
};


/* view-panel-l10n.js */



Exhibit.ViewPanel.l10n={
createSelectViewActionTitle:function(viewLabel){
return"select "+viewLabel+" view";
},
missingViewClassMessage:"The specification for one of the views is missing the viewClass field.",
viewClassNotFunctionMessage:function(expr){
return"The viewClass attribute value '"+expr+"' you have specified\n"+
"for one of the views does not evaluate to a Javascript function.";
},
badViewClassMessage:function(expr){
return"The viewClass attribute value '"+expr+"' you have specified\n"+
"for one of the views is not a valid Javascript expression.";
}
};
