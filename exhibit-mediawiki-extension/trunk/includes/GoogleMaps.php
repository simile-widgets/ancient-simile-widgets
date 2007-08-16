<?php
# Not a valid entry point, skip unless MEDIAWIKI is defined
if (!defined('MEDIAWIKI')) {
        echo <<<EOT
To install my extension, put the following line in LocalSettings.php:
require_once( "$IP/extensions/GoogleMaps/GoogleMaps.php" );
EOT;
	exit( 1 );
}
 
 $wgAutoloadClasses['GoogleMaps'] = dirname(__FILE__) . '/GoogleMaps_body.php';
 $wgSpecialPages['GoogleMaps'] = 'GoogleMaps';
 $wgHooks['LoadAllMessages'][] = 'GoogleMaps::loadMessages';
 $wgHooks['LangugeGetSpecialPageAliases'][] = 'GoogleMapsLocalizedPageName';
  
function GoogleMapsLocalizedPageName(&$specialPageArray, $code) {
    # The localized title of the special page is among the messages of the
    # extension:
    GoogleMaps::loadMessages();
    $text = wfMsg('myextension');

    # Convert from title in text form to DBKey and put it into the alias array:
    $title = Title::newFromText($text);
    $specialPageArray['GoogleMaps'][] = $title->getDBKey();

    return true;
}

?>

