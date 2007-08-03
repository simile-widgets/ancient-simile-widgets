<?php
# Not a valid entry point, skip unless MEDIAWIKI is defined
if (!defined('MEDIAWIKI')) {
        echo <<<EOT
To install my extension, put the following line in LocalSettings.php:
require_once( "$IP/extensions/BibtexExport/BibtexExport.php" );
EOT;
	exit( 1 );
}
 
 $wgAutoloadClasses['BibtexExport'] = dirname(__FILE__) . '/BibtexExport_body.php';
 $wgSpecialPages['BibtexExport'] = 'BibtexExport';
 $wgHooks['LoadAllMessages'][] = 'BibtexExport::loadMessages';
 $wgHooks['LangugeGetSpecialPageAliases'][] = 'BibtexExportLocalizedPageName';
  
function BibtexExportLocalizedPageName(&$specialPageArray, $code) {
    # The localized title of the special page is among the messages of the
    # extension:
    BibtexExport::loadMessages();
    $text = wfMsg('myextension');

    # Convert from title in text form to DBKey and put it into the alias array:
    $title = Title::newFromText($text);
    $specialPageArray['BibtexExport'][] = $title->getDBKey();

    return true;
}

?>

