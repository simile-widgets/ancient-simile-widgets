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
	
	/*
	 * Change this key to the one you get when you register for a Google Maps key here: 
	 * http://www.google.com/apis/maps/signup.html
	 */
	$gmapkey = 'ABQIAAAANowuNonWJ4d9uRGbydnrrhQtmVvwtG6TMOLiwecD59_rvdOkHxSVnf2RHe6KLnOHOyWLgmqJEUyQQg';
	
	if ($exhibitEnabled) {	
		$ExhibitScript = '<script type="text/javascript" src="http://simile.mit.edu/repository/exhibit/branches/2.0/src/webapp/api/exhibit-api.js?autoCreate=false';
		$WExhibitScript = '<script type="text/javascript" src="'. $wgScriptPath . '/extensions/ExhibitExtension/scripts/Exhibit_Create.js"></script>';				
		if ($includeTimeline) { $ExhibitScript = $ExhibitScript . '&views=timeline'; }
		if ($includeMap) { $ExhibitScript = $ExhibitScript . '&gmapkey=' . $gmapkey; }	
		$ExhibitScript = $ExhibitScript . '" ></script><script>SimileAjax.History.enabled = false;</script>';
		$out->addScript($ExhibitScript);
		$out->addScript($WExhibitScript);
	}
	
	$GMapScript = '<script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAANowuNonWJ4d9uRGbydnrrhQtmVvwtG6TMOLiwecD59_rvdOkHxSVnf2RHe6KLnOHOyWLgmqJEUyQQg"></script>';
	$out->addScript($GMapScript);

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
		$xmlstr = "<?xml version='1.0' standalone='yes'?><root>$input</root>"; 
		$xml = new SimpleXMLElement($xmlstr);
	} catch (Exception $e) { $output = "<b>Problem in the exhibit tags</b>"; }		
	
	if ($output == "") {
		foreach ($xml->view as $view) {
			switch ((string) $view['viewClass']) {
			case 'Map':
				$includeMap = true;
			case 'Timeline':
				$includeTimeline = true;
				break;
			}
		}
		
		// <source>
		$sourceData = array();
		$sourceColumns = array();
		$sourceHideTable = array();
		foreach ($xml->source as $source) {
			array_push($sourceData, $source['id']);
			array_push($sourceColumns, $source['columns']);
			array_push($sourceHideTable, $source['hideTable']);
		}	
		$sourceData = implode(',', $sourceData);
		$sourceColumns = implode(';', $sourceColumns);
		$sourceHideTable = implode(',', $sourceHideTable);
		
		// <facet>	
		$facets = array();
		foreach ($xml->facet as $facet) {
			$attributes = array();
			foreach ($facet->attributes() as $a => $b) {
				$attr = $a."='".$b."'";
			array_push( $attributes, $attr);
		}
		array_push( $facets, implode(';', $attributes));
		}
		$facets = implode('/', $facets);
		
		// <view>
		$views = array();
		foreach ($xml->view as $view) {
			$attributes = array();
			foreach ($view->attributes() as $a => $b) {
				$attr = $a."='".$b."'";
			array_push( $attributes, $attr);
		}
		array_push( $views, implode(';', $attributes));
		}
		$views = implode('/', $views);

		// <coder> create coder divs and spans right here.
		$coders = "";
		foreach ($xml->coder as $coder) {
			$coders .= '<div ex:role="coder"';
			foreach ($coder->attributes() as $a => $b) {
				if ($a == "id" ) {
					$coders .= " id=\"$b\"";
				} else {
					$coders .= " ex:$a=\"$b\"";
				}
			}
			$coders .=">";
			foreach ($coder->code as $code) {
				$coders .= "<span";
				foreach($code->attributes() as $a => $b) {
					$coders .= " ex:$a=\"$b\"";
				}
				$coders .= ">$code</span>";
			}
			$coders .= "</div>";
		}
		
		$output = <<<OUTPUT
		<script type="text/javascript">
		var sourceData = "$sourceData".split(',');
		var sourceColumns = "$sourceColumns".split(';');
		var sourceHideTable = "$sourceHideTable".split(',');
		var facets = "$facets".split('/');
		var views = "$views".split('/');
		</script>
		$coders
		<div id="exhibitLocation"></div>
OUTPUT;
	}
	return $output;
}

?>
