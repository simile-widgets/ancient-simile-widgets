Exhibit.Scraper = {};


  
Exhibit.Scraper.createScraperFromDOM = function(elmt, uiContext) {
    var configuration = Exhibit.extractOptionsFromElement(elmt);
    return Exhibit.Scraper.createScraper(configuration, elmt, uiContext);
}

Exhibit.Scraper.createScraper = function(configuration, elmt, uiContext) {
    if (elmt.nodeName.toLowerCase() == 'a') {
        elmt.href = "javascript:";
    }

    var input = document.getElementById(configuration.scraperinput);
    
    var clickHandler = function() {
        
    }
    
    SimileAjax.jQuery(input).click(clickHandler);
}