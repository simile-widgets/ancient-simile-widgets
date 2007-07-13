

/* timeplot.js */



Timeline.Debug=SimileAjax.Debug;
log=SimileAjax.Debug.log;



Timeplot.create=function(elmt,plotInfos){
return new Timeplot._Impl(elmt,plotInfos);
};

Timeplot.createPlotInfo=function(params){
return{
id:("id"in params)?params.id:"p"+Math.round(Math.random()*1000000),
dataSource:("dataSource"in params)?params.dataSource:null,
eventSource:("eventSource"in params)?params.eventSource:null,
timeGeometry:("timeGeometry"in params)?params.timeGeometry:new Timeplot.DefaultTimeGeometry(),
valueGeometry:("valueGeometry"in params)?params.valueGeometry:new Timeplot.DefaultValueGeometry(),
timeZone:("timeZone"in params)?params.timeZone:0,
fillColor:("fillColor"in params)?params.fillColor:null,
lineColor:("lineColor"in params)?params.lineColor:new Timeplot.Color("#606060"),
lineWidth:("lineWidth"in params)?params.lineWidth:1.0,
dotRadius:("dotRadius"in params)?params.dotRadius:2.0,
dotColor:("dotColor"in params)?params.dotColor:null,
eventLineWidth:("eventLineWidth"in params)?params.eventLineWidth:1.0,
showValues:("showValues"in params)?params.showValues:false,
roundValues:("roundValues"in params)?params.roundValues:true,
bubbleWidth:("bubbleWidth"in params)?params.bubbleWidth:300,
bubbleHeight:("bubbleHeight"in params)?params.bubbleHeight:200,
};
};



Timeplot._Impl=function(elmt,plotInfos,unit){
this._id="t"+Math.round(Math.random()*1000000);
this._containerDiv=elmt;
this._plotInfos=plotInfos;
this._painters={
background:[],
foreground:[]
};
this._painter=null;
this._unit=(unit!=null)?unit:Timeline.NativeDateUnit;
this._initialize();
};

Timeplot._Impl.prototype={

dispose:function(){
for(var i=0;i<this._plots.length;i++){
this._plots[i].dispose();
}
this._plots=null;
this._plotsInfos=null;
this._containerDiv.innerHTML="";
},

getElement:function(){
return this._containerDiv;
},

getDocument:function(){
return this._containerDiv.ownerDocument;
},

add:function(div){
this._containerDiv.appendChild(div);
},

remove:function(div){
this._containerDiv.removeChild(div);
},

addPainter:function(layerName,painter){
var layer=this._painters[layerName];
if(layer){
for(var i=0;i<layer.length;i++){
if(layer[i].context._id==painter.context._id){
return;
}
}
layer.push(painter);
}
},

removePainter:function(layerName,painter){
var layer=this._painters[layerName];
if(layer){
for(var i=0;i<layer.length;i++){
if(layer[i].context._id==painter.context._id){
layer.splice(i,1);
break;
}
}
}
},

getWidth:function(){
return this._containerDiv.clientWidth;
},

getHeight:function(){
return this._containerDiv.clientHeight;
},

getInternalWidth:function(){
var w=window.getComputedStyle(this._containerDiv,null).getPropertyValue("width");
w=parseInt(w.replace("px",""));
return w;
},

getInternalHeight:function(){
var h=window.getComputedStyle(this._containerDiv,null).getPropertyValue("height");
h=parseInt(h.replace("px",""));
return h;
},

getUnit:function(){
return this._unit;
},

getCanvas:function(){
return this._canvas;
},

loadText:function(url,separator,eventSource,filter){
var tp=this;

var fError=function(statusText,status,xmlhttp){
alert("Failed to load data xml from "+url+"\n"+statusText);
tp.hideLoadingMessage();
};

var fDone=function(xmlhttp){
try{
eventSource.loadText(xmlhttp.responseText,separator,url,filter);
}catch(e){
SimileAjax.Debug.exception(e);
}finally{
tp.hideLoadingMessage();
}
};

this.showLoadingMessage();
window.setTimeout(function(){SimileAjax.XmlHttp.get(url,fError,fDone);},0);
},

loadXML:function(url,eventSource){
var tl=this;

var fError=function(statusText,status,xmlhttp){
alert("Failed to load data xml from "+url+"\n"+statusText);
tl.hideLoadingMessage();
};

var fDone=function(xmlhttp){
try{
var xml=xmlhttp.responseXML;
if(!xml.documentElement&&xmlhttp.responseStream){
xml.load(xmlhttp.responseStream);
}
eventSource.loadXML(xml,url);
}finally{
tl.hideLoadingMessage();
}
};

this.showLoadingMessage();
window.setTimeout(function(){SimileAjax.XmlHttp.get(url,fError,fDone);},0);
},

putText:function(text,clazz,styles){
var div=this.putDiv(text,"timeplot-div "+clazz,styles);
div.innerHTML=text;
return div;
},

putDiv:function(id,clazz,styles){
var tid=this._id+"-"+id;
var div=document.getElementById(tid);
if(!div){
var container=this._containerDiv.firstChild;
div=document.createElement("div");
div.setAttribute("id",tid);
container.appendChild(div);
}
div.setAttribute("class","timeplot-div "+clazz);
this.placeDiv(div,styles);
return div;
},

placeDiv:function(div,styles){
if(styles){
for(style in styles){
if(style=="left"){
styles[style]+=this._paddingX;
}else if(style=="right"){
styles[style]+=this._paddingX;
}else if(style=="top"){
styles[style]+=this._paddingY;
}else if(style=="bottom"){
styles[style]+=this._paddingY;
}
div.style[style]=styles[style];
}
}
},

locate:function(div){
return{
x:div.offsetLeft-this._paddingX,
y:div.offsetTop-this._paddingY
}
},

update:function(){
for(var i=0;i<this._plots.length;i++){
var plot=this._plots[i];
var dataSource=plot.getDataSource();
if(dataSource){
var range=dataSource.getRange();
if(range){
plot._valueGeometry.setRange(range);
plot._timeGeometry.setRange(range);
}
}
}
this.paint();
},

repaint:function(){
this._prepareCanvas();
this.paint();
},

paint:function(){
if(this._painter==null){
var timeplot=this;
this._painter=window.setTimeout(function(){
timeplot._clearCanvas();
var background=timeplot._painters.background;
for(var i=0;i<background.length;i++){
try{
background[i].action.apply(background[i].context,[]);
}catch(e){
SimileAjax.Debug.exception(e);
}
}
var foreground=timeplot._painters.foreground;
for(var i=0;i<foreground.length;i++){
try{
foreground[i].action.apply(foreground[i].context,[]);
}catch(e){
SimileAjax.Debug.exception(e);
}
}
timeplot._painter=null;
},20);
}
},

_clearCanvas:function(){
var canvas=this.getCanvas();
var ctx=canvas.getContext('2d');
ctx.clearRect(0,0,canvas.width,canvas.height);
},

_prepareCanvas:function(){
var canvas=this.getCanvas();

canvas.width=this.getInternalWidth();
canvas.height=this.getInternalHeight();

this._paddingX=(this.getWidth()-canvas.width)/2;
this._paddingY=(this.getHeight()-canvas.height)/2;

var ctx=canvas.getContext('2d');
ctx.translate(0,canvas.height);
ctx.scale(1,-1);
ctx.globalCompositeOperation='source-over';
},

_initialize:function(){


SimileAjax.WindowManager.initialize();

var containerDiv=this._containerDiv;
var doc=containerDiv.ownerDocument;


containerDiv.className="timeplot-container "+containerDiv.className;


while(containerDiv.firstChild){
containerDiv.removeChild(containerDiv.firstChild);
}


var labels=doc.createElement("div");
containerDiv.appendChild(labels);

var canvas=doc.createElement("canvas");

if(canvas.getContext){
this._canvas=canvas;
canvas.className="timeplot-canvas";
this._prepareCanvas();
containerDiv.appendChild(canvas);


var elmtCopyright=SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix+"images/copyright.png");
elmtCopyright.className="timeplot-copyright";
elmtCopyright.title="Timeplot (c) SIMILE - http://simile.mit.edu/timeplot/";
SimileAjax.DOM.registerEvent(elmtCopyright,"click",function(){window.location="http://simile.mit.edu/timeplot/";});
containerDiv.appendChild(elmtCopyright);

var timeplot=this;
var painter={
onAddMany:function(){timeplot.update();},
onClear:function(){timeplot.update();}
}


this._plots=[];
if(this._plotInfos){
for(var i=0;i<this._plotInfos.length;i++){
var plot=new Timeplot.Plot(this,this._plotInfos[i]);
var dataSource=plot.getDataSource();
if(dataSource){
dataSource.addListener(painter);
}
this.addPainter("background",{
context:plot.getTimeGeometry(),
action:plot.getTimeGeometry().paint
});
this.addPainter("background",{
context:plot.getValueGeometry(),
action:plot.getValueGeometry().paint
});
this.addPainter("foreground",{
context:plot,
action:plot.paint
});
this._plots.push(plot);
plot.initialize();
}
}


var message=SimileAjax.Graphics.createMessageBubble(doc);
message.containerDiv.className="timeplot-message-container";
containerDiv.appendChild(message.containerDiv);

message.contentDiv.className="timeplot-message";
message.contentDiv.innerHTML="<img src='http://static.simile.mit.edu/timeline/api/images/progress-running.gif' /> Loading...";

this.showLoadingMessage=function(){message.containerDiv.style.display="block";};
this.hideLoadingMessage=function(){message.containerDiv.style.display="none";};

}else{

this._message=SimileAjax.Graphics.createMessageBubble(doc);
this._message.containerDiv.className="timeplot-message-container";
this._message.contentDiv.className="timeplot-message";
this._message.contentDiv.innerHTML="We're sorry, but your web browser is not currently supported by Timeplot.";
this.appendChild(this._message.containerDiv);
this._message.containerDiv.style.display="block";

}
}
};


