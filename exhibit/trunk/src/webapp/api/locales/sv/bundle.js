

/* browse-engine-l10n.js */

Exhibit.BrowseEngine.l10n={errorParsingFacetExpressionMessage:function(expression){return"Uttrycket '"+expression+"' f\xF6r att ange facett \xE4r ogiltigt.";}};

/* browse-panel-l10n.js */

Exhibit.BrowsePanel.l10n={notConfigureMessage:"Du har inte konfigurerat 'exhibit-browse-panel'.",learnHowMessage:"Hur d\xE5?"};

/* control-panel-l10n.js */

Exhibit.ControlPanel.l10n={badExporterExpressionMessage:function(expr){return"Uttrycket '"+expr+"' i attributet ex:exporters\n"+"i <div id=\"exhibit-control-panel\"> refererar inte n\xE5got\n"+"javascript-objekt.";}};

/* database-l10n.js */

Exhibit.Database.l10n={itemType:{label:"Sak",pluralLabel:"Saker"},labelProperty:{label:"etikett",pluralLabel:"etiketter",reverseLabel:"etikett till",reversePluralLabel:"etiketter till",groupingLabel:"etiketter",reverseGroupingLabel:"saker med etiketten"},typeProperty:{label:"typ",pluralLabel:"typer",reverseLabel:"typ av",reversePluralLabel:"typer av",groupingLabel:"typer",reverseGroupingLabel:"saker av dessa typer"},uriProperty:{label:"URI",pluralLabel:"URIer",reverseLabel:"URI f\xF6r",reversePluralLabel:"URIer f\xF6r",groupingLabel:"URIer",reverseGroupingLabel:"saker med dessa URIer"},sortLabels:{"text":{ascending:"a - z",descending:"z - a"},"number":{ascending:"l\xE4gst f\xF6rst",descending:"h\xF6gst f\xF6rst"},"date":{ascending:"tidigast f\xF6rst",descending:"nyligast f\xF6rst"},"boolean":{ascending:"falskt f\xF6rst",descending:"sant f\xF6rst"},"item":{ascending:"a - z",descending:"z - a"}}};

/* exhibit-l10n.js */

Exhibit.l10n={missingLabel:"saknas",missingSortKey:"(saknas)",notApplicableSortKey:"(n/a)",itemLinkLabel:"l\xE4nk",busyIndicatorMessage:"Arbetar...",showDocumentationMessage:"Relevant dokumentation kommer visas efter det h\xE4r meddelandet.",showJavascriptValidationMessage:"Felet f\xF6rklaras mer ing\xE5ende efter det h\xE4r meddelandet.",showJsonValidationMessage:"Felet f\xF6rklaras mer ing\xE5ende efter det h\xE4r meddelandet.",showJsonValidationFormMessage:"Vi skickar dig till en webtj\xE4nst du kan ladda upp din kod till f\xF6r fels\xF6kning efter det h\xE4r meddelandet.",badJsonMessage:function(url,e){return"JSON-filen\n  "+url+"\ninneh\xE5ller fel:\n\n"+e;},failedToLoadDataFileMessage:function(url){return"Kunde inte hitta filen\n  "+url+"\nKontrollera att filnamnet \xE4r korrekt.";},copyButtonLabel:"Kopiera",copyAllButtonLabel:"Kopiera allt",copyDialogBoxCloseButtonLabel:"St\xE4ng",copyDialogBoxPrompt:"Kopiera det h\xE4r till klippbordet precis som du skulle g\xF6ra f\xF6r annan text. Tryck ESC f\xF6r att st\xE4nga den h\xE4r dialogen.",focusDialogBoxCloseButtonLabel:"St\xE4ng",rdfXmlExporterLabel:"RDF/XML",smwExporterLabel:"Semantisk wikitext",exhibitJsonExporterLabel:"Exhibit JSON",tsvExporterLabel:"Tabseparerade v\xE4rden",composeListString:function(a){var s="";for(var i=0;i<a.length;i++){if(i>0){if(i<a.length-1)
s+=", ";else
s+=" och ";}
s+=a[i];}
return s;},createListDelimiter:function(parentElmt,count){var f=function(){if(f.index>0&&f.index<count){parentElmt.appendChild(document.createTextNode((f.index==count-1)?" och ":", "));}
f.index++;};f.index=0;return f;}};

/* lens-l10n.js */

Exhibit.Lens.l10n={editButtonLabel:"Redigera",saveButtonLabel:"Spara"};

/* list-facet-l10n.js */

Exhibit.ListFacet.l10n={clearSelectionsTooltip:"\xE5ngra dessa val",groupByLink:"gruppera efter",collapseLink:"sl\xE5 samman",expandLink:"expandera",toggleGroupTooltip:"sl\xE5 av/p\xE5 grupp",groupByLabel:"gruppera efter",groupTheGroupsByLabel:"gruppera grupperna efter"};

