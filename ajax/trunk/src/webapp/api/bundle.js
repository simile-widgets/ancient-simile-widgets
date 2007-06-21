

/* platform.js */



SimileAjax.Platform.os={
isMac:false,
isWin:false,
isWin32:false,
isUnix:false
};
SimileAjax.Platform.browser={
isIE:false,
isNetscape:false,
isMozilla:false,
isFirefox:false,
isOpera:false,
isSafari:false,

majorVersion:0,
minorVersion:0
};

(function(){
var an=navigator.appName.toLowerCase();
var ua=navigator.userAgent.toLowerCase();


SimileAjax.Platform.os.isMac=(ua.indexOf('mac')!=-1);
SimileAjax.Platform.os.isWin=(ua.indexOf('win')!=-1);
SimileAjax.Platform.os.isWin32=SimileAjax.Platform.isWin&&(
ua.indexOf('95')!=-1||
ua.indexOf('98')!=-1||
ua.indexOf('nt')!=-1||
ua.indexOf('win32')!=-1||
ua.indexOf('32bit')!=-1
);
SimileAjax.Platform.os.isUnix=(ua.indexOf('x11')!=-1);


SimileAjax.Platform.browser.isIE=(an.indexOf("microsoft")!=-1);
SimileAjax.Platform.browser.isNetscape=(an.indexOf("netscape")!=-1);
SimileAjax.Platform.browser.isMozilla=(ua.indexOf("mozilla")!=-1);
SimileAjax.Platform.browser.isFirefox=(ua.indexOf("firefox")!=-1);
SimileAjax.Platform.browser.isOpera=(an.indexOf("opera")!=-1);
SimileAjax.Platform.browser.isSafari=(an.indexOf("safari")!=-1);

var parseVersionString=function(s){
var a=s.split(".");
SimileAjax.Platform.browser.majorVersion=parseInt(a[0]);
SimileAjax.Platform.browser.minorVersion=parseInt(a[1]);
};
var indexOf=function(s,sub,start){
var i=s.indexOf(sub,start);
return i>=0?i:s.length;
};

if(SimileAjax.Platform.browser.isMozilla){
var offset=ua.indexOf("mozilla/");
if(offset>=0){
parseVersionString(ua.substring(offset+8,indexOf(ua," ",offset)));
}
}
if(SimileAjax.Platform.browser.isIE){
var offset=ua.indexOf("msie ");
if(offset>=0){
parseVersionString(ua.substring(offset+5,indexOf(ua,";",offset)));
}
}
if(SimileAjax.Platform.browser.isNetscape){
var offset=ua.indexOf("rv:");
if(offset>=0){
parseVersionString(ua.substring(offset+3,indexOf(ua,")",offset)));
}
}
if(SimileAjax.Platform.browser.isFirefox){
var offset=ua.indexOf("firefox/");
if(offset>=0){
parseVersionString(ua.substring(offset+8,indexOf(ua," ",offset)));
}
}

if(!("localeCompare"in String.prototype)){
String.prototype.localeCompare=function(s){
if(this<s)return-1;
else if(this>s)return 1;
else return 0;
};
}
})();

SimileAjax.Platform.getDefaultLocale=function(){
return SimileAjax.Platform.clientLocale;
};

/* ajax.js */



SimileAjax.ListenerQueue=function(wildcardHandlerName){
this._listeners=[];
this._wildcardHandlerName=wildcardHandlerName;
};

SimileAjax.ListenerQueue.prototype.add=function(listener){
this._listeners.push(listener);
};

SimileAjax.ListenerQueue.prototype.remove=function(listener){
var listeners=this._listeners;
for(var i=0;i<listeners.length;i++){
if(listeners[i]==listener){
listeners.splice(i,1);
break;
}
}
};

SimileAjax.ListenerQueue.prototype.fire=function(handlerName,args){
var listeners=[].concat(this._listeners);
for(var i=0;i<listeners.length;i++){
var listener=listeners[i];
if(handlerName in listener){
try{
listener[handlerName].apply(listener,args);
}catch(e){
SimileAjax.Debug.exception("Error firing event of name "+handlerName,e);
}
}else if(this._wildcardHandlerName!=null&&
this._wildcardHandlerName in listener){
try{
listener[this._wildcardHandlerName].apply(listener,[handlerName]);
}catch(e){
SimileAjax.Debug.exception("Error firing event of name "+handlerName+" to wildcard handler",e);
}
}
}
};



/* date-time.js */



SimileAjax.DateTime=new Object();

SimileAjax.DateTime._dateRegexp=new RegExp(
"^(-?)([0-9]{4})("+[
"(-?([0-9]{2})(-?([0-9]{2}))?)",
"(-?([0-9]{3}))",
"(-?W([0-9]{2})(-?([1-7]))?)"
].join("|")+")?$"
);
SimileAjax.DateTime._timezoneRegexp=new RegExp(
"Z|(([-+])([0-9]{2})(:?([0-9]{2}))?)$"
);
SimileAjax.DateTime._timeRegexp=new RegExp(
"^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(\.([0-9]+))?)?)?$"
);

SimileAjax.DateTime.setIso8601Date=function(dateObject,string){


var d=string.match(SimileAjax.DateTime._dateRegexp);
if(!d){
throw new Error("Invalid date string: "+string);
}

var sign=(d[1]=="-")?-1:1;
var year=sign*d[2];
var month=d[5];
var date=d[7];
var dayofyear=d[9];
var week=d[11];
var dayofweek=(d[13])?d[13]:1;

dateObject.setUTCFullYear(year);
if(dayofyear){
dateObject.setUTCMonth(0);
dateObject.setUTCDate(Number(dayofyear));
}else if(week){
dateObject.setUTCMonth(0);
dateObject.setUTCDate(1);
var gd=dateObject.getUTCDay();
var day=(gd)?gd:7;
var offset=Number(dayofweek)+(7*Number(week));

if(day<=4){
dateObject.setUTCDate(offset+1-day);
}else{
dateObject.setUTCDate(offset+8-day);
}
}else{
if(month){
dateObject.setUTCDate(1);
dateObject.setUTCMonth(month-1);
}
if(date){
dateObject.setUTCDate(date);
}
}

return dateObject;
};

SimileAjax.DateTime.setIso8601Time=function(dateObject,string){


var d=string.match(SimileAjax.DateTime._timeRegexp);
if(!d){
SimileAjax.Debug.warn("Invalid time string: "+string);
return false;
}
var hours=d[1];
var mins=Number((d[3])?d[3]:0);
var secs=(d[5])?d[5]:0;
var ms=d[7]?(Number("0."+d[7])*1000):0;

dateObject.setUTCHours(hours);
dateObject.setUTCMinutes(mins);
dateObject.setUTCSeconds(secs);
dateObject.setUTCMilliseconds(ms);

return dateObject;
};

SimileAjax.DateTime.timezoneOffset=new Date().getTimezoneOffset();

SimileAjax.DateTime.setIso8601=function(dateObject,string){


var offset=SimileAjax.DateTime.timezoneOffset;

var comps=(string.indexOf("T")==-1)?string.split(" "):string.split("T");

SimileAjax.DateTime.setIso8601Date(dateObject,comps[0]);
if(comps.length==2){

var d=comps[1].match(SimileAjax.DateTime._timezoneRegexp);
if(d){
if(d[0]=='Z'){
offset=0;
}else{
offset=(Number(d[3])*60)+Number(d[5]);
offset*=((d[2]=='-')?1:-1);
}
comps[1]=comps[1].substr(0,comps[1].length-d[0].length);
}

SimileAjax.DateTime.setIso8601Time(dateObject,comps[1]);
}
dateObject.setTime(dateObject.getTime()+offset*60000);

return dateObject;
};

SimileAjax.DateTime.parseIso8601DateTime=function(string){
try{
return SimileAjax.DateTime.setIso8601(new Date(0),string);
}catch(e){
return null;
}
};


/* debug.js */



SimileAjax.Debug={
silent:false
};

SimileAjax.Debug.log=function(msg){
var f;
if("console"in window&&"log"in window.console){
f=function(msg2){
console.log(msg2);
}
}else{
f=function(msg2){
if(!SimileAjax.Debug.silent){
alert(msg2);
}
}
}
SimileAjax.Debug.log=f;
f(msg);
};

SimileAjax.Debug.warn=function(msg){
var f;
if("console"in window&&"warn"in window.console){
f=function(msg2){
console.warn(msg2);
}
}else{
f=function(msg2){
if(!SimileAjax.Debug.silent){
alert(msg2);
}
}
}
SimileAjax.Debug.warn=f;
f(msg);
};

SimileAjax.Debug.exception=function(e,msg){
var f,params=SimileAjax.parseURLParameters();
if(params.errors=="throw"||SimileAjax.params.errors=="throw"){
f=function(e2,msg2){
throw(e2);
};
}else if("console"in window&&"error"in window.console){
f=function(e2,msg2){
if(msg2!=null){
console.error(msg2+" %o",e2);
}else{
console.error(e2);
}
throw(e2);
};
}else{
f=function(e2,msg2){
if(!SimileAjax.Debug.silent){
alert("Caught exception: "+msg2+"\n\nDetails: "+("description"in e2?e2.description:e2));
}
throw(e2);
};
}
SimileAjax.Debug.exception=f;
f(e,msg);
};

SimileAjax.Debug.objectToString=function(o){
return SimileAjax.Debug._objectToString(o,"");
};

SimileAjax.Debug._objectToString=function(o,indent){
var indent2=indent+" ";
if(typeof o=="object"){
var s="{";
for(n in o){
s+=indent2+n+": "+SimileAjax.Debug._objectToString(o[n],indent2)+"\n";
}
s+=indent+"}";
return s;
}else if(typeof o=="array"){
var s="[";
for(var n=0;n<o.length;n++){
s+=SimileAjax.Debug._objectToString(o[n],indent2)+"\n";
}
s+=indent+"]";
return s;
}else{
return o;
}
};


/* dom.js */



SimileAjax.DOM=new Object();

SimileAjax.DOM.registerEventWithObject=function(elmt,eventName,obj,handlerName){
SimileAjax.DOM.registerEvent(elmt,eventName,function(elmt2,evt,target){
return obj[handlerName].call(obj,elmt2,evt,target);
});
};

SimileAjax.DOM.registerEvent=function(elmt,eventName,handler){
var handler2=function(evt){
evt=(evt)?evt:((event)?event:null);
if(evt){
var target=(evt.target)?
evt.target:((evt.srcElement)?evt.srcElement:null);
if(target){
target=(target.nodeType==1||target.nodeType==9)?
target:target.parentNode;
}

return handler(elmt,evt,target);
}
return true;
}

if(SimileAjax.Platform.browser.isIE){
elmt.attachEvent("on"+eventName,handler2);
}else{
elmt.addEventListener(eventName,handler2,false);
}
};

SimileAjax.DOM.getPageCoordinates=function(elmt){
var left=0;
var top=0;

if(elmt.nodeType!=1){
elmt=elmt.parentNode;
}

var elmt2=elmt;
while(elmt2!=null){
left+=elmt2.offsetLeft;
top+=elmt2.offsetTop;
elmt2=elmt2.offsetParent;
}

var body=document.body;
while(elmt!=body){
if("scrollLeft"in elmt){
left-=elmt.scrollLeft;
top-=elmt.scrollTop;
}
elmt=elmt.parentNode;
}

return{left:left,top:top};
};

SimileAjax.DOM.getEventRelativeCoordinates=function(evt,elmt){
if(SimileAjax.Platform.browser.isIE){
return{
x:evt.offsetX,
y:evt.offsetY
};
}else{
var coords=SimileAjax.DOM.getPageCoordinates(elmt);
return{
x:evt.pageX-coords.left,
y:evt.pageY-coords.top
};
}
};

