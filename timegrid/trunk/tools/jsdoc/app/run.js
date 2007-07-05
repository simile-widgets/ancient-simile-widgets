var __DIR__;
try {fail();} catch(e) {
	var nameStart = Math.max(e.fileName.lastIndexOf("/")+1, e.fileName.lastIndexOf("\\")+1, 0);
	__DIR__ = e.fileName.substring(0, nameStart-1);
	__DIR__ += (__DIR__)? "/" : "";
}

load(__DIR__+"JsDoc.js");
load(__DIR__+"Util.js");
load(__DIR__+"JsIO.js");
load(__DIR__+"Symbol.js");
load(__DIR__+"JsToke.js");
load(__DIR__+"JsParse.js");
load(__DIR__+"DocTag.js");
load(__DIR__+"Doclet.js");
load(__DIR__+"JsPlate.js");

function Main() {
	if (JsDoc.opt.h || JsDoc.opt._.length == 0 || JsDoc.opt.t == "") JsDoc.usage();
	
	var ext = ["js"];
	if (JsDoc.opt.x) ext = JsDoc.opt.x.split(",").map(function(x) {return x.toLowerCase()});

	if (typeof(JsDoc.opt.r) == "boolean") JsDoc.opt.r=10;
	else if (!isNaN(parseInt(JsDoc.opt.r))) JsDoc.opt.r = parseInt(JsDoc.opt.r);
	else JsDoc.opt.r = 1;
		
	if (JsDoc.opt.d === true || JsDoc.opt.t === true) { // like when a user enters: -d mydir
		LOG.warn("-d JsDoc.option malformed.");
		JsDoc.usage();
	}
	else if (!JsDoc.opt.d) {
		JsDoc.opt.d = "js_docs_out";
	}
	JsDoc.opt.d += (JsDoc.opt.d.indexOf(IO.FileSeparator)==JsDoc.opt.d.length-1)?
		"" : IO.FileSeparator;
	LOG.inform("Creating output directory: "+JsDoc.opt.d);
	IO.makeDir(JsDoc.opt.d);
	
	LOG.inform("Scanning for source files: recursion set to "+JsDoc.opt.r+" subdir"+((JsDoc.opt.r==1)?"":"s")+".");
	function isJs(element, index, array) {
		var thisExt = element.split(".").pop().toLowerCase();
		return (ext.indexOf(thisExt) > -1); // we're only interested in files with certain extensions
	}
	var srcFiles = [];
	for (var d = 0; d < JsDoc.opt._.length; d++) {
		srcFiles = srcFiles.concat(
			IO.ls(JsDoc.opt._[d], JsDoc.opt.r).filter(isJs)
		);
	}
	
	LOG.inform(srcFiles.length+" source file"+((srcFiles ==1)?"":"s")+" found:\n\t"+srcFiles.join("\n\t"));
	var files = JsDoc.parse(srcFiles, JsDoc.opt);
	
	if (JsDoc.opt.t) {
		JsDoc.opt.t += (JsDoc.opt.t.indexOf(IO.FileSeparator)==JsDoc.opt.t.length-1)?
			"" : IO.FileSeparator;
		LOG.inform("Loading template: "+JsDoc.opt.t+"publish.js");
		load(JsDoc.opt.t+"publish.js");
		
		LOG.inform("Publishing all files...");
		publish(files, JsDoc.opt);
		LOG.inform("Finished.");
	}
}

JsDoc.opt = Util.getOptions(arguments, {d:"directory", t:"template", r:"recurse", x:"ext", a:"allfunctions", A:"Allfunctions", h:"help"});
Main();