/* map-view-l10n.js */

Exhibit.MapView.l10n={viewLabel:"Karta",viewTooltip:"Visa p\xE5 karta",mixedLegendKey:"Blandat",colorLegendTitle:"F\xE4rgbetydelser",formatMappableCount:function(count){return"Bara "+count+" kunde visas p\xE5 kartan.";}};

/* ordered-view-frame-l10n.js */

Exhibit.OrderedViewFrame.l10n={thenSortByLabel:"och sedan efter...",removeOrderLabel:"Ta bort det h\xE4r sorteringskriteriet",formatSortActionTitle:function(propertyLabel,sortLabel){return"Sorterat efter "+propertyLabel+" ("+sortLabel+")";},formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){return"Ta bort sorteringskriteriet "+propertyLabel+" ("+sortLabel+")";},resetActionTitle:"\xC5terst\xE4ll",formatDontShowAll:function(limitCount){return"Visa bara de f\xF6rsta  "+limitCount+" resultaten";},formatShowAll:function(count){return"Visa samtliga "+count+" result";},createSortingControlsTemplate:function(thenSortByActionLink){return["sorterat efter: ",{tag:"span",field:"ordersSpan"},"; ",{elmt:thenSortByActionLink,title:"sortera ytterligare",field:"thenByLink"}];},groupedAsSorted:"gruppera som de sorterats",groupAsSortedActionTitle:"grupperade som de sorterats",ungroupActionTitle:"ogrupperade",showDuplicates:"visa dubletter",showDuplicatesActionTitle:"visa dubletter",hideDuplicatesActionTitle:"g\xF6m dubletter"};

/* tabular-view-l10n.js */

Exhibit.TabularView.l10n={viewLabel:"Tabell",viewTooltip:"Visa i tabell",resetActionTitle:"\xC5terst\xE4ll",columnHeaderSortTooltip:"Klicka f\xF6r att sortera efter den h\xE4r kolumnen",columnHeaderReSortTooltip:"Klicka f\xF6r att v\xE4lja omv\xE4nd ordning",makeSortActionTitle:function(label,ascending){return"sortera efter "+(ascending?"stigande ":"fallande ")+
label;}};

/* thumbnail-view-l10n.js */

Exhibit.ThumbnailView.l10n={viewLabel:"Tumnaglar",viewTooltip:"Visa som tumnaglar"};

/* tile-view-l10n.js */

Exhibit.TileView.l10n={viewLabel:"Lista",viewTooltip:"Visa som lista"};

/* timeline-view-l10n.js */

Exhibit.TimelineView.l10n={viewLabel:"Tidslinje",viewTooltip:"Visa p\xE5 tidslinje",colorLegendTitle:"F\xE4rgbetydelser",relayoutButtonLabel:"Rita om",formatMappableCount:function(count){return"Bara "+count+" kunde placeras p\xE5 tidslinjen.";}};

/* view-panel-l10n.js */

Exhibit.ViewPanel.l10n={resetFiltersLabel:"\xE5terst\xE4ll",createSelectViewActionTitle:function(viewLabel){return"v\xE4lj vyn "+viewLabel;},createNoResultsTemplate:function(countClass,typesClass,detailsClass){return[{tag:"span",className:countClass,children:["0"]},{tag:"span",className:typesClass,children:[" resultat"]},". ",{tag:"span",className:detailsClass,children:["V\xE4lj bort n\xE5gra filter f\xF6r fler resultat."]}];},createResultsSummaryTemplate:function(countClass,typesClass,detailsClass,resetActionLink){return[{tag:"span",className:countClass,field:"itemCountSpan"},{tag:"span",className:typesClass,field:"typesSpan"},{tag:"span",className:detailsClass,field:"noFilterDetailsSpan",style:{display:"none"},children:["totalt"]},{tag:"span",className:detailsClass,field:"filteredDetailsSpan",style:{display:"none"},children:[" filtrerade fr\xE5n ",{tag:"span",field:"originalCountSpan"}," av ursprungliga (",{elmt:resetActionLink,title:"V\xE4lj bort alla filter och se samtliga"},")"]}];},missingViewClassMessage:"Specifikationen f\xF6r en av vyerna saknas i f\xE4ltet viewClass.",viewClassNotFunctionMessage:function(expr){return"V\xE4rdet '"+expr+"' du angivit f\xF6r attributet viewClass\n"+"f\xF6r en av dessa vyer var inte namnet p\xE5 en javascriptfunktion.";},badViewClassMessage:function(expr){return"V\xE4rdet '"+expr+"' du angivit f\xF6r attributet viewClass\n"+"f\xF6r en av dessa vyer \xE4r inte ett giltigt javascriptuttryck.";}};

