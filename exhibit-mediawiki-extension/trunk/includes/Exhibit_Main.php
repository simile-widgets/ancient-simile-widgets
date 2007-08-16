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
 * with: include("extensions/ExhibitExtension/trunk/includes/Exhibit_Main.php");
 * http://www.mediawiki.org/wiki/Extending_wiki_markup
 * @fileoverview
 */

$wgExtensionFunctions[] = "wfExhibitSetup";
$exhibitEnabled = false;
$includeMap = false;
$includeTimeline = false;

$wgAutoloadClasses['BibtexExport'] = dirname(__FILE__) . '/BibtexExport_body.php';
$wgSpecialPages['BibtexExport'] = 'BibtexExport';
$wgSpecialPages['BibTeXExport'] = 'BibtexExport';
$wgHooks['LoadAllMessages'][] = 'BibtexExport::loadMessages';
$wgHooks['LangugeGetSpecialPageAliases'][] = 'BibtexExportLocalizedPageName';

//change this to your own key! (http://www.google.com/apis/maps/signup.html)
$gmapkey = "ABQIAAAANowuNonWJ4d9uRGbydnrrhQtmVvwtG6TMOLiwecD59_rvdOkHxSVnf2RHe6KLnOHOyWLgmqJEUyQQg";
$wgAutoloadClasses['GoogleMaps'] = dirname(__FILE__) . '/GoogleMaps_body.php';
$wgSpecialPages['GoogleMaps'] = 'GoogleMaps';
$wgHooks['LoadAllMessages'][] = 'GoogleMaps::loadMessages';
$wgHooks['LangugeGetSpecialPageAliases'][] = 'GoogleMapsLocalizedPageName';
  
function BibtexExportLocalizedPageName(&$specialPageArray, $code) {
    # The localized title of the special page is among the messages of the
    # extension:
    BibtexExport::loadMessages();
    $text = wfMsg('bibtexexport');

    # Convert from title in text form to DBKey and put it into the alias array:
    $title = Title::newFromText($text);
    $specialPageArray['BibtexExport'][] = $title->getDBKey();

    return true;
}

function GoogleMapsLocalizedPageName(&$specialPageArray, $code) {
    # The localized title of the special page is among the messages of the
    # extension:
    GoogleMaps::loadMessages();
    $text = wfMsg('googlemaps');

    # Convert from title in text form to DBKey and put it into the alias array:
    $title = Title::newFromText($text);
    $specialPageArray['GoogleMaps'][] = $title->getDBKey();

    return true;
}

function wfExhibitSetup() {
	global $wgParser;

	/* 
 	 * This registers the extension with the WikiText parser.
 	 * The first parameter is the name of the new tag.
 	 * The second parameter is the callback function for processing the text between the tags.
  	 */
	$wgParser->setHook( "exhibit", "Exhibit_getHTMLResult" );
	$wgParser->setHook( "bibtex", "bibtexToHTMLTable" );
}

/**
 * This function inserts Exhibit scripts into the header of the page.
 * @param $out This is the modified OutputPage.
 * @return true Always return true, in order not to stop MW's hook processing.
 */
function wfExhibitAddHTMLHeader(&$out) {
	global $wgScriptPath;
	global $exhibitEnabled;
	global $includeMap;
	global $includeTimeline;
	global $gmapkey;
	
	if ($exhibitEnabled) {	
		$ExhibitScriptSrc = 'http://simile.mit.edu/repository/exhibit/branches/2.0/src/webapp/api/exhibit-api.js?autoCreate=false&safe=true';
		$WExhibitScript = '<script type="text/javascript" src="'. $wgScriptPath . '/extensions/ExhibitExtension/scripts/Exhibit_Create.js"></script>';				
		if ($includeTimeline) { $ExhibitScriptSrc = $ExhibitScriptSrc . '&views=timeline'; }
		if ($includeMap) { $ExhibitScriptSrc = $ExhibitScriptSrc . '&gmapkey=' . $gmapkey; }	
		$ExhibitScript = '<script type="text/javascript" src ="' . $ExhibitScriptSrc . '"></script><script>SimileAjax.History.enabled = false;</script>';
		$out->addScript($ExhibitScript);
		$out->addScript($WExhibitScript);
	}
	$ToolbarScript = <<<TOOLBARSCRIPT
	<script type='text/javascript'>
	(function(){
		var script=document.createElement('script');
		script.type='text/javascript';
		script.src='http://web.mit.edu/leibovic/www/Exhibit/wiki-toolbox/wiki-toolbox/trunk/src/wiki-toolbox-bundle.js';
		script.id='wiki-toolbox-bundle';
		document.getElementsByTagName('head')[0].appendChild(script);
	})();
	</script>	
TOOLBARSCRIPT;
	$out->addScript($ToolbarScript);
	
	//$GMapScript = '<script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAANowuNonWJ4d9uRGbydnrrhQtmVvwtG6TMOLiwecD59_rvdOkHxSVnf2RHe6KLnOHOyWLgmqJEUyQQg"></script>';
	//$out->addScript($GMapScript);

	return true;
}