SimileAjax.DOM.getEventPageCoordinates=function(evt){
if(SimileAjax.Platform.browser.isIE){
return{
x:evt.clientX+document.body.scrollLeft,
y:evt.clientY+document.body.scrollTop
};
}else{
return{
x:evt.pageX,
y:evt.pageY
};
}
};

SimileAjax.DOM.hittest=function(x,y,except){
return SimileAjax.DOM._hittest(document.body,x,y,except);
};

SimileAjax.DOM._hittest=function(elmt,x,y,except){
var childNodes=elmt.childNodes;
outer:for(var i=0;i<childNodes.length;i++){
var childNode=childNodes[i];
for(var j=0;j<except.length;j++){
if(childNode==except[j]){
continue outer;
}
}

if(childNode.offsetWidth==0&&childNode.offsetHeight==0){

var hitNode=SimileAjax.DOM._hittest(childNode,x,y,except);
if(hitNode!=childNode){
return hitNode;
}
}else{
var top=0;
var left=0;

var node=childNode;
while(node){
top+=node.offsetTop;
left+=node.offsetLeft;
node=node.offsetParent;
}

if(left<=x&&top<=y&&(x-left)<childNode.offsetWidth&&(y-top)<childNode.offsetHeight){
return SimileAjax.DOM._hittest(childNode,x,y,except);
}else if(childNode.nodeType==1&&childNode.tagName=="TR"){

var childNode2=SimileAjax.DOM._hittest(childNode,x,y,except);
if(childNode2!=childNode){
return childNode2;
}
}
}
}
return elmt;
};

SimileAjax.DOM.cancelEvent=function(evt){
evt.returnValue=false;
evt.cancelBubble=true;
if("preventDefault"in evt){
evt.preventDefault();
}
};

SimileAjax.DOM.appendClassName=function(elmt,className){
var classes=elmt.className.split(" ");
for(var i=0;i<classes.length;i++){
if(classes[i]==className){
return;
}
}
classes.push(className);
elmt.className=classes.join(" ");
};

SimileAjax.DOM.createInputElement=function(type){
var div=document.createElement("div");
div.innerHTML="<input type='"+type+"' />";

return div.firstChild;
};

SimileAjax.DOM.createDOMFromTemplate=function(template){
var result={};
result.elmt=SimileAjax.DOM._createDOMFromTemplate(template,result,null);

return result;
};

SimileAjax.DOM._createDOMFromTemplate=function(templateNode,result,parentElmt){
if(templateNode==null){

return null;
}else if(typeof templateNode!="object"){
var node=document.createTextNode(templateNode);
if(parentElmt!=null){
parentElmt.appendChild(node);
}
return node;
}else{
var elmt=null;
if("tag"in templateNode){
var tag=templateNode.tag;
if(parentElmt!=null){
if(tag=="tr"){
elmt=parentElmt.insertRow(parentElmt.rows.length);
}else if(tag=="td"){
elmt=parentElmt.insertCell(parentElmt.cells.length);
}
}
if(elmt==null){
elmt=tag=="input"?
SimileAjax.DOM.createInputElement(templateNode.type):
document.createElement(tag);

if(parentElmt!=null){
parentElmt.appendChild(elmt);
}
}
}else{
elmt=templateNode.elmt;
if(parentElmt!=null){
parentElmt.appendChild(elmt);
}
}

for(var attribute in templateNode){
var value=templateNode[attribute];

if(attribute=="field"){
result[value]=elmt;

}else if(attribute=="className"){
elmt.className=value;
}else if(attribute=="id"){
elmt.id=value;
}else if(attribute=="title"){
elmt.title=value;
}else if(attribute=="type"&&elmt.tagName=="input"){

}else if(attribute=="style"){
for(n in value){
var v=value[n];
if(n=="float"){
n=SimileAjax.Platform.browser.isIE?"styleFloat":"cssFloat";
}
elmt.style[n]=v;
}
}else if(attribute=="children"){
for(var i=0;i<value.length;i++){
SimileAjax.DOM._createDOMFromTemplate(value[i],result,elmt);
}
}else if(attribute!="tag"&&attribute!="elmt"){
elmt.setAttribute(attribute,value);
}
}
return elmt;
}
}

SimileAjax.DOM._cachedParent=null;
SimileAjax.DOM.createElementFromString=function(s){
if(SimileAjax.DOM._cachedParent==null){
SimileAjax.DOM._cachedParent=document.createElement("div");
}
SimileAjax.DOM._cachedParent.innerHTML=s;
return SimileAjax.DOM._cachedParent.firstChild;
};

SimileAjax.DOM.createDOMFromString=function(root,s,fieldElmts){
var elmt=typeof root=="string"?document.createElement(root):root;
elmt.innerHTML=s;

var dom={elmt:elmt};
SimileAjax.DOM._processDOMChildrenConstructedFromString(dom,elmt,fieldElmts!=null?fieldElmts:{});

return dom;
};

SimileAjax.DOM._processDOMConstructedFromString=function(dom,elmt,fieldElmts){
var id=elmt.id;
if(id!=null&&id.length>0){
elmt.removeAttribute("id");
if(id in fieldElmts){
var parentElmt=elmt.parentNode;
parentElmt.insertBefore(fieldElmts[id],elmt);
parentElmt.removeChild(elmt);

dom[id]=fieldElmts[id];
return;
}else{
dom[id]=elmt;
}
}

if(elmt.hasChildNodes()){
SimileAjax.DOM._processDOMChildrenConstructedFromString(dom,elmt,fieldElmts);
}
};

SimileAjax.DOM._processDOMChildrenConstructedFromString=function(dom,elmt,fieldElmts){
var node=elmt.firstChild;
while(node!=null){
var node2=node.nextSibling;
if(node.nodeType==1){
SimileAjax.DOM._processDOMConstructedFromString(dom,node,fieldElmts);
}
node=node2;
}
};


/* graphics.js */



SimileAjax.Graphics=new Object();
SimileAjax.Graphics.pngIsTranslucent=(!SimileAjax.Platform.browser.isIE)||(SimileAjax.Platform.browser.majorVersion>6);


SimileAjax.Graphics._createTranslucentImage1=function(url,verticalAlign){
elmt=document.createElement("img");
elmt.setAttribute("src",url);
if(verticalAlign!=null){
elmt.style.verticalAlign=verticalAlign;
}
return elmt;
};
SimileAjax.Graphics._createTranslucentImage2=function(url,verticalAlign){
elmt=document.createElement("img");
elmt.style.width="1px";
elmt.style.height="1px";
elmt.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+url+"', sizingMethod='image')";
elmt.style.verticalAlign=(verticalAlign!=null)?verticalAlign:"middle";
return elmt;
};

SimileAjax.Graphics.createTranslucentImage=SimileAjax.Graphics.pngIsTranslucent?
SimileAjax.Graphics._createTranslucentImage1:
SimileAjax.Graphics._createTranslucentImage2;

SimileAjax.Graphics._createTranslucentImageHTML1=function(url,verticalAlign){
return"<img src=\""+url+"\""+
(verticalAlign!=null?" style=\"vertical-align: "+verticalAlign+";\"":"")+
" />";
};
SimileAjax.Graphics._createTranslucentImageHTML2=function(url,verticalAlign){
var style=
"width: 1px; height: 1px; "+
"filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+url+"', sizingMethod='image');"+
(verticalAlign!=null?" vertical-align: "+verticalAlign+";":"");

return"<img src='"+url+"' style=\""+style+"\" />";
};

SimileAjax.Graphics.createTranslucentImageHTML=SimileAjax.Graphics.pngIsTranslucent?
SimileAjax.Graphics._createTranslucentImageHTML1:
SimileAjax.Graphics._createTranslucentImageHTML2;

SimileAjax.Graphics.setOpacity=function(elmt,opacity){
if(SimileAjax.Platform.browser.isIE){
elmt.style.filter="progid:DXImageTransform.Microsoft.Alpha(Style=0,Opacity="+opacity+")";
}else{
var o=(opacity/100).toString();
elmt.style.opacity=o;
elmt.style.MozOpacity=o;
}
};


SimileAjax.Graphics._bubbleMargins={
top:33,
bottom:42,
left:33,
right:40
}


SimileAjax.Graphics._arrowOffsets={
top:0,
bottom:9,
left:1,
right:8
}

SimileAjax.Graphics._bubblePadding=15;
SimileAjax.Graphics._bubblePointOffset=6;
SimileAjax.Graphics._halfArrowWidth=18;

