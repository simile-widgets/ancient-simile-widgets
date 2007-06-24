

/* database-l10n.js */


Exhibit.Database.l10n={
itemType:{
label:"Sak",
pluralLabel:"Saker"
},
labelProperty:{
label:"etikett",
pluralLabel:"etiketter",
reverseLabel:"etikett till",
reversePluralLabel:"etiketter till",
groupingLabel:"etiketter",
reverseGroupingLabel:"saker med etiketten"
},
typeProperty:{
label:"typ",
pluralLabel:"typer",
reverseLabel:"typ av",
reversePluralLabel:"typer av",
groupingLabel:"typer",
reverseGroupingLabel:"saker av dessa typer"
},
uriProperty:{
label:"URI",
pluralLabel:"URIer",
reverseLabel:"URI f√∂r",
reversePluralLabel:"URIer f√∂r",
groupingLabel:"URIer",
reverseGroupingLabel:"saker med dessa URIer"
},
sortLabels:{
"text":{
ascending:"a - z",
descending:"z - a"
},
"number":{
ascending:"l√§gst f√∂rst",
descending:"h√∂gst f√∂rst"
},
"date":{
ascending:"tidigast f√∂rst",
descending:"nyligast f√∂rst"
},
"boolean":{
ascending:"falskt f√∂rst",
descending:"sant f√∂rst"
},
"item":{
ascending:"a - z",
descending:"z - a"
}
}
};


/* exhibit-l10n.js */



Exhibit.l10n={
missingLabel:"saknas",
missingSortKey:"(saknas)",
notApplicableSortKey:"(n/a)",
itemLinkLabel:"l√§nk",

busyIndicatorMessage:"Arbetar...",
showDocumentationMessage:"Relevant dokumentation kommer visas efter det h√§r meddelandet.",
showJavascriptValidationMessage:"Felet f√∂rklaras mer ing√•ende efter det h√§r meddelandet.",

showJsonValidationMessage:"Felet f√∂rklaras mer ing√•ende efter det h√§r meddelandet.",
showJsonValidationFormMessage:"Vi skickar dig till en webtj√§nst du kan ladda upp din kod till f√∂r fels√∂kning efter det h√§r meddelandet.",

badJsonMessage:function(url,e){
return"JSON-filen\n  "+url+"\ninneh√•ller fel:\n\n"+e;
},
failedToLoadDataFileMessage:function(url){
return"Kunde inte hitta filen\n  "+url+
"\nKontrollera att filnamnet √§r korrekt.";
},


copyButtonLabel:"Kopiera",
copyAllButtonLabel:"Kopiera allt",
copyDialogBoxCloseButtonLabel:"St√§ng",
copyDialogBoxPrompt:
"Kopiera det h√§r till klippbordet precis som du skulle g√∂ra f√∂r annan text. Tryck ESC f√∂r att st√§nga den h√§r dialogen.",


focusDialogBoxCloseButtonLabel:"St√§ng",


rdfXmlExporterLabel:"RDF/XML",
smwExporterLabel:"Semantisk wikitext",
exhibitJsonExporterLabel:"Exhibit JSON",
tsvExporterLabel:"Tabseparerade v√§rden",
htmlExporterLabel:"HTML f√∂r den h√§r vyn",


composeListString:function(a){
var s="";
for(var i=0;i<a.length;i++){
if(i>0){
if(i<a.length-1)
s+=", ";
else
s+=" och ";
}
s+=a[i];
}
return s;
},
createListDelimiter:function(parentElmt,count){
var f=function(){
if(f.index>0&&f.index<count){
parentElmt.appendChild(document.createTextNode(
(f.index==count-1)?" och ":", "));
}
f.index++;
};
f.index=0;

return f;
}
};


/* lens-l10n.js */



Exhibit.Lens.l10n={
editButtonLabel:"Redigera",
saveButtonLabel:"Spara"
};


/* list-facet-l10n.js */



Exhibit.ListFacet.l10n={
clearSelectionsTooltip:"√•ngra dessa val",
ungroupLink:"(avgruppera)",
ungroupAllButton:"avgruppera alla",
closeButton:"st√§ng",
groupByLink:"gruppera efter",
collapseLink:"sl√• samman",
expandLink:"expandera",
toggleGroupTooltip:"sl√• av/p√• grupp",
groupByLabel:"gruppera efter",
groupTheGroupsByLabel:"gruppera grupperna efter"
};


