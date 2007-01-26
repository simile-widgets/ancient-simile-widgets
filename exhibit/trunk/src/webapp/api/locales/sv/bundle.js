

/* browse-engine-l10n.js */

Exhibit.BrowseEngine.l10n={errorParsingFacetExpressionMessage:function(expression){return"Uttrycket '"+expression+"' fÃ¶r att ange facett Ã¤r ogiltigt.";}};

/* browse-panel-l10n.js */

Exhibit.BrowsePanel.l10n={notConfigureMessage:"Du har inte konfigurerat 'exhibit-browse-panel'.",learnHowMessage:"Hur dÃ¥?"};

/* control-panel-l10n.js */

Exhibit.ControlPanel.l10n={badExporterExpressionMessage:function(expr){return"Uttrycket '"+expr+"' i attributet ex:exporters\n"+"i <div id=\"exhibit-control-panel\"> refererar inte nÃ¥got\n"+"javascript-objekt.";}};

/* database-l10n.js */

Exhibit.Database.l10n={itemType:{label:"Sak",pluralLabel:"Saker"},labelProperty:{label:"etikett",pluralLabel:"etiketter",reverseLabel:"etikett till",reversePluralLabel:"etiketter till",groupingLabel:"etiketter",reverseGroupingLabel:"saker med etiketten"},typeProperty:{label:"typ",pluralLabel:"typer",reverseLabel:"typ av",reversePluralLabel:"typer av",groupingLabel:"typer",reverseGroupingLabel:"saker av dessa typer"},uriProperty:{label:"URI",pluralLabel:"URIer",reverseLabel:"URI fÃ¶r",reversePluralLabel:"URIer fÃ¶r",groupingLabel:"URIer",reverseGroupingLabel:"saker med dessa URIer"},sortLabels:{"text":{ascending:"a - z",descending:"z - a"},"number":{ascending:"lÃ¤gst fÃ¶rst",descending:"hÃ¶gst fÃ¶rst"},"date":{ascending:"tidigast fÃ¶rst",descending:"nyligast fÃ¶rst"},"boolean":{ascending:"falskt fÃ¶rst",descending:"sant fÃ¶rst"},"item":{ascending:"a - z",descending:"z - a"}}};

/* exhibit-l10n.js */

Exhibit.l10n={missingLabel:"saknas",missingSortKey:"(saknas)",notApplicableSortKey:"(n/a)",itemLinkLabel:"lÃ¤nk",busyIndicatorMessage:"Arbetar...",showDocumentationMessage:"Relevant dokumentation kommer visas efter det hÃ¤r meddelandet.",showJavascriptValidationMessage:"Felet fÃ¶rklaras mer ingÃ¥ende efter det hÃ¤r meddelandet.",showJsonValidationMessage:"Felet fÃ¶rklaras mer ingÃ¥ende efter det hÃ¤r meddelandet.",showJsonValidationFormMessage:"Vi skickar dig till en webtjÃ¤nst du kan ladda upp din kod till fÃ¶r felsÃ¶kning efter det hÃ¤r meddelandet.",badJsonMessage:function(url,e){return"JSON-filen\n  "+url+"\ninnehÃ¥ller fel:\n\n"+e;},failedToLoadDataFileMessage:function(url){return"Kunde inte hitta filen\n  "+url+"\nKontrollera att filnamnet Ã¤r korrekt.";},copyButtonLabel:"Kopiera",copyAllButtonLabel:"Kopiera allt",copyDialogBoxCloseButtonLabel:"StÃ¤ng",copyDialogBoxPrompt:"Kopiera det hÃ¤r till klippbordet precis som du skulle gÃ¶ra fÃ¶r annan text. Tryck ESC fÃ¶r att stÃ¤nga den hÃ¤r dialogen.",focusDialogBoxCloseButtonLabel:"StÃ¤ng",rdfXmlExporterLabel:"RDF/XML",smwExporterLabel:"Semantisk wikitext",exhibitJsonExporterLabel:"Exhibit JSON",tsvExporterLabel:"Tabseparerade vÃ¤rden",composeListString:function(a){var s="";for(var i=0;i<a.length;i++){if(i>0){if(i<a.length-1)
s+=", ";else
s+=" och ";}
s+=a[i];}
return s;},createListDelimiter:function(parentElmt,count){var f=function(){if(f.index>0&&f.index<count){parentElmt.appendChild(document.createTextNode((f.index==count-1)?" och ":", "));}
f.index++;};f.index=0;return f;}};