/* color.js */



Timeplot.Color=function(color){
this._fromHex(color);
};

Timeplot.Color.prototype={


set:function(r,g,b,a){
this.r=r;
this.g=g;
this.b=b;
this.a=(a)?a:1.0;
return this.check();
},


transparency:function(a){
this.a=a;
return this.check();
},


lighten:function(level){
var color=new Timeplot.Color();
return color.set(
this.r+=parseInt(level,10),
this.g+=parseInt(level,10),
this.b+=parseInt(level,10)
);
},


darken:function(level){
var color=new Timeplot.Color();
return color.set(
this.r-=parseInt(level,10),
this.g-=parseInt(level,10),
this.b-=parseInt(level,10)
);
},


check:function(){
if(this.r>255){
this.r=255;
}else if(this.r<0){
this.r=0;
}
if(this.g>255){
this.g=255;
}else if(this.g<0){
this.g=0;
}
if(this.b>255){
this.b=255;
}else if(this.b<0){
this.b=0;
}
if(this.a>1.0){
this.a=255;
}else if(this.a<0.0){
this.a=0.0;
}
return this;
},


toString:function(alpha){
return'rgba('+this.r+','+this.g+','+this.b+','+((alpha)?alpha:'1.0')+')';
},


_fromHex:function(color){
if(/^#?([\da-f]{3}|[\da-f]{6})$/i.test(color)){
color=color.replace(/^#/,'').replace(/^([\da-f])([\da-f])([\da-f])$/i,"$1$1$2$2$3$3");
this.r=parseInt(color.substr(0,2),16);
this.g=parseInt(color.substr(2,2),16);
this.b=parseInt(color.substr(4,2),16);
}else if(/^rgb *\( *\d{0,3} *, *\d{0,3} *, *\d{0,3} *\)$/i.test(color)){
color=color.match(/^rgb *\( *(\d{0,3}) *, *(\d{0,3}) *, *(\d{0,3}) *\)$/i);
this.r=parseInt(color[1],10);
this.g=parseInt(color[2],10);
this.b=parseInt(color[3],10);
}
this.a=1.0;
return this.check();
}

};

/* excanvas.js */


































if(!window.CanvasRenderingContext2D){

(function(){


var m=Math;
var mr=m.round;
var ms=m.sin;
var mc=m.cos;


var Z=10;
var Z2=Z/2;

var G_vmlCanvasManager_={
init:function(opt_doc){
var doc=opt_doc||document;
if(/MSIE/.test(navigator.userAgent)&&!window.opera){
var self=this;
doc.attachEvent("onreadystatechange",function(){
self.init_(doc);
});
}
},

init_:function(doc){
if(doc.readyState=="complete"){

if(!doc.namespaces["g_vml_"]){
doc.namespaces.add("g_vml_","urn:schemas-microsoft-com:vml");
}


var ss=doc.createStyleSheet();
ss.cssText="canvas{display:inline-block;overflow:hidden;"+

"text-align:left;width:300px;height:150px}"+
"g_vml_\\:*{behavior:url(#default#VML)}";


var els=doc.getElementsByTagName("canvas");
for(var i=0;i<els.length;i++){
if(!els[i].getContext){
this.initElement(els[i]);
}
}
}
},

fixElement_:function(el){


var outerHTML=el.outerHTML;

var newEl=el.ownerDocument.createElement(outerHTML);


if(outerHTML.slice(-2)!="/>"){
var tagName="/"+el.tagName;
var ns;

while((ns=el.nextSibling)&&ns.tagName!=tagName){
ns.removeNode();
}

if(ns){
ns.removeNode();
}
}
el.parentNode.replaceChild(newEl,el);
return newEl;
},


initElement:function(el){
el=this.fixElement_(el);
el.getContext=function(){
if(this.context_){
return this.context_;
}
return this.context_=new CanvasRenderingContext2D_(this);
};


el.attachEvent('onpropertychange',onPropertyChange);
el.attachEvent('onresize',onResize);

var attrs=el.attributes;
if(attrs.width&&attrs.width.specified){


el.style.width=attrs.width.nodeValue+"px";
}else{
el.width=el.clientWidth;
}
if(attrs.height&&attrs.height.specified){


el.style.height=attrs.height.nodeValue+"px";
}else{
el.height=el.clientHeight;
}

return el;
}
};

function onPropertyChange(e){
var el=e.srcElement;

switch(e.propertyName){
case'width':
el.style.width=el.attributes.width.nodeValue+"px";
el.getContext().clearRect();
break;
case'height':
el.style.height=el.attributes.height.nodeValue+"px";
el.getContext().clearRect();
break;
}
}

function onResize(e){
var el=e.srcElement;
if(el.firstChild){
el.firstChild.style.width=el.clientWidth+'px';
el.firstChild.style.height=el.clientHeight+'px';
}
}

G_vmlCanvasManager_.init();


var dec2hex=[];
for(var i=0;i<16;i++){
for(var j=0;j<16;j++){
dec2hex[i*16+j]=i.toString(16)+j.toString(16);
}
}

function createMatrixIdentity(){
return[
[1,0,0],
[0,1,0],
[0,0,1]
];
}

function matrixMultiply(m1,m2){
var result=createMatrixIdentity();

for(var x=0;x<3;x++){
for(var y=0;y<3;y++){
var sum=0;

for(var z=0;z<3;z++){
sum+=m1[x][z]*m2[z][y];
}

result[x][y]=sum;
}
}
return result;
}

function copyState(o1,o2){
o2.fillStyle=o1.fillStyle;
o2.lineCap=o1.lineCap;
o2.lineJoin=o1.lineJoin;
o2.lineWidth=o1.lineWidth;
o2.miterLimit=o1.miterLimit;
o2.shadowBlur=o1.shadowBlur;
o2.shadowColor=o1.shadowColor;
o2.shadowOffsetX=o1.shadowOffsetX;
o2.shadowOffsetY=o1.shadowOffsetY;
o2.strokeStyle=o1.strokeStyle;
o2.arcScaleX_=o1.arcScaleX_;
o2.arcScaleY_=o1.arcScaleY_;
}

function processStyle(styleString){
var str,alpha=1;

styleString=String(styleString);
if(styleString.substring(0,3)=="rgb"){
var start=styleString.indexOf("(",3);
var end=styleString.indexOf(")",start+1);
var guts=styleString.substring(start+1,end).split(",");

str="#";
for(var i=0;i<3;i++){
str+=dec2hex[Number(guts[i])];
}

if((guts.length==4)&&(styleString.substr(3,1)=="a")){
alpha=guts[3];
}
}else{
str=styleString;
}

return[str,alpha];
}

function processLineCap(lineCap){
switch(lineCap){
case"butt":
return"flat";
case"round":
return"round";
case"square":
default:
return"square";
}
}


function CanvasRenderingContext2D_(surfaceElement){
this.m_=createMatrixIdentity();

this.mStack_=[];
this.aStack_=[];
this.currentPath_=[];


this.strokeStyle="#000";
this.fillStyle="#000";

this.lineWidth=1;
this.lineJoin="miter";
this.lineCap="butt";
this.miterLimit=Z*1;
this.globalAlpha=1;
this.canvas=surfaceElement;

var el=surfaceElement.ownerDocument.createElement('div');
el.style.width=surfaceElement.clientWidth+'px';
el.style.height=surfaceElement.clientHeight+'px';
el.style.overflow='hidden';
el.style.position='absolute';
surfaceElement.appendChild(el);

this.element_=el;
this.arcScaleX_=1;
this.arcScaleY_=1;
};

var contextPrototype=CanvasRenderingContext2D_.prototype;
contextPrototype.clearRect=function(){
this.element_.innerHTML="";
this.currentPath_=[];
};

contextPrototype.beginPath=function(){



this.currentPath_=[];
};

contextPrototype.moveTo=function(aX,aY){
this.currentPath_.push({type:"moveTo",x:aX,y:aY});
this.currentX_=aX;
this.currentY_=aY;
};

contextPrototype.lineTo=function(aX,aY){
this.currentPath_.push({type:"lineTo",x:aX,y:aY});
this.currentX_=aX;
this.currentY_=aY;
};

contextPrototype.bezierCurveTo=function(aCP1x,aCP1y,
aCP2x,aCP2y,
aX,aY){
this.currentPath_.push({type:"bezierCurveTo",
cp1x:aCP1x,
cp1y:aCP1y,
cp2x:aCP2x,
cp2y:aCP2y,
x:aX,
y:aY});
this.currentX_=aX;
this.currentY_=aY;
};

contextPrototype.quadraticCurveTo=function(aCPx,aCPy,aX,aY){


var cp1x=this.currentX_+2.0/3.0*(aCPx-this.currentX_);
var cp1y=this.currentY_+2.0/3.0*(aCPy-this.currentY_);
var cp2x=cp1x+(aX-this.currentX_)/3.0;
var cp2y=cp1y+(aY-this.currentY_)/3.0;
this.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,aX,aY);
};

contextPrototype.arc=function(aX,aY,aRadius,
aStartAngle,aEndAngle,aClockwise){
aRadius*=Z;
var arcType=aClockwise?"at":"wa";

var xStart=aX+(mc(aStartAngle)*aRadius)-Z2;
var yStart=aY+(ms(aStartAngle)*aRadius)-Z2;

var xEnd=aX+(mc(aEndAngle)*aRadius)-Z2;
var yEnd=aY+(ms(aEndAngle)*aRadius)-Z2;


if(xStart==xEnd&&!aClockwise){
xStart+=0.125;

}

this.currentPath_.push({type:arcType,
x:aX,
y:aY,
radius:aRadius,
xStart:xStart,
yStart:yStart,
xEnd:xEnd,
yEnd:yEnd});

};

contextPrototype.rect=function(aX,aY,aWidth,aHeight){
this.moveTo(aX,aY);
this.lineTo(aX+aWidth,aY);
this.lineTo(aX+aWidth,aY+aHeight);
this.lineTo(aX,aY+aHeight);
this.closePath();
};

contextPrototype.strokeRect=function(aX,aY,aWidth,aHeight){

this.beginPath();
this.moveTo(aX,aY);
this.lineTo(aX+aWidth,aY);
this.lineTo(aX+aWidth,aY+aHeight);
this.lineTo(aX,aY+aHeight);
this.closePath();
this.stroke();
};

contextPrototype.fillRect=function(aX,aY,aWidth,aHeight){

this.beginPath();
this.moveTo(aX,aY);
this.lineTo(aX+aWidth,aY);
this.lineTo(aX+aWidth,aY+aHeight);
this.lineTo(aX,aY+aHeight);
this.closePath();
this.fill();
};

contextPrototype.createLinearGradient=function(aX0,aY0,aX1,aY1){
var gradient=new CanvasGradient_("gradient");
return gradient;
};

contextPrototype.createRadialGradient=function(aX0,aY0,
aR0,aX1,
aY1,aR1){
var gradient=new CanvasGradient_("gradientradial");
gradient.radius1_=aR0;
gradient.radius2_=aR1;
gradient.focus_.x=aX0;
gradient.focus_.y=aY0;
return gradient;
};

contextPrototype.drawImage=function(image,var_args){
var dx,dy,dw,dh,sx,sy,sw,sh;


var oldRuntimeWidth=image.runtimeStyle.width;
var oldRuntimeHeight=image.runtimeStyle.height;
image.runtimeStyle.width='auto';
image.runtimeStyle.height='auto';


var w=image.width;
var h=image.height;


image.runtimeStyle.width=oldRuntimeWidth;
image.runtimeStyle.height=oldRuntimeHeight;

if(arguments.length==3){
dx=arguments[1];
dy=arguments[2];
sx=sy=0;
sw=dw=w;
sh=dh=h;
}else if(arguments.length==5){
dx=arguments[1];
dy=arguments[2];
dw=arguments[3];
dh=arguments[4];
sx=sy=0;
sw=w;
sh=h;
}else if(arguments.length==9){
sx=arguments[1];
sy=arguments[2];
sw=arguments[3];
sh=arguments[4];
dx=arguments[5];
dy=arguments[6];
dw=arguments[7];
dh=arguments[8];
}else{
throw"Invalid number of arguments";
}

var d=this.getCoords_(dx,dy);

var w2=sw/2;
var h2=sh/2;

var vmlStr=[];

var W=10;
var H=10;


vmlStr.push(' <g_vml_:group',
' coordsize="',Z*W,',',Z*H,'"',
' coordorigin="0,0"',
' style="width:',W,';height:',H,';position:absolute;');






if(this.m_[0][0]!=1||this.m_[0][1]){
var filter=[];


filter.push("M11='",this.m_[0][0],"',",
"M12='",this.m_[1][0],"',",
"M21='",this.m_[0][1],"',",
"M22='",this.m_[1][1],"',",
"Dx='",mr(d.x/Z),"',",
"Dy='",mr(d.y/Z),"'");



var max=d;
var c2=this.getCoords_(dx+dw,dy);
var c3=this.getCoords_(dx,dy+dh);
var c4=this.getCoords_(dx+dw,dy+dh);

max.x=Math.max(max.x,c2.x,c3.x,c4.x);
max.y=Math.max(max.y,c2.y,c3.y,c4.y);

vmlStr.push("padding:0 ",mr(max.x/Z),"px ",mr(max.y/Z),
"px 0;filter:progid:DXImageTransform.Microsoft.Matrix(",
filter.join(""),", sizingmethod='clip');")
}else{
vmlStr.push("top:",mr(d.y/Z),"px;left:",mr(d.x/Z),"px;")
}

vmlStr.push(' ">',
'<g_vml_:image src="',image.src,'"',
' style="width:',Z*dw,';',
' height:',Z*dh,';"',
' cropleft="',sx/w,'"',
' croptop="',sy/h,'"',
' cropright="',(w-sx-sw)/w,'"',
' cropbottom="',(h-sy-sh)/h,'"',
' />',
'</g_vml_:group>');

this.element_.insertAdjacentHTML("BeforeEnd",
vmlStr.join(""));
};

contextPrototype.stroke=function(aFill){
var lineStr=[];
var lineOpen=false;
var a=processStyle(aFill?this.fillStyle:this.strokeStyle);
var color=a[0];
var opacity=a[1]*this.globalAlpha;

var W=10;
var H=10;

lineStr.push('<g_vml_:shape',
' fillcolor="',color,'"',
' filled="',Boolean(aFill),'"',
' style="position:absolute;width:',W,';height:',H,';"',
' coordorigin="0 0" coordsize="',Z*W,' ',Z*H,'"',
' stroked="',!aFill,'"',
' strokeweight="',this.lineWidth,'"',
' strokecolor="',color,'"',
' path="');

var newSeq=false;
var min={x:null,y:null};
var max={x:null,y:null};

for(var i=0;i<this.currentPath_.length;i++){
var p=this.currentPath_[i];

if(p.type=="moveTo"){
lineStr.push(" m ");
var c=this.getCoords_(p.x,p.y);
lineStr.push(mr(c.x),",",mr(c.y));
}else if(p.type=="lineTo"){
lineStr.push(" l ");
var c=this.getCoords_(p.x,p.y);
lineStr.push(mr(c.x),",",mr(c.y));
}else if(p.type=="close"){
lineStr.push(" x ");
}else if(p.type=="bezierCurveTo"){
lineStr.push(" c ");
var c=this.getCoords_(p.x,p.y);
var c1=this.getCoords_(p.cp1x,p.cp1y);
var c2=this.getCoords_(p.cp2x,p.cp2y);
lineStr.push(mr(c1.x),",",mr(c1.y),",",
mr(c2.x),",",mr(c2.y),",",
mr(c.x),",",mr(c.y));
}else if(p.type=="at"||p.type=="wa"){
lineStr.push(" ",p.type," ");
var c=this.getCoords_(p.x,p.y);
var cStart=this.getCoords_(p.xStart,p.yStart);
var cEnd=this.getCoords_(p.xEnd,p.yEnd);

lineStr.push(mr(c.x-this.arcScaleX_*p.radius),",",
mr(c.y-this.arcScaleY_*p.radius)," ",
mr(c.x+this.arcScaleX_*p.radius),",",
mr(c.y+this.arcScaleY_*p.radius)," ",
mr(cStart.x),",",mr(cStart.y)," ",
mr(cEnd.x),",",mr(cEnd.y));
}







if(c){
if(min.x==null||c.x<min.x){
min.x=c.x;
}
if(max.x==null||c.x>max.x){
max.x=c.x;
}
if(min.y==null||c.y<min.y){
min.y=c.y;
}
if(max.y==null||c.y>max.y){
max.y=c.y;
}
}
}
lineStr.push(' ">');

if(typeof this.fillStyle=="object"){
var focus={x:"50%",y:"50%"};
var width=(max.x-min.x);
var height=(max.y-min.y);
var dimension=(width>height)?width:height;

focus.x=mr((this.fillStyle.focus_.x/width)*100+50)+"%";
focus.y=mr((this.fillStyle.focus_.y/height)*100+50)+"%";

var colors=[];


if(this.fillStyle.type_=="gradientradial"){
var inside=(this.fillStyle.radius1_/dimension*100);


var expansion=(this.fillStyle.radius2_/dimension*100)-inside;
}else{
var inside=0;
var expansion=100;
}

var insidecolor={offset:null,color:null};
var outsidecolor={offset:null,color:null};



this.fillStyle.colors_.sort(function(cs1,cs2){
return cs1.offset-cs2.offset;
});

for(var i=0;i<this.fillStyle.colors_.length;i++){
var fs=this.fillStyle.colors_[i];

colors.push((fs.offset*expansion)+inside,"% ",fs.color,",");

if(fs.offset>insidecolor.offset||insidecolor.offset==null){
insidecolor.offset=fs.offset;
insidecolor.color=fs.color;
}

if(fs.offset<outsidecolor.offset||outsidecolor.offset==null){
outsidecolor.offset=fs.offset;
outsidecolor.color=fs.color;
}
}
colors.pop();

lineStr.push('<g_vml_:fill',
' color="',outsidecolor.color,'"',
' color2="',insidecolor.color,'"',
' type="',this.fillStyle.type_,'"',
' focusposition="',focus.x,', ',focus.y,'"',
' colors="',colors.join(""),'"',
' opacity="',opacity,'" />');
}else if(aFill){
lineStr.push('<g_vml_:fill color="',color,'" opacity="',opacity,'" />');
}else{
lineStr.push(
'<g_vml_:stroke',
' opacity="',opacity,'"',
' joinstyle="',this.lineJoin,'"',
' miterlimit="',this.miterLimit,'"',
' endcap="',processLineCap(this.lineCap),'"',
' weight="',this.lineWidth,'px"',
' color="',color,'" />'
);
}

lineStr.push("</g_vml_:shape>");

this.element_.insertAdjacentHTML("beforeEnd",lineStr.join(""));

this.currentPath_=[];
};

contextPrototype.fill=function(){
this.stroke(true);
}

contextPrototype.closePath=function(){
this.currentPath_.push({type:"close"});
};


contextPrototype.getCoords_=function(aX,aY){
return{
x:Z*(aX*this.m_[0][0]+aY*this.m_[1][0]+this.m_[2][0])-Z2,
y:Z*(aX*this.m_[0][1]+aY*this.m_[1][1]+this.m_[2][1])-Z2
}
};

contextPrototype.save=function(){
var o={};
copyState(this,o);
this.aStack_.push(o);
this.mStack_.push(this.m_);
this.m_=matrixMultiply(createMatrixIdentity(),this.m_);
};

contextPrototype.restore=function(){
copyState(this.aStack_.pop(),this);
this.m_=this.mStack_.pop();
};

contextPrototype.translate=function(aX,aY){
var m1=[
[1,0,0],
[0,1,0],
[aX,aY,1]
];

this.m_=matrixMultiply(m1,this.m_);
};

contextPrototype.rotate=function(aRot){
var c=mc(aRot);
var s=ms(aRot);

var m1=[
[c,s,0],
[-s,c,0],
[0,0,1]
];

this.m_=matrixMultiply(m1,this.m_);
};

contextPrototype.scale=function(aX,aY){
this.arcScaleX_*=aX;
this.arcScaleY_*=aY;
var m1=[
[aX,0,0],
[0,aY,0],
[0,0,1]
];

this.m_=matrixMultiply(m1,this.m_);
};


contextPrototype.clip=function(){

};

contextPrototype.arcTo=function(){

};

contextPrototype.createPattern=function(){
return new CanvasPattern_;
};


function CanvasGradient_(aType){
this.type_=aType;
this.radius1_=0;
this.radius2_=0;
this.colors_=[];
this.focus_={x:0,y:0};
}

CanvasGradient_.prototype.addColorStop=function(aOffset,aColor){
aColor=processStyle(aColor);
this.colors_.push({offset:1-aOffset,color:aColor});
};

function CanvasPattern_(){}


G_vmlCanvasManager=G_vmlCanvasManager_;
CanvasRenderingContext2D=CanvasRenderingContext2D_;
CanvasGradient=CanvasGradient_;
CanvasPattern=CanvasPattern_;

})();

}


