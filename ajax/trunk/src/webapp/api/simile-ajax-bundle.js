

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



/* data-structure.js */



SimileAjax.SortedArray=function(compare,initialArray){
this._a=(initialArray instanceof Array)?initialArray:[];
this._compare=compare;
};

SimileAjax.SortedArray.prototype.add=function(elmt){
var sa=this;
var index=this.find(function(elmt2){
return sa._compare(elmt2,elmt);
});

if(index<this._a.length){
this._a.splice(index,0,elmt);
}else{
this._a.push(elmt);
}
};

SimileAjax.SortedArray.prototype.remove=function(elmt){
var sa=this;
var index=this.find(function(elmt2){
return sa._compare(elmt2,elmt);
});

while(index<this._a.length&&this._compare(this._a[index],elmt)==0){
if(this._a[index]==elmt){
this._a.splice(index,1);
return true;
}else{
index++;
}
}
return false;
};

SimileAjax.SortedArray.prototype.removeAll=function(){
this._a=[];
};

SimileAjax.SortedArray.prototype.elementAt=function(index){
return this._a[index];
};

SimileAjax.SortedArray.prototype.length=function(){
return this._a.length;
};

SimileAjax.SortedArray.prototype.find=function(compare){
var a=0;
var b=this._a.length;

while(a<b){
var mid=Math.floor((a+b)/2);
var c=compare(this._a[mid]);
if(mid==a){
return c<0?a+1:a;
}else if(c<0){
a=mid;
}else{
b=mid;
}
}
return a;
};

SimileAjax.SortedArray.prototype.getFirst=function(){
return(this._a.length>0)?this._a[0]:null;
};

SimileAjax.SortedArray.prototype.getLast=function(){
return(this._a.length>0)?this._a[this._a.length-1]:null;
};



SimileAjax.EventIndex=function(unit){
var eventIndex=this;

this._unit=(unit!=null)?unit:SimileAjax.NativeDateUnit;
this._events=new SimileAjax.SortedArray(
function(event1,event2){
return eventIndex._unit.compare(event1.getStart(),event2.getStart());
}
);
this._idToEvent={};
this._indexed=true;
};

SimileAjax.EventIndex.prototype.getUnit=function(){
return this._unit;
};

SimileAjax.EventIndex.prototype.getEvent=function(id){
return this._idToEvent[id];
};

SimileAjax.EventIndex.prototype.add=function(evt){
this._events.add(evt);
this._idToEvent[evt.getID()]=evt;
this._indexed=false;
};

SimileAjax.EventIndex.prototype.removeAll=function(){
this._events.removeAll();
this._idToEvent={};
this._indexed=false;
};

SimileAjax.EventIndex.prototype.getCount=function(){
return this._events.length();
};

SimileAjax.EventIndex.prototype.getIterator=function(startDate,endDate){
if(!this._indexed){
this._index();
}
return new SimileAjax.EventIndex._Iterator(this._events,startDate,endDate,this._unit);
};

SimileAjax.EventIndex.prototype.getAllIterator=function(){
return new SimileAjax.EventIndex._AllIterator(this._events);
};

SimileAjax.EventIndex.prototype.getEarliestDate=function(){
var evt=this._events.getFirst();
return(evt==null)?null:evt.getStart();
};

SimileAjax.EventIndex.prototype.getLatestDate=function(){
var evt=this._events.getLast();
if(evt==null){
return null;
}

if(!this._indexed){
this._index();
}

var index=evt._earliestOverlapIndex;
var date=this._events.elementAt(index).getEnd();
for(var i=index+1;i<this._events.length();i++){
date=this._unit.later(date,this._events.elementAt(i).getEnd());
}

return date;
};

SimileAjax.EventIndex.prototype._index=function(){


var l=this._events.length();
for(var i=0;i<l;i++){
var evt=this._events.elementAt(i);
evt._earliestOverlapIndex=i;
}

var toIndex=1;
for(var i=0;i<l;i++){
var evt=this._events.elementAt(i);
var end=evt.getEnd();

toIndex=Math.max(toIndex,i+1);
while(toIndex<l){
var evt2=this._events.elementAt(toIndex);
var start2=evt2.getStart();

if(this._unit.compare(start2,end)<0){
evt2._earliestOverlapIndex=i;
toIndex++;
}else{
break;
}
}
}
this._indexed=true;
};

SimileAjax.EventIndex._Iterator=function(events,startDate,endDate,unit){
this._events=events;
this._startDate=startDate;
this._endDate=endDate;
this._unit=unit;

this._currentIndex=events.find(function(evt){
return unit.compare(evt.getStart(),startDate);
});
if(this._currentIndex-1>=0){
this._currentIndex=this._events.elementAt(this._currentIndex-1)._earliestOverlapIndex;
}
this._currentIndex--;

this._maxIndex=events.find(function(evt){
return unit.compare(evt.getStart(),endDate);
});

this._hasNext=false;
this._next=null;
this._findNext();
};

SimileAjax.EventIndex._Iterator.prototype={
hasNext:function(){return this._hasNext;},
next:function(){
if(this._hasNext){
var next=this._next;
this._findNext();

return next;
}else{
return null;
}
},
_findNext:function(){
var unit=this._unit;
while((++this._currentIndex)<this._maxIndex){
var evt=this._events.elementAt(this._currentIndex);
if(unit.compare(evt.getStart(),this._endDate)<0&&
unit.compare(evt.getEnd(),this._startDate)>0){

this._next=evt;
this._hasNext=true;
return;
}
}
this._next=null;
this._hasNext=false;
}
};

SimileAjax.EventIndex._AllIterator=function(events){
this._events=events;
this._index=0;
};

SimileAjax.EventIndex._AllIterator.prototype={
hasNext:function(){
return this._index<this._events.length();
},
next:function(){
return this._index<this._events.length()?
this._events.elementAt(this._index++):null;
}
};

/* date-time.js */



SimileAjax.DateTime=new Object();

SimileAjax.DateTime.MILLISECOND=0;
SimileAjax.DateTime.SECOND=1;
SimileAjax.DateTime.MINUTE=2;
SimileAjax.DateTime.HOUR=3;
SimileAjax.DateTime.DAY=4;
SimileAjax.DateTime.WEEK=5;
SimileAjax.DateTime.MONTH=6;
SimileAjax.DateTime.YEAR=7;
SimileAjax.DateTime.DECADE=8;
SimileAjax.DateTime.CENTURY=9;
SimileAjax.DateTime.MILLENNIUM=10;

SimileAjax.DateTime.EPOCH=-1;
SimileAjax.DateTime.ERA=-2;

SimileAjax.DateTime.gregorianUnitLengths=[];
(function(){
var d=SimileAjax.DateTime;
var a=d.gregorianUnitLengths;

a[d.MILLISECOND]=1;
a[d.SECOND]=1000;
a[d.MINUTE]=a[d.SECOND]*60;
a[d.HOUR]=a[d.MINUTE]*60;
a[d.DAY]=a[d.HOUR]*24;
a[d.WEEK]=a[d.DAY]*7;
a[d.MONTH]=a[d.DAY]*31;
a[d.YEAR]=a[d.DAY]*365;
a[d.DECADE]=a[d.YEAR]*10;
a[d.CENTURY]=a[d.YEAR]*100;
a[d.MILLENNIUM]=a[d.YEAR]*1000;
})();

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

SimileAjax.DateTime.parseGregorianDateTime=function(o){
if(o==null){
return null;
}else if(o instanceof Date){
return o;
}

var s=o.toString();
if(s.length>0&&s.length<8){
var space=s.indexOf(" ");
if(space>0){
var year=parseInt(s.substr(0,space));
var suffix=s.substr(space+1);
if(suffix.toLowerCase()=="bc"){
year=1-year;
}
}else{
var year=parseInt(s);
}

var d=new Date(0);
d.setUTCFullYear(year);

return d;
}

try{
return new Date(Date.parse(s));
}catch(e){
return null;
}
};

SimileAjax.DateTime.roundDownToInterval=function(date,intervalUnit,timeZone,multiple,firstDayOfWeek){
var timeShift=timeZone*
SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR];

