

/* collection.js */


Exhibit.Collection=function(id,database){
this._id=id;
this._database=database;

this._listeners=new SimileAjax.ListenerQueue();
this._facets=[];
this._updating=false;

this._items=null;
this._restrictedItems=null;

var self=this;
this._listener={
onAfterLoadingItems:function(){
self._update();
}
};
database.addListener(this._listener);
};

Exhibit.Collection.create=function(id,configuration,database){
var collection=new Exhibit.Collection(id,database);

if("itemTypes"in configuration){
collection._itemTypes=configuration.itemTypes;
collection._update=Exhibit.Collection._typeBasedCollection_update;
}else{
collection._update=Exhibit.Collection._allItemsCollection_update;
}

collection._update();

return collection;
};

Exhibit.Collection.createFromDOM=function(id,elmt,database){
var collection=new Exhibit.Collection(id,database);

var itemTypes=Exhibit.getAttribute(elmt,"itemTypes",",");
if(itemTypes!=null&&itemTypes.length>0){
collection._itemTypes=itemTypes;
collection._update=Exhibit.Collection._typeBasedCollection_update;
}else{
collection._update=Exhibit.Collection._allItemsCollection_update;
}

collection._update();

return collection;
};

Exhibit.Collection.createAllItemsCollection=function(id,database){
var collection=new Exhibit.Collection(id,database);

collection._update=Exhibit.Collection._allItemsCollection_update;
collection._update();

return collection;
};


Exhibit.Collection._allItemsCollection_update=function(){
this._items=this._database.getAllItems();
this._onRootItemsChanged();
};

Exhibit.Collection._typeBasedCollection_update=function(){
var newItems=new Exhibit.Set();
for(var i=0;i<this._itemTypes.length;i++){
this._database.getSubjects(this._itemTypes[i],"type",newItems);
}

this._items=newItems;
this._onRootItemsChanged();
};

Exhibit.Collection.prototype.getID=function(){
return this._id;
};

Exhibit.Collection.prototype.dispose=function(){
this._database.removeListener(this._listener);
this._database=null;
};

Exhibit.Collection.prototype.addListener=function(listener){
this._listeners.add(listener);
};

Exhibit.Collection.prototype.removeListener=function(listener){
this._listeners.remove(listener);
};

Exhibit.Collection.prototype.addFacet=function(facet){
this._facets.push(facet);

if(facet.hasRestrictions()){
this._computeRestrictedItems();
this._updateFacets(null);
this._listeners.fire("onItemsChanged",[]);
}else{
facet.update(this.getRestrictedItems());
}
};

Exhibit.Collection.prototype.removeFacet=function(facet){
for(var i=0;i<this._facets.length;i++){
if(facet==this._facets[i]){
this._facets.splice(i,1);
if(facet.hasRestrictions()){
this._computeRestrictedItems();
this._updateFacets(null);
this._listeners.fire("onItemsChanged",[]);
}
break;
}
}
};

Exhibit.Collection.prototype.clearAllRestrictions=function(){
var restrictions=[];

this._updating=true;
for(var i=0;i<this._facets.length;i++){
restrictions.push(this._facets[i].clearAllRestrictions());
}
this._updating=false;

this.onFacetUpdated(null);

return restrictions;
};

Exhibit.Collection.prototype.applyRestrictions=function(restrictions){
this._updating=true;
for(var i=0;i<this._facets.length;i++){
this._facets[i].applyRestrictions(restrictions[i]);
}
this._updating=false;

this.onFacetUpdated(null);
};

Exhibit.Collection.prototype.getAllItems=function(){
return new Exhibit.Set(this._items);
};

Exhibit.Collection.prototype.countAllItems=function(){
return this._items.size();
};

Exhibit.Collection.prototype.getRestrictedItems=function(){
return new Exhibit.Set(this._restrictedItems);
};

Exhibit.Collection.prototype.countRestrictedItems=function(){
return this._restrictedItems.size();
};

Exhibit.Collection.prototype.onFacetUpdated=function(facetChanged){
if(!this._updating){
this._computeRestrictedItems();
this._updateFacets(facetChanged);
this._listeners.fire("onItemsChanged",[]);
}
}

Exhibit.Collection.prototype._onRootItemsChanged=function(){
this._listeners.fire("onRootItemsChanged",[]);

this._computeRestrictedItems();
this._updateFacets(null);

this._listeners.fire("onItemsChanged",[]);
};

Exhibit.Collection.prototype._updateFacets=function(facetChanged){
var restrictedFacetCount=0;
for(var i=0;i<this._facets.length;i++){
if(this._facets[i].hasRestrictions()){
restrictedFacetCount++;
}
}

for(var i=0;i<this._facets.length;i++){
var facet=this._facets[i];
if(facet.hasRestrictions()){
if(restrictedFacetCount<=1){
facet.update(this.getAllItems());
}else{
var items=this.getAllItems();
for(var j=0;j<this._facets.length;j++){
if(i!=j){
items=this._facets[j].restrict(items);
}
}
facet.update(items);
}
}else{
facet.update(this.getRestrictedItems());
}
}
};

Exhibit.Collection.prototype._computeRestrictedItems=function(){
this._restrictedItems=this._items;
for(var i=0;i<this._facets.length;i++){
var facet=this._facets[i];
if(facet.hasRestrictions()){
this._restrictedItems=facet.restrict(this._restrictedItems);
}
}
};


/* controls.js */


Exhibit.Controls={};

Exhibit.Controls["if"]={
f:function(
args,
roots,
rootValueTypes,
defaultRootName,
database
){
var conditionCollection=args[0].evaluate(roots,rootValueTypes,defaultRootName,database);
var condition=false;
conditionCollection.forEachValue(function(v){
if(v){
condition=true;
return true;
}
});

if(condition){
return args[1].evaluate(roots,rootValueTypes,defaultRootName,database);
}else{
return args[2].evaluate(roots,rootValueTypes,defaultRootName,database);
}
}
};

Exhibit.Controls["foreach"]={
f:function(
args,
roots,
rootValueTypes,
defaultRootName,
database
){
var collection=args[0].evaluate(roots,rootValueTypes,defaultRootName,database);

var oldValue=roots["value"];
var oldValueType=rootValueTypes["value"];
rootValueTypes["value"]=collection.valueType;

var results=[];
var valueType="text";

collection.forEachValue(function(element){
roots["value"]=element;

var collection2=args[1].evaluate(roots,rootValueTypes,defaultRootName,database);
valueType=collection2.valueType;

collection2.forEachValue(function(result){
results.push(result);
});
});

roots["value"]=oldValue;
rootValueTypes["value"]=oldValueType;

return new Exhibit.Expression._Collection(results,valueType);
}
};

Exhibit.Controls["default"]={
f:function(
args,
roots,
rootValueTypes,
defaultRootName,
database
){
for(var i=0;i<args.length;i++){
var collection=args[i].evaluate(roots,rootValueTypes,defaultRootName,database);
if(collection.size>0){
return collection;
}
}
return new Exhibit.Expression._Collection([],"text");
}
};


/* database.js */



Exhibit.Database=new Object();

Exhibit.Database.create=function(){
return new Exhibit.Database._Impl();
};


Exhibit.Database._Impl=function(){
this._types={};
this._properties={};
this._propertyArray={};

this._listeners=new SimileAjax.ListenerQueue();

this._spo={};
this._ops={};
this._items=new Exhibit.Set();



var l10n=Exhibit.Database.l10n;

var itemType=new Exhibit.Database._Type("Item");
itemType._custom=Exhibit.Database.l10n.itemType;
this._types["Item"]=itemType;

var labelProperty=new Exhibit.Database._Property("label");
labelProperty._uri="http://www.w3.org/2000/01/rdf-schema#label";
labelProperty._valueType="text";
labelProperty._label=l10n.labelProperty.label;
labelProperty._pluralLabel=l10n.labelProperty.pluralLabel;
labelProperty._reverseLabel=l10n.labelProperty.reverseLabel;
labelProperty._reversePluralLabel=l10n.labelProperty.reversePluralLabel;
labelProperty._groupingLabel=l10n.labelProperty.groupingLabel;
labelProperty._reverseGroupingLabel=l10n.labelProperty.reverseGroupingLabel;
this._properties["label"]=labelProperty;

var typeProperty=new Exhibit.Database._Property("type");
typeProperty._uri="http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
typeProperty._valueType="text";
typeProperty._label="type";
typeProperty._pluralLabel=l10n.typeProperty.label;
typeProperty._reverseLabel=l10n.typeProperty.reverseLabel;
typeProperty._reversePluralLabel=l10n.typeProperty.reversePluralLabel;
typeProperty._groupingLabel=l10n.typeProperty.groupingLabel;
typeProperty._reverseGroupingLabel=l10n.typeProperty.reverseGroupingLabel;
this._properties["type"]=typeProperty;

var uriProperty=new Exhibit.Database._Property("uri");
uriProperty._uri="http://simile.mit.edu/2006/11/exhibit#uri";
uriProperty._valueType="url";
uriProperty._label="URI";
uriProperty._pluralLabel="URIs";
uriProperty._reverseLabel="URI of";
uriProperty._reversePluralLabel="URIs of";
uriProperty._groupingLabel="URIs";
uriProperty._reverseGroupingLabel="things named by these URIs";
this._properties["uri"]=uriProperty;
};

Exhibit.Database._Impl.prototype.createDatabase=function(){
return Exhibit.Database.create();
};

Exhibit.Database._Impl.prototype.addListener=function(listener){
this._listeners.add(listener);
};

Exhibit.Database._Impl.prototype.removeListener=function(listener){
this._listeners.remove(listener);
};

Exhibit.Database._Impl.prototype.loadDataLinks=function(fDone){
var links=[];
var heads=document.documentElement.getElementsByTagName("head");
for(var h=0;h<heads.length;h++){
var linkElmts=heads[h].getElementsByTagName("link");
for(var l=0;l<linkElmts.length;l++){
var link=linkElmts[l];
if(link.rel.match(/\bexhibit\/data\b/)){
links.push(link);
}
}
}

this._loadLinks(links,fDone);
};

Exhibit.Database._Impl.prototype._loadLinks=function(links,fDone){
links=[].concat(links);
var database=this;
var fNext=function(){
while(links.length>0){
var link=links.shift();
var type=link.type;
if(type==null||type.length==0){
type="application/json";
}

var importer=Exhibit.importers[type];
if(importer){
importer.load(link,database,fNext);
return;
}else{
SimileAjax.Debug.log("No importer for data of type "+type);
}
}

if(fDone!=null){
fDone();
}
};
fNext();
};

Exhibit.Database._Impl.prototype.loadData=function(o,baseURI){
if(typeof baseURI=="undefined"){
baseURI=location.href;
}
if("types"in o){
this.loadTypes(o.types,baseURI);
}
if("properties"in o){
this.loadProperties(o.properties,baseURI);
}
if("items"in o){
this.loadItems(o.items,baseURI);
}
};

Exhibit.Database._Impl.prototype.loadTypes=function(typeEntries,baseURI){
this._listeners.fire("onBeforeLoadingTypes",[]);
try{
var lastChar=baseURI.substr(baseURI.length-1)
if(lastChar=="#"){
baseURI=baseURI.substr(0,baseURI.length-1)+"/";
}else if(lastChar!="/"&&lastChar!=":"){
baseURI+="/";
}

for(var typeID in typeEntries){
if(typeof typeID!="string"){
continue;
}

var typeEntry=typeEntries[typeID];
if(typeof typeEntry!="object"){
continue;
}

var type;
if(typeID in this._types){
type=this._types[typeID];
}else{
type=new Exhibit.Database._Type(typeID);
this._types[typeID]=type;
};

for(var p in typeEntry){
type._custom[p]=typeEntry[p];
}

if(!("uri"in type._custom)){
type._custom["uri"]=baseURI+"type#"+encodeURIComponent(typeID);
}
if(!("label"in type._custom)){
type._custom["label"]=typeID;
}
}

this._listeners.fire("onAfterLoadingTypes",[]);
}catch(e){
SimileAjax.Debug.exception(e,"Database.loadTypes failed");
}
};

Exhibit.Database._Impl.prototype.loadProperties=function(propertyEntries,baseURI){
this._listeners.fire("onBeforeLoadingProperties",[]);
try{
var lastChar=baseURI.substr(baseURI.length-1)
if(lastChar=="#"){
baseURI=baseURI.substr(0,baseURI.length-1)+"/";
}else if(lastChar!="/"&&lastChar!=":"){
baseURI+="/";
}

for(var propertyID in propertyEntries){
if(typeof propertyID!="string"){
continue;
}

var propertyEntry=propertyEntries[propertyID];
if(typeof propertyEntry!="object"){
continue;
}

var property;
if(propertyID in this._properties){
property=this._properties[propertyID];
}else{
property=new Exhibit.Database._Property(propertyID,this);
this._properties[propertyID]=property;
};

property._uri=("uri"in propertyEntry)?propertyEntry.uri:(baseURI+"property#"+encodeURIComponent(propertyID));
property._valueType=("valueType"in propertyEntry)?propertyEntry.valueType:"text";


property._label=("label"in propertyEntry)?propertyEntry.label:propertyID;
property._pluralLabel=("pluralLabel"in propertyEntry)?propertyEntry.pluralLabel:property._label;

property._reverseLabel=("reverseLabel"in propertyEntry)?propertyEntry.reverseLabel:("!"+property._label);
property._reversePluralLabel=("reversePluralLabel"in propertyEntry)?propertyEntry.reversePluralLabel:("!"+property._pluralLabel);

property._groupingLabel=("groupingLabel"in propertyEntry)?propertyEntry.groupingLabel:property._label;
property._reverseGroupingLabel=("reverseGroupingLabel"in propertyEntry)?propertyEntry.reverseGroupingLabel:property._reverseLabel;

if("origin"in propertyEntry){
property._origin=propertyEntry.origin;
}
}
this._propertyArray=null;

this._listeners.fire("onAfterLoadingProperties",[]);
}catch(e){
SimileAjax.Debug.exception(e,"Database.loadProperties failed");
}
};

Exhibit.Database._Impl.prototype.loadItems=function(itemEntries,baseURI){
this._listeners.fire("onBeforeLoadingItems",[]);
try{
var lastChar=baseURI.substr(baseURI.length-1);
if(lastChar=="#"){
baseURI=baseURI.substr(0,baseURI.length-1)+"/";
}else if(lastChar!="/"&&lastChar!=":"){
baseURI+="/";
}

var spo=this._spo;
var ops=this._ops;
var indexPut=Exhibit.Database._indexPut;
var indexTriple=function(s,p,o){
indexPut(spo,s,p,o);
indexPut(ops,o,p,s);
};

for(var i=0;i<itemEntries.length;i++){
var entry=itemEntries[i];
if(typeof entry=="object"){
this._loadItem(entry,indexTriple,baseURI);
}
}

this._propertyArray=null;

this._listeners.fire("onAfterLoadingItems",[]);
}catch(e){
SimileAjax.Debug.exception(e,"Database.loadItems failed");
}
};

Exhibit.Database._Impl.prototype.getType=function(typeID){
return this._types[typeID];
};

Exhibit.Database._Impl.prototype.getProperty=function(propertyID){
return propertyID in this._properties?this._properties[propertyID]:null;
};


Exhibit.Database._Impl.prototype.getAllProperties=function(){
if(this._propertyArray==null){
this._propertyArray=[];
for(var propertyID in this._properties){
this._propertyArray.push(propertyID);
}
}

return[].concat(this._propertyArray);
};

Exhibit.Database._Impl.prototype.getAllItems=function(){
var items=new Exhibit.Set();
items.addSet(this._items);

return items;
};

Exhibit.Database._Impl.prototype.getAllItemsCount=function(){
return this._items.size();
};

Exhibit.Database._Impl.prototype.containsItem=function(itemID){
return this._items.contains(itemID);
};

Exhibit.Database._Impl.prototype.getNamespaces=function(idToQualifiedName,prefixToBase){
var bases={};
for(var propertyID in this._properties){
var property=this._properties[propertyID];
var uri=property.getURI();

var hash=uri.indexOf("#");
if(hash>0){
var base=uri.substr(0,hash+1);
bases[base]=true;

idToQualifiedName[propertyID]={
base:base,
localName:uri.substr(hash+1)
};
continue;
}

var slash=uri.lastIndexOf("/");
if(slash>0){
var base=uri.substr(0,slash+1);
bases[base]=true;

idToQualifiedName[propertyID]={
base:base,
localName:uri.substr(slash+1)
};
continue;
}
}

var baseToPrefix={};
var letters="abcdefghijklmnopqrstuvwxyz";
var i=0;

for(var base in bases){
var prefix=letters.substr(i++,1);
prefixToBase[prefix]=base;
baseToPrefix[base]=prefix;
}

for(var propertyID in idToQualifiedName){
var qname=idToQualifiedName[propertyID];
qname.prefix=baseToPrefix[qname.base];
}
};

Exhibit.Database._Impl.prototype._loadItem=function(itemEntry,indexFunction,baseURI){
if(!("label"in itemEntry)&&!("id"in itemEntry)){
SimileAjax.Debug.warn("Item entry has no label and no id: "+
SimileAjax.JSON.toJSONString(itemEntry));
return;
}

var id;
if(!("label"in itemEntry)){
id=itemEntry.id;
if(!this._items.contains(id)){
SimileAjax.Debug.warn("Cannot add new item containing no label: "+
SimileAjax.JSON.toJSONString(itemEntry));
}
}else{
var label=itemEntry.label;
var id=("id"in itemEntry)?itemEntry.id:label;
var uri=("uri"in itemEntry)?itemEntry.uri:(baseURI+"item#"+encodeURIComponent(id));
var type=("type"in itemEntry)?itemEntry.type:"Item";

var isArray=function(obj){
if(obj.constructor.toString().indexOf("Array")==-1)
return false;
else
return true;
}
if(isArray(label))
label=label[0];
if(isArray(id))
id=id[0];
if(isArray(uri))
uri=uri[0];
if(isArray(type))
type=type[0];

this._items.add(id);

indexFunction(id,"uri",uri);
indexFunction(id,"label",label);
indexFunction(id,"type",type);

this._ensureTypeExists(type,baseURI);
}

for(var p in itemEntry){
if(typeof p!="string"){
continue;
}

if(p!="uri"&&p!="label"&&p!="id"&&p!="type"){
this._ensurePropertyExists(p,baseURI)._onNewData();

var v=itemEntry[p];
if(v instanceof Array){
for(var j=0;j<v.length;j++){
indexFunction(id,p,v[j]);
}
}else if(v!=undefined&&v!=null){
indexFunction(id,p,v);
}
}
}
};

Exhibit.Database._Impl.prototype._ensureTypeExists=function(typeID,baseURI){
if(!(typeID in this._types)){
var type=new Exhibit.Database._Type(typeID);

type._custom["uri"]=baseURI+"type#"+encodeURIComponent(typeID);
type._custom["label"]=typeID;

this._types[typeID]=type;
}
};

Exhibit.Database._Impl.prototype._ensurePropertyExists=function(propertyID,baseURI){
if(!(propertyID in this._properties)){
var property=new Exhibit.Database._Property(propertyID);

property._uri=baseURI+"property#"+encodeURIComponent(propertyID);
property._valueType="text";

property._label=propertyID;
property._pluralLabel=property._label;

property._reverseLabel="reverse of "+property._label;
property._reversePluralLabel="reverse of "+property._pluralLabel;

property._groupingLabel=property._label;
property._reverseGroupingLabel=property._reverseLabel;

this._properties[propertyID]=property;

return property;
}else{
return this._properties[propertyID];
}
};

Exhibit.Database._indexPut=function(index,x,y,z){
var hash=index[x];
if(!hash){
hash={};
index[x]=hash;
}

var array=hash[y];
if(!array){
array=new Array();
hash[y]=array;
}else{
for(var i=0;i<array.length;i++){
if(z==array[i]){
return;
}
}
}
array.push(z);
};

Exhibit.Database._indexPutList=function(index,x,y,list){
var hash=index[x];
if(!hash){
hash={};
index[x]=hash;
}

var array=hash[y];
if(!array){
hash[y]=list;
}else{
hash[y]=hash[y].concat(list);
}
};

Exhibit.Database._indexRemove=function(index,x,y,z){
var hash=index[x];
if(!hash){
return false;
}

var array=hash[y];
if(!array){
return false;
}

for(var i=0;i<array.length;i++){
if(z==array[i]){
array.splice(i,1);
if(array.length==0){
delete hash[y];
}
return true;
}
}
};

Exhibit.Database._indexRemoveList=function(index,x,y){
var hash=index[x];
if(!hash){
return null;
}

var array=hash[y];
if(!array){
return null;
}

delete hash[y];
return array;
};

Exhibit.Database._Impl.prototype._indexFillSet=function(index,x,y,set,filter){
var hash=index[x];
if(hash){
var array=hash[y];
if(array){
if(filter){
for(var i=0;i<array.length;i++){
var z=array[i];
if(filter.contains(z)){
set.add(z);
}
}
}else{
for(var i=0;i<array.length;i++){
set.add(array[i]);
}
}
}
}
};

Exhibit.Database._Impl.prototype._indexCountDistinct=function(index,x,y,filter){
var count=0;
var hash=index[x];
if(hash){
var array=hash[y];
if(array){
if(filter){
for(var i=0;i<array.length;i++){
if(filter.contains(array[i])){
count++;
}
}
}else{
count=array.length;
}
}
}
return count;
};

Exhibit.Database._Impl.prototype._get=function(index,x,y,set,filter){
if(!set){
set=new Exhibit.Set();
}
this._indexFillSet(index,x,y,set,filter);
return set;
};

Exhibit.Database._Impl.prototype._getUnion=function(index,xSet,y,set,filter){
if(!set){
set=new Exhibit.Set();
}

var database=this;
xSet.visit(function(x){
database._indexFillSet(index,x,y,set,filter);
});
return set;
};

Exhibit.Database._Impl.prototype._countDistinctUnion=function(index,xSet,y,filter){
var count=0;
var database=this;
xSet.visit(function(x){
count+=database._indexCountDistinct(index,x,y,filter);
});
return count;
};

Exhibit.Database._Impl.prototype._countDistinct=function(index,x,y,filter){
return this._indexCountDistinct(index,x,y,filter);
};

Exhibit.Database._Impl.prototype._getProperties=function(index,x){
var hash=index[x];
var properties=[]
if(hash){
for(var p in hash){
properties.push(p);
}
}
return properties;
};

Exhibit.Database._Impl.prototype.getObjects=function(s,p,set,filter){
return this._get(this._spo,s,p,set,filter);
};

Exhibit.Database._Impl.prototype.countDistinctObjects=function(s,p,filter){
return this._countDistinct(this._spo,s,p,filter);
};

Exhibit.Database._Impl.prototype.getObjectsUnion=function(subjects,p,set,filter){
return this._getUnion(this._spo,subjects,p,set,filter);
};

Exhibit.Database._Impl.prototype.countDistinctObjectsUnion=function(subjects,p,filter){
return this._countDistinctUnion(this._spo,subjects,p,filter);
};

Exhibit.Database._Impl.prototype.getSubjects=function(o,p,set,filter){
return this._get(this._ops,o,p,set,filter);
};

Exhibit.Database._Impl.prototype.countDistinctSubjects=function(o,p,filter){
return this._countDistinct(this._ops,o,p,filter);
};

Exhibit.Database._Impl.prototype.getSubjectsUnion=function(objects,p,set,filter){
return this._getUnion(this._ops,objects,p,set,filter);
};

Exhibit.Database._Impl.prototype.countDistinctSubjectsUnion=function(objects,p,filter){
return this._countDistinctUnion(this._ops,objects,p,filter);
};

Exhibit.Database._Impl.prototype.getObject=function(s,p){
var hash=this._spo[s];
if(hash){
var array=hash[p];
if(array){
return array[0];
}
}
return null;
};

Exhibit.Database._Impl.prototype.getSubject=function(o,p){
var hash=this._ops[o];
if(hash){
var array=hash[p];
if(array){
return array[0];
}
}
return null;
};

Exhibit.Database._Impl.prototype.getForwardProperties=function(s){
return this._getProperties(this._spo,s);
};

Exhibit.Database._Impl.prototype.getBackwardProperties=function(o){
return this._getProperties(this._ops,o);
};

Exhibit.Database._Impl.prototype.getSubjectsInRange=function(p,min,max,inclusive,set,filter){
var property=this.getProperty(p);
if(property!=null){
var rangeIndex=property.getRangeIndex();
if(rangeIndex!=null){
return rangeIndex.getSubjectsInRange(min,max,inclusive,set,filter);
}
}
return(!set)?new Exhibit.Set():set;
};

Exhibit.Database._Impl.prototype.getTypeIDs=function(set){
return this.getObjectsUnion(set,"type",null,null);
};

Exhibit.Database._Impl.prototype.addStatement=function(s,p,o){
var indexPut=Exhibit.Database._indexPut;
indexPut(this._spo,s,p,o);
indexPut(this._ops,o,p,s);
};

Exhibit.Database._Impl.prototype.removeStatement=function(s,p,o){
var indexRemove=Exhibit.Database._indexRemove;
var removedObject=indexRemove(this._spo,s,p,o);
var removedSubject=indexRemove(this._ops,o,p,s);
return removedObject||removedSubject;
};

Exhibit.Database._Impl.prototype.removeObjects=function(s,p){
var indexRemove=Exhibit.Database._indexRemove;
var indexRemoveList=Exhibit.Database._indexRemoveList;
var objects=indexRemoveList(this._spo,s,p);
if(objects==null){
return false;
}else{
for(var i=0;i<objects.length;i++){
indexRemove(this._ops,objects[i],p,s);
}
return true;
}
};

Exhibit.Database._Impl.prototype.removeSubjects=function(o,p){
var indexRemove=Exhibit.Database._indexRemove;
var indexRemoveList=Exhibit.Database._indexRemoveList;
var subjects=indexRemoveList(this._ops,o,p);
if(subjects==null){
return false;
}else{
for(var i=0;i<subjects.length;i++){
indexRemove(this._spo,subjects[i],p,o);
}
return true;
}
};


Exhibit.Database._Type=function(id){
this._id=id;
this._custom={};
};

Exhibit.Database._Type.prototype={
getID:function(){return this._id;},
getURI:function(){return this._custom["uri"];},
getLabel:function(){return this._custom["label"];},
getOrigin:function(){return this._custom["origin"];},
getProperty:function(p){return this._custom[p];}
};


Exhibit.Database._Property=function(id,database){
this._id=id;
this._database=database;
this._rangeIndex=null;
};

Exhibit.Database._Property.prototype={
getID:function(){return this._id;},
getURI:function(){return this._uri;},
getValueType:function(){return this._valueType;},

getLabel:function(){return this._label;},
getPluralLabel:function(){return this._pluralLabel;},
getReverseLabel:function(){return this._reverseLabel;},
getReversePluralLabel:function(){return this._reversePluralLabel;},
getGroupingLabel:function(){return this._groupingLabel;},
getGroupingPluralLabel:function(){return this._groupingPluralLabel;},
getOrigin:function(){return this._origin;}
};

Exhibit.Database._Property.prototype._onNewData=function(){
this._rangeIndex=null;
};

Exhibit.Database._Property.prototype.getRangeIndex=function(){
if(this._rangeIndex==null){
this._buildRangeIndex();
}
return this._rangeIndex;
};

Exhibit.Database._Property.prototype._buildRangeIndex=function(){
var getter;
var database=this._database;
var p=this._id;

switch(this.getValueType()){
case"number":
getter=function(item,f){
database.getObjects(item,p,null,null).visit(function(value){
if(typeof value!="number"){
value=parseFloat(value);
}
if(!isNaN(value)){
f(value);
}
});
};
break;
case"date":
getter=function(item,f){
database.getObjects(item,p,null,null).visit(function(value){
if(value!=null&&!(value instanceof Date)){
value=SimileAjax.DateTime.parseIso8601DateTime(value);
}
if(value instanceof Date){
f(value.getTime());
}
});
};
break;
default:
getter=function(item,f){};
}

this._rangeIndex=new Exhibit.Database._RangeIndex(
this._database.getAllItems(),
getter
);
};


Exhibit.Database._RangeIndex=function(items,getter){
pairs=[];
items.visit(function(item){
getter(item,function(value){
pairs.push({item:item,value:value});
});
});

pairs.sort(function(p1,p2){
var c=p1.value-p2.value;
return c!=0?c:p1.item.localeCompare(p2.item);
});

this._pairs=pairs;
};

Exhibit.Database._RangeIndex.prototype.getCount=function(){
return this._pairs.count();
};

Exhibit.Database._RangeIndex.prototype.getMin=function(){
return this._pairs.length>0?
this._pairs[0].value:
Number.POSITIVE_INFINITY;
};

Exhibit.Database._RangeIndex.prototype.getMax=function(){
return this._pairs.length>0?
this._pairs[this._pairs.length-1].value:
Number.NEGATIVE_INFINITY;
};

Exhibit.Database._RangeIndex.prototype.getRange=function(visitor,min,max,inclusive){
var startIndex=this._indexOf(min);
var pairs=this._pairs;
var l=pairs.length;

inclusive=(inclusive);
while(startIndex<l){
var pair=pairs[startIndex++];
var value=pair.value;
if(value<max||(value==max&&inclusive)){
visitor(pair.item);
}else{
break;
}
}
};

Exhibit.Database._RangeIndex.prototype.getSubjectsInRange=function(min,max,inclusive,set,filter){
if(!set){
set=new Exhibit.Set();
}

var f=(filter!=null)?
function(item){
if(filter.contains(item)){
set.add(item);
}
}:
function(item){
set.add(item);
};

this.getRange(f,min,max,inclusive);

return set;
};

Exhibit.Database._RangeIndex.prototype.countRange=function(min,max,inclusive){
var startIndex=this._indexOf(min);
var endIndex=this._indexOf(max);

if(inclusive){
var pairs=this._pairs;
var l=pairs.length;
while(endIndex<l){
if(pairs[endIndex].value==max){
endIndex++;
}else{
break;
}
}
}
return endIndex-startIndex;
};

Exhibit.Database._RangeIndex.prototype._indexOf=function(v){
var pairs=this._pairs;
if(pairs.length==0||pairs[0].value>=v){
return 0;
}

var from=0;
var to=pairs.length;
while(from+1<to){
var middle=(from+to)>>1;
var v2=pairs[middle].value;
if(v2>=v){
to=middle;
}else{
from=middle;
}
}

return to;
};


/* bibtex-exporter.js */



Exhibit.BibtexExporter={
getLabel:function(){
return"Bibtex";
},
_excludeProperties:{
"pub-type":true,
"type":true,
"uri":true,
"key":true
}
};

Exhibit.BibtexExporter.exportOne=function(itemID,database){
return Exhibit.BibtexExporter._wrap(
Exhibit.BibtexExporter._exportOne(itemID,database));
};

Exhibit.BibtexExporter.exportMany=function(set,database){
var s="";
set.visit(function(itemID){
s+=Exhibit.BibtexExporter._exportOne(itemID,database)+"\n";
});
return Exhibit.BibtexExporter._wrap(s);
};

Exhibit.BibtexExporter._exportOne=function(itemID,database){
var s="";
var type=database.getObject(itemID,"pub-type");
var key=database.getObject(itemID,"key");
s+="@"+type+"{"+(key!=null?key:itemID)+"\n";

var allProperties=database.getAllProperties();
for(var i=0;i<allProperties.length;i++){
var propertyID=allProperties[i];
var property=database.getProperty(propertyID);
var values=database.getObjects(itemID,propertyID);
var valueType=property.getValueType();

if(values.size()>0&&!(propertyID in Exhibit.BibtexExporter._excludeProperties)){
s+="\t"+(propertyID=="label"?"title":propertyID)+" = \"";

var strings;
if(valueType=="item"){
strings=[];
values.visit(function(value){
strings.push(database.getObject(value,"label"));
});
}else{
if(valueType=="url"){
strings=[];
values.visit(function(value){
strings.push(Exhibit.Persistence.resolveURL(value));
});
}else{
strings=values.toArray();
}
}

s+=strings.join(" and ")+"\",\n";
}
}
s+="\torigin = \""+Exhibit.Persistence.getItemLink(itemID)+"\"\n";
s+="}\n";

return s;
};

Exhibit.BibtexExporter._wrap=function(s){
return s;
}

/* exhibit-json-exporter.js */



Exhibit.ExhibitJsonExporter={
getLabel:function(){
return Exhibit.l10n.exhibitJsonExporterLabel;
}
};

Exhibit.ExhibitJsonExporter.exportOne=function(itemID,database){
return Exhibit.ExhibitJsonExporter._wrap(
Exhibit.ExhibitJsonExporter._exportOne(itemID,database)+"\n");
};

Exhibit.ExhibitJsonExporter.exportMany=function(set,database){
var s="";
var size=set.size();
var count=0;
set.visit(function(itemID){
s+=Exhibit.ExhibitJsonExporter._exportOne(itemID,database)+((count++<size-1)?",\n":"\n");
});
return Exhibit.ExhibitJsonExporter._wrap(s);
};

Exhibit.ExhibitJsonExporter._exportOne=function(itemID,database){
function quote(s){
if(/[\\\x00-\x1F\x22]/.test(s)){
return'"'+s.replace(/([\\\x00-\x1f\x22])/g,function(a,b){
var c={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f',
'\r':'\\r','"':'\\"','\\':'\\\\'}[b];
if(c){
return c;
}
c=b.charCodeAt();
return'\\x'+
Math.floor(c/16).toString(16)+
(c%16).toString(16);
})+'"';
}
return'"'+s+'"';
}
var s="";
var uri=database.getObject(itemID,"uri");

s+="  {\"id\":"+quote(itemID)+",\n";

var allProperties=database.getAllProperties();

for(var i=0;i<allProperties.length;i++){
var propertyID=allProperties[i];
var property=database.getProperty(propertyID);
var values=database.getObjects(itemID,propertyID);
var valueType=property.getValueType();

if(values.size()>0){
var array;
if(valueType=="url"){
array=[];
values.visit(function(value){
array.push(Exhibit.Persistence.resolveURL(value));
});
}else{
array=values.toArray();
}

s+="   "+quote(propertyID)+":";
if(array.length==1){
s+=quote(array[0]);
}else{
s+="[";
for(var j=0;j<array.length;j++){
s+=(j>0?",":"")+quote(array[j]);
}
s+="]";
}
s+=",\n";
}
}
s+="   \"origin\":"+quote(Exhibit.Persistence.getItemLink(itemID))+"\n";
s+="  }";

return s;
};

Exhibit.ExhibitJsonExporter._wrap=function(s){
return"{\n"+
" \"items\":[\n"+
s+
" ]\n"+
"}";
}


/* rdf-xml-exporter.js */



Exhibit.RdfXmlExporter={
getLabel:function(){
return Exhibit.l10n.rdfXmlExporterLabel;
}
};

Exhibit.RdfXmlExporter.exportOne=function(itemID,database){
var propertyIDToQualifiedName={};
var prefixToBase={};
database.getNamespaces(propertyIDToQualifiedName,prefixToBase);

return Exhibit.RdfXmlExporter._wrapRdf(
Exhibit.RdfXmlExporter._exportOne(
itemID,
database,
propertyIDToQualifiedName,
prefixToBase
),
prefixToBase
);
};

Exhibit.RdfXmlExporter.exportMany=function(set,database){
var s="";

var propertyIDToQualifiedName={};
var prefixToBase={};
database.getNamespaces(propertyIDToQualifiedName,prefixToBase);

set.visit(function(itemID){
s+=Exhibit.RdfXmlExporter._exportOne(
itemID,
database,
propertyIDToQualifiedName,
prefixToBase
)+"\n";
});
return Exhibit.RdfXmlExporter._wrapRdf(s,prefixToBase);
};

Exhibit.RdfXmlExporter._exportOne=function(itemID,database,propertyIDToQualifiedName,prefixToBase){
var s="";
var uri=database.getObject(itemID,"uri");
s+="<rdf:Description rdf:about='"+uri+"'>\n"

var allProperties=database.getAllProperties();
for(var i=0;i<allProperties.length;i++){
var propertyID=allProperties[i];
var property=database.getProperty(propertyID);
var values=database.getObjects(itemID,propertyID);
var valueType=property.getValueType();

var propertyString;
if(propertyID in propertyIDToQualifiedName){
var qname=propertyIDToQualifiedName[propertyID];
propertyString=qname.prefix+":"+qname.localName;
}else{
propertyString=property.getURI();
}

if(valueType=="item"){
values.visit(function(value){
s+="\t<"+propertyString+" rdf:resource='"+value+"' />\n";
});
}else if(propertyID!="uri"){
if(valueType=="url"){
values.visit(function(value){
s+="\t<"+propertyString+">"+Exhibit.Persistence.resolveURL(value)+"</"+propertyString+">\n";
});
}else{
values.visit(function(value){
s+="\t<"+propertyString+">"+value+"</"+propertyString+">\n";
});
}
}
}
s+="\t<exhibit:origin>"+Exhibit.Persistence.getItemLink(itemID)+"</exhibit:origin>\n";

s+="</rdf:Description>";
return s;
};

Exhibit.RdfXmlExporter._wrapRdf=function(s,prefixToBase){
var s2="<?xml version='1.0'?>\n"+
"<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'\n"+
"\txmlns:exhibit='http://simile.mit.edu/2006/11/exhibit#'";

for(prefix in prefixToBase){
s2+="\n\txmlns:"+prefix+"='"+prefixToBase[prefix]+"'";
}

s2+=">\n"+s+"\n</rdf:RDF>";
return s2;
}

/* semantic-wikitext-exporter.js */



Exhibit.SemanticWikitextExporter={
getLabel:function(){
return Exhibit.l10n.smwExporterLabel;
}
};

Exhibit.SemanticWikitextExporter.exportOne=function(itemID,database){
return Exhibit.SemanticWikitextExporter._wrap(
Exhibit.SemanticWikitextExporter._exportOne(itemID,database));
};

Exhibit.SemanticWikitextExporter.exportMany=function(set,database){
var s="";
set.visit(function(itemID){
s+=Exhibit.SemanticWikitextExporter._exportOne(itemID,database)+"\n";
});
return Exhibit.SemanticWikitextExporter._wrap(s);
};

Exhibit.SemanticWikitextExporter._exportOne=function(itemID,database){
var s="";
var uri=database.getObject(itemID,"uri");
s+=uri+"\n"

var allProperties=database.getAllProperties();
for(var i=0;i<allProperties.length;i++){
var propertyID=allProperties[i];
var property=database.getProperty(propertyID);
var values=database.getObjects(itemID,propertyID);
var valueType=property.getValueType();

if(valueType=="item"){
values.visit(function(value){
s+="[["+propertyID+"::"+value+"]]\n";
});
}else{
if(valueType=="url"){
values.visit(function(value){
s+="[["+propertyID+":="+Exhibit.Persistence.resolveURL(value)+"]]\n";
});
}else{
values.visit(function(value){
s+="[["+propertyID+":="+value+"]]\n";
});
}
}
}
s+="[[origin:="+Exhibit.Persistence.getItemLink(itemID)+"]]\n";

s+="\n";
return s;
};

Exhibit.SemanticWikitextExporter._wrap=function(s){
return s;
}

/* tsv-exporter.js */



Exhibit.TSVExporter={
getLabel:function(){
return Exhibit.l10n.tsvExporterLabel;
}
};

