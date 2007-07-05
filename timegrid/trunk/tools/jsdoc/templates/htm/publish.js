function publish(files, context) {
load(__DIR__+"../app/Dumper.js");

	var file_template = new JsPlate(context.t+"file.tmpl");
	
	var index = {};
	for (var i = 0; i < files.length; i++) {
		
		
		if (context.d) {
			var our_name = "_"+((i+1<10)?"0"+(i+1):(i+1))+".htm";
			index[our_name] = { name: (files[i].overview.name || files[i].overview.alias), classes:[]};
		
			for (var s = 0; s < files[i].symbols.length; s++) {
				if (files[i].symbols[s].isa == "CONSTRUCTOR") {
					index[our_name].classes.push(files[i].symbols[s].alias);
				}
			}	
			
			var output = file_template.process(files[i]);
			IO.saveFile(context.d, our_name, output);
			
		}
	}
	
	var indx_template = new JsPlate(context.t+"index.tmpl");
	var index = indx_template.process(index);
	if (context.d) {
		IO.saveFile(context.d, "file_list.htm", index);
		
		IO.copyFile(context.t+"index.htm", context.d);
		IO.copyFile(context.t+"splash.htm", context.d);
		IO.copyFile(context.t+"default.css", context.d);
		
		IO.copyFile(context.t+"file.gif", context.d);
		IO.copyFile(context.t+"overview.gif", context.d);
		IO.copyFile(context.t+"constructor.gif", context.d);
		IO.copyFile(context.t+"function.gif", context.d);
		IO.copyFile(context.t+"object.gif", context.d);
	}
}