var date2=new Date(date.getTime()+timeShift);
var clearInDay=function(d){
d.setUTCMilliseconds(0);
d.setUTCSeconds(0);
d.setUTCMinutes(0);
d.setUTCHours(0);
};
var clearInYear=function(d){
clearInDay(d);
d.setUTCDate(1);
d.setUTCMonth(0);
};

switch(intervalUnit){
case SimileAjax.DateTime.MILLISECOND:
var x=date2.getUTCMilliseconds();
date2.setUTCMilliseconds(x-(x%multiple));
break;
case SimileAjax.DateTime.SECOND:
date2.setUTCMilliseconds(0);

var x=date2.getUTCSeconds();
date2.setUTCSeconds(x-(x%multiple));
break;
case SimileAjax.DateTime.MINUTE:
date2.setUTCMilliseconds(0);
date2.setUTCSeconds(0);

var x=date2.getUTCMinutes();
date2.setTime(date2.getTime()-
(x%multiple)*SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.MINUTE]);
break;
case SimileAjax.DateTime.HOUR:
date2.setUTCMilliseconds(0);
date2.setUTCSeconds(0);
date2.setUTCMinutes(0);

var x=date2.getUTCHours();
date2.setUTCHours(x-(x%multiple));
break;
case SimileAjax.DateTime.DAY:
clearInDay(date2);
break;
case SimileAjax.DateTime.WEEK:
clearInDay(date2);
var d=(date2.getUTCDay()+7-firstDayOfWeek)%7;
date2.setTime(date2.getTime()-
d*SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.DAY]);
break;
case SimileAjax.DateTime.MONTH:
clearInDay(date2);
date2.setUTCDate(1);

var x=date2.getUTCMonth();
date2.setUTCMonth(x-(x%multiple));
break;
case SimileAjax.DateTime.YEAR:
clearInYear(date2);

var x=date2.getUTCFullYear();
date2.setUTCFullYear(x-(x%multiple));
break;
case SimileAjax.DateTime.DECADE:
clearInYear(date2);
date2.setUTCFullYear(Math.floor(date2.getUTCFullYear()/10)*10);
break;
case SimileAjax.DateTime.CENTURY:
clearInYear(date2);
date2.setUTCFullYear(Math.floor(date2.getUTCFullYear()/100)*100);
break;
case SimileAjax.DateTime.MILLENNIUM:
clearInYear(date2);
date2.setUTCFullYear(Math.floor(date2.getUTCFullYear()/1000)*1000);
break;
}

date.setTime(date2.getTime()-timeShift);
};

SimileAjax.DateTime.roundUpToInterval=function(date,intervalUnit,timeZone,multiple,firstDayOfWeek){
var originalTime=date.getTime();
SimileAjax.DateTime.roundDownToInterval(date,intervalUnit,timeZone,multiple,firstDayOfWeek);
if(date.getTime()<originalTime){
date.setTime(date.getTime()+
SimileAjax.DateTime.gregorianUnitLengths[intervalUnit]*multiple);
}
};

SimileAjax.DateTime.incrementByInterval=function(date,intervalUnit){
switch(intervalUnit){
case SimileAjax.DateTime.MILLISECOND:
date.setTime(date.getTime()+1)
break;
case SimileAjax.DateTime.SECOND:
date.setTime(date.getTime()+1000);
break;
case SimileAjax.DateTime.MINUTE:
date.setTime(date.getTime()+
SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.MINUTE]);
break;
case SimileAjax.DateTime.HOUR:
date.setTime(date.getTime()+
SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR]);
break;
case SimileAjax.DateTime.DAY:
date.setUTCDate(date.getUTCDate()+1);
break;
case SimileAjax.DateTime.WEEK:
date.setUTCDate(date.getUTCDate()+7);
break;
case SimileAjax.DateTime.MONTH:
date.setUTCMonth(date.getUTCMonth()+1);
break;
case SimileAjax.DateTime.YEAR:
date.setUTCFullYear(date.getUTCFullYear()+1);
break;
case SimileAjax.DateTime.DECADE:
date.setUTCFullYear(date.getUTCFullYear()+10);
break;
case SimileAjax.DateTime.CENTURY:
date.setUTCFullYear(date.getUTCFullYear()+100);
break;
case SimileAjax.DateTime.MILLENNIUM:
date.setUTCFullYear(date.getUTCFullYear()+1000);
break;
}
};

SimileAjax.DateTime.removeTimeZoneOffset=function(date,timeZone){
return new Date(date.getTime()+
timeZone*SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR]);
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



SimileAjax.Graphics.createAnimation=function(f,from,to,duration,cont){
return new SimileAjax.Graphics._Animation(f,from,to,duration,cont);
};

