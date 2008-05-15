Exhibit.DatePickerFacet.DatePicker = function(div, facet, date) {
    this._div = div;
    this._facet = facet;
    this._currentDate = date;
    this._highlight = false;
};

Exhibit.DatePickerFacet.DatePicker.create = function(div, facet, date) {
  DatePicker = new Exhibit.DatePickerFacet.DatePicker(div, facet, date);
  DatePicker._div.appendChild(DatePicker.buildCal());
  return DatePicker;
};

Exhibit.DatePickerFacet.DatePicker.prototype.update = function(date) {
  if(typeof date == 'undefined')
    date = this._currentDate;
    
  while(this._div.hasChildNodes()){
    this._div.removeChild(this._div.lastChild);
  }
  this._currentDate = date;
  this._div.appendChild(DatePicker.buildCal());
}

Exhibit.DatePickerFacet.DatePicker.daysInMonth = [31,0,31,30,31,30,31,31,30,31,30,31];

Exhibit.DatePickerFacet.DatePicker.prototype.buildCal = function(){
  var y = this._currentDate.getFullYear();
  var m = this._currentDate.getMonth()+1;
  
  var self = this;
  
  var bom = new Date(y, m-1, 1);
  bom.start_dow = bom.getDay()+1;

  var todaydate=new Date();
  var scanfortoday = (y==todaydate.getFullYear() && m==todaydate.getMonth()+1) ? todaydate.getDate() : 0;

  // Handle leap year
  Exhibit.DatePickerFacet.DatePicker.daysInMonth[1]=(((bom.getFullYear()%100!=0)&&(bom.getFullYear()%4==0))||(bom.getFullYear()%400==0)) ? 29 :  28;
  
  // Calculate previous and next months
  base = new Date(y, m-1, 1);
  var eolm = new Date(base.setDate(base.getDate()-1))
  base = new Date(y, m-1, 1);
  var bonm = new Date(base.setDate(base.getDate()+Exhibit.DatePickerFacet.DatePicker.daysInMonth[m-1]+1));
  
  // Table header
  var t = ['<tbody id="tbody"><tr align="center">'];
  t.push('<td colspan="8" align="center">');
  t.push('<table cellpadding="0" cellspacing="0" class="month-header"><tr><td class="previous-month"><a href="javascript:{}" id="prevLink">' + Exhibit.DatePickerFacet.DateUtil.MONTH_NAMES[eolm.getMonth()+12] + '</a></td>');
  t.push('<td width="100%" align="center" class="current-month">'+Exhibit.DatePickerFacet.DateUtil.MONTH_NAMES[m-1]+', '+y+'</td>');
  t.push('<td class="next-month"><a href="javascript:{}" id="nextLink">' + Exhibit.DatePickerFacet.DateUtil.MONTH_NAMES[bonm.getMonth()+12] + '</a></td></tr></table></td>');
  t.push('</tr><tr align="center">');
  t.push('<td class="day-header exhibit-week-selector">&nbsp;</td>');

  for(s=0;s<7;s++) {
    t.push('<td class="day-header">'+"SMTWTFS".substr(s,1)+'</td>');
  }
  
  t.push('</tr></tbody>');

  // Create table
  var table = SimileAjax.DOM.createDOMFromString('table', t.join(''));
  table.elmt.className = 'exhibit-date-picker'
  table.elmt.cellpadding = '0';
  table.elmt.cellspacing = '0';
  
  // Attach previous/next actions
  SimileAjax.WindowManager.registerEvent(table.prevLink, "click", function(elmt, evt, target){
    self._facet.changeDate(Exhibit.DatePickerFacet.DateUtil.formatDate(eolm, self._facet._dateFormat));
    SimileAjax.DOM.cancelEvent(evt);
    return false;
  }, SimileAjax.WindowManager.getBaseLayer());
  SimileAjax.WindowManager.registerEvent(table.nextLink, "click", function(elmt, evt, target){
    self._facet.changeDate(Exhibit.DatePickerFacet.DateUtil.formatDate(bonm, self._facet._dateFormat));
    SimileAjax.DOM.cancelEvent(evt);
    return false;
  }, SimileAjax.WindowManager.getBaseLayer());

  // Build table contents
  var tr = null;
  var x, dayNum, curDate, cssClass;
  for(i=1;i<=42;i++){

    x = i - bom.start_dow;
    // Pxrevious month days
    if (x < 0) {
      dayNum = Exhibit.DatePickerFacet.DatePicker.daysInMonth[eolm.getMonth()] + x + 1;
      curDate = new Date(eolm.getFullYear(), eolm.getMonth(), dayNum);
      cssClass = 'previousMonth';
    }
    // Current month days
    if ((x >= 0) && (x < Exhibit.DatePickerFacet.DatePicker.daysInMonth[m-1])) {
     dayNum = i - bom.start_dow + 1;
     curDate = new Date(bom.getFullYear(), m-1, dayNum);
     cssClass = (x == scanfortoday ? 'currentMonth today' : 'currentMonth');
    }
    // Following month
    if (x >= Exhibit.DatePickerFacet.DatePicker.daysInMonth[m-1]) {
      dayNum = x - Exhibit.DatePickerFacet.DatePicker.daysInMonth[m-1] + 1;
      curDate = new Date(bonm.getFullYear(), bonm.getMonth(), dayNum);
      cssClass = 'nextMonth';
    }
    
    td = this.buildCell(curDate, cssClass);
    
    if (i == 1 || i%7 == 1) {
      if (tr != null) table.tbody.appendChild(tr);
      tr = this.buildRow(curDate);
    }
    
    tr.appendChild(td);
  }
  
  table.tbody.appendChild(tr);

  return table.elmt;

};

