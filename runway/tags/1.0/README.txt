
==============================
Debugging Flash in the Browser

[As of Feb 2009, on Flash Player 10]

1.  Make sure you have the debug version of the Flash player. If you don't, 
    or don't know, then you should uninstall your current Flash player
    and install the debug version.
    
    a.  To uninstall, download and run the appropriate uninstaller from here
    
        http://www.adobe.com/shockwave/download/alternates/
    
    b.  Debug versions of the Flash player are here
    
        http://www.adobe.com/support/flashplayer/downloads.html
        
        The "Plugin" version works for me. I don't know what the "Projector"
        version is all about.
        
    c.  Make sure you restart your browser.

2.  For Firefox, install the FlashTracer extension

    http://www.sephiroth.it/firefox/flashtracer/
    
    This extension will display Flash debug outputs (traces) in a sidebar
    for your convenience.
    
3.  In Firefox, open the FlashTracer sidebar (Tools -> Flash Tracer). Then
    click on the Preferences button at the bottom right corner of the sidebar.
    Set the output file path. This should cause FlashTracer to create
    the log output file as well as the mm.cfg file.
    
    a.  For details about the mm.cfg file (in case you need to configure it
        by hand), see:
        
        http://livedocs.adobe.com/flex/201/html/wwhelp/wwhimpl/common/html/wwhelp.htm?context=LiveDocs_Book_Parts&file=logging_125_04.html
    
    
===============
Security Issues

1.  For the .swf's Actionscript and the web page's Javascript to call 
    each other, you need to get each side to trust the other. .swf files 
    through local file:// URLs tend to be more troublesome than through 
    http:// URLs. If the .swf file isn't trusted, then 
    ExternalInterface.addCallback calls will fail with exception 
    SecurityError #2060. If that happens (through try catch and trace),
    then you would need to tell the Flash player to trust the .swf file
    explicitly. To do so, point your browser to:
    
    http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html
    
    That page embeds a Flash interface for you to configure the Flash player.
    Next to the "Always trust files in these locations", click on the
    dropdown and use the Add Location command to add your .swf file.
    
2.  If you use the Flex Builder instead of the ant mxmlc task to compile
    your .as into .swf, then you probably won't get that exception. I
    suspect that the Flex Builder knows how to sign the .swf file to
    make it trustable automatically.

3.  You also need to get the .swf's Actionscript to trust the web page's
    Javascript. This is done by adding in the .as file a call to
    
    Security.allowDomain("*");
    
    where Security is imported from flash.system.Security. The domain
    is a pattern.