SimileAjax.Graphics._Animation=function(f,from,to,duration,cont){
this.f=f;
this.cont=(typeof cont=="function")?cont:function(){};

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
this["cont"]();
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


/* html.js */



SimileAjax.HTML=new Object();

SimileAjax.HTML._e2uHash={};
(function(){
e2uHash=SimileAjax.HTML._e2uHash;
e2uHash['nbsp']='\u00A0[space]';
e2uHash['iexcl']='\u00A1';
e2uHash['cent']='\u00A2';
e2uHash['pound']='\u00A3';
e2uHash['curren']='\u00A4';
e2uHash['yen']='\u00A5';
e2uHash['brvbar']='\u00A6';
e2uHash['sect']='\u00A7';
e2uHash['uml']='\u00A8';
e2uHash['copy']='\u00A9';
e2uHash['ordf']='\u00AA';
e2uHash['laquo']='\u00AB';
e2uHash['not']='\u00AC';
e2uHash['shy']='\u00AD';
e2uHash['reg']='\u00AE';
e2uHash['macr']='\u00AF';
e2uHash['deg']='\u00B0';
e2uHash['plusmn']='\u00B1';
e2uHash['sup2']='\u00B2';
e2uHash['sup3']='\u00B3';
e2uHash['acute']='\u00B4';
e2uHash['micro']='\u00B5';
e2uHash['para']='\u00B6';
e2uHash['middot']='\u00B7';
e2uHash['cedil']='\u00B8';
e2uHash['sup1']='\u00B9';
e2uHash['ordm']='\u00BA';
e2uHash['raquo']='\u00BB';
e2uHash['frac14']='\u00BC';
e2uHash['frac12']='\u00BD';
e2uHash['frac34']='\u00BE';
e2uHash['iquest']='\u00BF';
e2uHash['Agrave']='\u00C0';
e2uHash['Aacute']='\u00C1';
e2uHash['Acirc']='\u00C2';
e2uHash['Atilde']='\u00C3';
e2uHash['Auml']='\u00C4';
e2uHash['Aring']='\u00C5';
e2uHash['AElig']='\u00C6';
e2uHash['Ccedil']='\u00C7';
e2uHash['Egrave']='\u00C8';
e2uHash['Eacute']='\u00C9';
e2uHash['Ecirc']='\u00CA';
e2uHash['Euml']='\u00CB';
e2uHash['Igrave']='\u00CC';
e2uHash['Iacute']='\u00CD';
e2uHash['Icirc']='\u00CE';
e2uHash['Iuml']='\u00CF';
e2uHash['ETH']='\u00D0';
e2uHash['Ntilde']='\u00D1';
e2uHash['Ograve']='\u00D2';
e2uHash['Oacute']='\u00D3';
e2uHash['Ocirc']='\u00D4';
e2uHash['Otilde']='\u00D5';
e2uHash['Ouml']='\u00D6';
e2uHash['times']='\u00D7';
e2uHash['Oslash']='\u00D8';
e2uHash['Ugrave']='\u00D9';
e2uHash['Uacute']='\u00DA';
e2uHash['Ucirc']='\u00DB';
e2uHash['Uuml']='\u00DC';
e2uHash['Yacute']='\u00DD';
e2uHash['THORN']='\u00DE';
e2uHash['szlig']='\u00DF';
e2uHash['agrave']='\u00E0';
e2uHash['aacute']='\u00E1';
e2uHash['acirc']='\u00E2';
e2uHash['atilde']='\u00E3';
e2uHash['auml']='\u00E4';
e2uHash['aring']='\u00E5';
e2uHash['aelig']='\u00E6';
e2uHash['ccedil']='\u00E7';
e2uHash['egrave']='\u00E8';
e2uHash['eacute']='\u00E9';
e2uHash['ecirc']='\u00EA';
e2uHash['euml']='\u00EB';
e2uHash['igrave']='\u00EC';
e2uHash['iacute']='\u00ED';
e2uHash['icirc']='\u00EE';
e2uHash['iuml']='\u00EF';
e2uHash['eth']='\u00F0';
e2uHash['ntilde']='\u00F1';
e2uHash['ograve']='\u00F2';
e2uHash['oacute']='\u00F3';
e2uHash['ocirc']='\u00F4';
e2uHash['otilde']='\u00F5';
e2uHash['ouml']='\u00F6';
e2uHash['divide']='\u00F7';
e2uHash['oslash']='\u00F8';
e2uHash['ugrave']='\u00F9';
e2uHash['uacute']='\u00FA';
e2uHash['ucirc']='\u00FB';
e2uHash['uuml']='\u00FC';
e2uHash['yacute']='\u00FD';
e2uHash['thorn']='\u00FE';
e2uHash['yuml']='\u00FF';
e2uHash['quot']='\u0022';
e2uHash['amp']='\u0026';
e2uHash['lt']='\u003C';
e2uHash['gt']='\u003E';
e2uHash['OElig']='';
e2uHash['oelig']='\u0153';
e2uHash['Scaron']='\u0160';
e2uHash['scaron']='\u0161';
e2uHash['Yuml']='\u0178';
e2uHash['circ']='\u02C6';
e2uHash['tilde']='\u02DC';
e2uHash['ensp']='\u2002';
e2uHash['emsp']='\u2003';
e2uHash['thinsp']='\u2009';
e2uHash['zwnj']='\u200C';
e2uHash['zwj']='\u200D';
e2uHash['lrm']='\u200E';
e2uHash['rlm']='\u200F';
e2uHash['ndash']='\u2013';
e2uHash['mdash']='\u2014';
e2uHash['lsquo']='\u2018';
e2uHash['rsquo']='\u2019';
e2uHash['sbquo']='\u201A';
e2uHash['ldquo']='\u201C';
e2uHash['rdquo']='\u201D';
e2uHash['bdquo']='\u201E';
e2uHash['dagger']='\u2020';
e2uHash['Dagger']='\u2021';
e2uHash['permil']='\u2030';
e2uHash['lsaquo']='\u2039';
e2uHash['rsaquo']='\u203A';
e2uHash['euro']='\u20AC';
e2uHash['fnof']='\u0192';
e2uHash['Alpha']='\u0391';
e2uHash['Beta']='\u0392';
e2uHash['Gamma']='\u0393';
e2uHash['Delta']='\u0394';
e2uHash['Epsilon']='\u0395';
e2uHash['Zeta']='\u0396';
e2uHash['Eta']='\u0397';
e2uHash['Theta']='\u0398';
e2uHash['Iota']='\u0399';
e2uHash['Kappa']='\u039A';
e2uHash['Lambda']='\u039B';
e2uHash['Mu']='\u039C';
e2uHash['Nu']='\u039D';
e2uHash['Xi']='\u039E';
e2uHash['Omicron']='\u039F';
e2uHash['Pi']='\u03A0';
e2uHash['Rho']='\u03A1';
e2uHash['Sigma']='\u03A3';
e2uHash['Tau']='\u03A4';
e2uHash['Upsilon']='\u03A5';
e2uHash['Phi']='\u03A6';
e2uHash['Chi']='\u03A7';
e2uHash['Psi']='\u03A8';
e2uHash['Omega']='\u03A9';
e2uHash['alpha']='\u03B1';
e2uHash['beta']='\u03B2';
e2uHash['gamma']='\u03B3';
e2uHash['delta']='\u03B4';
e2uHash['epsilon']='\u03B5';
e2uHash['zeta']='\u03B6';
e2uHash['eta']='\u03B7';
e2uHash['theta']='\u03B8';
e2uHash['iota']='\u03B9';
e2uHash['kappa']='\u03BA';
e2uHash['lambda']='\u03BB';
e2uHash['mu']='\u03BC';
e2uHash['nu']='\u03BD';
e2uHash['xi']='\u03BE';
e2uHash['omicron']='\u03BF';
e2uHash['pi']='\u03C0';
e2uHash['rho']='\u03C1';
e2uHash['sigmaf']='\u03C2';
e2uHash['sigma']='\u03C3';
e2uHash['tau']='\u03C4';
e2uHash['upsilon']='\u03C5';
e2uHash['phi']='\u03C6';
e2uHash['chi']='\u03C7';
e2uHash['psi']='\u03C8';
e2uHash['omega']='\u03C9';
e2uHash['thetasym']='\u03D1';
e2uHash['upsih']='\u03D2';
e2uHash['piv']='\u03D6';
e2uHash['bull']='\u2022';
e2uHash['hellip']='\u2026';
e2uHash['prime']='\u2032';
e2uHash['Prime']='\u2033';
e2uHash['oline']='\u203E';
e2uHash['frasl']='\u2044';
e2uHash['weierp']='\u2118';
e2uHash['image']='\u2111';
e2uHash['real']='\u211C';
e2uHash['trade']='\u2122';
e2uHash['alefsym']='\u2135';
e2uHash['larr']='\u2190';
e2uHash['uarr']='\u2191';
e2uHash['rarr']='\u2192';
e2uHash['darr']='\u2193';
e2uHash['harr']='\u2194';
e2uHash['crarr']='\u21B5';
e2uHash['lArr']='\u21D0';
e2uHash['uArr']='\u21D1';
e2uHash['rArr']='\u21D2';
e2uHash['dArr']='\u21D3';
e2uHash['hArr']='\u21D4';
e2uHash['forall']='\u2200';
e2uHash['part']='\u2202';
e2uHash['exist']='\u2203';
e2uHash['empty']='\u2205';
e2uHash['nabla']='\u2207';
e2uHash['isin']='\u2208';
e2uHash['notin']='\u2209';
e2uHash['ni']='\u220B';
e2uHash['prod']='\u220F';
e2uHash['sum']='\u2211';
e2uHash['minus']='\u2212';
e2uHash['lowast']='\u2217';
e2uHash['radic']='\u221A';
e2uHash['prop']='\u221D';
e2uHash['infin']='\u221E';
e2uHash['ang']='\u2220';
e2uHash['and']='\u2227';
e2uHash['or']='\u2228';
e2uHash['cap']='\u2229';
e2uHash['cup']='\u222A';
e2uHash['int']='\u222B';
e2uHash['there4']='\u2234';
e2uHash['sim']='\u223C';
e2uHash['cong']='\u2245';
e2uHash['asymp']='\u2248';
e2uHash['ne']='\u2260';
e2uHash['equiv']='\u2261';
e2uHash['le']='\u2264';
e2uHash['ge']='\u2265';
e2uHash['sub']='\u2282';
e2uHash['sup']='\u2283';
e2uHash['nsub']='\u2284';
e2uHash['sube']='\u2286';
e2uHash['supe']='\u2287';
e2uHash['oplus']='\u2295';
e2uHash['otimes']='\u2297';
e2uHash['perp']='\u22A5';
e2uHash['sdot']='\u22C5';
e2uHash['lceil']='\u2308';
e2uHash['rceil']='\u2309';
e2uHash['lfloor']='\u230A';
e2uHash['rfloor']='\u230B';
e2uHash['lang']='\u2329';
e2uHash['rang']='\u232A';
e2uHash['loz']='\u25CA';
e2uHash['spades']='\u2660';
e2uHash['clubs']='\u2663';
e2uHash['hearts']='\u2665';
e2uHash['diams']='\u2666';
})();

SimileAjax.HTML.deEntify=function(s){
e2uHash=SimileAjax.HTML._e2uHash;

var re=/&(\w+?);/;
while(re.test(s)){
var m=s.match(re);
s=s.replace(re,e2uHash[m[1]]);
}
return s;
};

/* jquery-1.1.3a.js */


eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('7(1c 18.6=="G"){18.G=18.G;v 6=q(a,c){7(18==9)u Y 6(a,c);u 9.4I(a,c)};7(1c $!="G")6.1L$=$;v $=6;6.N=6.8p={4I:q(a,c){a=a||P;7(6.1b(a))u Y 6(P)[6.N.1C?"1C":"1T"](a);7(1c a=="1p"){v m=/^[^<]*(<(.|\\s)+>)[^>]*$/.27(a);7(m)a=6.32([m[1]]);C u Y 6(c).1J(a)}u 9.4z(a.14==25&&a||(a.3y||a.B&&a!=18&&(!a.1y||(6.H.V&&a.7Y))&&a[0]!=G&&a[0].1y)&&6.2w(a)||[a])},3y:"1.1.3a",7F:q(){u 9.B},B:0,1I:q(a){u a==G?6.2w(9):9[a]},1Q:q(a){v b=6(a);b.54=9;u b},4z:q(a){9.B=0;[].12.L(9,a);u 9},D:q(a,b){u 6.D(9,a,b)},4W:q(a){v b=-1;9.D(q(i){7(9==a)b=i});u b},16:q(f,d,e){v c=f;7(f.14==36)7(d==G)u 9.B&&6[e||"16"](9[0],f)||G;C{c={};c[f]=d}u 9.D(q(a){E(v b S c)6.16(e?9.11:9,b,6.4w(9,c[b],e,a,b))})},1a:q(b,a){u 9.16(b,a,"2F")},2g:q(e){7(1c e=="1p")u 9.3m().3v(P.8i(e));v t="";6.D(e||9,q(){6.D(9.2N,q(){7(9.1y!=8)t+=9.1y!=1?9.5F:6.N.2g([9])})});u t},83:q(){v a,1W=17;u 9.D(q(){7(!a)a=6.32(1W,9.2I);v b=a[0].3j(K);9.O.2E(b,9);1v(b.U)b=b.U;b.44(9)})},3v:q(){u 9.2A(17,K,1,q(a){9.44(a)})},5m:q(){u 9.2A(17,K,-1,q(a){9.2E(a,9.U)})},5l:q(){u 9.2A(17,M,1,q(a){9.O.2E(a,9)})},5h:q(){u 9.2A(17,M,-1,q(a){9.O.2E(a,9.1S)})},2M:q(){u 9.54||6([])},1J:q(t){u 9.1Q(6.59(6.2y(9,q(a){u 6.1J(t,a)})),t)},7r:q(e){v d=9.1w(9.1J("*"));d.D(q(){9.1L$19={};E(v a S 9.$19)9.1L$19[a]=6.1d({},9.$19[a])}).3P();v r=9.1Q(6.2y(9,q(a){u a.3j(e!=G?e:K)}));d.D(q(){v b=9.1L$19;E(v a S b)E(v c S b[a])6.Q.1w(9,a,b[a][c],b[a][c].R);9.1L$19=F});u r},1f:q(t){u 9.1Q(6.1b(t)&&6.2s(9,q(b,a){u t.L(b,[a])})||6.2q(t,9))},4R:q(t){u 9.1Q(t.14==36&&6.2q(t,9,K)||6.2s(9,q(a){u(t.14==25||t.3y)?6.2X(a,t)<0:a!=t}))},1w:q(t){u 9.1Q(6.1R(9.1I(),t.14==36?6(t).1I():t.B!=G&&(!t.T||t.T=="6M")?t:[t]))},2V:q(a){u a?6.2q(a,9).B>0:M},6F:q(a){u a==G?(9.B?9[0].2p:F):9.16("2p",a)},3H:q(a){u a==G?(9.B?9[0].2j:F):9.3m().3v(a)},2A:q(f,d,g,e){v c=9.B>1,a;u 9.D(q(){7(!a){a=6.32(f,9.2I);7(g<0)a.6o()}v b=9;7(d&&6.T(9,"1l")&&6.T(a[0],"2S"))b=9.4y("1x")[0]||9.44(P.4x("1x"));6.D(a,q(){e.L(b,[c?9.3j(K):9])})})}};6.1d=6.N.1d=q(){v c=17[0],a=1;7(17.B==1){c=9;a=0}v b;1v((b=17[a++])!=F)E(v i S b)c[i]=b[i];u c};6.1d({6d:q(){7(6.1L$)$=6.1L$;u 6},1b:q(a){u!!a&&1c a!="1p"&&!a.T&&a.14!=25&&/q/i.1o(a+"")},3X:q(a){u a.5r&&a.2I&&!a.2I.4u},T:q(b,a){u b.T&&b.T.2Q()==a.2Q()},D:q(a,b,c){7(a.B==G)E(v i S a)b.L(a[i],c||[i,a[i]]);C E(v i=0,4r=a.B;i<4r;i++)7(b.L(a[i],c||[i,a[i]])===M)1H;u a},4w:q(c,b,d,e,a){7(6.1b(b))b=b.4l(c,[e]);v f=/z-?4W|8l-?8h|1e|5M|8b-?1m/i;u b&&b.14==3u&&d=="2F"&&!f.1o(a)?b+"4h":b},W:{1w:q(b,c){6.D(c.2L(/\\s+/),q(i,a){7(!6.W.2K(b.W,a))b.W+=(b.W?" ":"")+a})},1z:q(b,c){b.W=c!=G?6.2s(b.W.2L(/\\s+/),q(a){u!6.W.2K(c,a)}).5A(" "):""},2K:q(t,c){u 6.2X(c,(t.W||t).3n().2L(/\\s+/))>-1}},4g:q(e,o,f){E(v i S o){e.11["2J"+i]=e.11[i];e.11[i]=o[i]}f.L(e,[]);E(v i S o)e.11[i]=e.11["2J"+i]},1a:q(e,p){7(p=="1m"||p=="2f"){v b={},3k,2Z,d=["7X","7W","7V","7R"];6.D(d,q(){b["7O"+9]=0;b["7N"+9+"7L"]=0});6.4g(e,b,q(){7(6(e).2V(\':3W\')){3k=e.7J;2Z=e.7I}C{e=6(e.3j(K)).1J(":46").5p("2z").2M().1a({42:"1B",3e:"7E",15:"2c",7D:"0",7C:"0"}).5f(e.O)[0];v a=6.1a(e.O,"3e")||"3d";7(a=="3d")e.O.11.3e="7A";3k=e.7z;2Z=e.7x;7(a=="3d")e.O.11.3e="3d";e.O.3s(e)}});u p=="1m"?3k:2Z}u 6.2F(e,p)},2F:q(e,a,d){v g;7(a=="1e"&&6.H.V){g=6.16(e.11,"1e");u g==""?"1":g}7(a.3x(/39/i))a=6.H.V?"2t":"2x";7(!d&&e.11[a])g=e.11[a];C 7(P.2P&&P.2P.3T){7(a.3x(/39/i))a="39";a=a.1k(/([A-Z])/g,"-$1").2C();v b=P.2P.3T(e,F);7(b)g=b.50(a);C 7(a=="15")g="1M";C 6.4g(e,{15:"2c"},q(){v c=P.2P.3T(9,"");g=c&&c.50(a)||""})}C 7(e.3N){v f=a.1k(/\\-(\\w)/g,q(m,c){u c.2Q()});g=e.3N[a]||e.3N[f]}u g},32:q(a,c){v r=[];c=c||P;6.D(a,q(i,b){7(!b)u;7(b.14==3u)b=b.3n();7(1c b=="1p"){v s=6.2u(b).2C(),1u=c.4x("1u"),1F=[];v a=!s.I("<76")&&[1,"<2m>","</2m>"]||!s.I("<74")&&[1,"<4V>","</4V>"]||(!s.I("<72")||!s.I("<1x")||!s.I("<6Y")||!s.I("<6X"))&&[1,"<1l>","</1l>"]||!s.I("<2S")&&[2,"<1l><1x>","</1x></1l>"]||(!s.I("<6W")||!s.I("<6V"))&&[3,"<1l><1x><2S>","</2S></1x></1l>"]||!s.I("<6T")&&[2,"<1l><4N>","</4N></1l>"]||[0,"",""];1u.2j=a[1]+b+a[2];1v(a[0]--)1u=1u.U;7(6.H.V){7(!s.I("<1l")&&s.I("<1x")<0)1F=1u.U&&1u.U.2N;C 7(a[1]=="<1l>"&&s.I("<1x")<0)1F=1u.2N;E(v n=1F.B-1;n>=0;--n)7(6.T(1F[n],"1x")&&!1F[n].2N.B)1F[n].O.3s(1F[n])}b=6.2w(1u.2N)}7(0===b.B&&!6(b).2V("2Y, 2m"))u;7(b[0]==G||6.T(b,"2Y")||b.6R)r.12(b);C r=6.1R(r,b)});u r},16:q(c,d,a){v e=6.3X(c)?{}:{"E":"6O","6L":"W","39":6.H.V?"2t":"2x",2x:6.H.V?"2t":"2x",2t:6.H.V?"2t":"2x",2j:"2j",W:"W",2p:"2p",2r:"2r",2z:"2z",6I:"6G",2o:"2o",6D:"6C"};7(d=="1e"&&6.H.V){7(a!=G){c.5M=1;c.1f=(c.1f||"").1k(/4U\\([^)]*\\)/,"")+(2U(a).3n()=="6z"?"":"4U(1e="+a*4X+")")}u c.1f?(2U(c.1f.3x(/1e=([^)]*)/)[1])/4X).3n():""}7(e[d]){7(a!=G)c[e[d]]=a;u c[e[d]]}C 7(a==G&&6.H.V&&6.T(c,"2Y")&&(d=="6v"||d=="6u"))u c.6r(d).5F;C 7(c.5r){7(a!=G)c.6n(d,a);7(6.H.V&&/4Y|2n/.1o(d)&&!6.3X(c))u c.2T(d,2);u c.2T(d)}C{d=d.1k(/-([a-z])/6l,q(z,b){u b.2Q()});7(a!=G)c[d]=a;u c[d]}},2u:q(t){u t.1k(/^\\s+|\\s+$/g,"")},2w:q(a){v r=[];7(1c a!="6k")E(v i=0,21=a.B;i<21;i++)r.12(a[i]);C r=a.3U(0);u r},2X:q(b,a){E(v i=0,21=a.B;i<21;i++)7(a[i]==b)u i;u-1},1R:q(a,b){E(v i=0;b[i];i++)a.12(b[i]);u a},59:q(a){v r=[],3C=6.3c++;E(v i=0,5K=a.B;i<5K;i++)7(3C!=a[i].3c){a[i].3c=3C;r.12(a[i])}u r},3c:0,2s:q(c,b,d){7(1c b=="1p")b=Y 3q("a","i","u "+b);v a=[];E(v i=0,3l=c.B;i<3l;i++)7(!d&&b(c[i],i)||d&&!b(c[i],i))a.12(c[i]);u a},2y:q(c,b){7(1c b=="1p")b=Y 3q("a","u "+b);v d=[],r=[];E(v i=0,3l=c.B;i<3l;i++){v a=b(c[i],i);7(a!==F&&a!=G){7(a.14!=25)a=[a];d=d.6b(a)}}u d}});Y q(){v b=6a.69.2C();6.H={68:b.3x(/.+(?:66|65|62|61)[\\/: ]([\\d.]+)/)[1],2e:/4t/.1o(b),2k:/2k/.1o(b),V:/V/.1o(b)&&!/2k/.1o(b),3t:/3t/.1o(b)&&!/(5X|4t)/.1o(b)};6.5W=!6.H.V||P.5U=="5T"};6.D({4p:"a.O",4m:"6.4m(a)",8n:"6.1E(a,2,\'1S\')",8j:"6.1E(a,2,\'5N\')",8f:"6.2i(a.O.U,a)",8e:"6.2i(a.U)"},q(i,n){6.N[i]=q(a){v b=6.2y(9,n);7(a&&1c a=="1p")b=6.2q(a,b);u 9.1Q(b)}});6.D({5f:"3v",8d:"5m",2E:"5l",8c:"5h"},q(i,n){6.N[i]=q(){v a=17;u 9.D(q(){E(v j=0,21=a.B;j<21;j++)6(a[j])[n](9)})}});6.D({5p:q(a){6.16(9,a,"");9.8a(a)},88:q(c){6.W.1w(9,c)},87:q(c){6.W.1z(9,c)},86:q(c){6.W[6.W.2K(9,c)?"1z":"1w"](9,c)},1z:q(a){7(!a||6.1f(a,[9]).r.B)9.O.3s(9)},3m:q(){1v(9.U)9.3s(9.U)}},q(i,n){6.N[i]=q(){u 9.D(n,17)}});6.D(["5L","5I","5H","5G"],q(i,n){6.N[n]=q(a,b){u 9.1f(":"+n+"("+a+")",b)}});6.D(["1m","2f"],q(i,n){6.N[n]=q(h){u h==G?(9.B?6.1a(9[0],n):F):9.1a(n,h.14==36?h:h+"4h")}});6.1d({24:{"":"m[2]==\'*\'||6.T(a,m[2])","#":"a.2T(\'23\')==m[2]",":":{5I:"i<m[3]-0",5H:"i>m[3]-0",1E:"m[3]-0==i",5L:"m[3]-0==i",5E:"i==0",2l:"i==r.B-1",5C:"i%2==0",5B:"i%2","1E-3o":"6.1E(a.O.U,m[3],\'1S\',a)==a","5E-3o":"6.1E(a.O.U,1,\'1S\')==a","2l-3o":"6.1E(a.O.82,1,\'5N\')==a","81-3o":"6.2i(a.O.U).B==1",4p:"a.U",3m:"!a.U",5G:"6.N.2g.L([a]).I(m[3])>=0",3W:\'"1B"!=a.J&&6.1a(a,"15")!="1M"&&6.1a(a,"42")!="1B"\',1B:\'"1B"==a.J||6.1a(a,"15")=="1M"||6.1a(a,"42")=="1B"\',80:"!a.2r",2r:"a.2r",2z:"a.2z",2o:"a.2o||6.16(a,\'2o\')",2g:"\'2g\'==a.J",46:"\'46\'==a.J",5z:"\'5z\'==a.J",4f:"\'4f\'==a.J",5y:"\'5y\'==a.J",4e:"\'4e\'==a.J",5x:"\'5x\'==a.J",5w:"\'5w\'==a.J",1N:\'"1N"==a.J||6.T(a,"1N")\',5v:"/5v|2m|7Z|1N/i.1o(a.T)"},".":"6.W.2K(a,m[2])","@":{"=":"z==m[4]","!=":"z!=m[4]","^=":"z&&!z.I(m[4])","$=":"z&&z.2H(z.B - m[4].B,m[4].B)==m[4]","*=":"z&&z.I(m[4])>=0","":"z",4d:q(m){u["",m[1],m[3],m[2],m[5]]},5u:"v z=a[m[3]];7(!z||/4Y|2n/.1o(m[3]))z=6.16(a,m[3]);"},"[":"6.1J(m[2],a).B"},5t:[/^\\[ *(@)([\\w-]+) *([!*$^=]*) *(\'?"?)(.*?)\\4 *\\]/,/^(\\[)\\s*(.*?(\\[.*?\\])?[^[]*?)\\s*\\]/,/^(:)([\\w-]+)\\("?\'?(.*?(\\(.*?\\))?[^(]*?)"?\'?\\)/,Y 3h("^([:.#]*)("+(6.2B="(?:[\\\\w\\7U-\\7S*1L-]|\\\\\\\\.)")+"+)")],3g:[/^(\\/?\\.\\.)/,"a.O",/^(>|\\/)/,"6.2i(a.U)",/^(\\+)/,"6.1E(a,2,\'1S\')",/^(~)/,q(a){v s=6.2i(a.O.U);u s.3U(6.2X(a,s)+1)}],2q:q(a,c,b){v d,1K=[];1v(a&&a!=d){d=a;v f=6.1f(a,c,b);a=f.t.1k(/^\\s*,\\s*/,"");1K=b?c=f.r:6.1R(1K,f.r)}u 1K},1J:q(t,k){7(1c t!="1p")u[t];7(k&&!k.1y)k=F;k=k||P;7(!t.I("//")){k=k.4c;t=t.2H(2,t.B)}C 7(!t.I("/")&&!k.2I){k=k.4c;t=t.2H(1,t.B);7(t.I("/")>=1)t=t.2H(t.I("/"),t.B)}v d=[k],2d=[],2l;1v(t&&2l!=t){v r=[];2l=t;t=6.2u(t).1k(/^\\/\\//,"");v e=M;v b=Y 3h("^[/>]\\\\s*("+6.2B+"+)");v m=b.27(t);7(m){E(v i=0;d[i];i++)E(v c=d[i].U;c;c=c.1S)7(c.1y==1&&(m[1]=="*"||6.T(c,m[1])))r.12(c);d=r;t=t.1k(b,"");7(t.I(" ")==0)7M;e=K}C{E(v i=0,5q=6.3g.B;i<5q;i+=2){v b=6.3g[i],N=6.3g[i+1];v m=b.27(t);7(m){r=d=6.2y(d,6.1b(N)?N:Y 3q("a","u "+N));t=6.2u(t.1k(b,""));e=K;1H}}}7(t&&!e){7(!t.I(",")){7(k==d[0])d.4a();2d=6.1R(2d,d);r=d=[k];t=" "+t.2H(1,t.B)}C{v f=Y 3h("^("+6.2B+"+)(#)("+6.2B+"+)");v m=f.27(t);7(m){m=[0,m[2],m[3],m[1]]}C{f=Y 3h("^([#.]?)("+6.2B+"*)");m=f.27(t)}m[2]=m[2].1k(/\\\\/g,"");v h=d[d.B-1];7(m[1]=="#"&&h&&h.49){v j=h.49(m[2]);7((6.H.V||6.H.2k)&&j&&1c j.23=="1p"&&j.23!=m[2])j=6(\'[@23="\'+m[2]+\'"]\',h)[0];d=r=j&&(!m[3]||6.T(j,m[3]))?[j]:[]}C{E(v i=0;d[i];i++){v a=m[1]!=""||m[0]==""?"*":m[2];7(a=="*"&&d[i].T.2C()=="7K")a="2D";r=6.1R(r,d[i].4y(a))}7(m[1]==".")r=6.48(r,m[2]);7(m[1]=="#"){v g=[];E(v i=0;r[i];i++)7(r[i].2T("23")==m[2]){g=[r[i]];1H}r=g}d=r}t=t.1k(f,"")}}7(t){v l=6.1f(t,r);d=r=l.r;t=6.2u(l.t)}}7(t)d=[];7(d&&k==d[0])d.4a();2d=6.1R(2d,d);u 2d},48:q(r,m,a){m=" "+m+" ";v b=[];E(v i=0;r[i];i++){v c=(" "+r[i].W+" ").I(m)>=0;7(!a&&c||a&&!c)b.12(r[i])}u b},1f:q(t,r,a){v b;1v(t&&t!=b){b=t;v p=6.5t,m;E(v i=0;p[i];i++){m=p[i].27(t);7(m){t=t.7G(m[0].B);7(6.24[m[1]].4d)m=6.24[m[1]].4d(m);m[2]=m[2].1k(/\\\\/g,"");1H}}7(!m)1H;7(m[1]==":"&&m[2]=="4R")r=6.1f(m[3],r,K).r;C 7(m[1]==".")r=6.48(r,m[2],a);C{v f=6.24[m[1]];7(1c f!="1p")f=6.24[m[1]][m[2]];45("f = q(a,i){"+(6.24[m[1]].5u||"")+"u "+f+"}");r=6.2s(r,f,a)}}u{r:r,t:t}},4m:q(c){v b=[];v a=c.O;1v(a&&a!=P){b.12(a);a=a.O}u b},1E:q(a,e,c,b){e=e||1;v d=0;E(;a;a=a[c]){7(a.1y==1)d++;7(d==e||e=="5C"&&d%2==0&&d>1&&a==b||e=="5B"&&d%2==1&&a==b)1H}u a},2i:q(n,a){v r=[];E(;n;n=n.1S){7(n.1y==1&&(!a||n!=a))r.12(n)}u r}});6.Q={1w:q(c,d,b,a){7(6.H.V&&c.3f!=G)c=18;7(a!=G){v e=b;b=q(){u e.L(9,17)};b.R=a;b.1t=e.1t}7(!b.1t){b.1t=9.1t++;7(e)e.1t=b.1t}7(!c.$19)c.$19={};7(!c.$1r)c.$1r=q(){6.Q.1r.L(c,17)};v f=c.$19[d];7(!f){f=c.$19[d]={};7(c.43)c.43(d,c.$1r,M);C 7(c.5o)c.5o("5n"+d,c.$1r)}f[b.1t]=b;7(!9.1h[d])9.1h[d]=[];9.1h[d].12(c)},1t:1,1h:{},1z:q(b,c,a){v d=b.$19,1U;7(d){7(c&&c.J){a=c.41;c=c.J}7(!c){E(c S d)9.1z(b,c)}C 7(d[c]){7(a)40 d[c][a.1t];C E(a S b.$19[c])40 d[c][a];E(1U S d[c])1H;7(!1U){7(b.4o)b.4o(c,b.$1r,M);C 7(b.5k)b.5k("5n"+c,b.$1r);1U=F;40 d[c]}}E(1U S d)1H;7(!1U)b.$1r=b.$19=F}},1n:q(c,b,d){b=6.2w(b||[]);7(!d)6.D(9.1h[c]||[],q(){6.Q.1n(c,b,9)});C{v a,1U,N=6.1b(d[c]||F);b.5j(9.4b({J:c,1O:d}));7((a=9.1r.L(d,b))!==M)9.3Z=K;7(N&&a!==M&&!6.T(d,\'a\'))d[c]();9.3Z=M}},1r:q(b){v a;7(1c 6=="G"||6.Q.3Z)u a;b=6.Q.4b(b||18.Q||{});v c=9.$19&&9.$19[b.J],1W=[].3U.4l(17,1);1W.5j(b);E(v j S c){1W[0].41=c[j];1W[0].R=c[j].R;7(c[j].L(9,1W)===M){b.1V();b.2b();a=M}}7(6.H.V)b.1O=b.1V=b.2b=b.41=b.R=F;u a},4b:q(b){7(!b.1O&&b.5g)b.1O=b.5g;7(!b.3Y&&b.4n)b.3Y=b.4n==b.1O?b.7B:b.4n;7(b.5e==F&&b.5d!=F)b.5e=b.5d;7(b.3r==F&&b.1N!=F)b.3r=(b.1N&1?1:(b.1N&2?3:(b.1N&4?2:0)));7(b.5c==F&&b.5b!=F){v e=P.4c||P.4u;b.5c=b.5b+e.7y;b.7w=b.7v+e.7u}7((b.3r==F||b.J=="3V")&&b.4i!=F)b.3r=b.4i;7(b.58==F&&b.J=="3V")b.58=b.4i;7(6.H.2e&&b.1O.1y==3){v a=b;b=6.1d({},a);b.1O=a.1O.O;b.1V=q(){u a.1V()};b.2b=q(){u a.2b()}}7(!b.1V)b.1V=q(){9.7t=M};7(!b.2b)b.2b=q(){9.7s=K};u b}};6.N.1d({38:q(c,a,b){u 9.D(q(){6.Q.1w(9,c,b||a,b&&a)})},57:q(d,b,c){u 9.D(q(){6.Q.1w(9,d,q(a){6(9).3P(a);u(c||b).L(9,17)},c&&b)})},3P:q(a,b){u 9.D(q(){6.Q.1z(9,a,b)})},1n:q(a,b){u 9.D(q(){6.Q.1n(a,b,9)})},1G:q(){v a=17;u 9.55(q(e){9.3A=0==9.3A?1:0;e.1V();u a[9.3A].L(9,[e])||M})},7q:q(f,g){q 3S(e){v p=e.3Y;1v(p&&p!=9)1Z{p=p.O}20(e){p=9};7(p==9)u M;u(e.J=="3R"?f:g).L(9,[e])}u 9.3R(3S).52(3S)},1C:q(f){7(6.37)f.L(P,[6]);C{6.2v.12(q(){u f.L(9,[6])})}u 9}});6.1d({37:M,2v:[],1C:q(){7(!6.37){6.37=K;7(6.2v){6.D(6.2v,q(){9.L(P)});6.2v=F}7(6.H.3t||6.H.2k)P.4o("51",6.1C,M);6(18).1T(q(){6("#3Q").1z()})}}});Y q(){6.D(("7p,7o,1T,7m,7k,3O,55,7j,"+"7i,7h,7g,3R,52,7e,2m,"+"4e,7d,3V,7c,28").2L(","),q(i,o){6.N[o]=q(f){u f?9.38(o,f):9.1n(o)}});7(6.H.3t||6.H.2k)P.43("51",6.1C,M);C 7(6.H.V){P.7b("<7a"+"79 23=3Q 78=K "+"2n=//:><\\/35>");v a=P.49("3Q");7(a)a.75=q(){7(9.34!="1s")u;6.1C()};a=F}C 7(6.H.2e)6.3K=3f(q(){7(P.34=="73"||P.34=="1s"){3I(6.3K);6.3K=F;6.1C()}},10);6.Q.1w(18,"1T",6.1C)};7(6.H.V)6(18).57("3O",q(){v a=6.Q.1h;E(v b S a){v c=a[b],i=c.B;7(i&&b!=\'3O\')71 6.Q.1z(c[i-1],b);1v(--i)}});6.N.1d({6Z:q(c,b,a){9.1T(c,b,a,1)},1T:q(g,d,c,e){7(6.1b(g))u 9.38("1T",g);c=c||q(){};v f="3G";7(d)7(6.1b(d)){c=d;d=F}C{d=6.2D(d);f="4T"}v h=9;6.31({1A:g,J:f,R:d,2O:e,1s:q(a,b){7(b=="26"||!e&&b=="4S")h.16("2j",a.3p).3F().D(c,[a.3p,b,a]);C c.L(h,[a.3p,b,a])}});u 9},6U:q(){u 6.2D(9)},3F:q(){u 9.1J("35").D(q(){7(9.2n)6.4Q(9.2n);C 6.3E(9.2g||9.6S||9.2j||"")}).2M()}});6.D("4O,4H,4G,4M,4L,4K".2L(","),q(i,o){6.N[o]=q(f){u 9.38(o,f)}});6.1d({1I:q(e,c,a,d,b){7(6.1b(c)){a=c;c=F}u 6.31({J:"3G",1A:e,R:c,26:a,3D:d,2O:b})},6Q:q(d,b,a,c){u 6.1I(d,b,a,c,1)},4Q:q(b,a){u 6.1I(b,F,a,"35")},6P:q(c,b,a){u 6.1I(c,b,a,"4J")},6N:q(d,b,a,c){7(6.1b(b)){a=b;b={}}u 6.31({J:"4T",1A:d,R:b,26:a,3D:c})},6K:q(a){6.30.1P=a},6J:q(a){6.1d(6.30,a)},30:{1h:K,J:"3G",1P:0,4P:"6H/x-70-2Y-6E",4F:K,2W:K,R:F},33:{},31:q(s){s=6.1d({},6.30,s);7(s.R){7(s.4F&&1c s.R!="1p")s.R=6.2D(s.R);7(s.J.2C()=="1I"){s.1A+=((s.1A.I("?")>-1)?"&":"?")+s.R;s.R=F}}7(s.1h&&!6.3J++)6.Q.1n("4O");v f=M;v h=18.4E?Y 4E("6B.77"):Y 4D();h.6A(s.J,s.1A,s.2W);7(s.R)h.3L("6y-6x",s.4P);7(s.2O)h.3L("6w-47-7f",6.33[s.1A]||"6t, 6s 6q 6p 3M:3M:3M 7l");h.3L("X-7n-6m","4D");7(s.4C)s.4C(h);7(s.1h)6.Q.1n("4K",[h,s]);v g=q(d){7(h&&(h.34==4||d=="1P")){f=K;7(i){3I(i);i=F}v c;1Z{c=6.4B(h)&&d!="1P"?s.2O&&6.53(h,s.1A)?"4S":"26":"28";7(c!="28"){v b;1Z{b=h.3B("4A-47")}20(e){}7(s.2O&&b)6.33[s.1A]=b;v a=6.4Z(h,s.3D);7(s.26)s.26(a,c);7(s.1h)6.Q.1n("4L",[h,s])}C 6.3b(s,h,c)}20(e){c="28";6.3b(s,h,c,e)}7(s.1h)6.Q.1n("4G",[h,s]);7(s.1h&&!--6.3J)6.Q.1n("4H");7(s.1s)s.1s(h,c);7(s.2W)h=F}};v i=3f(g,13);7(s.1P>0)56(q(){7(h){h.6j();7(!f)g("1P")}},s.1P);1Z{h.6i(s.R)}20(e){6.3b(s,h,F,e)}7(!s.2W)g();u h},3b:q(s,a,b,e){7(s.28)s.28(a,b,e);7(s.1h)6.Q.1n("4M",[a,s,e])},3J:0,4B:q(r){1Z{u!r.1X&&6h.6g=="4f:"||(r.1X>=5a&&r.1X<6f)||r.1X==5J||6.H.2e&&r.1X==G}20(e){}u M},53:q(a,c){1Z{v b=a.3B("4A-47");u a.1X==5J||b==6.33[c]||6.H.2e&&a.1X==G}20(e){}u M},4Z:q(r,b){v c=r.3B("6e-J");v a=!b&&c&&c.I("5i")>=0;a=b=="5i"||a?r.6c:r.3p;7(b=="35")6.3E(a);7(b=="4J")45("R = "+a);7(b=="3H")6("<1u>").3H(a).3F();u a},2D:q(a){v s=[];7(a.14==25||a.3y)6.D(a,q(){s.12(2a(9.7H)+"="+2a(9.2p))});C E(v j S a)7(a[j]&&a[j].14==25)6.D(a[j],q(){s.12(2a(j)+"="+2a(9))});C s.12(2a(j)+"="+2a(a[j]));u s.5A("&")},3E:q(a){7(18.5R)18.5R(a);C 7(6.H.2e)18.56(a,0);C 45.4l(18,a)}});6.N.1d({1j:q(b,a){u b?9.1q({1m:"1j",2f:"1j",1e:"1j"},b,a):9.1f(":1B").D(q(){9.11.15=9.22?9.22:"";7(6.1a(9,"15")=="1M")9.11.15="2c"}).2M()},1i:q(b,a){u b?9.1q({1m:"1i",2f:"1i",1e:"1i"},b,a):9.1f(":3W").D(q(){9.22=9.22||6.1a(9,"15");7(9.22=="1M")9.22="2c";9.11.15="1M"}).2M()},4v:6.N.1G,1G:q(a,b){u 6.1b(a)&&6.1b(b)?9.4v(a,b):9.1q({1m:"1G",2f:"1G",1e:"1G"},a,b)},67:q(b,a){u 9.1q({1m:"1j"},b,a)},7P:q(b,a){u 9.1q({1m:"1i"},b,a)},7Q:q(b,a){u 9.1q({1m:"1G"},b,a)},64:q(b,a){u 9.1q({1e:"1j"},b,a)},63:q(b,a){u 9.1q({1e:"1i"},b,a)},7T:q(c,a,b){u 9.1q({1e:a},c,b)},1q:q(j,i,h,g){u 9.1g(q(){v c=6(9).2V(":1B");E(v p S j)7(j[p]=="1i"&&c||j[p]=="1j"&&!c)u;9.29=6.1d({},j);v d=6.5s(i,h,g);v f=9;6.D(j,q(a,b){v e=Y 6.2G(f,d,a);7(b.14==3u)e.2R(e.1K(),b);C e[b=="1G"?c?"1j":"1i":b](j)})})},1g:q(a,b){7(!b){b=a;a="2G"}u 9.D(q(){7(!9.1g)9.1g={};7(!9.1g[a])9.1g[a]=[];9.1g[a].12(b);7(9.1g[a].B==1)b.L(9)})}});6.1d({5s:q(b,a,c){v d=b&&b.14==60?b:{1s:c||!c&&a||6.1b(b)&&b,1D:b,3i:c&&a||a&&a.14!=3q&&a||"4s"};d.1D=(d.1D&&d.1D.14==3u?d.1D:{5Z:5Y,84:5a}[d.1D])||85;d.2J=d.1s;d.1s=q(){6.4q(9,"2G");7(6.1b(d.2J))d.2J.L(9)};u d},3i:{5V:q(p,n,b,a){u b+a*p},4s:q(p,n,b,a){u((-5D.89(p*5D.5S)/2)+0.5)*a+b}},1g:{},4q:q(b,a){a=a||"2G";7(b.1g&&b.1g[a]){b.1g[a].4a();v f=b.1g[a][0];7(f)f.L(b)}},3w:[],2G:q(h,e,j){v z=9;v y=h.11;7(j=="1m"||j=="2f"){v f=6.1a(h,"15");v g=y.4j;y.4j="1B"}z.a=q(){7(e.3z)e.3z.L(h,[z.2h]);7(j=="1e")6.16(y,"1e",z.2h);C{y[j]=8m(z.2h)+"4h";y.15="2c"}};z.5Q=q(){u 2U(6.1a(h,j))};z.1K=q(){v r=2U(6.2F(h,j));u r&&r>-8k?r:z.5Q()};z.2R=q(c,b){z.4k=(Y 5P()).5O();z.2h=c;z.a();6.3w.12(q(){u z.3z(c,b)});7(6.3w.B==1){v d=3f(q(){v a=6.3w;E(v i=0;i<a.B;i++)7(!a[i]())a.8g(i--,1);7(!a.B)3I(d)},13)}};z.1j=q(){7(!h.1Y)h.1Y={};h.1Y[j]=6.16(h.11,j);e.1j=K;z.2R(0,9.1K());7(j!="1e")y[j]="8o";6(h).1j()};z.1i=q(){7(!h.1Y)h.1Y={};h.1Y[j]=6.16(h.11,j);e.1i=K;z.2R(9.1K(),0)};z.3z=q(a,c){v t=(Y 5P()).5O();7(t>e.1D+z.4k){z.2h=c;z.a();7(h.29)h.29[j]=K;v b=K;E(v i S h.29)7(h.29[i]!==K)b=M;7(b){7(f!=F){y.4j=g;y.15=f;7(6.1a(h,"15")=="1M")y.15="2c"}7(e.1i)y.15="1M";7(e.1i||e.1j)E(v p S h.29)6.16(y,p,h.1Y[p])}7(b&&6.1b(e.1s))e.1s.L(h);u M}C{v n=t-9.4k;v p=n/e.1D;z.2h=6.3i[e.3i](p,n,a,(c-a),e.1D);z.a()}u K}}})}',62,522,'||||||jQuery|if||this|||||||||||||||||function||||return|var||||||length|else|each|for|null|undefined|browser|indexOf|type|true|apply|false|fn|parentNode|document|event|data|in|nodeName|firstChild|msie|className||new|||style|push||constructor|display|attr|arguments|window|events|css|isFunction|typeof|extend|opacity|filter|queue|global|hide|show|replace|table|height|trigger|test|string|animate|handle|complete|guid|div|while|add|tbody|nodeType|remove|url|hidden|ready|duration|nth|tb|toggle|break|get|find|cur|_|none|button|target|timeout|pushStack|merge|nextSibling|load|ret|preventDefault|args|status|orig|try|catch|al|oldblock|id|expr|Array|success|exec|error|curAnim|encodeURIComponent|stopPropagation|block|done|safari|width|text|now|sibling|innerHTML|opera|last|select|src|selected|value|multiFilter|disabled|grep|styleFloat|trim|readyList|makeArray|cssFloat|map|checked|domManip|chars|toLowerCase|param|insertBefore|curCSS|fx|substr|ownerDocument|old|has|split|end|childNodes|ifModified|defaultView|toUpperCase|custom|tr|getAttribute|parseFloat|is|async|inArray|form|oWidth|ajaxSettings|ajax|clean|lastModified|readyState|script|String|isReady|bind|float||handleError|mergeNum|static|position|setInterval|token|RegExp|easing|cloneNode|oHeight|el|empty|toString|child|responseText|Function|which|removeChild|mozilla|Number|append|timers|match|jquery|step|lastToggle|getResponseHeader|num|dataType|globalEval|evalScripts|GET|html|clearInterval|active|safariTimer|setRequestHeader|00|currentStyle|unload|unbind|__ie_init|mouseover|handleHover|getComputedStyle|slice|keypress|visible|isXMLDoc|relatedTarget|triggered|delete|handler|visibility|addEventListener|appendChild|eval|radio|Modified|classFilter|getElementById|shift|fix|documentElement|_resort|submit|file|swap|px|keyCode|overflow|startTime|call|parents|fromElement|removeEventListener|parent|dequeue|ol|swing|webkit|body|_toggle|prop|createElement|getElementsByTagName|setArray|Last|httpSuccess|beforeSend|XMLHttpRequest|ActiveXObject|processData|ajaxComplete|ajaxStop|init|json|ajaxSend|ajaxSuccess|ajaxError|colgroup|ajaxStart|contentType|getScript|not|notmodified|POST|alpha|fieldset|index|100|href|httpData|getPropertyValue|DOMContentLoaded|mouseout|httpNotModified|prevObject|click|setTimeout|one|charCode|unique|200|clientX|pageX|ctrlKey|metaKey|appendTo|srcElement|after|xml|unshift|detachEvent|before|prepend|on|attachEvent|removeAttr|tl|tagName|speed|parse|_prefix|input|reset|image|password|checkbox|join|odd|even|Math|first|nodeValue|contains|gt|lt|304|fl|eq|zoom|previousSibling|getTime|Date|max|execScript|PI|CSS1Compat|compatMode|linear|boxModel|compatible|600|slow|Object|ie|ra|fadeOut|fadeIn|it|rv|slideDown|version|userAgent|navigator|concat|responseXML|noConflict|content|300|protocol|location|send|abort|array|ig|With|setAttribute|reverse|1970|Jan|getAttributeNode|01|Thu|method|action|If|Type|Content|NaN|open|Microsoft|maxLength|maxlength|urlencoded|val|readOnly|application|readonly|ajaxSetup|ajaxTimeout|class|FORM|post|htmlFor|getJSON|getIfModified|options|textContent|col|serialize|th|td|colg|tfoot|loadIfModified|www|do|thead|loaded|leg|onreadystatechange|opt|XMLHTTP|defer|ipt|scr|write|keyup|keydown|change|Since|mousemove|mouseup|mousedown|dblclick|scroll|GMT|resize|Requested|focus|blur|hover|clone|cancelBubble|returnValue|scrollTop|clientY|pageY|clientWidth|scrollLeft|clientHeight|relative|toElement|left|right|absolute|size|substring|name|offsetWidth|offsetHeight|object|Width|continue|border|padding|slideUp|slideToggle|Left|uFFFF|fadeTo|u0128|Right|Bottom|Top|elements|textarea|enabled|only|lastChild|wrap|fast|400|toggleClass|removeClass|addClass|cos|removeAttribute|line|insertAfter|prependTo|children|siblings|splice|weight|createTextNode|prev|10000|font|parseInt|next|1px|prototype'.split('|'),0,{}))

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