/**
  * Callback function that converts BibTeX text pasted into wiki into
  * an HTML table, which can then be imported by Exhibit using the 
  * Exhibit Extension for Mediawiki. See Parse_Entries.php for proper credit to author.
  * @param {String} $input This is the text the user enters ino the wikitext input box.
  */

function bibtexToHTMLTable( $input, $argv ) {
	
	include("Parse_Entries.php");
	
	try {
		//Use the bibtex parser to get arrays from the bibtex in the <bibtex> tags.
		$parse = New PARSEENTRIES();
		$parse->loadBibtexString($input);
		$parse->extractEntries();
		list($preamble, $strings, $entries, $undefinedStrings) = $parse->returnArrays();
		
		//Find all the fields in these bibtex entries:		
		$fields = array();
		foreach ($entries as $entry) {
			$thekeys = array_keys($entry);
			foreach ($thekeys as $key) {
				array_push($fields, $key);
			}
		}
		$fields = array_unique($fields);
		
		//Make sure bibtexCitation is first field, since it must be unique, makes
		//table look better. Find where it is now, and switch with what's there.
		reset($fields);
		$count = 0;
		while ( $thekey = current($fields) ) {
			if ($thekey == "bibtexCitation") {
				break;
			} else {
				$count++;
				next($fields);
			}
		}
		$tempval = $fields[0];
		$fields[0] = "bibtexCitation";
		$fields[$count] = $tempval;
		
		//Construct table header with these fields.
		$output = '<table id="bibtextable"><tr>';
		foreach($fields as $field) {
			if ($field == "bibtexCitation") {
				$output .= "\n<th ex:name=\"label\">$field</th>";
			} else {
				$output .= "\n<th ex:name=\"$field\">$field</th>";
			}
		}
		$output .= "</tr>\n";
		
		//Fill in rest of table, with fields in right column.
		foreach($entries as $entry) {
			$output .= "<tr>";
			foreach($fields as $field) {
				if (array_key_exists($field, $entry)) {
					if ($field == "author") 
						{ $entry[$field] = str_replace(" and ", " ; ", $entry[$field]); }
					$output .= "<td>{$entry[$field]}</td>";
				} else {
					$output .= "<td></td>";
				}
			}
			$output .= "</tr>\n";
		}
		$output .= "</table>";

		//Give a reasonable default lens.
		//$output .= '<div ex:role="exhibit-lens" ex:itemTypes="Publication" class="publication-lens"  style="display: none"> <span ex:control="copy-button" class="copy-button"></span> <div><span class="publication-title" ex:content=".label"></span><i ex:if-exists=".venue"><span ex:content=".venue"></span>, </i> <i ex:if-exists=".event"><span ex:content=".event"></span>, </i> <span ex:content=".year"></span>.  <span ex:if-exists=".status">(<span ex:content=".status"></span>)</span> </div> <div class="authors" ex:content=".author"></div> <div ex:if-exists=".abstract" class="abstract" ex:content=".abstract"></div> <div ex:if-exists=".excerpt" class="excerpt" ex:content=".excerpt"></div> <div class="downloads"> <a ex:if-exists=".url" ex:href-content=".url">[Source]</a> <a ex:if-exists=".talkURL" ex:href-content=".talkURL">[Talk Video]</a> <a ex:if-exists=".screencastURL" ex:href-content=".screencastURL">[Screencast <span ex:content=".screencastKB"></span> KB]</a> <a ex:if-exists=".pdfURL" ex:href-content=".pdfURL">[PDF <span ex:content=".pdfKB"></span> KB]</a> <a ex:if-exists=".pptURL" ex:href-content=".pptURL">[PowerPoint <span ex:content=".pptKB"></span> KB]</a> <a ex:if-exists=".psURL" ex:href-content=".psURL">[PS <span ex:content=".psKB"></span> KB]</a> </div> </div>';
		
		$output .= '<div ex:role="exhibit-lens" style="display:none"> <div> <div style="font-size:120%; font-style:italic"> <span ex:content=".title"></span> </div> <div> Authors: <span ex:content=".author"></span>, <span ex:content=".year" style="font-size: 80%; font-weight:bold"></span>.  </div> </div> <div><a ex:if-exists=".pdfurl" ex:href-content=".pdfurl">[PDF <span ex:content=".pdfkb"></span> KB]</a> </div>'; 

	} catch (Exception $e) { $output = "Error in Bibtex"; }

	return $output;
}