SimileAjax.Graphics.createBubbleForPoint=function(pageX,pageY,contentWidth,contentHeight){
function getWindowDims(){
if(typeof window.innerHeight=='number'){
return{w:window.innerWidth,h:window.innerHeight};
}else if(document.documentElement&&document.documentElement.clientHeight){
return{
w:document.documentElement.clientWidth,
h:document.documentElement.clientHeight
};
}else if(document.body&&document.body.clientHeight){
return{
w:document.body.clientWidth,
h:document.body.clientHeight
};
}
}

var close=function(){
if(!bubble._closed){
document.body.removeChild(bubble._div);
bubble._doc=null;
bubble._div=null;
bubble._content=null;
bubble._closed=true;
}
}
var layer=SimileAjax.WindowManager.pushLayer(close,true);
var bubble={
_closed:false,
close:function(){SimileAjax.WindowManager.popLayer(layer);}
};

var dims=getWindowDims();
var docWidth=dims.w;
var docHeight=dims.h;

var margins=SimileAjax.Graphics._bubbleMargins;
contentWidth=parseInt(contentWidth,10);
contentHeight=parseInt(contentHeight,10);
var bubbleWidth=margins.left+contentWidth+margins.right;
var bubbleHeight=margins.top+contentHeight+margins.bottom;

var pngIsTranslucent=SimileAjax.Graphics.pngIsTranslucent;
var urlPrefix=SimileAjax.urlPrefix;

var setImg=function(elmt,url,width,height){
elmt.style.position="absolute";
elmt.style.width=width+"px";
elmt.style.height=height+"px";
if(pngIsTranslucent){
elmt.style.background="url("+url+")";
}else{
elmt.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+url+"', sizingMethod='crop')";
}
}
var div=document.createElement("div");
div.style.width=bubbleWidth+"px";
div.style.height=bubbleHeight+"px";
div.style.position="absolute";
div.style.zIndex=1000;
bubble._div=div;

var divInner=document.createElement("div");
divInner.style.width="100%";
divInner.style.height="100%";
divInner.style.position="relative";
div.appendChild(divInner);

var createImg=function(url,left,top,width,height){
var divImg=document.createElement("div");
divImg.style.left=left+"px";
divImg.style.top=top+"px";
setImg(divImg,url,width,height);
divInner.appendChild(divImg);
}

createImg(urlPrefix+"images/bubble-top-left.png",0,0,margins.left,margins.top);
createImg(urlPrefix+"images/bubble-top.png",margins.left,0,contentWidth,margins.top);
createImg(urlPrefix+"images/bubble-top-right.png",margins.left+contentWidth,0,margins.right,margins.top);

createImg(urlPrefix+"images/bubble-left.png",0,margins.top,margins.left,contentHeight);
createImg(urlPrefix+"images/bubble-right.png",margins.left+contentWidth,margins.top,margins.right,contentHeight);

createImg(urlPrefix+"images/bubble-bottom-left.png",0,margins.top+contentHeight,margins.left,margins.bottom);
createImg(urlPrefix+"images/bubble-bottom.png",margins.left,margins.top+contentHeight,contentWidth,margins.bottom);
createImg(urlPrefix+"images/bubble-bottom-right.png",margins.left+contentWidth,margins.top+contentHeight,margins.right,margins.bottom);

var divClose=document.createElement("div");
divClose.style.left=(bubbleWidth-margins.right+SimileAjax.Graphics._bubblePadding-16-2)+"px";
divClose.style.top=(margins.top-SimileAjax.Graphics._bubblePadding+1)+"px";
divClose.style.cursor="pointer";
setImg(divClose,urlPrefix+"images/close-button.png",16,16);
SimileAjax.WindowManager.registerEventWithObject(divClose,"click",bubble,"close");
divInner.appendChild(divClose);

var divContent=document.createElement("div");
divContent.style.position="absolute";
divContent.style.left=margins.left+"px";
divContent.style.top=margins.top+"px";
divContent.style.width=contentWidth+"px";
divContent.style.height=contentHeight+"px";
divContent.style.overflow="auto";
divContent.style.background="white";
divInner.appendChild(divContent);
bubble.content=divContent;

(function(){
if(pageX-SimileAjax.Graphics._halfArrowWidth-SimileAjax.Graphics._bubblePadding>0&&
pageX+SimileAjax.Graphics._halfArrowWidth+SimileAjax.Graphics._bubblePadding<docWidth){

var left=pageX-Math.round(contentWidth/2)-margins.left;
left=pageX<(docWidth/2)?
Math.max(left,-(margins.left-SimileAjax.Graphics._bubblePadding)):
Math.min(left,docWidth+(margins.right-SimileAjax.Graphics._bubblePadding)-bubbleWidth);

if(pageY-SimileAjax.Graphics._bubblePointOffset-bubbleHeight>0){
var divImg=document.createElement("div");

divImg.style.left=(pageX-SimileAjax.Graphics._halfArrowWidth-left)+"px";
divImg.style.top=(margins.top+contentHeight)+"px";
setImg(divImg,urlPrefix+"images/bubble-bottom-arrow.png",37,margins.bottom);
divInner.appendChild(divImg);

div.style.left=left+"px";
div.style.top=(pageY-SimileAjax.Graphics._bubblePointOffset-bubbleHeight+
SimileAjax.Graphics._arrowOffsets.bottom)+"px";

return;
}else if(pageY+SimileAjax.Graphics._bubblePointOffset+bubbleHeight<docHeight){
var divImg=document.createElement("div");

divImg.style.left=(pageX-SimileAjax.Graphics._halfArrowWidth-left)+"px";
divImg.style.top="0px";
setImg(divImg,urlPrefix+"images/bubble-top-arrow.png",37,margins.top);
divInner.appendChild(divImg);

div.style.left=left+"px";
div.style.top=(pageY+SimileAjax.Graphics._bubblePointOffset-
SimileAjax.Graphics._arrowOffsets.top)+"px";

return;
}
}

var top=pageY-Math.round(contentHeight/2)-margins.top;
top=pageY<(docHeight/2)?
Math.max(top,-(margins.top-SimileAjax.Graphics._bubblePadding)):
Math.min(top,docHeight+(margins.bottom-SimileAjax.Graphics._bubblePadding)-bubbleHeight);

if(pageX-SimileAjax.Graphics._bubblePointOffset-bubbleWidth>0){
var divImg=document.createElement("div");

divImg.style.left=(margins.left+contentWidth)+"px";
divImg.style.top=(pageY-SimileAjax.Graphics._halfArrowWidth-top)+"px";
setImg(divImg,urlPrefix+"images/bubble-right-arrow.png",margins.right,37);
divInner.appendChild(divImg);

div.style.left=(pageX-SimileAjax.Graphics._bubblePointOffset-bubbleWidth+
SimileAjax.Graphics._arrowOffsets.right)+"px";
div.style.top=top+"px";
}else{
var divImg=document.createElement("div");

divImg.style.left="0px";
divImg.style.top=(pageY-SimileAjax.Graphics._halfArrowWidth-top)+"px";
setImg(divImg,urlPrefix+"images/bubble-left-arrow.png",margins.left,37);
divInner.appendChild(divImg);

div.style.left=(pageX+SimileAjax.Graphics._bubblePointOffset-
SimileAjax.Graphics._arrowOffsets.left)+"px";
div.style.top=top+"px";
}
})();

document.body.appendChild(div);

return bubble;
};

SimileAjax.Graphics.createMessageBubble=function(doc){
var containerDiv=doc.createElement("div");
if(SimileAjax.Graphics.pngIsTranslucent){
var topDiv=doc.createElement("div");
topDiv.style.height="33px";
topDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-top-left.png) top left no-repeat";
topDiv.style.paddingLeft="44px";
containerDiv.appendChild(topDiv);

var topRightDiv=doc.createElement("div");
topRightDiv.style.height="33px";
topRightDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-top-right.png) top right no-repeat";
topDiv.appendChild(topRightDiv);

var middleDiv=doc.createElement("div");
middleDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-left.png) top left repeat-y";
middleDiv.style.paddingLeft="44px";
containerDiv.appendChild(middleDiv);

var middleRightDiv=doc.createElement("div");
middleRightDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-right.png) top right repeat-y";
middleRightDiv.style.paddingRight="44px";
middleDiv.appendChild(middleRightDiv);

var contentDiv=doc.createElement("div");
middleRightDiv.appendChild(contentDiv);

var bottomDiv=doc.createElement("div");
bottomDiv.style.height="55px";
bottomDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-bottom-left.png) bottom left no-repeat";
bottomDiv.style.paddingLeft="44px";
containerDiv.appendChild(bottomDiv);

var bottomRightDiv=doc.createElement("div");
bottomRightDiv.style.height="55px";
bottomRightDiv.style.background="url("+SimileAjax.urlPrefix+"images/message-bottom-right.png) bottom right no-repeat";
bottomDiv.appendChild(bottomRightDiv);
}else{
containerDiv.style.border="2px solid #7777AA";
containerDiv.style.padding="20px";
containerDiv.style.background="white";
SimileAjax.Graphics.setOpacity(containerDiv,90);

var contentDiv=doc.createElement("div");
containerDiv.appendChild(contentDiv);
}

return{
containerDiv:containerDiv,
contentDiv:contentDiv
};
};



SimileAjax.Graphics.createAnimation=function(f,from,to,duration){
return new SimileAjax.Graphics._Animation(f,from,to,duration);
};

SimileAjax.Graphics._Animation=function(f,from,to,duration){
this.f=f;

this.from=from;
this.to=to;
this.current=from;

this.duration=duration;
this.start=new Date().getTime();
this.timePassed=0;
};

SimileAjax.Graphics._Animation.prototype.run=function(){
var a=this;
window.setTimeout(function(){a.step();},50);
};

SimileAjax.Graphics._Animation.prototype.step=function(){
this.timePassed+=50;

var timePassedFraction=this.timePassed/this.duration;
var parameterFraction=-Math.cos(timePassedFraction*Math.PI)/2+0.5;
var current=parameterFraction*(this.to-this.from)+this.from;

try{
this.f(current,current-this.current);
}catch(e){
}
this.current=current;

if(this.timePassed<this.duration){
this.run();
}else{
this.f(this.to,0);
}
};



SimileAjax.Graphics.createStructuredDataCopyButton=function(image,width,height,createDataFunction){
var div=document.createElement("div");
div.style.position="relative";
div.style.display="inline";
div.style.width=width+"px";
div.style.height=height+"px";
div.style.overflow="hidden";
div.style.margin="2px";

if(SimileAjax.Graphics.pngIsTranslucent){
div.style.background="url("+image+") no-repeat";
}else{
div.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+image+"', sizingMethod='image')";
}

var style;
if(SimileAjax.Platform.browser.isIE){
style="filter:alpha(opacity=0)";
}else{
style="opacity: 0";
}
div.innerHTML="<textarea rows='1' autocomplete='off' value='none' style='"+style+"' />";

var textarea=div.firstChild;
textarea.style.width=width+"px";
textarea.style.height=height+"px";
textarea.onmousedown=function(evt){
evt=(evt)?evt:((event)?event:null);
if(evt.button==2){
textarea.value=createDataFunction();
textarea.select();
}
};

return div;
};


/* history.js */



SimileAjax.History={
maxHistoryLength:10,
historyFile:"__history__.html",
enabled:true,

_initialized:false,
_listeners:new SimileAjax.ListenerQueue(),

_actions:[],
_baseIndex:0,
_currentIndex:0,

_plainDocumentTitle:document.title
};

SimileAjax.History.formatHistoryEntryTitle=function(actionLabel){
return SimileAjax.History._plainDocumentTitle+" {"+actionLabel+"}";
};

SimileAjax.History.initialize=function(){
if(SimileAjax.History._initialized){
return;
}

if(SimileAjax.History.enabled){
var iframe=document.createElement("iframe");
iframe.id="simile-ajax-history";
iframe.style.position="absolute";
iframe.style.width="10px";
iframe.style.height="10px";
iframe.style.top="0px";
iframe.style.left="0px";
iframe.style.visibility="hidden";
iframe.src=SimileAjax.History.historyFile+"?0";

document.body.appendChild(iframe);
SimileAjax.DOM.registerEvent(iframe,"load",SimileAjax.History._handleIFrameOnLoad);

SimileAjax.History._iframe=iframe;
}
SimileAjax.History._initialized=true;
};

SimileAjax.History.addListener=function(listener){
SimileAjax.History.initialize();

SimileAjax.History._listeners.add(listener);
};

SimileAjax.History.removeListener=function(listener){
SimileAjax.History.initialize();

SimileAjax.History._listeners.remove(listener);
};

SimileAjax.History.addAction=function(action){
SimileAjax.History.initialize();

SimileAjax.History._listeners.fire("onBeforePerform",[action]);
window.setTimeout(function(){
try{
action.perform();
SimileAjax.History._listeners.fire("onAfterPerform",[action]);

if(SimileAjax.History.enabled){
SimileAjax.History._actions=SimileAjax.History._actions.slice(
0,SimileAjax.History._currentIndex-SimileAjax.History._baseIndex);

SimileAjax.History._actions.push(action);
SimileAjax.History._currentIndex++;

var diff=SimileAjax.History._actions.length-SimileAjax.History.maxHistoryLength;
if(diff>0){
SimileAjax.History._actions=SimileAjax.History._actions.slice(diff);
SimileAjax.History._baseIndex+=diff;
}

try{
SimileAjax.History._iframe.contentWindow.location.search=
"?"+SimileAjax.History._currentIndex;
}catch(e){

var title=SimileAjax.History.formatHistoryEntryTitle(action.label);
document.title=title;
}
}
}catch(e){
SimileAjax.Debug.exception(e,"Error adding action {"+action.label+"} to history");
}
},0);
};

SimileAjax.History.addLengthyAction=function(perform,undo,label){
SimileAjax.History.addAction({
perform:perform,
undo:undo,
label:label,
uiLayer:SimileAjax.WindowManager.getBaseLayer(),
lengthy:true
});
};

SimileAjax.History._handleIFrameOnLoad=function(){


try{
var q=SimileAjax.History._iframe.contentWindow.location.search;
var c=(q.length==0)?0:Math.max(0,parseInt(q.substr(1)));

var finishUp=function(){
var diff=c-SimileAjax.History._currentIndex;
SimileAjax.History._currentIndex+=diff;
SimileAjax.History._baseIndex+=diff;

SimileAjax.History._iframe.contentWindow.location.search="?"+c;
};

if(c<SimileAjax.History._currentIndex){
SimileAjax.History._listeners.fire("onBeforeUndoSeveral",[]);
window.setTimeout(function(){
while(SimileAjax.History._currentIndex>c&&
SimileAjax.History._currentIndex>SimileAjax.History._baseIndex){

SimileAjax.History._currentIndex--;

var action=SimileAjax.History._actions[SimileAjax.History._currentIndex-SimileAjax.History._baseIndex];

try{
action.undo();
}catch(e){
SimileAjax.Debug.exception(e,"History: Failed to undo action {"+action.label+"}");
}
}

SimileAjax.History._listeners.fire("onAfterUndoSeveral",[]);
finishUp();
},0);
}else if(c>SimileAjax.History._currentIndex){
SimileAjax.History._listeners.fire("onBeforeRedoSeveral",[]);
window.setTimeout(function(){
while(SimileAjax.History._currentIndex<c&&
SimileAjax.History._currentIndex-SimileAjax.History._baseIndex<SimileAjax.History._actions.length){

var action=SimileAjax.History._actions[SimileAjax.History._currentIndex-SimileAjax.History._baseIndex];

try{
action.perform();
}catch(e){
SimileAjax.Debug.exception(e,"History: Failed to redo action {"+action.label+"}");
}

SimileAjax.History._currentIndex++;
}

SimileAjax.History._listeners.fire("onAfterRedoSeveral",[]);
finishUp();
},0);
}else{
var index=SimileAjax.History._currentIndex-SimileAjax.History._baseIndex-1;
var title=(index>=0&&index<SimileAjax.History._actions.length)?
SimileAjax.History.formatHistoryEntryTitle(SimileAjax.History._actions[index].label):
SimileAjax.History._plainDocumentTitle;

SimileAjax.History._iframe.contentWindow.document.title=title;
document.title=title;
}
}catch(e){

}
};