/* browse-engine-l10n.js */

Exhibit.BrowseEngine.l10n={errorParsingFacetExpressionMessage:function(expression){return"Uttrycket '"+expression+"' f\xF6r att ange facett \xE4r ogiltigt.";}};

/* browse-panel-l10n.js */

Exhibit.BrowsePanel.l10n={notConfigureMessage:"Du har inte konfigurerat 'exhibit-browse-panel'.",learnHowMessage:"Hur d\xE5?"};

/* control-panel-l10n.js */

Exhibit.ControlPanel.l10n={badExporterExpressionMessage:function(expr){return"Uttrycket '"+expr+"' i attributet ex:exporters\n"+"i <div id=\"exhibit-control-panel\"> refererar inte n\xE5got\n"+"javascript-objekt.";}};

/* database-l10n.js */

Exhibit.Database.l10n={itemType:{label:"Sak",pluralLabel:"Saker"},labelProperty:{label:"etikett",pluralLabel:"etiketter",reverseLabel:"etikett till",reversePluralLabel:"etiketter till",groupingLabel:"etiketter",reverseGroupingLabel:"saker med etiketten"},typeProperty:{label:"typ",pluralLabel:"typer",reverseLabel:"typ av",reversePluralLabel:"typer av",groupingLabel:"typer",reverseGroupingLabel:"saker av dessa typer"},uriProperty:{label:"URI",pluralLabel:"URIer",reverseLabel:"URI f\xF6r",reversePluralLabel:"URIer f\xF6r",groupingLabel:"URIer",reverseGroupingLabel:"saker med dessa URIer"},sortLabels:{"text":{ascending:"a - z",descending:"z - a"},"number":{ascending:"l\xE4gst f\xF6rst",descending:"h\xF6gst f\xF6rst"},"date":{ascending:"tidigast f\xF6rst",descending:"nyligast f\xF6rst"},"boolean":{ascending:"falskt f\xF6rst",descending:"sant f\xF6rst"},"item":{ascending:"a - z",descending:"z - a"}}};

/* exhibit-l10n.js */

Exhibit.l10n={missingLabel:"saknas",missingSortKey:"(saknas)",notApplicableSortKey:"(n/a)",itemLinkLabel:"l\xE4nk",busyIndicatorMessage:"Arbetar...",showDocumentationMessage:"Relevant dokumentation kommer visas efter det h\xE4r meddelandet.",showJavascriptValidationMessage:"Felet f\xF6rklaras mer ing\xE5ende efter det h\xE4r meddelandet.",showJsonValidationMessage:"Felet f\xF6rklaras mer ing\xE5ende efter det h\xE4r meddelandet.",showJsonValidationFormMessage:"Vi skickar dig till en webtj\xE4nst du kan ladda upp din kod till f\xF6r fels\xF6kning efter det h\xE4r meddelandet.",badJsonMessage:function(url,e){return"JSON-filen\n  "+url+"\ninneh\xE5ller fel:\n\n"+e;},failedToLoadDataFileMessage:function(url){return"Kunde inte hitta filen\n  "+url+"\nKontrollera att filnamnet \xE4r korrekt.";},copyButtonLabel:"Kopiera",copyAllButtonLabel:"Kopiera allt",copyDialogBoxCloseButtonLabel:"St\xE4ng",copyDialogBoxPrompt:"Kopiera det h\xE4r till klippbordet precis som du skulle g\xF6ra f\xF6r annan text. Tryck ESC f\xF6r att st\xE4nga den h\xE4r dialogen.",focusDialogBoxCloseButtonLabel:"St\xE4ng",rdfXmlExporterLabel:"RDF/XML",smwExporterLabel:"Semantisk wikitext",exhibitJsonExporterLabel:"Exhibit JSON",tsvExporterLabel:"Tabseparerade v\xE4rden",composeListString:function(a){var s="";for(var i=0;i<a.length;i++){if(i>0){if(i<a.length-1)
s+=", ";else
s+=" och ";}
s+=a[i];}
return s;},createListDelimiter:function(parentElmt,count){var f=function(){if(f.index>0&&f.index<count){parentElmt.appendChild(document.createTextNode((f.index==count-1)?" och ":", "));}
f.index++;};f.index=0;return f;}};

/* lens-l10n.js */

Exhibit.Lens.l10n={editButtonLabel:"Redigera",saveButtonLabel:"Spara"};

/* list-facet-l10n.js */

Exhibit.ListFacet.l10n={clearSelectionsTooltip:"\xE5ngra dessa val",groupByLink:"gruppera efter",collapseLink:"sl\xE5 samman",expandLink:"expandera",toggleGroupTooltip:"sl\xE5 av/p\xE5 grupp",groupByLabel:"gruppera efter",groupTheGroupsByLabel:"gruppera grupperna efter"};