Exhibit.TSVExporter.exportOne=function(itemID,database){
return Exhibit.TSVExporter._wrap(
Exhibit.TSVExporter._exportOne(itemID,database),database);
};

Exhibit.TSVExporter.exportMany=function(set,database){
var s="";
set.visit(function(itemID){
s+=Exhibit.TSVExporter._exportOne(itemID,database)+"\n";
});
return Exhibit.TSVExporter._wrap(s,database);
};

Exhibit.TSVExporter._exportOne=function(itemID,database){
var s="";

var allProperties=database.getAllProperties();
for(var i=0;i<allProperties.length;i++){
var propertyID=allProperties[i];
var property=database.getProperty(propertyID);
var values=database.getObjects(itemID,propertyID);
var valueType=property.getValueType();

s+=values.toArray().join("; ")+"\t";
}

return s;
};

Exhibit.TSVExporter._wrap=function(s,database){
var header="";

var allProperties=database.getAllProperties();
for(var i=0;i<allProperties.length;i++){
var propertyID=allProperties[i];
var property=database.getProperty(propertyID);
var valueType=property.getValueType();
header+=propertyID+":"+valueType+"\t";
}

return header+"\n"+s;
}

/* expression-parser.js */


Exhibit.ExpressionParser=new Object();

Exhibit.ExpressionParser.parse=function(s,startIndex,results){
startIndex=startIndex||0;
results=results||{};

var scanner=new Exhibit.ExpressionScanner(s,startIndex);
try{
return Exhibit.ExpressionParser._internalParse(scanner,false);
}finally{
results.index=scanner.token()!=null?scanner.token().start:scanner.index();
}
};

Exhibit.ExpressionParser.parseSeveral=function(s,startIndex,results){
startIndex=startIndex||0;
results=results||{};

var scanner=new Exhibit.ExpressionScanner(s,startIndex);
try{
return Exhibit.ExpressionParser._internalParse(scanner,true);
}finally{
results.index=scanner.token()!=null?scanner.token().start:scanner.index();
}
};

Exhibit.ExpressionParser._internalParse=function(scanner,several){
var Scanner=Exhibit.ExpressionScanner;
var token=scanner.token();
var next=function(){scanner.next();token=scanner.token();};
var makePosition=function(){return token!=null?token.start:scanner.index();};

var parsePath=function(){
var path=new Exhibit.Expression.Path();
while(token!=null&&token.type==Scanner.PATH_OPERATOR){
var hopOperator=token.value;
next();

if(token!=null&&token.type==Scanner.IDENTIFIER){
path.appendSegment(token.value,hopOperator);
next();

}else{
throw new Error("Missing property ID at position "+makePosition());
}
}
return path;
};
var parseFactor=function(){
if(token==null){
throw new Error("Missing factor at end of expression");
}

var result=null;

switch(token.type){
case Scanner.NUMBER:
result=new Exhibit.Expression._Constant(token.value,"number");
next();
break;
case Scanner.STRING:
result=new Exhibit.Expression._Constant(token.value,"text");
next();
break;
case Scanner.PATH_OPERATOR:
result=parsePath();
break;
case Scanner.IDENTIFIER:
var identifier=token.value;
next();

if(identifier in Exhibit.Controls){
if(token!=null&&token.type==Scanner.DELIMITER&&token.value=="("){
next();

var args=(token!=null&&token.type==Scanner.DELIMITER&&token.value==")")?
[]:
parseExpressionList();

result=new Exhibit.Expression._ControlCall(identifier,args);

if(token!=null&&token.type==Scanner.DELIMITER&&token.value==")"){
next();
}else{
throw new Error("Missing ) to end "+identifier+" at position "+makePosition());
}
}else{
throw new Error("Missing ( to start "+identifier+" at position "+makePosition());
}
}else{
if(token!=null&&token.type==Scanner.DELIMITER&&token.value=="("){
next();

var args=(token!=null&&token.type==Scanner.DELIMITER&&token.value==")")?
[]:
parseExpressionList();

result=new Exhibit.Expression._FunctionCall(identifier,args);

if(token!=null&&token.type==Scanner.DELIMITER&&token.value==")"){
next();
}else{
throw new Error("Missing ) after function call "+identifier+" at position "+makePosition());
}
}else{
result=parsePath();
result.setRootName(identifier);
}
}
break;
case Scanner.DELIMITER:
if(token.value=="("){
next();

result=parseExpression();
if(token!=null&&token.type==Scanner.DELIMITER&&token.value==")"){
next();
break;
}else{
throw new Error("Missing ) at position "+makePosition());
}
}
default:
throw new Error("Unexpected text "+token.value+" at position "+makePosition());
}

return result;
};
var parseTerm=function(){
var term=parseFactor();
while(token!=null&&token.type==Scanner.OPERATOR&&
(token.value=="*"||token.value=="/")){
var operator=token.value;
next();

term=new Exhibit.Expression._Operator(operator,[term,parseFactor()]);
}
return term;
};
var parseSubExpression=function(){
var subExpression=parseTerm();
while(token!=null&&token.type==Scanner.OPERATOR&&
(token.value=="+"||token.value=="-")){

var operator=token.value;
next();

subExpression=new Exhibit.Expression._Operator(operator,[subExpression,parseTerm()]);
}
return subExpression;
};
var parseExpression=function(){
var expression=parseSubExpression();
while(token!=null&&token.type==Scanner.OPERATOR&&
(token.value=="="||token.value=="<>"||
token.value=="<"||token.value=="<="||
token.value==">"||token.value==">=")){

var operator=token.value;
next();

expression=new Exhibit.Expression._Operator(operator,[expression,parseSubExpression()]);
}
return expression;
};
var parseExpressionList=function(){
var expressions=[parseExpression()];
while(token!=null&&token.type==Scanner.DELIMITER&&token.value==","){
next();
expressions.push(parseExpression());
}
return expressions;
}

if(several){
var roots=parseExpressionList();
var expressions=[];
for(var r=0;r<roots.length;r++){
expressions.push(new Exhibit.Expression._Impl(roots[r]));
}
return expressions;
}else{
return new Exhibit.Expression._Impl(parseExpression());
}
};


Exhibit.ExpressionScanner=function(text,startIndex){
this._text=text+" ";
this._maxIndex=text.length;
this._index=startIndex;
this.next();
};

Exhibit.ExpressionScanner.DELIMITER=0;
Exhibit.ExpressionScanner.NUMBER=1;
Exhibit.ExpressionScanner.STRING=2;
Exhibit.ExpressionScanner.IDENTIFIER=3;
Exhibit.ExpressionScanner.OPERATOR=4;
Exhibit.ExpressionScanner.PATH_OPERATOR=5;

Exhibit.ExpressionScanner.prototype.token=function(){
return this._token;
};

Exhibit.ExpressionScanner.prototype.index=function(){
return this._index;
};

Exhibit.ExpressionScanner.prototype.next=function(){
this._token=null;

while(this._index<this._maxIndex&&
" \t\r\n".indexOf(this._text.charAt(this._index))>=0){
this._index++;
}

if(this._index<this._maxIndex){
var c1=this._text.charAt(this._index);
var c2=this._text.charAt(this._index+1);

if(".!".indexOf(c1)>=0){
if(c2=="@"){
this._token={
type:Exhibit.ExpressionScanner.PATH_OPERATOR,
value:c1+c2,
start:this._index,
end:this._index+2
};
this._index+=2;
}else{
this._token={
type:Exhibit.ExpressionScanner.PATH_OPERATOR,
value:c1,
start:this._index,
end:this._index+1
};
this._index++;
}
}else if("<>".indexOf(c1)>=0){
if((c2=="=")||("<>".indexOf(c2)>=0&&c1!=c2)){
this._token={
type:Exhibit.ExpressionScanner.OPERATOR,
value:c1+c2,
start:this._index,
end:this._index+2
};
this._index+=2;
}else{
this._token={
type:Exhibit.ExpressionScanner.OPERATOR,
value:c1,
start:this._index,
end:this._index+1
};
this._index++;
}
}else if("+-*/".indexOf(c1)>=0){
this._token={
type:Exhibit.ExpressionScanner.OPERATOR,
value:c1,
start:this._index,
end:this._index+1
};
this._index++;
}else if("(),".indexOf(c1)>=0){
this._token={
type:Exhibit.ExpressionScanner.DELIMITER,
value:c1,
start:this._index,
end:this._index+1
};
this._index++;
}else if("\"'".indexOf(c1)>=0){
var i=this._index+1;
while(i<this._maxIndex){
if(this._text.charAt(i)==c1&&this._text.charAt(i-1)!="\\"){
break;
}
i++;
}

if(i<this._maxIndex){
this._token={
type:Exhibit.ExpressionScanner.STRING,
value:this._text.substring(this._index+1,i).replace(/\\'/g,"'").replace(/\\"/g,'"'),
start:this._index,
end:i+1
};
this._index=i+1;
}else{
throw new Error("Unterminated string starting at "+this._index);
}
}else if(this._isDigit(c1)){
var i=this._index;
while(i<this._maxIndex&&this._isDigit(this._text.charAt(i))){
i++;
}

if(i<this._maxIndex&&this._text.charAt(i)=="."){
i++;
while(i<this._maxIndex&&this._isDigit(this._text.charAt(i))){
i++;
}
}

this._token={
type:Exhibit.ExpressionScanner.NUMBER,
value:parseFloat(this._text.substring(this._index,i)),
start:this._index,
end:i
};
this._index=i;
}else{
var i=this._index;
while(i<this._maxIndex){
var c=this._text.charAt(i);
if("(),.!@".indexOf(c)<0){
i++;
}else{
break;
}
}
this._token={
type:Exhibit.ExpressionScanner.IDENTIFIER,
value:this._text.substring(this._index,i),
start:this._index,
end:i
};
this._index=i;
}
}
};

Exhibit.ExpressionScanner.prototype._isDigit=function(c){
return"0123456789".indexOf(c)>=0;
};


/* expression.js */


Exhibit.Expression=new Object();

Exhibit.Expression._Impl=function(rootNode){
this._rootNode=rootNode;
};

Exhibit.Expression._Impl.prototype.evaluate=function(
roots,
rootValueTypes,
defaultRootName,
database
){
var collection=this._rootNode.evaluate(roots,rootValueTypes,defaultRootName,database);
return{
values:collection.getSet(),
valueType:collection.valueType,
size:collection.size
};
};

Exhibit.Expression._Impl.prototype.evaluateOnItem=function(itemID,database){
return this.evaluate(
{"value":itemID},
{"value":"item"},
"value",
database
);
};

Exhibit.Expression._Impl.prototype.evaluateSingle=function(
roots,
rootValueTypes,
defaultRootName,
database
){
var collection=this._rootNode.evaluate(roots,rootValueTypes,defaultRootName,database);
var result={value:null,valueType:collection.valueType};
collection.forEachValue(function(v){result.value=v;return true;});

return result;
};

Exhibit.Expression._Impl.prototype.evaluateSingleOnItem=function(itemID,database){
return this.evaluateSingle(
{"value":itemID},
{"value":"item"},
"value",
database
);
};

Exhibit.Expression._Impl.prototype.testExists=function(
roots,
rootValueTypes,
defaultRootName,
database
){
return this.isPath()?
this._rootNode.testExists(roots,rootValueTypes,defaultRootName,database):
this.evaluate(roots,rootValueTypes,defaultRootName,database).values.size()>0;
};

Exhibit.Expression._Impl.prototype.isPath=function(){
return this._rootNode instanceof Exhibit.Expression.Path;
};

Exhibit.Expression._Impl.prototype.getPath=function(){
return this.isPath()?this._rootNode:null;
};


Exhibit.Expression._Collection=function(values,valueType){
this._values=values;
this.valueType=valueType;

if(values instanceof Array){
this.forEachValue=Exhibit.Expression._Collection._forEachValueInArray;
this.getSet=Exhibit.Expression._Collection._getSetFromArray;
this.contains=Exhibit.Expression._Collection._containsInArray;
this.size=values.length;
}else{
this.forEachValue=Exhibit.Expression._Collection._forEachValueInSet;
this.getSet=Exhibit.Expression._Collection._getSetFromSet;
this.contains=Exhibit.Expression._Collection._containsInSet;
this.size=values.size();
}
};

Exhibit.Expression._Collection._forEachValueInSet=function(f){
this._values.visit(f);
};

Exhibit.Expression._Collection._forEachValueInArray=function(f){
var a=this._values;
for(var i=0;i<a.length;i++){
if(f(a[i])){
break;
}
}
};

Exhibit.Expression._Collection._getSetFromSet=function(){
return this._values;
};

Exhibit.Expression._Collection._getSetFromArray=function(){
return new Exhibit.Set(this._values);
};

Exhibit.Expression._Collection._containsInSet=function(v){
this._values.contains(v);
};

Exhibit.Expression._Collection._containsInArray=function(v){
var a=this._values;
for(var i=0;i<a.length;i++){
if(a[i]==v){
return true;
}
}
return false;
};


Exhibit.Expression.Path=function(){
this._rootName=null;
this._segments=[];
};

Exhibit.Expression.Path.create=function(property,forward){
var path=new Exhibit.Expression.Path();
path._segments.push({property:property,forward:forward,isArray:false});
return path;
};

Exhibit.Expression.Path.prototype.setRootName=function(rootName){
this._rootName=rootName;
};

Exhibit.Expression.Path.prototype.appendSegment=function(property,hopOperator){
this._segments.push({
property:property,
forward:hopOperator.charAt(0)==".",
isArray:hopOperator.length>1
});
};

Exhibit.Expression.Path.prototype.getSegment=function(index){
if(index<this._segments.length){
var segment=this._segments[index];
return{
property:segment.property,
forward:segment.forward,
isArray:segment.isArray
};
}else{
return null;
}
};

Exhibit.Expression.Path.prototype.getLastSegment=function(){
return this.getSegment(this._segments.length-1);
};

Exhibit.Expression.Path.prototype.getSegmentCount=function(){
return this._segments.length;
};

Exhibit.Expression.Path.prototype.evaluate=function(
roots,
rootValueTypes,
defaultRootName,
database
){
var rootName=this._rootName!=null?this._rootName:defaultRootName;
var valueType=rootName in rootValueTypes?rootValueTypes[rootName]:"text";

var collection=null;
if(rootName in roots){
var root=roots[rootName];
if(root instanceof Exhibit.Set||root instanceof Array){
collection=new Exhibit.Expression._Collection(root,valueType);
}else{
collection=new Exhibit.Expression._Collection([root],valueType);
}

return this._walkForward(collection,database);
}else{
throw new Error("No such variable called "+rootName);
}
};

Exhibit.Expression.Path.prototype.evaluateBackward=function(
value,
valueType,
filter,
database
){
var collection=new Exhibit.Expression._Collection([value],valueType);

return this._walkBackward(collection,filter,database);
}

Exhibit.Expression.Path.prototype.walkForward=function(
values,
valueType,
database
){
return this._walkForward(new Exhibit.Expression._Collection(values,valueType),database);
};

Exhibit.Expression.Path.prototype.walkBackward=function(
values,
valueType,
filter,
database
){
return this._walkBackward(new Exhibit.Expression._Collection(values,valueType),filter,database);
};

Exhibit.Expression.Path.prototype._walkForward=function(collection,database){
for(var i=0;i<this._segments.length;i++){
var segment=this._segments[i];
if(segment.isArray){
var a=[];
var valueType;
if(segment.forward){
collection.forEachValue(function(v){
database.getObjects(v,segment.property).visit(function(v2){a.push(v2);});
});

var property=database.getProperty(segment.property);
valueType=property!=null?property.getValueType():"text";
}else{
collection.forEachValue(function(v){
database.getSubjects(v,segment.property).visit(function(v2){a.push(v2);});
});
valueType="item";
}
collection=new Exhibit.Expression._Collection(a,valueType);
}else{
if(segment.forward){
var values=database.getObjectsUnion(collection.getSet(),segment.property);
var property=database.getProperty(segment.property);
var valueType=property!=null?property.getValueType():"text";
collection=new Exhibit.Expression._Collection(values,valueType);
}else{
var values=database.getSubjectsUnion(collection.getSet(),segment.property);
collection=new Exhibit.Expression._Collection(values,"item");
}
}
}

return collection;
};

Exhibit.Expression.Path.prototype._walkBackward=function(collection,filter,database){
for(var i=this._segments.length-1;i>=0;i--){
var segment=this._segments[i];
if(segment.isArray){
var a=[];
var valueType;
if(segment.forward){
collection.forEachValue(function(v){
database.getSubjects(v,segment.property).visit(function(v2){
if(i>0||filter==null||filter.contains(v2)){
a.push(v2);
}
});
});

var property=database.getProperty(segment.property);
valueType=property!=null?property.getValueType():"text";
}else{
collection.forEachValue(function(v){
database.getObjects(v,segment.property).visit(function(v2){
if(i>0||filter==null||filter.contains(v2)){
a.push(v2);
}
});
});
valueType="item";
}
collection=new Exhibit.Expression._Collection(a,valueType);
}else{
if(segment.forward){
var values=database.getSubjectsUnion(collection.getSet(),segment.property,null,i==0?filter:null);
collection=new Exhibit.Expression._Collection(values,"item");
}else{
var values=database.getObjectsUnion(collection.getSet(),segment.property,null,i==0?filter:null);
var property=database.getProperty(segment.property);
var valueType=property!=null?property.getValueType():"text";
collection=new Exhibit.Expression._Collection(values,valueType);
}
}
}

return collection;
};

Exhibit.Expression.Path.prototype.rangeBackward=function(
from,
to,
filter,
database
){
var set=new Exhibit.Set();
var valueType="item";
if(this._segments.length>0){
var segment=this._segments[0];
if(segment.forward){
database.getSubjectsInRange(segment.property,from,to,false,set,this._segments.length==1?filter:null);
}else{
throw new Error("Last path of segment must be forward");
}

for(var i=this._segments.length-1;i>0;i--){
segment=this._segments[i];
if(segment.forward){
set=database.getSubjectsUnion(set,segment.property,null,i==0?filter:null);
valueType="item";
}else{
set=database.getObjectsUnion(set,segment.property,i==0?filter:null);

var property=database.getProperty(segment.property);
valueType=property!=null?property.getValueType():"text";
}
}
}
return{
valueType:valueType,
values:set,
count:set.size()
};
};

Exhibit.Expression.Path.prototype.testExists=function(
roots,
rootValueTypes,
defaultRootName,
database
){
return this.evaluate(roots,rootValueTypes,defaultRootName,database).size>0;
};


Exhibit.Expression._Constant=function(value,valueType){
this._value=value;
this._valueType=valueType;
};

Exhibit.Expression._Constant.prototype.evaluate=function(
roots,
rootValueTypes,
defaultRootName,
database
){
return new Exhibit.Expression._Collection([this._value],this._valueType);
};


Exhibit.Expression._Operator=function(operator,args){
this._operator=operator;
this._args=args;
};

Exhibit.Expression._Operator.prototype.evaluate=function(
roots,
rootValueTypes,
defaultRootName,
database
){
var values=[];

var args=[];
for(var i=0;i<this._args.length;i++){
args.push(this._args[i].evaluate(roots,rootValueTypes,defaultRootName,database));
}

var operator=Exhibit.Expression._operators[this._operator];
var f=operator.f;
if(operator.argumentType=="number"){
args[0].forEachValue(function(v1){
if(!(typeof v1=="number")){
v1=parseFloat(v1);
}

args[1].forEachValue(function(v2){
if(!(typeof v2=="number")){
v2=parseFloat(v2);
}

values.push(f(v1,v2));
});
});
}else{
args[0].forEachValue(function(v1){
args[1].forEachValue(function(v2){
values.push(f(v1,v2));
});
});
}

return new Exhibit.Expression._Collection(values,operator.valueType);
};

Exhibit.Expression._operators={
"+":{
argumentType:"number",
valueType:"number",
f:function(a,b){return a+b;}
},
"-":{
argumentType:"number",
valueType:"number",
f:function(a,b){return a-b;}
},
"*":{
argumentType:"number",
valueType:"number",
f:function(a,b){return a*b;}
},
"/":{
argumentType:"number",
valueType:"number",
f:function(a,b){return a/b;}
},
"=":{
valueType:"boolean",
f:function(a,b){return a==b;}
},
"<>":{
valueType:"boolean",
f:function(a,b){return a!=b;}
},
"><":{
valueType:"boolean",
f:function(a,b){return a!=b;}
},
"<":{
argumentType:"number",
valueType:"boolean",
f:function(a,b){return a<b;}
},
">":{
argumentType:"number",
valueType:"boolean",
f:function(a,b){return a>b;}
},
"<=":{
argumentType:"number",
valueType:"boolean",
f:function(a,b){return a<=b;}
},
">=":{
argumentType:"number",
valueType:"boolean",
f:function(a,b){return a>=b;}
}
}


Exhibit.Expression._FunctionCall=function(name,args){
this._name=name;
this._args=args;
};

Exhibit.Expression._FunctionCall.prototype.evaluate=function(
roots,
rootValueTypes,
defaultRootName,
database
){
var args=[];
for(var i=0;i<this._args.length;i++){
args.push(this._args[i].evaluate(roots,rootValueTypes,defaultRootName,database));
}

if(this._name in Exhibit.Functions){
return Exhibit.Functions[this._name].f(args);
}else{
throw new Error("No such function named "+this._name);
}
};


Exhibit.Expression._ControlCall=function(name,args){
this._name=name;
this._args=args;
};

Exhibit.Expression._ControlCall.prototype.evaluate=function(
roots,
rootValueTypes,
defaultRootName,
database
){
return Exhibit.Controls[this._name].f(this._args,roots,rootValueTypes,defaultRootName,database);
};


/* functions.js */


Exhibit.Functions={};

Exhibit.Functions["union"]={
f:function(args){
var set=new Exhibit.Set();
var valueType=null;

if(args.length>0){
var valueType=args[0].valueType;
for(var i=0;i<args.length;i++){
var arg=args[i];
if(arg.size>0){
if(valueType==null){
valueType=arg.valueType;
}
set.addSet(arg.getSet());
}
}
}
return new Exhibit.Expression._Collection(set,valueType!=null?valueType:"text");
}
};

Exhibit.Functions["contains"]={
f:function(args){
var result=args[0].size>0;
var set=args[0].getSet();

args[1].forEachValue(function(v){
if(!set.contains(v)){
result=false;
return true;
}
});

return new Exhibit.Expression._Collection([result],"boolean");
}
};

Exhibit.Functions["exists"]={
f:function(args){
return new Exhibit.Expression._Collection([args[0].size>0],"boolean");
}
};

Exhibit.Functions["count"]={
f:function(args){
return new Exhibit.Expression._Collection([args[0].size],"number");
}
};

Exhibit.Functions["not"]={
f:function(args){
return new Exhibit.Expression._Collection([!args[0].contains(true)],"boolean");
}
};

Exhibit.Functions["add"]={
f:function(args){
var total=0;
for(var i=0;i<args.length;i++){
args[i].forEachValue(function(v){
if(v!=null){
if(typeof v=="number"){
total+=v;
}else{
var n=parseFloat(v);
if(!isNaN(n)){
total+=n;
}
}
}
});
}

return new Exhibit.Expression._Collection([total],"number");
}
};


Exhibit.Functions["concat"]={
f:function(args){
var result=[];
for(var i=0;i<args.length;i++){
args[i].forEachValue(function(v){
if(v!=null){
result.push(v);
}
});
}

return new Exhibit.Expression._Collection([result.join('')],"text");
}
};

Exhibit.Functions["multiply"]={
f:function(args){
var product=1;
for(var i=0;i<args.length;i++){
args[i].forEachValue(function(v){
if(v!=null){
if(typeof v=="number"){
product*=v;
}else{
var n=parseFloat(v);
if(!isNaN(n)){
product*=n;
}
}
}
});
}

return new Exhibit.Expression._Collection([product],"number");
}
};

Exhibit.Functions["date-range"]={
_parseDate:function(v){
if(v==null){
return Number.NEGATIVE_INFINITY;
}else if(v instanceof Date){
return v.getTime();
}else{
try{
return SimileAjax.DateTime.parseIso8601DateTime(v).getTime();
}catch(e){
return Number.NEGATIVE_INFINITY;
}
}
},
_factors:{
second:1000,
minute:60*1000,
hour:60*60*1000,
day:24*60*60*1000,
week:7*24*60*60*1000,
month:30*24*60*60*1000,
quarter:3*30*24*60*60*1000,
year:365*24*60*60*1000,
decade:10*365*24*60*60*1000,
century:100*365*24*60*60*1000
},
_computeRange:function(from,to,interval){
var range=to-from;
if(isFinite(range)){
if(interval in this._factors){
range=Math.round(range/this._factors[interval]);
}
return range;
}
return null;
},
f:function(args){
var self=this;

var from=Number.POSITIVE_INFINITY;
args[0].forEachValue(function(v){
from=Math.min(from,self._parseDate(v));
});

var to=Number.NEGATIVE_INFINITY;
args[1].forEachValue(function(v){
to=Math.max(to,self._parseDate(v));
});

var interval="day";
args[2].forEachValue(function(v){
interval=v;
});

var range=this._computeRange(from,to,interval);
return new Exhibit.Expression._Collection(range!=null?[range]:[],"number");
}
};

Exhibit.Functions["distance"]={
_units:{
km:1e3,
mile:1609.344
},
_computeDistance:function(from,to,unit,roundTo){
var range=from.distanceFrom(to);
if(!roundTo)roundTo=1;
if(isFinite(range)){
if(this._units.hasOwnProperty(unit)){
range=range/this._units[unit];
}
return Exhibit.Util.round(range,roundTo);
}
return null;
},
f:function(args){
var self=this;
var data={};
var name=["origo","lat","lng","unit","round"];
for(var i=0,n;n=name[i];i++){
args[i].forEachValue(function(v){data[n]=v;});
}

var latlng=data.origo.split(",");
var from=new GLatLng(latlng[0],latlng[1]);
var to=new GLatLng(data.lat,data.lng);

var range=this._computeDistance(from,to,data.unit,data.round);
return new Exhibit.Expression._Collection(range!=null?[range]:[],"number");
}
};

Exhibit.Functions["min"]={
f:function(args){
var returnMe=function(val){return val;};
var min=Number.POSITIVE_INFINITY;
var valueType=null;

for(var i=0;i<args.length;i++){
var arg=args[i];
var currentValueType=arg.valueType?arg.valueType:'text';
var parser=Exhibit.SettingsUtilities._typeToParser(currentValueType);

arg.forEachValue(function(v){
parsedV=parser(v,returnMe);
if(parsedV<min||min==Number.POSITIVE_INFINITY){
min=parsedV;
valueType=(valueType==null)?currentValueType:
(valueType==currentValueType?valueType:"text");
}
});
}

return new Exhibit.Expression._Collection([min],valueType!=null?valueType:"text");
}
};

Exhibit.Functions["max"]={
f:function(args){
var returnMe=function(val){return val;};
var max=Number.NEGATIVE_INFINITY;
var valueType=null;

for(var i=0;i<args.length;i++){
var arg=args[i];
var currentValueType=arg.valueType?arg.valueType:'text';
var parser=Exhibit.SettingsUtilities._typeToParser(currentValueType);

arg.forEachValue(function(v){
parsedV=parser(v,returnMe);
if(parsedV>max||max==Number.NEGATIVE_INFINITY){
max=parsedV;
valueType=(valueType==null)?currentValueType:
(valueType==currentValueType?valueType:"text");
}
});
}
return new Exhibit.Expression._Collection([max],valueType!=null?valueType:"text");
}
};

Exhibit.Functions["remove"]={
f:function(args){
var set=args[0].getSet();
var valueType=args[0].valueType;
for(var i=1;i<args.length;i++){
var arg=args[i];
if(arg.size>0){
set.removeSet(arg.getSet());
}
}
return new Exhibit.Expression._Collection(set,valueType);
}
};

Exhibit.Functions["now"]={
f:function(args){
return new Exhibit.Expression._Collection([new Date()],"date");
}
};


/* babel-based-importer.js */



Exhibit.BabelBasedImporter={
mimetypeToReader:{
"application/rdf+xml":"rdf-xml",
"application/n3":"n3",

"application/msexcel":"xls",
"application/x-msexcel":"xls",
"application/x-ms-excel":"xls",
"application/vnd.ms-excel":"xls",
"application/x-excel":"xls",
"application/xls":"xls",
"application/x-xls":"xls",

"application/x-bibtex":"bibtex"
}
};

Exhibit.importers["application/rdf+xml"]=Exhibit.BabelBasedImporter;
Exhibit.importers["application/n3"]=Exhibit.BabelBasedImporter;
Exhibit.importers["application/msexcel"]=Exhibit.BabelBasedImporter;
Exhibit.importers["application/x-msexcel"]=Exhibit.BabelBasedImporter;
Exhibit.importers["application/vnd.ms-excel"]=Exhibit.BabelBasedImporter;
Exhibit.importers["application/x-excel"]=Exhibit.BabelBasedImporter;
Exhibit.importers["application/xls"]=Exhibit.BabelBasedImporter;
Exhibit.importers["application/x-xls"]=Exhibit.BabelBasedImporter;
Exhibit.importers["application/x-bibtex"]=Exhibit.BabelBasedImporter;

Exhibit.BabelBasedImporter.load=function(link,database,cont){
var url=(typeof link=="string")?
Exhibit.Persistence.resolveURL(link):
Exhibit.Persistence.resolveURL(link.href);

var reader="rdf-xml";
var writer="exhibit-jsonp";
if(typeof link!="string"){
var mimetype=link.type;
if(mimetype in Exhibit.BabelBasedImporter.mimetypeToReader){
reader=Exhibit.BabelBasedImporter.mimetypeToReader[mimetype];
}
}
if(reader=="bibtex"){
writer="bibtex-exhibit-jsonp";
}

var babelURL="http://simile.mit.edu/babel/translator?"+[
"reader="+reader,
"writer="+writer,
"url="+encodeURIComponent(url)
].join("&");

return Exhibit.JSONPImporter.load(babelURL,database,cont);
};


/* exhibit-json-importer.js */



Exhibit.ExhibitJSONImporter={
};
Exhibit.importers["application/json"]=Exhibit.ExhibitJSONImporter;

Exhibit.ExhibitJSONImporter.load=function(link,database,cont){
var url=typeof link=="string"?link:link.href;
url=Exhibit.Persistence.resolveURL(url);

var fError=function(statusText,status,xmlhttp){
Exhibit.UI.hideBusyIndicator();
Exhibit.UI.showHelp(Exhibit.l10n.failedToLoadDataFileMessage(url));
if(cont)cont();
};

var fDone=function(xmlhttp){
Exhibit.UI.hideBusyIndicator();
try{
var o=null;
try{
o=eval("("+xmlhttp.responseText+")");
}catch(e){
Exhibit.UI.showJsonFileValidation(Exhibit.l10n.badJsonMessage(url,e),url);
}

if(o!=null){
database.loadData(o,Exhibit.Persistence.getBaseURL(url));
}
}catch(e){
SimileAjax.Debug.exception(e,"Error loading Exhibit JSON data from "+url);
}finally{
if(cont)cont();
}
};

Exhibit.UI.showBusyIndicator();
SimileAjax.XmlHttp.get(url,fError,fDone);
};


/* html-table-importer.js */



Exhibit.HtmlTableImporter={
};
Exhibit.importers["text/html"]=Exhibit.HtmlTableImporter;

Exhibit.HtmlTableImporter.load=function(link,database,cont){
var url=typeof link=="string"?link:link.href;
if(url.substr(0,1)=="#"){
try{
var id=/#(.*)/.exec(f)[1];
var table=document.getElementById(id);
table.style.display="none";

Exhibit.HtmlTableImporter.loadTable(table,database);
}catch(e){
SimileAjax.Debug.exception(e);
}finally{
if(cont){
cont();
}
}
}else if(typeof link!="string"){
var xpath=link.getAttribute('ex:xpath');
var columns=(link.getAttribute('ex:columns')).split(',');
var babelURL="http://simile.mit.edu/babel/html-extractor?"+[
"xpath="+xpath,
"url="+encodeURIComponent(url)
].join("&");
var fConvert=function(string){
var div=document.createElement("div");
div.innerHTML=string;
var table=div.firstChild;

var th,ths=table.getElementsByTagName("th");
for(col=0;th=ths[col];col++){
var label=columns[col];
th.setAttribute('ex:name',label);
}

Exhibit.HtmlTableImporter.loadTable(table,database);
return{};
}
return Exhibit.JSONPImporter.load(babelURL,database,cont,fConvert);
}else{
if(cont){
cont();
}
}
}

Exhibit.HtmlTableImporter.loadTable=function(table,database){

var textOf=function(n){return n.textContent||n.innerText||"";};
var readAttributes=function(node,attributes){
var result={},found=false,attr,value,i;
for(i=0;attr=attributes[i];i++){
value=Exhibit.getAttribute(node,attr);
if(value){
result[attr]=value;
found=true;
}
}
return found&&result;
}


var typelist=["uri","label","pluralLabel"];
var proplist=["uri","valueType",
"label","reverseLabel",
"pluralLabel","reversePluralLabel",
"groupingLabel","reverseGroupingLabel"];
var columnProps=["valueParser","arity"];

var parsed={};
var type=Exhibit.getAttribute(table,'type');
var types=type&&readAttributes(table,typelist);
if(types){
parsed.types={};
parsed.types[type]=types;
}

var fields=[],props={},columnData=[],row,col;
var tr,trs=table.getElementsByTagName("tr");
var th,ths=trs[0].getElementsByTagName("th");
for(col=0;th=ths[col];col++){
var field=textOf(th).trim();
var hastextwithlink=false;
var attr=readAttributes(th,proplist);
var name=Exhibit.getAttribute(th,'name');
if(name){
attr=attr||{};
attr.label=attr.label||field;
field=name;
}
if(attr){
props[field]=attr;
if(props[field].valueType=="textwithlink"){
props[field].valueType="text";
props[(field+"-link")]={valueType:"url"};
hastextwithlink=true;
}
parsed.properties=props;
}
fields.push(field);
attr=readAttributes(th,columnProps)||{};
if(attr.valueParser&&attr.valueParser in window){
attr.valueParser=window[attr.valueParser];
}else{
if(attr.arity=="single"){
attr.valueParser=function(text,node,rowNo,colNo){
return text.trim();
};
}else{
attr.valueParser=function(text,node,rowNo,colNo){
if(text.indexOf(';')==-1)
return text.trim();

var data=text.split(';');
for(var i=0;i<data.length;i++)
data[i]=data[i].trim();

return data;
};
if(hastextwithlink){
var fallback=attr.valueParser;
attr.valueParser=function(text,node,rowNo,colNo){
var links=node.getElementsByTagName("a");
if(!links.length){return fallback(text,node,rowNo,colNo);}
var data={};
data[fields[colNo]]=text.trim();
data[(fields[colNo]+"-link")]=links[0].href;
return data;
}
}
}
}
columnData[col]=attr;
}

var img,imgs=table.getElementsByTagName("img");
while(img=imgs[0])
img.parentNode.replaceChild(document.createTextNode(img.src),img);

var items=[],td,raw;
for(row=1;tr=trs[row];row++){
var item={};
var tds=tr.getElementsByTagName("td");
for(col=0;td=tds[col];col++){
var raw=textOf(td);
data=columnData[col].valueParser(raw,td,row,col);
if(data==null||raw===""){
continue;
}
if(typeof data=='object'&&!(data instanceof Array)){
for(var property in data){
item[property]=data[property];
}
}else{
item[fields[col]]=data;
}
}

if(type)
item.type=type;

items.push(item);
parsed.items=items;
}

database.loadData(parsed,Exhibit.Persistence.resolveURL(location.href));
};


/* jsonp-importer.js */



Exhibit.JSONPImporter={
_callbacks:{}
};
Exhibit.importers["application/jsonp"]=Exhibit.JSONPImporter;







Exhibit.JSONPImporter.load=function(
link,database,cont,fConvert,staticJSONPCallback,charset
){
var url=link;
if(typeof link!="string"){
url=Exhibit.Persistence.resolveURL(link.href);
fConvert=Exhibit.getAttribute(link,"converter");
staticJSONPCallback=Exhibit.getAttribute(link,"jsonp-callback");
charset=Exhibit.getAttribute(link,"charset");
}
if(typeof fConvert=="string"){
var name=fConvert;
name=name.charAt(0).toLowerCase()+name.substring(1)+"Converter";
if(name in Exhibit.JSONPImporter){
fConvert=Exhibit.JSONPImporter[name];
}else{
try{
fConvert=eval(fConvert);
}catch(e){
fConvert=null;

}
}
}

var next=Exhibit.JSONPImporter._callbacks.next||1;
Exhibit.JSONPImporter._callbacks.next=next+1;

var callbackName="cb"+next.toString(36);
var callbackURL=url;
if(callbackURL.indexOf("?")==-1)
callbackURL+="?";

var lastChar=callbackURL.charAt(callbackURL.length-1);
if(lastChar!="="){
if(lastChar!="&"&&lastChar!="?")
callbackURL+="&";
callbackURL+="callback=";
}

var callbackFull="Exhibit.JSONPImporter._callbacks."+callbackName;
callbackURL+=callbackFull;
var cleanup=function(failedURL){
try{
Exhibit.UI.hideBusyIndicator();

delete Exhibit.JSONPImporter._callbacks[callbackName+"_fail"];
delete Exhibit.JSONPImporter._callbacks[callbackName];
if(script&&script.parentNode){
script.parentNode.removeChild(script);
}
}finally{
if(failedURL){
prompt("Failed to load javascript file:",failedURL);
cont&&cont(undefined);
}
}
};

Exhibit.JSONPImporter._callbacks[callbackName+"_fail"]=cleanup;
Exhibit.JSONPImporter._callbacks[callbackName]=function(json){
try{
cleanup(null);
database.loadData(fConvert?fConvert(json,url):json,
Exhibit.Persistence.getBaseURL(url));
}finally{
if(cont)cont(json);
}
};
if(staticJSONPCallback){
callbackURL=url;
eval(staticJSONPCallback+"="+callbackFull);
}

var fail=callbackFull+"_fail('"+callbackURL+"');";
var script=SimileAjax.includeJavascriptFile(document,
callbackURL,
fail,
charset);
Exhibit.UI.showBusyIndicator();
return Exhibit.JSONPImporter._callbacks[callbackName];
};












Exhibit.JSONPImporter.transformJSON=function(json,index,mapping,converters){
var objects=json,items=[];
if(index){
index=index.split(".");
while(index.length){
objects=objects[index.shift()];
}
}
for(var i=0,object;object=objects[i];i++){
var item={};
for(var name in mapping){
var index=mapping[name];
if(!mapping.hasOwnProperty(name)||
!object.hasOwnProperty(index))continue;
var property=object[index];
if(converters&&converters.hasOwnProperty(name)){
property=converters[name](property,object,i,objects,json);
}
if(typeof property!="undefined"){
item[name]=property;
}
}
items.push(item);
}
return items;
};

Exhibit.JSONPImporter.deliciousConverter=function(json,url){
var items=Exhibit.JSONPImporter.transformJSON(json,null,
{label:"u",note:"n",description:"d",tags:"t"});
return{items:items,properties:{url:{valueType:"url"}}};
};

