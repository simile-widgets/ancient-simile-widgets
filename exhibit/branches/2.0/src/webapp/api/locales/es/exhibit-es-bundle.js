

/* database-l10n-spanish.js */


Exhibit.Database.l10n={
itemType:{
label:"Elemento",
pluralLabel:"Elementos"
},
labelProperty:{
label:"etiqueta",
pluralLabel:"etiquetas",
reverseLabel:"etiqueta de",
reversePluralLabel:"etiquetas de",
groupingLabel:"etiquetas",
reverseGroupingLabel:"elementos etiquetados"
},
typeProperty:{
label:"tipo",
pluralLabel:"tipos",
reverseLabel:"tipo de",
reversePluralLabel:"tipos de",
groupingLabel:"tipos",
reverseGroupingLabel:"elementos pertenecientes a esos tipos"
},
uriProperty:{
label:"URI",
pluralLabel:"URIs",
reverseLabel:"URI de",
reversePluralLabel:"URIs de",
groupingLabel:"URIs",
reverseGroupingLabel:"elementos denotados por esas URIs"
},
sortLabels:{
"text":{
ascending:"a - z",
descending:"z - a"
},
"number":{
ascending:"menor primero",
descending:"mayor primero"
},
"date":{
ascending:"la más antigua primero",
descending:"la más reciente primero"
},
"boolean":{
ascending:"falso primero",
descending:"verdadero primero"
},
"item":{
ascending:"a - z",
descending:"z - a"
}
}
};


/* exhibit-l10n-spanish.js */



Exhibit.l10n={
missingLabel:"falta",
missingSortKey:"(falta)",
notApplicableSortKey:"(n/a)",
itemLinkLabel:"link",

busyIndicatorMessage:"Procesando...",
showDocumentationMessage:"Te enseñaremos la documentación asociada después de este mensaje.",
showJavascriptValidationMessage:"Te explicaremos los detalles del error después de este mensaje.",

showJsonValidationMessage:"Te explicaremos los detalles del error después de este mensaje.",
showJsonValidationFormMessage:"Te redirigiremos a un servicio web donde podrás subir y verificar tu código después de este mensaje.",

badJsonMessage:function(url,e){
return"El fichero de datos JSON\n  "+url+"\ncontiene errores:\n\n"+e;
},
failedToLoadDataFileMessage:function(url){
return"No podemos localizar el fichero de datos\n  "+url+"\nComprueba que el nombre del archivo es correcto.";
},


copyButtonLabel:"Copiar",
copyAllButtonLabel:"Copiar todo",
copyDialogBoxCloseButtonLabel:"Cerrar",
copyDialogBoxPrompt:
"Copia este código en tu clipboard como si fuera texto. Pulsa ESC para cerrar este cuadro de diálogo.",


focusDialogBoxCloseButtonLabel:"Cerrar",


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
s+=" y ";
}else{
s+=", y ";
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
(f.index==count-1)?", y ":", "));
}else{
parentElmt.appendChild(document.createTextNode(" y "));
}
}
f.index++;
};
f.index=0;

return f;
}
};


/* lens-l10n-spanish.js */



Exhibit.Lens.l10n={
editButtonLabel:"Editar",
saveButtonLabel:"Salvar"
};


/* list-facet-l10n-spanish.js */



Exhibit.ListFacet.l10n={
clearSelectionsTooltip:"Eliminar estas selecciones",
groupByLink:"agrupar por",
collapseLink:"contraer",
expandLink:"expandir",
toggleGroupTooltip:"Cambiar de grupo",
groupByLabel:"Agrupar por",
groupTheGroupsByLabel:"Agrupar los grupos por"
};


/* numeric-range-facet-l10n.js */



Exhibit.NumericRangeFacet.l10n={
clearSelectionsTooltip:"Clear these selections"
};


/* ordered-view-frame-l10n-spanish.js */



Exhibit.OrderedViewFrame.l10n={
thenSortByLabel:"luego por...",
removeOrderLabel:"Eliminar este orden",
formatSortActionTitle:function(propertyLabel,sortLabel){
return"Ordenados por "+propertyLabel+" ("+sortLabel+")";
},
formatRemoveOrderActionTitle:function(propertyLabel,sortLabel){
return"Eliminar ordenación por "+propertyLabel+" ("+sortLabel+")";
},
resetActionTitle:"Reset",
formatDontShowAll:function(limitCount){
return"Mostrar solamente "+limitCount+" resultados";
},
formatShowAll:function(count){
return"Mostrar "+count+" resultados";
},
createSortingControlsTemplate:function(
thenSortByActionLink
){
return[
"ordenados por: ",
{tag:"span",
field:"ordersSpan"
},
"; ",
{elmt:thenSortByActionLink,
title:"Seguir ordenando elementos",
field:"thenByLink"
}
];
},
groupedAsSorted:"agrupar según orden",
groupAsSortedActionTitle:"agrupar según orden",
ungroupActionTitle:"sin agrupar",

showDuplicates:"mostrar duplicados",
showDuplicatesActionTitle:"mostrar duplicados",
hideDuplicatesActionTitle:"ocultar duplicados"
};

/* tabular-view-l10n-spanish.js */



Exhibit.TabularView.l10n={
viewLabel:"Tabla",
viewTooltip:"Ver elementos como una tabla",
resetActionTitle:"Reset",

columnHeaderSortTooltip:"Click para ordenar por esta columna",
columnHeaderReSortTooltip:"Click para ordenar inversamente",
makeSortActionTitle:function(label,ascending){
return(ascending?"ordenado acendentemente por ":"ordenado descendentemente por ")+label;
}
};


/* thumbnail-view-l10n-spanish.js */



Exhibit.ThumbnailView.l10n={
viewLabel:"Thumbnails",
viewTooltip:"Ver elementos como iconos"
};


/* tile-view-l10n-spanish.js */



Exhibit.TileView.l10n={
viewLabel:"Tiles",
viewTooltip:"Ver elementos en una lista detallada"
};


/* view-panel-l10n-spanish.js */



Exhibit.ViewPanel.l10n={
resetFiltersLabel:"reset",
createSelectViewActionTitle:function(viewLabel){
return"selecciona "+viewLabel+" vista";
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
children:[" resultados"]
},
". ",
{tag:"span",
className:detailsClass,
children:["Elimina algunos filtros para obtener resultados."]
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
children:["total"]
},
{tag:"span",
className:detailsClass,
field:"filteredDetailsSpan",
style:{display:"none"},
children:[
" filtered from ",
{tag:"span",
field:"originalCountSpan"
},
" originally (",
{elmt:resetActionLink,
title:"Elminar todos los filtros, ver elementos iniciales"
},
")"
]
}
];
},

missingViewClassMessage:"En la especificación de una de las vistas falta el campo viewClass.",
viewClassNotFunctionMessage:function(expr){
return" El valor del atributo viewClass '"+expr+"' espeficicado\n"+
"en una de las vistas no se corresponde con una función Javascript.";
},
badViewClassMessage:function(expr){
return"El valor del atributo viewClass '"+expr+"' especificado\n"+
"en una de las vistas no es una expresión Javascript válida.";
}
};
