/*==================================================
 *  Exhibit.BrowsePanel classic theme
 *==================================================
 */
 
Exhibit.BrowsePanel.theme = new Object();

Exhibit.BrowsePanel.theme.constructBrowsePanel = function(exhibit, div, logoURL) {
    var l10n = Exhibit.BrowsePanel.l10n;
    var logo = SimileAjax.Graphics.createTranslucentImage(document, logoURL);
    var id = "exhibit-logo-image";
    if (!document.getElementById(id)) {
        logo.id = id;
    }
    var template = {
        elmt: div,
        children: [
            {   tag:        "div",
                field:      "facetContainer"
            },
            {   tag:        "div",
                className:  "exhibit-browsePanel-logoContainer",
                children: [
                    {   tag:        "a",
                        href:       "http://simile.mit.edu/exhibit/",
                        target:     "_blank",
                        title:      "http://simile.mit.edu/exhibit/",
                        children:   [
                            { elmt: logo }
                        ]
                    }
                ]
            }
        ]
    };
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    return dom;
};

Exhibit.BrowsePanel.theme.constructConfigureHelpDom = function(exhibit, div) {
    var l10n = Exhibit.BrowsePanel.l10n;
    var template = {
        elmt: div,
        children: [
            {   tag:        "div",
                className:  "exhibit-browsePanel-notConfigureMessage",
                children: [
                    {   tag:        "p",
                        children:   [ l10n.notConfigureMessage ]
                    },
                    {   tag:        "p",
                        children:   [
                            {   tag:        "a",
                                href:       "http://simile.mit.edu/wiki/Exhibit/Configuring_Browse_Panel",
                                target:     "_blank",
                                children:   [ l10n.learnHowMessage ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
    var dom = SimileAjax.DOM.createDOMFromTemplate(document, template);
    return dom;
};