/**
 * This is the callback function for converting the input text to HTML output.
 * @param {String} $input This is the text the user enters into the wikitext input box.
 */
function Exhibit_getHTMLResult( $input, $argv ) {
	global $exhibitEnabled;
	global $includeMap;
	global $includeTimeline;
	$exhibitEnabled = true;
	if ($argv["disabled"]) {
		$exhibitEnabled = false;
	}

	// use SimpleXML parser
	$output = "";

	try {
		# DOMDocument doesn't like ex: attributes, so we'll deal with ex1928374 instead, and
		# switch back later. The only problem is if ex1928374 occurrs naturally in the
		# lens somewhere, it will get changed later with all the other ones.
		$input = str_replace( "ex:", "ex1928374", $input );
		
		$xml = new DOMDocument();
		$xml->preserveWhiteSpace = false;
		$xml->loadXML("<root>$input</root>");
	
		$xmlviews = $xml->getElementsByTagName("view");
		for ($i=0; $i < $xmlviews->length; $i++) {
			$view = $xmlviews->item($i);
			switch ((string) $view->attributes->getNamedItem('viewClass')->nodeValue) {
			case 'Map':
				$includeMap = true;
			case 'Timeline':
				$includeTimeline = true;
				break;
			}
		}
		
		// <source>
		$sources = array();
		$count = 0;
		for ($i = 0; $i < $xml->getElementsByTagName("source")->length; $i++) {
			$source = $xml->getElementsByTagName("source")->item($i);
			$id = $source->attributes->getNamedItem("id")->nodeValue;
			$columns = $source->attributes->getNamedItem("columns")->nodeValue;
			$hideTable = $source->attributes->getNamedItem("hideTable")->nodeValue;
			if (!$hideTable) { $hideTable = true; }
			$type = $source->attributes->getNamedItem('type')->nodeValue;
			if (!$type) { $type = "Item"; }
			$label = $source->attributes->getNamedItem('label')->nodeValue;
			if (!$label) { $label = "Item"; }
			$pluralLabel = $source->attributes->getNamedItem('pluralLabel')->nodeValue;
			if (!$pluralLabel) { $pluralLabel = "Items"; }
			$object = 'source' . $count . ': { id:  "'. $id .'" , ' .
										  'columns: "' . $columns . '".split(","), ' .
										  'hideTable: "' . $hideTable . '", ' .
										  'type: "' . $type . '", ' .
										  'label: "' . $label . '", ' .
										  'pluralLabel: "' . $pluralLabel . '" }';
			array_push($sources, $object);
			$count++;
		}
		$sources = implode(',', $sources);
		
		// <facet>	
		$facets = array();
		$xmlfacets = $xml->getElementsByTagName("facet");
		for ($i=0; $i < $xmlfacets->length; $i++) {
			$facet = $xmlfacets->item($i);
			$attributes = array();
			for ($j = 0; $j < $facet->attributes->length; $j++) {
				$node = $facet->attributes->item($j);
				$attr = $node->nodeName . "='" . $node->nodeValue . "'";
			array_push( $attributes, $attr);
		}
		array_push( $facets, implode(';', $attributes));
		}
		$facets = implode('/', $facets);
		
		// <view>
		$views = array();
		$xmlviews = $xml->getElementsByTagName("view");
		for ($i = 0; $i < $xmlviews->length; $i++) {
			$view = $xmlviews->Item($i);
			$attributes = array();
			for ($j = 0; $j < $view->attributes->length; $j++) {
				$node = $view->attributes->item($j);
				$attr = $node->nodeName . "='" . $node->nodeValue . "'";
				array_push( $attributes, $attr);
			}
		array_push( $views, implode(';', $attributes));
		}
		$views = implode('/', $views);
	
		// <coder> create coder divs and spans right here.
		$coders = "";
		$xmlcoders = $xml->getElementsByTagName("coder");
		for ($i = 0; $i < $xmlcoders->length; $i++) {
			$coder = $xmlcoders->item($i);
			$coders .= '<div ex:role="coder"';
			for ($j = 0; $j < $coder->attributes->length; $j++) {
				$a = $coder->attributes->item($j)->nodeName;
				$b = $coder->attributes->item($j)->nodeValue;
				if ($a == "id" ) {
					$coders .= " id=\"$b\"";
				} else {
					$coders .= " ex:$a=\"$b\"";
				}
			}
			$coders .=">";
			$xmlcodes = $coder->getElementsByTagName("code");
			for ($j = 0; $j < $xmlcodes->length; $j++) {
				$code = $xmlcodes->item($j);
				$coders .= "<span";
				for($k = 0; $k < $code->attributes->length; $k++) {
					$a = $code->attributes->item($k)->nodeName;
					$b = $code->attributes->item($k)->nodeValue;
					$coders .= " ex:$a=\"$b\"";
				}
				$codetext = $code->nodeValue;
				$coders .= ">$codetext</span>";
			}
			$coders .= "</div>";
		}
		# This will have problems with nested lenses. Work on this later...
		$lenshtml = "";
		$xmllenses = $xml->getElementsByTagName("lens");
		for ($i = 0; $i < $xmllenses->length; $i++) {
			$lens = $xmllenses->item($i);
			$safe = true;
	
			if ($lens->getElementsByTagName("script")->length > 0) {
				$lenshtml = "Has script tag, unsafe! ";
				$safe = false;
			}
			if (docOrChildrenHaveEventHandler($lens)) {
				$lenshtml = "Lens has event handlers, unsafe! ";
				$safe = false;
			}
			if (!$safe) { break; }
			$lensdoc = new DOMDocument();
			$lenstree = $lensdoc->importNode($lens, true);
			$lensdoc->appendChild($lenstree);
			$lenshtml .= $lensdoc->saveHTML();
		}
		// Put the ex: 's back in that we took out at the start
		$lenshtml = str_replace("ex1928374", "ex:", $lenshtml);
		
		$output = <<<OUTPUT
		<script type="text/javascript">
		var sources = { $sources };
		var facets = "$facets".split('/');
		var views = "$views".split('/');
		</script>
		$coders
		$lenshtml
		<div id="exhibitLocation"></div>
OUTPUT;
	
		return $output;
	} catch (Exception $e) { 
		echo $e; 
	} 
}

// Checks to see if any attributes of the node begin with "on", or
// any attributes of node children do.
function docOrChildrenHaveEventHandler( $doc ) {
	$hashandler = false;
	if ($doc->hasAttributes()) {
		foreach ($doc->attributes as $attr) {
			$attrname = $attr->nodeName;
			// ex1928374 is what ex: was turned into prior to creating the DOMNode because
			// it couldn't handle ex: .
			if (strpos($attrname, "on") === 0 || strpos($attrname, "ex1928374on") === 0) {
				$hashandler = true;
				break;
			}
		}
	}  
	if (!$hashandler && $doc->childNodes->length > 0) {
		foreach ($doc->childNodes as $node) {
			if (docOrChildrenHaveEventHandler($node)) {
				$hashandler = true;
				break;
			}
		}
	}
	return $hashandler;
}

?>