Exhibit.JSONPImporter.googleSpreadsheetsConverter=function(json,url){
var items=[];
var properties={};
var types={};
var valueTypes={"text":true,"number":true,"item":true,"url":true,"boolean":true};

var entries=json.feed.entry;
for(var i=0;i<entries.length;i++){
var entry=entries[i];
var item={label:entry.title.$t};
var fields=entry.content.$t;

var openBrace=fields.indexOf("{");
while(openBrace>=0){
var closeBrace=fields.indexOf("}",openBrace+1);
if(closeBrace<0){
break;
}

var fieldSpec=fields.substring(openBrace+1,closeBrace).trim().split(":");
openBrace=fields.indexOf("{",closeBrace+1);

var fieldValues=openBrace>0?fields.substring(closeBrace+1,openBrace):fields.substr(closeBrace+1);
fieldValues=fieldValues.replace(/^\:\s+|,\s+$/g,"");

var fieldName=fieldSpec[0].trim();
var property=properties[fieldName];
if(!(property)){
var fieldDetails=fieldSpec.length>1?fieldSpec[1].split(","):[];
property={};

for(var d=0;d<fieldDetails.length;d++){
var detail=fieldDetails[d].trim();
var property={single:false};
if(detail in valueTypes){
property.valueType=detail;
}else if(detail=="single"){
property.single=true;
}
}

properties[fieldName]=property;
}

if(!property.single){
fieldValues=fieldValues.split(";");
for(var v=0;v<fieldValues.length;v++){
fieldValues[v]=fieldValues[v].trim();
}
}
item[fieldName]=fieldValues;
}
items.push(item);
}

return{types:types,properties:properties,items:items};
};


/* rdfa-importer.js */



var RDFA=new Object();
RDFA.url='http://www.w3.org/2006/07/SWD/RDFa/impl/js/20070301/rdfa.js';

Exhibit.RDFaImporter={
};

Exhibit.importers["application/RDFa"]=Exhibit.RDFaImporter;

Exhibit.RDFaImporter.load=function(link,database,cont){
try{
if((link.getAttribute('href')||"").length==0){


Exhibit.RDFaImporter.loadRDFa(null,document,database);
}else{
iframe=document.createElement("iframe");
iframe.style.display='none';
iframe.setAttribute('onLoad','Exhibit.RDFaImporter.loadRDFa(this, this.contentDocument, database)');
iframe.src=link.href
document.body.appendChild(iframe);
}
}catch(e){
SimileAjax.Debug.exception(e);
}finally{
if(cont){
cont();
}
}
};

Exhibit.RDFaImporter.loadRDFa=function(iframe,rdfa,database){

var textOf=function(n){return n.textContent||n.innerText||"";};
var readAttributes=function(node,attributes){
var result={},found=false,attr,value,i;
for(i=0;attr=attributes[i];i++){
value=Exhibit.getAttribute(node,attr);
if(value){
result[attr]=value;
found=true;
}
}
return found&&result;
};


RDFA.CALLBACK_DONE_PARSING=function(){
if(iframe!=null){
document.body.removeChild(iframe);
}

this.cloneObject=function(what){
for(var i in what){
this[i]=what[i];
}
};

var triples=this.triples;
var parsed={"classes":{},"properties":{},"items":[]};
for(var i in triples){
var item={};

item['id'],item['uri'],item['label']=i;

var tri=triples[i];
for(var j in tri){
for(var k=0;k<tri[j].length;k++){
if(tri[j][k].predicate.ns){
var p_label=tri[j][k].predicate.ns.prefix+':'+tri[j][k].predicate.suffix;



if(j=='http://www.w3.org/1999/02/22-rdf-syntax-ns#type'){
try{
var type_uri=tri[j][k]['object'];
var matches=type_uri.match(/(.+?)(#|\/)([a-zA-Z_]+)?$/);
var type_label=matches[3]+'('+matches[1]+')';
parsed['classes'][type_label]={"label":type_label,"uri":type_uri}
item['type']=type_label;
}catch(e){

};
}else{
parsed['properties'][p_label]={"uri":j,"label":tri[j][k]['predicate']['suffix']};
try{
if(!item[p_label]){
item[p_label]=[];
}
item[p_label].push(tri[j][k]['object']);
}catch(e){
SimileAjax.Debug.log("problem adding property value: "+e);
}

if(j=='http://purl.org/dc/elements/1.1/title'||
j=='http://www.w3.org/2000/01/rdf-schema#'||
j=='http://xmlns.com/foaf/0.1/name'){
item.label=item[p_label];
}
}
}
else{
item[j]=tri[j][k]['object'];
}
}
}

parsed['items'].push(new this.cloneObject(item));
}
database.loadData(parsed,Exhibit.Persistence.getBaseURL(document.location.href));
}


RDFA.CALLBACK_DONE_LOADING=function(){
RDFA.parse(rdfa);
};



SimileAjax.includeJavascriptFile(document,RDFA.url);
};


/* exhibit.js */



Exhibit.create=function(database){
return new Exhibit._Impl(database);
};

Exhibit.getAttribute=function(elmt,name,splitOn){
try{
var value=elmt.getAttribute(name);
if(value==null){
value=elmt.getAttribute("ex:"+name);
}
if(splitOn==null){
return value;
}
var values=value.split(splitOn);
for(var i=0;value=values[i];i++){
values[i]=value.trim();
}
return values;
}catch(e){
return null;
}
};

Exhibit.getRoleAttribute=function(elmt){
var role=Exhibit.getAttribute(elmt,"role");
role=role!=null?role:"";
role=role.startsWith("exhibit-")?role.substr("exhibit-".length):role;
return role;
};

Exhibit.getConfigurationFromDOM=function(elmt){
var c=Exhibit.getAttribute(elmt,"configuration");
if(c!=null&&c.length>0){
try{
var o=eval(c);
if(typeof o=="object"){
return o;
}
}catch(e){}
}
return{};
};

Exhibit.getExporters=function(){
Exhibit._initializeExporters();
return[].concat(Exhibit._exporters);
};

Exhibit.addExporters=function(exporter){
Exhibit._initializeExporters();
Exhibit._exporters.push(exporter);
};

Exhibit._initializeExporters=function(){
if(!("_exporters"in Exhibit)){
Exhibit._exporters=[
Exhibit.RdfXmlExporter,
Exhibit.SemanticWikitextExporter,
Exhibit.TSVExporter,
Exhibit.ExhibitJsonExporter
];
}
};


Exhibit._Impl=function(database){
this._database=database!=null?
database:
("database"in window?
window.database:
Exhibit.Database.create());

this._uiContext=Exhibit.UIContext.createRootContext({},this);
this._collectionMap={};
this._componentMap={};

var self=this;
this._focusID=null;
this._databaseListener={
onAfterLoadingItems:function(){

}
};
this._database.addListener(this._databaseListener);

this._historyListener={
onBeforePerform:function(action){if(action.lengthy){Exhibit.UI.showBusyIndicator();}},
onAfterPerform:function(action){if(action.lengthy){Exhibit.UI.hideBusyIndicator();}},
onBeforeUndoSeveral:function(){Exhibit.UI.showBusyIndicator();},
onAfterUndoSeveral:function(){Exhibit.UI.hideBusyIndicator();},
onBeforeRedoSeveral:function(){Exhibit.UI.showBusyIndicator();},
onAfterRedoSeveral:function(){Exhibit.UI.hideBusyIndicator();}
};
SimileAjax.History.addListener(this._historyListener);

var hash=document.location.hash;
if(hash.length>1){
this._focusID=decodeURIComponent(hash.substr(1));
}
};

Exhibit._Impl.prototype.dispose=function(){
SimileAjax.History.removeListener(this._historyListener);
this._database.removeListener(this._databaseListener);

for(var id in this._componentMap){
try{
this._componentMap[id].dispose();
}catch(e){
SimileAjax.Debug.exception(e,"Failed to dispose component");
}
}
for(var id in this._collectionMap){
try{
this._collectionMap[id].dispose();
}catch(e){
SimileAjax.Debug.exception(e,"Failed to dispose collection");
}
}

this._uiContext.dispose();

this._componentMap=null;
this._collectionMap=null;
this._uiContext=null;
this._database=null;
};

Exhibit._Impl.prototype.getDatabase=function(){
return this._database;
};

Exhibit._Impl.prototype.getUIContext=function(){
return this._uiContext;
};

Exhibit._Impl.prototype.getCollection=function(id){
var collection=this._collectionMap[id];
if(collection==null&&id=="default"){
collection=Exhibit.Collection.createAllItemsCollection(id,this._database);
this.setDefaultCollection(collection);
}
return collection;
};

Exhibit._Impl.prototype.getDefaultCollection=function(){
return this.getCollection("default");
};

Exhibit._Impl.prototype.setCollection=function(id,c){
if(id in this._collectionMap){
try{
this._collectionMap[id].dispose();
}catch(e){
SimileAjax.Debug.exception(e);
}
}
this._collectionMap[id]=c;
};

Exhibit._Impl.prototype.setDefaultCollection=function(c){
this.setCollection("default",c);
};

Exhibit._Impl.prototype.getComponent=function(id){
return this._componentMap[id];
};

Exhibit._Impl.prototype.setComponent=function(id,c){
if(id in this._componentMap){
try{
this._componentMap[id].dispose();
}catch(e){
SimileAjax.Debug.exception(e);
}
}

this._componentMap[id]=c;
};

Exhibit._Impl.prototype.disposeComponent=function(id){
if(id in this._componentMap){
try{
this._componentMap[id].dispose();
}catch(e){
SimileAjax.Debug.exception(e);
}
delete this._componentMap[id];
}
};

Exhibit._Impl.prototype.configure=function(configuration){
if("collections"in configuration){
for(var i=0;i<configuration.collections.length;i++){
var config=configuration.collections[i];
var id=config.id;
if(id==null||id.length==0){
id="default";
}
this.setCollection(id,Exhibit.Collection.create(id,config,this.getDatabase()));
}
}
if("components"in configuration){
for(var i=0;i<configuration.components.length;i++){
var config=configuration.components[i];
var component=Exhibit.UI.create(config,config.elmt,this._uiContext);
if(component!=null){
var id=elmt.id;
if(id==null||id.length==0){
id="component"+Math.floor(Math.random()*1000000);
}
this.setComponent(id,component);
}
}
}
};


Exhibit._Impl.prototype.configureFromDOM=function(root){
var collectionElmts=[];
var coderElmts=[];
var coordinatorElmts=[];
var lensElmts=[];
var facetElmts=[];
var otherElmts=[];
var f=function(elmt){
var role=Exhibit.getRoleAttribute(elmt);
if(role.length>0){
switch(role){
case"collection":collectionElmts.push(elmt);break;
case"coder":coderElmts.push(elmt);break;
case"coordinator":coordinatorElmts.push(elmt);break;
case"lens":lensElmts.push(elmt);break;
case"facet":facetElmts.push(elmt);break;
default:
otherElmts.push(elmt);
}
}else{
var node=elmt.firstChild;
while(node!=null){
if(node.nodeType==1){
f(node);
}
node=node.nextSibling;
}
}
};
f(root||document.body);

for(var i=0;i<collectionElmts.length;i++){
var elmt=collectionElmts[i];
var id=elmt.id;
if(id==null||id.length==0){
id="default";
}
this.setCollection(id,Exhibit.Collection.createFromDOM(id,elmt,this.getDatabase()));
}

var uiContext=this._uiContext;
var self=this;
var processElmts=function(elmts){
for(var i=0;i<elmts.length;i++){
var elmt=elmts[i];
try{
var component=Exhibit.UI.createFromDOM(elmt,uiContext);
if(component!=null){
var id=elmt.id;
if(id==null||id.length==0){
id="component"+Math.floor(Math.random()*1000000);
}
self.setComponent(id,component);
}
}catch(e){
SimileAjax.Debug.exception(e);
}
}
};
processElmts(coordinatorElmts);
processElmts(coderElmts);
processElmts(lensElmts);
processElmts(facetElmts);
processElmts(otherElmts);
};


/* persistence.js */


Exhibit.Persistence={};

Exhibit.Persistence.getBaseURL=function(url){



try{
if(url.indexOf("://")<0){
var url2=Exhibit.Persistence.getBaseURL(document.location.href);
if(url.substr(0,1)=="/"){
url=url2.substr(0,url2.indexOf("/",url2.indexOf("://")+3))+url;
}else{
url=url2+url;
}
}

var i=url.lastIndexOf("/");
if(i<0){
return"";
}else{
return url.substr(0,i+1);
}
}catch(e){
return url;
}
};

Exhibit.Persistence.resolveURL=function(url){
if(url.indexOf("://")<0){
var url2=Exhibit.Persistence.getBaseURL(document.location.href);
if(url.substr(0,1)=="/"){
url=url2.substr(0,url2.indexOf("/",url2.indexOf("://")+3))+url;
}else{
url=url2+url;
}
}
return url;
};

Exhibit.Persistence.getURLWithoutQueryAndHash=function(){
var url;
if("_urlWithoutQueryAndHash"in Exhibit){
url=Exhibit.Persistence._urlWithoutQueryAndHash;
}else{
url=document.location.href;

var hash=url.indexOf("#");
var question=url.indexOf("?");
if(question>=0){
url=url.substr(0,question);
}else if(hash>=0){
url=url.substr(0,hash);
}

Exhibit.Persistence._urlWithoutQueryAndHash=url;
}
return url;
};

Exhibit.Persistence.getURLWithoutQuery=function(){
var url;
if("_urlWithoutQuery"in Exhibit.Persistence){
url=Exhibit.Persistence._urlWithoutQuery;
}else{
url=document.location.href;

var question=url.indexOf("?");
if(question>=0){
url=url.substr(0,question);
}

Exhibit.Persistence._urlWithoutQuery=url;
}
return url;
};

Exhibit.Persistence.getItemLink=function(itemID){
return Exhibit.Persistence.getURLWithoutQueryAndHash()+"#"+encodeURIComponent(itemID);
};

/* color-coder.js */



Exhibit.ColorCoder=function(uiContext){
this._uiContext=uiContext;
this._settings={};

this._map={};
this._mixedCase={label:"mixed",color:"#fff"};
this._missingCase={label:"missing",color:"#888"};
this._othersCase={label:"others",color:"#aaa"};
};

Exhibit.ColorCoder._settingSpecs={
};

Exhibit.ColorCoder.create=function(configuration,uiContext){
var coder=new Exhibit.ColorCoder(Exhibit.UIContext.create(configuration,uiContext));

Exhibit.ColorCoder._configure(coder,configuration);
return coder;
};

Exhibit.ColorCoder.createFromDOM=function(configElmt,uiContext){
configElmt.style.display="none";

var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var coder=new Exhibit.ColorCoder(Exhibit.UIContext.create(configuration,uiContext));

Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt,Exhibit.ColorCoder._settingSpecs,coder._settings);

try{
var node=configElmt.firstChild;
while(node!=null){
if(node.nodeType==1){
coder._addEntry(
Exhibit.getAttribute(node,"case"),
node.firstChild.nodeValue.trim(),
Exhibit.getAttribute(node,"color"));
}
node=node.nextSibling;
}
}catch(e){
SimileAjax.Debug.exception(e,"ColorCoder: Error processing configuration of coder");
}

Exhibit.ColorCoder._configure(coder,configuration);
return coder;
};

Exhibit.ColorCoder._configure=function(coder,configuration){
Exhibit.SettingsUtilities.collectSettings(configuration,Exhibit.ColorCoder._settingSpecs,coder._settings);

if("entries"in configuration){
var entries=configuration.entries;
for(var i=0;i<entries.length;i++){
coder._addEntry(entries[i].kase,entries[i].key,entries[i].color);
}
}
}

Exhibit.ColorCoder.prototype.dispose=function(){
this._uiContext=null;
this._settings=null;
};

Exhibit.ColorCoder._colorTable={
"red":"#ff0000",
"green":"#00ff00",
"blue":"#0000ff",
"white":"#ffffff",
"black":"#000000",
"gray":"#888888"
};

Exhibit.ColorCoder.prototype._addEntry=function(kase,key,color){
if(color in Exhibit.ColorCoder._colorTable){
color=Exhibit.ColorCoder._colorTable[color];
}

var entry=null;
switch(kase){
case"others":entry=this._othersCase;break;
case"mixed":entry=this._mixedCase;break;
case"missing":entry=this._missingCase;break;
}
if(entry!=null){
entry.label=key;
entry.color=color;
}else{
this._map[key]={color:color};
}
};

Exhibit.ColorCoder.prototype.translate=function(key,flags){
if(key in this._map){
if(flags)flags.keys.add(key);
return this._map[key].color;
}else if(key==null){
if(flags)flags.missing=true;
return this._missingCase.color;
}else{
if(flags)flags.others=true;
return this._othersCase.color;
}
};

Exhibit.ColorCoder.prototype.translateSet=function(keys,flags){
var color=null;
var self=this;
keys.visit(function(key){
var color2=self.translate(key,flags);
if(color==null){
color=color2;
}else if(color!=color2){
if(flags)flags.mixed=true;
color=self._mixedCase.color;
return true;
}
return false;
});

if(color!=null){
return color;
}else{
if(flags)flags.missing=true;
return this._missingCase.color;
}
};

Exhibit.ColorCoder.prototype.getOthersLabel=function(){
return this._othersCase.label;
};
Exhibit.ColorCoder.prototype.getOthersColor=function(){
return this._othersCase.color;
};

Exhibit.ColorCoder.prototype.getMissingLabel=function(){
return this._missingCase.label;
};
Exhibit.ColorCoder.prototype.getMissingColor=function(){
return this._missingCase.color;
};

Exhibit.ColorCoder.prototype.getMixedLabel=function(){
return this._mixedCase.label;
};
Exhibit.ColorCoder.prototype.getMixedColor=function(){
return this._mixedCase.color;
};


/* color-gradient-coder.js */





Exhibit.ColorGradientCoder=function(uiContext){

this._uiContext=uiContext;

this._settings={};



this._gradientPoints=[];

this._mixedCase={label:"mixed",color:"#fff"};

this._missingCase={label:"missing",color:"#888"};

this._othersCase={label:"others",color:"#aaa"};

};



Exhibit.ColorGradientCoder._settingSpecs={

};



Exhibit.ColorGradientCoder.create=function(configuration,uiContext){

var coder=new Exhibit.ColorGradientCoder(Exhibit.UIContext.create(configuration,uiContext));



Exhibit.ColorGradientCoder._configure(coder,configuration);

return coder;

};



Exhibit.ColorGradientCoder.createFromDOM=function(configElmt,uiContext){

configElmt.style.display="none";



var configuration=Exhibit.getConfigurationFromDOM(configElmt);

var coder=new Exhibit.ColorGradientCoder(Exhibit.UIContext.create(configuration,uiContext));



Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt,Exhibit.ColorGradientCoder._settingSpecs,coder._settings);



try{

var gradientPoints=Exhibit.getAttribute(configElmt,"gradientPoints",";")

for(var i=0;i<gradientPoints.length;i++){

var point=gradientPoints[i];

var value=parseFloat(point);

var colorIndex=point.indexOf("#")+1;

var red=parseInt(point.slice(colorIndex,colorIndex+2),16);

var green=parseInt(point.slice(colorIndex+2,colorIndex+4),16);

var blue=parseInt(point.slice(colorIndex+4),16);

coder._gradientPoints.push({value:value,red:red,green:green,blue:blue});

}



var node=configElmt.firstChild;

while(node!=null){

if(node.nodeType==1){

coder._addEntry(

Exhibit.getAttribute(node,"case"),

node.firstChild.nodeValue.trim(),

Exhibit.getAttribute(node,"color"));

}

node=node.nextSibling;

}

}catch(e){

SimileAjax.Debug.exception(e,"ColorGradientCoder: Error processing configuration of coder");

}



Exhibit.ColorGradientCoder._configure(coder,configuration);

return coder;

};



Exhibit.ColorGradientCoder._configure=function(coder,configuration){

Exhibit.SettingsUtilities.collectSettings(configuration,Exhibit.ColorGradientCoder._settingSpecs,coder._settings);



if("entries"in configuration){

var entries=configuration.entries;

for(var i=0;i<entries.length;i++){

coder._addEntry(entries[i].kase,entries[i].key,entries[i].color);

}

}

}



Exhibit.ColorGradientCoder.prototype.dispose=function(){

this._uiContext=null;

this._settings=null;

};



Exhibit.ColorGradientCoder.prototype._addEntry=function(kase,key,color){

var entry=null;

switch(kase){

case"others":entry=this._othersCase;break;

case"mixed":entry=this._mixedCase;break;

case"missing":entry=this._missingCase;break;

}

if(entry!=null){

entry.label=key;

entry.color=color;

}

};



Exhibit.ColorGradientCoder.prototype.translate=function(key,flags){

var gradientPoints=this._gradientPoints;

var getColor=function(key){

if(key.constructor!=Number){

key=parseFloat(key);

}

for(j=0;j<gradientPoints.length;j++){

if(key==gradientPoints[j].value){

return rgbToHex(gradientPoints[j].red,gradientPoints[j].green,gradientPoints[j].blue);

}else if(gradientPoints[j+1]!=null){

if(key<gradientPoints[j+1].value){

var fraction=(key-gradientPoints[j].value)/(gradientPoints[j+1].value-gradientPoints[j].value);

var newRed=Math.floor(gradientPoints[j].red+fraction*(gradientPoints[j+1].red-gradientPoints[j].red));

var newGreen=Math.floor(gradientPoints[j].green+fraction*(gradientPoints[j+1].green-gradientPoints[j].green));

var newBlue=Math.floor(gradientPoints[j].blue+fraction*(gradientPoints[j+1].blue-gradientPoints[j].blue));

return rgbToHex(newRed,newGreen,newBlue)

}

}

}

}



var rgbToHex=function(r,g,b){

var decToHex=function(n){

if(n==0){return"00"}

else{return n.toString(16)}

}

return"#"+decToHex(r)+decToHex(g)+decToHex(b);

}



if(key>=gradientPoints[0].value&key<=gradientPoints[gradientPoints.length-1].value){

if(flags)flags.keys.add(key);

return getColor(key);

}else if(key==null){

if(flags)flags.missing=true;

return this._missingCase.color;

}else{

if(flags)flags.others=true;

return this._othersCase.color;

}

};



Exhibit.ColorGradientCoder.prototype.translateSet=function(keys,flags){

var color=null;

var self=this;

keys.visit(function(key){

var color2=self.translate(key,flags);

if(color==null){

color=color2;

}else if(color!=color2){

if(flags)flags.mixed=true;

color=self._mixedCase.color;

return true;

}

return false;

});



if(color!=null){

return color;

}else{

if(flags)flags.missing=true;

return this._missingCase.color;

}

};



Exhibit.ColorGradientCoder.prototype.getOthersLabel=function(){

return this._othersCase.label;

};

Exhibit.ColorGradientCoder.prototype.getOthersColor=function(){

return this._othersCase.color;

};



Exhibit.ColorGradientCoder.prototype.getMissingLabel=function(){

return this._missingCase.label;

};

Exhibit.ColorGradientCoder.prototype.getMissingColor=function(){

return this._missingCase.color;

};



Exhibit.ColorGradientCoder.prototype.getMixedLabel=function(){

return this._mixedCase.label;

};

Exhibit.ColorGradientCoder.prototype.getMixedColor=function(){

return this._mixedCase.color;

};



/* default-color-coder.js */



Exhibit.DefaultColorCoder=function(uiContext){
};

Exhibit.DefaultColorCoder._colors=[
"#FF9000",
"#5D7CBA",
"#A97838",
"#8B9BBA",
"#FFC77F",
"#003EBA",
"#29447B",
"#543C1C"
];
Exhibit.DefaultColorCoder._map={};
Exhibit.DefaultColorCoder._mixedCase={label:"mixed",color:"#fff"};
Exhibit.DefaultColorCoder._othersCase={label:"others",color:"#aaa"};
Exhibit.DefaultColorCoder._missingCase={label:"missing",color:"#888"};
Exhibit.DefaultColorCoder._nextColor=0;

Exhibit.DefaultColorCoder.prototype.translate=function(key,flags){
if(key==null){
if(flags)flags.missing=true;
return Exhibit.DefaultColorCoder._missingCase.color;
}else{
if(flags)flags.keys.add(key);
if(key in Exhibit.DefaultColorCoder._map){
return Exhibit.DefaultColorCoder._map[key];
}else{
var color=Exhibit.DefaultColorCoder._colors[Exhibit.DefaultColorCoder._nextColor];
Exhibit.DefaultColorCoder._nextColor=
(Exhibit.DefaultColorCoder._nextColor+1)%Exhibit.DefaultColorCoder._colors.length;

Exhibit.DefaultColorCoder._map[key]=color;
return color;
}
}
};

Exhibit.DefaultColorCoder.prototype.translateSet=function(keys,flags){
var color=null;
var self=this;
keys.visit(function(key){
var color2=self.translate(key,flags);
if(color==null){
color=color2;
}else if(color!=color2){
color=Exhibit.DefaultColorCoder._mixedCase.color;
flags.mixed=true;
return true;
}
return false;
});

if(color!=null){
return color;
}else{
flags.missing=true;
return Exhibit.DefaultColorCoder._missingCase.color;
}
};

Exhibit.DefaultColorCoder.prototype.getOthersLabel=function(){
return Exhibit.DefaultColorCoder._othersCase.label;
};
Exhibit.DefaultColorCoder.prototype.getOthersColor=function(){
return Exhibit.DefaultColorCoder._othersCase.color;
};

Exhibit.DefaultColorCoder.prototype.getMissingLabel=function(){
return Exhibit.DefaultColorCoder._missingCase.label;
};
Exhibit.DefaultColorCoder.prototype.getMissingColor=function(){
return Exhibit.DefaultColorCoder._missingCase.color;
};

Exhibit.DefaultColorCoder.prototype.getMixedLabel=function(){
return Exhibit.DefaultColorCoder._mixedCase.label;
};
Exhibit.DefaultColorCoder.prototype.getMixedColor=function(){
return Exhibit.DefaultColorCoder._mixedCase.color;
};


/* icon-coder.js */



Exhibit.IconCoder=function(uiContext){
this._uiContext=uiContext;
this._settings={};

this._map={};
this._mixedCase={label:"mixed",icon:null};
this._missingCase={label:"missing",icon:null};
this._othersCase={label:"others",icon:null};
};

Exhibit.IconCoder._settingSpecs={
};

Exhibit.IconCoder.create=function(configuration,uiContext){
var coder=new Exhibit.IconCoder(Exhibit.UIContext.create(configuration,uiContext));

Exhibit.IconCoder._configure(coder,configuration);
return coder;
};

Exhibit.IconCoder.createFromDOM=function(configElmt,uiContext){
configElmt.style.display="none";

var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var coder=new Exhibit.IconCoder(Exhibit.UIContext.create(configuration,uiContext));

Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt,Exhibit.IconCoder._settingSpecs,coder._settings);

try{
var node=configElmt.firstChild;
while(node!=null){
if(node.nodeType==1){
coder._addEntry(
Exhibit.getAttribute(node,"case"),
node.firstChild.nodeValue.trim(),
Exhibit.getAttribute(node,"icon"));
}
node=node.nextSibling;
}
}catch(e){
SimileAjax.Debug.exception(e,"IconCoder: Error processing configuration of coder");
}

Exhibit.IconCoder._configure(coder,configuration);
return coder;
};

Exhibit.IconCoder._configure=function(coder,configuration){
Exhibit.SettingsUtilities.collectSettings(configuration,Exhibit.IconCoder._settingSpecs,coder._settings);

if("entries"in configuration){
var entries=configuration.entries;
for(var i=0;i<entries.length;i++){
coder._addEntry(entries[i].kase,entries[i].key,entries[i].icon);
}
}
}

Exhibit.IconCoder.prototype.dispose=function(){
this._uiContext=null;
this._settings=null;
};

Exhibit.IconCoder._iconTable={

};

Exhibit.IconCoder.prototype._addEntry=function(kase,key,icon){

if(icon in Exhibit.IconCoder._iconTable){
icon=Exhibit.IconCoder._iconTable[icon];
}

var entry=null;
switch(kase){
case"others":entry=this._othersCase;break;
case"mixed":entry=this._mixedCase;break;
case"missing":entry=this._missingCase;break;
}
if(entry!=null){
entry.label=key;
entry.icon=icon;
}else{
this._map[key]={icon:icon};
}
};

Exhibit.IconCoder.prototype.translate=function(key,flags){
if(key in this._map){
if(flags)flags.keys.add(key);
return this._map[key].icon;
}else if(key==null){
if(flags)flags.missing=true;
return this._missingCase.icon;
}else{
if(flags)flags.others=true;
return this._othersCase.icon;
}
};

Exhibit.IconCoder.prototype.translateSet=function(keys,flags){
var icon=null;
var self=this;
keys.visit(function(key){
var icon2=self.translate(key,flags);
if(icon==null){
icon=icon2;
}else if(icon!=icon2){
if(flags)flags.mixed=true;
icon=self._mixedCase.icon;
return true;
}
return false;
});

if(icon!=null){
return icon;
}else{
if(flags)flags.missing=true;
return this._missingCase.icon;
}
};

Exhibit.IconCoder.prototype.getOthersLabel=function(){
return this._othersCase.label;
};
Exhibit.IconCoder.prototype.getOthersIcon=function(){
return this._othersCase.icon;
};

Exhibit.IconCoder.prototype.getMissingLabel=function(){
return this._missingCase.label;
};
Exhibit.IconCoder.prototype.getMissingIcon=function(){
return this._missingCase.icon;
};

Exhibit.IconCoder.prototype.getMixedLabel=function(){
return this._mixedCase.label;
};
Exhibit.IconCoder.prototype.getMixedIcon=function(){
return this._mixedCase.icon;
};


/* size-coder.js */



Exhibit.SizeCoder=function(uiContext){
this._uiContext=uiContext;
this._settings={};

this._map={};
this._mixedCase={label:"mixed",size:10};
this._missingCase={label:"missing",size:10};
this._othersCase={label:"others",size:10};
};

Exhibit.SizeCoder._settingSpecs={
};

Exhibit.SizeCoder.create=function(configuration,uiContext){
var coder=new Exhibit.SizeCoder(Exhibit.UIContext.create(configuration,uiContext));

Exhibit.SizeCoder._configure(coder,configuration);
return coder;
};

Exhibit.SizeCoder.createFromDOM=function(configElmt,uiContext){
configElmt.style.display="none";

var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var coder=new Exhibit.SizeCoder(Exhibit.UIContext.create(configuration,uiContext));

Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt,Exhibit.SizeCoder._settingSpecs,coder._settings);

try{
var node=configElmt.firstChild;
while(node!=null){
if(node.nodeType==1){
coder._addEntry(
Exhibit.getAttribute(node,"case"),
node.firstChild.nodeValue.trim(),
Exhibit.getAttribute(node,"size"));
}
node=node.nextSibling;
}
}catch(e){
SimileAjax.Debug.exception(e,"SizeCoder: Error processing configuration of coder");
}

Exhibit.SizeCoder._configure(coder,configuration);
return coder;
};

Exhibit.SizeCoder._configure=function(coder,configuration){
Exhibit.SettingsUtilities.collectSettings(configuration,Exhibit.SizeCoder._settingSpecs,coder._settings);

if("entries"in configuration){
var entries=configuration.entries;
for(var i=0;i<entries.length;i++){
coder._addEntry(entries[i].kase,entries[i].key,entries[i].size);
}
}
}

Exhibit.SizeCoder.prototype.dispose=function(){
this._uiContext=null;
this._settings=null;
};

Exhibit.SizeCoder.prototype._addEntry=function(kase,key,size){
var entry=null;
switch(kase){
case"others":entry=this._othersCase;break;
case"mixed":entry=this._mixedCase;break;
case"missing":entry=this._missingCase;break;
}
if(entry!=null){
entry.label=key;
entry.size=size;
}else{
this._map[key]={size:size};
}
};

Exhibit.SizeCoder.prototype.translate=function(key,flags){
if(key in this._map){
if(flags)flags.keys.add(key);
return this._map[key].size;
}else if(key==null){
if(flags)flags.missing=true;
return this._missingCase.size;
}else{
if(flags)flags.others=true;
return this._othersCase.size;
}
};

Exhibit.SizeCoder.prototype.translateSet=function(keys,flags){
var size=null;
var self=this;
keys.visit(function(key){
var size2=self.translate(key,flags);
if(size==null){
size=size2;
}else if(size!=size2){
if(flags)flags.mixed=true;
size=self._mixedCase.size;
return true;
}
return false;
});

if(size!=null){
return size;
}else{
if(flags)flags.missing=true;
return this._missingCase.size;
}
};

Exhibit.SizeCoder.prototype.getOthersLabel=function(){
return this._othersCase.label;
};
Exhibit.SizeCoder.prototype.getOthersSize=function(){
return this._othersCase.size;
};

Exhibit.SizeCoder.prototype.getMissingLabel=function(){
return this._missingCase.label;
};
Exhibit.SizeCoder.prototype.getMissingSize=function(){
return this._missingCase.size;
};

Exhibit.SizeCoder.prototype.getMixedLabel=function(){
return this._mixedCase.label;
};
Exhibit.SizeCoder.prototype.getMixedSize=function(){
return this._mixedCase.size;
};


/* size-gradient-coder.js */



Exhibit.SizeGradientCoder=function(uiContext){
this._uiContext=uiContext;
this._settings={};

this._log={
func:function(size){return Math.ceil(Math.log(size));},
invFunc:function(size){return Math.ceil(Math.exp(size));}
}
this._linear={
func:function(size){return Math.ceil(size);},
invFunc:function(size){return Math.ceil(size);}
}
this._quad={
func:function(size){return Math.ceil(Math.pow((size/100),2));},
invFunc:function(size){return Math.sqrt(size)*100;}
}
this._exp={
func:function(size){return Math.ceil(Math.exp(size));},
invFunc:function(size){return Math.ceil(Math.log(size));}
}
this._markerScale=this._quad;
this._valueScale=this._linear;

this._gradientPoints=[];
this._mixedCase={label:"mixed",size:20};
this._missingCase={label:"missing",size:20};
this._othersCase={label:"others",size:20};
};

Exhibit.SizeGradientCoder._settingSpecs={
};

Exhibit.SizeGradientCoder.create=function(configuration,uiContext){
var coder=new Exhibit.SizeGradientCoder(Exhibit.UIContext.create(configuration,uiContext));

Exhibit.SizeGradientCoder._configure(coder,configuration);
return coder;
};

Exhibit.SizeGradientCoder.createFromDOM=function(configElmt,uiContext){
configElmt.style.display="none";

var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var coder=new Exhibit.SizeGradientCoder(Exhibit.UIContext.create(configuration,uiContext));

Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt,Exhibit.SizeGradientCoder._settingSpecs,coder._settings);

try{
var markerScale=coder._settings.markerScale;
if(markerScale=="log"){coder._markerScale=coder._log;}
if(markerScale=="linear"){coder._markerScale=coder._linear;}
if(markerScale=="exp"){coder._markerScale=coder._exp;}

var gradientPoints=Exhibit.getAttribute(configElmt,"gradientPoints",";")
for(var i=0;i<gradientPoints.length;i++){
var point=gradientPoints[i].split(',');
var value=parseFloat(point[0]);
var size=coder._markerScale.invFunc(parseFloat(point[1]));
coder._gradientPoints.push({value:value,size:size});
}

var node=configElmt.firstChild;
while(node!=null){
if(node.nodeType==1){
coder._addEntry(
Exhibit.getAttribute(node,"case"),
node.firstChild.nodeValue.trim(),
Exhibit.getAttribute(node,"size"));
}
node=node.nextSibling;
}
}catch(e){
SimileAjax.Debug.exception(e,"SizeGradientCoder: Error processing configuration of coder");
}

Exhibit.SizeGradientCoder._configure(coder,configuration);
return coder;
};

Exhibit.SizeGradientCoder._configure=function(coder,configuration){
Exhibit.SettingsUtilities.collectSettings(configuration,Exhibit.SizeGradientCoder._settingSpecs,coder._settings);

if("entries"in configuration){
var entries=configuration.entries;
for(var i=0;i<entries.length;i++){
coder._addEntry(entries[i].kase,entries[i].key,entries[i].size);
}
}
}

Exhibit.SizeGradientCoder.prototype.dispose=function(){
this._uiContext=null;
this._settings=null;
};

Exhibit.SizeGradientCoder.prototype._addEntry=function(kase,key,size){
var entry=null;
switch(kase){
case"others":entry=this._othersCase;break;
case"mixed":entry=this._mixedCase;break;
case"missing":entry=this._missingCase;break;
}
if(entry!=null){
entry.label=key;
entry.size=size;
}
};

Exhibit.SizeGradientCoder.prototype.translate=function(key,flags){
var self=this;
var gradientPoints=this._gradientPoints;
var getSize=function(key){
if(key.constructor!=Number){
key=parseFloat(key);
}
for(j=0;j<gradientPoints.length;j++){
if(key==gradientPoints[j].value){
return self._markerScale.func(gradientPoints[j].size);
}else if(gradientPoints[j+1]!=null){
if(key<gradientPoints[j+1].value){
var fraction=(key-gradientPoints[j].value)/(gradientPoints[j+1].value-gradientPoints[j].value);
var newSize=Math.floor(gradientPoints[j].size+fraction*(gradientPoints[j+1].size-gradientPoints[j].size));
return self._markerScale.func(newSize);
}
}
}
}

if(key>=gradientPoints[0].value&key<=gradientPoints[gradientPoints.length-1].value){
if(flags)flags.keys.add(key);
return getSize(key);
}else if(key==null){
if(flags)flags.missing=true;
return this._missingCase.size;
}else{
if(flags)flags.others=true;
return this._othersCase.size;
}
};

Exhibit.SizeGradientCoder.prototype.translateSet=function(keys,flags){
var size=null;
var self=this;
keys.visit(function(key){
var size2=self.translate(key,flags);
if(size==null){
size=size2;
}else if(size!=size2){
if(flags)flags.mixed=true;
size=self._mixedCase.size;
return true;
}
return false;
});

if(size!=null){
return size;
}else{
if(flags)flags.missing=true;
return this._missingCase.size;
}
};

Exhibit.SizeGradientCoder.prototype.getOthersLabel=function(){
return this._othersCase.label;
};
Exhibit.SizeGradientCoder.prototype.getOthersSize=function(){
return this._othersCase.size;
};

Exhibit.SizeGradientCoder.prototype.getMissingLabel=function(){
return this._missingCase.label;
};
Exhibit.SizeGradientCoder.prototype.getMissingSize=function(){
return this._missingCase.size;
};

Exhibit.SizeGradientCoder.prototype.getMixedLabel=function(){
return this._mixedCase.label;
};
Exhibit.SizeGradientCoder.prototype.getMixedSize=function(){
return this._mixedCase.size;
};


/* coordinator.js */


Exhibit.Coordinator=function(uiContext){
this._uiContext=uiContext;
this._listeners=[];
}

Exhibit.Coordinator.create=function(configuration,uiContext){
var coordinator=new Exhibit.Coordinator(uiContext);

return coordinator;
};

Exhibit.Coordinator.createFromDOM=function(div,uiContext){
var coordinator=new Exhibit.Coordinator(Exhibit.UIContext.createFromDOM(div,uiContext,false));

return coordinator;
};

Exhibit.Coordinator.prototype.dispose=function(){
this._uiContext.dispose();
this._uiContext=null;
};

Exhibit.Coordinator.prototype.addListener=function(callback){
var listener=new Exhibit.Coordinator._Listener(this,callback);
this._listeners.push(listener);

return listener;
};

