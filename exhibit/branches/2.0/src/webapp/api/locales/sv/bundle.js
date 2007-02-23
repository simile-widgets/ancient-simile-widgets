

/* browse-engine-l10n.js */

Exhibit.BrowseEngine.l10n={errorParsingFacetExpressionMessage:function(expression){return"Uttrycket '"+expression+"' för att ange facett är ogiltigt.";}};

/* browse-panel-l10n.js */

Exhibit.BrowsePanel.l10n={notConfigureMessage:"Du har inte konfigurerat 'exhibit-browse-panel'.",learnHowMessage:"Hur då?"};

/* control-panel-l10n.js */

Exhibit.ControlPanel.l10n={badExporterExpressionMessage:function(expr){return"Uttrycket '"+expr+"' i attributet ex:exporters\n"+"i <div id=\"exhibit-control-panel\"> refererar inte något\n"+"javascript-objekt.";}};

/* database-l10n.js */

Exhibit.Database.l10n={itemType:{label:"Sak",pluralLabel:"Saker"},labelProperty:{label:"etikett",pluralLabel:"etiketter",reverseLabel:"etikett till",reversePluralLabel:"etiketter till",groupingLabel:"etiketter",reverseGroupingLabel:"saker med etiketten"},typeProperty:{label:"typ",pluralLabel:"typer",reverseLabel:"typ av",reversePluralLabel:"typer av",groupingLabel:"typer",reverseGroupingLabel:"saker av dessa typer"},uriProperty:{label:"URI",pluralLabel:"URIer",reverseLabel:"URI för",reversePluralLabel:"URIer för",groupingLabel:"URIer",reverseGroupingLabel:"saker med dessa URIer"},sortLabels:{"text":{ascending:"a - z",descending:"z - a"},"number":{ascending:"lägst först",descending:"högst först"},"date":{ascending:"tidigast först",descending:"nyligast först"},"boolean":{ascending:"falskt först",descending:"sant först"},"item":{ascending:"a - z",descending:"z - a"}}};

/* exhibit-l10n.js */

Exhibit.l10n={missingLabel:"saknas",missingSortKey:"(saknas)",notApplicableSortKey:"(n/a)",itemLinkLabel:"länk",busyIndicatorMessage:"Arbetar...",showDocumentationMessage:"Relevant dokumentation kommer visas efter det här meddelandet.",showJavascriptValidationMessage:"Felet förklaras mer ingående efter det här meddelandet.",showJsonValidationMessage:"Felet förklaras mer ingående efter det här meddelandet.",showJsonValidationFormMessage:"Vi skickar dig till en webtjänst du kan ladda upp din kod till för felsökning efter det här meddelandet.",badJsonMessage:function(url,e){return"JSON-filen\n  "+url+"\ninnehåller fel:\n\n"+e;},failedToLoadDataFileMessage:function(url){return"Kunde inte hitta filen\n  "+url+"\nKontrollera att filnamnet är korrekt.";},copyButtonLabel:"Kopiera",copyAllButtonLabel:"Kopiera allt",copyDialogBoxCloseButtonLabel:"Stäng",copyDialogBoxPrompt:"Kopiera det här till klippbordet precis som du skulle göra för annan text. Tryck ESC för att stänga den här dialogen.",focusDialogBoxCloseButtonLabel:"Stäng",rdfXmlExporterLabel:"RDF/XML",smwExporterLabel:"Semantisk wikitext",exhibitJsonExporterLabel:"Exhibit JSON",tsvExporterLabel:"Tabseparerade värden",htmlExporterLabel:"HTML för den här vyn",composeListString:function(a){var s="";for(var i=0;i<a.length;i++){if(i>0){if(i<a.length-1)
s+=", ";else
s+=" och ";}
s+=a[i];}
return s;},createListDelimiter:function(parentElmt,count){var f=function(){if(f.index>0&&f.index<count){parentElmt.appendChild(document.createTextNode((f.index==count-1)?" och ":", "));}
f.index++;};f.index=0;return f;}};

/* lens-l10n.js */

Exhibit.Lens.l10n={editButtonLabel:"Redigera",saveButtonLabel:"Spara"};

/* list-facet-l10n.js */

Exhibit.ListFacet.l10n={clearSelectionsTooltip:"ångra dessa val",ungroupLink:"(avgruppera)",ungroupAllButton:"avgruppera alla",closeButton:"stäng",groupByLink:"gruppera efter",collapseLink:"slå samman",expandLink:"expandera",toggleGroupTooltip:"slå av/på grupp",groupByLabel:"gruppera efter",groupTheGroupsByLabel:"gruppera grupperna efter"};