/* lens-l10n.js */

Exhibit.Lens.l10n={editButtonLabel:"Redigera",saveButtonLabel:"Spara"};

/* list-facet-l10n.js */

Exhibit.ListFacet.l10n={clearSelectionsTooltip:"Ã¥ngra dessa val",groupByLink:"gruppera efter",collapseLink:"slÃ¥ samman",expandLink:"expandera",toggleGroupTooltip:"slÃ¥ av/pÃ¥ grupp",groupByLabel:"gruppera efter",groupTheGroupsByLabel:"gruppera grupperna efter"};

/* map-view-l10n.js */

Exhibit.MapView.l10n={viewLabel:"Karta",viewTooltip:"Visa pÃ¥ karta",mixedLegendKey:"Blandat",colorLegendTitle:"FÃ¤rgbetydelser",formatMappableCount:function(count){return"Bara "+count+" kunde visas pÃ¥ kartan.";}};

/* ordered-view-frame-l10n.js */

Exhibit.OrderedViewFrame.l10n={thenSortByLabel:"och sedan efter...",removeOrderLabel:"Ta bort det hÃ¤r sorteringskriteriet",formatSortActionTitle:function(propertyLabel,sortLabel){return"Sorterat efter "+propertyLabel+" ("+sortLabel+")";},formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){return"Ta bort sorteringskriteriet "+propertyLabel+" ("+sortLabel+")";},resetActionTitle:"Ã…terstÃ¤ll",formatDontShowAll:function(limitCount){return"Visa bara de fÃ¶rsta  "+limitCount+" resultaten";},formatShowAll:function(count){return"Visa samtliga "+count+" result";},createSortingControlsTemplate:function(thenSortByActionLink){return["sorterat efter: ",{tag:"span",field:"ordersSpan"},"; ",{elmt:thenSortByActionLink,title:"sortera ytterligare",field:"thenByLink"}];},groupedAsSorted:"gruppera som de sorterats",groupAsSortedActionTitle:"grupperade som de sorterats",ungroupActionTitle:"ogrupperade",showDuplicates:"visa dubletter",showDuplicatesActionTitle:"visa dubletter",hideDuplicatesActionTitle:"gÃ¶m dubletter"};

/* tabular-view-l10n.js */

Exhibit.TabularView.l10n={viewLabel:"Tabell",viewTooltip:"Visa i tabell",resetActionTitle:"Ã…terstÃ¤ll",columnHeaderSortTooltip:"Klicka fÃ¶r att sortera efter den hÃ¤r kolumnen",columnHeaderReSortTooltip:"Klicka fÃ¶r att vÃ¤lja omvÃ¤nd ordning",makeSortActionTitle:function(label,ascending){return"sortera efter "+(ascending?"stigande ":"fallande ")+
label;}};

/* thumbnail-view-l10n.js */

Exhibit.ThumbnailView.l10n={viewLabel:"Tumnaglar",viewTooltip:"Visa som tumnaglar"};

/* tile-view-l10n.js */

Exhibit.TileView.l10n={viewLabel:"Lista",viewTooltip:"Visa som lista"};

/* timeline-view-l10n.js */