Exhibit.Coordinator.prototype._removeListener=function(listener){
for(var i=0;i<this._listeners.length;i++){
if(this._listeners[i]==listener){
this._listeners.splice(i,1);
return;
}
}
};

Exhibit.Coordinator.prototype._fire=function(listener,o){
for(var i=0;i<this._listeners.length;i++){
var listener2=this._listeners[i];
if(listener2!=listener){
listener2._callback(o);
}
}
};

Exhibit.Coordinator._Listener=function(coordinator,callback){
this._coordinator=coordinator;
this._callback=callback;
};

Exhibit.Coordinator._Listener.prototype.dispose=function(){
this._coordinator._removeListener(this);
};

Exhibit.Coordinator._Listener.prototype.fire=function(o){
this._coordinator._fire(this,o);
};



/* list-facet.js */



Exhibit.ListFacet=function(containerElmt,uiContext){
this._div=containerElmt;
this._uiContext=uiContext;

this._expression=null;
this._valueSet=new Exhibit.Set();

this._settings={};
this._dom=null;

var self=this;
this._listener={
onRootItemsChanged:function(){
if("_itemToValue"in self){
delete self._itemToValue;
}
if("_valueToItem"in self){
delete self._valueToItem;
}
}
};
uiContext.getCollection().addListener(this._listener);
};

Exhibit.ListFacet._settingSpecs={
"facetLabel":{type:"text"},
"fixedOrder":{type:"text"},
"sortMode":{type:"text",defaultValue:"value"},
"height":{type:"text"}
};

Exhibit.ListFacet.create=function(configuration,containerElmt,uiContext){
var uiContext=Exhibit.UIContext.create(configuration,uiContext);
var facet=new Exhibit.ListFacet(containerElmt,uiContext);

Exhibit.ListFacet._configure(facet,configuration);

facet._initializeUI();
uiContext.getCollection().addFacet(facet);

return facet;
};

Exhibit.ListFacet.createFromDOM=function(configElmt,containerElmt,uiContext){
var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var uiContext=Exhibit.UIContext.createFromDOM(configElmt,uiContext);
var facet=new Exhibit.ListFacet(
containerElmt!=null?containerElmt:configElmt,
uiContext
);

Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt,Exhibit.ListFacet._settingSpecs,facet._settings);

try{
var expressionString=Exhibit.getAttribute(configElmt,"expression");
if(expressionString!=null&&expressionString.length>0){
facet._expression=Exhibit.ExpressionParser.parse(expressionString);
}

var selection=Exhibit.getAttribute(configElmt,"selection",";");
if(selection!=null&&selection.length>0){
for(var i=0,s;s=selection[i];i++){
facet._valueSet.add(s);
}
}
}catch(e){
SimileAjax.Debug.exception(e,"ListFacet: Error processing configuration of list facet");
}
Exhibit.ListFacet._configure(facet,configuration);

facet._initializeUI();
uiContext.getCollection().addFacet(facet);

return facet;
};

Exhibit.ListFacet._configure=function(facet,configuration){
Exhibit.SettingsUtilities.collectSettings(configuration,Exhibit.ListFacet._settingSpecs,facet._settings);

if("expression"in configuration){
facet._expression=Exhibit.ExpressionParser.parse(configuration.expression);
}
if("selection"in configuration){
var selection=configuration.selection;
for(var i=0;i<selection.length;i++){
facet._valueSet.add(selection[i]);
}
}

if(!("facetLabel"in facet._settings)){
facet._settings.facetLabel="missing ex:facetLabel";
if(facet._expression!=null&&facet._expression.isPath()){
var segment=facet._expression.getPath().getLastSegment();
var property=facet._uiContext.getDatabase().getProperty(segment.property);
if(property!=null){
facet._settings.facetLabel=segment.forward?property.getLabel():property.getReverseLabel();
}
}
}
if("fixedOrder"in facet._settings){
var values=facet._settings.fixedOrder.split(";");
var orderMap={};
for(var i=0;i<values.length;i++){
orderMap[values[i].trim()]=i;
}

facet._orderMap=orderMap;
}
}

Exhibit.ListFacet.prototype.dispose=function(){
this._uiContext.getCollection().removeFacet(this);

this._uiContext.getCollection().removeListener(this._listener);
this._uiContext=null;

this._div.innerHTML="";
this._div=null;
this._dom=null;

this._expression=null;
this._valueSet=null;
this._settings=null;
};

Exhibit.ListFacet.prototype.hasRestrictions=function(){
return this._valueSet.size()>0;
};

Exhibit.ListFacet.prototype.clearAllRestrictions=function(){
var restrictions=[];
if(this._valueSet.size()>0){
this._valueSet.visit(function(v){
restrictions.push(v);
});
this._valueSet=new Exhibit.Set();
this._notifyCollection();
}
return restrictions;
};

Exhibit.ListFacet.prototype.applyRestrictions=function(restrictions){
this._valueSet=new Exhibit.Set();
for(var i=0;i<restrictions.length;i++){
this._valueSet.add(restrictions[i]);
}
this._notifyCollection();
};

Exhibit.ListFacet.prototype.setSelection=function(value,selected){
if(selected){
this._valueSet.add(value);
}else{
this._valueSet.remove(value);
}
this._notifyCollection();
}

Exhibit.ListFacet.prototype.restrict=function(items){
if(this._valueSet.size()==0){
return items;
}else if(this._expression.isPath()){
return this._expression.getPath().walkBackward(
this._valueSet,
"item",items,
this._uiContext.getDatabase()
).getSet();
}else{
this._buildMaps();

var set=new Exhibit.Set();
var valueToItem=this._valueToItem;

this._valueSet.visit(function(value){
if(value in valueToItem){
var itemA=valueToItem[value];
for(var i=0;i<itemA.length;i++){
var item=itemA[i];
if(items.contains(item)){
set.add(item);
}
}
}
});
return set;
}
};

Exhibit.ListFacet.prototype.update=function(items){
this._dom.valuesContainer.style.display="none";
this._dom.valuesContainer.innerHTML="";
this._constructBody(this._computeFacet(items));
this._dom.valuesContainer.style.display="block";
};

Exhibit.ListFacet.prototype._computeFacet=function(items){
var database=this._uiContext.getDatabase();
var entries=[];
var valueType="text";

if(this._expression.isPath()){
var path=this._expression.getPath();
var facetValueResult=path.walkForward(items,"item",database);
valueType=facetValueResult.valueType;

if(facetValueResult.size>0){
facetValueResult.forEachValue(function(facetValue){
var itemSubcollection=path.evaluateBackward(facetValue,valueType,items,database);
entries.push({value:facetValue,count:itemSubcollection.size});
});
};
}else{
this._buildMaps();

valueType=this._valueType;
for(var value in this._valueToItem){
var itemA=this._valueToItem[value];
var count=0;
for(var i=0;i<itemA.length;i++){
if(items.contains(itemA[i])){
count++;
}
}

if(count>0){
entries.push({value:value,count:count});
}
}
}

if(entries.length>0){
var selection=this._valueSet;
var labeler=valueType=="item"?
function(v){var l=database.getObject(v,"label");return l!=null?l:v;}:
function(v){return v;}

for(var i=0;i<entries.length;i++){
var entry=entries[i];
entry.label=labeler(entry.value);
entry.selected=selection.contains(entry.value);
}

var sortValueFunction=function(a,b){return a.label.localeCompare(b.label);};
if("_orderMap"in this){
var orderMap=this._orderMap;

sortValueFunction=function(a,b){
if(a.label in orderMap){
if(b.label in orderMap){
return orderMap[a.label]-orderMap[b.label];
}else{
return-1;
}
}else if(b.label in orderMap){
return 1;
}else{
return a.label.localeCompare(b.label);
}
}
}else if(valueType=="number"){
sortValueFunction=function(a,b){
a=parseFloat(a.value);
b=parseFloat(b.value);
return a<b?-1:a>b?1:0;
}
}

var sortFunction=sortValueFunction;
if(this._settings.sortMode=="count"){
sortFunction=function(a,b){
var c=b.count-a.count;
return c!=0?c:sortFunction(a,b);
}
}

entries.sort(sortFunction);
}
return entries;
}

Exhibit.ListFacet.prototype._notifyCollection=function(){
this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.ListFacet.prototype._initializeUI=function(){
var self=this;
this._dom=Exhibit.FacetUtilities.constructFacetFrame(
this._div,
this._settings.facetLabel,
function(elmt,evt,target){self._clearSelections();},
this._uiContext
);

if("height"in this._settings){
this._dom.valuesContainer.style.height=this._settings.height;
}
};

Exhibit.ListFacet.prototype._constructBody=function(entries){
var self=this;
var containerDiv=this._dom.valuesContainer;

containerDiv.style.display="none";

var facetHasSelection=this._valueSet.size()>0;
var constructValue=function(entry){
var onSelect=function(elmt,evt,target){
self._filter(entry.value,entry.label,false);
SimileAjax.DOM.cancelEvent(evt);
return false;
};
var onSelectOnly=function(elmt,evt,target){
self._filter(entry.value,entry.label,!(evt.ctrlKey||evt.metaKey));
SimileAjax.DOM.cancelEvent(evt);
return false;
};
var elmt=Exhibit.FacetUtilities.constructFacetItem(
entry.label,
entry.count,
entry.selected,
facetHasSelection,
onSelect,
onSelectOnly,
self._uiContext
);
containerDiv.appendChild(elmt);
};

for(var j=0;j<entries.length;j++){
constructValue(entries[j]);
}
containerDiv.style.display="block";

this._dom.setSelectionCount(this._valueSet.size());
};

Exhibit.ListFacet.prototype._filter=function(value,label,singleSelection){
var self=this;
var wasSelected=this._valueSet.contains(value);
var wasOnlyThingSelected=(this._valueSet.size()==1&&wasSelected);
if(singleSelection&&!wasOnlyThingSelected){
var newRestrictions=[value];
var oldRestrictions=[];
this._valueSet.visit(function(v){
oldRestrictions.push(v);
});

SimileAjax.History.addLengthyAction(
function(){self.applyRestrictions(newRestrictions);},
function(){self.applyRestrictions(oldRestrictions);},
String.substitute(
Exhibit.FacetUtilities.l10n["facetSelectOnlyActionTitle"],
[label,this._settings.facetLabel])
);
}else{
SimileAjax.History.addLengthyAction(
function(){self.setSelection(value,!wasSelected);},
function(){self.setSelection(value,wasSelected);},
String.substitute(
Exhibit.FacetUtilities.l10n[wasSelected?"facetUnselectActionTitle":"facetSelectActionTitle"],
[label,this._settings.facetLabel])
);
}
};

Exhibit.ListFacet.prototype._clearSelections=function(){
var state={};
var self=this;
SimileAjax.History.addLengthyAction(
function(){state.restrictions=self.clearAllRestrictions();},
function(){self.applyRestrictions(state.restrictions);},
String.substitute(
Exhibit.FacetUtilities.l10n["facetClearSelectionsActionTitle"],
[this._settings.facetLabel])
);
};

Exhibit.ListFacet.prototype._buildMaps=function(){
if(!("_itemToValue"in this)||!("_valueToItem"in this)){
var itemToValue={};
var valueToItem={};
var valueType="text";

var insert=function(x,y,map){
if(x in map){
map[x].push(y);
}else{
map[x]=[y];
}
};

var expression=this._expression;
var database=this._uiContext.getDatabase();

this._uiContext.getCollection().getAllItems().visit(function(item){
var results=expression.evaluateOnItem(item,database);
if(results.values.size()>0){
valueType=results.valueType;
results.values.visit(function(value){
insert(item,value,itemToValue);
insert(value,item,valueToItem);
});
}
});

this._itemToValue=itemToValue;
this._valueToItem=valueToItem;
this._valueType=valueType;
}
};


/* numeric-range-facet.js */



Exhibit.NumericRangeFacet=function(containerElmt,uiContext){
this._div=containerElmt;
this._uiContext=uiContext;

this._expression=null;
this._settings={};

this._dom=null;
this._ranges=[];

var self=this;
this._listener={
onRootItemsChanged:function(){
if("_rangeIndex"in self){
delete self._rangeIndex;
}
}
};
uiContext.getCollection().addListener(this._listener);
};

Exhibit.NumericRangeFacet._settingSpecs={
"facetLabel":{type:"text"},
"height":{type:"text"},
"interval":{type:"float",defaultValue:10}
};

Exhibit.NumericRangeFacet.create=function(configuration,containerElmt,uiContext){
var uiContext=Exhibit.UIContext.create(configuration,uiContext);
var facet=new Exhibit.NumericRangeFacet(
containerElmt,
uiContext
);

Exhibit.NumericRangeFacet._configure(facet,configuration);

facet._initializeUI();
uiContext.getCollection().addFacet(facet);

return facet;
};

Exhibit.NumericRangeFacet.createFromDOM=function(configElmt,containerElmt,uiContext){
var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var uiContext=Exhibit.UIContext.createFromDOM(configElmt,uiContext);
var facet=new Exhibit.NumericRangeFacet(
containerElmt!=null?containerElmt:configElmt,
uiContext
);

Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt,Exhibit.NumericRangeFacet._settingSpecs,facet._settings);

try{
var expressionString=Exhibit.getAttribute(configElmt,"expression");
if(expressionString!=null&&expressionString.length>0){
facet._expression=Exhibit.ExpressionParser.parse(expressionString);
}
}catch(e){
SimileAjax.Debug.exception(e,"NumericRangeFacet: Error processing configuration of numeric range facet");
}
Exhibit.NumericRangeFacet._configure(facet,configuration);

facet._initializeUI();
uiContext.getCollection().addFacet(facet);

return facet;
};

Exhibit.NumericRangeFacet._configure=function(facet,configuration){
Exhibit.SettingsUtilities.collectSettings(configuration,Exhibit.NumericRangeFacet._settingSpecs,facet._settings);

if("expression"in configuration){
facet._expression=Exhibit.ExpressionParser.parse(configuration.expression);
}

if(!("facetLabel"in facet._settings)){
facet._settings.facetLabel="missing ex:facetLabel";
if(facet._expression!=null&&facet._expression.isPath()){
var segment=facet._expression.getPath().getLastSegment();
var property=facet._uiContext.getDatabase().getProperty(segment.property);
if(property!=null){
facet._settings.facetLabel=segment.forward?property.getLabel():property.getReverseLabel();
}
}
}
}

Exhibit.NumericRangeFacet.prototype.dispose=function(){
this._uiContext.getCollection().removeFacet(this);

this._uiContext.getCollection().removeListener(this._listener);
this._uiContext=null;

this._div.innerHTML="";
this._div=null;
this._dom=null;

this._expression=null;
this._settings=null;
this._ranges=null;
};

Exhibit.NumericRangeFacet.prototype.hasRestrictions=function(){
return this._ranges.length>0;
};

Exhibit.NumericRangeFacet.prototype.clearAllRestrictions=function(){
var restrictions=[];
if(this._ranges.length>0){
restrictions=restrictions.concat(this._ranges);
this._ranges=[];
this._notifyCollection();
}
return restrictions;
};

Exhibit.NumericRangeFacet.prototype.applyRestrictions=function(restrictions){
this._ranges=restrictions;
this._notifyCollection();
};

Exhibit.NumericRangeFacet.prototype.setRange=function(from,to,selected){
if(selected){
for(var i=0;i<this._ranges.length;i++){
var range=this._ranges[i];
if(range.from==from&&range.to==to){
return;
}
}
this._ranges.push({from:from,to:to});
}else{
for(var i=0;i<this._ranges.length;i++){
var range=this._ranges[i];
if(range.from==from&&range.to==to){
this._ranges.splice(i,1);
break;
}
}
}
this._notifyCollection();
}

Exhibit.NumericRangeFacet.prototype.restrict=function(items){
if(this._ranges.length==0){
return items;
}else if(this._expression.isPath()){
var path=this._expression.getPath();
var database=this._uiContext.getDatabase();

var set=new Exhibit.Set();
for(var i=0;i<this._ranges.length;i++){
var range=this._ranges[i];
set.addSet(path.rangeBackward(range.from,range.to,items,database).values);
}
return set;
}else{
this._buildRangeIndex();

var set=new Exhibit.Set();
for(var i=0;i<this._ranges.length;i++){
var range=this._ranges[i];
this._rangeIndex.getSubjectsInRange(range.from,range.to,false,set,items);
}
return set;
}
};

Exhibit.NumericRangeFacet.prototype.update=function(items){
this._dom.valuesContainer.style.display="none";
this._dom.valuesContainer.innerHTML="";

this._reconstruct(items);
this._dom.valuesContainer.style.display="block";
};

Exhibit.NumericRangeFacet.prototype._reconstruct=function(items){
var self=this;
var ranges=[];

var rangeIndex;
var computeItems;
if(this._expression.isPath()){
var database=this._uiContext.getDatabase();
var path=this._expression.getPath();

var propertyID=path.getLastSegment().property;
var property=database.getProperty(propertyID);
if(property==null){
return null;
}

rangeIndex=property.getRangeIndex();
countItems=function(range){
return path.rangeBackward(range.from,range.to,items,database).values.size();
}
}else{
this._buildRangeIndex();

rangeIndex=this._rangeIndex;
countItems=function(range){
return rangeIndex.getSubjectsInRange(range.from,range.to,false,null,items).size();
}
}

var min=rangeIndex.getMin();
var max=rangeIndex.getMax();
min=Math.floor(min/this._settings.interval)*this._settings.interval;
max=Math.ceil(max/this._settings.interval)*this._settings.interval;

for(var x=min;x<max;x+=this._settings.interval){
var range={
from:x,
to:x+this._settings.interval,
selected:false
};
range.count=countItems(range);

for(var i=0;i<this._ranges.length;i++){
var range2=this._ranges[i];
if(range2.from==range.from&&range2.to==range.to){
range.selected=true;
facetHasSelection=true;
break;
}
}

ranges.push(range);
}

var facetHasSelection=this._ranges.length>0;
var containerDiv=this._dom.valuesContainer;
containerDiv.style.display="none";
var makeFacetValue=function(from,to,count,selected){
var onSelect=function(elmt,evt,target){
self._toggleRange(from,to,selected,false);
SimileAjax.DOM.cancelEvent(evt);
return false;
};
var onSelectOnly=function(elmt,evt,target){
self._toggleRange(from,to,selected,!(evt.ctrlKey||evt.metaKey));
SimileAjax.DOM.cancelEvent(evt);
return false;
};
var elmt=Exhibit.FacetUtilities.constructFacetItem(
from+" - "+to,
count,
selected,
facetHasSelection,
onSelect,
onSelectOnly,
self._uiContext
);
containerDiv.appendChild(elmt);
};

for(var i=0;i<ranges.length;i++){
var range=ranges[i];
if(range.selected||range.count>0){
makeFacetValue(range.from,range.to,range.count,range.selected);
}
}
containerDiv.style.display="block";

this._dom.setSelectionCount(this._ranges.length);
}

Exhibit.NumericRangeFacet.prototype._notifyCollection=function(){
this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.NumericRangeFacet.prototype._initializeUI=function(){
var self=this;
this._dom=Exhibit.FacetUtilities.constructFacetFrame(
this._div,
this._settings.facetLabel,
function(elmt,evt,target){self._clearSelections();},
this._uiContext
);

if("height"in this._settings){
this._dom.valuesContainer.style.height=this._settings.height;
}
};

Exhibit.NumericRangeFacet.prototype._toggleRange=function(from,to,wasSelected,singleSelection){
var self=this;
var label=from+" to "+to;
var wasOnlyThingSelected=(this._ranges.length==1&&wasSelected);
if(singleSelection&&!wasOnlyThingSelected){
var newRestrictions=[{from:from,to:to}];
var oldRestrictions=[].concat(this._ranges);

SimileAjax.History.addLengthyAction(
function(){self.applyRestrictions(newRestrictions);},
function(){self.applyRestrictions(oldRestrictions);},
String.substitute(
Exhibit.FacetUtilities.l10n["facetSelectOnlyActionTitle"],
[label,this._settings.facetLabel])
);
}else{
SimileAjax.History.addLengthyAction(
function(){self.setRange(from,to,!wasSelected);},
function(){self.setRange(from,to,wasSelected);},
String.substitute(
Exhibit.FacetUtilities.l10n[wasSelected?"facetUnselectActionTitle":"facetSelectActionTitle"],
[label,this._settings.facetLabel])
);
}
};

Exhibit.NumericRangeFacet.prototype._clearSelections=function(){
var state={};
var self=this;
SimileAjax.History.addLengthyAction(
function(){state.restrictions=self.clearAllRestrictions();},
function(){self.applyRestrictions(state.restrictions);},
String.substitute(
Exhibit.FacetUtilities.l10n["facetClearSelectionsActionTitle"],
[this._settings.facetLabel])
);
};


Exhibit.NumericRangeFacet.prototype._buildRangeIndex=function(){
if(!("_rangeIndex"in this)){
var expression=this._expression;
var database=this._uiContext.getDatabase();
var getter=function(item,f){
expression.evaluateOnItem(item,database).values.visit(function(value){
if(typeof value!="number"){
value=parseFloat(value);
}
if(!isNaN(value)){
f(value);
}
});
};

this._rangeIndex=new Exhibit.Database._RangeIndex(
this._uiContext.getCollection().getAllItems(),
getter
);
}
};


/* text-search-facet.js */



Exhibit.TextSearchFacet=function(containerElmt,uiContext){
this._div=containerElmt;
this._uiContext=uiContext;

this._expressions=[];
this._text=null;

this._settings={};
this._dom=null;
this._timerID=null;

var self=this;
this._listener={
onRootItemsChanged:function(){
if("_itemToValue"in self){
delete self._itemToValue;
}
}
};
uiContext.getCollection().addListener(this._listener);
};

Exhibit.TextSearchFacet._settingSpecs={
};

Exhibit.TextSearchFacet.create=function(configuration,containerElmt,uiContext){
var uiContext=Exhibit.UIContext.create(configuration,uiContext);
var facet=new Exhibit.TextSearchFacet(containerElmt,uiContext);

Exhibit.TextSearchFacet._configure(facet,configuration);

facet._initializeUI();
uiContext.getCollection().addFacet(facet);

return facet;
};

Exhibit.TextSearchFacet.createFromDOM=function(configElmt,containerElmt,uiContext){
var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var uiContext=Exhibit.UIContext.createFromDOM(configElmt,uiContext);
var facet=new Exhibit.TextSearchFacet(
containerElmt!=null?containerElmt:configElmt,
uiContext
);

Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt,Exhibit.TextSearchFacet._settingSpecs,facet._settings);

try{
var s=Exhibit.getAttribute(configElmt,"expressions");
if(s!=null&&s.length>0){
facet._expressions=Exhibit.ExpressionParser.parseSeveral(s);
}
}catch(e){
SimileAjax.Debug.exception(e,"TextSearchFacet: Error processing configuration of list facet");
}
Exhibit.TextSearchFacet._configure(facet,configuration);

facet._initializeUI();
uiContext.getCollection().addFacet(facet);

return facet;
};

Exhibit.TextSearchFacet._configure=function(facet,configuration){
Exhibit.SettingsUtilities.collectSettings(configuration,Exhibit.TextSearchFacet._settingSpecs,facet._settings);

if("expressions"in configuration){
for(var i=0;i<configuration.expressions.length;i++){
facet._expressions.push(Exhibit.ExpressionParser.parse(configuration.expressions[i]));
}
}
if("selection"in configuration){
var selection=configuration.selection;
for(var i=0;i<selection.length;i++){
facet._valueSet.add(selection[i]);
}
}
}

Exhibit.TextSearchFacet.prototype.dispose=function(){
this._uiContext.getCollection().removeFacet(this);

this._uiContext.getCollection().removeListener(this._listener);
this._uiContext=null;

this._div.innerHTML="";
this._div=null;
this._dom=null;

this._expressions=null;
this._itemToValue=null;
this._settings=null;
};

Exhibit.TextSearchFacet.prototype.hasRestrictions=function(){
return this._text!=null;
};

Exhibit.TextSearchFacet.prototype.clearAllRestrictions=function(){
var restrictions=this._text;
if(this._text!=null){
this._text=null;
this._notifyCollection();
}
this._dom.input.value="";

return restrictions;
};

Exhibit.TextSearchFacet.prototype.applyRestrictions=function(restrictions){
this.setText(restrictions);
};

Exhibit.TextSearchFacet.prototype.setText=function(text){
if(text!=null){
text=text.trim();
this._dom.input.value=text;

text=text.length>0?text:null;
}else{
this._dom.input.value="";
}

if(text!=this._text){
this._text=text;
this._notifyCollection();
}
}

Exhibit.TextSearchFacet.prototype.restrict=function(items){
if(this._text==null){
return items;
}else{
this._buildMaps();

var set=new Exhibit.Set();
var itemToValue=this._itemToValue;
var text=this._text.toLowerCase();

items.visit(function(item){
if(item in itemToValue){
var values=itemToValue[item];
for(var v=0;v<values.length;v++){
if(values[v].indexOf(text)>=0){
set.add(item);
break;
}
}
}
});
return set;
}
};

Exhibit.TextSearchFacet.prototype.update=function(items){

};

