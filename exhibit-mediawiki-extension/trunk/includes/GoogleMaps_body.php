<?php
class GoogleMaps extends SpecialPage
{
    function GoogleMaps() {
        SpecialPage::SpecialPage("GoogleMaps");
        self::loadMessages();
    }

    function execute( $par ) {
        global $wgOut;
        global $gmapkey;

		#Don't want to output standard Wiki stuff, just want blank page.
        $wgOut->disable();
        
        #Load Google Maps scripts
        echo '<script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key='.$gmapkey.'"></script>';        
    }    
    
    function loadMessages() {
        static $messagesLoaded = false;
        global $wgMessageCache;
        if ( $messagesLoaded ) return;
        $messagesLoaded = true;

        require( dirname( __FILE__ ) . '/GoogleMaps.i18n.php' );
        foreach ( $allMessages as $lang => $langMessages ) {
            $wgMessageCache->addMessages( $langMessages, $lang );
        }
        return true;
    }
}
?>