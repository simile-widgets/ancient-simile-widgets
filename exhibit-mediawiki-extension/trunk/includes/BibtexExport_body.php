<?php
class BibtexExport extends SpecialPage
{
    function BibtexExport() {
        SpecialPage::SpecialPage("BibtexExport");
        self::loadMessages();
    }

    function execute( $par ) {
        global $wgOut;
		include("Parse_Entries.php");

		#Don't want to output standard Wiki stuff, just want blank page.
        $wgOut->disable();
        
        # If just Special:BibtexExport , explain what it is and die.
        if ($par == "") {
        	echo "<h3>You haven't specified which wiki page you would like the BibTeX from.</h3>";
        	echo "<div style=\"width:33em\">";
        	echo "To grab the BibTeX between the &lt;bibtex&gt; and &lt;/bibtex&gt; tags ";
        	echo "in an article, simply visit Special:BibtexExport/Article_Name.";
        	echo "<p>";
        	echo "To narrow it down you can append a query to the URL. For example, if you ";
        	echo "wanted to get the bibtex for all the Haystack publications by David Huynh ";
        	echo "in the year 2005, simply visit: <p>";
        	echo "<a href=\"http://simile.mit.edu/exhibited-wiki/Special:BibtexExport/Haystack?field:author=David%20Huynh&field:year=2005\">";
        	echo "http://simile.mit.edu/exhibited-wiki/Special:BibtexExport/Haystack?field:author=David%20Huynh&field:year=2005</a>";
        	echo "</div>";
        	
        	die();
        }
        
        # Grab the article associated with the text past Special:BibtexExport.
        # e.g. Special:BibtexExport/Some_Article will grab all the data in the 
        # Some_Article page.
        $title = Title::newFromURL( $par );
        $article = new Article( $title );
        $article->loadContent();
        $text = $article->getContent();
        
        # Try to get just the stuff in <bibtex> </bibtex> tags.
        $bibtexmatches = array();
        $anything = Parser::extractTagsAndParams( array('bibtex'), $text, $bibtexmatches );
		# info stored in $bibtexmatches array, but key is randomly generated, so must
		# iterate through the *one* element in the array.
		# that in turn is an array, with the second key being the content
        foreach ($bibtexmatches as $match) {
        	$bibtex = $match[1];
        }
        
        # If there's a query string (e.g. Special:BibtexExport/Article?author=name)
        # we have more work to do. Otherwise, we're done.
        
       	if ( !$_SERVER['QUERY_STRING'] ) {
       		echo "$bibtex";
       	}
       	else {
			
			#Parse Bibtex
			$parse = New PARSEENTRIES();
			$parse->loadBibtexString($bibtex);
			$parse->extractEntries();
			list($preamble, $strings, $entries, $undefinedStrings) = $parse->returnArrays();

			#filter by queries of form, e.g., ?field:author=Charles%20Darwin
			$queries = explode("&",$_SERVER['QUERY_STRING']);
			foreach ($queries as $query) {
				$survivingentries = array();
				list($attr, $val) = explode("=", $query);
				$val = rawurldecode($val);
				$explodedattr = explode(":", $attr);
				if ( $explodedattr[0] == "field" ) { # filter by some field
					$filterby = $explodedattr[1];
					
					#Now we know what to filter by, let's go through the bibtex.
					foreach($entries as $entry) {
						if ($filterby == "author") {
							$authorarray = explode(" and ", $entry['author']);
							if (in_array( $val, $authorarray)) {
								$survivingentries[] = $entry;
							}
						}
						elseif ($entry[$filterby] == $val) {
							$survivingentries[] = $entry;
						}
					}
				}
				unset($entries);
				$entries = $survivingentries;
				unset($survivingentries);
			}
			
			#Surviving entries should now be in $entries. 
			echo self::parsedEntriesToBibtex($entries);
			
       	}
   		exit();
    }
    
    function parsedEntriesToBibtex($entries) {
    	$output = "";
    	
    	foreach($entries as $entry) {
    		foreach($entry as $field => $value) {
    			if ($field == "bibtexEntryType") { $output .= "@$value{"; }
    			elseif ($field == "bibtexCitation") { $output .= "$value,\n"; }
    			elseif ($field == "author") { $output .= "author = \"" . $value . "\",\n"; }
				else { $output .= "$field = \"$value\",\n"; }
			}
			$output .= "}\n\n";
    	}
    	return $output;
    }        
    
    function loadMessages() {
        static $messagesLoaded = false;
        global $wgMessageCache;
        if ( $messagesLoaded ) return;
        $messagesLoaded = true;

        require( dirname( __FILE__ ) . '/BibtexExport.i18n.php' );
        foreach ( $allMessages as $lang => $langMessages ) {
            $wgMessageCache->addMessages( $langMessages, $lang );
        }
    }
}
?>