/* geometry.js */



Timeplot.DefaultValueGeometry=function(params){
if(!params)params={};
this._id=("id"in params)?params.id:"g"+Math.round(Math.random()*1000000);
this._axisColor=("axisColor"in params)?params.axisColor:new Timeplot.Color("#606060");
this._gridColor=("gridColor"in params)?params.gridColor:null;
this._gridLineWidth=("gridLineWidth"in params)?params.gridLineWidth:0.5;
this._axisLabelsPlacement=("axisLabelsPlacement"in params)?params.axisLabelsPlacement:null;
this._center=("center"in params)?params.center:30;
this._range=("range"in params)?params.range:20;
this._minValue=("min"in params)?params.min:null;
this._maxValue=("max"in params)?params.max:null;
this._linMap={
direct:function(v){
return v;
},
inverse:function(y){
return y;
}
}
this._map=this._linMap;
}

Timeplot.DefaultValueGeometry.prototype={

initialize:function(timeplot){
this._timeplot=timeplot;
this._canvas=timeplot.getCanvas();
},

setRange:function(range){
if((this._minValue==null)||((this._minValue!=null)&&(range.min<this._minValue))){
this._minValue=range.min;
}
if((this._maxValue==null)||((this._maxValue!=null)&&(range.max*1.05>this._maxValue))){
this._maxValue=range.max*1.05;
}

this._updateMappedValues();

if(this._minValue==0&&this._maxValue==0){
this._gridSpacing={y:0,value:0};
}else{
this._gridSpacing=this._calculateGridSpacing();
}
},

_updateMappedValues:function(){
this._valueRange=this._maxValue-this._minValue;
this._mappedRange=this._map.direct(this._valueRange);
},

_calculateGridSpacing:function(){
var v=this.fromScreen(this._center);
for(var i=1;i<10;i++){
var r=Timeplot.Math.round(v,i);
var y=this.toScreen(r);
if(this._center-this._range<y&&y<this._center+this._range){
return{
y:y,
value:r
}
}
}
return{
y:v,
value:this._center
}
},

toScreen:function(value){
if(this._maxValue){
var v=value-this._minValue;
return this._canvas.height*(this._map.direct(v))/this._mappedRange;
}else{
return 0;
}
},

fromScreen:function(y){
return this._map.inverse(this._mappedRange*y/this._canvas.height)+this._minValue;
},

paint:function(){
var ctx=this._canvas.getContext('2d');

var gradient=ctx.createLinearGradient(0,0,0,this._canvas.height);

ctx.strokeStyle=gradient;
ctx.lineWidth=this._gridLineWidth;
ctx.lineJoin='miter';


if(this._gridColor){
gradient.addColorStop(0,this._gridColor.toString());
gradient.addColorStop(1,"rgba(255,255,255,0.5)");

var y=this._gridSpacing.y;
var value=this._gridSpacing.value;
var counter=1;
while(y<this._canvas.height){
ctx.beginPath();
ctx.moveTo(0,y);
ctx.lineTo(this._canvas.width,y);
ctx.stroke();

if(this._axisLabelsPlacement=="right"){
this._timeplot.putText(value,"timeplot-grid-label",{
bottom:y,
right:2
});
}else if(this._axisLabelsPlacement=="left"){
this._timeplot.putText(value,"timeplot-grid-label",{
bottom:y,
left:2
});
}

y+=this._gridSpacing.y;
value+=this._gridSpacing.value;
counter++;
}
}


gradient.addColorStop(0,this._axisColor.toString());
gradient.addColorStop(1,"rgba(255,255,255,0.5)");

ctx.lineWidth=1;
gradient.addColorStop(0,this._axisColor.toString());

ctx.beginPath();
ctx.moveTo(0,this._canvas.height);
ctx.lineTo(0,0);
ctx.lineTo(this._canvas.width,0);
ctx.lineTo(this._canvas.width,this._canvas.height);
ctx.stroke();
}
}