/* map-view-l10n.js */

Exhibit.MapView.l10n={viewLabel:"Karta",viewTooltip:"Visa på karta",mixedLegendKey:"Blandat",colorLegendTitle:"Färgbetydelser",formatMappableCount:function(count){return"Bara "+count+" kunde visas på kartan.";}};

/* ordered-view-frame-l10n.js */

Exhibit.OrderedViewFrame.l10n={thenSortByLabel:"och sedan efter...",removeOrderLabel:"Ta bort det här sorteringskriteriet",formatSortActionTitle:function(propertyLabel,sortLabel){return"Sorterat efter "+propertyLabel+" ("+sortLabel+")";},formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){return"Ta bort sorteringskriteriet "+propertyLabel+" ("+sortLabel+")";},resetActionTitle:"Återställ",formatDontShowAll:function(limitCount){return"Visa bara de första  "+limitCount+" resultaten";},formatShowAll:function(count){return"Visa samtliga "+count+" resultat";},createSortingControlsTemplate:function(thenSortByActionLink){return["sorterat efter: ",{tag:"span",field:"ordersSpan"},{tag:"span",className:"screen",children:["; ",{elmt:thenSortByActionLink,title:"sortera ytterligare",field:"thenByLink"}]}];},groupedAsSorted:"gruppera som de sorterats",groupAsSortedActionTitle:"grupperade som de sorterats",ungroupActionTitle:"ogrupperade",showDuplicates:"visa dubletter",showDuplicatesActionTitle:"visa dubletter",hideDuplicatesActionTitle:"göm dubletter"};

/* tabular-view-l10n.js */

Exhibit.TabularView.l10n={viewLabel:"Tabell",viewTooltip:"Visa i tabell",resetActionTitle:"Återställ",columnHeaderSortTooltip:"Klicka för att sortera efter den här kolumnen",columnHeaderReSortTooltip:"Klicka för att välja omvänd ordning",makeSortActionTitle:function(label,ascending){return"sortera efter "+(ascending?"stigande ":"fallande ")+
label;}};

/* thumbnail-view-l10n.js */

Exhibit.ThumbnailView.l10n={viewLabel:"Tumnaglar",viewTooltip:"Visa som tumnaglar"};

/* tile-view-l10n.js */

Exhibit.TileView.l10n={viewLabel:"Lista",viewTooltip:"Visa som lista"};

/* timeline-view-l10n.js */

Exhibit.TimelineView.l10n={viewLabel:"Tidslinje",viewTooltip:"Visa på tidslinje",colorLegendTitle:"Färgbetydelser",relayoutButtonLabel:"Rita om",formatMappableCount:function(count){return"Bara "+count+" kunde placeras på tidslinjen.";}};

/* view-panel-l10n.js */

Exhibit.ViewPanel.l10n={resetFiltersLabel:"visa alla",createSelectViewActionTitle:function(viewLabel){return"välj vyn "+viewLabel;},createNoResultsTemplate:function(countClass,typesClass,detailsClass){return[{tag:"span",className:countClass,children:["0"]},{tag:"span",className:typesClass,children:[" resultat"]},". ",{tag:"span",className:detailsClass,children:["Välj bort några filter för fler resultat."]}];},createResultsSummaryTemplate:function(countClass,typesClass,detailsClass,resetActionLink){return[{tag:"span",className:countClass,field:"itemCountSpan"},{tag:"span",className:typesClass,field:"typesSpan"},{tag:"span",className:detailsClass,field:"noFilterDetailsSpan",style:{display:"none"},children:["totalt"]},{tag:"span",className:detailsClass,field:"filteredDetailsSpan",style:{display:"none"},children:[" av ",{tag:"span",field:"originalCountSpan"}," totalt",{tag:"span",className:"screen",children:[" (",{elmt:resetActionLink,title:"Välj bort alla filter och se samtliga"},")"]}]}];},missingViewClassMessage:"Specifikationen för en av vyerna saknas i fältet viewClass.",viewClassNotFunctionMessage:function(expr){return"Värdet '"+expr+"' du angivit för attributet viewClass\n"+"för en av dessa vyer var inte namnet på en javascriptfunktion.";},badViewClassMessage:function(expr){return"Värdet '"+expr+"' du angivit för attributet viewClass\n"+"för en av dessa vyer är inte ett giltigt javascriptuttryck.";}};