Exhibit.TextSearchFacet.prototype._notifyCollection=function(){
this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.TextSearchFacet.prototype._initializeUI=function(){
var self=this;
this._dom=Exhibit.TextSearchFacet.constructFacetFrame(this._div);

SimileAjax.WindowManager.registerEvent(this._dom.input,"keyup",
function(elmt,evt,target){self._onTextInputKeyUp();});
};

Exhibit.TextSearchFacet.constructFacetFrame=function(div){
return SimileAjax.DOM.createDOMFromString(
div,
"<div class='exhibit-text-facet'><input type='text' id='input'></div>"
);
};

Exhibit.TextSearchFacet.prototype._onTextInputKeyUp=function(){
if(this._timerID!=null){
window.clearTimeout(this._timerID);
}

var self=this;
this._timerID=window.setTimeout(function(){self._onTimeout();},500);
};

Exhibit.TextSearchFacet.prototype._onTimeout=function(){
this._timerID=null;

var newText=this._dom.input.value.trim();
if(newText.length==0){
newText=null;
}

if(newText!=this._text){
var self=this;
var oldText=this._text;

SimileAjax.History.addLengthyAction(
function(){self.setText(newText);},
function(){self.setText(oldText);},
newText!=null?
String.substitute(
Exhibit.FacetUtilities.l10n["facetTextSearchActionTitle"],
[newText]):
Exhibit.FacetUtilities.l10n["facetClearTextSearchActionTitle"]
);
}
}

Exhibit.TextSearchFacet.prototype._buildMaps=function(){
if(!("_itemToValue"in this)){
var itemToValue={};
var allItems=this._uiContext.getCollection().getAllItems();
var database=this._uiContext.getDatabase();

if(this._expressions.length>0){
var expressions=this._expressions;
allItems.visit(function(item){
var values=[];
for(var x=0;x<expressions.length;x++){
var expression=expressions[x];
expression.evaluateOnItem(item,database).values.visit(function(v){values.push(v.toLowerCase());});
}
itemToValue[item]=values;
});
}else{
var propertyIDs=database.getAllProperties();
allItems.visit(function(item){
var values=[];
for(var p=0;p<propertyIDs.length;p++){
database.getObjects(item,propertyIDs[p]).visit(function(v){values.push(v.toLowerCase());});
}
itemToValue[item]=values;
});
}

this._itemToValue=itemToValue;
}
};


/* format-parser.js */


Exhibit.FormatParser=new Object();

Exhibit.FormatParser.parse=function(uiContext,s,startIndex,results){
startIndex=startIndex||0;
results=results||{};

var scanner=new Exhibit.FormatScanner(s,startIndex);
try{
return Exhibit.FormatParser._internalParse(uiContext,scanner,results,false);
}finally{
results.index=scanner.token()!=null?scanner.token().start:scanner.index();
}
};

Exhibit.FormatParser.parseSeveral=function(uiContext,s,startIndex,results){
startIndex=startIndex||0;
results=results||{};

var scanner=new Exhibit.FormatScanner(s,startIndex);
try{
return Exhibit.FormatParser._internalParse(uiContext,scanner,results,true);
}finally{
results.index=scanner.token()!=null?scanner.token().start:scanner.index();
}
};

Exhibit.FormatParser._valueTypes={
"list":true,
"number":true,
"date":true,
"item":true,
"text":true,
"url":true,
"image":true,
"currency":true
};

Exhibit.FormatParser._internalParse=function(uiContext,scanner,results,several){
var Scanner=Exhibit.FormatScanner;
var token=scanner.token();
var next=function(){scanner.next();token=scanner.token();};
var makePosition=function(){return token!=null?token.start:scanner.index();};
var enterSetting=function(valueType,settingName,value){
uiContext.putSetting("format/"+valueType+"/"+settingName,value);
};
var checkKeywords=function(valueType,settingName,keywords){
if(token!=null&&token.type!=Scanner.IDENTIFIER&&token.value in keywords){
enterSetting(valueType,settingName,keywords[token.value]);
next();
return false;
}
return true;
};

var parseNumber=function(valueType,settingName,keywords){
if(checkKeywords(valueType,settingName,keywords)){
if(token==null||token.type!=Scanner.NUMBER){
throw new Error("Missing number at position "+makePosition());
}
enterSetting(valueType,settingName,token.value);
next();
}
};
var parseInteger=function(valueType,settingName,keywords){
if(checkKeywords(valueType,settingName,keywords)){
if(token==null||token.type!=Scanner.NUMBER){
throw new Error("Missing integer at position "+makePosition());
}
enterSetting(valueType,settingName,Math.round(token.value));
next();
}
};
var parseNonnegativeInteger=function(valueType,settingName,keywords){
if(checkKeywords(valueType,settingName,keywords)){
if(token==null||token.type!=Scanner.NUMBER||token.value<0){
throw new Error("Missing non-negative integer at position "+makePosition());
}
enterSetting(valueType,settingName,Math.round(token.value));
next();
}
};
var parseString=function(valueType,settingName,keywords){
if(checkKeywords(valueType,settingName,keywords)){
if(token==null||token.type!=Scanner.STRING){
throw new Error("Missing string at position "+makePosition());
}
enterSetting(valueType,settingName,token.value);
next();
}
};
var parseURL=function(valueType,settingName,keywords){
if(checkKeywords(valueType,settingName,keywords)){
if(token==null||token.type!=Scanner.URL){
throw new Error("Missing url at position "+makePosition());
}
enterSetting(valueType,settingName,token.value);
next();
}
};
var parseExpression=function(valueType,settingName,keywords){
if(checkKeywords(valueType,settingName,keywords)){
if(token==null||token.type!=Scanner.EXPRESSION){
throw new Error("Missing expression at position "+makePosition());
}
enterSetting(valueType,settingName,token.value);
next();
}
};
var parseExpressionOrString=function(valueType,settingName,keywords){
if(checkKeywords(valueType,settingName,keywords)){
if(token==null||(token.type!=Scanner.EXPRESSION&&token.type!=Scanner.STRING)){
throw new Error("Missing expression or string at position "+makePosition());
}
enterSetting(valueType,settingName,token.value);
next();
}
};
var parseChoices=function(valueType,settingName,choices){
if(token==null||token.type!=Scanner.IDENTIFIER){
throw new Error("Missing option at position "+makePosition());
}
for(var i=0;i<choices.length;i++){
if(token.value==choices[i]){
enterSetting(valueType,settingName,token.value);
next();
return;
}
}
throw new Error(
"Unsupported option "+token.value+
" for setting "+settingName+
" on value type "+valueType+
" found at position "+makePosition());
};
var parseFlags=function(valueType,settingName,flags,counterFlags){
outer:while(token!=null&&token.type==Scanner.IDENTIFIER){
for(var i=0;i<flags.length;i++){
if(token.value==flags[i]){
enterSetting(valueType,settingName+"/"+token.value,true);
next();
continue outer;
}
}
if(token.value in counterFlags){
enterSetting(valueType,settingName+"/"+counterFlags[token.value],false);
next();
continue outer;
}
throw new Error(
"Unsupported flag "+token.value+
" for setting "+settingName+
" on value type "+valueType+
" found at position "+makePosition());
}
};

var parseSetting=function(valueType,settingName){
switch(valueType){
case"number":
switch(settingName){
case"decimal-digits":
parseNonnegativeInteger(valueType,settingName,{"default":-1});
return;
}
break;
case"date":
switch(settingName){
case"time-zone":
parseNumber(valueType,settingName,{"default":null});
return;
case"show":
parseChoices(valueType,settingName,["date","time","date-time"]);
return;
case"mode":
parseChoices(valueType,settingName,["short","medium","long","full"]);
enterSetting(valueType,"template",null);
return;
case"template":
parseString(valueType,settingName,{});
enterSetting(valueType,"mode",null);
return;
}
break;
case"boolean":
switch(settingName){
}
break;
case"text":
switch(settingName){
case"max-length":
parseInteger(valueType,settingName,{"none":0});
return;
}
break;
case"image":
switch(settingName){
case"tooltip":
parseExpressionOrString(valueType,settingName,{"none":null});
return;
case"max-width":
case"max-height":
parseInteger(valueType,settingName,{"none":-1});
return;
}
break;
case"url":
switch(settingName){
case"target":
parseString(valueType,settingName,{"none":null});
return;
case"external-icon":
parseURL(valueType,settingName,{"none":null});
return;
}
break;
case"item":
switch(settingName){
case"title":
parseExpression(valueType,settingName,{"default":null});
return;
}
break;
case"currency":
switch(settingName){
case"negative-format":
parseFlags(valueType,settingName,
["red","parentheses","signed"],
{"unsigned":"signed","no-parenthesis":"parentheses","black":"red"}
);
return;
case"symbol":
parseString(valueType,settingName,{"default":"$","none":null});
return;
case"symbol-placement":
parseChoices(valueType,settingName,["first","last","after-sign"]);
return;
case"decimal-digits":
parseNonnegativeInteger(valueType,settingName,{"default":-1});
return;
}
break;
case"list":
switch(settingName){
case"separator":
case"last-separator":
case"pair-separator":
case"empty-text":
parseString(valueType,settingName,{});
return;
}
break;
}
throw new Error("Unsupported setting called "+settingName+
" for value type "+valueType+" found at position "+makePosition());
};
var parseSettingList=function(valueType){

while(token!=null&&token.type==Scanner.IDENTIFIER){
var settingName=token.value;

next();


if(token==null||token.type!=Scanner.DELIMITER||token.value!=":"){
throw new Error("Missing : at position "+makePosition());
}
next();

parseSetting(valueType,settingName);


if(token==null||token.type!=Scanner.DELIMITER||token.value!=";"){
break;
}else{
next();
}
}

}
var parseRule=function(){
if(token==null||token.type!=Scanner.IDENTIFIER){
throw new Error("Missing value type at position "+makePosition());
}

var valueType=token.value;
if(!(valueType in Exhibit.FormatParser._valueTypes)){
throw new Error("Unsupported value type "+valueType+" at position "+makePosition());
}
next();

if(token!=null&&token.type==Scanner.DELIMITER&&token.value=="{"){
next();
parseSettingList(valueType);

if(token==null||token.type!=Scanner.DELIMITER||token.value!="}"){
throw new Error("Missing } at position "+makePosition());
}
next();
}
return valueType;
};
var parseRuleList=function(){
var valueType="text";
while(token!=null&&token.type==Scanner.IDENTIFIER){
valueType=parseRule();
}
return valueType;
}

if(several){
return parseRuleList();
}else{
return parseRule();
}
};


Exhibit.FormatScanner=function(text,startIndex){
this._text=text+" ";
this._maxIndex=text.length;
this._index=startIndex;
this.next();
};

Exhibit.FormatScanner.DELIMITER=0;
Exhibit.FormatScanner.NUMBER=1;
Exhibit.FormatScanner.STRING=2;
Exhibit.FormatScanner.IDENTIFIER=3;
Exhibit.FormatScanner.URL=4;
Exhibit.FormatScanner.EXPRESSION=5;
Exhibit.FormatScanner.COLOR=6;

Exhibit.FormatScanner.prototype.token=function(){
return this._token;
};

Exhibit.FormatScanner.prototype.index=function(){
return this._index;
};

Exhibit.FormatScanner.prototype.next=function(){
this._token=null;

var self=this;
var skipSpaces=function(x){
while(x<self._maxIndex&&
" \t\r\n".indexOf(self._text.charAt(x))>=0){

x++;
}
return x;
};
this._index=skipSpaces(this._index);

if(this._index<this._maxIndex){
var c1=this._text.charAt(this._index);
var c2=this._text.charAt(this._index+1);

if("{}(),:;".indexOf(c1)>=0){
this._token={
type:Exhibit.FormatScanner.DELIMITER,
value:c1,
start:this._index,
end:this._index+1
};
this._index++;
}else if("\"'".indexOf(c1)>=0){
var i=this._index+1;
while(i<this._maxIndex){
if(this._text.charAt(i)==c1&&this._text.charAt(i-1)!="\\"){
break;
}
i++;
}

if(i<this._maxIndex){
this._token={
type:Exhibit.FormatScanner.STRING,
value:this._text.substring(this._index+1,i).replace(/\\'/g,"'").replace(/\\"/g,'"'),
start:this._index,
end:i+1
};
this._index=i+1;
}else{
throw new Error("Unterminated string starting at "+this._index);
}
}else if(c1=="#"){
var i=this._index+1;
while(i<this._maxIndex&&this._isHexDigit(this._text.charAt(i))){
i++;
}

this._token={
type:Exhibit.FormatScanner.COLOR,
value:this._text.substring(this._index,i),
start:this._index,
end:i
};
this._index=i;
}else if(this._isDigit(c1)){
var i=this._index;
while(i<this._maxIndex&&this._isDigit(this._text.charAt(i))){
i++;
}

if(i<this._maxIndex&&this._text.charAt(i)=="."){
i++;
while(i<this._maxIndex&&this._isDigit(this._text.charAt(i))){
i++;
}
}

this._token={
type:Exhibit.FormatScanner.NUMBER,
value:parseFloat(this._text.substring(this._index,i)),
start:this._index,
end:i
};
this._index=i;
}else{
var i=this._index;
while(i<this._maxIndex){
var j=this._text.substr(i).search(/\W/);
if(j>0){
i+=j;
}else if("-".indexOf(this._text.charAt(i))>=0){
i++;
}else{
break;
}
}

var identifier=this._text.substring(this._index,i);
while(true){
if(identifier=="url"){
var openParen=skipSpaces(i);
if(this._text.charAt(openParen)=="("){
var closeParen=this._text.indexOf(")",openParen);
if(closeParen>0){
this._token={
type:Exhibit.FormatScanner.URL,
value:this._text.substring(openParen+1,closeParen),
start:this._index,
end:closeParen+1
};
this._index=closeParen+1;
break;
}else{
throw new Error("Missing ) to close url at "+this._index);
}
}
}else if(identifier=="expression"){
var openParen=skipSpaces(i);
if(this._text.charAt(openParen)=="("){
var o={};
var expression=Exhibit.ExpressionParser.parse(this._text,openParen+1,o);

var closeParen=skipSpaces(o.index);
if(this._text.charAt(closeParen)==")"){
this._token={
type:Exhibit.FormatScanner.EXPRESSION,
value:expression,
start:this._index,
end:closeParen+1
};
this._index=closeParen+1;
break;
}else{
throw new Error("Missing ) to close expression at "+o.index);
}
}
}

this._token={
type:Exhibit.FormatScanner.IDENTIFIER,
value:identifier,
start:this._index,
end:i
};
this._index=i;
break;
}
}
}
};

Exhibit.FormatScanner.prototype._isDigit=function(c){
return"0123456789".indexOf(c)>=0;
};
Exhibit.FormatScanner.prototype._isHexDigit=function(c){
return"0123456789abcdefABCDEF".indexOf(c)>=0;
};


/* formatter.js */


Exhibit.Formatter=new Object();

Exhibit.Formatter.createListDelimiter=function(parentElmt,count,uiContext){
var separator=uiContext.getSetting("format/list/separator");
var lastSeparator=uiContext.getSetting("format/list/last-separator");
var pairSeparator=uiContext.getSetting("format/list/pair-separator");

var f=function(){
if(f.index>0&&f.index<count){
if(count>2){
parentElmt.appendChild(document.createTextNode(
(f.index==count-1)?lastSeparator:separator));
}else{
parentElmt.appendChild(document.createTextNode(pairSeparator));
}
}
f.index++;
};
f.index=0;

return f;
};

Exhibit.Formatter._lessThanRegex=/</g;
Exhibit.Formatter._greaterThanRegex=/>/g;

Exhibit.Formatter.encodeAngleBrackets=function(s){
return s.replace(Exhibit.Formatter._lessThanRegex,"&lt;").
replace(Exhibit.Formatter._greaterThanRegex,"&gt;");
};


Exhibit.Formatter._ListFormatter=function(uiContext){
this._uiContext=uiContext;
this._separator=uiContext.getSetting("format/list/separator");
this._lastSeparator=uiContext.getSetting("format/list/last-separator");
this._pairSeparator=uiContext.getSetting("format/list/pair-separator");
this._emptyText=uiContext.getSetting("format/list/empty-text");

if(typeof this._separator!="string"){
this._separator=Exhibit.Formatter.l10n.listSeparator;
}
if(typeof this._lastSeparator!="string"){
this._lastSeparator=Exhibit.Formatter.l10n.listLastSeparator;
}
if(typeof this._pairSeparator!="string"){
this._pairSeparator=Exhibit.Formatter.l10n.listPairSeparator;
}
};

Exhibit.Formatter._ListFormatter.prototype.formatList=function(values,count,valueType,appender){
var uiContext=this._uiContext;
var self=this;
if(count==0){
if(this._emptyText!=null&&this._emptyText.length>0){
appender(document.createTextNode(this._emptyText));
}
}else if(count==1){
values.visit(function(v){
uiContext.format(v,valueType,appender);
});
}else{
var index=0;
if(count==2){
values.visit(function(v){
uiContext.format(v,valueType,appender);
index++;

if(index==1){
appender(document.createTextNode(self._pairSeparator));
}
});
}else{
values.visit(function(v){
uiContext.format(v,valueType,appender);
index++;

if(index<count){
appender(document.createTextNode(
(index==count-1)?self._lastSeparator:self._separator));
}
});
}
}
};


Exhibit.Formatter._TextFormatter=function(uiContext){
this._maxLength=uiContext.getSetting("format/text/max-length");

if(typeof this._maxLength=="number"){
this._maxLength=Math.max(3,Math.round(this._maxLength));
}else{
this._maxLength=0;
}
};

Exhibit.Formatter._TextFormatter.prototype.format=function(value,appender){
var span=document.createElement("span");

span.innerHTML=this.formatText(value);
appender(span);
};

Exhibit.Formatter._TextFormatter.prototype.formatText=function(value){
if(Exhibit.params.safe){
value=Exhibit.Formatter.encodeAngleBrackets(value);
}

if(this._maxLength==0||value.length<=this._maxLength){
return value;
}else{
return value.substr(0,this._maxLength)+Exhibit.Formatter.l10n.textEllipsis;
}
};


Exhibit.Formatter._BooleanFormatter=function(uiContext){
};

Exhibit.Formatter._BooleanFormatter.prototype.format=function(value,appender){
var span=document.createElement("span");
span.innerHTML=this.formatText(value);
appender(span);
};

Exhibit.Formatter._BooleanFormatter.prototype.formatText=function(value){
return(typeof value=="boolean"?value:(typeof value=="string"?(value=="true"):false))?
Exhibit.Formatter.l10n.booleanTrue:Exhibit.Formatter.l10n.booleanFalse;
};


Exhibit.Formatter._NumberFormatter=function(uiContext){
this._decimalDigits=uiContext.getSetting("format/number/decimal-digits");

if(typeof this._decimalDigits=="number"){
this._decimalDigits=Math.max(-1,Math.round(this._decimalDigits));
}else{
this._decimalDigits=-1;
}
};

Exhibit.Formatter._NumberFormatter.prototype.format=function(value,appender){
appender(document.createTextNode(this.formatText(value)));
};

Exhibit.Formatter._NumberFormatter.prototype.formatText=function(value){
if(this._decimalDigits==-1){
return value.toString();
}else{
return new Number(value).toFixed(this._decimalDigits);
}
};


Exhibit.Formatter._ImageFormatter=function(uiContext){
this._uiContext=uiContext;

this._maxWidth=uiContext.getSetting("format/image/max-width");
if(typeof this._maxWidth=="number"){
this._maxWidth=Math.max(-1,Math.round(this._maxWidth));
}else{
this._maxWidth=-1;
}

this._maxHeight=uiContext.getSetting("format/image/max-height");
if(typeof this._maxHeight=="number"){
this._maxHeight=Math.max(-1,Math.round(this._maxHeight));
}else{
this._maxHeight=-1;
}

this._tooltip=uiContext.getSetting("format/image/tooltip");
};

Exhibit.Formatter._ImageFormatter.prototype.format=function(value,appender){
if(Exhibit.params.safe){
value=value.trim().startsWith("javascript:")?"":value;
}

var img=document.createElement("img");
img.src=value;

if(this._tooltip!=null){
if(typeof this._tooltip=="string"){
img.title=this._tootlip;
}else{
img.title=this._tooltip.evaluateSingleOnItem(
this._uiContext.getSetting("itemID"),this._uiContext.getDatabase()).value;
}
}
appender(img);
};

Exhibit.Formatter._ImageFormatter.prototype.formatText=function(value){
return value;
};


Exhibit.Formatter._URLFormatter=function(uiContext){
this._target=uiContext.getSetting("format/url/target");
this._externalIcon=uiContext.getSetting("format/url/external-icon");
};

Exhibit.Formatter._URLFormatter.prototype.format=function(value,appender){
var a=document.createElement("a");
a.href=value;
a.innerHTML=value;

if(this._target!=null){
a.target=this._target;
}
if(this._externalIcon!=null){

}
appender(a);
};

Exhibit.Formatter._URLFormatter.prototype.formatText=function(value){
if(Exhibit.params.safe){
value=value.trim().startsWith("javascript:")?"":value;
}
return value;
};


Exhibit.Formatter._CurrencyFormatter=function(uiContext){
this._decimalDigits=uiContext.getSetting("format/currency/decimal-digits");
if(typeof this._decimalDigits=="number"){
this._decimalDigits=Math.max(-1,Math.round(this._decimalDigits));
}else{
this._decimalDigits=2;
}

this._symbol=uiContext.getSetting("format/currency/symbol");
if(this._symbol==null){
this._symbol=Exhibit.Formatter.l10n.currencySymbol;
}

this._symbolPlacement=uiContext.getSetting("format/currency/symbol-placement");
if(this._symbolPlacement==null){
this._symbol=Exhibit.Formatter.l10n.currencySymbolPlacement;
}

this._negativeFormat={
signed:uiContext.getBooleanSetting("format/currency/negative-format/signed",Exhibit.Formatter.l10n.currencyShowSign),
red:uiContext.getBooleanSetting("format/currency/negative-format/red",Exhibit.Formatter.l10n.currencyShowRed),
parentheses:uiContext.getBooleanSetting("format/currency/negative-format/parentheses",Exhibit.Formatter.l10n.currencyShowParentheses)
};
};

Exhibit.Formatter._CurrencyFormatter.prototype.format=function(value,appender){
var text=this.formatText(value);
if(value<0&&this._negativeFormat.red){
var span=document.createElement("span");
span.innerHTML=text;
span.style.color="red";
appender(span);
}else{
appender(document.createTextNode(text));
}
};

Exhibit.Formatter._CurrencyFormatter.prototype.formatText=function(value){
var negative=value<0;
var text;
if(this._decimalDigits==-1){
text=Math.abs(value);
}else{
text=new Number(Math.abs(value)).toFixed(this._decimalDigits);
}

var sign=(negative&&this._negativeFormat.signed)?"-":"";
if(negative&&this._negativeFormat.parentheses){
text="("+text+")";
}

switch(this._negativeFormat){
case"first":text=this._symbol+sign+text;break;
case"after-sign":text=sign+this._symbol+text;break;
case"last":text=sign+text+this._symbol;break;
}
return text;
};


Exhibit.Formatter._ItemFormatter=function(uiContext){
this._uiContext=uiContext;
this._title=uiContext.getSetting("format/item/title");
};

Exhibit.Formatter._ItemFormatter.prototype.format=function(value,appender){
var self=this;
var title=this.formatText(value);

var a=SimileAjax.DOM.createElementFromString(
"<a href=\""+Exhibit.Persistence.getItemLink(value)+"\" class='exhibit-item'>"+title+"</a>");

var handler=function(elmt,evt,target){
Exhibit.UI.showItemInPopup(value,elmt,self._uiContext);
}
SimileAjax.WindowManager.registerEvent(a,"click",handler,this._uiContext.getSetting("layer"));

appender(a);
};

Exhibit.Formatter._ItemFormatter.prototype.formatText=function(value){
var database=this._uiContext.getDatabase();
var title=null;

if(this._title==null){
title=database.getObject(value,"label");
}else{
title=this._title.evaluateSingleOnItem(value,database).value;
}

if(title==null){
title=value;
}

return title;
};


Exhibit.Formatter._DateFormatter=function(uiContext){
this._timeZone=uiContext.getSetting("format/date/time-zone");
if(!(typeof this._timeZone=="number")){
this._timeZone=-(new Date().getTimezoneOffset())/60;
}
this._timeZoneOffset=this._timeZone*3600000;

var mode=uiContext.getSetting("format/date/mode");
var show=uiContext.getSetting("format/date/show");
var template=null;

switch(mode){
case"short":
template=
show=="date"?Exhibit.Formatter.l10n.dateShortFormat:
(show=="time"?Exhibit.Formatter.l10n.timeShortFormat:
Exhibit.Formatter.l10n.dateTimeShortFormat);
break;
case"medium":
template=
show=="date"?Exhibit.Formatter.l10n.dateMediumFormat:
(show=="time"?Exhibit.Formatter.l10n.timeMediumFormat:
Exhibit.Formatter.l10n.dateTimeMediumFormat);
break;
case"long":
template=
show=="date"?Exhibit.Formatter.l10n.dateLongFormat:
(show=="time"?Exhibit.Formatter.l10n.timeLongFormat:
Exhibit.Formatter.l10n.dateTimeLongFormat);
break;
case"full":
template=
show=="date"?Exhibit.Formatter.l10n.dateFullFormat:
(show=="time"?Exhibit.Formatter.l10n.timeFullFormat:
Exhibit.Formatter.l10n.dateTimeFullFormat);
break;
default:
template=uiContext.getSetting("format/date/template");
}

if(typeof template!="string"){
template=Exhibit.Formatter.l10n.dateTimeDefaultFormat;
}

var segments=[];

var placeholders=template.match(/\b\w+\b/g);
var startIndex=0;
for(var p=0;p<placeholders.length;p++){
var placeholder=placeholders[p];
var index=template.indexOf(placeholder,startIndex);
if(index>startIndex){
segments.push(template.substring(startIndex,index));
}

var retriever=Exhibit.Formatter._DateFormatter._retrievers[placeholder];
if(typeof retriever=="function"){
segments.push(retriever);
}else{
segments.push(placeholder);
}

startIndex=index+placeholder.length;
}

if(startIndex<template.length){
segments.push(template.substr(startIndex));
}

this._segments=segments;
};

Exhibit.Formatter._DateFormatter.prototype.format=function(value,appender){
appender(document.createTextNode(this.formatText(value)));
};

Exhibit.Formatter._DateFormatter.prototype.formatText=function(value){
var date=(value instanceof Date)?value:SimileAjax.DateTime.parseIso8601DateTime(value);
if(date==null){
return value;
}

date.setTime(date.getTime()+this._timeZoneOffset);

var text="";
var segments=this._segments;
for(var i=0;i<segments.length;i++){
var segment=segments[i];
if(typeof segment=="string"){
text+=segment;
}else{
text+=segment(date);
}
}
return text;
};

Exhibit.Formatter._DateFormatter._pad=function(n){
return n<10?("0"+n):n.toString();
};
Exhibit.Formatter._DateFormatter._pad3=function(n){
return n<10?("00"+n):(n<100?("0"+n):n.toString());
};

Exhibit.Formatter._DateFormatter._retrievers={

"d":function(date){
return date.getUTCDate().toString();
},
"dd":function(date){
return Exhibit.Formatter._DateFormatter._pad(date.getUTCDate());
},


"EEE":function(date){
return Exhibit.Formatter.l10n.shortDaysOfWeek[date.getUTCDay()];
},
"EEEE":function(date){
return Exhibit.Formatter.l10n.daysOfWeek[date.getUTCDay()];
},


"MM":function(date){
return Exhibit.Formatter._DateFormatter._pad(date.getUTCMonth()+1);
},
"MMM":function(date){
return Exhibit.Formatter.l10n.shortMonths[date.getUTCMonth()];
},
"MMMM":function(date){
return Exhibit.Formatter.l10n.months[date.getUTCMonth()];
},


"yy":function(date){
return Exhibit.Formatter._DateFormatter._pad(date.getUTCFullYear()%100);
},
"yyyy":function(date){
var y=date.getUTCFullYear();
return y>0?y.toString():(1-y);
},


"G":function(date){
var y=date.getUTCYear();
return y>0?Exhibit.Formatter.l10n.commonEra:Exhibit.Formatter.l10n.beforeCommonEra;
},


"HH":function(date){
return Exhibit.Formatter._DateFormatter._pad(date.getUTCHours());
},
"hh":function(date){
var h=date.getUTCHours();
return Exhibit.Formatter._DateFormatter._pad(h==0?12:(h>12?h-12:h));
},
"h":function(date){
var h=date.getUTCHours();
return(h==0?12:(h>12?h-12:h)).toString();
},


"a":function(date){
return date.getUTCHours()<12?Exhibit.Formatter.l10n.beforeNoon:Exhibit.Formatter.l10n.afterNoon;
},
"A":function(date){
return date.getUTCHours()<12?Exhibit.Formatter.l10n.BeforeNoon:Exhibit.Formatter.l10n.AfterNoon;
},


"mm":function(date){
return Exhibit.Formatter._DateFormatter._pad(date.getUTCMinutes());
},


"ss":function(date){
return Exhibit.Formatter._DateFormatter._pad(date.getUTCSeconds());
},


"S":function(date){
return Exhibit.Formatter._DateFormatter._pad3(date.getUTCMilliseconds());
}

};


Exhibit.Formatter._constructors={
"number":Exhibit.Formatter._NumberFormatter,
"date":Exhibit.Formatter._DateFormatter,
"text":Exhibit.Formatter._TextFormatter,
"boolean":Exhibit.Formatter._BooleanFormatter,
"image":Exhibit.Formatter._ImageFormatter,
"url":Exhibit.Formatter._URLFormatter,
"item":Exhibit.Formatter._ItemFormatter,
"currency":Exhibit.Formatter._CurrencyFormatter
};


/* lens.js */



Exhibit.LensRegistry=function(parentRegistry){
this._parentRegistry=parentRegistry;
this._defaultLens=null;
this._typeToLens={};
this._lensSelectors=[];
};

Exhibit.LensRegistry.prototype.registerDefaultLens=function(elmtOrURL){
this._defaultLens=elmtOrURL;
};

Exhibit.LensRegistry.prototype.registerLensForType=function(elmtOrURL,type){
this._typeToLens[type]=elmtOrURL;
};

Exhibit.LensRegistry.prototype.addLensSelector=function(lensSelector){
this._lensSelectors.unshift(lensSelector);
};

Exhibit.LensRegistry.prototype.getLens=function(itemID,database){
for(var i=0;i<this._lensSelectors.length;i++){
var lens=this._lensSelectors[i](itemID,database);
if(lens!=null){
return lens;
}
}

var type=database.getObject(itemID,"type");
if(type in this._typeToLens){
return this._typeToLens[type];
}
if(this._defaultLens!=null){
return this._defaultLens;
}
if(this._parentRegistry){
return this._parentRegistry.getLens(itemID,database);
}
return null;
};

Exhibit.LensRegistry.prototype.createLens=function(itemID,div,uiContext){
var lens=new Exhibit.Lens();

var lensTemplate=this.getLens(itemID,uiContext.getDatabase());
if(lensTemplate==null){
lens._constructDefaultUI(itemID,div,uiContext);
}else if(typeof lensTemplate=="string"){
lens._constructFromLensTemplateURL(itemID,div,uiContext,lensTemplate);
}else{
lens._constructFromLensTemplateDOM(itemID,div,uiContext,lensTemplate);
}
return lens;
};


Exhibit.Lens=function(){
};

Exhibit.Lens._commonProperties=null;
Exhibit.Lens.prototype._constructDefaultUI=function(itemID,div,uiContext){
var database=uiContext.getDatabase();

if(Exhibit.Lens._commonProperties==null){
Exhibit.Lens._commonProperties=database.getAllProperties();
}
var properties=Exhibit.Lens._commonProperties;

var label=database.getObject(itemID,"label");
label=label!=null?label:itemID;

if(Exhibit.params.safe){
label=Exhibit.Formatter.encodeAngleBrackets(label);
}

var template={
elmt:div,
className:"exhibit-lens",
children:[
{tag:"div",
className:"exhibit-lens-title",
title:label,
children:[
label+" (",
{tag:"a",
href:Exhibit.Persistence.getItemLink(itemID),
target:"_blank",
children:[Exhibit.l10n.itemLinkLabel]
},
")"
]
},
{tag:"div",
className:"exhibit-lens-body",
children:[
{tag:"table",
className:"exhibit-lens-properties",
field:"propertiesTable"
}
]
}
]
};
var dom=SimileAjax.DOM.createDOMFromTemplate(template);

div.setAttribute("ex:itemID",itemID);


var pairs=Exhibit.ViewPanel.getPropertyValuesPairs(
itemID,properties,database);

for(var j=0;j<pairs.length;j++){
var pair=pairs[j];

var tr=dom.propertiesTable.insertRow(j);
tr.className="exhibit-lens-property";

var tdName=tr.insertCell(0);
tdName.className="exhibit-lens-property-name";
tdName.innerHTML=pair.propertyLabel+": ";

var tdValues=tr.insertCell(1);
tdValues.className="exhibit-lens-property-values";

if(pair.valueType=="item"){
for(var m=0;m<pair.values.length;m++){
if(m>0){
tdValues.appendChild(document.createTextNode(", "));
}
tdValues.appendChild(Exhibit.UI.makeItemSpan(pair.values[m],null,uiContext));
}
}else{
for(var m=0;m<pair.values.length;m++){
if(m>0){
tdValues.appendChild(document.createTextNode(", "));
}
tdValues.appendChild(Exhibit.UI.makeValueSpan(pair.values[m],pair.valueType));
}
}
}
};

Exhibit.Lens._compiledTemplates={};
Exhibit.Lens._handlers=[
"onblur","onfocus",
"onkeydown","onkeypress","onkeyup",
"onmousedown","onmouseenter","onmouseleave","onmousemove","onmouseout","onmouseover","onmouseup","onclick",
"onresize","onscroll"
];

Exhibit.Lens.prototype._constructFromLensTemplateURL=
function(itemID,div,uiContext,lensTemplateURL){

var job={
lens:this,
itemID:itemID,
div:div,
uiContext:uiContext
};

var compiledTemplate=Exhibit.Lens._compiledTemplates[lensTemplateURL];
if(compiledTemplate==null){
Exhibit.Lens._startCompilingTemplate(lensTemplateURL,job);
}else if(!compiledTemplate.compiled){
compiledTemplate.jobs.push(job);
}else{
job.template=compiledTemplate;
Exhibit.Lens._performConstructFromLensTemplateJob(job);
}
};

Exhibit.Lens.prototype._constructFromLensTemplateDOM=
function(itemID,div,uiContext,lensTemplateNode){

var job={
lens:this,
itemID:itemID,
div:div,
uiContext:uiContext
};

var id=lensTemplateNode.id;
if(id==null||id.length==0){
id="exhibitLensTemplate"+Math.floor(Math.random()*10000);
lensTemplateNode.id=id;
}

var compiledTemplate=Exhibit.Lens._compiledTemplates[id];
if(compiledTemplate==null){
compiledTemplate={
url:id,
template:Exhibit.Lens._compileTemplate(lensTemplateNode,false),
compiled:true,
jobs:[]
};
Exhibit.Lens._compiledTemplates[id]=compiledTemplate;
}
job.template=compiledTemplate;
Exhibit.Lens._performConstructFromLensTemplateJob(job);
};

Exhibit.Lens._startCompilingTemplate=function(lensTemplateURL,job){
var compiledTemplate={
url:lensTemplateURL,
template:null,
compiled:false,
jobs:[job]
};
Exhibit.Lens._compiledTemplates[lensTemplateURL]=compiledTemplate;

var fError=function(statusText,status,xmlhttp){
SimileAjax.Debug.log("Failed to load view template from "+lensTemplateURL+"\n"+statusText);
};
var fDone=function(xmlhttp){
try{
compiledTemplate.template=Exhibit.Lens._compileTemplate(
xmlhttp.responseXML.documentElement,true);
compiledTemplate.compiled=true;

for(var i=0;i<compiledTemplate.jobs.length;i++){
try{
var job=compiledTemplate.jobs[i];
job.template=compiledTemplate;
Exhibit.Lens._performConstructFromLensTemplateJob(job);
}catch(e){
SimileAjax.Debug.exception(e,"Lens: Error constructing lens template in job queue");
}
}
compiledTemplate.jobs=null;
}catch(e){
SimileAjax.Debug.exception(e,"Lens: Error compiling lens template and processing template job queue");
}
};

SimileAjax.XmlHttp.get(lensTemplateURL,fError,fDone);

return compiledTemplate;
};

Exhibit.Lens._compileTemplate=function(rootNode,isXML){
return Exhibit.Lens._processTemplateNode(rootNode,isXML);
};

Exhibit.Lens._processTemplateNode=function(node,isXML){
if(node.nodeType==1){
return Exhibit.Lens._processTemplateElement(node,isXML);
}else{
return node.nodeValue;
}
};

Exhibit.Lens._processTemplateElement=function(elmt,isXML){
var templateNode={
tag:elmt.tagName,
control:null,
condition:null,
content:null,
contentAttributes:null,
subcontentAttributes:null,
attributes:[],
styles:[],
handlers:[],
children:null
};

var parseChildTextNodes=true;

var attributes=elmt.attributes;
for(var i=0;i<attributes.length;i++){
var attribute=attributes[i];
var name=attribute.nodeName;
var value=attribute.nodeValue;

if(value==null||typeof value!="string"||value.length==0||name=="contentEditable"){
continue;
}
if(name.length>3&&name.substr(0,3)=="ex:"){
name=name.substr(3);
if(name=="control"){
templateNode.control=value;
}else if(name=="content"){
templateNode.content=Exhibit.ExpressionParser.parse(value);
}else if(name=="if-exists"){
templateNode.condition={
test:"if-exists",
expression:Exhibit.ExpressionParser.parse(value)
};
}else if(name=="if"){
templateNode.condition={
test:"if",
expression:Exhibit.ExpressionParser.parse(value)
};
parseChildTextNodes=false;
}else if(name=="select"){
templateNode.condition={
test:"select",
expression:Exhibit.ExpressionParser.parse(value)
};
}else if(name=="case"){
templateNode.condition={
test:"case",
value:value
};
parseChildTextNodes=false;
}else{
var isStyle=false;
var x=name.indexOf("-style-content");
if(x>0){
isStyle=true;
}else{
x=name.indexOf("-content");
}

if(x>0){
if(templateNode.contentAttributes==null){
templateNode.contentAttributes=[];
}
templateNode.contentAttributes.push({
name:name.substr(0,x),
expression:Exhibit.ExpressionParser.parse(value),
isStyle:isStyle
});
}else{
x=name.indexOf("-style-subcontent");
if(x>0){
isStyle=true;
}else{
x=name.indexOf("-subcontent");
}

if(x>0){
if(templateNode.subcontentAttributes==null){
templateNode.subcontentAttributes=[];
}
templateNode.subcontentAttributes.push({
name:name.substr(0,x),
fragments:Exhibit.Lens._parseSubcontentAttribute(value),
isStyle:isStyle
});
}
}
}
}else{
if(name=="style"){
Exhibit.Lens._processStyle(templateNode,value);
}else if(name!="id"){
if(name=="class"){
if(SimileAjax.Platform.browser.isIE){
name="className";
}
}else if(name=="cellspacing"){
name="cellSpacing";
}else if(name=="cellpadding"){
name="cellPadding";
}else if(name=="bgcolor"){
name="bgColor";
}

templateNode.attributes.push({
name:name,
value:value
});
}
}
}

if(!isXML&&SimileAjax.Platform.browser.isIE){




var handlers=Exhibit.Lens._handlers;
for(var h=0;h<handlers.length;h++){
var handler=handlers[h];
var code=elmt[handler];
if(code!=null){
templateNode.handlers.push({name:handler,code:code});
}
}
}

var childNode=elmt.firstChild;
if(childNode!=null){
templateNode.children=[];
while(childNode!=null){
if((parseChildTextNodes&&childNode.nodeType==3)||childNode.nodeType==1){
templateNode.children.push(Exhibit.Lens._processTemplateNode(childNode,isXML));
}
childNode=childNode.nextSibling;
}
}
return templateNode;
};

Exhibit.Lens._processStyle=function(templateNode,styleValue){
var styles=styleValue.split(";");
for(var s=0;s<styles.length;s++){
var pair=styles[s].split(":");
if(pair.length>1){
var n=pair[0].trim();
var v=pair[1].trim();
if(n=="float"){
n=SimileAjax.Platform.browser.isIE?"styleFloat":"cssFloat";
}else if(n=="-moz-opacity"){
n="MozOpacity";
}else{
if(n.indexOf("-")>0){
var segments=n.split("-");
n=segments[0];
for(var x=1;x<segments.length;x++){
n+=segments[x].substr(0,1).toUpperCase()+segments[x].substr(1);
}
}
}
templateNode.styles.push({name:n,value:v});
}
}
};

Exhibit.Lens._parseSubcontentAttribute=function(value){
var fragments=[];
var current=0;
var open;
while(current<value.length&&(open=value.indexOf("{{",current))>=0){
var close=value.indexOf("}}",open);
if(close<0){
break;
}

fragments.push(value.substring(current,open));
fragments.push(Exhibit.ExpressionParser.parse(value.substring(open+2,close)));

current=close+2;
}
if(current<value.length){
fragments.push(value.substr(current));
}
return fragments;
};

Exhibit.Lens._performConstructFromLensTemplateJob=function(job){
Exhibit.Lens._constructFromLensTemplateNode(
{"value":job.itemID
},
{"value":"item"
},
job.template.template,
job.div,
job.uiContext,
job
);

var node=job.div.firstChild;
var tagName=node.tagName;
if(tagName=="span"){
node.style.display="inline";
}else{
node.style.display="block";
}

job.div.setAttribute("ex:itemID",job.itemID);

};

Exhibit.Lens._constructFromLensTemplateNode=function(
roots,rootValueTypes,templateNode,parentElmt,uiContext,job
){
if(typeof templateNode=="string"){
parentElmt.appendChild(document.createTextNode(templateNode));
return;
}

var database=uiContext.getDatabase();
var children=templateNode.children;
if(templateNode.condition!=null){
if(templateNode.condition.test=="if-exists"){
if(!templateNode.condition.expression.testExists(
roots,
rootValueTypes,
"value",
database
)){
return;
}
}else if(templateNode.condition.test=="if"){
if(templateNode.condition.expression.evaluate(
roots,
rootValueTypes,
"value",
database
).values.contains(true)){

if(children!=null&&children.length>0){
Exhibit.Lens._constructFromLensTemplateNode(
roots,rootValueTypes,children[0],parentElmt,uiContext,job);
}
}else{
if(children!=null&&children.length>1){
Exhibit.Lens._constructFromLensTemplateNode(
roots,rootValueTypes,children[1],parentElmt,uiContext,job);
}
}
return;
}else if(templateNode.condition.test=="select"){
var values=templateNode.condition.expression.evaluate(
roots,
rootValueTypes,
"value",
database
).values;

if(children!=null){
var lastChildTemplateNode=null;
for(var c=0;c<children.length;c++){
var childTemplateNode=children[c];
if(childTemplateNode.condition!=null&&
childTemplateNode.condition.test=="case"){

if(values.contains(childTemplateNode.condition.value)){
Exhibit.Lens._constructFromLensTemplateNode(
roots,rootValueTypes,childTemplateNode,parentElmt,uiContext,job);

return;
}
}else if(typeof childTemplateNode!="string"){
lastChildTemplateNode=childTemplateNode;
}
}
}

if(lastChildTemplateNode!=null){
Exhibit.Lens._constructFromLensTemplateNode(
roots,rootValueTypes,lastChildTemplateNode,parentElmt,uiContext,job);
}
return;
}
}

var elmt=Exhibit.Lens._constructElmtWithAttributes(templateNode,parentElmt,database);
if(templateNode.contentAttributes!=null){
var contentAttributes=templateNode.contentAttributes;
for(var i=0;i<contentAttributes.length;i++){
var attribute=contentAttributes[i];
var values=[];

attribute.expression.evaluate(
roots,
rootValueTypes,
"value",
database
).values.visit(function(v){values.push(v);});

var value=values.join(";");
if(attribute.isStyle){
elmt.style[attribute.name]=value;
}else if("class"==attribute.name){
elmt.className=value;
}else{
elmt.setAttribute(attribute.name,value);
}
}
}
if(templateNode.subcontentAttributes!=null){
var subcontentAttributes=templateNode.subcontentAttributes;
for(var i=0;i<subcontentAttributes.length;i++){
var attribute=subcontentAttributes[i];
var fragments=attribute.fragments;
var results="";
for(var r=0;r<fragments.length;r++){
var fragment=fragments[r];
if(typeof fragment=="string"){
results+=fragment;
}else{
results+=fragment.evaluateSingle(
roots,
rootValueTypes,
"value",
database
).value;
}
}

if(attribute.isStyle){
elmt.style[attribute.name]=results;
}else if("class"==attribute.name){
elmt.className=results;
}else{
elmt.setAttribute(attribute.name,results);
}
}
}
var handlers=templateNode.handlers;
for(var h=0;h<handlers.length;h++){
var handler=handlers[h];
elmt[handler.name]=handler.code;
}

if(templateNode.control!=null){
switch(templateNode.control){
case"item-link":
var a=document.createElement("a");
a.innerHTML=Exhibit.l10n.itemLinkLabel;
a.href=Exhibit.Persistence.getItemLink(roots["value"]);
a.target="_blank";
elmt.appendChild(a);
}
}else if(templateNode.content!=null){
var results=templateNode.content.evaluate(
roots,
rootValueTypes,
"value",
database
);
if(children!=null){
var rootValueTypes2={"value":results.valueType,"index":"number"};
var index=1;

var processOneValue=function(childValue){
var roots2={"value":childValue,"index":index++};
for(var i=0;i<children.length;i++){
Exhibit.Lens._constructFromLensTemplateNode(
roots2,rootValueTypes2,children[i],elmt,uiContext,job);
}
};
if(results.values instanceof Array){
for(var i=0;i<results.values.length;i++){
processOneValue(results.values[i]);
}
}else{
results.values.visit(processOneValue);
}
}else{
Exhibit.Lens._constructDefaultValueList(results.values,results.valueType,elmt,uiContext);
}
}else if(children!=null){
for(var i=0;i<children.length;i++){
Exhibit.Lens._constructFromLensTemplateNode(roots,rootValueTypes,children[i],elmt,uiContext,job);
}
}
};

Exhibit.Lens._constructElmtWithAttributes=function(templateNode,parentElmt,database){
var elmt;
switch(templateNode.tag){
case"tr":
elmt=parentElmt.insertRow(parentElmt.rows.length);
break;
case"td":
elmt=parentElmt.insertCell(parentElmt.cells.length);
break;
default:
elmt=document.createElement(templateNode.tag);
parentElmt.appendChild(elmt);
}

var attributes=templateNode.attributes;
for(var i=0;i<attributes.length;i++){
var attribute=attributes[i];
elmt.setAttribute(attribute.name,attribute.value);
}
var styles=templateNode.styles;
for(var i=0;i<styles.length;i++){
var style=styles[i];
elmt.style[style.name]=style.value;
}
return elmt;
};

Exhibit.Lens._constructDefaultValueList=function(values,valueType,parentElmt,uiContext){
uiContext.formatList(values,values.size(),valueType,function(elmt){
parentElmt.appendChild(elmt);
});
};


/* ui-context.js */


Exhibit.UIContext=function(){
this._parent=null;

this._exhibit=null;
this._collection=null;
this._lensRegistry=new Exhibit.LensRegistry();
this._settings={};

this._formatters={};
this._listFormatter=null;
};

Exhibit.UIContext.createRootContext=function(configuration,exhibit){
var context=new Exhibit.UIContext();
context._exhibit=exhibit;

var settings=Exhibit.UIContext.l10n.initialSettings;
for(var n in settings){
context._settings[n]=settings[n];
}

var formats=Exhibit.getAttribute(document.body,"formats");
if(formats!=null&&formats.length>0){
Exhibit.FormatParser.parseSeveral(context,formats,0,{});
}

Exhibit.SettingsUtilities.collectSettingsFromDOM(
document.body,Exhibit.UIContext._settingSpecs,context._settings);

Exhibit.UIContext._configure(context,configuration);

return context;
};

Exhibit.UIContext.create=function(configuration,parentUIContext,ignoreLenses){
var context=Exhibit.UIContext._createWithParent(parentUIContext);
Exhibit.UIContext._configure(context,configuration,ignoreLenses);

return context;
};

Exhibit.UIContext.createFromDOM=function(configElmt,parentUIContext,ignoreLenses){
var context=Exhibit.UIContext._createWithParent(parentUIContext);

if(!(ignoreLenses)){
Exhibit.UIContext.registerLensesFromDOM(configElmt,context.getLensRegistry());
}

var id=Exhibit.getAttribute(configElmt,"collectionID");
if(id!=null&&id.length>0){
context._collection=context._exhibit.getCollection(id);
}

var formats=Exhibit.getAttribute(configElmt,"formats");
if(formats!=null&&formats.length>0){
Exhibit.FormatParser.parseSeveral(context,formats,0,{});
}

Exhibit.SettingsUtilities.collectSettingsFromDOM(
configElmt,Exhibit.UIContext._settingSpecs,context._settings);

Exhibit.UIContext._configure(context,Exhibit.getConfigurationFromDOM(configElmt),ignoreLenses);

return context;
};


Exhibit.UIContext.prototype.dispose=function(){
};

Exhibit.UIContext.prototype.getParentUIContext=function(){
return this._parent;
};

Exhibit.UIContext.prototype.getExhibit=function(){
return this._exhibit;
};

Exhibit.UIContext.prototype.getDatabase=function(){
return this.getExhibit().getDatabase();
};

Exhibit.UIContext.prototype.getCollection=function(){
if(this._collection==null){
if(this._parent!=null){
this._collection=this._parent.getCollection();
}else{
this._collection=this._exhibit.getDefaultCollection();
}
}
return this._collection;
};

Exhibit.UIContext.prototype.getLensRegistry=function(){
return this._lensRegistry;
};

Exhibit.UIContext.prototype.getSetting=function(name){
return name in this._settings?
this._settings[name]:
(this._parent!=null?this._parent.getSetting(name):undefined);
};

Exhibit.UIContext.prototype.getBooleanSetting=function(name,defaultValue){
var v=this.getSetting(name);
return v==undefined||v==null?defaultValue:v;
};

Exhibit.UIContext.prototype.putSetting=function(name,value){
this._settings[name]=value;
};

Exhibit.UIContext.prototype.format=function(value,valueType,appender){
var f;
if(valueType in this._formatters){
f=this._formatters[valueType];
}else{
f=this._formatters[valueType]=
new Exhibit.Formatter._constructors[valueType](this);
}
f.format(value,appender);
};

Exhibit.UIContext.prototype.formatList=function(iterator,count,valueType,appender){
if(this._listFormatter==null){
this._listFormatter=new Exhibit.Formatter._ListFormatter(this);
}
this._listFormatter.formatList(iterator,count,valueType,appender);
};


Exhibit.UIContext._createWithParent=function(parent){
var context=new Exhibit.UIContext();

context._parent=parent;
context._exhibit=parent._exhibit;
context._lensRegistry=new Exhibit.LensRegistry(parent.getLensRegistry());

return context;
};

Exhibit.UIContext._settingSpecs={
"bubbleWidth":{type:"int"},
"bubbleHeight":{type:"int"}
};

Exhibit.UIContext._configure=function(context,configuration,ignoreLenses){
Exhibit.UIContext.registerLenses(configuration,context.getLensRegistry());

if("collectionID"in configuration){
context._collection=context._exhibit.getCollection(configuration["collectionID"]);
}

if("formats"in configuration){
Exhibit.FormatParser.parseSeveral(context,configuration.formats,0,{});
}

if(!(ignoreLenses)){
Exhibit.SettingsUtilities.collectSettings(
configuration,Exhibit.UIContext._settingSpecs,context._settings);
}
};


Exhibit.UIContext.registerLens=function(configuration,lensRegistry){
var template=configuration.templateFile;
if(template!=null){
if("itemTypes"in configuration){
for(var i=0;i<configuration.itemTypes.length;i++){
lensRegistry.registerLensForType(template,configuration.itemTypes[i]);
}
}else{
lensRegistry.registerDefaultLens(template);
}
}
};

Exhibit.UIContext.registerLensFromDOM=function(elmt,lensRegistry){
elmt.style.display="none";

var itemTypes=Exhibit.getAttribute(elmt,"itemTypes",",");
var template=null;

var url=Exhibit.getAttribute(elmt,"templateFile");
if(url!=null&&url.length>0){
template=url;
}else{
var id=Exhibit.getAttribute(elmt,"template");
var elmt2=document.getElementById(id);
if(elmt2!=null){
template=elmt2;
}else{
template=elmt;
}
}

if(template!=null){
if(itemTypes==null||itemTypes.length==0||(itemTypes.length==1&&itemTypes[0]=="")){
lensRegistry.registerDefaultLens(template);
}else{
for(var i=0;i<itemTypes.length;i++){
lensRegistry.registerLensForType(template,itemTypes[i]);
}
}
}
};

Exhibit.UIContext.registerLenses=function(configuration,lensRegistry){
if("lenses"in configuration){
for(var i=0;i<configuration.lenses.length;i++){
Exhibit.UIContext.registerLens(configuration.lenses[i],lensRegistry);
}
}
if("lensSelector"in configuration){
var lensSelector=configuration.lensSelector;
if(typeof lensSelector=="function"){
lensRegistry.addLensSelector(lensSelector);
}else{
SimileAjax.Debug.log("lensSelector is not a function");
}
}
};

Exhibit.UIContext.registerLensesFromDOM=function(parentNode,lensRegistry){
var node=parentNode.firstChild;
while(node!=null){
if(node.nodeType==1){
var role=Exhibit.getRoleAttribute(node);
if(role=="lens"){
Exhibit.UIContext.registerLensFromDOM(node,lensRegistry);
}
}
node=node.nextSibling;
}

var lensSelectorString=Exhibit.getAttribute(parentNode,"lensSelector");
if(lensSelectorString!=null&&lensSelectorString.length>0){
try{
var lensSelector=eval(lensSelectorString);
if(typeof lensSelector=="function"){
lensRegistry.addLensSelector(lensSelector);
}else{
SimileAjax.Debug.log("lensSelector expression "+lensSelectorString+" is not a function");
}
}catch(e){
SimileAjax.Debug.exception(e,"Bad lensSelector expression: "+lensSelectorString);
}
}
};

Exhibit.UIContext.createLensRegistry=function(configuration,parentLensRegistry){
var lensRegistry=new Exhibit.LensRegistry(parentLensRegistry);
Exhibit.UIContext.registerLenses(configuration,lensRegistry);

return lensRegistry;
};

Exhibit.UIContext.createLensRegistryFromDOM=function(parentNode,configuration,parentLensRegistry){
var lensRegistry=new Exhibit.LensRegistry(parentLensRegistry);
Exhibit.UIContext.registerLensesFromDOM(parentNode,lensRegistry);
Exhibit.UIContext.registerLenses(configuration,lensRegistry);

return lensRegistry;
};


/* ui.js */


Exhibit.UI=new Object();


Exhibit.UI.create=function(configuration,elmt,uiContext){
if("role"in configuration){
var role=configuration.role;
if(role!=null&&role.startsWith("exhibit-")){
role=role.substr("exhibit-".length);
}

switch(role){
case"lens":
Exhibit.UIContext.registerLens(configuration,uiContext.getLensRegistry());
return null;
case"view":
return Exhibit.UI.createView(configuration,elmt,uiContext);
case"facet":
return Exhibit.UI.createFacet(configuration,elmt,uiContext);
case"coordinator":
return Exhibit.UI.createCoordinator(configuration,uiContext);
case"coder":
return Exhibit.UI.createCoder(configuration,uiContext);
case"viewPanel":
return Exhibit.ViewPanel.create(configuration,elmt,uiContext);
case"logo":
return Exhibit.Logo.create(configuration,elmt,uiContext);
case"hiddenContent":
elmt.style.display="none";
return null;
}
}
return null;
};

Exhibit.UI.createFromDOM=function(elmt,uiContext){
var role=Exhibit.getRoleAttribute(elmt);
switch(role){
case"lens":
Exhibit.UIContext.registerLensFromDOM(elmt,uiContext.getLensRegistry());
return null;
case"view":
return Exhibit.UI.createViewFromDOM(elmt,null,uiContext);
case"facet":
return Exhibit.UI.createFacetFromDOM(elmt,null,uiContext);
case"coordinator":
return Exhibit.UI.createCoordinatorFromDOM(elmt,uiContext);
case"coder":
return Exhibit.UI.createCoderFromDOM(elmt,uiContext);
case"viewPanel":
return Exhibit.ViewPanel.createFromDOM(elmt,uiContext);
case"logo":
return Exhibit.Logo.createFromDOM(elmt,uiContext);
case"hiddenContent":
elmt.style.display="none";
return null;
}
return null;
};

Exhibit.UI.createView=function(configuration,elmt,uiContext){
var viewClass="viewClass"in configuration?configuration.viewClass:Exhibit.TileView;
return viewClass.create(configuration,elmt,uiContext);
};

Exhibit.UI.createViewFromDOM=function(elmt,container,uiContext){
var viewClass=Exhibit.UI.viewClassNameToViewClass(Exhibit.getAttribute(elmt,"viewClass"));
return viewClass.createFromDOM(elmt,container,uiContext);
};

Exhibit.UI.viewClassNameToViewClass=function(name){
if(name!=null&&name.length>0){
try{
return Exhibit.UI._stringToObject(name,"View");
}catch(e){
SimileAjax.Debug.warn("Unknown viewClass "+name);
}
}
return Exhibit.TileView;
};

Exhibit.UI.createFacet=function(configuration,elmt,uiContext){
var facetClass="facetClass"in configuration?configuration.facetClass:Exhibit.ListFacet;
return facetClass.create(configuration,elmt,uiContext);
};

Exhibit.UI.createFacetFromDOM=function(elmt,container,uiContext){
var facetClassString=Exhibit.getAttribute(elmt,"facetClass");
var facetClass=Exhibit.ListFacet;
if(facetClassString!=null&&facetClassString.length>0){
try{
facetClass=Exhibit.UI._stringToObject(facetClassString,"Facet");
}catch(e){
SimileAjax.Debug.exception(e,"Unknown facetClass "+facetClassString);
}
}

return facetClass.createFromDOM(elmt,container,uiContext);
};

Exhibit.UI.createCoder=function(configuration,uiContext){
var coderClass="coderClass"in configuration?configuration.coderClass:Exhibit.ColorCoder;
return coderClass.create(configuration,uiContext);
};

Exhibit.UI.createCoderFromDOM=function(elmt,uiContext){
var coderClassString=Exhibit.getAttribute(elmt,"coderClass");
var coderClass=Exhibit.ColorCoder;
if(coderClassString!=null&&coderClassString.length>0){
try{
coderClass=Exhibit.UI._stringToObject(coderClassString,"Coder");
}catch(e){
SimileAjax.Debug.exception(e,"Unknown coderClass "+coderClassString);
}
}

return coderClass.createFromDOM(elmt,uiContext);
};

Exhibit.UI.createCoordinator=function(configuration,uiContext){
return Exhibit.Coordinator.create(configuration,uiContext);
};

Exhibit.UI.createCoordinatorFromDOM=function(elmt,uiContext){
return Exhibit.Coordinator.createFromDOM(elmt,uiContext);
};

Exhibit.UI._stringToObject=function(name,suffix){
if(!name.startsWith("Exhibit.")){
if(!name.endsWith(suffix)){
try{
return eval("Exhibit."+name+suffix);
}catch(e){

}
}

try{
return eval("Exhibit."+name);
}catch(e){

}
}

if(!name.endsWith(suffix)){
try{
return eval(name+suffix);
}catch(e){

}
}

try{
return eval(name);
}catch(e){

}

throw new Error("Unknown class "+name);
};


Exhibit.UI.docRoot="http://simile.mit.edu/wiki/";
Exhibit.UI.validator="http://simile.mit.edu/babel/validator";

Exhibit.UI.showHelp=function(message,url,target){
target=(target)?target:"_blank";
if(url!=null){
if(window.confirm(message+"\n\n"+Exhibit.l10n.showDocumentationMessage)){
window.open(url,target);
}
}else{
window.alert(message);
}
};

Exhibit.UI.showJavascriptExpressionValidation=function(message,expression){
var target="_blank";
if(window.confirm(message+"\n\n"+Exhibit.l10n.showJavascriptValidationMessage)){
window.open(Exhibit.UI.validator+"?expresson="+encodeURIComponent(expression),target);
}
};

Exhibit.UI.showJsonFileValidation=function(message,url){
var target="_blank";
if(url.indexOf("file:")==0){
if(window.confirm(message+"\n\n"+Exhibit.l10n.showJsonValidationFormMessage)){
window.open(Exhibit.UI.validator,target);
}
}else{
if(window.confirm(message+"\n\n"+Exhibit.l10n.showJsonValidationMessage)){
window.open(Exhibit.UI.validator+"?url="+url,target);
}
}
};


Exhibit.UI._busyIndicator=null;
Exhibit.UI._busyIndicatorCount=0;

Exhibit.UI.showBusyIndicator=function(){
Exhibit.UI._busyIndicatorCount++;
if(Exhibit.UI._busyIndicatorCount>1){
return;
}

if(Exhibit.UI._busyIndicator==null){
Exhibit.UI._busyIndicator=Exhibit.UI.createBusyIndicator();
}

var scrollTop=("scrollTop"in document.body)?
document.body.scrollTop:
document.body.parentNode.scrollTop;
var height=("innerHeight"in window)?
window.innerHeight:
("clientHeight"in document.body?
document.body.clientHeight:
document.body.parentNode.clientHeight);

var top=Math.floor(scrollTop+height/3);

Exhibit.UI._busyIndicator.style.top=top+"px";
document.body.appendChild(Exhibit.UI._busyIndicator);
};

Exhibit.UI.hideBusyIndicator=function(){
Exhibit.UI._busyIndicatorCount--;
if(Exhibit.UI._busyIndicatorCount>0){
return;
}

try{
document.body.removeChild(Exhibit.UI._busyIndicator);
}catch(e){

}
};


Exhibit.UI.protectUI=function(elmt){
SimileAjax.DOM.appendClassName(elmt,"exhibit-ui-protection");
};

Exhibit.UI.makeActionLink=function(text,handler,layer){
var a=document.createElement("a");
a.href="javascript:";
a.className="exhibit-action";
a.innerHTML=text;

var handler2=function(elmt,evt,target){
if("true"!=elmt.getAttribute("disabled")){
handler(elmt,evt,target);
}
}
SimileAjax.WindowManager.registerEvent(a,"click",handler2,layer);

return a;
};

Exhibit.UI.enableActionLink=function(a,enabled){
a.setAttribute("disabled",enabled?"false":"true");
a.className=enabled?"exhibit-action":"exhibit-action-disabled";
};

Exhibit.UI.makeItemSpan=function(itemID,label,uiContext,layer){
if(label==null){
label=database.getObject(itemID,"label");
if(label==null){
label=itemID;
}
}

var a=SimileAjax.DOM.createElementFromString(
"<a href=\""+Exhibit.Persistence.getItemLink(itemID)+"\" class='exhibit-item'>"+label+"</a>");

var handler=function(elmt,evt,target){
Exhibit.UI.showItemInPopup(itemID,elmt,uiContext);
}
SimileAjax.WindowManager.registerEvent(a,"click",handler,layer);

return a;
};

Exhibit.UI.makeValueSpan=function(label,valueType,layer){
var span=document.createElement("span");
span.className="exhibit-value";
if(valueType=="url"){
var url=label;
if(Exhibit.params.safe&&url.trim().startsWith("javascript:")){
span.appendChild(document.createTextNode(url));
}else{
span.innerHTML=
"<a href=\""+url+"\" target='_blank'>"+
(label.length>50?
label.substr(0,20)+" ... "+label.substr(label.length-20):
label)+
"</a>";
}
}else{
if(Exhibit.params.safe){
label=Exhibit.Formatter.encodeAngleBrackets(label);
}
span.innerHTML=label;
}
return span;
};

Exhibit.UI.showItemInPopup=function(itemID,elmt,uiContext){
var coords=SimileAjax.DOM.getPageCoordinates(elmt);
var itemLensDiv=document.createElement("div");
var itemLens=uiContext.getLensRegistry().createLens(itemID,itemLensDiv,uiContext);
SimileAjax.Graphics.createBubbleForContentAndPoint(
itemLensDiv,
coords.left+Math.round(elmt.offsetWidth/2),
coords.top+Math.round(elmt.offsetHeight/2),
uiContext.getSetting("bubbleWidth")
);
};

Exhibit.UI.createButton=function(name,handler,className){
var button=document.createElement("button");
button.className=(className||"exhibit-button")+" screen";
button.innerHTML=name;
if(handler){
SimileAjax.WindowManager.registerEvent(button,"click",handler);
}
return button;
};

Exhibit.UI.createPopupMenuDom=function(element){
var div=document.createElement("div");
div.className="exhibit-menu-popup exhibit-ui-protection";

var dom={
elmt:div,
close:function(){
document.body.removeChild(this.elmt);
},
open:function(){
var self=this;
this.layer=SimileAjax.WindowManager.pushLayer(function(){self.close();},true,div);

var docWidth=document.body.offsetWidth;
var docHeight=document.body.offsetHeight;

var coords=SimileAjax.DOM.getPageCoordinates(element);
div.style.top=(coords.top+element.scrollHeight)+"px";
div.style.right=(docWidth-(coords.left+element.scrollWidth))+"px";

document.body.appendChild(this.elmt);
},
appendMenuItem:function(label,icon,onClick){
var self=this;
var a=document.createElement("a");
a.className="exhibit-menu-item";
a.href="javascript:";
SimileAjax.WindowManager.registerEvent(a,"click",function(elmt,evt,target){
onClick(elmt,evt,target);
SimileAjax.WindowManager.popLayer(self.layer);
SimileAjax.DOM.cancelEvent(evt);
return false;
});

var div=document.createElement("div");
a.appendChild(div);

div.appendChild(SimileAjax.Graphics.createTranslucentImage(
icon!=null?icon:(Exhibit.urlPrefix+"images/blank-16x16.png")));

div.appendChild(document.createTextNode(label));

this.elmt.appendChild(a);
},
appendSeparator:function(){
var hr=document.createElement("hr");
this.elmt.appendChild(hr);
}
};
return dom;
};

Exhibit.UI.createBusyIndicator=function(){
var urlPrefix=Exhibit.urlPrefix+"images/";
var containerDiv=document.createElement("div");
if(SimileAjax.Graphics.pngIsTranslucent){

var topDiv=document.createElement("div");
topDiv.style.height="33px";
topDiv.style.background="url("+urlPrefix+"message-bubble/message-top-left.png) top left no-repeat";
topDiv.style.paddingLeft="44px";
containerDiv.appendChild(topDiv);

var topRightDiv=document.createElement("div");
topRightDiv.style.height="33px";
topRightDiv.style.background="url("+urlPrefix+"message-bubble/message-top-right.png) top right no-repeat";
topDiv.appendChild(topRightDiv);

var middleDiv=document.createElement("div");
middleDiv.style.background="url("+urlPrefix+"message-bubble/message-left.png) top left repeat-y";
middleDiv.style.paddingLeft="44px";
containerDiv.appendChild(middleDiv);

var middleRightDiv=document.createElement("div");
middleRightDiv.style.background="url("+urlPrefix+"message-bubble/message-right.png) top right repeat-y";
middleRightDiv.style.paddingRight="44px";
middleDiv.appendChild(middleRightDiv);

var contentDiv=document.createElement("div");
middleRightDiv.appendChild(contentDiv);

var bottomDiv=document.createElement("div");
bottomDiv.style.height="55px";
bottomDiv.style.background="url("+urlPrefix+"message-bubble/message-bottom-left.png) bottom left no-repeat";
bottomDiv.style.paddingLeft="44px";
containerDiv.appendChild(bottomDiv);

var bottomRightDiv=document.createElement("div");
bottomRightDiv.style.height="55px";
bottomRightDiv.style.background="url("+urlPrefix+"message-bubble/message-bottom-right.png) bottom right no-repeat";
bottomDiv.appendChild(bottomRightDiv);
}else{
containerDiv.style.border="2px solid #7777AA";
containerDiv.style.padding="20px";
containerDiv.style.background="white";
SimileAjax.Graphics.setOpacity(containerDiv,90);

var contentDiv=document.createElement("div");
containerDiv.appendChild(contentDiv);
}

containerDiv.className="exhibit-busyIndicator";
contentDiv.className="exhibit-busyIndicator-content";

var img=document.createElement("img");
img.src=urlPrefix+"progress-running.gif";
contentDiv.appendChild(img);
contentDiv.appendChild(document.createTextNode(" "+Exhibit.l10n.busyIndicatorMessage));

return containerDiv;
};

Exhibit.UI.createFocusDialogBox=function(itemID,exhibit,configuration){
var template={
tag:"div",
className:"exhibit-focusDialog exhibit-ui-protection",
children:[
{tag:"div",
className:"exhibit-focusDialog-viewContainer",
field:"viewContainer"
},
{tag:"div",
className:"exhibit-focusDialog-controls",
children:[
{tag:"button",
field:"closeButton",
children:[Exhibit.l10n.focusDialogBoxCloseButtonLabel]
}
]
}
]
};
var dom=SimileAjax.DOM.createDOMFromTemplate(template);
dom.close=function(){
document.body.removeChild(dom.elmt);
};
dom.open=function(){
dom.layer=SimileAjax.WindowManager.pushLayer(function(){dom.close();},false);
var lens=new Exhibit.Lens(itemID,dom.viewContainer,exhibit,configuration);

dom.elmt.style.top=(document.body.scrollTop+100)+"px";
document.body.appendChild(dom.elmt);

SimileAjax.WindowManager.registerEvent(
dom.closeButton,
"click",
function(elmt,evt,target){
SimileAjax.WindowManager.popLayer(dom.layer);
SimileAjax.DOM.cancelEvent(evt);
return false;
},
dom.layer
);
};

return dom;
};

Exhibit.UI.createTranslucentImage=function(relativeUrl,verticalAlign){
return SimileAjax.Graphics.createTranslucentImage(Exhibit.urlPrefix+relativeUrl,verticalAlign);
};
Exhibit.UI.createTranslucentImageHTML=function(relativeUrl,verticalAlign){
return SimileAjax.Graphics.createTranslucentImageHTML(Exhibit.urlPrefix+relativeUrl,verticalAlign);
};


/* html-view.js */



Exhibit.HTMLView=function(containerElmt,uiContext,html){
this.html=html;
this.view=this.moveChildNodes(html,containerElmt);

};

Exhibit.HTMLView.create=Exhibit.HTMLView.createFromDOM=function(
configElmt,
containerElmt,
uiContext
){
return new Exhibit.HTMLView(
containerElmt!=null?containerElmt:configElmt,
null,
configElmt
);
};

Exhibit.HTMLView.prototype.dispose=function(){



this.html=this.moveChildNodes(this.view,this.html);
this.view=this.html=null;
};

Exhibit.HTMLView.prototype.moveChildNodes=function(src,dst){
if(src===dst)return dst;
var tmp=document.createDocumentFragment();
while(src.firstChild)
tmp.appendChild(src.firstChild);
dst.appendChild(tmp);
return dst;
};


/* ordered-view-frame.js */



Exhibit.OrderedViewFrame=function(uiContext){
this._uiContext=uiContext;

this._orders=null;
this._possibleOrders=null;
this._settings={};
};

Exhibit.OrderedViewFrame._settingSpecs={
"showAll":{type:"boolean",defaultValue:false},
"grouped":{type:"boolean",defaultValue:true},
"showDuplicates":{type:"boolean",defaultValue:false},
"abbreviatedCount":{type:"int",defaultValue:10},
"showHeader":{type:"boolean",defaultValue:true},
"showSummary":{type:"boolean",defaultValue:true},
"showControls":{type:"boolean",defaultValue:true},
"showFooter":{type:"boolean",defaultValue:true}
};

Exhibit.OrderedViewFrame.prototype.configure=function(configuration){
if("orders"in configuration){
this._orders=[];
this._configureOrders(configuration.orders);
}
if("possibleOrders"in configuration){
this._possibleOrders=[];
this._configurePossibleOrders(configuration.possibleOrders);
}

Exhibit.SettingsUtilities.collectSettings(
configuration,Exhibit.OrderedViewFrame._settingSpecs,this._settings);

this._internalValidate();
};

Exhibit.OrderedViewFrame.prototype.configureFromDOM=function(domConfiguration){
var orders=Exhibit.getAttribute(domConfiguration,"orders",",");
if(orders!=null&&orders.length>0){
this._orders=[];
this._configureOrders(orders);
}

var directions=Exhibit.getAttribute(domConfiguration,"directions",",");
if(directions!=null&&directions.length>0&&this._orders!=null){
for(var i=0;i<directions.length&&i<this._orders.length;i++){
this._orders[i].ascending=(directions[i].toLowerCase()!="descending");
}
}

var possibleOrders=Exhibit.getAttribute(domConfiguration,"possibleOrders",",");
if(possibleOrders!=null&&possibleOrders.length>0){
this._possibleOrders=[];
this._configurePossibleOrders(possibleOrders);
}

var possibleDirections=Exhibit.getAttribute(domConfiguration,"possibleDirections",",");
if(possibleDirections!=null&&possibleDirections.length>0&&this._possibleOrders!=null){
for(var i=0;i<possibleDirections.length&&i<this._possibleOrders.length;i++){
this._possibleOrders.ascending=(possibleDirections[i].toLowerCase()!="descending");
}
}

Exhibit.SettingsUtilities.collectSettingsFromDOM(
domConfiguration,Exhibit.OrderedViewFrame._settingSpecs,this._settings);

this._internalValidate();
}

Exhibit.OrderedViewFrame.prototype.dispose=function(){
if(this._headerDom){
this._headerDom.dispose();
this._headerDom=null;
}
if(this._footerDom){
this._footerDom.dispose();
this._footerDom=null;
}

this._divHeader=null;
this._divFooter=null;
this._uiContext=null;
};

Exhibit.OrderedViewFrame.prototype._internalValidate=function(){
if(this._orders!=null&&this._orders.length==0){
this._orders=null;
}
if(this._possibleOrders!=null&&this._possibleOrders.length==0){
this._possibleOrders=null;
}
};

Exhibit.OrderedViewFrame.prototype._configureOrders=function(orders){
for(var i=0;i<orders.length;i++){
var order=orders[i];
var expr;
var ascending=true;

if(typeof order=="string"){
expr=order;
}else if(typeof order=="object"){
expr=order.expression,
ascending=("ascending"in order)?(order.ascending):true;
}else{
SimileAjax.Debug.warn("Bad order object "+order);
continue;
}

try{
var expression=Exhibit.ExpressionParser.parse(expr);
if(expression.isPath()){
var path=expression.getPath();
if(path.getSegmentCount()==1){
var segment=path.getSegment(0);
this._orders.push({
property:segment.property,
forward:segment.forward,
ascending:ascending
});
}
}
}catch(e){
SimileAjax.Debug.warn("Bad order expression "+expr);
}
}
};

Exhibit.OrderedViewFrame.prototype._configurePossibleOrders=function(possibleOrders){
for(var i=0;i<possibleOrders.length;i++){
var order=possibleOrders[i];
var expr;
var ascending=true;

if(typeof order=="string"){
expr=order;
}else if(typeof order=="object"){
expr=order.expression,
ascending=("ascending"in order)?(order.ascending):true;
}else{
SimileAjax.Debug.warn("Bad possible order object "+order);
continue;
}

try{
var expression=Exhibit.ExpressionParser.parse(expr);
if(expression.isPath()){
var path=expression.getPath();
if(path.getSegmentCount()==1){
var segment=path.getSegment(0);
this._possibleOrders.push({
property:segment.property,
forward:segment.forward,
ascending:ascending
});
}
}
}catch(e){
SimileAjax.Debug.warn("Bad possible order expression "+expr);
}
}
};

Exhibit.OrderedViewFrame.prototype.initializeUI=function(){
var self=this;
if(this._settings.showHeader){
this._headerDom=Exhibit.OrderedViewFrame.createHeaderDom(
this._uiContext,
this._divHeader,
this._settings.showSummary,
this._settings.showControls,
function(elmt,evt,target){self._openSortPopup(elmt,-1);},
function(elmt,evt,target){self._toggleGroup();}
);
}
if(this._settings.showFooter){
this._footerDom=Exhibit.OrderedViewFrame.createFooterDom(
this._uiContext,
this._divFooter,
function(elmt,evt,target){self._setShowAll(true);},
function(elmt,evt,target){self._setShowAll(false);}
);
}
};

Exhibit.OrderedViewFrame.prototype.reconstruct=function(){
var self=this;
var collection=this._uiContext.getCollection();
var database=this._uiContext.getDatabase();

var originalSize=collection.countAllItems();
var currentSize=collection.countRestrictedItems();

var hasSomeGrouping=false;
if(currentSize>0){
var currentSet=collection.getRestrictedItems();

hasSomeGrouping=this._internalReconstruct(currentSet);


var orderElmts=[];
var buildOrderElmt=function(order,index){
var property=database.getProperty(order.property);
var label=property!=null?
(order.forward?property.getPluralLabel():property.getReversePluralLabel()):
(order.forward?order.property:"reverse of "+order.property);

orderElmts.push(Exhibit.UI.makeActionLink(
label,
function(elmt,evt,target){
self._openSortPopup(elmt,index);
}
));
};
var orders=this._getOrders();
for(var i=0;i<orders.length;i++){
buildOrderElmt(orders[i],i);
}

if(this._settings.showHeader&&this._settings.showControls){
this._headerDom.setOrders(orderElmts);
this._headerDom.enableThenByAction(orderElmts.length<this._getPossibleOrders().length);
}
}

if(this._settings.showHeader&&this._settings.showControls){
this._headerDom.groupOptionWidget.setChecked(this._settings.grouped);
}
if(this._settings.showFooter){
this._footerDom.setCounts(
currentSize,
this._settings.abbreviatedCount,
this._settings.showAll,
!(hasSomeGrouping&&this._grouped)
);
}
};

Exhibit.OrderedViewFrame.prototype._internalReconstruct=function(allItems){
var self=this;
var settings=this._settings;
var database=this._uiContext.getDatabase();
var orders=this._getOrders();
var itemIndex=0;

var hasSomeGrouping=false;
var createItem=function(itemID){
if((hasSomeGrouping&&settings.grouped)||settings.showAll||itemIndex<settings.abbreviatedCount){
self.onNewItem(itemID,itemIndex++);
}
};
var createGroup=function(label,valueType,index){
if((hasSomeGrouping&&settings.grouped)||settings.showAll||itemIndex<settings.abbreviatedCount){
self.onNewGroup(label,valueType,index);
}
};

var processLevel=function(items,index){
var order=orders[index];
var values=order.forward?
database.getObjectsUnion(items,order.property):
database.getSubjectsUnion(items,order.property);

var valueType="text";
if(order.forward){
var property=database.getProperty(order.property);
valueType=property!=null?property.getValueType():"text";
}else{
valueType="item";
}

var keys=(valueType=="item"||valueType=="text")?
processNonNumericLevel(items,index,values,valueType):
processNumericLevel(items,index,values,valueType);

var grouped=false;
for(var k=0;k<keys.length;k++){
if(keys[k].items.size()>1){
grouped=true;
}
}

if(grouped){
hasSomeGrouping=true;
}

for(var k=0;k<keys.length;k++){
var key=keys[k];
if(key.items.size()>0){
if(grouped&&settings.grouped){
createGroup(key.display,valueType,index);
}

items.removeSet(key.items);
if(key.items.size()>1&&index<orders.length-1){
processLevel(key.items,index+1);
}else{
key.items.visit(createItem);
}
}
}

if(items.size()>0){
if(grouped&&settings.grouped){
createGroup(Exhibit.l10n.missingSortKey,valueType,index);
}

if(items.size()>1&&index<orders.length-1){
processLevel(items,index+1);
}else{
items.visit(createItem);
}
}
};

var processNonNumericLevel=function(items,index,values,valueType){
var keys=[];
var compareKeys;
var retrieveItems;
var order=orders[index];

if(valueType=="item"){
values.visit(function(itemID){
var label=database.getObject(itemID,"label");
label=label!=null?label:itemID;
keys.push({itemID:itemID,display:label});
});

compareKeys=function(key1,key2){
var c=key1.display.localeCompare(key2.display);
return c!=0?c:key1.itemID.localeCompare(key2.itemID);
};

retrieveItems=order.forward?function(key){
return database.getSubjects(key.itemID,order.property,null,items);
}:function(key){
return database.getObjects(key.itemID,order.property,null,items);
};
}else{
values.visit(function(value){
keys.push({display:value});
});

compareKeys=function(key1,key2){
return key1.display.localeCompare(key2.display);
};
retrieveItems=order.forward?function(key){
return database.getSubjects(key.display,order.property,null,items);
}:function(key){
return database.getObjects(key.display,order.property,null,items);
};
}

keys.sort(function(key1,key2){
return(order.ascending?1:-1)*compareKeys(key1,key2);
});

for(var k=0;k<keys.length;k++){
var key=keys[k];
key.items=retrieveItems(key);
if(!settings.showDuplicates){
items.removeSet(key.items);
}
}

return keys;
};

var processNumericLevel=function(items,index,values,valueType){
var keys=[];
var keyMap={};
var order=orders[index];

var valueParser;
if(valueType=="number"){
valueParser=function(value){
if(typeof value=="number"){
return value;
}else{
try{
return parseFloat(value);
}catch(e){
return null;
}
}
};
}else{
valueParser=function(value){
if(value instanceof Date){
return value.getTime();
}else{
try{
return SimileAjax.DateTime.parseIso8601DateTime(value.toString()).getTime();
}catch(e){
return null;
}
}
};
}

values.visit(function(value){
var sortkey=valueParser(value);
if(sortkey!=null){
var key=keyMap[sortkey];
if(!key){
key={sortkey:sortkey,display:value,values:[],items:new Exhibit.Set()};
keyMap[sortkey]=key;
keys.push(key);
}
key.values.push(value);
}
});

keys.sort(function(key1,key2){
return(order.ascending?1:-1)*(key1.sortkey-key2.sortkey);
});

for(var k=0;k<keys.length;k++){
var key=keys[k];
var values=key.values;
for(var v=0;v<values.length;v++){
if(order.forward){
database.getSubjects(values[v],order.property,key.items,items);
}else{
database.getObjects(values[v],order.property,key.items,items);
}
}

if(!settings.showDuplicates){
items.removeSet(key.items);
}
}

return keys;
};

processLevel(allItems,0);

return hasSomeGrouping;
};

Exhibit.OrderedViewFrame.prototype._getOrders=function(){
return this._orders||[this._getPossibleOrders()[0]];
};

Exhibit.OrderedViewFrame.prototype._getPossibleOrders=function(){
var possibleOrders=null;
if(this._possibleOrders==null){
possibleOrders=this._uiContext.getDatabase().getAllProperties();
for(var i=0,p;p=possibleOrders[i];i++){
possibleOrders[i]={ascending:true,forward:true,property:p};
}
}else{
possibleOrders=[].concat(this._possibleOrders);
}

if(possibleOrders.length==0){
possibleOrders.push({
property:"label",
forward:true,
ascending:true
});
}
return possibleOrders;
};

Exhibit.OrderedViewFrame.prototype._openSortPopup=function(elmt,index){
var self=this;
var database=this._uiContext.getDatabase();

var popupDom=Exhibit.UI.createPopupMenuDom(elmt);


var configuredOrders=this._getOrders();
if(index>=0){
var order=configuredOrders[index];
var property=database.getProperty(order.property);
var propertyLabel=order.forward?property.getPluralLabel():property.getReversePluralLabel();
var valueType=order.forward?property.getValueType():"item";
var sortLabels=Exhibit.Database.l10n.sortLabels[valueType];
sortLabels=(sortLabels!=null)?sortLabels:
Exhibit.Database.l10n.sortLabels["text"];

popupDom.appendMenuItem(
sortLabels.ascending,
Exhibit.urlPrefix+
(order.ascending?"images/option-check.png":"images/option.png"),
order.ascending?
function(){}:
function(){
self._reSort(
index,
order.property,
order.forward,
true,
false
);
}
);
popupDom.appendMenuItem(
sortLabels.descending,
Exhibit.urlPrefix+
(order.ascending?"images/option.png":"images/option-check.png"),
order.ascending?
function(){
self._reSort(
index,
order.property,
order.forward,
false,
false
);
}:
function(){}
);
if(configuredOrders.length>1){
popupDom.appendSeparator();
popupDom.appendMenuItem(
Exhibit.OrderedViewFrame.l10n.removeOrderLabel,
null,
function(){self._removeOrder(index);}
);
}
}


var orders=[];
var possibleOrders=this._getPossibleOrders();
for(i=0;i<possibleOrders.length;i++){
var possibleOrder=possibleOrders[i];
var skip=false;
for(var j=(index<0)?configuredOrders.length-1:index;j>=0;j--){
var existingOrder=configuredOrders[j];
if(existingOrder.property==possibleOrder.property&&
existingOrder.forward==possibleOrder.forward){
skip=true;
break;
}
}

if(!skip){
var property=database.getProperty(possibleOrder.property);
orders.push({
property:possibleOrder.property,
forward:possibleOrder.forward,
ascending:possibleOrder.ascending,
label:possibleOrder.forward?
property.getPluralLabel():
property.getReversePluralLabel()
});
}
}

if(orders.length>0){
if(index>=0){
popupDom.appendSeparator();
}

orders.sort(function(order1,order2){
return order1.label.localeCompare(order2.label);
});

var appendOrder=function(order){
popupDom.appendMenuItem(
order.label,
null,
function(){
self._reSort(
index,
order.property,
order.forward,
order.ascending,
true
);
}
);
}

for(var i=0;i<orders.length;i++){
appendOrder(orders[i]);
}
}
popupDom.open();
};

Exhibit.OrderedViewFrame.prototype._reSort=function(index,propertyID,forward,ascending,slice){
var oldOrders=this._getOrders();
index=(index<0)?oldOrders.length:index;

var newOrders=oldOrders.slice(0,index);
newOrders.push({property:propertyID,forward:forward,ascending:ascending});
if(!slice){
newOrders=newOrders.concat(oldOrders.slice(index+1));
}

var property=this._uiContext.getDatabase().getProperty(propertyID);
var propertyLabel=forward?property.getPluralLabel():property.getReversePluralLabel();
var valueType=forward?property.getValueType():"item";
var sortLabels=Exhibit.Database.l10n.sortLabels[valueType];
sortLabels=(sortLabels!=null)?sortLabels:
Exhibit.Database.l10n.sortLabels["text"];

var self=this;
SimileAjax.History.addLengthyAction(
function(){
self._orders=newOrders;
self.parentReconstruct();
},
function(){
self._orders=oldOrders;
self.parentReconstruct();
},
Exhibit.OrderedViewFrame.l10n.formatSortActionTitle(
propertyLabel,ascending?sortLabels.ascending:sortLabels.descending)
);
};

Exhibit.OrderedViewFrame.prototype._removeOrder=function(index){
var oldOrders=this._getOrders();
var newOrders=oldOrders.slice(0,index).concat(oldOrders.slice(index+1));

var order=oldOrders[index];
var property=this._uiContext.getDatabase().getProperty(order.property);
var propertyLabel=order.forward?property.getPluralLabel():property.getReversePluralLabel();
var valueType=order.forward?property.getValueType():"item";
var sortLabels=Exhibit.Database.l10n.sortLabels[valueType];
sortLabels=(sortLabels!=null)?sortLabels:
Exhibit.Database.l10n.sortLabels["text"];

var self=this;
SimileAjax.History.addLengthyAction(
function(){
self._orders=newOrders;
self.parentReconstruct();
},
function(){
self._orders=oldOrders;
self.parentReconstruct();
},
Exhibit.OrderedViewFrame.l10n.formatRemoveOrderActionTitle(
propertyLabel,order.ascending?sortLabels.ascending:sortLabels.descending)
);
};

Exhibit.OrderedViewFrame.prototype._setShowAll=function(showAll){
var self=this;
var settings=this._settings;
SimileAjax.History.addLengthyAction(
function(){
settings.showAll=showAll;
self.parentReconstruct();
},
function(){
settings.showAll=!showAll;
self.parentReconstruct();
},
Exhibit.OrderedViewFrame.l10n[
showAll?"showAllActionTitle":"dontShowAllActionTitle"]
);
};

Exhibit.OrderedViewFrame.prototype._toggleGroup=function(){
var settings=this._settings;
var oldGrouped=settings.grouped;
var self=this;
SimileAjax.History.addLengthyAction(
function(){
settings.grouped=!oldGrouped;
self.parentReconstruct();
},
function(){
settings.grouped=oldGrouped;
self.parentReconstruct();
},
Exhibit.OrderedViewFrame.l10n[
oldGrouped?"ungroupAsSortedActionTitle":"groupAsSortedActionTitle"]
);
};

Exhibit.OrderedViewFrame.prototype._toggleShowDuplicates=function(){
var settings=this._settings;
var oldShowDuplicates=settings.showDuplicates;
var self=this;
SimileAjax.History.addLengthyAction(
function(){
settings.showDuplicates=!oldShowDuplicates;
self.parentReconstruct();
},
function(){
settings.showDuplicates=oldShowDuplicates;
self.parentReconstruct();
},
Exhibit.OrderedViewFrame.l10n[
oldShowDuplicates?"hideDuplicatesActionTitle":"showDuplicatesActionTitle"]
);
};

Exhibit.OrderedViewFrame.headerTemplate=
"<div id='collectionSummaryDiv' style='display: none;'></div>"+
"<div class='exhibit-collectionView-header-sortControls' style='display: none;' id='controlsDiv'>"+
"%0"+
"<span class='exhibit-collectionView-header-groupControl'> \u2022 "+
"<a id='groupOption' class='exhibit-action'></a>"+
"</span>"+
"</div>";

Exhibit.OrderedViewFrame.createHeaderDom=function(
uiContext,
headerDiv,
showSummary,
showControls,
onThenSortBy,
onGroupToggle
){
var l10n=Exhibit.OrderedViewFrame.l10n;
var template=String.substitute(Exhibit.OrderedViewFrame.headerTemplate,[l10n.sortingControlsTemplate]);
var dom=SimileAjax.DOM.createDOMFromString(headerDiv,template,{});
headerDiv.className="exhibit-collectionView-header";

if(showSummary){
dom.collectionSummaryDiv.style.display="block";
dom.collectionSummaryWidget=Exhibit.CollectionSummaryWidget.create(
{},
dom.collectionSummaryDiv,
uiContext
);
}
if(showControls){
dom.controlsDiv.style.display="block";
dom.groupOptionWidget=Exhibit.OptionWidget.create(
{label:l10n.groupedAsSortedOptionLabel,
onToggle:onGroupToggle
},
dom.groupOption,
uiContext
);

SimileAjax.WindowManager.registerEvent(dom.thenSortByAction,"click",onThenSortBy);
dom.enableThenByAction=function(enabled){
Exhibit.UI.enableActionLink(dom.thenSortByAction,enabled);
};
dom.setOrders=function(orderElmts){
dom.ordersSpan.innerHTML="";

var addDelimiter=Exhibit.Formatter.createListDelimiter(dom.ordersSpan,orderElmts.length,uiContext);
for(var i=0;i<orderElmts.length;i++){
addDelimiter();
dom.ordersSpan.appendChild(orderElmts[i]);
}
addDelimiter();
};
}

dom.dispose=function(){
if("collectionSummaryWidget"in dom){
dom.collectionSummaryWidget.dispose();
dom.collectionSummaryWidget=null;
}

dom.groupOptionWidget.dispose();
dom.groupOptionWidget=null;
}

return dom;
};

Exhibit.OrderedViewFrame.footerTemplate="<span id='showAllSpan'></span>";

Exhibit.OrderedViewFrame.createFooterDom=function(
uiContext,
footerDiv,
onShowAll,
onDontShowAll
){
var l10n=Exhibit.OrderedViewFrame.l10n;

var dom=SimileAjax.DOM.createDOMFromString(
footerDiv,
Exhibit.OrderedViewFrame.footerTemplate,
{}
);
footerDiv.className="exhibit-collectionView-footer";

dom.setCounts=function(count,limitCount,showAll,canToggle){
dom.showAllSpan.innerHTML="";
if(canToggle&&count>limitCount){
if(showAll){
dom.showAllSpan.appendChild(
Exhibit.UI.makeActionLink(
l10n.formatDontShowAll(limitCount),onDontShowAll));
}else{
dom.showAllSpan.appendChild(
Exhibit.UI.makeActionLink(
l10n.formatShowAll(count),onShowAll));
}
}
};
dom.dispose=function(){};

return dom;
};


/* tabular-view.js */



Exhibit.TabularView=function(containerElmt,uiContext){
this._div=containerElmt;
this._uiContext=uiContext;

this._settings={rowStyler:null,tableStyler:null};
this._columns=[];

var view=this;
this._listener={
onItemsChanged:function(){
view._reconstruct();
}
};
uiContext.getCollection().addListener(this._listener);
};

Exhibit.TabularView._settingSpecs={
"sortAscending":{type:"boolean",defaultValue:true},
"sortColumn":{type:"int",defaultValue:0},
"showSummary":{type:"boolean",defaultValue:true},
"showToolbox":{type:"boolean",defaultValue:true},
"border":{type:"int",defaultValue:1},
"cellPadding":{type:"int",defaultValue:5},
"cellSpacing":{type:"int",defaultValue:3}
};

Exhibit.TabularView.create=function(configuration,containerElmt,uiContext){
var view=new Exhibit.TabularView(
containerElmt,
Exhibit.UIContext.create(configuration,uiContext)
);
Exhibit.TabularView._configure(view,configuration);

view._internalValidate();
view._initializeUI();
return view;
};

Exhibit.TabularView.createFromDOM=function(configElmt,containerElmt,uiContext){
var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var view=new Exhibit.TabularView(
containerElmt!=null?containerElmt:configElmt,
Exhibit.UIContext.createFromDOM(configElmt,uiContext)
);

Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt,Exhibit.TabularView._settingSpecs,view._settings);

try{
var expressions=[];
var labels=Exhibit.getAttribute(configElmt,"columnLabels",",")||[];

var s=Exhibit.getAttribute(configElmt,"columns");
if(s!=null&&s.length>0){
expressions=Exhibit.ExpressionParser.parseSeveral(s);
}

for(var i=0;i<expressions.length;i++){
var expression=expressions[i];
view._columns.push({
expression:expression,
uiContext:Exhibit.UIContext.create({},view._uiContext,true),
styler:null,
label:i<labels.length?labels[i]:null,
format:"list"
});
}

var formats=Exhibit.getAttribute(configElmt,"columnFormats");
if(formats!=null&&formats.length>0){
var index=0;
var startPosition=0;
while(index<view._columns.length&&startPosition<formats.length){
var column=view._columns[index];
var o={};

column.format=Exhibit.FormatParser.parseSeveral(column.uiContext,formats,startPosition,o);

startPosition=o.index;
while(startPosition<formats.length&&" \t\r\n".indexOf(formats.charAt(startPosition))>=0){
startPosition++;
}
if(startPosition<formats.length&&formats.charAt(startPosition)==","){
startPosition++;
}

index++;
}
}
}catch(e){
SimileAjax.Debug.exception(e,"TabularView: Error processing configuration of tabular view");
}

var s=Exhibit.getAttribute(configElmt,"rowStyler");
if(s!=null&&s.length>0){
var f=eval(s);
if(typeof f=="function"){
view._settings.rowStyler=f;
}
}
s=Exhibit.getAttribute(configElmt,"tableStyler");
if(s!=null&&s.length>0){
f=eval(s);
if(typeof f=="function"){
view._settings.tableStyler=f;
}
}

Exhibit.TabularView._configure(view,configuration);
view._internalValidate();
view._initializeUI();
return view;
};