Timeplot.LogarithmicValueGeometry=function(params){
Timeplot.DefaultValueGeometry.apply(this,arguments);
this._logMap={
direct:function(v){
return Math.log(v+1);
},
inverse:function(y){
return Math.exp(y)-1;
}
}
this._mode="log";
this._map=this._logMap;
};

Object.extend(Timeplot.LogarithmicValueGeometry.prototype,Timeplot.DefaultValueGeometry.prototype);

Timeplot.LogarithmicValueGeometry.prototype.actLinear=function(){
this._mode="lin";
this._map=this._linMap;
this._updateMappedValues();
}

Timeplot.LogarithmicValueGeometry.prototype.actLogarithmic=function(){
this._mode="log";
this._map=this._logMap;
this._updateMappedValues();
}

Timeplot.LogarithmicValueGeometry.prototype.toggle=function(){
if(this._mode=="log"){
this.actLinear();
}else{
this.actLogarithmic();
}
}



Timeplot.DefaultTimeGeometry=function(params){
if(!params)params={};
this._id=("id"in params)?params.id:"g"+Math.round(Math.random()*1000000);
this._axisColor=("axisColor"in params)?params.axisColor:new Timeplot.Color("#606060");
this._gridColor=("gridColor"in params)?params.gridColor:null;
this._min=("min"in params)?params.min:null;
this._max=("max"in params)?params.max:null;
this._linMap={
direct:function(t){
return t;
},
inverse:function(x){
return x;
}
}
this._map=this._linMap;
}

