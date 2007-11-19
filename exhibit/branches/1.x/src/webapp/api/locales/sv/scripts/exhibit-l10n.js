/*==================================================
 *  Exhibit Swedish localization
 *==================================================
 */

Exhibit.l10n = {
    missingLabel:   "saknas",
    missingSortKey: "(saknas)",
    notApplicableSortKey: "(n/a)",
    itemLinkLabel:  "lÃ¤nk",

    busyIndicatorMessage:       "Arbetar...",
    showDocumentationMessage:   "Relevant dokumentation kommer visas efter det hÃ¤r meddelandet.",
    showJavascriptValidationMessage: "Felet fÃ¶rklaras mer ingÃ¥ende efter det hÃ¤r meddelandet.",

    showJsonValidationMessage: "Felet fÃ¶rklaras mer ingÃ¥ende efter det hÃ¤r meddelandet.",
    showJsonValidationFormMessage: "Vi skickar dig till en webtjÃ¤nst du kan ladda upp din kod till fÃ¶r felsÃ¶kning efter det hÃ¤r meddelandet.",

    badJsonMessage: function(url, e) {
        return "JSON-filen\n  " + url + "\ninnehÃ¥ller fel:\n\n" + e;
    },
    failedToLoadDataFileMessage: function(url) {
        return "Kunde inte hitta filen\n  " + url +
             "\nKontrollera att filnamnet Ã¤r korrekt.";
    },

    /*
     *  Copy button and dialog box
     */
    copyButtonLabel:                "Kopiera",
    copyAllButtonLabel:             "Kopiera allt",
    copyDialogBoxCloseButtonLabel:  "StÃ¤ng",
    copyDialogBoxPrompt:
        "Kopiera det hÃ¤r till klippbordet precis som du skulle gÃ¶ra fÃ¶r annan text. Tryck ESC fÃ¶r att stÃ¤nga den hÃ¤r dialogen.",

    /*
     *  Focusdialog box
     */
    focusDialogBoxCloseButtonLabel:  "StÃ¤ng",

    /*
     *  Common exporters' labels
     */
    rdfXmlExporterLabel:            "RDF/XML",
    smwExporterLabel:               "Semantisk wikitext",
    exhibitJsonExporterLabel:       "Exhibit JSON",
    tsvExporterLabel:               "Tabseparerade vÃ¤rden",
    htmlExporterLabel:              "Generated HTML of this view",

    /*
     *  List composition
     */
    composeListString: function(a) {
        var s = "";
        for (var i = 0; i < a.length; i++) {
            if (i > 0) {
                if (i < a.length - 1)
                    s += ", ";
                else
                    s += " och ";
            }
            s += a[i];
        }
        return s;
    },
    createListDelimiter: function(parentElmt, count) {
        var f = function() {
            if (f.index > 0 && f.index < count) {
                parentElmt.appendChild(document.createTextNode(
                    (f.index == count - 1) ? " och " : ", "));
            }
            f.index++;
        };
        f.index = 0;

        return f;
    }
};
