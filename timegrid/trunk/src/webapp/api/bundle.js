

/* timegrid.js */



Timegrid.create=function(node,eventSource,layoutName,layoutParams){
return new Timegrid._Impl(node,eventSource,layoutName,layoutParams);
};

Timegrid.resize=function(){
for(var i in window.timegrids){
window.timegrids[i]._construct();
}
};

Timegrid.createFromDOM=function(elmt){
var config=Timegrid.getConfigFromDOM(elmt);
var eventSource=new Timegrid.DefaultEventSource();
var layoutNames=config.views.split(",");
var tg=Timegrid.create(elmt,eventSource,layoutNames,config);
var getExtension=function(s){
return s.split('.').pop().toLowerCase();
};
if(config.src){
switch(getExtension(config.src)){
case'xml':
tg.loadXML(config.src,function(xml,url){
eventSource.loadXML(xml,url);
});
break;
case'js':
tg.loadJSON(config.src,function(json,url){
eventSource.loadJSON(json,url);
});
break;
}
}
return tg;
};

Timegrid.getConfigFromDOM=function(elmt){
var config=$(elmt).attrs('tg');
config.scrollwidth=$.scrollWidth();
return config;
};

Timegrid.loadXML=function(url,f){
var fError=function(statusText,status,xmlhttp){
alert("Failed to load data XML from "+url+"\n"+statusText);
};
var fDone=function(xmlhttp){
var xml=xmlhttp.responseXML;
if(!xml.documentElement&&xmlhttp.responseStream){
xml.load(xmlhttp.responseStream);
}
f(xml,url);
};
SimileAjax.XmlHttp.get(url,fError,fDone);
};

Timegrid.loadJSON=function(url,f){
var fError=function(statusText,status,xmlhttp){
alert("Failed to load JSON data from "+url+"\n"+statusText);
};
var fDone=function(xmlhttp){
f(eval('('+xmlhttp.responseText+')'),url);
};
SimileAjax.XmlHttp.get(url,fError,fDone);
};

Timegrid._Impl=function(node,eventSource,layoutNames,layoutParams){
var tg=this;
this._container=node;
this._eventSource=eventSource;
this._layoutNames=layoutNames;
this._layoutParams=layoutParams;

if(this._eventSource){
this._eventListener={
onAddMany:function(){tg._onAddMany();},
onClear:function(){tg._onClear();}
}
this._eventSource.addListener(this._eventListener);
}
this._construct();
};

Timegrid._Impl.prototype.loadXML=function(url,f){
var tg=this;

var fError=function(statusText,status,xmlhttp){
alert("Failed to load data xml from "+url+"\n"+statusText);
tg.hideLoadingMessage();
};
var fDone=function(xmlhttp){
try{
var xml=xmlhttp.responseXML;
if(!xml.documentElement&&xmlhttp.responseStream){
xml.load(xmlhttp.responseStream);
}
f(xml,url);
}finally{
tg.hideLoadingMessage();
}
};
this.showLoadingMessage();
window.setTimeout(function(){
SimileAjax.XmlHttp.get(url,fError,fDone);
},0);
};

Timegrid._Impl.prototype.loadJSON=function(url,f){
var tg=this;
var fError=function(statusText,status,xmlhttp){
alert("Failed to load json data from "+url+"\n"+statusText);
tg.hideLoadingMessage();
};
var fDone=function(xmlhttp){
try{
f(eval('('+xmlhttp.responseText+')'),url);
}finally{
tg.hideLoadingMessage();
}
};
this.showLoadingMessage();
window.setTimeout(function(){SimileAjax.XmlHttp.get(url,fError,fDone);},0);
};

Timegrid._Impl.prototype._construct=function(){
var self=this;
this._layouts=$.map(this._layoutNames,function(s){
return Timegrid.LayoutFactory.createLayout(s,self._eventSource,
self._layoutParams);
});
this._panel=new Timegrid.Controls.Panel(this._layouts);
var container=this._container;
var doc=container.ownerDocument;

while(container.firstChild){
container.removeChild(container.firstChild);
}
$(container).addClass('timegrid-default');

var message=SimileAjax.Graphics.createMessageBubble(doc);
message.containerDiv.className="timegrid-message-container";
container.appendChild(message.containerDiv);

message.contentDiv.className="timegrid-message";
message.contentDiv.innerHTML="<img src='"+Timegrid.urlPrefix
+"images/progress-running.gif' /> Loading...";

this.showLoadingMessage=function(){$(message.containerDiv).show();};
this.hideLoadingMessage=function(){$(message.containerDiv).hide();};

this._panel.render(container);
};

Timegrid._Impl.prototype._onAddMany=function(){
this._construct();
};

Timegrid._Impl.prototype._onClear=function(){
this._construct();
};



/* date.js */




Date.dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


Date.abbrDayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];


Date.monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];


Date.abbrMonthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];


Date.firstDayOfWeek=0;


Date.format='dd/mm/yyyy';