Timeplot.DefaultTimeGeometry.prototype={

initialize:function(timeplot){
this._timeplot=timeplot;
this._canvas=timeplot.getCanvas();
var dateParser=this._timeplot.getUnit().getParser("iso8601");
if(this._min&&!this._min.getTime){
this._min=dateParser(this._min);
}
if(this._max&&!this._max.getTime){
this._max=dateParser(this._max);
}
},

setRange:function(range){
if(this._min){
this._earliestDate=this._min;
}else if(range.earliestDate&&((this._earliestDate==null)||((this._earliestDate!=null)&&(range.earliestDate.getTime()<this._earliestDate.getTime())))){
this._earliestDate=range.earliestDate;
}

if(this._max){
this._latestDate=this._max;
}else if(range.latestDate&&((this._latestDate==null)||((this._latestDate!=null)&&(range.latestDate.getTime()>this._latestDate.getTime())))){
this._latestDate=range.latestDate;
}

if(!this._earliestDate&&!this._latestDate){
this._gridSpacing={y:0,value:0};
}else{
this._updateMappedValues();
this._gridSpacing=this._calculateGridSpacing();
}
},

_updateMappedValues:function(){
this._period=this._latestDate.getTime()-this._earliestDate.getTime();
this._mappedPeriod=this._map.direct(this._period);
},

_calculateGridSpacing:function(){

return{
y:0,
value:0
}
},

toScreen:function(time){
if(this._latestDate){
var t=time-this._earliestDate.getTime();
return this._canvas.width*this._map.direct(t)/this._mappedPeriod;
}else{
return 0;
}
},

fromScreen:function(x){
return this._map.inverse(this._mappedPeriod*x/this._canvas.width)+this._earliestDate.getTime();
},

getPeriod:function(){
return this._period;
},

paint:function(){
var ctx=this._canvas.getContext('2d');


}
}



Timeplot.MagnifyingTimeGeometry=function(params){
Timeplot.DefaultTimeGeometry.apply(this,arguments);

var g=this;
this._MagnifyingMap={
direct:function(t){
if(t<g._leftTimeMargin){
var x=t*g._leftRate;
}else if(g._leftTimeMargin<t&&t<g._rightTimeMargin){
var x=t*g._expandedRate+g._expandedTimeTranslation;
}else{
var x=t*g._rightRate+g._rightTimeTranslation;
}
return x;
},
inverse:function(x){
if(x<g._leftScreenMargin){
var t=x/g._leftRate;
}else if(g._leftScreenMargin<x&&x<g._rightScreenMargin){
var t=x/g._expandedRate+g._expandedScreenTranslation;
}else{
var t=x/g._rightRate+g._rightScreenTranslation;
}
return t;
}
}

this._mode="lin";
this._map=this._linMap;
};

Object.extend(Timeplot.MagnifyingTimeGeometry.prototype,Timeplot.DefaultTimeGeometry.prototype);

Timeplot.MagnifyingTimeGeometry.prototype.initialize=function(timeplot){
Timeplot.DefaultTimeGeometry.prototype.initialize.apply(this,arguments);

if(!this._lens){
this._lens=this._timeplot.putDiv("lens","timeplot-lens");
}

var period=1000*60*60*24*30;

var geometry=this;

var magnifyWith=function(lens){
var aperture=lens.clientWidth;
var loc=geometry._timeplot.locate(lens);
geometry.setMagnifyingParams(loc.x+aperture/2,aperture,period);
geometry.actMagnifying();
geometry._timeplot.paint();
}

var canvasMouseDown=function(elmt,evt,target){
geometry._canvas.startCoords=SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);
geometry._canvas.pressed=true;
}