Exhibit.TimelineView.l10n={viewLabel:"Tidslinje",viewTooltip:"Visa pÃ¥ tidslinje",colorLegendTitle:"FÃ¤rgbetydelser",relayoutButtonLabel:"Rita om",formatMappableCount:function(count){return"Bara "+count+" kunde placeras pÃ¥ tidslinjen.";}};

/* view-panel-l10n.js */

Exhibit.ViewPanel.l10n={resetFiltersLabel:"visa alla",createSelectViewActionTitle:function(viewLabel){return"vÃ¤lj vyn "+viewLabel;},createNoResultsTemplate:function(countClass,typesClass,detailsClass){return[{tag:"span",className:countClass,children:["0"]},{tag:"span",className:typesClass,children:[" resultat"]},". ",{tag:"span",className:detailsClass,children:["VÃ¤lj bort nÃ¥gra filter fÃ¶r fler resultat."]}];},createResultsSummaryTemplate:function(countClass,typesClass,detailsClass,resetActionLink){return[{tag:"span",className:countClass,field:"itemCountSpan"},{tag:"span",className:typesClass,field:"typesSpan"},{tag:"span",className:detailsClass,field:"noFilterDetailsSpan",style:{display:"none"},children:["totalt"]},{tag:"span",className:detailsClass,field:"filteredDetailsSpan",style:{display:"none"},children:[" av ",{tag:"span",field:"originalCountSpan"}," totalt (",{elmt:resetActionLink,title:"VÃ¤lj bort alla filter och se samtliga"},")"]}];},missingViewClassMessage:"Specifikationen fÃ¶r en av vyerna saknas i fÃ¤ltet viewClass.",viewClassNotFunctionMessage:function(expr){return"VÃ¤rdet '"+expr+"' du angivit fÃ¶r attributet viewClass\n"+"fÃ¶r en av dessa vyer var inte namnet pÃ¥ en javascriptfunktion.";},badViewClassMessage:function(expr){return"VÃ¤rdet '"+expr+"' du angivit fÃ¶r attributet viewClass\n"+"fÃ¶r en av dessa vyer Ã¤r inte ett giltigt javascriptuttryck.";}};

/* browse-engine-l10n.js */

Exhibit.BrowseEngine.l10n={errorParsingFacetExpressionMessage:function(expression){return"Uttrycket '"+expression+"' fÃ¶r att ange facett Ã¤r ogiltigt.";}};

/* browse-panel-l10n.js */

Exhibit.BrowsePanel.l10n={notConfigureMessage:"Du har inte konfigurerat 'exhibit-browse-panel'.",learnHowMessage:"Hur dÃ¥?"};

/* control-panel-l10n.js */

Exhibit.ControlPanel.l10n={badExporterExpressionMessage:function(expr){return"Uttrycket '"+expr+"' i attributet ex:exporters\n"+"i <div id=\"exhibit-control-panel\"> refererar inte nÃ¥got\n"+"javascript-objekt.";}};

/* database-l10n.js */

Exhibit.Database.l10n={itemType:{label:"Sak",pluralLabel:"Saker"},labelProperty:{label:"etikett",pluralLabel:"etiketter",reverseLabel:"etikett till",reversePluralLabel:"etiketter till",groupingLabel:"etiketter",reverseGroupingLabel:"saker med etiketten"},typeProperty:{label:"typ",pluralLabel:"typer",reverseLabel:"typ av",reversePluralLabel:"typer av",groupingLabel:"typer",reverseGroupingLabel:"saker av dessa typer"},uriProperty:{label:"URI",pluralLabel:"URIer",reverseLabel:"URI fÃ¶r",reversePluralLabel:"URIer fÃ¶r",groupingLabel:"URIer",reverseGroupingLabel:"saker med dessa URIer"},sortLabels:{"text":{ascending:"a - z",descending:"z - a"},"number":{ascending:"lÃ¤gst fÃ¶rst",descending:"hÃ¶gst fÃ¶rst"},"date":{ascending:"tidigast fÃ¶rst",descending:"nyligast fÃ¶rst"},"boolean":{ascending:"falskt fÃ¶rst",descending:"sant fÃ¶rst"},"item":{ascending:"a - z",descending:"z - a"}}};

