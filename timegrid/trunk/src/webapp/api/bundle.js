

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