var canvasMouseUp=function(elmt,evt,target){
geometry._canvas.pressed=false;
var coords=SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);
if(Timeplot.Math.isClose(coords,geometry._canvas.startCoords,5)){
geometry._lens.style.display="none";
geometry.actLinear();
geometry._timeplot.paint();
}else{
geometry._lens.style.cursor="move";
magnifyWith(geometry._lens);
}
}

var canvasMouseMove=function(elmt,evt,target){
if(geometry._canvas.pressed){
var coords=SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);
if(coords.x<0)coords.x=0;
if(coords.x>geometry._canvas.width)coords.x=geometry._canvas.width;
geometry._timeplot.placeDiv(geometry._lens,{
left:geometry._canvas.startCoords.x,
width:coords.x-geometry._canvas.startCoords.x,
bottom:0,
height:geometry._canvas.height,
display:"block"
});
}
}

var lensMouseDown=function(elmt,evt,target){
geometry._lens.startCoords=SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);;
geometry._lens.pressed=true;
}

var lensMouseUp=function(elmt,evt,target){
geometry._lens.pressed=false;
}

var lensMouseMove=function(elmt,evt,target){
if(geometry._lens.pressed){
var coords=SimileAjax.DOM.getEventRelativeCoordinates(evt,elmt);
var lens=geometry._lens;
var left=lens.offsetLeft+coords.x-lens.startCoords.x;
if(left<geometry._timeplot._paddingX)left=geometry._timeplot._paddingX;
if(left+lens.clientWidth>geometry._canvas.width-geometry._timeplot._paddingX)left=geometry._canvas.width-lens.clientWidth+geometry._timeplot._paddingX;
lens.style.left=left;
magnifyWith(lens);
}
}

if(!this._canvas.instrumented){
SimileAjax.DOM.registerEvent(this._canvas,"mousedown",canvasMouseDown);
SimileAjax.DOM.registerEvent(this._canvas,"mousemove",canvasMouseMove);
SimileAjax.DOM.registerEvent(this._canvas,"mouseup",canvasMouseUp);
SimileAjax.DOM.registerEvent(this._canvas,"mouseup",lensMouseUp);
this._canvas.instrumented=true;
}

if(!this._lens.instrumented){
SimileAjax.DOM.registerEvent(this._lens,"mousedown",lensMouseDown);
SimileAjax.DOM.registerEvent(this._lens,"mousemove",lensMouseMove);
SimileAjax.DOM.registerEvent(this._lens,"mouseup",lensMouseUp);
SimileAjax.DOM.registerEvent(this._lens,"mouseup",canvasMouseUp);
this._lens.instrumented=true;
}
}


Timeplot.MagnifyingTimeGeometry.prototype.setMagnifyingParams=function(c,a,b){
var a=a/2;
var b=b/2;

var w=this._canvas.width;
var d=this._period;

if(c<0)c=0;
if(c>w)c=w;

if(c-a<0)a=c;
if(c+a>w)a=w-c;

var ct=this.fromScreen(c)-this._earliestDate.getTime();
if(ct-b<0)b=ct;
if(ct+b>d)b=d-ct;

this._centerX=c;
this._centerTime=ct;
this._aperture=a;
this._aperturePeriod=b;

this._leftScreenMargin=this._centerX-this._aperture;
this._rightScreenMargin=this._centerX+this._aperture;
this._leftTimeMargin=this._centerTime-this._aperturePeriod;
this._rightTimeMargin=this._centerTime+this._aperturePeriod;

this._leftRate=(c-a)/(ct-b);
this._expandedRate=a/b;
this._rightRate=(w-c-a)/(d-ct-b);

this._expandedTimeTranslation=this._centerX-this._centerTime*this._expandedRate;
this._expandedScreenTranslation=this._centerTime-this._centerX/this._expandedRate;
this._rightTimeTranslation=(c+a)-(ct+b)*this._rightRate;
this._rightScreenTranslation=(ct+b)-(c+a)/this._rightRate;

this._updateMappedValues();
}

Timeplot.MagnifyingTimeGeometry.prototype.actLinear=function(){
this._mode="lin";
this._map=this._linMap;
this._updateMappedValues();
}

Timeplot.MagnifyingTimeGeometry.prototype.actMagnifying=function(){
this._mode="Magnifying";
this._map=this._MagnifyingMap;
this._updateMappedValues();
}

Timeplot.MagnifyingTimeGeometry.prototype.toggle=function(){
if(this._mode=="Magnifying"){
this.actLinear();
}else{
this.actMagnifying();
}
}



/* math.js */



Timeplot.Operator={

sum:function(data,params){
return Timeplot.Math.integral(data.values);
},

average:function(data,params){
var size=("size"in params)?params.size:30;
var result=Timeplot.Math.movingAverage(data.values,size);
return result;
}
}



Timeplot.Math={


range:function(f){
var F=f.length;
var min=Number.MAX_VALUE;
var max=Number.MIN_VALUE;

for(var t=0;t<F;t++){
var value=f[t];
if(value<min){
min=value;
}
if(value>max){
max=value;
}
}

return{
min:min,
max:max
}
},


movingAverage:function(f,size){
var F=f.length;
var g=new Array(F);
for(var n=0;n<F;n++){
var value=0;
for(var m=n-size;m<n+size;m++){
if(m<0){
var v=f[0];
}else if(m>=F){
var v=g[n-1];
}else{
var v=f[m];
}
value+=v;
}
g[n]=value/(2*size);
}
return g;
},


integral:function(f){
var F=f.length;

var g=new Array(F);
var sum=0;

for(var t=0;t<F;t++){
sum+=f[t];
g[t]=sum;
}

return g;
},


normalize:function(f){
var F=f.length;
var sum=0.0;

for(var t=0;t<F;t++){
sum+=f[t];
}

for(var t=0;t<F;t++){
f[t]/=sum;
}

return f;
},


convolution:function(f,g){
var F=f.length;
var G=g.length;

var c=new Array(F);

for(var m=0;m<F;m++){
var r=0;
var end=(m+G<F)?m+G:F;
for(var n=m;n<end;n++){
var a=f[n-G];
var b=g[n-m];
r+=a*b;
}
c[m]=r;
}

return c;
},







heavyside:function(size){
var f=new Array(size);
var value=1/size;
for(var t=0;t<size;t++){
f[t]=value;
}
return f;
},


gaussian:function(size,threshold){
with(Math){
var radius=size/2;
var variance=radius*radius/log(threshold);
var g=new Array(size);
for(var t=0;t<size;t++){
var l=t-radius;
g[t]=exp(-variance*l*l);
}
}

return this.normalize(g);
},




round:function(x,n){
with(Math){
if(abs(x)>1){
var l=floor(log(x)/log(10));
var d=round(exp((l-n+1)*log(10)));
var y=round(round(x/d)*d);
return y;
}else{
log("FIXME(SM): still to implement for 0 < abs(x) < 1");
return x;
}
}
},

tanh:function(x){
if(x>5){
return 1;
}else if(x<5){
return-1;
}else{
var expx2=Math.exp(2*x);
return(expx2-1)/(expx2+1);
}
},

isClose:function(a,b,value){
return(a&&b&&Math.abs(a.x-b.x)<value&&Math.abs(a.y-b.y)<value);
}

}

/* oop.js */

Object.extend=function(destination,source){
for(var property in source){
destination[property]=source[property];
}
return destination;
}


/* plot.js */