(function(){


function add(name,method){
if(!Date.prototype[name]){
Date.prototype[name]=method;
}
};


add("isLeapYear",function(){
var y=this.getFullYear();
return(y%4==0&&y%100!=0)||y%400==0;
});


add("isWeekend",function(){
return this.getDay()==0||this.getDay()==6;
});


add("isWeekDay",function(){
return!this.isWeekend();
});


add("getDaysInMonth",function(){
return[31,(this.isLeapYear()?29:28),31,30,31,30,31,31,30,31,30,31][this.getMonth()];
});


add("getDayName",function(abbreviated){
return abbreviated?Date.abbrDayNames[this.getDay()]:Date.dayNames[this.getDay()];
});


add("getMonthName",function(abbreviated){
return abbreviated?Date.abbrMonthNames[this.getMonth()]:Date.monthNames[this.getMonth()];
});


add("getDayOfYear",function(){
var tmpdtm=new Date("1/1/"+this.getFullYear());
return Math.floor((this.getTime()-tmpdtm.getTime())/86400000);
});


add("getWeekOfYear",function(){
dowOffset=Date.firstDayOfWeek;
var newYear=new Date(this.getFullYear(),0,1);
var day=newYear.getDay()-dowOffset;
day=(day>=0?day:day+7);
var daynum=Math.floor((this.getTime()-newYear.getTime()-
(this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000)+1;
var weeknum;

if(day<4){
weeknum=Math.floor((daynum+day-1)/7)+1;
if(weeknum>52){
nYear=new Date(this.getFullYear()+1,0,1);
nday=nYear.getDay()-dowOffset;
nday=nday>=0?nday:nday+7;

weeknum=nday<4?1:53;
}
}else{
weeknum=Math.floor((daynum+day-1)/7);
}
return weeknum;
});


add("setDayOfYear",function(day){
this.setMonth(0);
this.setDate(day);
return this;
});


add("addYears",function(num){
this.setFullYear(this.getFullYear()+num);
return this;
});


add("addMonths",function(num){
var tmpdtm=this.getDate();

this.setMonth(this.getMonth()+num);

if(tmpdtm>this.getDate())
this.addDays(-this.getDate());

return this;
});


add("addDays",function(num){
this.setDate(this.getDate()+num);
return this;
});


add("addHours",function(num){
this.setHours(this.getHours()+num);
return this;
});


add("addMinutes",function(num){
this.setMinutes(this.getMinutes()+num);
return this;
});


add("addSeconds",function(num){
this.setSeconds(this.getSeconds()+num);
return this;
});




add("zeroTime",function(){
this.setMilliseconds(0);
this.setSeconds(0);
this.setMinutes(0);
this.setHours(0);
return this;
});


add("asString",function(){
var r=Date.format;
return r
.split('yyyy').join(this.getFullYear())
.split('yy').join(this.getYear())
.split('mmm').join(this.getMonthName(true))
.split('mm').join(_zeroPad(this.getMonth()+1))
.split('dd').join(_zeroPad(this.getDate()));
});


Date.fromString=function(s)
{
var f=Date.format;
var d=new Date('01/01/1977');
var iY=f.indexOf('yyyy');
if(iY>-1){
d.setFullYear(Number(s.substr(iY,4)));
}else{

d.setYear(Number(s.substr(f.indexOf('yy'),2)));
}
var iM=f.indexOf('mmm');
if(iM>-1){
var mStr=s.substr(iM,3);
for(var i=0;i<Date.abbrMonthNames.length;i++){
if(Date.abbrMonthNames[i]==mStr)break;
}
d.setMonth(i);
}else{
d.setMonth(Number(s.substr(f.indexOf('mm'),2))-1);
}
d.setDate(Number(s.substr(f.indexOf('dd'),2)));
if(isNaN(d.getTime()))return false;
return d;
}


var _zeroPad=function(num){
var s='0'+num;
return s.substring(s.length-2)

};

})();

/* debug.js */



Timegrid.Debug=new Object();

Timegrid.Debug.log=function(msg){
};

Timegrid.Debug.exception=function(e){
alert("Caught exception: "+(SimileAjax.Platform.isIE?e.message:e));
};



/* excanvas.pack.js */

if(!window.CanvasRenderingContext2D){(function(){var I=Math,i=I.round,L=I.sin,M=I.cos,m=10,A=m/2,Q={init:function(a){var b=a||document;if(/MSIE/.test(navigator.userAgent)&&!window.opera){var c=this;b.attachEvent("onreadystatechange",function(){c.r(b)})}},r:function(a){if(a.readyState=="complete"){if(!a.namespaces["s"]){a.namespaces.add("g_vml_","urn:schemas-microsoft-com:vml")}var b=a.createStyleSheet();b.cssText="canvas{display:inline-block;overflow:hidden;text-align:left;width:300px;height:150px}g_vml_\\:*{behavior:url(#default#VML)}";
var c=a.getElementsByTagName("canvas");for(var d=0;d<c.length;d++){if(!c[d].getContext){this.initElement(c[d])}}}},q:function(a){var b=a.outerHTML,c=a.ownerDocument.createElement(b);if(b.slice(-2)!="/>"){var d="/"+a.tagName,e;while((e=a.nextSibling)&&e.tagName!=d){e.removeNode()}if(e){e.removeNode()}}a.parentNode.replaceChild(c,a);return c},initElement:function(a){a=this.q(a);a.getContext=function(){if(this.l){return this.l}return this.l=new K(this)};a.attachEvent("onpropertychange",V);a.attachEvent("onresize",
W);var b=a.attributes;if(b.width&&b.width.specified){a.style.width=b.width.nodeValue+"px"}else{a.width=a.clientWidth}if(b.height&&b.height.specified){a.style.height=b.height.nodeValue+"px"}else{a.height=a.clientHeight}return a}};function V(a){var b=a.srcElement;switch(a.propertyName){case"width":b.style.width=b.attributes.width.nodeValue+"px";b.getContext().clearRect();break;case"height":b.style.height=b.attributes.height.nodeValue+"px";b.getContext().clearRect();break}}function W(a){var b=a.srcElement;
if(b.firstChild){b.firstChild.style.width=b.clientWidth+"px";b.firstChild.style.height=b.clientHeight+"px"}}Q.init();var R=[];for(var E=0;E<16;E++){for(var F=0;F<16;F++){R[E*16+F]=E.toString(16)+F.toString(16)}}function J(){return[[1,0,0],[0,1,0],[0,0,1]]}function G(a,b){var c=J();for(var d=0;d<3;d++){for(var e=0;e<3;e++){var g=0;for(var h=0;h<3;h++){g+=a[d][h]*b[h][e]}c[d][e]=g}}return c}function N(a,b){b.fillStyle=a.fillStyle;b.lineCap=a.lineCap;b.lineJoin=a.lineJoin;b.lineWidth=a.lineWidth;b.miterLimit=
a.miterLimit;b.shadowBlur=a.shadowBlur;b.shadowColor=a.shadowColor;b.shadowOffsetX=a.shadowOffsetX;b.shadowOffsetY=a.shadowOffsetY;b.strokeStyle=a.strokeStyle;b.d=a.d;b.e=a.e}function O(a){var b,c=1;a=String(a);if(a.substring(0,3)=="rgb"){var d=a.indexOf("(",3),e=a.indexOf(")",d+1),g=a.substring(d+1,e).split(",");b="#";for(var h=0;h<3;h++){b+=R[Number(g[h])]}if(g.length==4&&a.substr(3,1)=="a"){c=g[3]}}else{b=a}return[b,c]}function S(a){switch(a){case"butt":return"flat";case"round":return"round";
case"square":default:return"square"}}function K(a){this.a=J();this.m=[];this.k=[];this.c=[];this.strokeStyle="#000";this.fillStyle="#000";this.lineWidth=1;this.lineJoin="miter";this.lineCap="butt";this.miterLimit=m*1;this.globalAlpha=1;this.canvas=a;var b=a.ownerDocument.createElement("div");b.style.width=a.clientWidth+"px";b.style.height=a.clientHeight+"px";b.style.overflow="hidden";b.style.position="absolute";a.appendChild(b);this.j=b;this.d=1;this.e=1}var j=K.prototype;j.clearRect=function(){this.j.innerHTML=
"";this.c=[]};j.beginPath=function(){this.c=[]};j.moveTo=function(a,b){this.c.push({type:"moveTo",x:a,y:b});this.f=a;this.g=b};j.lineTo=function(a,b){this.c.push({type:"lineTo",x:a,y:b});this.f=a;this.g=b};j.bezierCurveTo=function(a,b,c,d,e,g){this.c.push({type:"bezierCurveTo",cp1x:a,cp1y:b,cp2x:c,cp2y:d,x:e,y:g});this.f=e;this.g=g};j.quadraticCurveTo=function(a,b,c,d){var e=this.f+0.6666666666666666*(a-this.f),g=this.g+0.6666666666666666*(b-this.g),h=e+(c-this.f)/3,l=g+(d-this.g)/3;this.bezierCurveTo(e,
g,h,l,c,d)};j.arc=function(a,b,c,d,e,g){c*=m;var h=g?"at":"wa",l=a+M(d)*c-A,n=b+L(d)*c-A,o=a+M(e)*c-A,f=b+L(e)*c-A;if(l==o&&!g){l+=0.125}this.c.push({type:h,x:a,y:b,radius:c,xStart:l,yStart:n,xEnd:o,yEnd:f})};j.rect=function(a,b,c,d){this.moveTo(a,b);this.lineTo(a+c,b);this.lineTo(a+c,b+d);this.lineTo(a,b+d);this.closePath()};j.strokeRect=function(a,b,c,d){this.beginPath();this.moveTo(a,b);this.lineTo(a+c,b);this.lineTo(a+c,b+d);this.lineTo(a,b+d);this.closePath();this.stroke()};j.fillRect=function(a,
b,c,d){this.beginPath();this.moveTo(a,b);this.lineTo(a+c,b);this.lineTo(a+c,b+d);this.lineTo(a,b+d);this.closePath();this.fill()};j.createLinearGradient=function(a,b,c,d){var e=new H("gradient");return e};j.createRadialGradient=function(a,b,c,d,e,g){var h=new H("gradientradial");h.n=c;h.o=g;h.i.x=a;h.i.y=b;return h};j.drawImage=function(a,b){var c,d,e,g,h,l,n,o,f=a.runtimeStyle.width,k=a.runtimeStyle.height;a.runtimeStyle.width="auto";a.runtimeStyle.height="auto";var q=a.width,r=a.height;a.runtimeStyle.width=
f;a.runtimeStyle.height=k;if(arguments.length==3){c=arguments[1];d=arguments[2];h=(l=0);n=(e=q);o=(g=r)}else if(arguments.length==5){c=arguments[1];d=arguments[2];e=arguments[3];g=arguments[4];h=(l=0);n=q;o=r}else if(arguments.length==9){h=arguments[1];l=arguments[2];n=arguments[3];o=arguments[4];c=arguments[5];d=arguments[6];e=arguments[7];g=arguments[8]}else{throw"Invalid number of arguments";}var s=this.b(c,d),t=[],v=10,w=10;t.push(" <g_vml_:group",' coordsize="',m*v,",",m*w,'"',' coordorigin="0,0"',
' style="width:',v,";height:",w,";position:absolute;");if(this.a[0][0]!=1||this.a[0][1]){var x=[];x.push("M11='",this.a[0][0],"',","M12='",this.a[1][0],"',","M21='",this.a[0][1],"',","M22='",this.a[1][1],"',","Dx='",i(s.x/m),"',","Dy='",i(s.y/m),"'");var p=s,y=this.b(c+e,d),z=this.b(c,d+g),B=this.b(c+e,d+g);p.x=Math.max(p.x,y.x,z.x,B.x);p.y=Math.max(p.y,y.y,z.y,B.y);t.push("padding:0 ",i(p.x/m),"px ",i(p.y/m),"px 0;filter:progid:DXImageTransform.Microsoft.Matrix(",x.join(""),", sizingmethod='clip');")}else{t.push("top:",
i(s.y/m),"px;left:",i(s.x/m),"px;")}t.push(' ">','<g_vml_:image src="',a.src,'"',' style="width:',m*e,";"," height:",m*g,';"',' cropleft="',h/q,'"',' croptop="',l/r,'"',' cropright="',(q-h-n)/q,'"',' cropbottom="',(r-l-o)/r,'"'," />","</g_vml_:group>");this.j.insertAdjacentHTML("BeforeEnd",t.join(""))};j.stroke=function(a){var b=[],c=O(a?this.fillStyle:this.strokeStyle),d=c[0],e=c[1]*this.globalAlpha,g=10,h=10;b.push("<g_vml_:shape",' fillcolor="',d,'"',' filled="',Boolean(a),'"',' style="position:absolute;width:',
g,";height:",h,';"',' coordorigin="0 0" coordsize="',m*g," ",m*h,'"',' stroked="',!a,'"',' strokeweight="',this.lineWidth,'"',' strokecolor="',d,'"',' path="');var l={x:null,y:null},n={x:null,y:null};for(var o=0;o<this.c.length;o++){var f=this.c[o];if(f.type=="moveTo"){b.push(" m ");var k=this.b(f.x,f.y);b.push(i(k.x),",",i(k.y))}else if(f.type=="lineTo"){b.push(" l ");var k=this.b(f.x,f.y);b.push(i(k.x),",",i(k.y))}else if(f.type=="close"){b.push(" x ")}else if(f.type=="bezierCurveTo"){b.push(" c ");
var k=this.b(f.x,f.y),q=this.b(f.cp1x,f.cp1y),r=this.b(f.cp2x,f.cp2y);b.push(i(q.x),",",i(q.y),",",i(r.x),",",i(r.y),",",i(k.x),",",i(k.y))}else if(f.type=="at"||f.type=="wa"){b.push(" ",f.type," ");var k=this.b(f.x,f.y),s=this.b(f.xStart,f.yStart),t=this.b(f.xEnd,f.yEnd);b.push(i(k.x-this.d*f.radius),",",i(k.y-this.e*f.radius)," ",i(k.x+this.d*f.radius),",",i(k.y+this.e*f.radius)," ",i(s.x),",",i(s.y)," ",i(t.x),",",i(t.y))}if(k){if(l.x==null||k.x<l.x){l.x=k.x}if(n.x==null||k.x>n.x){n.x=k.x}if(l.y==
null||k.y<l.y){l.y=k.y}if(n.y==null||k.y>n.y){n.y=k.y}}}b.push(' ">');if(typeof this.fillStyle=="object"){var v={x:"50%",y:"50%"},w=n.x-l.x,x=n.y-l.y,p=w>x?w:x;v.x=i(this.fillStyle.i.x/w*100+50)+"%";v.y=i(this.fillStyle.i.y/x*100+50)+"%";var y=[];if(this.fillStyle.p=="gradientradial"){var z=this.fillStyle.n/p*100,B=this.fillStyle.o/p*100-z}else{var z=0,B=100}var C={offset:null,color:null},D={offset:null,color:null};this.fillStyle.h.sort(function(T,U){return T.offset-U.offset});for(var o=0;o<this.fillStyle.h.length;o++){var u=
this.fillStyle.h[o];y.push(u.offset*B+z,"% ",u.color,",");if(u.offset>C.offset||C.offset==null){C.offset=u.offset;C.color=u.color}if(u.offset<D.offset||D.offset==null){D.offset=u.offset;D.color=u.color}}y.pop();b.push("<g_vml_:fill",' color="',D.color,'"',' color2="',C.color,'"',' type="',this.fillStyle.p,'"',' focusposition="',v.x,", ",v.y,'"',' colors="',y.join(""),'"',' opacity="',e,'" />')}else if(a){b.push('<g_vml_:fill color="',d,'" opacity="',e,'" />')}else{b.push("<g_vml_:stroke",' opacity="',
e,'"',' joinstyle="',this.lineJoin,'"',' miterlimit="',this.miterLimit,'"',' endcap="',S(this.lineCap),'"',' weight="',this.lineWidth,'px"',' color="',d,'" />')}b.push("</g_vml_:shape>");this.j.insertAdjacentHTML("beforeEnd",b.join(""));this.c=[]};j.fill=function(){this.stroke(true)};j.closePath=function(){this.c.push({type:"close"})};j.b=function(a,b){return{x:m*(a*this.a[0][0]+b*this.a[1][0]+this.a[2][0])-A,y:m*(a*this.a[0][1]+b*this.a[1][1]+this.a[2][1])-A}};j.save=function(){var a={};N(this,a);
this.k.push(a);this.m.push(this.a);this.a=G(J(),this.a)};j.restore=function(){N(this.k.pop(),this);this.a=this.m.pop()};j.translate=function(a,b){var c=[[1,0,0],[0,1,0],[a,b,1]];this.a=G(c,this.a)};j.rotate=function(a){var b=M(a),c=L(a),d=[[b,c,0],[-c,b,0],[0,0,1]];this.a=G(d,this.a)};j.scale=function(a,b){this.d*=a;this.e*=b;var c=[[a,0,0],[0,b,0],[0,0,1]];this.a=G(c,this.a)};j.clip=function(){};j.arcTo=function(){};j.createPattern=function(){return new P};function H(a){this.p=a;this.n=0;this.o=
0;this.h=[];this.i={x:0,y:0}}H.prototype.addColorStop=function(a,b){b=O(b);this.h.push({offset:1-a,color:b})};function P(){}G_vmlCanvasManager=Q;CanvasRenderingContext2D=K;CanvasGradient=H;CanvasPattern=P})()};


/* jquery.corner.js */







(function($){



var _corner=function(options){





var testcanvas=document.createElement("canvas");

if(typeof G_vmlCanvasManager=='undefined'&&$.browser.msie){

return this.each(function(){});

}





var asNum=function(a,b){return a-b;};

var getMin=function(a){

var b=a.concat();

return b.sort(asNum)[0];

};





var getCSSint=function(el,prop){

return parseInt($.css(el.jquery?el[0]:el,prop))||0;

};





var drawRoundCornerCanvasShape=function(canvas,radius,r_type,bg_color,border_width,border_color){





var reg=/^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;

var bits=reg.exec(bg_color);

if(bits){

channels=new Array(parseInt(bits[1]),parseInt(bits[2]),parseInt(bits[3]));

bg_color='rgb('+channels[0]+', '+channels[1]+', '+channels[2]+')';

}



var border_width=parseInt(border_width);



var ctx=canvas.getContext('2d');



if(radius==1){

ctx.fillStyle=bg_color;

ctx.fillRect(0,0,1,1);

return;

}



if(r_type=='tl'){

var steps=new Array(0,0,radius,0,radius,0,0,radius,0,0);

}else if(r_type=='tr'){

var steps=new Array(radius,0,radius,radius,radius,0,0,0,0,0);

}else if(r_type=='bl'){

var steps=new Array(0,radius,radius,radius,0,radius,0,0,0,radius);

}else if(r_type=='br'){

var steps=new Array(radius,radius,radius,0,radius,0,0,radius,radius,radius);

}



ctx.fillStyle=bg_color;

ctx.beginPath();

ctx.moveTo(steps[0],steps[1]);

ctx.lineTo(steps[2],steps[3]);

if(r_type=='br')ctx.bezierCurveTo(steps[4],steps[5],radius,radius,steps[6],steps[7]);

else ctx.bezierCurveTo(steps[4],steps[5],0,0,steps[6],steps[7]);

ctx.lineTo(steps[8],steps[9]);

ctx.fill();





if(border_width>0&&border_width<radius){





var offset=border_width/2;



if(r_type=='tl'){

var steps=new Array(radius-offset,offset,radius-offset,offset,offset,radius-offset);

var curve_to=new Array(0,0);

}else if(r_type=='tr'){

var steps=new Array(radius-offset,radius-offset,radius-offset,offset,offset,offset);

var curve_to=new Array(0,0);

}else if(r_type=='bl'){

var steps=new Array(radius-offset,radius-offset,offset,radius-offset,offset,offset,offset,radius-offset);

var curve_to=new Array(0,0);

}else if(r_type=='br'){

var steps=new Array(radius-offset,offset,radius-offset,offset,offset,radius-offset,radius-offset,radius-offset);

var curve_to=new Array(radius,radius);

}



ctx.strokeStyle=border_color;

ctx.lineWidth=border_width;

ctx.beginPath();



ctx.moveTo(steps[0],steps[1]);



ctx.bezierCurveTo(steps[2],steps[3],curve_to[0],curve_to[1],steps[4],steps[5]);

ctx.stroke();



}

};



var creatCanvas=function(p,radius){

var elm=document.createElement('canvas');

elm.setAttribute("height",radius);

elm.setAttribute("width",radius);

elm.style.display="block";

elm.style.position="absolute";

elm.className="cornercanvas";

elm=p.appendChild(elm);



if(!elm.getContext&&typeof G_vmlCanvasManager!='undefined'){

var elm=G_vmlCanvasManager.initElement(elm);

}

return elm;

};





var o=(options||"").toLowerCase();

var radius=parseInt((o.match(/(\d+)px/)||[])[1])||null;

var bg_color=((o.match(/(#[0-9a-f]+)/)||[])[1]);

if(radius==null){radius="auto";}



var edges={T:0,B:1};

var opts={

tl:/top|tl/.test(o),

tr:/top|tr/.test(o),

bl:/bottom|bl/.test(o),

br:/bottom|br/.test(o)

};

if(!opts.tl&&!opts.tr&&!opts.bl&&!opts.br){

opts={tl:1,tr:1,bl:1,br:1};

}



return this.each(function(){



var elm=$(this);





if($.browser.msie){this.style.zoom=1;}





var widthheight_smallest=getMin(new Array(getCSSint(this,'height'),getCSSint(this,'width')));

if(radius=="auto"){

radius=widthheight_smallest/4;

if(radius>10){radius=10;}

}





if(widthheight_smallest<radius){

radius=(widthheight_smallest/2);

}





elm.children("canvas.cornercanvas").remove();





if(elm.css('position')=='static'){

elm.css('position','relative');



}else if(elm.css('position')=='fixed'&&$.browser.msie&&!(document.compatMode=='CSS1Compat'&&typeof document.body.style.maxHeight!="undefined")){

elm.css('position','absolute');

}

elm.css('overflow','visible');





var border_t=getCSSint(this,'borderTopWidth');

var border_r=getCSSint(this,'borderRightWidth');

var border_b=getCSSint(this,'borderBottomWidth');

var border_l=getCSSint(this,'borderLeftWidth');





var bordersWidth=new Array();

if(opts.tl||opts.tr){bordersWidth.push(border_t);}

if(opts.br||opts.tr){bordersWidth.push(border_r);}

if(opts.br||opts.bl){bordersWidth.push(border_b);}

if(opts.bl||opts.tl){bordersWidth.push(border_l);}



borderswidth_smallest=getMin(bordersWidth);





var p_top=0-border_t;

var p_right=0-border_r;

var p_bottom=0-border_b;

var p_left=0-border_l;



if(opts.tl){var tl=$(creatCanvas(this,radius)).css({left:p_left,top:p_top}).get(0);}

if(opts.tr){var tr=$(creatCanvas(this,radius)).css({right:p_right,top:p_top}).get(0);}

if(opts.bl){var bl=$(creatCanvas(this,radius)).css({left:p_left,bottom:p_bottom}).get(0);}

if(opts.br){var br=$(creatCanvas(this,radius)).css({right:p_right,bottom:p_bottom}).get(0);}







if(bg_color==undefined){



var current_p=elm.parent();

var bg=current_p.css('background-color');

while((bg=="transparent"||bg=="rgba(0, 0, 0, 0)")&&current_p.get(0).tagName.toLowerCase()!="html"){

bg=current_p.css('background-color');

current_p=current_p.parent();

}

}else{

bg=bg_color;

}



if(bg=="transparent"||bg=="rgba(0, 0, 0, 0)"){bg="#ffffff";}



if(opts.tl){drawRoundCornerCanvasShape(tl,radius,'tl',bg,borderswidth_smallest,elm.css('borderTopColor'));}

if(opts.tr){drawRoundCornerCanvasShape(tr,radius,'tr',bg,borderswidth_smallest,elm.css('borderTopColor'));}

if(opts.bl){drawRoundCornerCanvasShape(bl,radius,'bl',bg,borderswidth_smallest,elm.css('borderBottomColor'));}

if(opts.br){drawRoundCornerCanvasShape(br,radius,'br',bg,borderswidth_smallest,elm.css('borderBottomColor'));}



elm.addClass('roundCornersParent');



});

};



if($.browser.msie&&typeof G_vmlCanvasManager=='undefined'){



var corner_buffer=new Array();

var corner_buffer_args=new Array();



$.fn.corner=function(options){

corner_buffer[corner_buffer.length]=this;

corner_buffer_args[corner_buffer_args.length]=options;

return this.each(function(){});

};





document.execCommand("BackgroundImageCache",false,true);

var elm=$("script[@src*=jquery.corner.]");

if(elm.length==1){

var jc_src=elm.attr('src');

var pathArray=jc_src.split('/');

pathArray.pop();

var base=pathArray.join('/')||'.';

var excanvasjs=base+'/excanvas.pack.js';

$.getScript(excanvasjs,function(){

execbuffer();

});

}



var execbuffer=function(){



$.fn.corner=_corner;



for(var i=0;i<corner_buffer.length;i++){

corner_buffer[i].corner(corner_buffer_args[i]);

}

corner_buffer=null;

corner_buffer_args=null;

}



}else{

$.fn.corner=_corner;

}



})(jQuery);



/* jquery.simile.js */





jQuery.extend({



capitalize:function(s){

return s.charAt(0).toUpperCase()+s.substring(1).toLowerCase();

},



inherit:function(subclass,superclass){

function Dummy(){};

Dummy.prototype=superclass.prototype;

subclass.prototype=new Dummy();

subclass.prototype.constructor=subclass;

subclass.superclass=superclass;

subclass.superproto=superclass.prototype;

},



scrollWidth:function(){

var scr=null;

var inn=null;

var wNoScroll=0;

var wScroll=0;





scr=document.createElement('div');

scr.style.position='absolute';

scr.style.top='-1000px';

scr.style.left='-1000px';

scr.style.width='100px';

scr.style.height='50px';



scr.style.overflow='hidden';





inn=document.createElement('div');

inn.style.width='100%';

inn.style.height='200px';





scr.appendChild(inn);



document.body.appendChild(scr);





wNoScroll=inn.offsetWidth;



scr.style.overflow='auto';



wScroll=inn.offsetWidth;





document.body.removeChild(

document.body.lastChild);







return(wNoScroll-wScroll)||17;

}

});



jQuery.fn.extend({



attrs:function(ns){



if(!this.__namespaceRegexps){

this.__namespaceRegexps={};

}

var regexp=this.__namespaceRegexps[ns];

if(!regexp){

this.__namespaceRegexps[ns]=regexp=

ns?eval("/^"+ns+":(.+)/"):/^([^:]*)$/;

}

var result={};

this.each(function(){



var atts=this.attributes;

var l=atts.length;

for(var i=0;i<l;i++){

var m=atts[i].name.match(regexp);

if(m){result[m[1]]=atts[i].value;}

}

});

return result;

}

});



/* util.js */





Timegrid.abstract=function(name){

return function(){

throw"A "+name+" method has not been implemented!";

return;

};

};



SimileAjax.DateTime.Interval=function(ms){



var SECONDS_CF=1000;

var MINUTES_CF=60000;

var HOURS_CF=3600000;

var DAYS_CF=86400000;

var WEEKS_CF=604800000;

var FORTNIGHTS_CF=1209600000;

var MONTHS_CF=2592000000;

var QUARTERS_CF=7776000000;

var YEARS_CF=31557600000;

var DECADES_CF=315576000000;

var CENTURIES_CF=3155760000000;



this.milliseconds=Math.abs(ms);

this.seconds=Math.round(this.milliseconds/SECONDS_CF);

this.minutes=Math.round(this.milliseconds/MINUTES_CF);

this.hours=Math.round(this.milliseconds/HOURS_CF);

this.days=Math.floor(this.milliseconds/DAYS_CF);

this.weeks=Math.round(this.milliseconds/WEEKS_CF);

this.fortnights=Math.round(this.milliseconds/FORTNIGHTS_CF);

this.months=Math.round(this.milliseconds/MONTHS_CF);



this.quarters=Math.round(this.milliseconds/QUARTERS_CF);



this.years=Math.round(this.milliseconds/YEARS_CF);



this.decades=Math.round(this.milliseconds/DECADES_CF);



this.centuries=Math.round(this.milliseconds/CENTURIES_CF);



};



SimileAjax.DateTime.Interval.prototype.toString=function(){

return this.milliseconds.toString();

};



/* config.js */



/* controls.js */





Timegrid.Controls={};





Timegrid.Controls.Panel=function(layouts,params){

this._layouts=layouts;

};



Timegrid.Controls.Panel.prototype.render=function(container){

var first=true;

var titles=$.map(this._layouts,function(l){return l.title;});

var tabSet=new Timegrid.Controls.TabSet(titles,this._layouts);

tabSet.render(container);

tabSet.switchTo(titles[0]);

};





Timegrid.Controls.TabSet=function(titles,layouts){

this._layoutMap={};

for(i in titles){

this._layoutMap[titles[i]]=layouts[i];

}

this._tabs={};

this._renderedLayouts={};

this._iterators={};

this.current="";

};



Timegrid.Controls.TabSet.prototype.render=function(container){

this._container=container;

var self=this;

var tabDiv=$('<div></div>').addClass('timegrid-tabs');

$(container).prepend(tabDiv);

var makeCallback=function(title){

return function(){self.switchTo(title);};

};

for(title in this._layoutMap){

var tab=$('<span><a href="javascript:void">'+title+'</a></span>')

.click(makeCallback(title))

.addClass('timegrid-tab');

tabDiv.append(tab);

this._tabs[title]=tab;

}

if(!$.browser.msie){$('.timegrid-tab').corner("30px top");}

};



Timegrid.Controls.TabSet.prototype.switchTo=function(title){

if(this.current){

this._renderedLayouts[this.current].hide();

this._tabs[this.current].removeClass('timegrid-tab-active');

}

if(this._renderedLayouts[title]){

this._renderedLayouts[title].show();

}else if(this._layoutMap[title]){

this._renderedLayouts[title]=$(this._layoutMap[title].render(this._container)).show();

}

if(this._iDiv){

this._iDiv.empty();

}

if(this._layoutMap[title].iterable){

if(!this._iterators[title]){

this._iterators[title]=new Timegrid.Controls.Iterator(this._layoutMap[title]);

this._iDiv=$(this._iterators[title].render(this._container));

}else{

this._iDiv=$(this._iterators[title].render());

}

}

this.current=title;

this._tabs[this.current].addClass('timegrid-tab-active');

};





Timegrid.Controls.Iterator=function(layout){

this._layout=layout;

};



Timegrid.Controls.Iterator.prototype.render=function(container){

if(container){

this._container=container;

this._div=$('<div></div>').addClass('timegrid-iterator');

$(this._container).prepend(this._div);

}else{

this._div.empty();

}

var self=this;

var makePrevCallback=function(layout){

return function(){

layout.goPrevious();

self.render();

};

};

var makeNextCallback=function(layout){

return function(){

layout.goNext();

self.render();

};

};

var prevLink=$('<img alt="Previous" src="'+Timegrid.urlPrefix+'/images/go-previous.png"></img>')

.wrap('<a href="javascript:void"></a>').parent()

.addClass('timegrid-iterator-prev')

.click(makePrevCallback(this._layout));

var nextLink=$('<img alt="Next" src="'+Timegrid.urlPrefix+'/images/go-next.png"></img>')

.wrap('<a href="javascript:void"></a>').parent()

.addClass('timegrid-iterator-next')

.click(makeNextCallback(this._layout));

this._div.append(prevLink);

this._div.append('<span>'+this._layout.getCurrent()+'</span>');

this._div.append(nextLink);

return this._div;

};



/* create.js */

$(document).ready(function(){

$('div').each(function(){

if($(this).attrs('tg').role=="grid"){

if(!window.timegrids){window.timegrids=new Array();}

window.timegrids.push(Timegrid.createFromDOM(this));

}

});

});

/* grid.js */



Timegrid.Grid=function(objs,xSize,ySize,xMapper,yMapper){
Timegrid.Grid.superclass.call(this);

this.grid=new Array(xSize);
for(i=0;i<xSize;i++){
this.grid[i]=new Array(ySize);
for(j=0;j<ySize;j++){
this.grid[i][j]=[];
}
}
this.xMapper=xMapper;
this.yMapper=yMapper;
this.size=0;

this.addAll(objs);
};
$.inherit(Timegrid.Grid,Timegrid.ListenerAware);

Timegrid.Grid.prototype.add=function(obj){
var x=this.xMapper(obj);
var y=this.yMapper(obj);
this.get(x,y).push(obj);
this.size++;
};

Timegrid.Grid.prototype.addAll=function(objs){
for(i in objs){this.add(objs[i]);}
};

Timegrid.Grid.prototype.remove=function(obj){
var x=this.xMapper(obj);
var y=this.yMapper(obj);
var objs=this.get(x,y);
for(i=0;i<objs.length;i++){
if(obj==objs[i]){
objs.splice(i,1);
this.size--;
return true;
}
}
return false;
};

Timegrid.Grid.prototype.get=function(x,y){
return this.grid[x][y];
};

Timegrid.Grid.prototype.getSize=function(){
return this.size;
};


/* labellers.js */



Timegrid.GregorianDateLabeller=function(locale,timeZone){
this._locale=locale;
this._timeZone=timeZone;
};

Timegrid.GregorianDateLabeller.monthNames=[];
Timegrid.GregorianDateLabeller.dayNames=[];
Timegrid.GregorianDateLabeller.labelIntervalFunctions=[];

Timegrid.GregorianDateLabeller.getMonthName=function(month,locale){
return Timegrid.GregorianDateLabeller.monthNames[locale][month];
};

Timegrid.GregorianDateLabeller.prototype.labelInterval=function(date,intervalUnit){
var f=Timegrid.GregorianDateLabeller.labelIntervalFunctions[this._locale];
if(f==null){
f=Timegrid.GregorianDateLabeller.prototype.defaultLabelInterval;
}
return f.call(this,date,intervalUnit);
};

Timegrid.GregorianDateLabeller.prototype.labelPrecise=function(date){
return SimileAjax.DateTime.removeTimeZoneOffset(
date,
this._timeZone
).toUTCString();
};

Timegrid.GregorianDateLabeller.prototype.defaultLabelInterval=function(date,intervalUnit){
var text;
var emphasized=false;

date=SimileAjax.DateTime.removeTimeZoneOffset(date,this._timeZone);

switch(intervalUnit){
case SimileAjax.DateTime.MILLISECOND:
text=date.getUTCMilliseconds();
break;
case SimileAjax.DateTime.SECOND:
text=date.getUTCSeconds();
break;
case SimileAjax.DateTime.MINUTE:
var m=date.getUTCMinutes();
if(m==0){
text=date.getUTCHours()+":00";
emphasized=true;
}else{
text=m;
}
break;
case SimileAjax.DateTime.HOUR:
text=date.getUTCHours()+"hr";
break;
case SimileAjax.DateTime.DAY:
text=Timegrid.GregorianDateLabeller.getMonthName(date.getUTCMonth(),this._locale)+" "+date.getUTCDate();
break;
case SimileAjax.DateTime.WEEK:
text=Timegrid.GregorianDateLabeller.getMonthName(date.getUTCMonth(),this._locale)+" "+date.getUTCDate();
break;
case SimileAjax.DateTime.MONTH:
var m=date.getUTCMonth();
if(m!=0){
text=Timegrid.GregorianDateLabeller.getMonthName(m,this._locale);
break;
}
case SimileAjax.DateTime.YEAR:
case SimileAjax.DateTime.DECADE:
case SimileAjax.DateTime.CENTURY:
case SimileAjax.DateTime.MILLENNIUM:
var y=date.getUTCFullYear();
if(y>0){
text=date.getUTCFullYear();
}else{
text=(1-y)+"BC";
}
emphasized=
(intervalUnit==SimileAjax.DateTime.MONTH)||
(intervalUnit==SimileAjax.DateTime.DECADE&&y%100==0)||
(intervalUnit==SimileAjax.DateTime.CENTURY&&y%1000==0);
break;
default:
text=date.toUTCString();
}
return{text:text,emphasized:emphasized};
}



/* layouts.js */




Timegrid.LayoutFactory=function(){};

Timegrid.LayoutFactory._constructors={};

Timegrid.LayoutFactory.registerLayout=function(name,constructor){
$.inherit(constructor,Timegrid.Layout);
Timegrid.LayoutFactory._constructors[name]=constructor;
};


Timegrid.LayoutFactory.createLayout=function(name,eventSource,params){
var constructor=Timegrid.LayoutFactory._constructors[name];
if(typeof constructor=='function'){
layout=new constructor(eventSource,params);
return layout;
}else{
throw"No such layout!";
};
return;
};


Timegrid.Layout=function(eventSource,params){
this.params=params;

this.xSize=0;

this.ySize=0;
this.xMapper=function(obj){return 0;};
this.yMapper=function(obj){return 0;};

this.xLabelHeight="2em";
this.yLabelWidth="4em";
};

Timegrid.Layout.prototype.configure=function(params){
for(attr in params){
this[attr]=params[attr];
}
};

Timegrid.Layout.prototype.computeCellSizes=function(){

this.xCell=this.xCell||this.xcell||100.0/this.xSize;
this.yCell=this.yCell||this.ycell||(this.gridheight-1)/this.ySize;
};


Timegrid.Layout.prototype.render=function(container){
if(container){
this._container=container;
this._viewDiv=$("<div></div>").addClass('timegrid-view');
$(this._container).append(this._viewDiv);
}else{
this._viewDiv.empty();
}
var gridDiv=$('<div></div>').addClass('timegrid-grid');
var gridWindowDiv=$('<div></div>').addClass('timegrid-grid-window');

if(!this.params.height){
this.height=this._container.style.height?
$(this._container).height():500;
}
$(this._container).height(this.height+"px");
if(!this.params.width){
this.width=$(this._container).width();
}else{
$(this._container).width(this.width+"px");
}
$(this._container).css('position','relative');

gridWindowDiv.css("top",this.xLabelHeight).css("left",this.yLabelWidth)
.css("right","0px").css("bottom","0px");
this._viewDiv.append(gridWindowDiv.append(gridDiv));
this.gridwidth=this.gridwidth||gridWindowDiv.width()-this.scrollwidth;
this.gridheight=this.gridheight||gridWindowDiv.height()-this.scrollwidth;
gridDiv.height(this.gridheight+"px").width(this.gridwidth+"px");
this.computeCellSizes();
gridDiv.append(this.renderEvents(document));
gridDiv.append(this.renderGridlines(document));

var xLabels=this.renderXLabels();
var yLabels=this.renderYLabels();
var syncHorizontalScroll=function(a,b){
$(a).scroll(function(){b.scrollLeft=a.scrollLeft;});
$(b).scroll(function(){a.scrollLeft=b.scrollLeft;});
};
var syncVerticalScroll=function(a,b){
$(a).scroll(function(){b.scrollTop=a.scrollTop;});
$(b).scroll(function(){a.scrollTop=b.scrollTop;});
};
syncVerticalScroll(yLabels,gridWindowDiv.get(0));
syncHorizontalScroll(xLabels,gridWindowDiv.get(0));
this._viewDiv.append(xLabels).append(yLabels);
return this._viewDiv.get(0);
};

Timegrid.Layout.prototype.renderEvents=Timegrid.abstract("renderEvents");

Timegrid.Layout.prototype.renderGridlines=function(doc){
var gridlineContainer=doc.createElement("div");
$(gridlineContainer).addClass("timegrid-gridlines");
for(var x=0;x<this.xSize;x++){
var vlineDiv=$("<div></div>").addClass("timegrid-vline");
vlineDiv.css("height",this.gridheight+"px");
vlineDiv.css("left",x*this.xCell+"%");
$(gridlineContainer).append(vlineDiv);
}
for(var y=0;y<=this.ySize;y++){
var hlineDiv=$("<div></div>").addClass("timegrid-hline");
hlineDiv.css("width","100%");
hlineDiv.css("top",y*this.yCell);
$(gridlineContainer).append(hlineDiv);
}
return gridlineContainer;
};

Timegrid.Layout.prototype.renderXLabels=function(){
var xLabelContainer=$('<div></div>').addClass('timegrid-xlabels-window');
var xLabelsDiv=$('<div></div>').width(this.width);
xLabelsDiv.height(this.xLabelHeight).css("top","0px");
xLabelsDiv.width(this.gridwidth+"px");
xLabelContainer.append(xLabelsDiv.addClass('timegrid-xlabels'));
xLabelContainer.height(this.xLabelHeight);
xLabelContainer.css("right",this.scrollwidth+"px");
xLabelContainer.css("left",this.yLabelWidth);
var labels=this.getXLabels();
for(i in labels){
var label=$('<div class="timegrid-label">'+labels[i]+'</div>');
label.width(this.xCell+'%').css('left',i*this.xCell+'%');
xLabelsDiv.append(label);
}
return xLabelContainer.get(0);
};

Timegrid.Layout.prototype.renderYLabels=function(){
var yLabelContainer=$('<div></div>').addClass('timegrid-ylabels-window');
var yLabelsDiv=$('<div></div>').height(this.gridheight+"px");
yLabelsDiv.width(this.yLabelWidth).css("left","0px");
yLabelContainer.append(yLabelsDiv.addClass('timegrid-ylabels'));
yLabelContainer.width(this.yLabelWidth);
yLabelContainer.css("top",this.xLabelHeight);
yLabelContainer.css("bottom",this.scrollwidth+"px");
var labels=this.getYLabels();
for(i in labels){
var label=$('<div class="timegrid-label">'+labels[i]+'</div>');
label.height(this.yCell+'px').css('top',i*this.yCell+'px');
yLabelsDiv.append(label);
}
return yLabelContainer.get(0);
};

Timegrid.Layout.prototype.getXLabels=Timegrid.abstract("getXLabels");

Timegrid.Layout.prototype.getYLabels=Timegrid.abstract("getYLabels");


/* listeners.js */

Timegrid.ListenerAware=function(){

this._listeners=[];

};



Timegrid.ListenerAware.prototype.addListener=function(listener){

this._listeners.push(listener);

};



Timegrid.ListenerAware.prototype.removeListener=function(listener){

for(var i=0;i<this._listeners.length;i++){

if(this._listeners[i]==listener){

this._listeners.splice(i,1);

break;

}

}

};



Timegrid.ListenerAware.prototype._fire=function(handlerName,args){

for(var i=0;i<this._listeners.length;i++){

var listener=this._listeners[i];

if(handlerName in listener){

try{

listener[handlerName].apply(listener,args);

}catch(e){

Timegrid.Debug.exception(e);

}

}

}

};

/* sources.js */




Timegrid.DefaultEventSource=function(eventIndex){
Timegrid.DefaultEventSource.superclass.call(this);
this._events=(eventIndex instanceof Object)?eventIndex:new SimileAjax.EventIndex();
};
$.inherit(Timegrid.DefaultEventSource,Timegrid.ListenerAware);

Timegrid.DefaultEventSource.prototype.loadXML=function(xml,url){
var base=this._getBaseURL(url);

var wikiURL=xml.documentElement.getAttribute("wiki-url");
var wikiSection=xml.documentElement.getAttribute("wiki-section");

var dateTimeFormat=xml.documentElement.getAttribute("date-time-format");
var parseDateTimeFunction=this._events.getUnit().getParser(dateTimeFormat);

var node=xml.documentElement.firstChild;
var added=false;
while(node!=null){
if(node.nodeType==1){
var description="";
if(node.firstChild!=null&&node.firstChild.nodeType==3){
description=node.firstChild.nodeValue;
}
var evt=new Timegrid.DefaultEventSource.Event(
parseDateTimeFunction(node.getAttribute("start")),
parseDateTimeFunction(node.getAttribute("end")),
parseDateTimeFunction(node.getAttribute("latestStart")),
parseDateTimeFunction(node.getAttribute("earliestEnd")),
node.getAttribute("isDuration")!="true",
node.getAttribute("title"),
description,
this._resolveRelativeURL(node.getAttribute("image"),base),
this._resolveRelativeURL(node.getAttribute("link"),base),
this._resolveRelativeURL(node.getAttribute("icon"),base),
node.getAttribute("color"),
node.getAttribute("textColor")
);
evt._node=node;
evt.getProperty=function(name){
return this._node.getAttribute(name);
};
evt.setWikiInfo(wikiURL,wikiSection);

this._events.add(evt);

added=true;
}
node=node.nextSibling;
}

if(added){
this._fire("onAddMany",[]);
}
};


Timegrid.DefaultEventSource.prototype.loadJSON=function(data,url){
var base=this._getBaseURL(url);
var added=false;
if(data&&data.events){
var wikiURL=("wikiURL"in data)?data.wikiURL:null;
var wikiSection=("wikiSection"in data)?data.wikiSection:null;

var dateTimeFormat=("dateTimeFormat"in data)?data.dateTimeFormat:null;
var parseDateTimeFunction=this._events.getUnit().getParser(dateTimeFormat);

for(var i=0;i<data.events.length;i++){
var event=data.events[i];
if(!(event.start||event.end||
event.latestStart||event.earliestEnd)){
continue;
}
var evt=new Timegrid.DefaultEventSource.Event(
parseDateTimeFunction(event.start),
parseDateTimeFunction(event.end),
parseDateTimeFunction(event.latestStart),
parseDateTimeFunction(event.earliestEnd),
event.isDuration||false,
event.title,
event.description,
this._resolveRelativeURL(event.image,base),
this._resolveRelativeURL(event.link,base),
this._resolveRelativeURL(event.icon,base),
event.color,
event.textColor
);
evt._obj=event;
evt.getProperty=function(name){
return this._obj[name];
};
evt.setWikiInfo(wikiURL,wikiSection);
this._events.add(evt);
added=true;
}
}
if(added){
this._fire("onAddMany",[]);
}
};


Timegrid.DefaultEventSource.prototype.loadSPARQL=function(xml,url){
var base=this._getBaseURL(url);

var dateTimeFormat='iso8601';
var parseDateTimeFunction=this._events.getUnit().getParser(dateTimeFormat);

if(xml==null){
return;
}


var node=xml.documentElement.firstChild;
while(node!=null&&(node.nodeType!=1||node.nodeName!='results')){
node=node.nextSibling;
}

var wikiURL=null;
var wikiSection=null;
if(node!=null){
wikiURL=node.getAttribute("wiki-url");
wikiSection=node.getAttribute("wiki-section");

node=node.firstChild;
}

var added=false;
while(node!=null){
if(node.nodeType==1){
var bindings={};
var binding=node.firstChild;
while(binding!=null){
if(binding.nodeType==1&&
binding.firstChild!=null&&
binding.firstChild.nodeType==1&&
binding.firstChild.firstChild!=null&&
binding.firstChild.firstChild.nodeType==3){
bindings[binding.getAttribute('name')]=binding.firstChild.firstChild.nodeValue;
}
binding=binding.nextSibling;
}

if(bindings["start"]==null&&bindings["date"]!=null){
bindings["start"]=bindings["date"];
}

var evt=new Timegrid.DefaultEventSource.Event(
parseDateTimeFunction(bindings["start"]),
parseDateTimeFunction(bindings["end"]),
parseDateTimeFunction(bindings["latestStart"]),
parseDateTimeFunction(bindings["earliestEnd"]),
bindings["isDuration"]!="true",
bindings["title"],
bindings["description"],
this._resolveRelativeURL(bindings["image"],base),
this._resolveRelativeURL(bindings["link"],base),
this._resolveRelativeURL(bindings["icon"],base),
bindings["color"],
bindings["textColor"]
);
evt._bindings=bindings;
evt.getProperty=function(name){
return this._bindings[name];
};
evt.setWikiInfo(wikiURL,wikiSection);

this._events.add(evt);
added=true;
}
node=node.nextSibling;
}

if(added){
this._fire("onAddMany",[]);
}
};

Timegrid.DefaultEventSource.prototype.add=function(evt){
this._events.add(evt);
this._fire("onAddOne",[evt]);
};

Timegrid.DefaultEventSource.prototype.addMany=function(events){
for(var i=0;i<events.length;i++){
this._events.add(events[i]);
}
this._fire("onAddMany",[]);
};

Timegrid.DefaultEventSource.prototype.clear=function(){
this._events.removeAll();
this._fire("onClear",[]);
};

Timegrid.DefaultEventSource.prototype.getEventIterator=function(startDate,endDate){
return this._events.getIterator(startDate,endDate);
};

Timegrid.DefaultEventSource.prototype.getAllEventIterator=function(){
return this._events.getAllIterator();
};

Timegrid.DefaultEventSource.prototype.getCount=function(){
return this._events.getCount();
};

Timegrid.DefaultEventSource.prototype.getEarliestDate=function(){
return this._events.getEarliestDate();
};

Timegrid.DefaultEventSource.prototype.getLatestDate=function(){
return this._events.getLatestDate();
};

Timegrid.DefaultEventSource.prototype._getBaseURL=function(url){
if(url.indexOf("://")<0){
var url2=this._getBaseURL(document.location.href);
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
};

Timegrid.DefaultEventSource.prototype._resolveRelativeURL=function(url,base){
if(url==null||url==""){
return url;
}else if(url.indexOf("://")>0){
return url;
}else if(url.substr(0,1)=="/"){
return base.substr(0,base.indexOf("/",base.indexOf("://")+3))+url;
}else{
return base+url;
}
};


Timegrid.DefaultEventSource.Event=function(
start,end,latestStart,earliestEnd,instant,
text,description,image,link,
icon,color,textColor){

this._id="e"+Math.floor(Math.random()*1000000);

this._instant=instant||(end==null);

this._start=start;
this._end=(end!=null)?end:start;

this._latestStart=(latestStart!=null)?latestStart:(instant?this._end:this._start);
this._earliestEnd=(earliestEnd!=null)?earliestEnd:(instant?this._start:this._end);

this._text=SimileAjax.HTML.deEntify(text);
this._description=SimileAjax.HTML.deEntify(description);
this._image=(image!=null&&image!="")?image:null;
this._link=(link!=null&&link!="")?link:null;

this._icon=(icon!=null&&icon!="")?icon:null;
this._color=(color!=null&&color!="")?color:null;
this._textColor=(textColor!=null&&textColor!="")?textColor:null;

this._wikiURL=null;
this._wikiSection=null;
};

Timegrid.DefaultEventSource.Event.prototype={
getID:function(){return this._id;},

isInstant:function(){return this._instant;},
isImprecise:function(){return this._start!=this._latestStart||this._end!=this._earliestEnd;},

getStart:function(){return this._start;},
getEnd:function(){return this._end;},
getLatestStart:function(){return this._latestStart;},
getEarliestEnd:function(){return this._earliestEnd;},

getText:function(){return this._text;},
getDescription:function(){return this._description;},
getImage:function(){return this._image;},
getLink:function(){return this._link;},

getIcon:function(){return this._icon;},
getColor:function(){return this._color;},
getTextColor:function(){return this._textColor;},

getInterval:function(){
return new SimileAjax.DateTime.Interval(this.getEnd()-
this.getStart());
},

getProperty:function(name){return null;},

getWikiURL:function(){return this._wikiURL;},
getWikiSection:function(){return this._wikiSection;},
setWikiInfo:function(wikiURL,wikiSection){
this._wikiURL=wikiURL;
this._wikiSection=wikiSection;
},

fillDescription:function(elmt){
elmt.innerHTML=this._description;
},
fillWikiInfo:function(elmt){
if(this._wikiURL!=null&&this._wikiSection!=null){
var wikiID=this.getProperty("wikiID");
if(wikiID==null||wikiID.length==0){
wikiID=this.getText();
}
wikiID=wikiID.replace(/\s/g,"_");

var url=this._wikiURL+this._wikiSection.replace(/\s/g,"_")+"/"+wikiID;
var a=document.createElement("a");
a.href=url;
a.target="new";
a.innerHTML="Discuss";

elmt.appendChild(document.createTextNode("["));
elmt.appendChild(a);
elmt.appendChild(document.createTextNode("]"));
}else{
elmt.style.display="none";
}
},
fillTime:function(elmt,labeller){
if(this._instant){
if(this.isImprecise()){
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
elmt.appendChild(elmt.ownerDocument.createElement("br"));
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._end)));
}else{
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
}
}else{
if(this.isImprecise()){
elmt.appendChild(elmt.ownerDocument.createTextNode(
labeller.labelPrecise(this._start)+" ~ "+labeller.labelPrecise(this._latestStart)));
elmt.appendChild(elmt.ownerDocument.createElement("br"));
elmt.appendChild(elmt.ownerDocument.createTextNode(
labeller.labelPrecise(this._earliestEnd)+" ~ "+labeller.labelPrecise(this._end)));
}else{
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
elmt.appendChild(elmt.ownerDocument.createElement("br"));
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._end)));
}
}
},
fillInfoBubble:function(elmt,theme,labeller){
var doc=elmt.ownerDocument;

var title=this.getText();
var link=this.getLink();
var image=this.getImage();

if(image!=null){
var img=doc.createElement("img");
img.src=image;

theme.event.bubble.imageStyler(img);
elmt.appendChild(img);
}

var divTitle=doc.createElement("div");
var textTitle=doc.createTextNode(title);
if(link!=null){
var a=doc.createElement("a");
a.href=link;
a.appendChild(textTitle);
divTitle.appendChild(a);
}else{
divTitle.appendChild(textTitle);
}
theme.event.bubble.titleStyler(divTitle);
elmt.appendChild(divTitle);

var divBody=doc.createElement("div");
this.fillDescription(divBody);
theme.event.bubble.bodyStyler(divBody);
elmt.appendChild(divBody);

var divTime=doc.createElement("div");
this.fillTime(divTime,labeller);
theme.event.bubble.timeStyler(divTime);
elmt.appendChild(divTime);

var divWiki=doc.createElement("div");
this.fillWikiInfo(divWiki);
theme.event.bubble.wikiStyler(divWiki);
elmt.appendChild(divWiki);
}
};


/* themes.js */




Timegrid.ClassicTheme=new Object();

Timegrid.ClassicTheme.implementations=[];

Timegrid.ClassicTheme.create=function(locale){
if(locale==null){
locale=Timegrid.Platform.getDefaultLocale();
}

var f=Timegrid.ClassicTheme.implementations[locale];
if(f==null){
f=Timegrid.ClassicTheme._Impl;
}
return new f();
};

Timegrid.ClassicTheme._Impl=function(){
this.firstDayOfWeek=0;

this.ether={
backgroundColors:[
"#EEE",
"#DDD",
"#CCC",
"#AAA"
],
highlightColor:"white",
highlightOpacity:50,
interval:{
line:{
show:true,
color:"#aaa",
opacity:25
},
weekend:{
color:"#FFFFE0",
opacity:30
},
marker:{
hAlign:"Bottom",
hBottomStyler:function(elmt){
elmt.className="timeline-ether-marker-bottom";
},
hBottomEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-bottom-emphasized";
},
hTopStyler:function(elmt){
elmt.className="timeline-ether-marker-top";
},
hTopEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-top-emphasized";
},

vAlign:"Right",
vRightStyler:function(elmt){
elmt.className="timeline-ether-marker-right";
},
vRightEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-right-emphasized";
},
vLeftStyler:function(elmt){
elmt.className="timeline-ether-marker-left";
},
vLeftEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-left-emphasized";
}
}
}
};

this.event={
track:{
offset:0.5,
height:1.5,
gap:0.5
},
instant:{
icon:Timegrid.urlPrefix+"images/dull-blue-circle.png",
lineColor:"#58A0DC",
impreciseColor:"#58A0DC",
impreciseOpacity:20,
showLineForNoText:true
},
duration:{
color:"#58A0DC",
opacity:100,
impreciseColor:"#58A0DC",
impreciseOpacity:20
},
label:{
insideColor:"white",
outsideColor:"black",
width:200
},
highlightColors:[
"#FFFF00",
"#FFC000",
"#FF0000",
"#0000FF"
],
bubble:{
width:250,
height:125,
titleStyler:function(elmt){
elmt.className="timeline-event-bubble-title";
},
bodyStyler:function(elmt){
elmt.className="timeline-event-bubble-body";
},
imageStyler:function(elmt){
elmt.className="timeline-event-bubble-image";
},
wikiStyler:function(elmt){
elmt.className="timeline-event-bubble-wiki";
},
timeStyler:function(elmt){
elmt.className="timeline-event-bubble-time";
}
}
};
};