/* map-view-l10n.js */

Exhibit.MapView.l10n={viewLabel:"Karta",viewTooltip:"Visa p\xE5 karta",mixedLegendKey:"Blandat",colorLegendTitle:"F\xE4rgbetydelser",formatMappableCount:function(count){return"Bara "+count+" kunde visas p\xE5 kartan.";}};

/* ordered-view-frame-l10n.js */

Exhibit.OrderedViewFrame.l10n={thenSortByLabel:"och sedan efter...",removeOrderLabel:"Ta bort det h\xE4r sorteringskriteriet",formatSortActionTitle:function(propertyLabel,sortLabel){return"Sorterat efter "+propertyLabel+" ("+sortLabel+")";},formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){return"Ta bort sorteringskriteriet "+propertyLabel+" ("+sortLabel+")";},resetActionTitle:"\xC5terst\xE4ll",formatDontShowAll:function(limitCount){return"Visa bara de f\xF6rsta  "+limitCount+" resultaten";},formatShowAll:function(count){return"Visa samtliga "+count+" result";},createSortingControlsTemplate:function(thenSortByActionLink){return["sorterat efter: ",{tag:"span",field:"ordersSpan"},"; ",{elmt:thenSortByActionLink,title:"sortera ytterligare",field:"thenByLink"}];},groupedAsSorted:"gruppera som de sorterats",groupAsSortedActionTitle:"grupperade som de sorterats",ungroupActionTitle:"ogrupperade",showDuplicates:"visa dubletter",showDuplicatesActionTitle:"visa dubletter",hideDuplicatesActionTitle:"g\xF6m dubletter"};

/* tabular-view-l10n.js */

Exhibit.TabularView.l10n={viewLabel:"Tabell",viewTooltip:"Visa i tabell",resetActionTitle:"\xC5terst\xE4ll",columnHeaderSortTooltip:"Klicka f\xF6r att sortera efter den h\xE4r kolumnen",columnHeaderReSortTooltip:"Klicka f\xF6r att v\xE4lja omv\xE4nd ordning",makeSortActionTitle:function(label,ascending){return"sortera efter "+(ascending?"stigande ":"fallande ")+
label;}};

/* thumbnail-view-l10n.js */

Exhibit.ThumbnailView.l10n={viewLabel:"Tumnaglar",viewTooltip:"Visa som tumnaglar"};

/* tile-view-l10n.js */

Exhibit.TileView.l10n={viewLabel:"Lista",viewTooltip:"Visa som lista"};

/* timeline-view-l10n.js */

Exhibit.TimelineView.l10n={viewLabel:"Tidslinje",viewTooltip:"Visa p\xE5 tidslinje",colorLegendTitle:"F\xE4rgbetydelser",relayoutButtonLabel:"Rita om",formatMappableCount:function(count){return"Bara "+count+" kunde placeras p\xE5 tidslinjen.";}};

/* view-panel-l10n.js */

Exhibit.ViewPanel.l10n={resetFiltersLabel:"\xE5terst\xE4ll",createSelectViewActionTitle:function(viewLabel){return"v\xE4lj vyn "+viewLabel;},createNoResultsTemplate:function(countClass,typesClass,detailsClass){return[{tag:"span",className:countClass,children:["0"]},{tag:"span",className:typesClass,children:[" resultat"]},". ",{tag:"span",className:detailsClass,children:["V\xE4lj bort n\xE5gra filter f\xF6r fler resultat."]}];},createResultsSummaryTemplate:function(countClass,typesClass,detailsClass,resetActionLink){return[{tag:"span",className:countClass,field:"itemCountSpan"},{tag:"span",className:typesClass,field:"typesSpan"},{tag:"span",className:detailsClass,field:"noFilterDetailsSpan",style:{display:"none"},children:["totalt"]},{tag:"span",className:detailsClass,field:"filteredDetailsSpan",style:{display:"none"},children:[" filtrerade fr\xE5n ",{tag:"span",field:"originalCountSpan"}," av ursprungliga (",{elmt:resetActionLink,title:"V\xE4lj bort alla filter och se samtliga"},")"]}];},missingViewClassMessage:"Specifikationen f\xF6r en av vyerna saknas i f\xE4ltet viewClass.",viewClassNotFunctionMessage:function(expr){return"V\xE4rdet '"+expr+"' du angivit f\xF6r attributet viewClass\n"+"f\xF6r en av dessa vyer var inte namnet p\xE5 en javascriptfunktion.";},badViewClassMessage:function(expr){return"V\xE4rdet '"+expr+"' du angivit f\xF6r attributet viewClass\n"+"f\xF6r en av dessa vyer \xE4r inte ett giltigt javascriptuttryck.";}};