Exhibit.TabularView._configure=function(view,configuration){
Exhibit.SettingsUtilities.collectSettings(configuration,Exhibit.TabularView._settingSpecs,view._settings);

if("columns"in configuration){
var columns=configuration.columns;
for(var i=0;i<columns.length;i++){
var column=columns[i];
var expr;
var styler=null;
var label=null;
var format=null;

if(typeof column=="string"){
expr=column;
}else{
expr=column.expression;
styler=column.styler;
label=column.label;
format=column.format;
}

var expression=Exhibit.ExpressionParser.parse(expr);
if(expression.isPath()){
var path=expression.getPath();
if(format!=null&&format.length>0){
format=Exhibit.FormatParser.parse(view._uiContext,format,0);
}else{
format="list";
}

view._columns.push({
expression:expression,
styler:styler,
label:label,
format:format
});
}
}
}

if("rowStyler"in configuration){
view._settings.rowStyler=configuration.rowStyler;
}
if("tableStyler"in configuration){
view._settings.tableStyler=configuration.tableStyler;
}
};

Exhibit.TabularView.prototype._internalValidate=function(){
if(this._columns.length==0){
var database=this._uiContext.getDatabase();
var propertyIDs=database.getAllProperties();
for(var i=0;i<propertyIDs.length;i++){
var propertyID=propertyIDs[i];
if(propertyID!="uri"){
this._columns.push(
{expression:Exhibit.ExpressionParser.parse("."+propertyID),
styler:null,
label:database.getProperty(propertyID).getLabel(),
format:"list"
}
);
}
}
}
this._settings.sortColumn=
Math.max(0,Math.min(this._settings.sortColumn,this._columns.length-1));
};

