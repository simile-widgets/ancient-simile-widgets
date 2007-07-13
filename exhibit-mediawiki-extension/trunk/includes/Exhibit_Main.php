<?php

/**
 * This file creates the Exhibit Extension for MediaWiki.
 * With WikiMedia's extension mechanism it is possible to define
 * new tags of the form <TAGNAME> some text </TAGNAME>
 * the function registered by the extension gets the text between the
 * tags as input and can transform it into arbitrary HTML code.
 * Note: The output is not interpreted as WikiText but directly
 * included in the HTML output. So Wiki markup is not supported.
 * To activate the extension, include it from your LocalSettings.php
 * with: include("extensions/gflash.php");
 * http://junkchest.blogspot.com/2005/03/wiki-adding-extensions-to-mediawiki.html
 * @fileoverview
 */

$wgExtensionFunctions[] = "wfExhibitSetup";

function wfExhibitSetup() {
	global $wgParser;

	/* 
 	 * This registers the extension with the WikiText parser.
 	 * The first parameter is the name of the new tag.
 	 * The second parameter is the callback function for processing the text between the tags.
  	 */
	$wgParser->setHook( "exhibit", "Exhibit_getHTMLResult" );

	$wgHooks['BeforePageDisplay'][]='wfExhibitAddHTMLHeader';
}

/**
 * This function is in charge of inserting additional CSS, JavaScript, and meta tags
 * into the html header of each page. It is either called after initializing wgout
 * (requiring a patch in MediaWiki), or during parsing. Calling it during parsing,
 * however, is not sufficient to get the header modifications into every page that
 * is shipped to a reader, since the parser cache can make parsing obsolete.
 * @param $out This is the modified OutputPage.
 * @return true Always return true, in order not to stop MW's hook processing.
 */
function wfExhibitAddHTMLHeader(&$out) {
	global $wgScriptPath;
	
	$ExhibitScript = '<script type="text/javascript" src="http://simile.mit.edu/repository/exhibit/branches/2.0/src/webapp/api/exhibit-api.js?autoCreate=false"></script><script>SimileAjax.History.enabled = false;</script>';
	$WExhibitScript = '<script type="text/javascript" src="'. $wgScriptPath . '/extensions/ExhibitExtension/scripts/Exhibit_Create.js"></script>';
	
	$out->addScript($ExhibitScript);
	$out->addScript($WExhibitScript);

	// Custom CSS file?

	return true;
}

/**
 * This is the callback function for converting the input text to HTML output.
 * @param {String} $input This is the text the user enters into the wikitext input box.
 */
 
 
function Exhibit_getHTMLResult( $input ) {
	$xmlstr = "<?xml version='1.0' standalone='yes'?><root>$input</root>"; 
	$xml = new SimpleXMLElement($xmlstr);
	$data = $xml->data;
	$columns = $xml->columns;
	
	$output = <<<OUTPUT
	<script type="text/javascript">
	var data = "$data";
	var columns = "$columns".split(',');
	</script>
OUTPUT;
	
	return $output;
}


?>