Exhibit.DatePickerFacet.DatePicker.prototype.buildRow = function(date) {
  var self = this;
  var toDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  toDate = new Date(toDate.setDate(toDate.getDate()+6));

  var dom = SimileAjax.DOM.createDOMFromString('tr', '');
  var subDom = SimileAjax.DOM.createDOMFromString('td', '<a href="javascript:{}" id="link"><span>></span></a>');
  subDom.elmt.className = 'exhibit-week-selector';
  subDom.link.className = (this._facet.dateRangeInCurrentRange({min: date, max: toDate}) ? 'selected' : '');
  SimileAjax.WindowManager.registerEvent(subDom.link, "click", function(elmt, evt, target){
     self._facet.selectRange(Exhibit.DatePickerFacet.DateUtil.formatDate(date, self._facet._dateFormat), 
                              Exhibit.DatePickerFacet.DateUtil.formatDate(toDate, self._facet._dateFormat));
     SimileAjax.DOM.cancelEvent(evt);
     return false;
   }, SimileAjax.WindowManager.getBaseLayer());
  dom.elmt.align = 'center';
  dom.elmt.appendChild(subDom.elmt);
  return dom.elmt;
};

Exhibit.DatePickerFacet.DatePicker.prototype.buildCell = function(date, cssClass) {
  var self = this;
  var dom = SimileAjax.DOM.createDOMFromString('td', date.getDate());
  dom.elmt.className = [cssClass, 
                        'day', 
                        (this._facet.dateInCurrentRange(date) ? 'selected' : ''), 
                        ((date.getDay() == 0 || date.getDay() == 6) ? 'weekend' : ''), 
                        (this._facet.dateHasItems(date) ? 'has-items' : '')].join(' ');
  dom.elmt.id = Exhibit.DatePickerFacet.DateUtil.formatDate(date, self._facet._dateFormat).replace(/[^a-zA-Z 0-9]+/g,'');
  dom.elmt.title = Exhibit.DatePickerFacet.DateUtil.formatDate(date, self._facet._dateFormat);
  SimileAjax.WindowManager.registerEvent(dom.elmt, "click", function(elmt, evt, target){
    self._facet.selectDate(Exhibit.DatePickerFacet.DateUtil.formatDate(date, self._facet._dateFormat));
    SimileAjax.DOM.cancelEvent(evt);
    return false;
  }, SimileAjax.WindowManager.getBaseLayer());
  
  // Attach highlight action
  SimileAjax.WindowManager.registerEvent(dom.elmt, "mouseover", function(elmt, evt, target){
    self.highlight(elmt);
    SimileAjax.DOM.cancelEvent(evt);
    return false;
  }, SimileAjax.WindowManager.getBaseLayer());
  
  return dom.elmt;
};

Exhibit.DatePickerFacet.DatePicker.prototype.highlight = function(elmt) {
  if (this._highlight) {
    // remove all highlighted classes
    $("td.day").each(function(i){
      $('#'+this.id).removeClass('highlight');
    });
    
    // get end points
    center = Exhibit.DatePickerFacet.DateUtil.parseDate(this._highlight);
    end = Exhibit.DatePickerFacet.DateUtil.parseDate(elmt.title);
    
    // swap if the end date is before the center date
    if (end < center) {
      old_end = end;
      end = center;
      center = old_end;
    }
    
    // Highlight all dates in range
    while(center <= end) {
      $('#'+ Exhibit.DatePickerFacet.DateUtil.formatDate(center, this._facet._dateFormat).replace(/[^a-zA-Z 0-9]+/g,'')).addClass('highlight');
      center.setDate(center.getDate()+1)
    }
    
  }
};

Exhibit.DatePickerFacet.DatePicker.prototype.startHighlighting = function(date) {
  this._highlight = date;
  dateObj = Exhibit.DatePickerFacet.DateUtil.parseDate(date);
  elmtId = Exhibit.DatePickerFacet.DateUtil.formatDate(dateObj, this._facet._dateFormat).replace(/[^a-zA-Z 0-9]+/g,'');
  elmt = $('#'+ elmtId).addClass('highlight');
  // alert(elmt.id)
  // this.highlight();
};

Exhibit.DatePickerFacet.DatePicker.prototype.stopHighlighting = function(date) {
  this._highlight = false;
};