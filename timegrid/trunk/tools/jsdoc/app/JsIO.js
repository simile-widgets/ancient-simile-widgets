/**
 * @projectDescription Friendly interface to Java file operations. Requires Rhino.
 * @name JsIO
 * @author Michael Mathews <a href="mailto:micmath@gmail.com">micmath@gmail.com</a>
 * @license <a href="http://en.wikipedia.org/wiki/MIT_License" target="_blank">X11/MIT License</a>
 *          (See the accompanying README file for full details.)
 */

var IO = {};

// shortcuts
FileWriter = Packages.java.io.FileWriter;
File = Packages.java.io.File;
IO.FileSeparator = Packages.java.io.File.separator;

/**
 * Gets the contents of a file.
 * @param {path|url} url
 * @return {string} The contents of the file at the given location.
 */
IO.readFile = function(path) {
	return readFile(path);
}

/**
 * Use to save content to a file.
 * @param {string} outDir Path to directory to save into.
 * @param {string} fileName Name to use for the new file.
 * @param {string} content To write to the new file.
 */
IO.saveFile = function(outDir, fileName, content) {
	var out = new FileWriter(outDir+IO.FileSeparator+fileName);
	out.write(content);
	out.flush();
	out.close();
}

/**
 * Use to copy a file from one directory to another. Can take binary files too.
 * @param {string} inFile Path to the source file.
 * @param {string} outDir Path to directory to save into.
 * @param {string} fileName Name to use for the new file.
 */
IO.copyFile = function(inFile, outDir, fileName) {
	if (fileName == null) fileName = Util.fileName(inFile);

	var inFile = new File(inFile);
	var outFile = new File(outDir+IO.FileSeparator+fileName);
	
	var bis = new Packages.java.io.BufferedInputStream(new Packages.java.io.FileInputStream(inFile), 4096);
    var bos = new Packages.java.io.BufferedOutputStream(new Packages.java.io.FileOutputStream(outFile), 4096);
	var theChar;
	while ((theChar = bis.read()) != -1) {
		bos.write(theChar);
	}
	bos.close();
	bis.close();
}

/**
 * Use to create a new directory.
 * @param {string} dirname Path of directory you wish to create.
 */
IO.makeDir = function(dirName) {
	(new File(dirName)).mkdir();
}

/**
 * Get recursive list of files in a directory.
 * @param {array} dirs Paths to directories to search.
 * @param {int} recurse How many levels to descend, defaults to 1.
 * @return {array} Paths to found files.
 */
IO.ls = function(dir, recurse, allFiles, path) {
		if (path === undefined) { // initially
			var allFiles = [];
			var path = [dir];
		}
		if (path.length == 0) return allFiles;
		if (recurse === undefined) recurse = 1;
		
		dir = new File(dir);
		if (!dir.directory) return [String(dir)];
		var files = dir.list();
		
		for (var f = 0; f < files.length; f++) {
			var file = String(files[f]);
			if (file.match(/^\.[^\.\/\\]/)) continue; // skip dot files

			if ((new File(path.join("/")+"/"+file)).list()) { // it's a directory
				path.push(file);
				if (path.length-1 < recurse) IO.ls(path.join("/"), recurse, allFiles, path);
				path.pop();
			}
			else {
				allFiles.push((path.join("/")+"/"+file).replace("//", "/"));
			}
		}

		return allFiles;
	}