Exhibit.TabularView.prototype.dispose=function(){
this._uiContext.getCollection().removeListener(this._listener);

if(this._toolboxWidget){
this._toolboxWidget.dispose();
this._toolboxWidget=null;
}

this._collectionSummaryWidget.dispose();
this._collectionSummaryWidget=null;

this._uiContext.dispose();
this._uiContext=null;

this._div.innerHTML="";

this._dom=null;
this._div=null;
};

Exhibit.TabularView.prototype._initializeUI=function(){
var self=this;

this._div.innerHTML="";
this._dom=Exhibit.TabularView.createDom(this._div);
this._collectionSummaryWidget=Exhibit.CollectionSummaryWidget.create(
{},
this._dom.collectionSummaryDiv,
this._uiContext
);
if(this._settings.showToolbox){
this._toolboxWidget=Exhibit.ToolboxWidget.createFromDOM(this._div,this._div,this._uiContext);
}

if(!this._settings.showSummary){
this._dom.collectionSummaryDiv.style.display="none";
}

this._reconstruct();
};

Exhibit.TabularView.prototype._reconstruct=function(){
var self=this;
var collection=this._uiContext.getCollection();
var database=this._uiContext.getDatabase();

var bodyDiv=this._dom.bodyDiv;
bodyDiv.innerHTML="";


var items=[];
var originalSize=collection.countAllItems();
if(originalSize>0){
var currentSet=collection.getRestrictedItems();
currentSet.visit(function(itemID){items.push({id:itemID,sortKey:""});});
}

if(items.length>0){

var sortColumn=this._columns[this._settings.sortColumn];
items.sort(this._createSortFunction(items,sortColumn.expression,this._settings.sortAscending));


var table=document.createElement("table");
if(this._settings.tableStyler!=null){
this._settings.tableStyler(table,database);
}else{
table.cellSpacing=this._settings.cellSpacing;
table.cellPadding=this._settings.cellPadding;
table.border=this._settings.border;
}


for(var i=0;i<items.length;i++){
var item=items[i];
var tr=table.insertRow(i);

for(var c=0;c<this._columns.length;c++){
var column=this._columns[c];
var td=tr.insertCell(c);

var results=column.expression.evaluate(
{"value":item.id},
{"value":"item"},
"value",
database
);

var valueType=column.format=="list"?results.valueType:column.format;
column.uiContext.formatList(
results.values,
results.size,
valueType,
function(elmt){td.appendChild(elmt);}
);

if(column.styler!=null){
column.styler(item.id,database,td);
}
}

if(this._settings.rowStyler!=null){
this._settings.rowStyler(item.id,database,tr,i);
}
}


var th=table.createTHead();
tr=th.insertRow(0);
var createColumnHeader=function(i){
var column=self._columns[i];
if(column.label==null){
column.label=self._getColumnLabel(column.expression);
}
var colgroup=document.createElement("colgroup");
colgroup.className=column.label;
table.appendChild(colgroup);

var td=document.createElement("th");
Exhibit.TabularView.createColumnHeader(
exhibit,td,column.label,i==self._settings.sortColumn,self._settings.sortAscending,
function(elmt,evt,target){
self._doSort(i);
SimileAjax.DOM.cancelEvent(evt);
return false;
}
);

tr.appendChild(td);
};
for(var i=0;i<this._columns.length;i++){
createColumnHeader(i);
}

bodyDiv.appendChild(table);
}
};

Exhibit.TabularView.prototype._getColumnLabel=function(expression){
var database=this._uiContext.getDatabase();
var path=expression.getPath();
var segment=path.getSegment(path.getSegmentCount()-1);
var propertyID=segment.property;
var property=database.getProperty(propertyID);
if(property!=null){
return segment.forward?property.getLabel():property.getReverseLabel();
}else{
return propertyID;
}
};

Exhibit.TabularView.prototype._createSortFunction=function(items,expression,ascending){
var database=this._uiContext.getDatabase();
var multiply=ascending?1:-1;

var numericFunction=function(item1,item2){
return multiply*(item1.sortKey-item2.sortKey);
};
var textFunction=function(item1,item2){
return multiply*item1.sortKey.localeCompare(item2.sortKey);
};

var valueTypes=[];
var valueTypeMap={};
for(var i=0;i<items.length;i++){
var item=items[i];
var r=expression.evaluate(
{"value":item.id},
{"value":"item"},
"value",
database
);
r.values.visit(function(value){
item.sortKey=value;
});

if(!(r.valueType in valueTypeMap)){
valueTypeMap[r.valueType]=true;
valueTypes.push(r.valueType);
}
}

var coercedValueType="text"
if(valueTypes.length==1){
coercedValueType=valueTypes[0];
}else{
coercedValueType="text";
}

var coersion;
var sortingFunction;
if(coercedValueType=="number"){
sortingFunction=numericFunction;
coersion=function(v){
if(v==null){
return Number.NEGATIVE_INFINITY;
}else if(typeof v=="number"){
return v;
}else{
var n=parseFloat(v);
if(isNaN(n)){
return Number.NEGATIVE_INFINITY;
}else{
return n;
}
}
}
}else if(coercedValueType=="date"){
sortingFunction=numericFunction;
coersion=function(v){
if(v==null){
return Number.NEGATIVE_INFINITY;
}else if(v instanceof Date){
return v.getTime();
}else{
try{
return SimileAjax.DateTime.parseIso8601DateTime(v).getTime();
}catch(e){
return Number.NEGATIVE_INFINITY;
}
}
}
}else if(coercedValueType=="boolean"){
sortingFunction=numericFunction;
coersion=function(v){
if(v==null){
return Number.NEGATIVE_INFINITY;
}else if(typeof v=="boolean"){
return v?1:0;
}else{
return v.toString().toLowerCase()=="true";
}
}
}else if(coercedValueType=="item"){
sortingFunction=textFunction;
coersion=function(v){
if(v==null){
return Exhibit.l10n.missingSortKey;
}else{
var label=database.getObject(v,"label");
return(label==null)?v:label;
}
}
}else{
sortingFunction=textFunction;
coersion=function(v){
if(v==null){
return Exhibit.l10n.missingSortKey;
}else{
return v.toString();
}
}
}

for(var i=0;i<items.length;i++){
var item=items[i];
item.sortKey=coersion(item.sortKey);
}

return sortingFunction;
};

Exhibit.TabularView.prototype._doSort=function(columnIndex){
var oldSortColumn=this._settings.sortColumn;
var oldSortAscending=this._settings.sortAscending;
var newSortColumn=columnIndex;
var newSortAscending=oldSortColumn==newSortColumn?!oldSortAscending:true;
var settings=this._settings;

var self=this;
SimileAjax.History.addLengthyAction(
function(){
settings.sortColumn=newSortColumn;
settings.sortAscending=newSortAscending;
self._reconstruct();
},
function(){
settings.sortColumn=oldSortColumn;
settings.sortAscending=oldSortAscending;
self._reconstruct();
},
Exhibit.TabularView.l10n.makeSortActionTitle(this._columns[columnIndex].label,newSortAscending)
);
};

Exhibit.TabularView._constructDefaultValueList=function(values,valueType,parentElmt,uiContext){
uiContext.formatList(values,values.size(),valueType,function(elmt){
parentElmt.appendChild(elmt);
});
};

Exhibit.TabularView.createDom=function(div){
var l10n=Exhibit.TabularView.l10n;
var headerTemplate={
elmt:div,
className:"exhibit-collectionView-header",
children:[
{tag:"div",
field:"collectionSummaryDiv"
},
{tag:"div",
field:"bodyDiv"
}
]
};
return SimileAjax.DOM.createDOMFromTemplate(headerTemplate);
};

Exhibit.TabularView.createColumnHeader=function(
exhibit,
th,
label,
sort,
sortAscending,
sortFunction
){
var l10n=Exhibit.TabularView.l10n;
var template={
elmt:th,
className:sort?
"exhibit-tabularView-columnHeader-sorted":
"exhibit-tabularView-columnHeader",
title:sort?l10n.columnHeaderReSortTooltip:l10n.columnHeaderSortTooltip,
children:[label]
};
if(sort){
template.children.push({
elmt:Exhibit.UI.createTranslucentImage(
sortAscending?"images/up-arrow.png":"images/down-arrow.png")
});
}
SimileAjax.WindowManager.registerEvent(th,"click",sortFunction,null);

var dom=SimileAjax.DOM.createDOMFromTemplate(template);
return dom;
};


/* thumbnail-view.js */



Exhibit.ThumbnailView=function(containerElmt,uiContext){
this._div=containerElmt;
this._uiContext=uiContext;
this._settings={};

var view=this;
this._listener={
onItemsChanged:function(){
view._reconstruct();
}
};
uiContext.getCollection().addListener(this._listener);

this._orderedViewFrame=new Exhibit.OrderedViewFrame(uiContext);
this._orderedViewFrame.parentReconstruct=function(){
view._reconstruct();
}
};

Exhibit.ThumbnailView._settingSpecs={
"showToolbox":{type:"boolean",defaultValue:true}
};

Exhibit.ThumbnailView.create=function(configuration,containerElmt,uiContext){
var view=new Exhibit.ThumbnailView(
containerElmt,
Exhibit.UIContext.create(configuration,uiContext,true)
);

view._lensRegistry=Exhibit.UIContext.createLensRegistry(configuration,uiContext.getLensRegistry());

Exhibit.SettingsUtilities.collectSettings(
configuration,Exhibit.ThumbnailView._settingSpecs,view._settings);

view._orderedViewFrame.configure(configuration);

view._initializeUI();
return view;
};

Exhibit.ThumbnailView.createFromDOM=function(configElmt,containerElmt,uiContext){
var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var view=new Exhibit.ThumbnailView(
containerElmt!=null?containerElmt:configElmt,
Exhibit.UIContext.createFromDOM(configElmt,uiContext,true)
);

view._lensRegistry=Exhibit.UIContext.createLensRegistryFromDOM(configElmt,configuration,uiContext.getLensRegistry());

Exhibit.SettingsUtilities.collectSettingsFromDOM(
configElmt,Exhibit.ThumbnailView._settingSpecs,view._settings);
Exhibit.SettingsUtilities.collectSettings(
configuration,Exhibit.ThumbnailView._settingSpecs,view._settings);

view._orderedViewFrame.configureFromDOM(configElmt);
view._orderedViewFrame.configure(configuration);

view._initializeUI();
return view;
};

Exhibit.ThumbnailView.prototype.dispose=function(){
this._uiContext.getCollection().removeListener(this._listener);

if(this._toolboxWidget){
this._toolboxWidget.dispose();
this._toolboxWidget=null;
}

this._orderedViewFrame.dispose();
this._orderedViewFrame=null;

this._lensRegistry=null;
this._dom=null;

this._div.innerHTML="";

this._div=null;
this._uiContext=null;
};

Exhibit.ThumbnailView.prototype._initializeUI=function(){
this._div.innerHTML="";
var template={
elmt:this._div,
children:[
{tag:"div",
field:"headerDiv"
},
{tag:"div",
className:"exhibit-collectionView-body",
field:"bodyDiv"
},
{tag:"div",
field:"footerDiv"
}
]
};
this._dom=SimileAjax.DOM.createDOMFromTemplate(template);
if(this._settings.showToolbox){
this._toolboxWidget=Exhibit.ToolboxWidget.createFromDOM(this._div,this._div,this._uiContext);
}

var self=this;
this._orderedViewFrame._divHeader=this._dom.headerDiv;
this._orderedViewFrame._divFooter=this._dom.footerDiv;
this._orderedViewFrame._generatedContentElmtRetriever=function(){
return self._dom.bodyDiv;
};
this._orderedViewFrame.initializeUI();

this._reconstruct();
};

Exhibit.ThumbnailView.prototype._reconstruct=function(){
var view=this;
var state={
div:this._dom.bodyDiv,
itemContainer:null,
groupDoms:[],
groupCounts:[]
};

var closeGroups=function(groupLevel){
for(var i=groupLevel;i<state.groupDoms.length;i++){
state.groupDoms[i].countSpan.innerHTML=state.groupCounts[i];
}
state.groupDoms=state.groupDoms.slice(0,groupLevel);
state.groupCounts=state.groupCounts.slice(0,groupLevel);

if(groupLevel>0){
state.div=state.groupDoms[groupLevel-1].contentDiv;
}else{
state.div=view._dom.bodyDiv;
}
state.itemContainer=null;
}

this._orderedViewFrame.onNewGroup=function(groupSortKey,keyType,groupLevel){
closeGroups(groupLevel);

var groupDom=Exhibit.ThumbnailView.constructGroup(
groupLevel,
groupSortKey
);

state.div.appendChild(groupDom.elmt);
state.div=groupDom.contentDiv;

state.groupDoms.push(groupDom);
state.groupCounts.push(0);
};

this._orderedViewFrame.onNewItem=function(itemID,index){


if(state.itemContainer==null){
state.itemContainer=Exhibit.ThumbnailView.constructItemContainer();
state.div.appendChild(state.itemContainer);
}

for(var i=0;i<state.groupCounts.length;i++){
state.groupCounts[i]++;
}

var itemLensDiv=document.createElement("div");
itemLensDiv.className=SimileAjax.Platform.browser.isIE?
"exhibit-thumbnailView-itemContainer-IE":
"exhibit-thumbnailView-itemContainer";

var itemLens=view._lensRegistry.createLens(itemID,itemLensDiv,view._uiContext);
state.itemContainer.appendChild(itemLensDiv);
};

this._div.style.display="none";

this._dom.bodyDiv.innerHTML="";
this._orderedViewFrame.reconstruct();
closeGroups(0);

this._div.style.display="block";
};

Exhibit.ThumbnailView.constructGroup=function(
groupLevel,
label
){
var l10n=Exhibit.ThumbnailView.l10n;
var template={
tag:"div",
className:"exhibit-thumbnailView-group",
children:[
{tag:"h"+(groupLevel+1),
children:[
label,
{tag:"span",
className:"exhibit-collectionView-group-count",
children:[
" (",
{tag:"span",
field:"countSpan"
},
")"
]
}
],
field:"header"
},
{tag:"div",
className:"exhibit-collectionView-group-content",
field:"contentDiv"
}
]
};
return SimileAjax.DOM.createDOMFromTemplate(template);
};

Exhibit.ThumbnailView.constructItemContainer=function(){
var div=document.createElement("div");
div.className="exhibit-thumbnailView-body";
return div;
};



/* tile-view.js */



Exhibit.TileView=function(containerElmt,uiContext){
this._div=containerElmt;
this._uiContext=uiContext;
this._settings={};

var view=this;

this._listener={onItemsChanged:function(){view._reconstruct();}};
uiContext.getCollection().addListener(this._listener);

this._orderedViewFrame=new Exhibit.OrderedViewFrame(uiContext);
this._orderedViewFrame.parentReconstruct=function(){view._reconstruct();};
};

Exhibit.TileView._settingSpecs={
"showToolbox":{type:"boolean",defaultValue:true}
};

Exhibit.TileView.create=function(configuration,containerElmt,uiContext){
var view=new Exhibit.TileView(
containerElmt,
Exhibit.UIContext.create(configuration,uiContext)
);

Exhibit.SettingsUtilities.collectSettings(
configuration,Exhibit.TileView._settingSpecs,view._settings);

view._orderedViewFrame.configure(configuration);

view._initializeUI();
return view;
};

Exhibit.TileView.createFromDOM=function(configElmt,containerElmt,uiContext){
var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var view=new Exhibit.TileView(
containerElmt!=null?containerElmt:configElmt,
Exhibit.UIContext.createFromDOM(configElmt,uiContext)
);

Exhibit.SettingsUtilities.collectSettingsFromDOM(
configElmt,Exhibit.TileView._settingSpecs,view._settings);
Exhibit.SettingsUtilities.collectSettings(
configuration,Exhibit.TileView._settingSpecs,view._settings);

view._orderedViewFrame.configureFromDOM(configElmt);
view._orderedViewFrame.configure(configuration);

view._initializeUI();
return view;
};

Exhibit.TileView.prototype.dispose=function(){
this._uiContext.getCollection().removeListener(this._listener);

this._div.innerHTML="";

if(this._toolboxWidget){
this._toolboxWidget.dispose();
this._toolboxWidget=null;
}

this._orderedViewFrame.dispose();
this._orderedViewFrame=null;
this._dom=null;

this._div=null;
this._uiContext=null;
};

Exhibit.TileView.prototype._initializeUI=function(){
this._div.innerHTML="";
var template={
elmt:this._div,
children:[
{tag:"div",
field:"headerDiv"
},
{tag:"div",
className:"exhibit-collectionView-body",
field:"bodyDiv"
},
{tag:"div",
field:"footerDiv"
}
]
};
this._dom=SimileAjax.DOM.createDOMFromTemplate(template);
if(this._settings.showToolbox){console.log("here");
this._toolboxWidget=Exhibit.ToolboxWidget.createFromDOM(this._div,this._div,this._uiContext);
}

var self=this;
this._orderedViewFrame._divHeader=this._dom.headerDiv;
this._orderedViewFrame._divFooter=this._dom.footerDiv;
this._orderedViewFrame._generatedContentElmtRetriever=function(){
return self._dom.bodyDiv;
};
this._orderedViewFrame.initializeUI();

this._reconstruct();
};

Exhibit.TileView.prototype._reconstruct=function(){
var view=this;
var state={
div:this._dom.bodyDiv,
contents:null,
groupDoms:[],
groupCounts:[]
};

var closeGroups=function(groupLevel){
for(var i=groupLevel;i<state.groupDoms.length;i++){
state.groupDoms[i].countSpan.innerHTML=state.groupCounts[i];
}
state.groupDoms=state.groupDoms.slice(0,groupLevel);
state.groupCounts=state.groupCounts.slice(0,groupLevel);

if(groupLevel>0){
state.div=state.groupDoms[groupLevel-1].contentDiv;
}else{
state.div=view._dom.bodyDiv;
}
state.contents=null;
}

this._orderedViewFrame.onNewGroup=function(groupSortKey,keyType,groupLevel){
closeGroups(groupLevel);

var groupDom=Exhibit.TileView.constructGroup(groupLevel,groupSortKey);

state.div.appendChild(groupDom.elmt);
state.div=groupDom.contentDiv;

state.groupDoms.push(groupDom);
state.groupCounts.push(0);
};

this._orderedViewFrame.onNewItem=function(itemID,index){
if(state.contents==null){
state.contents=Exhibit.TileView.constructList();
state.div.appendChild(state.contents);
}

for(var i=0;i<state.groupCounts.length;i++){
state.groupCounts[i]++;
}

var itemLensItem=document.createElement("li");
var itemLens=view._uiContext.getLensRegistry().createLens(itemID,itemLensItem,view._uiContext);
state.contents.appendChild(itemLensItem);
};

this._div.style.display="none";

this._dom.bodyDiv.innerHTML="";
this._orderedViewFrame.reconstruct();
closeGroups(0);

this._div.style.display="block";
};

Exhibit.TileView.constructGroup=function(groupLevel,label){
var template={
tag:"div",
className:"exhibit-collectionView-group",
children:[
{tag:"h"+(groupLevel+1),
children:[
label,
{tag:"span",
className:"exhibit-collectionView-group-count",
children:[
" (",
{tag:"span",
field:"countSpan"
},
")"
]
}
],
field:"header"
},
{tag:"div",
className:"exhibit-collectionView-group-content",
field:"contentDiv"
}
]
};
return SimileAjax.DOM.createDOMFromTemplate(template);
};

Exhibit.TileView.constructList=function(){
var div=document.createElement("ol");
div.className="exhibit-tileView-body";
return div;
};


/* view-panel.js */


Exhibit.ViewPanel=function(div,uiContext){
this._uiContext=uiContext;
this._div=div;

this._viewConstructors=[];
this._viewConfigs=[];
this._viewLabels=[];
this._viewTooltips=[];
this._viewDomConfigs=[];
this._viewIDs=[];

this._viewIndex=0;
this._view=null;
}

Exhibit.ViewPanel.create=function(configuration,div,uiContext){
var viewPanel=new Exhibit.ViewPanel(div,uiContext);

if("views"in configuration){
for(var i=0;i<configuration.views.length;i++){
var viewConfig=configuration.views[i];

var viewClass=("viewClass"in view)?view.viewClass:Exhibit.TileView;

var label=null;
if("label"in viewConfig){
label=viewConfig.label;
}else if("l10n"in viewClass&&"viewLabel"in viewClass.l10n){
label=viewClass.l10n.viewLabel;
}else{
label=""+viewClass;
}

var tooltip=null;
if("tooltip"in viewConfig){
tooltip=viewConfig.tooltip;
}else if("l10n"in viewClass&&"viewTooltip"in viewClass.l10n){
tooltip=viewClass.l10n.viewTooltip;
}else{
tooltip=label;
}

var id=viewPanel._generateViewID();
if("id"in viewConfig){
id=viewConfig.id;
}

viewPanel._viewConstructors.push(viewClass);
viewPanel._viewConfigs.push(viewConfig);
viewPanel._viewLabels.push(label);
viewPanel._viewTooltips.push(tooltip);
viewPanel._viewDomConfigs.push(null);
viewPanel._viewIDs.push(id);
}
}

if("initialView"in configuration){
viewPanel._viewIndex=configuration.initialView;
}

viewPanel._internalValidate();
viewPanel._initializeUI();

return viewPanel;
};

Exhibit.ViewPanel.createFromDOM=function(div,uiContext){
var viewPanel=new Exhibit.ViewPanel(div,Exhibit.UIContext.createFromDOM(div,uiContext,false));

var node=div.firstChild;
while(node!=null){
if(node.nodeType==1){
node.style.display="none";

var role=Exhibit.getRoleAttribute(node);
if(role=="view"){
var viewClass=Exhibit.TileView;

var viewClassString=Exhibit.getAttribute(node,"viewClass");
if(viewClassString!=null&&viewClassString.length>0){
viewClass=Exhibit.UI.viewClassNameToViewClass(viewClassString);
if(viewClass==null){
SimileAjax.Debug.warn("Unknown viewClass "+viewClassString);
}
}

var label=Exhibit.getAttribute(node,"label");
var tooltip=Exhibit.getAttribute(node,"title");
var id=node.id;

if(label==null){
if("viewLabel"in viewClass.l10n){
label=viewClass.l10n.viewLabel;
}else{
label=""+viewClass;
}
}
if(tooltip==null){
if("l10n"in viewClass&&"viewTooltip"in viewClass.l10n){
tooltip=viewClass.l10n.viewTooltip;
}else{
tooltip=label;
}
}
if(id==null||id.length==0){
id=viewPanel._generateViewID();
}

viewPanel._viewConstructors.push(viewClass);
viewPanel._viewConfigs.push(null);
viewPanel._viewLabels.push(label);
viewPanel._viewTooltips.push(tooltip);
viewPanel._viewDomConfigs.push(node);
viewPanel._viewIDs.push(id);
}
}
node=node.nextSibling;
}

var initialView=Exhibit.getAttribute(div,"initialView");
if(initialView!=null&&initialView.length>0){
try{
var n=parseInt(initialView);
if(!isNaN(n)){
viewPanel._viewIndex=n;
}
}catch(e){
}
}

viewPanel._internalValidate();
viewPanel._initializeUI();

return viewPanel;
};

Exhibit.ViewPanel.prototype.dispose=function(){
if(this._view!=null){
this._view.dispose();
this._view=null;
}

this._div.innerHTML="";

this._uiContext.dispose();
this._uiContext=null;
this._div=null;
};

Exhibit.ViewPanel.prototype._generateViewID=function(){
return"view"+Math.floor(Math.random()*1000000).toString();
};

Exhibit.ViewPanel.prototype._internalValidate=function(){
if(this._viewConstructors.length==0){
this._viewConstructors.push(Exhibit.TileView);
this._viewConfigs.push({});
this._viewLabels.push(Exhibit.TileView.l10n.viewLabel);
this._viewTooltips.push(Exhibit.TileView.l10n.viewTooltip);
this._viewDomConfigs.push(null);
this._viewIDs.push(this._generateViewID());
}

this._viewIndex=
Math.max(0,Math.min(this._viewIndex,this._viewConstructors.length-1));
};

Exhibit.ViewPanel.prototype._initializeUI=function(){
var div=document.createElement("div");
if(this._div.firstChild!=null){
this._div.insertBefore(div,this._div.firstChild);
}else{
this._div.appendChild(div);
}

var self=this;
this._dom=Exhibit.ViewPanel.constructDom(
this._div.firstChild,
this._viewLabels,
this._viewTooltips,
function(index){
self._selectView(index);
}
);

this._createView();
};

Exhibit.ViewPanel.prototype._createView=function(){
var viewContainer=this._dom.getViewContainer();
viewContainer.innerHTML="";

var viewDiv=document.createElement("div");
viewContainer.appendChild(viewDiv);

var index=this._viewIndex;
try{
if(this._viewDomConfigs[index]!=null){
this._view=this._viewConstructors[index].createFromDOM(
this._viewDomConfigs[index],
viewContainer,
this._uiContext
);
}else{
this._view=this._viewConstructors[index].create(
this._viewConfigs[index],
viewContainer,
this._uiContext
);
}
}catch(e){
SimileAjax.Debug.log("Failed to create view "+this._viewLabels[index]);
}
this._uiContext.getExhibit().setComponent(this._viewIDs[index],this._view);
this._dom.setViewIndex(index);
};

Exhibit.ViewPanel.prototype._switchView=function(newIndex){
if(this._view){
this._uiContext.getExhibit().disposeComponent(this._viewIDs[this._viewIndex]);
this._view=null;
}
this._viewIndex=newIndex;
this._createView();
};

Exhibit.ViewPanel.prototype._selectView=function(newIndex){
var oldIndex=this._viewIndex;
var self=this;
SimileAjax.History.addLengthyAction(
function(){
self._switchView(newIndex);
},
function(){
self._switchView(oldIndex);
},
Exhibit.ViewPanel.l10n.createSelectViewActionTitle(self._viewLabels[newIndex])
);
};

Exhibit.ViewPanel.getPropertyValuesPairs=function(itemID,propertyEntries,database){
var pairs=[];
var enterPair=function(propertyID,forward){
var property=database.getProperty(propertyID);
var values=forward?
database.getObjects(itemID,propertyID):
database.getSubjects(itemID,propertyID);
var count=values.size();

if(count>0){
var itemValues=property.getValueType()=="item";
var pair={
propertyLabel:
forward?
(count>1?property.getPluralLabel():property.getLabel()):
(count>1?property.getReversePluralLabel():property.getReverseLabel()),
valueType:property.getValueType(),
values:[]
};

if(itemValues){
values.visit(function(value){
var label=database.getObject(value,"label");
pair.values.push(label!=null?label:value);
});
}else{
values.visit(function(value){
pair.values.push(value);
});
}
pairs.push(pair);
}
};

for(var i=0;i<propertyEntries.length;i++){
var entry=propertyEntries[i];
if(typeof entry=="string"){
enterPair(entry,true);
}else{
enterPair(entry.property,entry.forward);
}
}
return pairs;
};

Exhibit.ViewPanel.constructDom=function(
div,
viewLabels,
viewTooltips,
onSelectView
){
var l10n=Exhibit.ViewPanel.l10n;
var template={
elmt:div,
className:"exhibit-viewPanel exhibit-ui-protection",
children:[
{tag:"div",
className:"exhibit-viewPanel-viewSelection",
field:"viewSelectionDiv"
},
{tag:"div",
className:"exhibit-viewPanel-viewContainer",
field:"viewContainerDiv"
}
]
};
var dom=SimileAjax.DOM.createDOMFromTemplate(template);
dom.getViewContainer=function(){
return dom.viewContainerDiv;
};
dom.setViewIndex=function(index){
if(viewLabels.length>1){
dom.viewSelectionDiv.innerHTML="";

var appendView=function(i){
var selected=(i==index);
if(i>0){
dom.viewSelectionDiv.appendChild(document.createTextNode(" \u2022 "));
}

var span=document.createElement("span");
span.className=selected?
"exhibit-viewPanel-viewSelection-selectedView":
"exhibit-viewPanel-viewSelection-view";
span.title=viewTooltips[i];
span.innerHTML=viewLabels[i];

if(!selected){
var handler=function(elmt,evt,target){
onSelectView(i);
SimileAjax.DOM.cancelEvent(evt);
return false;
}
SimileAjax.WindowManager.registerEvent(span,"click",handler);
}
dom.viewSelectionDiv.appendChild(span);
};

for(var i=0;i<viewLabels.length;i++){
appendView(i);
}
}
};

return dom;
};


/* collection-summary-widget.js */


Exhibit.CollectionSummaryWidget=function(containerElmt,uiContext){
this._exhibit=uiContext.getExhibit();
this._collection=uiContext.getCollection();
this._uiContext=uiContext;
this._div=containerElmt;

var widget=this;
this._listener={onItemsChanged:function(){widget._reconstruct();}};
this._collection.addListener(this._listener);
};

Exhibit.CollectionSummaryWidget.create=function(configuration,containerElmt,uiContext){
var widget=new Exhibit.CollectionSummaryWidget(
containerElmt,
Exhibit.UIContext.create(configuration,uiContext)
);
widget._initializeUI();
return widget;
};

Exhibit.CollectionSummaryWidget.createFromDOM=function(configElmt,containerElmt,uiContext){
var widget=new Exhibit.CollectionSummaryWidget(
containerElmt!=null?containerElmt:configElmt,
Exhibit.UIContext.createFromDOM(configElmt,uiContext)
);
widget._initializeUI();
return widget;
};

Exhibit.CollectionSummaryWidget.prototype.dispose=function(){
this._collection.removeListener(this._listener);
this._div.innerHTML="";

this._noResultsDom=null;
this._allResultsDom=null;
this._filteredResultsDom=null;
this._div=null;
this._collection=null;
this._exhibit=null;
};

Exhibit.CollectionSummaryWidget.prototype._initializeUI=function(){
var self=this;

var l10n=Exhibit.CollectionSummaryWidget.l10n;
var onClearFilters=function(elmt,evt,target){
self._resetCollection();
SimileAjax.DOM.cancelEvent(evt);
return false;
}

this._allResultsDom=SimileAjax.DOM.createDOMFromString(
"span",
String.substitute(
l10n.allResultsTemplate,
["exhibit-collectionSummaryWidget-results"]
)
);
this._filteredResultsDom=SimileAjax.DOM.createDOMFromString(
"span",
String.substitute(
l10n.filteredResultsTemplate,
["exhibit-collectionSummaryWidget-results"]
),
{resetActionLink:Exhibit.UI.makeActionLink(l10n.resetFiltersLabel,onClearFilters)
}
);
this._noResultsDom=SimileAjax.DOM.createDOMFromString(
"span",
String.substitute(
l10n.noResultsTemplate,
["exhibit-collectionSummaryWidget-results","exhibit-collectionSummaryWidget-count"]
),
{resetActionLink:Exhibit.UI.makeActionLink(l10n.resetFiltersLabel,onClearFilters)
}
);

this._div.innerHTML="";
this._reconstruct();
};

Exhibit.CollectionSummaryWidget.prototype._reconstruct=function(){
var originalSize=this._collection.countAllItems();
var currentSize=this._collection.countRestrictedItems();
var database=this._uiContext.getDatabase();
var dom=this._dom;

this._div.innerHTML="";
if(originalSize>0){
if(currentSize==0){
this._div.appendChild(this._noResultsDom.elmt);
}else{
var typeIDs=database.getTypeIDs(this._collection.getRestrictedItems()).toArray();
var typeID=typeIDs.length==1?typeIDs[0]:"Item";

var description=
Exhibit.Database.l10n.labelItemsOfType(currentSize,typeID,database,"exhibit-collectionSummaryWidget-count");

if(currentSize==originalSize){
this._div.appendChild(this._allResultsDom.elmt);
this._allResultsDom.resultDescription.innerHTML="";
this._allResultsDom.resultDescription.appendChild(description);
}else{
this._div.appendChild(this._filteredResultsDom.elmt);
this._filteredResultsDom.resultDescription.innerHTML="";
this._filteredResultsDom.resultDescription.appendChild(description);
this._filteredResultsDom.originalCountSpan.innerHTML=originalSize;
}
}
}
};

Exhibit.CollectionSummaryWidget.prototype._resetCollection=function(){
var state={};
var collection=this._collection;

SimileAjax.History.addLengthyAction(
function(){state.restrictions=collection.clearAllRestrictions();},
function(){collection.applyRestrictions(state.restrictions);},
Exhibit.CollectionSummaryWidget.l10n.resetActionTitle
);
};


/* legend-gradient-widget.js */



Exhibit.LegendGradientWidget=function(containerElmt,uiContext){

this._div=containerElmt;

this._uiContext=uiContext;



this._initializeUI();

};



Exhibit.LegendGradientWidget.create=function(containerElmt,uiContext){

return new Exhibit.LegendGradientWidget(containerElmt,uiContext);

};



