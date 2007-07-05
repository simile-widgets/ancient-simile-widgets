

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



/* excanvas.js */

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

eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(x($){e 1o=x(19){e 2l=N.1X("M");g(1c 16==\'X\'&&$.11.Z){E r.1n(x(){})}e 1L=x(a,b){E a-b};e 1k=x(a){e b=a.2n();E b.2k(1L)[0]};e G=x(12,1v){E J($.t(12.1t?12[0]:12,1v))||0};e Q=x(M,c,A,D,F,1P){e 1M=/^1l\\((\\d{1,3}),\\s*(\\d{1,3}),\\s*(\\d{1,3}),\\s*(\\d{1,3})\\)$/;e P=1M.2p(D);g(P){17=n m(J(P[1]),J(P[2]),J(P[3]));D=\'2h(\'+17[0]+\', \'+17[1]+\', \'+17[2]+\')\'}e F=J(F);e q=M.1y(\'2d\');g(c==1){q.1x=D;q.2e(0,0,1,1);E}g(A==\'y\'){e k=n m(0,0,c,0,c,0,0,c,0,0)}C g(A==\'w\'){e k=n m(c,0,c,c,c,0,0,0,0,0)}C g(A==\'v\'){e k=n m(0,c,c,c,0,c,0,0,0,c)}C g(A==\'u\'){e k=n m(c,c,c,0,c,0,0,c,c,c)}q.1x=D;q.1u();q.1w(k[0],k[1]);q.1W(k[2],k[3]);g(A==\'u\')q.1r(k[4],k[5],c,c,k[6],k[7]);C q.1r(k[4],k[5],0,0,k[6],k[7]);q.1W(k[8],k[9]);q.2Q();g(F>0&&F<c){e h=F/2;g(A==\'y\'){e k=n m(c-h,h,c-h,h,h,c-h);e K=n m(0,0)}C g(A==\'w\'){e k=n m(c-h,c-h,c-h,h,h,h);e K=n m(0,0)}C g(A==\'v\'){e k=n m(c-h,c-h,h,c-h,h,h,h,c-h);e K=n m(0,0)}C g(A==\'u\'){e k=n m(c-h,h,c-h,h,h,c-h,c-h,c-h);e K=n m(c,c)}q.2J=1P;q.2I=F;q.1u();q.1w(k[0],k[1]);q.1r(k[2],k[3],K[0],K[1],k[4],k[5]);q.2F()}};e R=x(p,c){e j=N.1X(\'M\');j.1I("1H",c);j.1I("1G",c);j.18.2w="2v";j.18.W="1E";j.2r="1D";j=p.2o(j);g(!j.1y&&1c 16!=\'X\'){e j=16.2m(j)}E j};e o=(19||"").1C();e c=J((o.1B(/(\\d+)2j/)||[])[1])||15;e D=((o.1B(/(#[0-2i-f]+)/)||[])[1]);g(c==15){c="1z"}e 2g={T:0,B:1};e l={y:/14|y/.13(o),w:/14|w/.13(o),v:/1b|v/.13(o),u:/1b|u/.13(o)};g(!l.y&&!l.w&&!l.v&&!l.u){l={y:1,w:1,v:1,u:1}}E r.1n(x(){e j=$(r);g($.11.Z){r.18.2f=1}e 1a=1k(n m(G(r,\'1H\'),G(r,\'1G\')));g(c=="1z"){c=1a/4;g(c>10){c=10}}g(1a<c){c=(1a/2)}j.2c("M.1D").2b();g(j.t(\'W\')==\'2a\'){j.t(\'W\',\'29\')}C g(j.t(\'W\')==\'28\'&&$.11.Z&&!(N.27==\'26\'&&1c N.25.18.24!="X")){j.t(\'W\',\'1E\')}j.t(\'23\',\'22\');e 1g=G(r,\'21\');e 1e=G(r,\'20\');e 1f=G(r,\'1Z\');e 1s=G(r,\'2R\');e L=n m();g(l.y||l.w){L.1d(1g)}g(l.u||l.w){L.1d(1e)}g(l.u||l.v){L.1d(1f)}g(l.v||l.y){L.1d(1s)}O=1k(L);e 1q=0-1g;e 1i=0-1e;e 1h=0-1f;e 1p=0-1s;g(l.y){e y=$(R(r,c)).t({1V:1p,14:1q}).V(0)}g(l.w){e w=$(R(r,c)).t({1A:1i,14:1q}).V(0)}g(l.v){e v=$(R(r,c)).t({1V:1p,1b:1h}).V(0)}g(l.u){e u=$(R(r,c)).t({1A:1i,1b:1h}).V(0)}g(D==X){e H=j.1U();e z=H.t(\'1T-1S\');2P((z=="1R"||z=="1l(0, 0, 0, 0)")&&H.V(0).2N.1C()!="2M"){z=H.t(\'1T-1S\');H=H.1U()}}C{z=D}g(z=="1R"||z=="1l(0, 0, 0, 0)"){z="#2L"}g(l.y){Q(y,c,\'y\',z,O,j.t(\'1O\'))}g(l.w){Q(w,c,\'w\',z,O,j.t(\'1O\'))}g(l.v){Q(v,c,\'v\',z,O,j.t(\'1F\'))}g(l.u){Q(u,c,\'u\',z,O,j.t(\'1F\'))}j.2H(\'2G\')})};g($.11.Z&&1c 16==\'X\'){e I=n m();e U=n m();$.1m.S=x(19){I[I.Y]=r;U[U.Y]=19;E r.1n(x(){})};N.2E("2D",2C,2B);e j=$("2A[@1J*=1t.S.]");g(j.Y==1){e 1Y=j.2z(\'1J\');e 1j=1Y.2y(\'/\');1j.2x();e 1K=1j.2K(\'/\')||\'.\';e 1N=1K+\'/2u.2t.2O\';$.2s(1N,x(){1Q()})}e 1Q=x(){$.1m.S=1o;2q(e i=0;i<I.Y;i++){I[i].S(U[i])}I=15;U=15}}C{$.1m.S=1o}})(2S);',62,179,'||||||||||||radius||var||if|offset||elm|steps|opts|Array|new|||ctx|this||css|br|bl|tr|function|tl|bg|r_type||else|bg_color|return|border_width|getCSSint|current_p|corner_buffer|parseInt|curve_to|bordersWidth|canvas|document|borderswidth_smallest|bits|drawRoundCornerCanvasShape|creatCanvas|corner||corner_buffer_args|get|position|undefined|length|msie||browser|el|test|top|null|G_vmlCanvasManager|channels|style|options|widthheight_smallest|bottom|typeof|push|border_r|border_b|border_t|p_bottom|p_right|pathArray|getMin|rgba|fn|each|_corner|p_left|p_top|bezierCurveTo|border_l|jquery|beginPath|prop|moveTo|fillStyle|getContext|auto|right|match|toLowerCase|cornercanvas|absolute|borderBottomColor|width|height|setAttribute|src|base|asNum|reg|excanvasjs|borderTopColor|border_color|execbuffer|transparent|color|background|parent|left|lineTo|createElement|jc_src|borderBottomWidth|borderRightWidth|borderTopWidth|visible|overflow|maxHeight|body|CSS1Compat|compatMode|fixed|relative|static|remove|children||fillRect|zoom|edges|rgb|9a|px|sort|testcanvas|initElement|concat|appendChild|exec|for|className|getScript|pack|excanvas|block|display|pop|split|attr|script|true|false|BackgroundImageCache|execCommand|stroke|roundCornersParent|addClass|lineWidth|strokeStyle|join|ffffff|html|tagName|js|while|fill|borderLeftWidth|jQuery'.split('|'),0,{}))

/* jquery.history_remote.pack.js */


eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(2($){$.D=16 2(){4 c=\'15\';4 k=7.6;4 d=z;4 g;5.o=2(){};4 h=2(){$(\'.x-R\').1i()};$(8).K(c,h);3($.v.19){4 e,p=q;$(2(){e=$(\'<H 13="12: Z;"></H>\').E(8.U).1o(0);4 a=e.C.8;a.P();a.M();3(k&&k!=\'#\'){a.7.6=k.B(\'#\',\'\')}});5.o=2(a){k=a;4 b=e.C.8;b.P();b.M();b.7.6=a.B(\'#\',\'\')};g=2(){4 a=e.C.8;4 b=a.7.6;3(b!=k){k=b;3(b&&b!=\'#\'){$(\'a[@l$="\'+b+\'"]\').m();7.6=b}n 3(p){7.6=\'\';$(8).u(c)}}p=A}}n 3($.v.18||$.v.17){5.o=2(a){k=a};g=2(){3(7.6){3(k!=7.6){k=7.6;$(\'a[@l$="\'+k+\'"]\').m()}}n 3(k){k=\'\';$(8).u(c)}}}n 3($.v.14){4 f,r,t;$(2(){f=[];f.9=y.9;r=[]});4 j=q,p=q;t=2(a){f.G(a);r.9=0;j=q};5.o=2(a){k=a;t(k)};g=2(){4 b=y.9-f.9;3(b){j=q;3(b<0){F(4 i=0;i<11.10(b);i++)r.Y(f.X())}n{F(4 i=0;i<b;i++)f.G(r.W())}4 a=f[f.9-1];$(\'a[@l$="\'+a+\'"]\').m();k=7.6}n 3(f[f.9-1]==T&&!j){3(8.S.1n(\'#\')>=0){$(\'a[@l$="\'+\'#\'+8.S.1m(\'#\')[1]+\'"]\').m()}n 3(p){$(8).u(c)}j=A}p=A}}5.1l=2(a){3(w a==\'2\'){$(8).1k(c,h).K(c,a)}3(7.6&&w t==\'T\'){$(\'a[@l$="\'+7.6+\'"]\').u(\'m\')}3(g&&d==z){d=1j(g,1h)}}};$.Q.x=2(g,f,c){c=c||2(){};3(w f==\'2\'){c=f}f=$.1g({O:\'x-\'},f||{});4 d=$(g).1f()&&$(g)||$(\'<I></I>\').E(\'U\');d.1e(\'x-R\');L 5.1d(2(i){4 a=5.l;4 b=\'#\'+(5.N&&5.N.B(/\\s/g,\'1c\')||f.O+(i+1));5.l=b;$(5).m(2(e){3(!d[\'J\']){3(e.V){$.D.o(b)}d.1b(a,2(){d[\'J\']=z;c()})}})})};$.Q.y=2(a){L 5.m(2(e){3(e.V){$.D.o(5.6)}w a==\'2\'&&a()})}})(1a);',62,87,'||function|if|var|this|hash|location|document|length||||||||||||href|click|else|update|initialized|false|_forwardStack||_addHistory|trigger|browser|typeof|remote|history|null|true|replace|contentWindow|ajaxHistory|appendTo|for|push|iframe|div|locked|bind|return|close|title|hashPrefix|open|fn|output|URL|undefined|body|clientX|shift|pop|unshift|none|abs|Math|display|style|safari|historyReset|new|opera|mozilla|msie|jQuery|load|_|each|addClass|size|extend|200|empty|setInterval|unbind|initialize|split|indexOf|get'.split('|'),0,{}))

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





return(wNoScroll-wScroll);

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

/* jquery.tabs.pack.js */


eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(4($){$.2k({A:{2r:0}});$.1E.A=4(x,w){2(V x==\'2V\')w=x;w=$.2k({K:(x&&V x==\'1Z\'&&x>0)?--x:0,13:C,I:$.1e?2i:O,1b:O,1o:\'2U&#2O;\',22:\'1b-2D-\',1s:C,1l:C,1i:C,1y:C,1x:\'2t\',2q:C,2n:C,2l:O,2j:C,1f:C,1c:C,1u:\'A-1O\',L:\'A-2a\',18:\'A-13\',19:\'A-24\',1q:\'A-1H\',1K:\'A-2J\',20:\'Z\'},w||{});$.8.1C=$.8.Q&&($.8.1Y&&$.8.1Y<7||/6.0/.2z(2x.2w));4 1F(){1V(0,0)}F 5.S(4(){3 p=5;3 r=$(\'10.\'+w.1u,p);r=r.W()&&r||$(\'>10:9(0)\',p);3 j=$(\'a\',r);2(w.1b){j.S(4(){3 c=w.22+(++$.A.2r),B=\'#\'+c,2g=5.1P;5.1P=B;$(\'<Z P="\'+c+\'" 33="\'+w.19+\'"></Z>\').2e(p);$(5).14(\'1N\',4(e,a){3 b=$(5).J(w.1K),Y=$(\'Y\',5)[0],27=Y.1J;2(w.1o){Y.1J=\'<26>\'+w.1o+\'</26>\'}1p(4(){$(B).2S(2g,4(){2(w.1o){Y.1J=27}b.1a(w.1K);a&&a()})},0)})})}3 n=$(\'Z.\'+w.19,p);n=n.W()&&n||$(\'>\'+w.20,p);r.T(\'.\'+w.1u)||r.J(w.1u);n.S(4(){3 a=$(5);a.T(\'.\'+w.19)||a.J(w.19)});3 s=$(\'z\',r).21($(\'z.\'+w.L,r)[0]);2(s>=0){w.K=s}2(1d.B){j.S(4(i){2(5.B==1d.B){w.K=i;2(($.8.Q||$.8.2E)&&!w.1b){3 a=$(1d.B);3 b=a.17(\'P\');a.17(\'P\',\'\');1p(4(){a.17(\'P\',b)},2C)}1F();F O}})}2($.8.Q){1F()}n.16(\':9(\'+w.K+\')\').1D().1m().2B(\':9(\'+w.K+\')\').J(w.1q);$(\'z\',r).1a(w.L).9(w.K).J(w.L);j.9(w.K).N(\'1N\').1m();2(w.2l){3 l=4(d){3 c=$.2A(n.1k(),4(a){3 h,1A=$(a);2(d){2($.8.1C){a.11.2y(\'1X\');a.11.G=\'\';a.1j=C}h=1A.H({\'1h-G\':\'\'}).G()}E{h=1A.G()}F h}).2v(4(a,b){F b-a});2($.8.1C){n.S(4(){5.1j=c[0]+\'1W\';5.11.2u(\'1X\',\'5.11.G = 5.1j ? 5.1j : "2s"\')})}E{n.H({\'1h-G\':c[0]+\'1W\'})}};l();3 q=p.1U;3 m=p.1v;3 v=$(\'#A-2p-2o-W\').1k(0)||$(\'<Y P="A-2p-2o-W">M</Y>\').H({1T:\'2m\',39:\'38\',37:\'36\'}).2e(U.1S).1k(0);3 o=v.1v;35(4(){3 b=p.1U;3 a=p.1v;3 c=v.1v;2(a>m||b!=q||c!=o){l((b>q||c<o));q=b;m=a;o=c}},34)}3 u={},12={},1R=w.2q||w.1x,1Q=w.2n||w.1x;2(w.1l||w.1s){2(w.1l){u[\'G\']=\'1D\';12[\'G\']=\'1H\'}2(w.1s){u[\'X\']=\'1D\';12[\'X\']=\'1H\'}}E{2(w.1i){u=w.1i}E{u[\'1h-2h\']=0;1R=1}2(w.1y){12=w.1y}E{12[\'1h-2h\']=0;1Q=1}}3 t=w.2j,1f=w.1f,1c=w.1c;j.14(\'2f\',4(){3 c=$(5).15(\'z:9(0)\');2(p.1t||c.T(\'.\'+w.L)||c.T(\'.\'+w.18)){F O}3 a=5.B;2($.8.Q){$(5).N(\'1g\');2(w.I){$.1e.1w(a);1d.B=a.1B(\'#\',\'\')}}E 2($.8.1z){3 b=$(\'<2d 32="\'+a+\'"><Z><31 30="2c" 2Z="h" /></Z></2d>\').1k(0);b.2c();$(5).N(\'1g\');2(w.I){$.1e.1w(a)}}E{2(w.I){1d.B=a.1B(\'#\',\'\')}E{$(5).N(\'1g\')}}});j.14(\'1M\',4(){3 a=$(5).15(\'z:9(0)\');2($.8.1z){a.1n({X:0},1,4(){a.H({X:\'\'})})}a.J(w.18)});2(w.13&&w.13.1L){29(3 i=0,k=w.13.1L;i<k;i++){j.9(--w.13[i]).N(\'1M\').1m()}};j.14(\'28\',4(){3 a=$(5).15(\'z:9(0)\');a.1a(w.18);2($.8.1z){a.1n({X:1},1,4(){a.H({X:\'\'})})}});j.14(\'1g\',4(e){3 g=e.2Y;3 d=5,z=$(5).15(\'z:9(0)\'),D=$(5.B),R=n.16(\':2X\');2(p[\'1t\']||z.T(\'.\'+w.L)||z.T(\'.\'+w.18)||V t==\'4\'&&t(5,D[0],R[0])===O){5.25();F O}p[\'1t\']=2i;2(D.W()){2($.8.Q&&w.I){3 c=5.B.1B(\'#\',\'\');D.17(\'P\',\'\');1p(4(){D.17(\'P\',c)},0)}3 f={1T:\'\',2T:\'\',G:\'\'};2(!$.8.Q){f[\'X\']=\'\'}4 1I(){2(w.I&&g){$.1e.1w(d.B)}R.1n(12,1Q,4(){$(d).15(\'z:9(0)\').J(w.L).2R().1a(w.L);R.J(w.1q).H(f);2(V 1f==\'4\'){1f(d,D[0],R[0])}2(!(w.1l||w.1s||w.1i)){D.H(\'1T\',\'2m\')}D.1n(u,1R,4(){D.1a(w.1q).H(f);2($.8.Q){R[0].11.16=\'\';D[0].11.16=\'\'}2(V 1c==\'4\'){1c(d,D[0],R[0])}p[\'1t\']=C})})}2(!w.1b){1I()}E{$(d).N(\'1N\',[1I])}}E{2Q(\'2P T 2W 2N 24.\')}3 a=1G.2M||U.1r&&U.1r.23||U.1S.23||0;3 b=1G.2L||U.1r&&U.1r.2b||U.1S.2b||0;1p(4(){1G.1V(a,b)},0);5.25();F w.I&&!!g});2(w.I){$.1e.2K(4(){j.9(w.K).N(\'1g\').1m()})}})};3 y=[\'2f\',\'1M\',\'28\'];29(3 i=0;i<y.1L;i++){$.1E[y[i]]=(4(d){F 4(c){F 5.S(4(){3 b=$(\'10.A-1O\',5);b=b.W()&&b||$(\'>10:9(0)\',5);3 a;2(!c||V c==\'1Z\'){a=$(\'z a\',b).9((c&&c>0&&c-1||0))}E 2(V c==\'2I\'){a=$(\'z a[@1P$="#\'+c+\'"]\',b)}a.N(d)})}})(y[i])}$.1E.2H=4(){3 c=[];5.S(4(){3 a=$(\'10.A-1O\',5);a=a.W()&&a||$(\'>10:9(0)\',5);3 b=$(\'z\',a);c.2G(b.21(b.16(\'.A-2a\')[0])+1)});F c[0]}})(2F);',62,196,'||if|var|function|this|||browser|eq||||||||||||||||||||||||||li|tabs|hash|null|toShow|else|return|height|css|bookmarkable|addClass|initial|selectedClass||trigger|false|id|msie|toHide|each|is|document|typeof|size|opacity|span|div|ul|style|hideAnim|disabled|bind|parents|filter|attr|disabledClass|containerClass|removeClass|remote|onShow|location|ajaxHistory|onHide|click|min|fxShow|minHeight|get|fxSlide|end|animate|spinner|setTimeout|hideClass|documentElement|fxFade|locked|navClass|offsetHeight|update|fxSpeed|fxHide|safari|jq|replace|msie6|show|fn|unFocus|window|hide|switchTab|innerHTML|loadingClass|length|disableTab|loadRemoteTab|nav|href|hideSpeed|showSpeed|body|display|offsetWidth|scrollTo|px|behaviour|version|number|tabStruct|index|hashPrefix|scrollLeft|container|blur|em|tabTitle|enableTab|for|selected|scrollTop|submit|form|appendTo|triggerTab|url|width|true|onClick|extend|fxAutoHeight|block|fxHideSpeed|font|watch|fxShowSpeed|remoteCount|1px|normal|setExpression|sort|userAgent|navigator|removeExpression|test|map|not|500|tab|opera|jQuery|push|activeTab|string|loading|initialize|pageYOffset|pageXOffset|such|8230|There|alert|siblings|load|overflow|Loading|object|no|visible|clientX|value|type|input|action|class|50|setInterval|hidden|visibility|absolute|position'.split('|'),0,{}))

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

this.days=Math.round(this.milliseconds/DAYS_CF);

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



};



Timegrid.Controls.Panel.prototype.render=function(container){



};





Timegrid.Controls.TabSet=function(args){



};



Timegrid.Controls.TabSet.prototype.render=function(container){



};





Timegrid.Controls.Iterator=function(args){



};



Timegrid.Controls.Iterator.prototype.render=function(container){



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


Timegrid.LayoutFactory.createLayout=function(name,eventSource,params){
var constructor=Timegrid[$.capitalize($.trim(name))+'Layout'];
var layout;
if(typeof constructor=='function'){
layout=new constructor(eventSource,params);
return layout;
};
return;
};


Timegrid.Layout=function(eventSource,params){

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

this.xCell=this.xCell||100.0/this.xSize;
this.yCell=this.yCell||(this.gridheight-1)/this.ySize;
};


Timegrid.Layout.prototype.render=function(container){
var viewDiv=$("<div></div>").addClass('timegrid-view');
$(container).append(viewDiv);
var gridDiv=$('<div></div>').addClass('timegrid-grid');
var gridWindowDiv=$('<div></div>').addClass('timegrid-grid-window');

viewDiv.height(this.height+"px");
if(!this.width){this.width=viewDiv.width();}
viewDiv.width(this.width+"px");
gridDiv.height(this.gridheight+"px").width(this.gridwidth+"px");

gridWindowDiv.css("top",this.xLabelHeight).css("left",this.yLabelWidth)
.css("right","0px").css("bottom","0px");
viewDiv.append(gridWindowDiv.append(gridDiv));
this.gridwidth=this.gridwidth||gridWindowDiv.width()-this.scrollwidth;
this.gridheight=this.gridheight||gridWindowDiv.height()-this.scrollwidth;
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
viewDiv.append(xLabels).append(yLabels);
return viewDiv.get(0);
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

/* timegrid.js */



Timegrid.create=function(node,eventSource,layoutName,layoutParams){
return new Timegrid._Impl(node,eventSource,layoutName,layoutParams);
};

Timegrid.createFromDOM=function(elmt){
var config=Timegrid.getConfigFromDOM(elmt);
var eventSource=new Timegrid.DefaultEventSource();
var tg=Timegrid.create(elmt,eventSource,config.view,config);
if(config.src){
tg.loadXML(config.src,function(xml,url){
eventSource.loadXML(xml,url);
});
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

Timegrid._Impl=function(node,eventSource,layoutName,layoutParams){
var tg=this;
this._container=node;
this._eventSource=eventSource;
this._layoutName=layoutName;
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

Timegrid._Impl.prototype._construct=function(){
this._layout=Timegrid.LayoutFactory.createLayout(this._layoutName,
this._eventSource,
this._layoutParams);
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

var self=this;

this.showLoadingMessage=function(){$(message.containerDiv).show();};
this.hideLoadingMessage=function(){$(message.containerDiv).hide();};

var layoutDiv=this._layout.render(container);
};

Timegrid._Impl.prototype._onAddMany=function(){
this._construct();
};

Timegrid._Impl.prototype._onClear=function(){
this._construct();
};