/* exhibit-l10n.js */

Exhibit.l10n={missingLabel:"saknas",missingSortKey:"(saknas)",notApplicableSortKey:"(n/a)",itemLinkLabel:"lÃ¤nk",busyIndicatorMessage:"Arbetar...",showDocumentationMessage:"Relevant dokumentation kommer visas efter det hÃ¤r meddelandet.",showJavascriptValidationMessage:"Felet fÃ¶rklaras mer ingÃ¥ende efter det hÃ¤r meddelandet.",showJsonValidationMessage:"Felet fÃ¶rklaras mer ingÃ¥ende efter det hÃ¤r meddelandet.",showJsonValidationFormMessage:"Vi skickar dig till en webtjÃ¤nst du kan ladda upp din kod till fÃ¶r felsÃ¶kning efter det hÃ¤r meddelandet.",badJsonMessage:function(url,e){return"JSON-filen\n  "+url+"\ninnehÃ¥ller fel:\n\n"+e;},failedToLoadDataFileMessage:function(url){return"Kunde inte hitta filen\n  "+url+"\nKontrollera att filnamnet Ã¤r korrekt.";},copyButtonLabel:"Kopiera",copyAllButtonLabel:"Kopiera allt",copyDialogBoxCloseButtonLabel:"StÃ¤ng",copyDialogBoxPrompt:"Kopiera det hÃ¤r till klippbordet precis som du skulle gÃ¶ra fÃ¶r annan text. Tryck ESC fÃ¶r att stÃ¤nga den hÃ¤r dialogen.",focusDialogBoxCloseButtonLabel:"StÃ¤ng",rdfXmlExporterLabel:"RDF/XML",smwExporterLabel:"Semantisk wikitext",exhibitJsonExporterLabel:"Exhibit JSON",tsvExporterLabel:"Tabseparerade vÃ¤rden",composeListString:function(a){var s="";for(var i=0;i<a.length;i++){if(i>0){if(i<a.length-1)
s+=", ";else
s+=" och ";}
s+=a[i];}
return s;},createListDelimiter:function(parentElmt,count){var f=function(){if(f.index>0&&f.index<count){parentElmt.appendChild(document.createTextNode((f.index==count-1)?" och ":", "));}
f.index++;};f.index=0;return f;}};

/* lens-l10n.js */

Exhibit.Lens.l10n={editButtonLabel:"Redigera",saveButtonLabel:"Spara"};

/* list-facet-l10n.js */

Exhibit.ListFacet.l10n={clearSelectionsTooltip:"Ã¥ngra dessa val",groupByLink:"gruppera efter",collapseLink:"slÃ¥ samman",expandLink:"expandera",toggleGroupTooltip:"slÃ¥ av/pÃ¥ grupp",groupByLabel:"gruppera efter",groupTheGroupsByLabel:"gruppera grupperna efter"};

/* map-view-l10n.js */

Exhibit.MapView.l10n={viewLabel:"Karta",viewTooltip:"Visa pÃ¥ karta",mixedLegendKey:"Blandat",colorLegendTitle:"FÃ¤rgbetydelser",formatMappableCount:function(count){return"Bara "+count+" kunde visas pÃ¥ kartan.";}};

/* ordered-view-frame-l10n.js */

