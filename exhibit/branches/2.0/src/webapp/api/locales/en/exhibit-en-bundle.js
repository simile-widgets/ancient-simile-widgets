

/* database-l10n.js */



if(!("l10n"in Exhibit.Database)){
Exhibit.Database.l10n={};
}

Exhibit.Database.l10n.itemType={
label:"Item",
pluralLabel:"Items"
};
Exhibit.Database.l10n.labelProperty={
label:"label",
pluralLabel:"labels",
reverseLabel:"label of",
reversePluralLabel:"labels of",
groupingLabel:"labels",
reverseGroupingLabel:"things being labelled"
};
Exhibit.Database.l10n.typeProperty={
label:"type",
pluralLabel:"types",
reverseLabel:"type of",
reversePluralLabel:"types of",
groupingLabel:"types",
reverseGroupingLabel:"things of these types"
};
Exhibit.Database.l10n.uriProperty={
label:"URI",
pluralLabel:"URIs",
reverseLabel:"URI of",
reversePluralLabel:"URIs of",
groupingLabel:"URIs",
reverseGroupingLabel:"things named by these URIs"
};
Exhibit.Database.l10n.sortLabels={
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
};


/* exhibit-l10n.js */



if(!("l10n"in Exhibit)){
Exhibit.l10n={};
}

Exhibit.l10n.missingLabel="missing";
Exhibit.l10n.missingSortKey="(missing)";
Exhibit.l10n.notApplicableSortKey="(n/a)";
Exhibit.l10n.itemLinkLabel="link";

Exhibit.l10n.busyIndicatorMessage="Working...";
Exhibit.l10n.showDocumentationMessage="We will show the relevant documentation after this message.";
Exhibit.l10n.showJavascriptValidationMessage="We will explain the error in details after this message.";

Exhibit.l10n.showJsonValidationMessage="We will explain the error in details after this message.";
Exhibit.l10n.showJsonValidationFormMessage="We will browse to a web service where you can upload and check your code after this message.";

Exhibit.l10n.badJsonMessage=function(url,e){
return"The JSON data file\n  "+url+"\ncontains errors =\n\n"+e;
};
Exhibit.l10n.failedToLoadDataFileMessage=function(url){
return"We cannot locate the data file\n  "+url+"\nCheck that the file name is correct.";
};


Exhibit.l10n.exportButtonLabel="Export";
Exhibit.l10n.exportAllButtonLabel="Export All";
Exhibit.l10n.exportDialogBoxCloseButtonLabel="Close";
Exhibit.l10n.exportDialogBoxPrompt=
"Copy this code to your clipboard as you would copy any text. Press ESC to close this dialog box.";


Exhibit.l10n.focusDialogBoxCloseButtonLabel="Close";


Exhibit.l10n.rdfXmlExporterLabel="RDF/XML";
Exhibit.l10n.smwExporterLabel="Semantic wikitext";
Exhibit.l10n.exhibitJsonExporterLabel="Exhibit JSON";
Exhibit.l10n.tsvExporterLabel="Tab Separated Values";
Exhibit.l10n.htmlExporterLabel="Generated HTML of this view";


Exhibit.l10n.composeListString=function(a){
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
};

Exhibit.l10n.createListDelimiter=function(parentElmt,count){
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
};


/* lens-l10n.js */



if(!("l10n"in Exhibit.Lens)){
Exhibit.Lens.l10n={};
}


/* ui-context-l10n.js */



if(!("l10n"in Exhibit.UIContext)){
Exhibit.UIContext.l10n={};
}

Exhibit.UIContext.l10n.initialSettings={
"bubbleWidth":400,
"bubbleHeight":300
};


/* ordered-view-frame-l10n.js */



if(!("l10n"in Exhibit.OrderedViewFrame)){
Exhibit.OrderedViewFrame.l10n={};
}

Exhibit.OrderedViewFrame.l10n.removeOrderLabel="Remove this order";

Exhibit.OrderedViewFrame.l10n.sortingControlsTemplate=
"sorted by: <span id='ordersSpan'></span>; <a id='thenSortByAction' href='javascript:void' class='exhibit-action' title='Further sort the items'>then by...</a>";

Exhibit.OrderedViewFrame.l10n.formatSortActionTitle=function(propertyLabel,sortLabel){
return"Sorted by "+propertyLabel+" ("+sortLabel+")";
};
Exhibit.OrderedViewFrame.l10n.formatRemoveOrderActionTitle=function(propertyLabel,sortLabel){
return"Removed order by "+propertyLabel+" ("+sortLabel+")";
};

Exhibit.OrderedViewFrame.l10n.groupedAsSortedOptionLabel="grouped as sorted";
Exhibit.OrderedViewFrame.l10n.groupAsSortedActionTitle="group as sorted";
Exhibit.OrderedViewFrame.l10n.ungroupAsSortedActionTitle="ungroup as sorted";

