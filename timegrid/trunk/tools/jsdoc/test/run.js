//// load required libraries

var __DIR__;
try {fail();} catch(e) {
	var nameStart = Math.max(e.fileName.lastIndexOf("/")+1, e.fileName.lastIndexOf("\\")+1, 0);
	__DIR__ = e.fileName.substring(0, nameStart-1);
	__DIR__ += (__DIR__)? "/" : "";
}

load(__DIR__+"../app/JsDoc.js");
load(__DIR__+"../app/Util.js");
load(__DIR__+"../app/JsIO.js");
load(__DIR__+"../app/Symbol.js");
load(__DIR__+"../app/JsToke.js");
load(__DIR__+"../app/JsParse.js");
load(__DIR__+"../app/DocTag.js");
load(__DIR__+"../app/Doclet.js");
load(__DIR__+"../app/JsTestrun.js");
load(__DIR__+"../app/Dumper.js");


//// set up harness
JsDoc.opt = {};
jsdoc = null;

function testFile(path) {
	var srcFiles = JsDoc.opt._ = path;
	jsdoc = JsDoc.parse(srcFiles, JsDoc.opt);
}


//// set up some tests cases, order matters

var testCases = [
	function() {
		testFile(__DIR__+"data/functions.js");
		ok('typeof(jsdoc) != "undefined"', 'jsdoc must be defined.');
		is('jsdoc[0].symbols[0].alias', "Layout", 'Nested commented method name can be found.');
	},
	function() {
		testFile(__DIR__+"data/obliterals.js");
		is('jsdoc[0].symbols[0].name', "Document", 'Nested commented object literal name can be found.');
	},
	function() {
		testFile(__DIR__+"data/oblit_func.js");
		is('jsdoc[0].symbols[0].name', "Site", 'Mixed object literal name can be found.');
	},
	function() {
		JsDoc.opt = {a: true};
		testFile(__DIR__+"data/prototypes.js");
		is('jsdoc[0].symbols[1].alias', "Article.getTitle", 'Prototype method name assigned from oblit can be found.');
		is('jsdoc[0].symbols[1].memberof', "Article", 'Prototype method memberof assigned from oblit can be found.');
		is('jsdoc[0].symbols[0].methods[0].name', "getTitle", 'Prototype method is registered with parent object.');
	
		is('jsdoc[0].symbols[4].alias', "Paragraph.lines", 'Prototype property name can be found.');
		is('jsdoc[0].symbols[4].isa', "OBJECT", 'Prototype property isa can be found.');
		is('jsdoc[0].symbols[5].alias', "Paragraph.getLines", 'Prototype method name can be found.');
		is('jsdoc[0].symbols[5].isa', "FUNCTION", 'Prototype method isa can be found.');
	},
	function() {
		testFile(__DIR__+"data/anonfuncs.js");
		is('jsdoc[0].symbols[1].alias', "Item.name", 'Anonymous function call assigned to property can be found.');
		is('jsdoc[0].symbols[2].name', "Item.Price", 'Anonymous function call assigned to variable can be found.');
		is('jsdoc[0].symbols[3].name', "Product", 'Anonymous constructor call assigned to variable can be found.');
		is('jsdoc[0].symbols[4].isa', "OBJECT", 'Anonymous constructor property isa must be "PROPERTY".');
		is('jsdoc[0].symbols[4].alias', "Product.seller", 'Anonymous constructor property name can be found.');
	},
	function() {
		testFile(__DIR__+"data/overview.js");
		is('jsdoc[0].overview.doc.tags[1].title', "author", 'Author tag in overview can be found.');
	},
	function() {
		testFile(__DIR__+"data/tags.js");
		is('jsdoc[0].symbols[0].doc.tags[0].title', "status", 'User-defined tag title can be found.');
		is('jsdoc[0].symbols[0].doc.tags[0].desc', "experimental", 'User-defined tag with desc, desc can be found.');
		is('jsdoc[0].symbols[0].doc.tags[1].title', "deprecated", 'User-defined tag with no desc, title can be found.');
		is('jsdoc[0].symbols[0].doc.tags[1].desc', "", 'User-defined tag with no desc, desc can be found and is empty.');
	},
	function() {
		testFile(__DIR__+"data/type.js");
		is('jsdoc[0].symbols[0].type', "", 'Constructors can\'t have a type set.');
		is('jsdoc[0].symbols[0].doc.tags.length', 0, 'Type doesn\'t appear in tags.');
		is('jsdoc[0].symbols[1].type', "String", 'Properties can have a type set.');
		is('jsdoc[0].symbols[2].type', "number", 'Variables can have a type set.');
		is('jsdoc[0].symbols[3].type', "HTMLElement, HTMLElement[], null", 'Types can be separated with single bars and newlines.');
		is('jsdoc[0].symbols[4].type', "FontDef, String", 'Types can be separated with double bars.');
		is('jsdoc[0].symbols[5].type', "number, sizeDef", 'Type tag can be set by setting the type as well as desc.');
	},
	function() {
		JsDoc.opt = {a:true};
		testFile(__DIR__+"data/functions.js");
		is('jsdoc[0].symbols[0].methods.length', 3, 'Undocumented function has undocumented methods.');
		is('jsdoc[0].symbols[0].methods[2].name', "Canvas", 'Undocumented function has named undocumented methods.');
		is('jsdoc[0].symbols[2].alias', "Layout.Element", 'Nested undocumented function has name.');
		is('jsdoc[0].symbols[2].methods[0].name', "expand", 'Nested undocumented method is found.');
		is('jsdoc[0].symbols[3].name', "expand", 'Nested undocumented function has name.');
		is('jsdoc[0].symbols[3].alias', "Layout.Element.expand", 'Nested undocumented function has alias.');
	},
	function() {
		testFile(__DIR__+"data/virtual.js");
		is('jsdoc[0].symbols[0].name', "twiddle.flick", 'Virtual doclet name can be found.');
		is('jsdoc[0].symbols[0].isa', "FUNCTION", 'Virtual doclet isa can be found.');
		is('jsdoc[0].symbols[0].desc', "Twiddle the given flick.", 'Virtual doclet desc can be found.');
		is('jsdoc[0].symbols[0].doc.tags.length', 0, 'Virtual doclet should have no tags.');
		
		is('jsdoc[0].symbols[1].name', "zipZap", 'Undocumented function following virtual doclet name can be found.');
		
		is('jsdoc[0].symbols[2].name', "Concat", 'Virtual function doclet name can be found.');
		is('jsdoc[0].symbols[2].isa', "CONSTRUCTOR", 'Virtual function doclet isa can be found.');
		is('jsdoc[0].symbols[2].doc.tags.length', 0, 'Virtual function doclet should have no tags.');
		is('jsdoc[0].symbols[2].params[0].name', "strX", 'Virtual function parameter name can be found.');
		
		is('jsdoc[0].symbols[3].memberof', "Concat", 'Virtual function can define memberOf.');
		is('jsdoc[0].symbols[3].alias', "Concat.join", 'Virtual function alias reflects memberOf tag.');
		is('jsdoc[0].symbols[2].methods[0].name', "join", 'Virtual function appears as method in parent object.');
		
		is('jsdoc[0].symbols[4].memberof', "Concat", 'Virtual property can define memberOf.');
		is('jsdoc[0].symbols[4].alias', "Concat.separator", 'Virtual property alias reflects memberOf tag.');
		is('jsdoc[0].symbols[2].properties[0].name', "separator", 'Virtual property appears as property in parent object.');
		is('jsdoc[0].symbols[4].type', "String", 'Virtual property can specify its type.');
		
		is('jsdoc[0].symbols[6].alias', "Employee.employeeId", 'Virtual property inside a function can be seen.');
		is('jsdoc[0].symbols[5].properties[0].name', "employeeId", 'Virtual property inside a function appears as property.');
	
		is('jsdoc[0].symbols[7].alias', "Document.title", 'Virtual object inside an object literal can be seen.');
	},
	function() {
		testFile(__DIR__+"data/properties.js");
		is('jsdoc[0].symbols[1].properties[0].name', "methodId", 'Property in doc comment is added to parent.');
		is('jsdoc[0].symbols[1].properties[0].type', "Number", 'Property in doc comment has type.');
		
		is('jsdoc[0].symbols[1].properties[0].desc', "The id of the method.", 'Property in doc comment has description.');
		is('jsdoc[0].symbols[1].properties[3].desc', "Only used in older browsers.", 'Property in code body has description.');

		is('jsdoc[0].symbols[1].properties[1].name', "_associated_with", 'Property in code body is added to parent.');
		is('jsdoc[0].symbols[1].properties.length', 5, 'All properties in code body are added to parent.');
		is('jsdoc[0].symbols[1].methods[0].name', "associated_with", 'Method in code body is added to parent.');
		is('jsdoc[0].symbols[2].alias', "Codework.Method._associated_with", 'Property appears as own symbol.');
		is('jsdoc[0].symbols[2].isa', "OBJECT", 'Property symbol is a object.');
		is('jsdoc[0].symbols[2].type', "Object", 'Property symbol has type.');
		is('jsdoc[0].symbols[6].alias', "Codework.Method.associated_with", 'Method appears as own symbol.');
		is('jsdoc[0].symbols[6].isa', "FUNCTION", 'Method symbol is a function.');
	},
	function() {
		JsDoc.opt = {a:true};
		testFile(__DIR__+"data/memberof.js");
		is('jsdoc[0].symbols[1].name', "SquareMaker", 'Constructor member name can be found.');
		is('jsdoc[0].symbols[1].memberof', "ShapeFactory", 'Constructor which is a member of another constructor identified.');
		is('jsdoc[0].symbols[2].name', "Square", 'Nested constructor member name can be found.');
		is('jsdoc[0].symbols[2].memberof', "ShapeFactory.SquareMaker", 'Nested constructor which is a member of another constructor identified.');
		is('jsdoc[0].symbols[5].isa', "CONSTRUCTOR", 'Class tag is a synonym for constructor.');
		is('jsdoc[0].symbols[5].properties[1].alias', "Circle.getDiameter", 'Member tag is a synonym for memberof.');
	},
	function() {
		JsDoc.opt = {};
		testFile(__DIR__+"data/underscore.js");
		is('jsdoc[0].symbols.length', 0, 'No undocumented symbols allowed without -a or -A.');
		
		JsDoc.opt = {a:true};
		testFile(__DIR__+"data/underscore.js");
		is('jsdoc[0].symbols.length', 3, 'No undocumented, underscored symbols allowed with -a but not -A.');
	
		JsDoc.opt = {A:true};
		testFile(__DIR__+"data/underscore.js");
		is('jsdoc[0].symbols.length', 5, 'All undocumented symbols allowed with -A.');
		is('jsdoc[0].symbols[0].methods[1].name', "_debug", 'Undocumented, underscored methods allowed with -A.');
	},
	function() {
		JsDoc.opt = {};
		testFile(__DIR__+"data/allfuncs_option.js");
		is('jsdoc[0].symbols.length', 1, 'Documented method of undocumented parent found without -a or -A.');
		is('jsdoc[0].symbols[0].alias', "_Action.passTo", 'Documented method of undocumented parent alias includes parent.');

		JsDoc.opt = {A:true};
		testFile(__DIR__+"data/allfuncs_option.js");
		is('jsdoc[0].symbols.length', 5, 'All functions found with -A.');
	},
	function() {
		JsDoc.opt = {};
		testFile(__DIR__+"data/ignore.js");
		is('jsdoc[0].symbols.length', 0, 'Ignored functions are unseen without -a or -A.');
		
		JsDoc.opt = {A:true};
		testFile(__DIR__+"data/ignore.js");
		is('jsdoc[0].symbols.length', 3, 'Ignored functions are unseen with -A.');
		is('jsdoc[0].symbols[0].alias', "Log.warn", 'Ignored parent has visible method with -A.');
		is('jsdoc[0].symbols[2].alias', "Action.passTo", 'Ignored method is unseen with -A.');
	},
	function() {
		JsDoc.opt = {};
		testFile(__DIR__+"data/returns.js");
		is('jsdoc[0].symbols[0].returns.length', 1, 'A return tag appears in the returns array.');
		is('jsdoc[0].symbols[0].doc.tags.length', 0, 'A return tag does not appear in the tags array.');
		is('jsdoc[0].symbols[0].returns[0].type', "Array, String", 'A return type van contain multiple values and whitespaces.');
	},
	function() {
		JsDoc.opt = {a: true};
		testFile(__DIR__+"data/params.js");
		is('jsdoc[0].symbols[0].params.length', 1, 'A param tag appears in the params array.');
		is('jsdoc[0].symbols[0].params[0].type', "String, Array", 'A param type van contain multiple values and whitespaces.');
		is('jsdoc[0].symbols[1].params.length', 3, 'Undocumented param tags appear in the params array.');
		is('jsdoc[0].symbols[1].signature()', "source, format, target", 'Can get params as a signature.');
	},
	function() {
		JsDoc.opt = {a: true};
		testFile(__DIR__+"data/scope.js");
		is('jsdoc[0].symbols[0].alias', "Record.getRecord", 'Scope recognized as part of alias with new function(){} syntax.');
		is('jsdoc[0].symbols[0].name', "Record.getRecord", 'Scope recognized as part of name with new function(){} syntax.');
		is('jsdoc[0].symbols[1].alias', "Record.getRecord.Reader", 'Scope recognized as part of method with new function(){} syntax');
		is('jsdoc[0].symbols[2].alias', "File.getId", 'Scope recognized as part of name with function(){}() syntax.');
		is('jsdoc[0].symbols[3].alias', "Entry.getSubject", 'Scope recognized as part of method name with function(){}() syntax.');
		is('jsdoc[0].symbols[4].alias', "dojo.widget.Widget.initializer", 'Scope within argument list is recognized.');
	},
	function() {
		JsDoc.opt = {a: true};
		testFile(__DIR__+"data/framework.js");
		is('jsdoc[0].symbols[1].alias', "Dragger.scroll", 'Scope recognized as part of method inside param call.');
		is('jsdoc[0].symbols[2].alias', "Dragger.onChange", 'Function inside param call recognized when labelled function.');
		is('jsdoc[0].symbols[3].alias', "Dragger.onUpdate", 'Method inside param call recognized when virtual.');
		is('jsdoc[0].symbols[3].memberof', "Dragger", 'Method inside param call has memberof when virtual.');
	},
	function() {
		JsDoc.opt = {a: true};
		testFile(__DIR__+"data/throws.js");
		//print(Dumper.dump(jsdoc));
		is('jsdoc[0].symbols[0].exceptions[0]', "This is the label text.", 'Throws can be found.');
		is('jsdoc[0].symbols[1].exceptions[0].type', "OutOfMemory", 'Exception is a synonym for throws.');
		is('jsdoc[0].symbols[2].exceptions[0].type', "IOException", 'Multiple exception tags allowed, first.');
		is('jsdoc[0].symbols[2].exceptions[1].type', "PermissionDenied", 'Multiple exception tags allowed, second.');
	}
];


//// run and print results

print(testrun(testCases));
