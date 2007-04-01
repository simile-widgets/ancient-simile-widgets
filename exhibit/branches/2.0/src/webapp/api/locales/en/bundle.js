

/* collection-summary-widget-l10n.js */

Exhibit.CollectionSummaryWidget.l10n={resetFiltersLabel:"Reset All Filters",resetFiltersTooltip:"Clear all filters and see the original items",resetActionTitle:"Reset all filters",allResultsTemplate:"<span class='%0' ex:field='currentCountSpan'>0</span> <span class='%1' ex:field='typesSpan'>results</span> total.",noResultsTemplate:"<span class='%0'>0</span> <span class='%1' ex:field='typesSpan'>results</span>. (<span ex:field='resetActionLink'></span>)",filteredResultsTemplate:"<span class='%0' ex:field='currentCountSpan'>0</span> <span class='%1' ex:field='typesSpan'>results</span> "+"filtered from <span ex:field='originalCountSpan'>0</span> originally. (<span ex:field='resetActionLink'></span>)"};

/* database-l10n.js */

Exhibit.Database.l10n={itemType:{label:"Item",pluralLabel:"Items"},labelProperty:{label:"label",pluralLabel:"labels",reverseLabel:"label of",reversePluralLabel:"labels of",groupingLabel:"labels",reverseGroupingLabel:"things being labelled"},typeProperty:{label:"type",pluralLabel:"types",reverseLabel:"type of",reversePluralLabel:"types of",groupingLabel:"types",reverseGroupingLabel:"things of these types"},uriProperty:{label:"URI",pluralLabel:"URIs",reverseLabel:"URI of",reversePluralLabel:"URIs of",groupingLabel:"URIs",reverseGroupingLabel:"things named by these URIs"},sortLabels:{"text":{ascending:"a - z",descending:"z - a"},"number":{ascending:"smallest first",descending:"largest first"},"date":{ascending:"earliest first",descending:"latest first"},"boolean":{ascending:"false first",descending:"true first"},"item":{ascending:"a - z",descending:"z - a"}}};

/* exhibit-l10n.js */

Exhibit.l10n={missingLabel:"missing",missingSortKey:"(missing)",notApplicableSortKey:"(n/a)",itemLinkLabel:"link",busyIndicatorMessage:"Working...",showDocumentationMessage:"We will show the relevant documentation after this message.",showJavascriptValidationMessage:"We will explain the error in details after this message.",showJsonValidationMessage:"We will explain the error in details after this message.",showJsonValidationFormMessage:"We will browse to a web service where you can upload and check your code after this message.",badJsonMessage:function(url,e){return"The JSON data file\n  "+url+"\ncontains errors:\n\n"+e;},failedToLoadDataFileMessage:function(url){return"We cannot locate the data file\n  "+url+"\nCheck that the file name is correct.";},copyButtonLabel:"Copy",copyAllButtonLabel:"Copy All",copyDialogBoxCloseButtonLabel:"Close",copyDialogBoxPrompt:"Copy this code to your clipboard as you would copy any text. Press ESC to close this dialog box.",focusDialogBoxCloseButtonLabel:"Close",rdfXmlExporterLabel:"RDF/XML",smwExporterLabel:"Semantic wikitext",exhibitJsonExporterLabel:"Exhibit JSON",tsvExporterLabel:"Tab Separated Values",htmlExporterLabel:"Generated HTML of this view",composeListString:function(a){var s="";for(var i=0;i<a.length;i++){if(i>0){if(i<a.length-1){s+=", ";}else if(a.length<3){s+=" and ";}else{s+=", and ";}}
s+=a[i];}
return s;},createListDelimiter:function(parentElmt,count){var f=function(){if(f.index>0&&f.index<count){if(count>2){parentElmt.appendChild(document.createTextNode((f.index==count-1)?", and ":", "));}else{parentElmt.appendChild(document.createTextNode(" and "));}}
f.index++;};f.index=0;return f;}};

/* lens-l10n.js */

Exhibit.Lens.l10n={editButtonLabel:"Edit",saveButtonLabel:"Save"};

/* list-facet-l10n.js */