Exhibit.OrderedViewFrame.l10n={thenSortByLabel:"och sedan efter...",removeOrderLabel:"Ta bort det hÃ¤r sorteringskriteriet",formatSortActionTitle:function(propertyLabel,sortLabel){return"Sorterat efter "+propertyLabel+" ("+sortLabel+")";},formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){return"Ta bort sorteringskriteriet "+propertyLabel+" ("+sortLabel+")";},resetActionTitle:"Ã…terstÃ¤ll",formatDontShowAll:function(limitCount){return"Visa bara de fÃ¶rsta  "+limitCount+" resultaten";},formatShowAll:function(count){return"Visa samtliga "+count+" result";},createSortingControlsTemplate:function(thenSortByActionLink){return["sorterat efter: ",{tag:"span",field:"ordersSpan"},"; ",{elmt:thenSortByActionLink,title:"sortera ytterligare",field:"thenByLink"}];},groupedAsSorted:"gruppera som de sorterats",groupAsSortedActionTitle:"grupperade som de sorterats",ungroupActionTitle:"ogrupperade",showDuplicates:"visa dubletter",showDuplicatesActionTitle:"visa dubletter",hideDuplicatesActionTitle:"gÃ¶m dubletter"};

/* tabular-view-l10n.js */

Exhibit.TabularView.l10n={viewLabel:"Tabell",viewTooltip:"Visa i tabell",resetActionTitle:"Ã…terstÃ¤ll",columnHeaderSortTooltip:"Klicka fÃ¶r att sortera efter den hÃ¤r kolumnen",columnHeaderReSortTooltip:"Klicka fÃ¶r att vÃ¤lja omvÃ¤nd ordning",makeSortActionTitle:function(label,ascending){return"sortera efter "+(ascending?"stigande ":"fallande ")+
label;}};

/* thumbnail-view-l10n.js */

Exhibit.ThumbnailView.l10n={viewLabel:"Tumnaglar",viewTooltip:"Visa som tumnaglar"};

/* tile-view-l10n.js */

Exhibit.TileView.l10n={viewLabel:"Lista",viewTooltip:"Visa som lista"};

/* timeline-view-l10n.js */

Exhibit.TimelineView.l10n={viewLabel:"Tidslinje",viewTooltip:"Visa pÃ¥ tidslinje",colorLegendTitle:"FÃ¤rgbetydelser",relayoutButtonLabel:"Rita om",formatMappableCount:function(count){return"Bara "+count+" kunde placeras pÃ¥ tidslinjen.";}};

/* view-panel-l10n.js */

Exhibit.ViewPanel.l10n={resetFiltersLabel:"visa alla",createSelectViewActionTitle:function(viewLabel){return"vÃ¤lj vyn "+viewLabel;},createNoResultsTemplate:function(countClass,typesClass,detailsClass){return[{tag:"span",className:countClass,children:["0"]},{tag:"span",className:typesClass,children:[" resultat"]},". ",{tag:"span",className:detailsClass,children:["VÃ¤lj bort nÃ¥gra filter fÃ¶r fler resultat."]}];},createResultsSummaryTemplate:function(countClass,typesClass,detailsClass,resetActionLink){return[{tag:"span",className:countClass,field:"itemCountSpan"},{tag:"span",className:typesClass,field:"typesSpan"},{tag:"span",className:detailsClass,field:"noFilterDetailsSpan",style:{display:"none"},children:["totalt"]},{tag:"span",className:detailsClass,field:"filteredDetailsSpan",style:{display:"none"},children:[" av ",{tag:"span",field:"originalCountSpan"}," totalt (",{elmt:resetActionLink,title:"VÃ¤lj bort alla filter och se samtliga"},")"]}];},missingViewClassMessage:"Specifikationen fÃ¶r en av vyerna saknas i fÃ¤ltet viewClass.",viewClassNotFunctionMessage:function(expr){return"VÃ¤rdet '"+expr+"' du angivit fÃ¶r attributet viewClass\n"+"fÃ¶r en av dessa vyer var inte namnet pÃ¥ en javascriptfunktion.";},badViewClassMessage:function(expr){return"VÃ¤rdet '"+expr+"' du angivit fÃ¶r attributet viewClass\n"+"fÃ¶r en av dessa vyer Ã¤r inte ett giltigt javascriptuttryck.";}};