Exhibit.OrderedViewFrame.l10n.showAllActionTitle="show all results";
Exhibit.OrderedViewFrame.l10n.dontShowAllActionTitle="show first few results";
Exhibit.OrderedViewFrame.l10n.formatDontShowAll=function(limitCount){
return"Show only the first "+limitCount+" results";
};
Exhibit.OrderedViewFrame.l10n.formatShowAll=function(count){
return"Show all "+count+" results";
};

/* tabular-view-l10n.js */


if(!("l10n"in Exhibit.TabularView)){
Exhibit.TabularView.l10n={};
}

Exhibit.TabularView.l10n.viewLabel="Table";
Exhibit.TabularView.l10n.viewTooltip="View items in a table";

Exhibit.TabularView.l10n.columnHeaderSortTooltip="Click to sort by this column";
Exhibit.TabularView.l10n.columnHeaderReSortTooltip="Click to sort in the reverse order";
Exhibit.TabularView.l10n.makeSortActionTitle=function(label,ascending){
return(ascending?"sorted ascending by ":"sorted descending by ")+label;
};


/* thumbnail-view-l10n.js */



if(!("l10n"in Exhibit.ThumbnailView)){
Exhibit.ThumbnailView.l10n={};
}

Exhibit.ThumbnailView.l10n.viewLabel="Thumbnails";
Exhibit.ThumbnailView.l10n.viewTooltip="View items as thumbnails";


/* tile-view-l10n.js */



if(!("l10n"in Exhibit.TileView)){
Exhibit.TileView.l10n={};
}

Exhibit.TileView.l10n.viewLabel="Tiles";
Exhibit.TileView.l10n.viewTooltip="View items as tiles in a list";


/* view-panel-l10n.js */



if(!("l10n"in Exhibit.ViewPanel)){
Exhibit.ViewPanel.l10n={};
}

Exhibit.ViewPanel.l10n.createSelectViewActionTitle=function(viewLabel){
return"select "+viewLabel+" view";
};
Exhibit.ViewPanel.l10n.missingViewClassMessage="The specification for one of the views is missing the viewClass field.";
Exhibit.ViewPanel.l10n.viewClassNotFunctionMessage=function(expr){
return"The viewClass attribute value '"+expr+"' you have specified\n"+
"for one of the views does not evaluate to a Javascript function.";
};
Exhibit.ViewPanel.l10n.badViewClassMessage=function(expr){
return"The viewClass attribute value '"+expr+"' you have specified\n"+
"for one of the views is not a valid Javascript expression.";
};


/* collection-summary-widget-l10n.js */



if(!("l10n"in Exhibit.CollectionSummaryWidget)){
Exhibit.CollectionSummaryWidget.l10n={};
}

Exhibit.CollectionSummaryWidget.l10n.resetFiltersLabel="Reset All Filters";
Exhibit.CollectionSummaryWidget.l10n.resetFiltersTooltip="Clear all filters and see the original items";
Exhibit.CollectionSummaryWidget.l10n.resetActionTitle="Reset all filters";

Exhibit.CollectionSummaryWidget.l10n.allResultsTemplate=
"<span class='%0' id='currentCountSpan'>0</span> <span class='%1' id='typesSpan'>results</span> total.";

Exhibit.CollectionSummaryWidget.l10n.noResultsTemplate=
"<span class='%0'>0</span> <span class='%1' id='typesSpan'>results</span>. (<span id='resetActionLink'></span>)";

Exhibit.CollectionSummaryWidget.l10n.filteredResultsTemplate=
"<span class='%0' id='currentCountSpan'>0</span> <span class='%1' id='typesSpan'>results</span> "+
"filtered from <span id='originalCountSpan'>0</span> originally. (<span id='resetActionLink'></span>)";


/* facets-l10n.js */



if(!("l10n"in Exhibit.FacetUtilities)){
Exhibit.FacetUtilities.l10n={};
}

Exhibit.FacetUtilities.l10n.clearSelectionsTooltip="Clear these selections";
Exhibit.FacetUtilities.l10n.facetSelectActionTitle="Select %0 in facet %1";
Exhibit.FacetUtilities.l10n.facetUnselectActionTitle="Unselect %0 in facet %1";
Exhibit.FacetUtilities.l10n.facetSelectOnlyActionTitle="Select only %0 in facet %1";
Exhibit.FacetUtilities.l10n.facetClearSelectionsActionTitle="Clear selections in facet %0";
Exhibit.FacetUtilities.l10n.facetTextSearchActionTitle="Text search %0";
Exhibit.FacetUtilities.l10n.facetClearTextSearchActionTitle="Clear text search";


/* views-l10n.js */



if(!("l10n"in Exhibit.ViewUtilities)){
Exhibit.ViewUtilities.l10n={};
}

Exhibit.ViewUtilities.l10n.unplottableMessageFormatter=function(totalCount,unplottableItems,uiContext){
var count=unplottableItems.length;

return String.substitute(
"<a class='exhibit-action exhibit-views-unplottableCount' href='javascript:void' id='unplottableCountLink'>%0</a> "+
"out of <class class='exhibit-views-totalCount'>%1</span> cannot be plotted.",
[count==1?(count+" result"):(count+" results"),totalCount]
);
};