SimileAjax.History.getNextUndoAction=function(){
try{
var index=SimileAjax.History._currentIndex-SimileAjax.History._baseIndex-1;
return SimileAjax.History._actions[index];
}catch(e){
return null;
}
};

SimileAjax.History.getNextRedoAction=function(){
try{
var index=SimileAjax.History._currentIndex-SimileAjax.History._baseIndex;
return SimileAjax.History._actions[index];
}catch(e){
return null;
}
};


/* jquery-1.1.3a.js */

eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('7(1b 18.6=="C"){18.C=18.C;o 6=k(b,d){7(18==9)l U 6(b,d);b=b||J;7(6.12(b))l U 6(J)[6.K.1F?"1F":"1M"](b);7(1b b=="1u"){o m=/^[^<]*(<(.|\\s)+>)[^>]*$/.2e(b);7(m)b=6.3e([m[1]]);q l U 6(d).1P(b)}l 9.4L(b.16==2b&&b||(b.3k||b.u&&b!=18&&!b.1y&&b[0]!=C&&b[0].1y)&&6.2M(b)||[b])};7(1b $!="C")6.3w$=$;o $=6;6.K=6.86={3k:"1.1.2",7R:k(){l 9.u},u:0,1K:k(a){l a==C?6.2M(9):9[a]},1Q:k(c){o b=6(c);b.59=9;l b},4L:k(b){9.u=0;[].W.G(9,b);l 9},v:k(a,b){l 6.v(9,a,b)},4Y:k(b){o c=-1;9.v(k(a){7(9==b)c=a});l c},11:k(f,d,e){o c=f;7(f.16==2W)7(d==C)l 9.u&&6[e||"11"](9[0],f)||C;q{c={};c[f]=d}l 9.v(k(a){B(o b 17 c)6.11(e?9.P:9,b,6.1J(9,c[b],e,a,b))})},1a:k(b,a){l 9.11(b,a,"2p")},1Y:k(a){7(1b a=="1u")l 9.3c().3i(J.65(a));o t="";6.v(a||9,k(){6.v(9.2o,k(){7(9.1y!=8)t+=9.1y!=1?9.8c:6.K.1Y([9])})});l t},8a:k(){o a,5G=R;l 9.v(k(){7(!a)a=6.3e(5G,9.2L);o b=a[0].3v(D);9.L.2H(b,9);1p(b.S)b=b.S;b.4b(9)})},3i:k(){l 9.2E(R,D,1,k(b){9.4b(b)})},5m:k(){l 9.2E(R,D,-1,k(b){9.2H(b,9.S)})},5l:k(){l 9.2E(R,I,1,k(b){9.L.2H(b,9)})},5j:k(){l 9.2E(R,I,-1,k(b){9.L.2H(b,9.1R)})},1V:k(){l 9.59||6([])},1P:k(a){l 9.1Q(6.5e(6.2B(9,k(b){l 6.1P(a,b)})),a)},7x:k(a){l 9.1Q(6.2B(9,k(b){o b=b.3v(a!=C?a:D);b.$1x=M;l b}))},Y:k(c){l 9.1Q(6.12(c)&&6.1Z(9,k(b,a){l c.G(b,[a])})||6.2y(c,9))},1L:k(a){l 9.1Q(a.16==2W&&6.2y(a,9,D)||6.1Z(9,k(b){l(a.16==2b||a.3k)?6.3b(b,a)<0:b!=a}))},1G:k(a){l 9.1Q(6.1O(9.1K(),a.16==2W?6(a).1K():a.u!=C&&(!a.V||a.V=="72")?a:[a]))},22:k(a){l a?6.2y(a,9).u>0:I},34:k(a){l a==C?(9.u?9[0].2t:M):9.11("2t",a)},3N:k(a){l a==C?(9.u?9[0].25:M):9.3c().3i(a)},2E:k(f,d,g,e){o c=9.u>1,a;l 9.v(k(){7(!a){a=6.3e(f,9.2L);7(g<0)a.6K()}o b=9;7(d&&6.V(9,"1z")&&6.V(a[0],"31"))b=9.4D("1o")[0]||9.4b(J.4T("1o"));6.v(a,k(){e.G(b,[c?9.3v(D):9])})})}};6.1d=6.K.1d=k(){o b,1J,1c=R[0],a=1;7(R.u==1){1c=9;a=0}q 7(6.12(R[a])){b=R[a++]}1p(1J=R[a++])B(o i 17 1J){7(b&&1c[i]&&1J[i]){1c[i]=b(1c[i],1J[i])}q{1c[i]=1J[i]}}l 1c};6.1d({6n:k(){7(6.3w$)$=6.3w$;l 6},12:k(a){l!!a&&1b a!="1u"&&!a.V&&a.16!=2b&&/k/i.1e(a+"")},3G:k(a){l a.4Z&&a.2L&&!a.2L.4u},V:k(b,a){l b.V&&b.V.2S()==a.2S()},v:k(a,b,c){7(a.u==C)B(o i 17 a)b.G(a[i],c||[i,a[i]]);q B(o i=0,4r=a.u;i<4r;i++)7(b.G(a[i],c||[i,a[i]])===I)1W;l a},1J:k(c,b,d,e,a){7(6.12(b))b=b.3F(c,[e]);o f=/z-?4Y|61-?5X|19|4m|5Q-?1m/i;l b&&b.16==3B&&d=="2p"&&!f.1e(a)?b+"4k":b},Q:{1G:k(e,d){6.v(d.2O(/\\s+/),k(a,b){7(!6.Q.2N(e.Q,b))e.Q+=(e.Q?" ":"")+b})},1E:k(c,b){c.Q=b?6.1Z(c.Q.2O(/\\s+/),k(a){l!6.Q.2N(b,a)}).5D(" "):""},2N:k(a,b){l 6.3b(b,(a.Q||a).3y().2O(/\\s+/))>-1}},4j:k(b,a,c){B(o i 17 a){b.P["2K"+i]=b.P[i];b.P[i]=a[i]}c.G(b,[]);B(o i 17 a)b.P[i]=b.P["2K"+i]},1a:k(b,c){7(c=="1m"||c=="2J"){o e={},36,3t,d=["83","82","81","80"];6.v(d,k(){e["7Z"+9]=0;e["7V"+9+"7U"]=0});6.4j(b,e,k(){7(6(b).22(\':2G\')){36=b.7P;3t=b.7O}q{b=6(b.3v(D)).1P(":49").5n("2C").1V().1a({47:"1i",3n:"7J",14:"2g",7I:"0",7H:"0"}).5h(b.L)[0];o a=6.1a(b.L,"3n")||"3j";7(a=="3j")b.L.P.3n="7E";36=b.7C;3t=b.7B;7(a=="3j")b.L.P.3n="3j";b.L.3p(b)}});l c=="1m"?36:3t}l 6.2p(b,c)},2p:k(h,d,g){o i;7(d=="19"&&6.E.15){i=6.11(h.P,"19");l i==""?"1":i}7(d=="4e"||d=="23")d=6.E.15?"3g":"23";7(!g&&h.P[d])i=h.P[d];q 7(J.3f&&J.3f.3X){7(d=="23"||d=="3g")d="4e";d=d.1j(/([A-Z])/g,"-$1").2z();o e=J.3f.3X(h,M);7(e)i=e.51(d);q 7(d=="14")i="1A";q 6.4j(h,{14:"2g"},k(){o c=J.3f.3X(9,"");i=c&&c.51(d)||""})}q 7(h.3C){o f=d.1j(/\\-(\\w)/g,k(b,a){l a.2S()});i=h.3C[d]||h.3C[f]}l i},3e:k(e,d){o r=[];d=d||J;6.v(e,k(e,c){7(!c)l;7(c.16==3B)c=c.3y();7(1b c=="1u"){o s=6.2x(c).2z(),1r=d.4T("1r"),1H=[];o b=!s.H("<78")&&[1,"<20>","</20>"]||!s.H("<76")&&[1,"<4W>","</4W>"]||(!s.H("<71")||!s.H("<1o")||!s.H("<6X"))&&[1,"<1z>","</1z>"]||!s.H("<31")&&[2,"<1z><1o>","</1o></1z>"]||(!s.H("<6W")||!s.H("<6V"))&&[3,"<1z><1o><31>","</31></1o></1z>"]||[0,"",""];1r.25=b[1]+c+b[2];1p(b[0]--)1r=1r.S;7(6.E.15){7(!s.H("<1z")&&s.H("<1o")<0)1H=1r.S&&1r.S.2o;q 7(b[1]=="<1z>"&&s.H("<1o")<0)1H=1r.2o;B(o n=1H.u-1;n>=0;--n)7(6.V(1H[n],"1o")&&!1H[n].2o.u)1H[n].L.3p(1H[n])}c=6.2M(1r.2o)}7(c.u===0&&!6(c).22("2V, 20"))l;7(c[0]==C||6(c).22("2V, 20"))r.W(c);q r=6.1O(r,c)});l r},11:k(d,e,b){o f=6.3G(d)?{}:{"B":"6S","6Q":"Q","4e":6.E.15?"3g":"23",23:6.E.15?"3g":"23",25:"25",Q:"Q",2t:"2t",2s:"2s",2C:"2C",6P:"6O",2u:"2u"};7(e=="19"&&6.E.15){7(b!=C){d.4m=1;d.Y=(d.Y||"").1j(/4I\\([^)]*\\)/,"")+(2Y(b).3y()=="6H"?"":"4I(19="+b*4F+")")}l d.Y?(2Y(d.Y.4E(/19=([^)]*)/)[1])/4F).3y():""}7(f[e]){7(b!=C)d[f[e]]=b;l d[f[e]]}q 7(b==C&&6.E.15&&6.V(d,"2V")&&(e=="6D"||e=="6C"))l d.6B(e).6z;q 7(d.4Z){7(b!=C)d.6x(e,b);7(6.E.15&&/4B|2q/.1e(e)&&!6.3G(d))l d.35(e,2);l d.35(e)}q{e=e.1j(/-([a-z])/6r,k(a,c){l c.2S()});7(b!=C)d[e]=b;l d[e]}},2x:k(a){l a.1j(/^\\s+|\\s+$/g,"")},2M:k(b){o r=[];7(1b b!="6q")B(o i=0,2a=b.u;i<2a;i++)r.W(b[i]);q r=b.3U(0);l r},3b:k(d,c){B(o i=0,2a=c.u;i<2a;i++)7(c[i]==d)l i;l-1},1O:k(a,b){B(o i=0;b[i];i++)a.W(b[i]);l a},5e:k(a){o r=[],3T=6.2R++;B(o i=0,4x=a.u;i<4x;i++)7(a[i].2R!=3T){a[i].2R=3T;r.W(a[i])}l r},2R:0,1Z:k(c,b,d){7(1b b=="1u")b=U 39("a","i","l "+b);o a=[];B(o i=0,2U=c.u;i<2U;i++)7(!d&&b(c[i],i)||d&&!b(c[i],i))a.W(c[i]);l a},2B:k(c,b){7(1b b=="1u")b=U 39("a","l "+b);o d=[],r=[];B(o i=0,2U=c.u;i<2U;i++){o a=b(c[i],i);7(a!==M&&a!=C){7(a.16!=2b)a=[a];d=d.6k(a)}}l d}});U k(){o b=6i.6h.2z();6.E={6f:b.4E(/.+[6e][\\/ ]([\\d.]+)/)[1],26:/4s/.1e(b),21:/21/.1e(b),15:/15/.1e(b)&&!/21/.1e(b),3x:/3x/.1e(b)&&!/(6a|4s)/.1e(b)};6.68=!6.E.15||J.66=="64"};6.v({4o:"a.L",3E:"6.3E(a)",62:"6.1C(a,2,\'1R\')",5Y:"6.1C(a,2,\'5o\')",5V:"6.2k(a.L.S,a)",5T:"6.2k(a.S)"},k(a,d){6.K[a]=k(c){o b=6.2B(9,d);7(c&&1b c=="1u")b=6.2y(c,b);l 9.1Q(b)}});6.v({5h:"3i",5S:"5m",2H:"5l",5R:"5j"},k(b,c){6.K[b]=k(){o a=R;l 9.v(k(){B(o j=0,2a=a.u;j<2a;j++)6(a[j])[c](9)})}});6.v({5n:k(a){6.11(9,a,"");9.5O(a)},5N:k(a){6.Q.1G(9,a)},5M:k(a){6.Q.1E(9,a)},8b:k(a){6.Q[6.Q.2N(9,a)?"1E":"1G"](9,a)},1E:k(b){7(!b||6.Y(b,[9]).r.u)9.L.3p(9)},3c:k(){1p(9.S)9.3p(9.S)}},k(a,b){6.K[a]=k(){l 9.v(b,R)}});6.v(["5L","5K","5J","5I"],k(c,d){6.K[d]=k(a,b){l 9.Y(":"+d+"("+a+")",b)}});6.v(["1m","2J"],k(b,c){6.K[c]=k(a){l a==C?(9.u?6.1a(9[0],c):M):9.1a(c,a.16==2W?a:a+"4k")}});6.1d({2l:{"":"m[2]==\'*\'||6.V(a,m[2])","#":"a.35(\'2P\')==m[2]",":":{5K:"i<m[3]-0",5J:"i>m[3]-0",1C:"m[3]-0==i",5L:"m[3]-0==i",5H:"i==0",1I:"i==r.u-1",5F:"i%2==0",5E:"i%2","1C-3z":"6.1C(a.L.S,m[3],\'1R\',a)==a","5H-3z":"6.1C(a.L.S,1,\'1R\')==a","1I-3z":"6.1C(a.L.89,1,\'5o\')==a","88-3z":"6.2k(a.L.S).u==1",4o:"a.S",3c:"!a.S",5I:"6.K.1Y.G([a]).H(m[3])>=0",2G:\'a.F!="1i"&&6.1a(a,"14")!="1A"&&6.1a(a,"47")!="1i"\',1i:\'a.F=="1i"||6.1a(a,"14")=="1A"||6.1a(a,"47")=="1i"\',87:"!a.2s",2s:"a.2s",2C:"a.2C",2u:"a.2u||6.11(a,\'2u\')",1Y:"a.F==\'1Y\'",49:"a.F==\'49\'",5B:"a.F==\'5B\'",4i:"a.F==\'4i\'",5A:"a.F==\'5A\'",4h:"a.F==\'4h\'",5z:"a.F==\'5z\'",5y:"a.F==\'5y\'",3u:\'a.F=="3u"||6.V(a,"3u")\',5x:"/5x|20|85|3u/i.1e(a.V)"},".":"6.Q.2N(a,m[2])","@":{"=":"z==m[4]","!=":"z!=m[4]","^=":"z&&!z.H(m[4])","$=":"z&&z.2I(z.u - m[4].u,m[4].u)==m[4]","*=":"z&&z.H(m[4])>=0","":"z","=~":"2r(m[4]).1e(z)","!~":"!2r(m[4]).1e(z)",4f:k(a){l["",a[1],a[3],a[2],a[5]]},5t:"z=a[m[3]];7(!z||/4B|2q/.1e(m[3]))z=6.11(a,m[3]);"},"[":"6.1P(m[2],a).u"},5s:[/^\\[ *(@)([\\w-]+) *([!*$^=!~]*) *(\'?"?)(.*?)\\4 *\\]/,/^(\\[)\\s*(.*?(\\[.*?\\])?[^[]*?)\\s*\\]/,/^(:)([\\w-]+)\\("?\'?(.*?(\\(.*?\\))?[^(]*?)"?\'?\\)/,U 3r("^([:.#]*)("+(6.2v="(?:[\\\\w\\7Y-\\7W*3w-]|\\\\\\\\.)")+"+)")],3q:[/^(\\/?\\.\\.)/,"a.L",/^(>|\\/)/,"6.2k(a.S)",/^(\\+)/,"6.1C(a,2,\'1R\')",/^(~)/,k(b){o s=6.2k(b.L.S);l s.3U(6.3b(b,s)+1)}],2y:k(a,c,b){o d,1n=[];1p(a&&a!=d){d=a;o f=6.Y(a,c,b);a=f.t.1j(/^\\s*,\\s*/,"");1n=b?c=f.r:6.1O(1n,f.r)}l 1n},1P:k(e,b){7(1b e!="1u")l[e];7(b&&!b.1y)b=M;b=b||J;7(!e.H("//")){b=b.4d;e=e.2I(2,e.u)}q 7(!e.H("/")&&!b.2L){b=b.4d;e=e.2I(1,e.u);7(e.H("/")>=1)e=e.2I(e.H("/"),e.u)}o d=[b],2i=[],1I;1p(e&&1I!=e){o r=[];1I=e;e=6.2x(e).1j(/^\\/\\//,"");o j=I;o a=U 3r("^[/>]\\\\s*("+6.2v+"+)");o m=a.2e(e);7(m){B(o i=0;d[i];i++)B(o c=d[i].S;c;c=c.1R)7(c.1y==1&&(m[1]=="*"||6.V(c,m[1])))r.W(c);d=r;e=e.1j(a,"");7(e.H(" ")==0)7Q;j=D}q{B(o i=0,5p=6.3q.u;i<5p;i+=2){o a=6.3q[i],K=6.3q[i+1];o m=a.2e(e);7(m){r=d=6.2B(d,6.12(K)?K:U 39("a","l "+K));e=6.2x(e.1j(a,""));j=D;1W}}}7(e&&!j){7(!e.H(",")){7(d[0]==b)d.4c();2i=6.1O(2i,d);r=d=[b];e=" "+e.2I(1,e.u)}q{o h=U 3r("^("+6.2v+"+)(#)("+6.2v+"+)");o m=h.2e(e);7(m){m=[0,m[2],m[3],m[1]]}q{h=U 3r("^([#.]?)("+6.2v+"*)");m=h.2e(e)}m[2]=m[2].1j(/\\\\/g,"");o 2F=N[N.u-1];7(m[1]=="#"&&2F&&2F.4a){o 1S=2F.4a(m[2]);7((6.E.15||6.E.21)&&1S&&1S.2P!=m[2])1S=6(\'[@2P="\'+m[2]+\'"]\',2F)[0];N=r=1S&&(!m[3]||6.V(1S,m[3]))?[1S]:[]}q{B(o i=0;N[i];i++){o 3l=m[1]!=""||m[0]==""?"*":m[2];7(3l=="*"&&N[i].V.2z()=="7N")3l="2D";r=6.1O(r,N[i].4D(3l))}7(m[1]==".")r=6.48(r,m[2]);7(m[1]=="#"){o 2d=[];B(o i=0;r[i];i++)7(r[i].35("2P")==m[2]){2d=[r[i]];1W}r=2d}N=r}t=t.1j(7M,"")}}7(t){o 34=6.Y(t,r);N=r=34.r;t=6.2x(34.t)}}7(t)N=[];7(N&&N[0]==7L)N.4c();2i=6.1O(2i,N);l 2i},48:k(r,m,1L){m=" "+m+" ";o 2d=[];B(o i=0;r[i];i++){o 46=(" "+r[i].Q+" ").H(m)>=0;7(!1L&&46||1L&&!46)2d.W(r[i])}l 2d},Y:k(t,r,1L){o 1I;1p(t&&t!=1I){1I=t;o p=6.5s,m;B(o i=0;p[i];i++){m=p[i].2e(t);7(m){t=t.7K(m[0].u);7(6.2l[m[1]].4f)m=6.2l[m[1]].4f(m);m[2]=m[2].1j(/\\\\/g,"");1W}}7(!m)1W;7(m[1]==":"&&m[2]=="1L")r=6.Y(m[3],r,D).r;q 7(m[1]==".")r=6.48(r,m[2],1L);q{o f=6.2l[m[1]];7(1b f!="1u")f=6.2l[m[1]][m[2]];2r("f = k(a,i){"+(6.2l[m[1]].5t||"")+"l "+f+"}");r=6.1Z(r,f,1L)}}l{r:r,t:e}},3E:k(c){o b=[];o a=c.L;1p(a&&a!=J){b.W(a);a=a.L}l b},1C:k(a,e,c,b){e=e||1;o d=0;B(;a;a=a[c]){7(a.1y==1)d++;7(d==e||e=="5F"&&d%2==0&&d>1&&a==b||e=="5E"&&d%2==1&&a==b)l a}},2k:k(a,b){o r=[];B(;a;a=a.1R){7(a.1y==1&&(!b||a!=b))r.W(a)}l r}});6.O={1G:k(c,d,b,a){7(6.E.15&&c.3m!=C)c=18;7(a!=C){o e=b;b=k(){l e.G(9,R)};b.T=a;b.1t=e.1t}7(!b.1t){b.1t=9.1t++;7(e)e.1t=b.1t}7(!c.$1x)c.$1x={};7(!c.$1s)c.$1s=k(){6.O.1s.G(c,R)};o f=c.$1x[d];7(!f){f=c.$1x[d]={};7(c.45)c.45(d,c.$1s,I);q 7(c.5k)c.5k("5i"+d,c.$1s)}f[b.1t]=b;7(!9.1g[d])9.1g[d]=[];9.1g[d].W(c)},1t:1,1g:{},1E:k(b,c,a){o d=b.$1x,N;7(d){7(c&&c.F){a=c.44;c=c.F}7(!c){B(c 17 d)9.1E(b,c)}q 7(d[c]){7(a)43 d[c][a.1t];q B(a 17 b.$1x[c])43 d[c][a];B(N 17 d[c])1W;7(!N){7(b.42)b.42(c,b.$1s,I);q 7(b.5g)b.5g("5i"+c,b.$1s);N=M;43 d[c]}}B(N 17 d)1W;7(!N)b.$1s=b.$1x=M}},1l:k(c,b,d){b=6.2M(b||[]);7(!d)6.v(9.1g[c]||[],k(){6.O.1l(c,b,9)});q{o a,N,K=6.12(d[c]);b.5f(9.41({F:c,1c:d}));7((a=9.1s.G(d,b))!==I)9.40=D;7(K&&a!==I&&!6.V(d,\'a\'))d[c]();9.40=I}},1s:k(a){7(1b 6=="C"||6.O.40)l;a=6.O.41(a||18.O||{});o b;o c=9.$1x[a.F];o d=[].3U.3F(R,1);d.5f(a);B(o j 17 c){d[0].44=c[j];d[0].T=c[j].T;7(c[j].G(9,d)===I){a.1U();a.2f();b=I}}7(6.E.15)a.1c=a.1U=a.2f=a.44=a.T=M;l b},41:k(c){7(!c.1c&&c.5d)c.1c=c.5d;7(c.5c==C&&c.5b!=C){o e=J.4d,b=J.4u;c.5c=c.5b+(e.5u||b.5u);c.7A=c.7z+(e.58||b.58)}7(6.E.26&&c.1c.1y==3){o a=c;c=6.1d({},a);c.1c=a.1c.L;c.1U=k(){l a.1U()};c.2f=k(){l a.2f()}}7(!c.1U)c.1U=k(){9.7y=I};7(!c.2f)c.2f=k(){9.7w=D};l c}};6.K.1d({30:k(c,a,b){l 9.v(k(){6.O.1G(9,c,b||a,b&&a)})},57:k(d,b,c){l 9.v(k(){6.O.1G(9,d,k(a){6(9).56(a);l(c||b).G(9,R)},c&&b)})},56:k(a,b){l 9.v(k(){6.O.1E(9,a,b)})},1l:k(a,b){l 9.v(k(){6.O.1l(a,b,9)})},3h:k(){o a=R;l 9.55(k(b){9.3Z=9.3Z==0?1:0;b.1U();l a[9.3Z].G(9,[b])||I})},7v:k(b,c){k 3Y(a){o p=(a.F=="3A"?a.7u:a.7t)||a.7s;1p(p&&p!=9)2c{p=p.L}28(a){p=9};7(p==9)l I;l(a.F=="3A"?b:c).G(9,[a])}l 9.3A(3Y).54(3Y)},1F:k(a){7(6.3d)a.G(J,[6]);q{6.2A.W(k(){l a.G(9,[6])})}l 9}});6.1d({3d:I,2A:[],1F:k(){7(!6.3d){6.3d=D;7(6.2A){6.v(6.2A,k(){9.G(J)});6.2A=M}7(6.E.3x||6.E.21)J.42("53",6.1F,I);6(18).1M(k(){6("#3W").1E()})}}});U k(){6.v(("7q,7p,1M,7n,7m,3V,55,7l,"+"7k,7j,7i,3A,54,7h,20,"+"4h,7g,7f,7e,29").2O(","),k(b,c){6.K[c]=k(a){l a?9.30(c,a):9.1l(c)}});7(6.E.3x||6.E.21)J.45("53",6.1F,I);q 7(6.E.15){J.7d("<7c"+"7b 2P=3W 7a=D "+"2q=//:><\\/38>");o d=J.4a("3W");7(d)d.77=k(){7(9.37!="1q")l;6.1F()};d=M}q 7(6.E.26)6.3S=3m(k(){7(J.37=="73"||J.37=="1q"){3R(6.3S);6.3S=M;6.1F()}},10);6.O.1G(18,"1M",6.1F)};7(6.E.15)6(18).57("3V",k(){o a=6.O.1g;B(o b 17 a){o c=a[b],i=c.u;7(i&&b!=\'3V\')70 6.O.1E(c[i-1],b);1p(--i)}});6.K.1d({6Z:k(c,b,a){9.1M(c,b,a,1)},1M:k(g,d,c,e){7(6.12(g))l 9.30("1M",g);c=c||k(){};o f="3P";7(d)7(6.12(d)){c=d;d=M}q{d=6.2D(d);f="4V"}o h=9;6.2T({1D:g,F:f,T:d,2w:e,1q:k(a,b){7(b=="24"||!e&&b=="4U")h.11("25",a.33).3O().v(c,[a.33,b,a]);q c.G(h,[a.33,b,a])}});l 9},6T:k(){l 6.2D(9)},3O:k(){l 9.1P("38").v(k(){7(9.2q)6.4S(9.2q);q 6.3J(9.1Y||9.6R||9.25||"")}).1V()}});6.v("4R,4Q,4P,4N,4C,4M".2O(","),k(b,c){6.K[c]=k(a){l 9.30(c,a)}});6.1d({1K:k(e,c,a,d,b){7(6.12(c)){a=c;c=M}l 6.2T({F:"3P",1D:e,T:c,24:a,3M:d,2w:b})},6N:k(d,b,a,c){l 6.1K(d,b,a,c,1)},4S:k(b,a){l 6.1K(b,M,a,"38")},6M:k(c,b,a){l 6.1K(c,b,a,"4J")},6L:k(d,b,a,c){7(6.12(b)){a=b;b={}}l 6.2T({F:"4V",1D:d,T:b,24:a,3M:c})},6J:k(a){6.2Z.1N=a},6I:k(a){6.1d(6.2Z,a)},2Z:{1g:D,F:"3P",1N:0,4G:"6G/x-6F-2V-6E",4H:D,2X:D,T:M},32:{},2T:k(h){h=6.1d({},6.2Z,h);7(h.T){7(h.4H&&1b h.T!="1u")h.T=6.2D(h.T);7(h.F.2z()=="1K"){h.1D+=((h.1D.H("?")>-1)?"&":"?")+h.T;h.T=M}}7(h.1g&&!6.3L++)6.O.1l("4R");o f=I;o i=18.4K?U 4K("6A.6U"):U 4O();i.6y(h.F,h.1D,h.2X);7(h.T)i.3Q("6Y-6w",h.4G);7(h.2w)i.3Q("6v-3K-6u",6.32[h.1D]||"6t, 6s 74 75 3I:3I:3I 6p");i.3Q("X-79-6o","4O");7(h.4A)h.4A(i);7(h.1g)6.O.1l("4M",[i,h]);o g=k(d){7(i&&(i.37==4||d=="1N")){f=D;7(j){3R(j);j=M}o c;2c{c=6.4z(i)&&d!="1N"?h.2w&&6.4X(i,h.1D)?"4U":"24":"29";7(c!="29"){o b;2c{b=i.3H("4y-3K")}28(e){}7(h.2w&&b)6.32[h.1D]=b;o a=6.4w(i,h.3M);7(h.24)h.24(a,c);7(h.1g)6.O.1l("4C",[i,h])}q 6.3a(h,i,c)}28(e){c="29";6.3a(h,i,c,e)}7(h.1g)6.O.1l("4P",[i,h]);7(h.1g&&!--6.3L)6.O.1l("4Q");7(h.1q)h.1q(i,c);7(h.2X)i=M}};o j=3m(g,13);7(h.1N>0)4v(k(){7(i){i.6m();7(!f)g("1N")}},h.1N);2c{i.6l(h.T)}28(e){6.3a(h,i,M,e)}7(!h.2X)g();l i},3a:k(b,c,d,a){7(b.29)b.29(c,d,a);7(b.1g)6.O.1l("4N",[c,b,a])},3L:0,4z:k(a){2c{l!a.1T&&6j.7o=="4i:"||(a.1T>=50&&a.1T<6g)||a.1T==4q||6.E.26&&a.1T==C}28(e){}l I},4X:k(a,c){2c{o b=a.3H("4y-3K");l a.1T==4q||b==6.32[c]||6.E.26&&a.1T==C}28(e){}l I},4w:k(b,c){o d=b.3H("7r-F");o a=!c&&d&&d.H("52")>=0;a=c=="52"||a?b.6d:b.33;7(c=="38")6.3J(a);7(c=="4J")2r("T = "+a);7(c=="3N")6("<1r>").3N(a).3O();l a},2D:k(b){o s=[];7(b.16==2b||b.3k)6.v(b,k(){s.W(1X(9.6c)+"="+1X(9.2t))});q B(o j 17 b)7(b[j]&&b[j].16==2b)6.v(b[j],k(){s.W(1X(j)+"="+1X(9))});q s.W(1X(j)+"="+1X(b[j]));l s.5D("&")},3J:k(a){7(18.4t)18.4t(a);q 7(6.E.26)18.4v(a,0);q 2r.3F(18,a)}});6.K.1d({1k:k(c,a){o b=9.Y(":1i");c?b.1w({1m:"1k",2J:"1k",19:"1k"},c,a):b.v(k(){9.P.14=9.2n?9.2n:"";7(6.1a(9,"14")=="1A")9.P.14="2g"});l 9},1h:k(c,b){o a=9.Y(":2G");c?a.1w({1m:"1h",2J:"1h",19:"1h"},c,b):a.v(k(){9.2n=9.2n||6.1a(9,"14");7(9.2n=="1A")9.2n="2g";9.P.14="1A"});l 9},5a:6.K.3h,3h:k(a,b){o c=R;l 6.12(a)&&6.12(b)?9.5a(a,b):9.v(k(){6(9)[6(9).22(":1i")?"1k":"1h"].G(6(9),c)})},6b:k(b,a){l 9.Y(":1i").1w({1m:"1k"},b,a).1V()},69:k(b,a){l 9.Y(":2G").1w({1m:"1h"},b,a).1V()},7D:k(c,b){l 9.v(k(){o a=6(9).22(":1i")?"1k":"1h";6(9).1w({1m:a},c,b)})},67:k(b,a){l 9.Y(":1i").1w({19:"1k"},b,a).1V()},7F:k(b,a){l 9.Y(":2G").1w({19:"1h"},b,a).1V()},7G:k(c,a,b){l 9.1w({19:a},c,b)},1w:k(b,f,c,d){l 9.1f(k(){9.2h=6.1d({},b);o a=6.4p(f,c,d);B(o p 17 b){o e=U 6.2Q(9,a,p);7(b[p].16==3B)e.27(e.1n(),b[p]);q e[b[p]](b)}})},1f:k(a,b){7(!b){b=a;a="2Q"}l 9.v(k(){7(!9.1f)9.1f={};7(!9.1f[a])9.1f[a]=[];9.1f[a].W(b);7(9.1f[a].u==1)b.G(9)})}});6.1d({4p:k(b,a,c){o d=b&&b.16==63?b:{1q:c||!c&&a||6.12(b)&&b,1B:b,3o:c&&a||a&&a.16!=39&&a||"4n"};d.1B=(d.1B&&d.1B.16==3B?d.1B:{60:5Z,7S:50}[d.1B])||7T;d.2K=d.1q;d.1q=k(){6.5r(9,"2Q");7(6.12(d.2K))d.2K.G(9)};l d},3o:{5W:k(b,a,d,c){l d+c*b},4n:k(b,a,d,c){l((-5q.7X(b*5q.5U)/2)+0.5)*c+d}},1f:{},5r:k(b,a){a=a||"2Q";7(b.1f&&b.1f[a]){b.1f[a].4c();o f=b.1f[a][0];7(f)f.G(b)}},2j:[],2Q:k(g,j,e){o z=9;o y=g.P;7(e=="1m"||e=="2J"){o f=6.1a(g,"14");o h=y.3D;y.3D="1i"}z.a=k(){7(j.3s)j.3s.G(g,[z.2m]);7(e=="19")6.11(y,"19",z.2m);q{y[e]=84(z.2m)+"4k";y.14="2g"}};z.5C=k(){l 2Y(6.1a(g,e))};z.1n=k(){o r=2Y(6.2p(g,e));l r&&r>-5P?r:z.5C()};z.27=k(c,d){z.4g=(U 5v()).5w();z.2m=c;z.a();6.2j.W(k(){l z.3s(c,d)});7(6.2j.u==1){o b=3m(k(){6.2j=6.1Z(6.2j,k(a){l a()});7(!6.2j.u)3R(b)},13)}};z.1k=k(){7(!g.1v)g.1v={};g.1v[e]=6.11(g.P,e);j.1k=D;z.27(0,9.1n());7(e!="19")y[e]="4l"};z.1h=k(){7(!g.1v)g.1v={};g.1v[e]=6.11(g.P,e);j.1h=D;z.27(9.1n(),0)};z.3h=k(){7(!g.1v)g.1v={};g.1v[e]=6.11(g.P,e);7(f=="1A"){j.1k=D;7(e!="19")y[e]="4l";z.27(0,9.1n())}q{j.1h=D;z.27(9.1n(),0)}};z.3s=k(c,a){o t=(U 5v()).5w();7(t>j.1B+z.4g){z.2m=a;z.a();7(g.2h)g.2h[e]=D;o b=D;B(o i 17 g.2h)7(g.2h[i]!==D)b=I;7(b){7(f){y.3D=h;y.14=f;7(6.1a(g,"14")=="1A")y.14="2g"}7(j.1h)y.14="1A";7(j.1h||j.1k)B(o p 17 g.2h)6.11(y,p,g.1v[p])}7(b&&6.12(j.1q))j.1q.G(g);l I}q{o n=t-9.4g;o p=n/j.1B;z.2m=6.3o[j.3o](p,n,c,(a-c),j.1B);z.a()}l D}}})}',62,509,'||||||jQuery|if||this|||||||||||function|return|||var||else||||length|each||||||for|undefined|true|browser|type|apply|indexOf|false|document|fn|parentNode|null|ret|event|style|className|arguments|firstChild|data|new|nodeName|push||filter|||attr|isFunction||display|msie|constructor|in|window|opacity|css|typeof|target|extend|test|queue|global|hide|hidden|replace|show|trigger|height|cur|tbody|while|complete|div|handle|guid|string|orig|animate|events|nodeType|table|none|duration|nth|url|remove|ready|add|tb|last|prop|get|not|load|timeout|merge|find|pushStack|nextSibling|oid|status|preventDefault|end|break|encodeURIComponent|text|grep|select|opera|is|cssFloat|success|innerHTML|safari|custom|catch|error|al|Array|try|tmp|exec|stopPropagation|block|curAnim|done|timers|sibling|expr|now|oldblock|childNodes|curCSS|src|eval|disabled|value|selected|chars|ifModified|trim|multiFilter|toLowerCase|readyList|map|checked|param|domManip|elem|visible|insertBefore|substr|width|old|ownerDocument|makeArray|has|split|id|fx|mergeNum|toUpperCase|ajax|el|form|String|async|parseFloat|ajaxSettings|bind|tr|lastModified|responseText|val|getAttribute|oHeight|readyState|script|Function|handleError|inArray|empty|isReady|clean|defaultView|styleFloat|toggle|append|static|jquery|tag|setInterval|position|easing|removeChild|token|RegExp|step|oWidth|button|cloneNode|_|mozilla|toString|child|mouseover|Number|currentStyle|overflow|parents|call|isXMLDoc|getResponseHeader|00|globalEval|Modified|active|dataType|html|evalScripts|GET|setRequestHeader|clearInterval|safariTimer|num|slice|unload|__ie_init|getComputedStyle|handleHover|lastToggle|triggered|fix|removeEventListener|delete|handler|addEventListener|pass|visibility|classFilter|radio|getElementById|appendChild|shift|documentElement|float|_resort|startTime|submit|file|swap|px|1px|zoom|swing|parent|speed|304|ol|webkit|execScript|body|setTimeout|httpData|fl|Last|httpSuccess|beforeSend|href|ajaxSuccess|getElementsByTagName|match|100|contentType|processData|alpha|json|ActiveXObject|setArray|ajaxSend|ajaxError|XMLHttpRequest|ajaxComplete|ajaxStop|ajaxStart|getScript|createElement|notmodified|POST|fieldset|httpNotModified|index|tagName|200|getPropertyValue|xml|DOMContentLoaded|mouseout|click|unbind|one|scrollTop|prevObject|_toggle|clientX|pageX|srcElement|unique|unshift|detachEvent|appendTo|on|after|attachEvent|before|prepend|removeAttr|previousSibling|tl|Math|dequeue|parse|_prefix|scrollLeft|Date|getTime|input|reset|image|password|checkbox|max|join|odd|even|args|first|contains|gt|lt|eq|removeClass|addClass|removeAttribute|10000|line|insertAfter|prependTo|children|PI|siblings|linear|weight|prev|600|slow|font|next|Object|CSS1Compat|createTextNode|compatMode|fadeIn|boxModel|slideUp|compatible|slideDown|name|responseXML|xiae|version|300|userAgent|navigator|location|concat|send|abort|noConflict|With|GMT|array|ig|01|Thu|Since|If|Type|setAttribute|open|nodeValue|Microsoft|getAttributeNode|method|action|urlencoded|www|application|NaN|ajaxSetup|ajaxTimeout|reverse|post|getJSON|getIfModified|readOnly|readonly|class|textContent|htmlFor|serialize|XMLHTTP|th|td|tfoot|Content|loadIfModified|do|thead|FORM|loaded|Jan|1970|leg|onreadystatechange|opt|Requested|defer|ipt|scr|write|keyup|keypress|keydown|change|mousemove|mouseup|mousedown|dblclick|scroll|resize|protocol|focus|blur|content|relatedTarget|toElement|fromElement|hover|cancelBubble|clone|returnValue|clientY|pageY|clientWidth|clientHeight|slideToggle|relative|fadeOut|fadeTo|left|right|absolute|substring|context|re2|object|offsetWidth|offsetHeight|continue|size|fast|400|Width|border|uFFFF|cos|u0128|padding|Left|Right|Bottom|Top|parseInt|textarea|prototype|enabled|only|lastChild|wrap|toggleClass|nodeValua'.split('|'),0,{}))

