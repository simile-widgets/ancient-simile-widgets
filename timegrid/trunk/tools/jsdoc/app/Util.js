

/**
 * Various utility methods used by JsDoc.
 */
Util = {
	/**
	 * Turn a path into just the name of the file.
	 * @param {string} path
	 * @return {string} The fileName portion of the path.
	 */
	fileName: function(path) {
		var nameStart = Math.max(path.lastIndexOf("/")+1, path.lastIndexOf("\\")+1, 0);
		return path.substring(nameStart);
	},
	
	/**
	 * Turn a path into just the directory part.
	 * @param {string} path
	 * @return {string} The directory part of the path.
	 */
	dir: function(path) {
		var nameStart = Math.max(path.lastIndexOf("/")+1, path.lastIndexOf("\\")+1, 0);
		return path.substring(0, nameStart-1);
	},
	
	/**
	 * Get commandline option values.
	 * @param {Array} args Commandline arguments. Like ["-a=xml", "-b", "--class=new", "--debug"]
	 * @param {object} optNames Map short names to long names. Like {a:"accept", b:"backtrace", c:"class", d:"debug"}.
	 * @return {object} Short names and values. Like {a:"xml", b:true, c:"new", d:true}
	 */
	getOptions: function(args, optNames) {
		var opt = {"_": []};
		for (var i = 0; i < args.length; i++) {
			var arg = new String(args[i]);
			var name;
			var value;
			if (arg.charAt(0) == "-") {
				if (arg.charAt(1) == "-") { // it's a longname like --foo
					arg = arg.substring(2);
					var m = arg.split("=");
					name = m.shift();
					value = m.shift();
					
					for (var n in optNames) { // convert it to a shortname
						if (name == optNames[n]) {
							name = n;
							if (typeof value == "undefined") value = true;
						}
					}
				}
				else { // it's a shortname like -f
					arg = arg.substring(1);
					var m = arg.split("=");
					name = m.shift();
					value = m.shift();;
					
					if (typeof value == "undefined") value = true;
				}
				
				opt[name] = value;
			}
			else { // not associated with any optname
				opt._.push(args[i]);
			}
		}
		return opt;
	}
}