/*
  RFC4180 gives specific rules for csv that seem as good to follow as any
  the only complexity arises from use of " as discussed there.  We don't yet 
  seem to obey the spec: 

  5.  Each field may or may not be enclosed in double quotes (however
  some programs, such as Microsoft Excel, do not use double quotes
  at all).  If fields are not enclosed with double quotes, then
  double quotes may not appear inside the fields.  For example:

  "aaa","bbb","ccc" CRLF
  zzz,yyy,xxx

  6.  Fields containing line breaks (CRLF), double quotes, and commas
  should be enclosed in double-quotes.  For example:

  "aaa","b CRLF
  bb","ccc" CRLF
  zzz,yyy,xxx

  7.  If double-quotes are used to enclose fields, then a double-quote
  appearing inside a field must be escaped by preceding it with
  another double quote.  For example:

  "aaa","b""bb","ccc"
*/

Exhibit.TsvImporter = {
};
Exhibit.CsvImporter = {
};
Exhibit.TsvCsvImporter = {
};


//the importer will be called with any of the following MIME types
Exhibit.importers["text/comma-separated-values"] = Exhibit.CsvImporter;
Exhibit.importers["text/csv"] = Exhibit.CsvImporter;
Exhibit.importers["text/tab-separated-values"] = Exhibit.TsvImporter;
Exhibit.importers["text/tsv"] = Exhibit.TsvImporter;

Exhibit.TsvImporter.parse = function(content, link, url) {
    return Exhibit.TsvCsvImporter.parse(content, link, url, "\t")
}
Exhibit.CsvImporter.parse = function(content, link, url) {
    return Exhibit.TsvCsvImporter.parse(content, link, url, ",")
}

Exhibit.TsvCsvImporter.parse = function(content, link, url, separator) {
    var url=link;
    var hasColumnTitles=true;
    var expressionString=null;

    if (typeof link != "string") {//link tag; get attributes
	url = link.href;
	expressionString = Exhibit.getAttribute(link, "properties"); 
	if (expressionString) {
	    //if properties specified in link, assume no column titles
	    //unless overridden by specifying hasColumnTitle=true
	    hasColumnTitles = Exhibit.getAttribute(link, "hasColumnTitles");
	}
    }
    var valueSeparator=Exhibit.getAttribute(link,"valueSeparator");

    var o = null;
    try {
        o = Exhibit.TsvCsvImporter._parseInternal(content, separator, expressionString, hasColumnTitles, valueSeparator); //text is converted to Exhibit JSON
    } catch (e) {
	SimileAjax.Debug.exception(e, "Error parsing tsv/csv from " + url);
    }
    return o;
}

Exhibit.TsvCsvImporter._parseInternal = function(text, separator, expressionString, hasColumnTitles, valueSeparator) {
    var data = Exhibit.TsvCsvImporter.CsvToArray(text, separator);
    var exprs= null;
    var propNames = [];
    var properties = [];

    if (hasColumnTitles) {
	exprs = data.shift();
    }
    if (expressionString) {
	exprs = expressionString.split(",");
	//can override header row from column titles 
    }
    if (!exprs) {
	SimileAjax.Debug.exception(new Error("No property names defined for tsv/csv file"));
    }
    for (i=0; i<exprs.length; i++) {
	var expr = exprs[i].split(":");
	propNames[i] = expr[0];
	if (expr.length > 1) {
	    properties[propNames[i]] = {valueType: expr[1]};
	}
    }
    var items=[];
    for (i=0; i<data.length; i++) {
	var row=data[i];
	var item={};
	var len=row.length > exprs.length ? row.length : exprs.length;
	for (j=0; j<len; j++) {
	    if (valueSeparator && (row[j].indexOf(valueSeparator) >= 0)) {
		row[j]=row[j].split(valueSeparator);
	    }
	    item[propNames[j]]=row[j];
	}
	items.push(item);
    }
    return {items: items, properties: properties}
}


Exhibit.TsvCsvImporter.CsvToArray =function(text,separator){
    var i;
    text = text.replace(/\r\n/g,"\n"); //handle IE newline convention
    if (text.indexOf('"') < 0) { 
	//fast case: no quotes
	var lines=text.split('\n');
	for (i=0; i<lines.length; i++) {
	    lines[i]=lines[i].split(separator);
	} 
	return lines;
    }

    /*end of early return from simple case.  
      below we have to handle strings with doublequotes
      doublequotes alternately activate and deactivate quoting
      paired doublequotes (which appear inside quoted strings to signify a doublequote)
      can be thought of as doing the same since they cancel
      paired doublequotes that are _unquoted_ are just quoted empty strings, should vanish
      while paired doublequotes that are _quoted_ should turn into one doublequote

      we want to split lines on newlines that are not "inside" quotes.  
      and fields on commas that are not "inside" quotes
      in other words, with an even number of quotes preceding

      it would be natural to use "split" here, but split swallows the whole regexp
      so we can't say "preceded by even quotes" without swallowing the quotes.

      this regexp will work correctly for all valid csv (balanced double quotes)
      it will return unpredictable values for invalid cases 
         (odd numbers of quotes, or pairs of doublequotes outside doublequoted fields)
      a csv line is a newline-terminated sequence of "fragments", each of which is either
         a string with no double quotes or newlines, or
         a (possibly empty) string without double quotes but between a pair of double quotes
      we require at least one fragment to avoid empty lines
      we use a lookahead pattern at the end to avoid including the newline in the match
      and use nongreedy matching so we find ALL unquoted newlines*/

    var lines=text.match(/(([^\n"]+?)|("[^"]*?"))+?(?=\n|$)/g);

    /*it would be nice to use the same trick for splitting fields on the separator e.g. comma
      unfortunately empty strings are meaningful in csv: 
         a,b,,d,e means an empty field between b and d
      if we modify the above regexp to allow empty strings, we get bitten by lookahead:
      after matching up to a comma, the regexp next matches the empty string before the comma
      producing lots of spurious matches
      it's also hard to distinguish a comma following a real exp and one following a comma
      also the regexp would need to specifically handle commas at beginning and end of line.
      big mess.   
      so we take a different approach
    */
    var records=[];
    for (i=0; i<lines.length; i++) {
	var pieces=lines[i].split('"');
	var fields=pieces[0].split(separator); 
	var j=1;
	while (j<pieces.length) {
	    //given fields[last] contains previous unquoted section
	    //collect next quoted section
	    //until start of start next unquoted section
	    //then concatenate quoted sec into last bit of previous unquoted
	    //and first bit of following unquoted

	    //begin at quoted segment
	    var quoted=[pieces[j++]];
	    while (pieces[j].length==0) {
		//next quote immediately followed by a quote
		//i.e. found an escaped (doubled) quote
		j=j+1; //skip over empty---will insert single " here at join 
		quoted.push(pieces[j++]); //stuff up to next quote is still quoted
	    }
	    //nonzero next piece, so found isolated closing quote
	    quoted=quoted.join('"');
	    //now in unquoted state
	    //rfc woiuld say a separator appears next
	    //meaning fieldsNext[0] is empty string
	    //but be robust in case there's more string
	    var fieldsNext=pieces[j++].split(separator);
	    fieldsNext[0]=fields.pop().concat(quoted,fieldsNext[0]);
	    [].push.apply(fields,fieldsNext);
	}
	records.push(fields);
    }
return records;
}