Exhibit.LegendGradientWidget.prototype.addGradient=function(configuration){

var gradientPoints=[];

var gradientPoints=configuration;

var sortObj=function(a,b){

return a.value-b.value;

};

gradientPoints.sort(sortObj);



var theTable=document.createElement("table");

var tableBody=document.createElement("tbody");

var theRow1=document.createElement("tr");

var theRow2=document.createElement("tr");

var theRow3=document.createElement("tr");



theRow1.style.height="2em";

theRow2.style.height="2em";

theRow3.style.height="2em";

theTable.style.width="80%";

theTable.cellSpacing="0";

theTable.style.emptyCells="show";

theTable.style.marginLeft="auto";

theTable.style.marginRight="auto";

tableBody.appendChild(theRow1);

tableBody.appendChild(theRow2);

tableBody.appendChild(theRow3);

theTable.appendChild(tableBody);



this._theRow1=theRow1;

this._theRow2=theRow2;

this._theRow3=theRow3;



var globLowPoint=gradientPoints[0].value;

var globHighPoint=gradientPoints[gradientPoints.length-1].value;

var stepSize=(globHighPoint-globLowPoint)/50;

var counter=0;



for(var i=0;i<gradientPoints.length-1;i++){

var lowPoint=gradientPoints[i].value;

var highPoint=gradientPoints[i+1].value;



var colorRect=document.createElement("td");

colorRect.style.backgroundColor="rgb("+gradientPoints[i].red+","+gradientPoints[i].green+","+gradientPoints[i].blue+")";

var numberRect=document.createElement("td");

var textDiv=document.createElement("div");

var theText=document.createTextNode(gradientPoints[i].value);

textDiv.appendChild(theText);

numberRect.appendChild(textDiv);

theRow1.appendChild(document.createElement("td"));

theRow2.appendChild(colorRect);

theRow3.appendChild(numberRect);



colorRect.onmouseover=function(){

this.style.border="solid 1.2px";

};

colorRect.onmouseout=function(){

this.style.border="none";

};



counter++;



for(var j=lowPoint+stepSize;j<highPoint;j+=stepSize){

var fraction=(j-lowPoint)/(highPoint-lowPoint);

var newRed=Math.floor(gradientPoints[i].red+fraction*(gradientPoints[i+1].red-gradientPoints[i].red));

var newGreen=Math.floor(gradientPoints[i].green+fraction*(gradientPoints[i+1].green-gradientPoints[i].green));

var newBlue=Math.floor(gradientPoints[i].blue+fraction*(gradientPoints[i+1].blue-gradientPoints[i].blue));



var colorRect=document.createElement("td");

colorRect.count=counter;

colorRect.style.backgroundColor="rgb("+newRed+","+newGreen+","+newBlue+")";

var numberRect=document.createElement("td");

var textDiv=document.createElement("div");

var theText=document.createTextNode((Math.floor(j*100))/100);

textDiv.appendChild(theText);

numberRect.appendChild(textDiv);

textDiv.style.width="2px";

textDiv.style.overflow="hidden";

textDiv.style.visibility="hidden";

theRow1.appendChild(numberRect);

theRow2.appendChild(colorRect);

theRow3.appendChild(document.createElement("td"));

counter++;



colorRect.onmouseover=function(){

this.parentNode.parentNode.childNodes[0].childNodes[this.count].childNodes[0].style.visibility="visible";

this.parentNode.parentNode.childNodes[0].childNodes[this.count].childNodes[0].style.overflow="visible";

this.style.border="solid 1.2px";

};

colorRect.onmouseout=function(){

this.parentNode.parentNode.childNodes[0].childNodes[this.count].childNodes[0].style.visibility="hidden";

this.parentNode.parentNode.childNodes[0].childNodes[this.count].childNodes[0].style.overflow="hidden";

this.style.border="none";

};

};

};



var high=gradientPoints.length-1

var colorRect=document.createElement("td");

colorRect.style.backgroundColor="rgb("+gradientPoints[high].red+","+gradientPoints[high].green+","+gradientPoints[high].blue+")";

var numberRect=document.createElement("td");

var textDiv=document.createElement("div");

var theText=document.createTextNode(globHighPoint);

textDiv.appendChild(theText);

numberRect.appendChild(textDiv);

theRow1.appendChild(document.createElement("td"));

theRow2.appendChild(colorRect);

theRow3.appendChild(numberRect);

counter++;



colorRect.onmouseover=function(){

this.style.border="solid 1.2px";

};

colorRect.onmouseout=function(){

this.style.border="none";

};



this._div.appendChild(theTable);

};



Exhibit.LegendGradientWidget.prototype.addEntry=function(color,label){

var cell=document.createElement("td");



cell.style.width="1.5em";

cell.style.height="2em";

this._theRow1.appendChild(cell);

this._theRow1.appendChild(document.createElement("td"));

this._theRow2.appendChild(document.createElement("td"));

this._theRow3.appendChild(document.createElement("td"));



var colorCell=document.createElement("td");



colorCell.style.backgroundColor=color;

this._theRow2.appendChild(colorCell);



var labelCell=document.createElement("td");

var labelDiv=document.createElement("div");



labelDiv.appendChild(document.createTextNode(label));

labelCell.appendChild(labelDiv);

this._theRow3.appendChild(labelCell);

}



Exhibit.LegendGradientWidget.prototype.dispose=function(){

this._div.innerHTML="";



this._div=null;

this._uiContext=null;

};



Exhibit.LegendGradientWidget.prototype._initializeUI=function(){

this._div.className="exhibit-legendGradientWidget";

this._div.innerHTML="";

};



Exhibit.LegendGradientWidget.prototype.clear=function(){

this._div.innerHTML="";

};



/* legend-widget.js */


Exhibit.LegendWidget=function(configuration,containerElmt,uiContext){
this._configuration=configuration;
this._div=containerElmt;
this._uiContext=uiContext;

this._colorMarkerGenerator="colorMarkerGenerator"in configuration?
configuration.colorMarkerGenerator:
Exhibit.LegendWidget._defaultColorMarkerGenerator;
this._sizeMarkerGenerator="sizeMarkerGenerator"in configuration?
configuration.sizeMarkerGenerator:
Exhibit.LegendWidget._defaultSizeMarkerGenerator;
this._iconMarkerGenerator="iconMarkerGenerator"in configuration?
configuration.iconMarkerGenerator:
Exhibit.LegendWidget._defaultIconMarkerGenerator;

this._labelStyler="labelStyler"in configuration?
configuration.labelStyler:
Exhibit.LegendWidget._defaultColorLabelStyler;

this._initializeUI();
};

Exhibit.LegendWidget.create=function(configuration,containerElmt,uiContext){
return new Exhibit.LegendWidget(configuration,containerElmt,uiContext);
};

Exhibit.LegendWidget.prototype.dispose=function(){
this._div.innerHTML="";

this._div=null;
this._uiContext=null;
};

Exhibit.LegendWidget.prototype._initializeUI=function(){
this._div.className="exhibit-legendWidget";
this._div.innerHTML="<div id='exhibit-color-legend'></div><div id='exhibit-size-legend'></div><div id='exhibit-icon-legend'></div>";
};

Exhibit.LegendWidget.prototype.clear=function(){
this._div.innerHTML="<div id='exhibit-color-legend'></div><div id='exhibit-size-legend'></div><div id='exhibit-icon-legend'></div>";
};

Exhibit.LegendWidget.prototype.addLegendLabel=function(label,type){
var dom=SimileAjax.DOM.createDOMFromString(
"div",
"<div id='legend-label'>"+
"<span id='label' class='exhibit-legendWidget-entry-title'>"+
label.replace(/\s+/g,"\u00a0")+
"</span>"+
"\u00a0\u00a0 </div>",
{}
);
dom.elmt.className="exhibit-legendWidget-label";
var id='exhibit-'+type+'-legend';
document.getElementById(id).appendChild(dom.elmt);
}

Exhibit.LegendWidget.prototype.addEntry=function(value,label,type){
type=type||'color';
label=(label!=null)?label.toString():key.toString();
if(type=='color'){
var dom=SimileAjax.DOM.createDOMFromString(
"span",
"<span id='marker'></span>\u00a0"+
"<span id='label' class='exhibit-legendWidget-entry-title'>"+
label.replace(/\s+/g,"\u00a0")+
"</span>"+
"\u00a0\u00a0 ",
{marker:this._colorMarkerGenerator(value)}
);
var legendDiv=document.getElementById('exhibit-color-legend');
}
if(type=='size'){
var dom=SimileAjax.DOM.createDOMFromString(
"span",
"<span id='marker'></span>\u00a0"+
"<span id='label' class='exhibit-legendWidget-entry-title'>"+
label.replace(/\s+/g,"\u00a0")+
"</span>"+
"\u00a0\u00a0 ",
{marker:this._sizeMarkerGenerator(value)}
);
var legendDiv=document.getElementById('exhibit-size-legend');
}
if(type=='icon'){
var dom=SimileAjax.DOM.createDOMFromString(
"span",
"<span id='marker'></span>\u00a0"+
"<span id='label' class='exhibit-legendWidget-entry-title'>"+
label.replace(/\s+/g,"\u00a0")+
"</span>"+
"\u00a0\u00a0 ",
{marker:this._iconMarkerGenerator(value)}
);
var legendDiv=document.getElementById('exhibit-icon-legend');
}
dom.elmt.className="exhibit-legendWidget-entry";
this._labelStyler(dom.label,value);
legendDiv.appendChild(dom.elmt);
};

Exhibit.LegendWidget._localeSort=function(a,b){
return a.localeCompare(b);
}

Exhibit.LegendWidget._defaultColorMarkerGenerator=function(value){
var span=document.createElement("span");
span.className="exhibit-legendWidget-entry-swatch";
span.style.background=value;
span.innerHTML="\u00a0\u00a0";
return span;
};

Exhibit.LegendWidget._defaultSizeMarkerGenerator=function(value){
var span=document.createElement("span");
span.className="exhibit-legendWidget-entry-swatch";
span.style.height=value;
span.style.width=value;
span.style.background="#C0C0C0";
span.innerHTML="\u00a0\u00a0";
return span;
}

Exhibit.LegendWidget._defaultIconMarkerGenerator=function(value){
var span=document.createElement("span");
span.className="<img src="+value+"/>";
return span;
}

Exhibit.LegendWidget._defaultColorLabelStyler=function(elmt,value){

};


/* logo.js */


Exhibit.Logo=function(elmt,exhibit){
this._exhibit=exhibit;
this._elmt=elmt;
this._color="Silver";
}

Exhibit.Logo.create=function(configuration,elmt,exhibit){
var logo=new Exhibit.Logo(elmt,exhibit);

if("color"in configuration){
this._color=configuration.color;
}

Logo._initializeUI();
return logo;
};

Exhibit.Logo.createFromDOM=function(elmt,exhibit){
var logo=new Exhibit.Logo(elmt,exhibit);

var color=Exhibit.getAttribute(elmt,"color");
if(color!=null&&color.length>0){
logo._color=color;
}

logo._initializeUI();
return logo;
};

Exhibit.Logo.prototype.dispose=function(){
this._elmt=null;
this._exhibit=null;
};

Exhibit.Logo.prototype._initializeUI=function(){
var logoURL="http://static.simile.mit.edu/graphics/logos/exhibit/exhibit-small-"+this._color+".png";
var img=SimileAjax.Graphics.createTranslucentImage(logoURL);
var id="exhibit-logo-image";
if(!document.getElementById(id)){
img.id=id;
}
var a=document.createElement("a");
a.href="http://simile.mit.edu/exhibit/";
a.title="http://simile.mit.edu/exhibit/";
a.target="_blank";
a.appendChild(img);

this._elmt.appendChild(a);
};


/* option-widget.js */


Exhibit.OptionWidget=function(configuration,containerElmt,uiContext){
this._label=configuration.label;
this._checked="checked"in configuration?configuration.checked:false;
this._onToggle=configuration.onToggle;

this._containerElmt=containerElmt;
this._uiContext=uiContext;
this._initializeUI();
};

Exhibit.OptionWidget.create=function(configuration,containerElmt,uiContext){
return new Exhibit.OptionWidget(configuration,containerElmt,uiContext);
};

Exhibit.OptionWidget.prototype.dispose=function(){
this._containerElmt.innerHTML="";

this._dom=null;
this._containerElmt=null;
this._uiContext=null;
};

Exhibit.OptionWidget.uncheckedImageURL=Exhibit.urlPrefix+"images/option.png";

Exhibit.OptionWidget.checkedImageURL=Exhibit.urlPrefix+"images/option-check.png";

Exhibit.OptionWidget.uncheckedTemplate=
"<span id='uncheckedSpan' style='display: none;'><img id='uncheckedImage' /> %0</span>";

Exhibit.OptionWidget.checkedTemplate=
"<span id='checkedSpan' style='display: none;'><img id='checkedImage' /> %0</span>";

Exhibit.OptionWidget.prototype._initializeUI=function(){
this._containerElmt.className="exhibit-optionWidget";
this._dom=SimileAjax.DOM.createDOMFromString(
this._containerElmt,
String.substitute(
Exhibit.OptionWidget.uncheckedTemplate+Exhibit.OptionWidget.checkedTemplate,
[this._label]
),
{uncheckedImage:SimileAjax.Graphics.createTranslucentImage(Exhibit.OptionWidget.uncheckedImageURL),
checkedImage:SimileAjax.Graphics.createTranslucentImage(Exhibit.OptionWidget.checkedImageURL)
}
);

if(this._checked){
this._dom.checkedSpan.style.display="inline";
}else{
this._dom.uncheckedSpan.style.display="inline";
}

SimileAjax.WindowManager.registerEvent(this._containerElmt,"click",this._onToggle);
};

Exhibit.OptionWidget.prototype.getChecked=function(){
return this._checked;
};

Exhibit.OptionWidget.prototype.setChecked=function(checked){
if(checked!=this._checked){
this._checked=checked;
if(checked){
this._dom.checkedSpan.style.display="inline";
this._dom.uncheckedSpan.style.display="none";
}else{
this._dom.checkedSpan.style.display="none";
this._dom.uncheckedSpan.style.display="inline";
}
}
};

Exhibit.OptionWidget.prototype.toggle=function(){
this.setChecked(!this._checked);
};


/* resizable-div-widget.js */


Exhibit.ResizableDivWidget=function(configuration,elmt,uiContext){
this._div=elmt;
this._configuration=configuration;
if(!("minHeight"in configuration)){
configuration["minHeight"]=10;
}

this._initializeUI();
};

Exhibit.ResizableDivWidget.create=function(configuration,elmt,uiContext){
return new Exhibit.ResizableDivWidget(configuration,elmt,uiContext);
};

Exhibit.ResizableDivWidget.prototype.dispose=function(){
this._div.innerHTML="";
this._contentDiv=null;
this._resizerDiv=null;
this._div=null;
};

Exhibit.ResizableDivWidget.prototype.getContentDiv=function(){
return this._contentDiv;
};

Exhibit.ResizableDivWidget.prototype._initializeUI=function(){
var self=this;

this._div.innerHTML=
"<div></div>"+
"<div class='exhibit-resizableDivWidget-resizer'>"+
SimileAjax.Graphics.createTranslucentImageHTML(Exhibit.urlPrefix+"images/down-arrow.png")+
"</div>";

this._contentDiv=this._div.childNodes[0];
this._resizerDiv=this._div.childNodes[1];

SimileAjax.WindowManager.registerForDragging(
this._resizerDiv,
{onDragStart:function(){
this._height=self._contentDiv.offsetHeight;
},
onDragBy:function(diffX,diffY){
this._height+=diffY;
self._contentDiv.style.height=Math.max(
self._configuration.minHeight,
this._height
)+"px";
},
onDragEnd:function(){
if("onResize"in self._configuration){
self._configuration["onResize"]();
}
}
}
);
};


/* toolbox-widget.js */


Exhibit.ToolboxWidget=function(containerElmt,uiContext){
this._containerElmt=containerElmt;
this._uiContext=uiContext;
this._settings={};

this._hovering=false;
this._initializeUI();
};

Exhibit.ToolboxWidget._settingSpecs={
"itemID":{type:"text"}
};

Exhibit.ToolboxWidget.create=function(configuration,containerElmt,uiContext){
var widget=new Exhibit.ToolboxWidget(
containerElmt,
Exhibit.UIContext.create(configuration,uiContext)
);
Exhibit.ToolboxWidget._configure(widget,configuration);

widget._initializeUI();
return widget;
};

Exhibit.ToolboxWidget.createFromDOM=function(configElmt,containerElmt,uiContext){
var configuration=Exhibit.getConfigurationFromDOM(configElmt);
var widget=new Exhibit.ToolboxWidget(
containerElmt!=null?containerElmt:configElmt,
Exhibit.UIContext.createFromDOM(configElmt,uiContext)
);

Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt,Exhibit.ToolboxWidget._settingSpecs,widget._settings);
Exhibit.ToolboxWidget._configure(widget,configuration);

widget._initializeUI();
return widget;
};

Exhibit.ToolboxWidget._configure=function(widget,configuration){
Exhibit.SettingsUtilities.collectSettings(configuration,Exhibit.ToolboxWidget._settingSpecs,widget._settings);
};

Exhibit.ToolboxWidget.prototype.dispose=function(){
this._containerElmt.onmouseover=null;
this._containerElmt.onmouseout=null;

this._dismiss();
this._settings=null;
this._containerElmt=null;
this._uiContext=null;
};

Exhibit.ToolboxWidget.prototype._initializeUI=function(){
var self=this;
this._containerElmt.onmouseover=function(evt){self._onContainerMouseOver(evt);};
this._containerElmt.onmouseout=function(evt){self._onContainerMouseOut(evt);};
};

Exhibit.ToolboxWidget.prototype._onContainerMouseOver=function(evt){
if(!this._hovering){
var self=this;
var coords=SimileAjax.DOM.getPageCoordinates(this._containerElmt);
var docWidth=document.body.offsetWidth;
var docHeight=document.body.offsetHeight;

var popup=document.createElement("div");
popup.className="exhibit-toolboxWidget-popup screen";
popup.style.top=coords.top+"px";
popup.style.right=(docWidth-coords.left-this._containerElmt.offsetWidth)+"px";

this._fillPopup(popup);

document.body.appendChild(popup);
popup.onmouseover=function(evt){self._onPopupMouseOver(evt);};
popup.onmouseout=function(evt){self._onPopupMouseOut(evt);};

this._popup=popup;
this._hovering=true;
}else{
this._clearTimeout();
}
};

Exhibit.ToolboxWidget.prototype._onContainerMouseOut=function(evt){
if(Exhibit.ToolboxWidget._mouseOutsideElmt(Exhibit.ToolboxWidget._getEvent(evt),this._containerElmt)){
this._setTimeout();
}
};

Exhibit.ToolboxWidget.prototype._onPopupMouseOver=function(evt){
this._clearTimeout();
};

Exhibit.ToolboxWidget.prototype._onPopupMouseOut=function(evt){
if(Exhibit.ToolboxWidget._mouseOutsideElmt(Exhibit.ToolboxWidget._getEvent(evt),this._containerElmt)){
this._setTimeout();
}
};

Exhibit.ToolboxWidget.prototype._setTimeout=function(){
var self=this;
this._timer=window.setTimeout(function(){self._onTimeout();},200)
};

Exhibit.ToolboxWidget.prototype._clearTimeout=function(){
if(this._timer){
window.clearTimeout(this._timer);
this._timer=null;
}
};

Exhibit.ToolboxWidget.prototype._onTimeout=function(){
this._dismiss();
this._hovering=false;
this._timer=null;
};

Exhibit.ToolboxWidget.prototype._fillPopup=function(elmt){
var self=this;

var exportImg=Exhibit.UI.createTranslucentImage("images/liveclipboard-icon.png");
exportImg.className="exhibit-toolboxWidget-button";
SimileAjax.WindowManager.registerEvent(
exportImg,
"click",
function(elmt,evt,target){
self._showExportMenu(exportImg);
}
);

elmt.appendChild(exportImg);
};

Exhibit.ToolboxWidget.prototype._dismiss=function(){
if(this._popup){
document.body.removeChild(this._popup);
this._popup=null;
}
};

Exhibit.ToolboxWidget._mouseOutsideElmt=function(evt,elmt){
var eventCoords=SimileAjax.DOM.getEventPageCoordinates(evt);
var coords=SimileAjax.DOM.getPageCoordinates(elmt);
return((eventCoords.x<coords.left||eventCoords.x>coords.left+elmt.offsetWidth)||
(eventCoords.y<coords.top||eventCoords.y>coords.top+elmt.offsetHeight));
};

Exhibit.ToolboxWidget._getEvent=function(evt){
return(evt)?evt:((event)?event:null);
};

Exhibit.ToolboxWidget.prototype._showExportMenu=function(elmt){
var self=this;
var popupDom=Exhibit.UI.createPopupMenuDom(elmt);

var makeMenuItem=function(exporter){
popupDom.appendMenuItem(
exporter.getLabel(),
null,
function(){
var database=self._uiContext.getDatabase();
var text=("itemID"in self._settings)?
exporter.exportOne(self._settings.itemID,database):
exporter.exportMany(
self._uiContext.getCollection().getRestrictedItems(),
database
);
Exhibit.ToolboxWidget.createExportDialogBox(text).open();
}
);
}

var exporters=Exhibit.getExporters();
for(var i=0;i<exporters.length;i++){
makeMenuItem(exporters[i]);
}



popupDom.open();
};

Exhibit.ToolboxWidget.createExportDialogBox=function(string){
var template={
tag:"div",
className:"exhibit-copyDialog exhibit-ui-protection",
children:[
{tag:"button",
field:"closeButton",
children:[Exhibit.l10n.exportDialogBoxCloseButtonLabel]
},
{tag:"p",
children:[Exhibit.l10n.exportDialogBoxPrompt]
},
{tag:"div",
field:"textAreaContainer"
}
]
};
var dom=SimileAjax.DOM.createDOMFromTemplate(template);
dom.textAreaContainer.innerHTML=
"<textarea wrap='off' rows='15'>"+string+"</textarea>";

dom.close=function(){
document.body.removeChild(dom.elmt);
};
dom.open=function(){
dom.elmt.style.top=(document.body.scrollTop+100)+"px";

document.body.appendChild(dom.elmt);
dom.layer=SimileAjax.WindowManager.pushLayer(function(){dom.close();},false);

var textarea=dom.textAreaContainer.firstChild;
textarea.select();

SimileAjax.WindowManager.registerEvent(
dom.closeButton,
"click",
function(elmt,evt,target){SimileAjax.WindowManager.popLayer(dom.layer);},
dom.layer
);
SimileAjax.WindowManager.registerEvent(
textarea,
"keyup",
function(elmt,evt,target){
if(evt.keyCode==27){
SimileAjax.WindowManager.popLayer(dom.layer);
}
},
dom.layer
);
};

return dom;
};



/* facets.js */


Exhibit.FacetUtilities=new Object();



Exhibit.FacetUtilities.constructFacetFrame=function(div,facetLabel,onClearAllSelections,uiContext){
div.className="exhibit-facet";
var dom=SimileAjax.DOM.createDOMFromString(
div,
"<div class='exhibit-facet-header'>"+
"<div class='exhibit-facet-header-filterControl' id='clearSelectionsDiv' title='"+Exhibit.FacetUtilities.l10n.clearSelectionsTooltip+"'>"+
"<span id='filterCountSpan'></span>"+
"<img id='checkImage' />"+
"</div>"+
"<span class='exhibit-facet-header-title'>"+facetLabel+"</span>"+
"</div>"+
"<div class='exhibit-facet-body-frame' id='frameDiv'></div>",
{checkImage:Exhibit.UI.createTranslucentImage("images/black-check.png")}
);
var resizableDivWidget=Exhibit.ResizableDivWidget.create({},dom.frameDiv,uiContext);

dom.valuesContainer=resizableDivWidget.getContentDiv();
dom.valuesContainer.className="exhibit-facet-body";

dom.setSelectionCount=function(count){
this.filterCountSpan.innerHTML=count;
this.clearSelectionsDiv.style.display=count>0?"block":"none";
};
SimileAjax.WindowManager.registerEvent(dom.clearSelectionsDiv,"click",onClearAllSelections);

return dom;
};

Exhibit.FacetUtilities.constructFacetItem=function(
label,
count,
selected,
facetHasSelection,
onSelect,
onSelectOnly,
uiContext
){
if(Exhibit.params.safe){
label=Exhibit.Formatter.encodeAngleBrackets(label);
}

var dom=SimileAjax.DOM.createDOMFromString(
"div",
"<div class='exhibit-facet-value-count'>"+count+"</div>"+
"<div class='exhibit-facet-value-inner' id='inner'>"+
("<div class='exhibit-facet-value-checkbox'>&nbsp;"+
SimileAjax.Graphics.createTranslucentImageHTML(
Exhibit.urlPrefix+
(facetHasSelection?
(selected?"images/black-check.png":"images/no-check.png"):
"images/no-check-no-border.png"
))+
"</div>"
)+
label+
"</div>"
);
dom.elmt.className=selected?"exhibit-facet-value exhibit-facet-value-selected":"exhibit-facet-value";
dom.elmt.title=label;

SimileAjax.WindowManager.registerEvent(dom.elmt,"click",onSelectOnly,SimileAjax.WindowManager.getBaseLayer());
if(facetHasSelection){
SimileAjax.WindowManager.registerEvent(dom.inner.firstChild,"click",onSelect,SimileAjax.WindowManager.getBaseLayer());
}
return dom.elmt;
};



/* set.js */



Exhibit.Set=function(a){
this._hash={};
this._count=0;

if(a instanceof Array){
for(var i=0;i<a.length;i++){
this.add(a[i]);
}
}else if(a instanceof Exhibit.Set){
this.addSet(a);
}
}

Exhibit.Set.prototype.add=function(o){
if(!(o in this._hash)){
this._hash[o]=true;
this._count++;
return true;
}
return false;
}

Exhibit.Set.prototype.addSet=function(set){
for(o in set._hash){
this.add(o);
}
}

Exhibit.Set.prototype.remove=function(o){
if(o in this._hash){
delete this._hash[o];
this._count--;
return true;
}
return false;
}

Exhibit.Set.prototype.removeSet=function(set){
for(o in set._hash){
this.remove(o);
}
}

Exhibit.Set.prototype.retainSet=function(set){
for(o in this._hash){
if(!set.contains(o)){
delete this._hash[o];
this._count--;
}
}
}

Exhibit.Set.prototype.contains=function(o){
return(o in this._hash);
}

Exhibit.Set.prototype.size=function(){
return this._count;
}

Exhibit.Set.prototype.toArray=function(){
var a=[];
for(o in this._hash){
a.push(o);
}
return a;
}

Exhibit.Set.prototype.visit=function(f){
for(o in this._hash){
if(f(o)==true){
break;
}
}
}


/* settings.js */


Exhibit.SettingsUtilities=new Object();


Exhibit.SettingsUtilities.collectSettings=function(config,specs,settings){
Exhibit.SettingsUtilities._internalCollectSettings(
function(field){return config[field];},
specs,
settings
);
};

Exhibit.SettingsUtilities.collectSettingsFromDOM=function(configElmt,specs,settings){
Exhibit.SettingsUtilities._internalCollectSettings(
function(field){return Exhibit.getAttribute(configElmt,field);},
specs,
settings
);
};

Exhibit.SettingsUtilities._internalCollectSettings=function(f,specs,settings){
for(var field in specs){
var spec=specs[field];
var name=field;
if("name"in spec){
name=spec.name;
}
if(!(name in settings)&&"defaultValue"in spec){
settings[name]=spec.defaultValue;
}

var value=f(field);
if(value==null){
continue;
}
value=value.trim();
if(value.length==0){
continue;
}

var type="text";
if("type"in spec){
type=spec.type;
}

var dimensions=1;
if("dimensions"in spec){
dimensions=spec.dimensions;
}

try{
if(dimensions>1){
var separator=",";
if("separator"in spec){
separator=spec.separator;
}

var a=value.split(separator);
if(a.length!=dimensions){
throw new Error("Expected a tuple of "+dimensions+" dimensions separated with "+separator+" but got "+value);
}else{
for(var i=0;i<a.length;i++){
a[i]=Exhibit.SettingsUtilities._parseSetting(a[i].trim(),type,spec);
}

settings[name]=a;
}
}else{
settings[name]=Exhibit.SettingsUtilities._parseSetting(value,type,spec);
}
}catch(e){
SimileAjax.Debug.exception(e);
}
}
};

Exhibit.SettingsUtilities._parseSetting=function(s,type,spec){
if(type=="text"){
return s;
}else if(type=="float"){
var f=parseFloat(s);
if(isNaN(f)){
throw new Error("Expected a floating point number but got "+s);
}else{
return f;
}
}else if(type=="int"){
var n=parseInt(s);
if(isNaN(n)){
throw new Error("Expected an integer but got "+s);
}else{
return n;
}
}else if(type=="boolean"){
s=s.toLowerCase();
if(s=="true"){
return true;
}else if(s=="false"){
return false;
}else{
throw new Error("Expected either 'true' or 'false' but got "+s);
}
}else if(type=="function"){
try{
if(typeof s=="string"){
s=eval(s);
}
if(typeof s=="function"){
return s;
}
}catch(e){

}

throw new Error("Expected a function or the name of a function but got "+s);
}else if(type=="enum"){
var choices=spec.choices;
for(var i=0;i<choices.length;i++){
if(choices[i]==s){
return s;
}
}
throw new Error("Expected one of "+choices.join(", ")+" but got "+s);
}else{
throw new Error("Unknown setting type "+type);
}
};


Exhibit.SettingsUtilities.createAccessors=function(config,specs,accessors){
Exhibit.SettingsUtilities._internalCreateAccessors(
function(field){return config[field];},
specs,
accessors
);
};

Exhibit.SettingsUtilities.createAccessorsFromDOM=function(configElmt,specs,accessors){
Exhibit.SettingsUtilities._internalCreateAccessors(
function(field){return Exhibit.getAttribute(configElmt,field);},
specs,
accessors
);
};

Exhibit.SettingsUtilities._internalCreateAccessors=function(f,specs,accessors){
for(var field in specs){
var spec=specs[field];
var accessorName=spec.accessorName;
var accessor=null;
var isTuple=false;

var createOneAccessor=function(spec2){
isTuple=false;
if("bindings"in spec2){
return Exhibit.SettingsUtilities._createBindingsAccessor(f,spec2.bindings);
}else if("bindingNames"in spec2){
isTuple=true;
return Exhibit.SettingsUtilities._createTupleAccessor(f,spec2);
}else{
return Exhibit.SettingsUtilities._createElementalAccessor(f,spec2);
}
};

if("alternatives"in spec){
var alternatives=spec.alternatives;
for(var i=0;i<alternatives.length;i++){
accessor=createOneAccessor(alternatives[i]);
if(accessor!=null){
break;
}
}
}else{
accessor=createOneAccessor(spec);
}

if(accessor!=null){
if(isTuple){
accessors[accessorName]=function(value,database,visitor){
accessor(value,database,visitor,{});
};
}else{
accessors[accessorName]=accessor;
}
}else if(!(accessorName in accessors)){
accessors[accessorName]=function(value,database,visitor){};
}
}
};

Exhibit.SettingsUtilities._createBindingsAccessor=function(f,bindingSpecs){
var bindings=[];
for(var i=0;i<bindingSpecs.length;i++){
var bindingSpec=bindingSpecs[i];
var accessor=null;
var isTuple=false;

if("bindingNames"in bindingSpec){
isTuple=true;
accessor=Exhibit.SettingsUtilities._createTupleAccessor(f,bindingSpec);
}else{
accessor=Exhibit.SettingsUtilities._createElementalAccessor(f,bindingSpec);
}

if(accessor==null){
if(!("optional"in bindingSpec)||!bindingSpec.optional){
return null;
}
}else{
bindings.push({
bindingName:bindingSpec.bindingName,
accessor:accessor,
isTuple:isTuple
});
}
}

return function(value,database,visitor){
Exhibit.SettingsUtilities._evaluateBindings(value,database,visitor,bindings);
};
};

Exhibit.SettingsUtilities._createTupleAccessor=function(f,spec){
var value=f(spec.attributeName);

if(value==null){
return null;
}
value=value.trim();
if(value.length==0){
return null;
}

try{
var expression=Exhibit.ExpressionParser.parse(value);

var parsers=[];
var bindingTypes=spec.types;
for(var i=0;i<bindingTypes.length;i++){
parsers.push(Exhibit.SettingsUtilities._typeToParser(bindingTypes[i]));
}

var bindingNames=spec.bindingNames;
var separator=",";

if("separator"in spec){

separator=spec.separator;

}

return function(itemID,database,visitor,tuple){
expression.evaluateOnItem(itemID,database).values.visit(
function(v){
var a=v.split(separator);
if(a.length==parsers.length){
for(var i=0;i<bindingNames.length;i++){
tuple[bindingNames[i]]=null;
parsers[i](a[i],function(v){tuple[bindingNames[i]]=v;});
}
visitor(tuple);
}
}
);
};

}catch(e){
SimileAjax.Debug.exception(e);
return null;
}
};

Exhibit.SettingsUtilities._createElementalAccessor=function(f,spec){
var value=f(spec.attributeName);

if(value==null){
return null;
}
value=value.trim();
if(value.length==0){
return null;
}

var bindingType="text";

if("type"in spec){

bindingType=spec.type;

}


try{
var expression=Exhibit.ExpressionParser.parse(value);

var parser=Exhibit.SettingsUtilities._typeToParser(bindingType);

return function(itemID,database,visitor){
expression.evaluateOnItem(itemID,database).values.visit(
function(v){return parser(v,visitor);}
);
};

}catch(e){
SimileAjax.Debug.exception(e);
return null;
}
}

Exhibit.SettingsUtilities._typeToParser=function(type){
switch(type){
case"text":return Exhibit.SettingsUtilities._textParser;
case"url":return Exhibit.SettingsUtilities._urlParser;
case"float":return Exhibit.SettingsUtilities._floatParser;
case"int":return Exhibit.SettingsUtilities._intParser;
case"date":return Exhibit.SettingsUtilities._dateParser;
case"boolean":return Exhibit.SettingsUtilities._booleanParser;
default:
throw new Error("Unknown setting type "+type);

}
}

Exhibit.SettingsUtilities._textParser=function(v,f){
return f(v);
};

Exhibit.SettingsUtilities._floatParser=function(v,f){
var n=parseFloat(v);
if(!isNaN(n)){
return f(n);
}
return false;
};

Exhibit.SettingsUtilities._intParser=function(v,f){
var n=parseInt(v);
if(!isNaN(n)){
return f(n);
}
return false;
};

Exhibit.SettingsUtilities._dateParser=function(v,f){
if(v instanceof Date){
return f(v);
}else if(typeof v=="number"){
var d=new Date(0);
d.setUTCFullYear(v);
return f(d);
}else{
var d=SimileAjax.DateTime.parseIso8601DateTime(v.toString());
if(d!=null){
return f(d);
}
}
return false;
};

Exhibit.SettingsUtilities._booleanParser=function(v,f){
v=v.toString().toLowerCase();
if(v=="true"){
return f(true);
}else if(v=="false"){
return f(false);
}
return false;
};

Exhibit.SettingsUtilities._urlParser=function(v,f){
return f(Exhibit.Persistence.resolveURL(v.toString()));
};

Exhibit.SettingsUtilities._evaluateBindings=function(value,database,visitor,bindings){
var maxIndex=bindings.length-1;
var f=function(tuple,index){
var binding=bindings[index];
var visited=false;

var recurse=index==maxIndex?function(){visitor(tuple);}:function(){f(tuple,index+1);};
if(binding.isTuple){
binding.accessor(
value,
database,
function(){visited=true;recurse();},
tuple
);
}else{
var bindingName=binding.bindingName;
binding.accessor(
value,
database,
function(v){visited=true;tuple[bindingName]=v;recurse();}
);
}

if(!visited){recurse();}
};
f({},0);
};


/* util.js */



Exhibit.Util={};





Exhibit.Util.augment=function(oSelf,oOther){

if(oSelf==null){

oSelf={};

}

for(var i=1;i<arguments.length;i++){

var o=arguments[i];

if(typeof(o)!='undefined'&&o!=null){

for(var j in o){

if(o.hasOwnProperty(j)){

oSelf[j]=o[j];

}

}

}

}

return oSelf;

}





Exhibit.Util.round=function(n,precision){

precision=precision||1;

var lg=Math.floor(Math.log(precision)/Math.log(10));

n=(Math.round(n/precision)*precision).toString();

var d=n.split(".");

if(lg>=0){

return d[0];

}



lg=-lg;

d[1]=(d[1]||"").substring(0,lg);

while(d[1].length<lg){

d[1]+="0";

}

return d.join(".");

}



if(!Array.prototype.map){

Array.prototype.map=function(f,thisp){

if(typeof f!="function")

throw new TypeError();

if(typeof thisp=="undefined"){

thisp=this;

}

var res=[],length=this.length;

for(var i=0;i<length;i++){

if(this.hasOwnProperty(i))

res[i]=f.call(thisp,this[i],i,this);

}

return res;

};

}



/* views.js */


Exhibit.ViewUtilities=new Object();

Exhibit.ViewUtilities.openBubbleForItems=function(anchorElmt,arrayOfItemIDs,uiContext){
var coords=SimileAjax.DOM.getPageCoordinates(anchorElmt);
var bubble=SimileAjax.Graphics.createBubbleForPoint(
coords.left+Math.round(elmt.offsetWidth/2),
coords.top+Math.round(elmt.offsetHeight/2),
uiContext.getSetting("bubbleWidth"),
uiContext.getSetting("bubbleHeight")
);
Exhibit.ViewUtilities.fillBubbleWithItems(bubble.content,arrayOfItemIDs,uiContext);
};

Exhibit.ViewUtilities.fillBubbleWithItems=function(bubbleElmt,arrayOfItemIDs,uiContext){
if(bubbleElmt==null){
bubbleElmt=document.createElement("div");
}

if(arrayOfItemIDs.length>1){
var ul=document.createElement("ul");
for(var i=0;i<arrayOfItemIDs.length;i++){
uiContext.format(arrayOfItemIDs[i],"item",function(elmt){
var li=document.createElement("li");
li.appendChild(elmt);
ul.appendChild(li);
});
}
bubbleElmt.appendChild(ul);
}else{
var itemLensDiv=document.createElement("div");
var itemLens=uiContext.getLensRegistry().createLens(arrayOfItemIDs[0],itemLensDiv,uiContext);
bubbleElmt.appendChild(itemLensDiv);
}

return bubbleElmt;
};

Exhibit.ViewUtilities.constructPlottingViewDom=function(
div,
uiContext,
showSummary,
resizableDivWidgetSettings,
legendWidgetSettings
)
{
var dom=SimileAjax.DOM.createDOMFromString(
div,
"<div class='exhibit-views-header'>"+
(showSummary?"<div id='collectionSummaryDiv'></div>":"")+
"<div id='unplottableMessageDiv' class='exhibit-views-unplottableMessage'></div>"+
"</div>"+
"<div id='resizableDiv'></div>"+
"<div id='legendDiv'></div>",
{}
);

if(showSummary){
dom.collectionSummaryWidget=Exhibit.CollectionSummaryWidget.create(
{},
dom.collectionSummaryDiv,
uiContext
);
}

dom.resizableDivWidget=Exhibit.ResizableDivWidget.create(
resizableDivWidgetSettings,
dom.resizableDiv,
uiContext
);
dom.plotContainer=dom.resizableDivWidget.getContentDiv();

if(legendWidgetSettings.colorGradient==true){
dom.legendGradientWidget=Exhibit.LegendGradientWidget.create(
dom.legendDiv,
uiContext
);
}else{
dom.legendWidget=Exhibit.LegendWidget.create(
legendWidgetSettings,
dom.legendDiv,
uiContext
);
}

dom.setUnplottableMessage=function(totalCount,unplottableItems){
Exhibit.ViewUtilities._setUnplottableMessage(dom,totalCount,unplottableItems,uiContext);
};
dom.dispose=function(){
if(showSummary){
dom.collectionSummaryWidget.dispose();
}
dom.resizableDivWidget.dispose();
dom.legendWidget.dispose();
};

return dom;
};

Exhibit.ViewUtilities._setUnplottableMessage=function(dom,totalCount,unplottableItems,uiContext){
var div=dom.unplottableMessageDiv;
if(unplottableItems.length==0){
div.style.display="none";
}else{
div.innerHTML="";

var dom=SimileAjax.DOM.createDOMFromString(
div,
Exhibit.ViewUtilities.l10n.unplottableMessageFormatter(totalCount,unplottableItems,uiContext),
{}
);
SimileAjax.WindowManager.registerEvent(dom.unplottableCountLink,"click",function(elmt,evt,target){
Exhibit.ViewUtilities.openBubbleForItems(elmt,unplottableItems,uiContext);
});
div.style.display="block";
}
};