/* units.js */





SimileAjax.NativeDateUnit=new Object();



SimileAjax.NativeDateUnit.makeDefaultValue=function(){

return new Date();

};



SimileAjax.NativeDateUnit.cloneValue=function(v){

return new Date(v.getTime());

};



SimileAjax.NativeDateUnit.getParser=function(format){

if(typeof format=="string"){

format=format.toLowerCase();

}

return(format=="iso8601"||format=="iso 8601")?

SimileAjax.DateTime.parseIso8601DateTime:

SimileAjax.DateTime.parseGregorianDateTime;

};



SimileAjax.NativeDateUnit.parseFromObject=function(o){

return SimileAjax.DateTime.parseGregorianDateTime(o);

};



SimileAjax.NativeDateUnit.toNumber=function(v){

return v.getTime();

};



SimileAjax.NativeDateUnit.fromNumber=function(n){

return new Date(n);

};



SimileAjax.NativeDateUnit.compare=function(v1,v2){

var n1,n2;

if(typeof v1=="object"){

n1=v1.getTime();

}else{

n1=Number(v1);

}

if(typeof v2=="object"){

n2=v2.getTime();

}else{

n2=Number(v2);

}



return n1-n2;

};



SimileAjax.NativeDateUnit.earlier=function(v1,v2){

return SimileAjax.NativeDateUnit.compare(v1,v2)<0?v1:v2;

};



SimileAjax.NativeDateUnit.later=function(v1,v2){

return SimileAjax.NativeDateUnit.compare(v1,v2)>0?v1:v2;

};



SimileAjax.NativeDateUnit.change=function(v,n){

return new Date(v.getTime()+n);

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

SimileAjax.DOM.registerEvent(document.body,"mousedown",SimileAjax.WindowManager._onBodyMouseDown);
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

SimileAjax.WindowManager._onBodyMouseDown=function(elmt,evt,target){
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