Timeplot.Plot=function(timeplot,plotInfo){
this._timeplot=timeplot;
this._canvas=timeplot.getCanvas();
this._plotInfo=plotInfo;
this._id=plotInfo.id;
this._timeGeometry=plotInfo.timeGeometry;
this._timeGeometry.initialize(timeplot);
this._valueGeometry=plotInfo.valueGeometry;
this._valueGeometry.initialize(timeplot);
this._locale=("locale"in plotInfo)?plotInfo.locale:SimileAjax.Platform.getDefaultLocale();
this._timeZone=("timeZone"in plotInfo)?plotInfo.timeZone:0;
this._labeller=("labeller"in plotInfo)?plotInfo.labeller:timeplot.getUnit().createLabeller(this._locale,this._timeZone);
this._showValues=plotInfo.showValues;
this._theme=new Timeline.getDefaultTheme();
this._dataSource=plotInfo.dataSource;
this._eventSource=plotInfo.eventSource;
this._bubble=null;
};

Timeplot.Plot.prototype={

initialize:function(){
if(this._showValues&&this._dataSource&&this._dataSource.getValue){
this._timeFlag=this._timeplot.putDiv("timeflag","timeplot-timeflag");
this._timeFlagTriangle=this._timeplot.putDiv("timeflagTriangle","timeplot-timeflag-triangle");
this._valueFlag=this._timeplot.putDiv(this._id+"valueflag","timeplot-valueflag");
this._valueFlagLine=this._timeplot.putDiv(this._id+"valueflagLine","timeplot-valueflag-line");
this._valueFlagPole=this._timeplot.putDiv(this._id+"valuepole","timeplot-valueflag-pole");

var plot=this;

var mouseOverHandler=function(elmt,evt,target){
plot._valueFlag.style.display="block";
mouseMoveHandler(elmt,evt,target);
}

var day=24*60*60*1000;
var month=30*day;

var mouseMoveHandler=function(elmt,evt,target){
if(typeof SimileAjax!="undefined"){
var coords=SimileAjax.DOM.getEventRelativeCoordinates(evt,plot._canvas);
if(coords.x>plot._canvas.width)coords.x=plot._canvas.width;
if(coords.x<0)coords.x=0;
var t=plot._timeGeometry.fromScreen(coords.x);
var v=plot._dataSource.getValue(t);
if(plot._plotInfo.roundValues)v=Math.round(v);
plot._valueFlag.innerHTML=new String(v);
var d=new Date(t);
var p=plot._timeGeometry.getPeriod();
if(p<day){
plot._timeFlag.innerHTML=d.toLocaleTimeString();
}else if(p>month){
plot._timeFlag.innerHTML=d.toLocaleDateString();
}else{
plot._timeFlag.innerHTML=d.toLocaleString();
}
var s=SimileAjax.DOM.getSize(plot._timeFlag);
var c=plot._canvas;
var y=plot._valueGeometry.toScreen(v);
var dh=Math.round(s.h/2);
var dw=Math.round(s.w/2);
plot._timeplot.placeDiv(plot._valueFlag,{
left:coords.x+13,
bottom:y+6,
display:"block"
});
plot._timeplot.placeDiv(plot._valueFlagLine,{
left:coords.x,
bottom:y,
display:"block"
});
plot._timeplot.placeDiv(plot._timeFlag,{
left:coords.x-dw,
top:plot._canvas.height+4,
display:"block"
});
plot._timeplot.placeDiv(plot._timeFlagTriangle,{
left:coords.x-4,
top:plot._canvas.height,
display:"block"
});
plot._timeplot.placeDiv(plot._valueFlagPole,{
left:coords.x,
bottom:0,
height:y,
display:"block"
});
}
}

var timeplotElement=this._timeplot.getElement();
SimileAjax.DOM.registerEvent(timeplotElement,"mouseover",mouseOverHandler);
SimileAjax.DOM.registerEvent(timeplotElement,"mousemove",mouseMoveHandler);
}
},

dispose:function(){
if(this._dataSource){
this._dataSource.removeListener(this._paintingListener);
this._paintingListener=null;
this._dataSource.dispose();
this._dataSource=null;
}
},

getDataSource:function(){
return(this._dataSource)?this._dataSource:this._eventSource;
},

getTimeGeometry:function(){
return this._timeGeometry;
},

getValueGeometry:function(){
return this._valueGeometry;
},

paint:function(){
var ctx=this._canvas.getContext('2d');

ctx.lineWidth=this._plotInfo.lineWidth;
ctx.lineJoin='miter';

if(this._dataSource){
if(this._plotInfo.fillColor){
var gradient=ctx.createLinearGradient(0,this._canvas.height,0,0);
gradient.addColorStop(0,this._plotInfo.fillColor.toString());
gradient.addColorStop(0.5,this._plotInfo.fillColor.toString());
gradient.addColorStop(1,'rgba(255,255,255,0)');

ctx.fillStyle=gradient;

ctx.beginPath();
ctx.moveTo(0,0);
this._plot(function(x,y){
ctx.lineTo(x,y);
});
ctx.lineTo(this._canvas.width,0);
ctx.fill();
}

if(this._plotInfo.lineColor){
ctx.strokeStyle=this._plotInfo.lineColor.toString();
ctx.beginPath();
this._plot(function(x,y){
ctx.lineTo(x,y);
});
ctx.stroke();
}

if(this._plotInfo.dotColor){
ctx.fillStyle=this._plotInfo.dotColor.toString();
var r=this._plotInfo.dotRadius;
this._plot(function(x,y){
ctx.beginPath();
ctx.arc(x,y,r,0,2*Math.PI,true);
ctx.fill();
});
}
}

if(this._eventSource){
var gradient=ctx.createLinearGradient(0,0,0,this._canvas.height);
gradient.addColorStop(1,'rgba(255,255,255,0)');

ctx.strokeStyle=gradient;
ctx.fillStyle=gradient;
ctx.lineWidth=this._plotInfo.eventLineWidth;
ctx.lineJoin='miter';

var i=this._eventSource.getAllEventIterator();
while(i.hasNext()){
var event=i.next();
var color=event.getColor();
color=(color)?new Timeplot.Color(color):this._plotInfo.lineColor;
var eventStart=event.getStart().getTime();
var eventEnd=event.getEnd().getTime();
if(eventStart==eventEnd){
var c=color.toString();
gradient.addColorStop(0,c);
var start=this._timeGeometry.toScreen(eventStart);
var end=start;
ctx.beginPath();
ctx.moveTo(start,0);
ctx.lineTo(start,this._canvas.height);
ctx.stroke();
var x=start-4;
var w=7;
}else{
var c=color.toString(0.5);
gradient.addColorStop(0,c);
var start=this._timeGeometry.toScreen(eventStart);
var end=this._timeGeometry.toScreen(eventEnd);
ctx.fillRect(start,0,end-start,this._canvas.height);
var x=start;
var w=end-start-1;
}

var div=this._timeplot.putDiv(event.getID(),"timeplot-event-box",{
left:Math.round(x),
width:Math.round(w),
top:0,
height:this._canvas.height-1
});

var plot=this;
var clickHandler=function(event){
return function(elmt,evt,target){
var doc=plot._timeplot.getDocument();
plot._closeBubble();
var coords=SimileAjax.DOM.getEventPageCoordinates(evt);
var elmtCoords=SimileAjax.DOM.getPageCoordinates(elmt);
plot._bubble=SimileAjax.Graphics.createBubbleForPoint(coords.x,elmtCoords.top+plot._canvas.height,plot._plotInfo.bubbleWidth,plot._plotInfo.bubbleHeight,"bottom");
event.fillInfoBubble(plot._bubble.content,plot._theme,plot._labeller);
}
};
var mouseOverHandler=function(elmt,evt,target){
elmt.oldClass=elmt.className;
elmt.className=elmt.className+" timeplot-event-box-highlight";
};
var mouseOutHandler=function(elmt,evt,target){
elmt.className=elmt.oldClass;
elmt.oldClass=null;
}

if(!div.instrumented){
SimileAjax.DOM.registerEvent(div,"click",clickHandler(event));
SimileAjax.DOM.registerEvent(div,"mouseover",mouseOverHandler);
SimileAjax.DOM.registerEvent(div,"mouseout",mouseOutHandler);
SimileAjax.DOM.registerEvent(div,"mousemove",mouseMoveHandler);
div.instrumented=true;
}
}
}
},

_plot:function(f){
var data=this._dataSource.getData();
if(data){
var times=data.times;
var values=data.values;
var T=times.length;
for(var t=0;t<T;t++){
f(this._timeGeometry.toScreen(times[t]),this._valueGeometry.toScreen(values[t]));
}
}
},

_closeBubble:function(){
if(this._bubble!=null){
this._bubble.close();
this._bubble=null;
}
}

}