/* numeric-range-facet-l10n.js */



Exhibit.NumericRangeFacet.l10n={
clearSelectionsTooltip:"Clear these selections"
};


/* ordered-view-frame-l10n.js */



Exhibit.OrderedViewFrame.l10n={
thenSortByLabel:"och sedan efter...",
removeOrderLabel:"Ta bort det h√§r sorteringskriteriet",
formatSortActionTitle:function(propertyLabel,sortLabel){
return"Sorterat efter "+propertyLabel+" ("+sortLabel+")";
},
formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){
return"Ta bort sorteringskriteriet "+propertyLabel+" ("+sortLabel+")";
},
resetActionTitle:"√Öterst√§ll",
formatDontShowAll:function(limitCount){
return"Visa bara de f√∂rsta  "+limitCount+" resultaten";
},
formatShowAll:function(count){
return"Visa samtliga "+count+" resultat";
},
createSortingControlsTemplate:function(
thenSortByActionLink
){
return[
"sorterat efter: ",
{tag:"span",
field:"ordersSpan"
},
{tag:"span",
className:"screen",
children:[
"; ",
{elmt:thenSortByActionLink,
title:"sortera ytterligare",
field:"thenByLink"
}
]
}
];
},
groupedAsSorted:"gruppera som de sorterats",
groupAsSortedActionTitle:"grupperade som de sorterats",
ungroupActionTitle:"ogrupperade",

showDuplicates:"visa dubletter",
showDuplicatesActionTitle:"visa dubletter",
hideDuplicatesActionTitle:"g√∂m dubletter"
};


/* tabular-view-l10n.js */



Exhibit.TabularView.l10n={
viewLabel:"Tabell",
viewTooltip:"Visa i tabell",
resetActionTitle:"√Öterst√§ll",

columnHeaderSortTooltip:"Klicka f√∂r att sortera efter den h√§r kolumnen",
columnHeaderReSortTooltip:"Klicka f√∂r att v√§lja omv√§nd ordning",
makeSortActionTitle:function(label,ascending){
return"sortera efter "+(ascending?"stigande ":"fallande ")+
label;
}
};


/* thumbnail-view-l10n.js */



Exhibit.ThumbnailView.l10n={
viewLabel:"Tumnaglar",
viewTooltip:"Visa som tumnaglar"
};


/* tile-view-l10n.js */



Exhibit.TileView.l10n={
viewLabel:"Lista",
viewTooltip:"Visa som lista"
};


/* view-panel-l10n.js */



Exhibit.ViewPanel.l10n={
resetFiltersLabel:"visa alla",
createSelectViewActionTitle:function(viewLabel){
return"v√§lj vyn "+viewLabel;
},
createNoResultsTemplate:function(
countClass,
typesClass,
detailsClass
){
return[
{tag:"span",
className:countClass,
children:["0"]
},
{tag:"span",
className:typesClass,
children:[" resultat"]
},
". ",
{tag:"span",
className:detailsClass,
children:["V√§lj bort n√•gra filter f√∂r fler resultat."]
}
];
},

createResultsSummaryTemplate:function(
countClass,
typesClass,
detailsClass,
resetActionLink
){
return[
{tag:"span",
className:countClass,
field:"itemCountSpan"
},
{tag:"span",
className:typesClass,
field:"typesSpan"
},
{tag:"span",
className:detailsClass,
field:"noFilterDetailsSpan",
style:{display:"none"},
children:["totalt"]
},
{tag:"span",
className:detailsClass,
field:"filteredDetailsSpan",
style:{display:"none"},
children:[
" av ",
{tag:"span",
field:"originalCountSpan"
},
" totalt",
{tag:"span",
className:"screen",
children:[
" (",
{elmt:resetActionLink,
title:"V√§lj bort alla filter och se samtliga"
},
")"
]
}
]
}
];
},

missingViewClassMessage:"Specifikationen f√∂r en av vyerna saknas i f√§ltet viewClass.",
viewClassNotFunctionMessage:function(expr){
return"V√§rdet '"+expr+"' du angivit f√∂r attributet viewClass\n"+
"f√∂r en av dessa vyer var inte namnet p√• en javascriptfunktion.";
},
badViewClassMessage:function(expr){
return"V√§rdet '"+expr+"' du angivit f√∂r attributet viewClass\n"+
"f√∂r en av dessa vyer √§r inte ett giltigt javascriptuttryck.";
}
};
