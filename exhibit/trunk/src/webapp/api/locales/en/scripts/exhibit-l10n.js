/*==================================================
 *  Exhibit English localization
 *==================================================
 */
 
Exhibit.l10n = {
    missingLabel:   "missing",
    missingSortKey: "(missing)",
    itemLinkLabel:  "link",
    
    busyIndicatorMessage:   "Working...",
    
    /*
     *  Copy button and dialog box
     */
    copyButtonLabel:                "Copy",
    copyAllButtonLabel:             "Copy All",
    copyDialogBoxCloseButtonLabel:  "Close",
    copyDialogBoxPrompt:            
        "Copy this code to your clipboard as you would copy any text. Press ESC to close this dialog box.",
        
    /*
     *  Focusdialog box
     */
    focusDialogBoxCloseButtonLabel:  "Close",
     
    /*
     *  Common exporters' labels
     */
    rdfXmlExporterLabel:            "RDF/XML",
    smwExporterLabel:               "Semantic wikitext",
    exhibitJsonExporterLabel:       "Exhibit JSON",
    tsvExporterLabel:               "Tab Separated Values",
    
    /*
     *  List composition
     */
    composeListString: function(a) {
        var s = "";
        for (var i = 0; i < a.length; i++) {
            if (i > 0) {
                if (i < a.length - 1) {
                    s += ", ";
                } else if (a.length < 3) {
                    s += " and ";
                } else {
                    s += ", and ";
                }
            }
            s += a[i];
        }
        return s;
    },
    createListDelimiter: function(parentElmt, count) {
        var f = function() {
            if (f.index > 0 && f.index < count) {
                if (count > 2) {
                    parentElmt.appendChild(document.createTextNode(
                        (f.index == count - 1) ? ", and " : ", "));
                } else {
                    parentElmt.appendChild(document.createTextNode(" and "));
                }
            }
            f.index++;
        };
        f.index = 0;
        
        return f;
    }
};