/* json.js */





SimileAjax.JSON=new Object();

(function(){
var m={
'\b':'\\b',
'\t':'\\t',
'\n':'\\n',
'\f':'\\f',
'\r':'\\r',
'"':'\\"',
'\\':'\\\\'
};
var s={
array:function(x){
var a=['['],b,f,i,l=x.length,v;
for(i=0;i<l;i+=1){
v=x[i];
f=s[typeof v];
if(f){
v=f(v);
if(typeof v=='string'){
if(b){
a[a.length]=',';
}
a[a.length]=v;
b=true;
}
}
}
a[a.length]=']';
return a.join('');
},
'boolean':function(x){
return String(x);
},
'null':function(x){
return"null";
},
number:function(x){
return isFinite(x)?String(x):'null';
},
object:function(x){
if(x){
if(x instanceof Array){
return s.array(x);
}
var a=['{'],b,f,i,v;
for(i in x){
v=x[i];
f=s[typeof v];
if(f){
v=f(v);
if(typeof v=='string'){
if(b){
a[a.length]=',';
}
a.push(s.string(i),':',v);
b=true;
}
}
}
a[a.length]='}';
return a.join('');
}
return'null';
},
string:function(x){
if(/["\\\x00-\x1f]/.test(x)){
x=x.replace(/([\x00-\x1f\\"])/g,function(a,b){
var c=m[b];
if(c){
return c;
}
c=b.charCodeAt();
return'\\u00'+
Math.floor(c/16).toString(16)+
(c%16).toString(16);
});
}
return'"'+x+'"';
}
};

SimileAjax.JSON.toJSONString=function(o){
if(o instanceof Object){
return s.object(o);
}else if(o instanceof Array){
return s.array(o);
}else{
return o.toString();
}
};

SimileAjax.JSON.parseJSON=function(){
try{
return!(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
this.replace(/"(\\.|[^"\\])*"/g,'')))&&
eval('('+this+')');
}catch(e){
return false;
}
};
})();


/* string.js */



String.prototype.trim=function(){
return this.replace(/^\s+|\s+$/,'');
};

String.prototype.startsWith=function(prefix){
return this.length>=prefix.length&&this.substr(0,prefix.length)==prefix;
};

String.prototype.endsWith=function(suffix){
return this.length>=suffix.length&&this.substr(this.length-suffix.length)==suffix;
};

String.substitute=function(s,objects){
var result="";
var start=0;
while(start<s.length-1){
var percent=s.indexOf("%",start);
if(percent<0||percent==s.length-1){
break;
}else if(percent>start&&s.charAt(percent-1)=="\\"){
result+=s.substring(start,percent-1)+"%";
start=percent+1;
}else{
var n=parseInt(s.charAt(percent+1));
if(isNaN(n)||n>=objects.length){
result+=s.substring(start,percent+2);
}else{
result+=s.substring(start,percent)+objects[n].toString();
}
start=percent+2;
}
}

if(start<s.length){
result+=s.substring(start);
}
return result;
};


/* window-manager.js */



SimileAjax.WindowManager={
_initialized:false,
_listeners:[],

_draggedElement:null,
_draggedElementCallback:null,
_dropTargetHighlightElement:null,
_lastCoords:null,
_ghostCoords:null,
_draggingMode:"",
_dragging:false,

_layers:[]
};

SimileAjax.WindowManager.initialize=function(){
if(SimileAjax.WindowManager._initialized){
return;
}

SimileAjax.DOM.registerEvent(document.body,"click",SimileAjax.WindowManager._onBodyClick);
SimileAjax.DOM.registerEvent(document.body,"mousemove",SimileAjax.WindowManager._onBodyMouseMove);
SimileAjax.DOM.registerEvent(document.body,"mouseup",SimileAjax.WindowManager._onBodyMouseUp);
SimileAjax.DOM.registerEvent(document,"keydown",SimileAjax.WindowManager._onBodyKeyDown);
SimileAjax.DOM.registerEvent(document,"keyup",SimileAjax.WindowManager._onBodyKeyUp);

SimileAjax.WindowManager._layers.push({index:0});

SimileAjax.WindowManager._historyListener={
onBeforeUndoSeveral:function(){},
onAfterUndoSeveral:function(){},
onBeforeUndo:function(){},
onAfterUndo:function(){},

onBeforeRedoSeveral:function(){},
onAfterRedoSeveral:function(){},
onBeforeRedo:function(){},
onAfterRedo:function(){}
};
SimileAjax.History.addListener(SimileAjax.WindowManager._historyListener);

SimileAjax.WindowManager._initialized=true;
};

SimileAjax.WindowManager.getBaseLayer=function(){
SimileAjax.WindowManager.initialize();
return SimileAjax.WindowManager._layers[0];
};

SimileAjax.WindowManager.getHighestLayer=function(){
SimileAjax.WindowManager.initialize();
return SimileAjax.WindowManager._layers[SimileAjax.WindowManager._layers.length-1];
};

SimileAjax.WindowManager.registerEventWithObject=function(elmt,eventName,obj,handlerName,layer){
SimileAjax.WindowManager.registerEvent(
elmt,
eventName,
function(elmt2,evt,target){
return obj[handlerName].call(obj,elmt2,evt,target);
},
layer
);
};

SimileAjax.WindowManager.registerEvent=function(elmt,eventName,handler,layer){
if(layer==null){
layer=SimileAjax.WindowManager.getHighestLayer();
}

var handler2=function(elmt,evt,target){
if(SimileAjax.WindowManager._canProcessEventAtLayer(layer)){
SimileAjax.WindowManager._popToLayer(layer.index);
try{
handler(elmt,evt,target);
}catch(e){
SimileAjax.Debug.exception(e);
}
}
SimileAjax.DOM.cancelEvent(evt);
return false;
}

SimileAjax.DOM.registerEvent(elmt,eventName,handler2);
};

SimileAjax.WindowManager.pushLayer=function(f,ephemeral){
var layer={onPop:f,index:SimileAjax.WindowManager._layers.length,ephemeral:(ephemeral)};
SimileAjax.WindowManager._layers.push(layer);

return layer;
};

SimileAjax.WindowManager.popLayer=function(layer){
for(var i=1;i<SimileAjax.WindowManager._layers.length;i++){
if(SimileAjax.WindowManager._layers[i]==layer){
SimileAjax.WindowManager._popToLayer(i-1);
break;
}
}
};

SimileAjax.WindowManager.popAllLayers=function(){
SimileAjax.WindowManager._popToLayer(0);
};

SimileAjax.WindowManager.registerForDragging=function(elmt,callback,layer){
SimileAjax.WindowManager.registerEvent(
elmt,
"mousedown",
function(elmt,evt,target){
SimileAjax.WindowManager._handleMouseDown(elmt,evt,callback);
},
layer
);
};

SimileAjax.WindowManager._popToLayer=function(level){
while(level+1<SimileAjax.WindowManager._layers.length){
try{
var layer=SimileAjax.WindowManager._layers.pop();
if(layer.onPop!=null){
layer.onPop();
}
}catch(e){
}
}
};

SimileAjax.WindowManager._canProcessEventAtLayer=function(layer){
if(layer.index==(SimileAjax.WindowManager._layers.length-1)){
return true;
}
for(var i=layer.index+1;i<SimileAjax.WindowManager._layers.length;i++){
if(!SimileAjax.WindowManager._layers[i].ephemeral){
return false;
}
}
return true;
};

SimileAjax.WindowManager._cancelPopups=function(){
var i=SimileAjax.WindowManager._layers.length-1;
while(i>0&&SimileAjax.WindowManager._layers[i].ephemeral){
i--;
}
SimileAjax.WindowManager._popToLayer(i);
};

SimileAjax.WindowManager._onBodyClick=function(elmt,evt,target){
if(!("eventPhase"in evt)||evt.eventPhase==evt.BUBBLING_PHASE){
SimileAjax.WindowManager._cancelPopups();
}
};

SimileAjax.WindowManager._handleMouseDown=function(elmt,evt,callback){
SimileAjax.WindowManager._draggedElement=elmt;
SimileAjax.WindowManager._draggedElementCallback=callback;
SimileAjax.WindowManager._lastCoords={x:evt.clientX,y:evt.clientY};

SimileAjax.DOM.cancelEvent(evt);
return false;
};

SimileAjax.WindowManager._onBodyKeyDown=function(elmt,evt,target){
if(SimileAjax.WindowManager._dragging){
if(evt.keyCode==27){
SimileAjax.WindowManager._cancelDragging();
}else if((evt.keyCode==17||evt.keyCode==16)&&SimileAjax.WindowManager._draggingMode!="copy"){
SimileAjax.WindowManager._draggingMode="copy";

var img=SimileAjax.Graphics.createTranslucentImage(SimileAjax.urlPrefix+"images/copy.png");
img.style.position="absolute";
img.style.left=(SimileAjax.WindowManager._ghostCoords.left-16)+"px";
img.style.top=(SimileAjax.WindowManager._ghostCoords.top)+"px";
document.body.appendChild(img);

SimileAjax.WindowManager._draggingModeIndicatorElmt=img;
}
}
};

SimileAjax.WindowManager._onBodyKeyUp=function(elmt,evt,target){
if(SimileAjax.WindowManager._dragging){
if(evt.keyCode==17||evt.keyCode==16){
SimileAjax.WindowManager._draggingMode="";
if(SimileAjax.WindowManager._draggingModeIndicatorElmt!=null){
document.body.removeChild(SimileAjax.WindowManager._draggingModeIndicatorElmt);
SimileAjax.WindowManager._draggingModeIndicatorElmt=null;
}
}
}
};

SimileAjax.WindowManager._onBodyMouseMove=function(elmt,evt,target){
if(SimileAjax.WindowManager._draggedElement!=null){
var callback=SimileAjax.WindowManager._draggedElementCallback;

var lastCoords=SimileAjax.WindowManager._lastCoords;
var diffX=evt.clientX-lastCoords.x;
var diffY=evt.clientY-lastCoords.y;

if(!SimileAjax.WindowManager._dragging){
if(Math.abs(diffX)>5||Math.abs(diffY)>5){
try{
if("onDragStart"in callback){
callback.onDragStart();
}

if("ghost"in callback&&callback.ghost){
var draggedElmt=SimileAjax.WindowManager._draggedElement;

SimileAjax.WindowManager._ghostCoords=SimileAjax.DOM.getPageCoordinates(draggedElmt);
SimileAjax.WindowManager._ghostCoords.left+=diffX;
SimileAjax.WindowManager._ghostCoords.top+=diffY;

var ghostElmt=draggedElmt.cloneNode(true);
ghostElmt.style.position="absolute";
ghostElmt.style.left=SimileAjax.WindowManager._ghostCoords.left+"px";
ghostElmt.style.top=SimileAjax.WindowManager._ghostCoords.top+"px";
ghostElmt.style.zIndex=1000;
SimileAjax.Graphics.setOpacity(ghostElmt,50);

document.body.appendChild(ghostElmt);
callback._ghostElmt=ghostElmt;
}

SimileAjax.WindowManager._dragging=true;
SimileAjax.WindowManager._lastCoords={x:evt.clientX,y:evt.clientY};

document.body.focus();
}catch(e){
SimileAjax.Debug.exception("WindowManager: Error handling mouse down",e);
SimileAjax.WindowManager._cancelDragging();
}
}
}else{
try{
SimileAjax.WindowManager._lastCoords={x:evt.clientX,y:evt.clientY};

if("onDragBy"in callback){
callback.onDragBy(diffX,diffY);
}

if("_ghostElmt"in callback){
var ghostElmt=callback._ghostElmt;

SimileAjax.WindowManager._ghostCoords.left+=diffX;
SimileAjax.WindowManager._ghostCoords.top+=diffY;

ghostElmt.style.left=SimileAjax.WindowManager._ghostCoords.left+"px";
ghostElmt.style.top=SimileAjax.WindowManager._ghostCoords.top+"px";
if(SimileAjax.WindowManager._draggingModeIndicatorElmt!=null){
var indicatorElmt=SimileAjax.WindowManager._draggingModeIndicatorElmt;

indicatorElmt.style.left=(SimileAjax.WindowManager._ghostCoords.left-16)+"px";
indicatorElmt.style.top=SimileAjax.WindowManager._ghostCoords.top+"px";
}

if("droppable"in callback&&callback.droppable){
var coords=SimileAjax.DOM.getEventPageCoordinates(evt);
var target=SimileAjax.DOM.hittest(
coords.x,coords.y,
[SimileAjax.WindowManager._ghostElmt,
SimileAjax.WindowManager._dropTargetHighlightElement
]
);
target=SimileAjax.WindowManager._findDropTarget(target);

if(target!=SimileAjax.WindowManager._potentialDropTarget){
if(SimileAjax.WindowManager._dropTargetHighlightElement!=null){
document.body.removeChild(SimileAjax.WindowManager._dropTargetHighlightElement);

SimileAjax.WindowManager._dropTargetHighlightElement=null;
SimileAjax.WindowManager._potentialDropTarget=null;
}

var droppable=false;
if(target!=null){
if((!("canDropOn"in callback)||callback.canDropOn(target))&&
(!("canDrop"in target)||target.canDrop(SimileAjax.WindowManager._draggedElement))){

droppable=true;
}
}

if(droppable){
var border=4;
var targetCoords=SimileAjax.DOM.getPageCoordinates(target);
var highlight=document.createElement("div");
highlight.style.border=border+"px solid yellow";
highlight.style.backgroundColor="yellow";
highlight.style.position="absolute";
highlight.style.left=targetCoords.left+"px";
highlight.style.top=targetCoords.top+"px";
highlight.style.width=(target.offsetWidth-border*2)+"px";
highlight.style.height=(target.offsetHeight-border*2)+"px";
SimileAjax.Graphics.setOpacity(highlight,30);
document.body.appendChild(highlight);

SimileAjax.WindowManager._potentialDropTarget=target;
SimileAjax.WindowManager._dropTargetHighlightElement=highlight;
}
}
}
}
}catch(e){
SimileAjax.Debug.exception("WindowManager: Error handling mouse move",e);
SimileAjax.WindowManager._cancelDragging();
}
}

SimileAjax.DOM.cancelEvent(evt);
return false;
}
};

SimileAjax.WindowManager._onBodyMouseUp=function(elmt,evt,target){
if(SimileAjax.WindowManager._draggedElement!=null){
try{
if(SimileAjax.WindowManager._dragging){
var callback=SimileAjax.WindowManager._draggedElementCallback;
if("onDragEnd"in callback){
callback.onDragEnd();
}
if("droppable"in callback&&callback.droppable){
var dropped=false;

var target=SimileAjax.WindowManager._potentialDropTarget;
if(target!=null){
if((!("canDropOn"in callback)||callback.canDropOn(target))&&
(!("canDrop"in target)||target.canDrop(SimileAjax.WindowManager._draggedElement))){

if("onDropOn"in callback){
callback.onDropOn(target);
}
target.ondrop(SimileAjax.WindowManager._draggedElement,SimileAjax.WindowManager._draggingMode);

dropped=true;
}
}

if(!dropped){

}
}
}
}finally{
SimileAjax.WindowManager._cancelDragging();
}

SimileAjax.DOM.cancelEvent(evt);
return false;
}
};

SimileAjax.WindowManager._cancelDragging=function(){
var callback=SimileAjax.WindowManager._draggedElementCallback;
if("_ghostElmt"in callback){
var ghostElmt=callback._ghostElmt;
document.body.removeChild(ghostElmt);

delete callback._ghostElmt;
}
if(SimileAjax.WindowManager._dropTargetHighlightElement!=null){
document.body.removeChild(SimileAjax.WindowManager._dropTargetHighlightElement);
SimileAjax.WindowManager._dropTargetHighlightElement=null;
}
if(SimileAjax.WindowManager._draggingModeIndicatorElmt!=null){
document.body.removeChild(SimileAjax.WindowManager._draggingModeIndicatorElmt);
SimileAjax.WindowManager._draggingModeIndicatorElmt=null;
}

SimileAjax.WindowManager._draggedElement=null;
SimileAjax.WindowManager._draggedElementCallback=null;
SimileAjax.WindowManager._potentialDropTarget=null;
SimileAjax.WindowManager._dropTargetHighlightElement=null;
SimileAjax.WindowManager._lastCoords=null;
SimileAjax.WindowManager._ghostCoords=null;
SimileAjax.WindowManager._draggingMode="";
SimileAjax.WindowManager._dragging=false;
};

SimileAjax.WindowManager._findDropTarget=function(elmt){
while(elmt!=null){
if("ondrop"in elmt){
break;
}
elmt=elmt.parentNode;
}
return elmt;
};


/* xmlhttp.js */



SimileAjax.XmlHttp=new Object();


SimileAjax.XmlHttp._onReadyStateChange=function(xmlhttp,fError,fDone){
switch(xmlhttp.readyState){





case 4:
try{
if(xmlhttp.status==0
||xmlhttp.status==200
){
if(fDone){
fDone(xmlhttp);
}
}else{
if(fError){
fError(
xmlhttp.statusText,
xmlhttp.status,
xmlhttp
);
}
}
}catch(e){
SimileAjax.Debug.exception("XmlHttp: Error handling onReadyStateChange",e);
}
break;
}
};


SimileAjax.XmlHttp._createRequest=function(){
if(SimileAjax.Platform.browser.isIE){
var programIDs=[
"Msxml2.XMLHTTP",
"Microsoft.XMLHTTP",
"Msxml2.XMLHTTP.4.0"
];
for(var i=0;i<programIDs.length;i++){
try{
var programID=programIDs[i];
var f=function(){
return new ActiveXObject(programID);
};
var o=f();






SimileAjax.XmlHttp._createRequest=f;

return o;
}catch(e){

}
}

}

try{
var f=function(){
return new XMLHttpRequest();
};
var o=f();






SimileAjax.XmlHttp._createRequest=f;

return o;
}catch(e){
throw new Error("Failed to create an XMLHttpRequest object");
}
};


SimileAjax.XmlHttp.get=function(url,fError,fDone){
var xmlhttp=SimileAjax.XmlHttp._createRequest();

xmlhttp.open("GET",url,true);
xmlhttp.onreadystatechange=function(){
SimileAjax.XmlHttp._onReadyStateChange(xmlhttp,fError,fDone);
};
xmlhttp.send(null);
};


SimileAjax.XmlHttp.post=function(url,body,fError,fDone){
var xmlhttp=SimileAjax.XmlHttp._createRequest();

xmlhttp.open("POST",url,true);
xmlhttp.onreadystatechange=function(){
SimileAjax.XmlHttp._onReadyStateChange(xmlhttp,fError,fDone);
};
xmlhttp.send(body);
};

SimileAjax.XmlHttp._forceXML=function(xmlhttp){
try{
xmlhttp.overrideMimeType("text/xml");
}catch(e){
xmlhttp.setrequestheader("Content-Type","text/xml");
}
};