/* processor.js */



Timeplot.Processor=function(dataSource,operator,params){
this._dataSource=dataSource;
this._operator=operator;
this._params=params;

this._data={
times:new Array(),
values:new Array()
};

this._range={
earliestDate:null,
latestDate:null,
min:0,
max:0
};

var processor=this;
this._processingListener={
onAddMany:function(){processor._process();},
onClear:function(){processor._clear();}
}
this.addListener(this._processingListener);
};

Timeplot.Processor.prototype={

_clear:function(){
this.removeListener(this._processingListener);
this._dataSource._clear();
},

_process:function(){




var data=this._dataSource.getData();
var range=this._dataSource.getRange();

var newValues=this._operator(data,this._params);
var newValueRange=Timeplot.Math.range(newValues);

this._data={
times:data.times,
values:newValues
};

this._range={
earliestDate:range.earliestDate,
latestDate:range.latestDate,
min:newValueRange.min,
max:newValueRange.max
};
},

getRange:function(){
return this._range;
},

getData:function(){
return this._data;
},

getValue:Timeplot.DataSource.prototype.getValue,

addListener:function(listener){
this._dataSource.addListener(listener);
},

removeListener:function(listener){
this._dataSource.removeListener(listener);
}
}


/* sources.js */



Timeplot.DefaultEventSource=function(eventIndex){
Timeline.DefaultEventSource.apply(this,arguments);
};

Object.extend(Timeplot.DefaultEventSource.prototype,Timeline.DefaultEventSource.prototype);

Timeplot.DefaultEventSource.prototype.loadText=function(text,separator,url,filter){

if(text==null){
return;
}

this._events.maxValues=new Array();
var base=this._getBaseURL(url);

var dateTimeFormat='iso8601';
var parseDateTimeFunction=this._events.getUnit().getParser(dateTimeFormat);

var data=this._parseText(text,separator);

var added=false;

if(filter){
data=filter(data);
}

if(data){
for(var i=0;i<data.length;i++){
var row=data[i];
if(row.length>1){
var evt=new Timeplot.DefaultEventSource.NumericEvent(
parseDateTimeFunction(row[0]),
row.slice(1)
);
this._events.add(evt);
added=true;
}
}
}

if(added){
this._fire("onAddMany",[]);
}
}


Timeplot.DefaultEventSource.prototype._parseText=function(text,separator){
text=text.replace(/\r\n?/g,"\n");
var pos=0;
var len=text.length;
var table=[];
while(pos<len){
var line=[];
if(text.charAt(pos)!='#'){
while(pos<len){
if(text.charAt(pos)=='"'){
var nextquote=text.indexOf('"',pos+1);
while(nextquote<len&&nextquote>-1){
if(text.charAt(nextquote+1)!='"'){
break;
}
nextquote=text.indexOf('"',nextquote+2);
}
if(nextquote<0){

}else if(text.charAt(nextquote+1)==separator){
var quoted=text.substr(pos+1,nextquote-pos-1);
quoted=quoted.replace(/""/g,'"');
line[line.length]=quoted;
pos=nextquote+2;
continue;
}else if(text.charAt(nextquote+1)=="\n"||
len==nextquote+1){
var quoted=text.substr(pos+1,nextquote-pos-1);
quoted=quoted.replace(/""/g,'"');
line[line.length]=quoted;
pos=nextquote+2;
break;
}else{

}
}
var nextseparator=text.indexOf(separator,pos);
var nextnline=text.indexOf("\n",pos);
if(nextnline<0)nextnline=len;
if(nextseparator>-1&&nextseparator<nextnline){
line[line.length]=text.substr(pos,nextseparator-pos);
pos=nextseparator+1;
}else{
line[line.length]=text.substr(pos,nextnline-pos);
pos=nextnline+1;
break;
}
}
}else{
var nextnline=text.indexOf("\n",pos);
pos=(nextnline>-1)?nextnline+1:cur;
}
if(line.length>0){
table[table.length]=line;
}
}
if(table.length<0)return;
return table;
}

Timeplot.DefaultEventSource.prototype.getRange=function(){
var earliestDate=this.getEarliestDate();
var latestDate=this.getLatestDate();
return{
earliestDate:(earliestDate)?earliestDate:null,
latestDate:(latestDate)?latestDate:null,
min:0,
max:0
};
}



Timeplot.DefaultEventSource.NumericEvent=function(time,values){
this._id="e"+Math.round(Math.random()*1000000);
this._time=time;
this._values=values;
};

Timeplot.DefaultEventSource.NumericEvent.prototype={
getID:function(){return this._id;},
getTime:function(){return this._time;},
getValues:function(){return this._values;},


getStart:function(){return this._time;},
getEnd:function(){return this._time;}
};



Timeplot.DataSource=function(eventSource){
this._eventSource=eventSource;
var source=this;
this._processingListener={
onAddMany:function(){source._process();},
onClear:function(){source._clear();}
}
this.addListener(this._processingListener);
this._listeners=[];
};

Timeplot.DataSource.prototype={

_clear:function(){
this._data=null;
this._range=null;
},

_process:function(){
this._data={
times:new Array(),
values:new Array()
};
this._range={
earliestDate:null,
latestDate:null,
min:0,
max:0
};
},

getRange:function(){
return this._range;
},

getData:function(){
return this._data;
},

getValue:function(t){
if(this._data){
for(var i=0;i<this._data.times.length;i++){
var l=this._data.times[i];
if(l>t){
return this._data.values[i];
}
}
}
return 0;
},

addListener:function(listener){
this._eventSource.addListener(listener);
},

removeListener:function(listener){
this._eventSource.removeListener(listener);
},

replaceListener:function(oldListener,newListener){
this.removeListener(oldListener);
this.addListener(newListener);
}

}




Timeplot.ColumnSource=function(eventSource,column){
Timeplot.DataSource.apply(this,arguments);
this._column=column-1;
};

Object.extend(Timeplot.ColumnSource.prototype,Timeplot.DataSource.prototype);

Timeplot.ColumnSource.prototype.dispose=function(){
this.removeListener(this._processingListener);
this._clear();
}

Timeplot.ColumnSource.prototype._process=function(){
var count=this._eventSource.getCount();
var times=new Array(count);
var values=new Array(count);
var min=Number.MAX_VALUE;
var max=Number.MIN_VALUE;
var i=0;

var iterator=this._eventSource.getAllEventIterator();
while(iterator.hasNext()){
var event=iterator.next();
var time=event.getTime();
times[i]=time;
var value=this._getValue(event);
if(!isNaN(value)){
if(value<min){
min=value;
}
if(value>max){
max=value;
}
values[i]=value;
}
i++;
}

this._data={
times:times,
values:values
};

this._range={
earliestDate:this._eventSource.getEarliestDate(),
latestDate:this._eventSource.getLatestDate(),
min:min,
max:max
};
}

Timeplot.ColumnSource.prototype._getValue=function(event){
return parseFloat(event.getValues()[this._column]);
}




Timeplot.ColumnDiffSource=function(eventSource,column1,column2){
Timeplot.ColumnSource.apply(this,arguments);
this._column2=column2-1;
};

Object.extend(Timeplot.ColumnDiffSource.prototype,Timeplot.ColumnSource.prototype);

Timeplot.ColumnDiffSource.prototype._getValue=function(event){
var a=parseFloat(event.getValues()[this._column]);
var b=parseFloat(event.getValues()[this._column2])
return a-b;
}
