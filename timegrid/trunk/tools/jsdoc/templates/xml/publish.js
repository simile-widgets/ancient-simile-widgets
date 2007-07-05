function publish(files, context) {
	var file_template = new JsPlate(context.t+"file.tmpl");
	
	var file_map = {};
	for (var i = 0; i < files.length; i++) {
		var output = file_template.process(files[i]);
	
		if (context.d) {
			var our_name = "_"+(i+1)+".xml";
			IO.saveFile(context.d, our_name, output);
			file_map[our_name] = (files[i].overview.name || files[i].overview.alias);
		}
	}
	
	var indx_template = new JsPlate(context.t+"index.tmpl");
	var index = indx_template.process(file_map);
	if (context.d) {
		IO.saveFile(context.d, "index.xml", index);
	}
}