Exhibit.ListFacet.l10n={clearSelectionsTooltip:"Clear these selections",ungroupLink:"(un-group)",ungroupAllButton:"un-group all",closeButton:"close",groupByLink:"group by",collapseLink:"collapse",expandLink:"expand",toggleGroupTooltip:"Toggle group",groupByLabel:"Group by",groupTheGroupsByLabel:"Group the groups by"};

/* map-view-l10n.js */

Exhibit.MapView.l10n={viewLabel:"Map",viewTooltip:"View items on a map",mixedLegendKey:"Mixed",colorLegendTitle:"Color Legend",formatMappableCount:function(count){return"Only "+count+" can be plotted on map.";}};

/* numeric-range-facet-l10n.js */

Exhibit.NumericRangeFacet.l10n={clearSelectionsTooltip:"Clear these selections"};

/* ordered-view-frame-l10n.js */

Exhibit.OrderedViewFrame.l10n={thenSortByLabel:"then by...",removeOrderLabel:"Remove this order",formatSortActionTitle:function(propertyLabel,sortLabel){return"Sorted by "+propertyLabel+" ("+sortLabel+")";},formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){return"Removed order by "+propertyLabel+" ("+sortLabel+")";},formatDontShowAll:function(limitCount){return"Show only the first "+limitCount+" results";},formatShowAll:function(count){return"Show all "+count+" results";},createSortingControlsTemplate:function(thenSortByActionLink){return["sorted by: ",{tag:"span",field:"ordersSpan"},"; ",{elmt:thenSortByActionLink,title:"Further sort the items",field:"thenByLink"}];},groupedAsSorted:"grouped as sorted",groupAsSortedActionTitle:"grouped as sorted",ungroupActionTitle:"ungrouped",showDuplicates:"show duplicates",showDuplicatesActionTitle:"show duplicates",hideDuplicatesActionTitle:"hide duplicates"};

/* pivot-table-view-l10n.js */

Exhibit.PivotTableView.l10n={viewLabel:"Scatter Plot",viewTooltip:"View items on a pivot table",formatMappableCount:function(count){return"Only "+count+" can be plotted.";}};

/* scatter-plot-view-l10n.js */

Exhibit.ScatterPlotView.l10n={viewLabel:"Scatter Plot",viewTooltip:"View items on a scatter plot",mixedLegendKey:"Mixed",colorLegendTitle:"Color Legend",formatMappableCount:function(count){return"Only "+count+" can be plotted.";}};

/* tabular-view-l10n.js */

Exhibit.TabularView.l10n={viewLabel:"Table",viewTooltip:"View items in a table",resetActionTitle:"Reset",columnHeaderSortTooltip:"Click to sort by this column",columnHeaderReSortTooltip:"Click to sort in the reverse order",makeSortActionTitle:function(label,ascending){return(ascending?"sorted ascending by ":"sorted descending by ")+label;}};

/* thumbnail-view-l10n.js */

Exhibit.ThumbnailView.l10n={viewLabel:"Thumbnails",viewTooltip:"View items as thumbnails"};

/* tile-view-l10n.js */

Exhibit.TileView.l10n={viewLabel:"Tiles",viewTooltip:"View items as tiles in a list"};

/* timeline-view-l10n.js */

Exhibit.TimelineView.l10n={viewLabel:"Timeline",viewTooltip:"View items on a timeline",colorLegendTitle:"Color Legend",relayoutButtonLabel:"Re-Layout",formatMappableCount:function(count){return"Only "+count+" can be plotted on the timeline.";}};

/* ui-context-l10n.js */

if(!("l10n"in Exhibit.UIContext)){Exhibit.UIContext.l10n={};}
Exhibit.UIContext.l10n["eng"]={initialSettings:{"bubbleWidth":400,"bubbleHeight":300}};

/* view-panel-l10n.js */

Exhibit.ViewPanel.l10n={createSelectViewActionTitle:function(viewLabel){return"select "+viewLabel+" view";},missingViewClassMessage:"The specification for one of the views is missing the viewClass field.",viewClassNotFunctionMessage:function(expr){return"The viewClass attribute value '"+expr+"' you have specified\n"+"for one of the views does not evaluate to a Javascript function.";},badViewClassMessage:function(expr){return"The viewClass attribute value '"+expr+"' you have specified\n"+"for one of the views is not a valid Javascript expression.";}};