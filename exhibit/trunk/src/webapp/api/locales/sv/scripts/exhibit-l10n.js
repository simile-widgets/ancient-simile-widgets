/*==================================================
 *  Exhibit Swedish localization
 *==================================================
 */

Exhibit.l10n = {
    missingLabel:   "saknas",
    missingSortKey: "(saknas)",
    notApplicableSortKey: "(n/a)",
    itemLinkLabel:  "l\xE4nk",

    busyIndicatorMessage:       "Arbetar...",
    showDocumentationMessage:   "Relevant dokumentation kommer visas efter det h\xE4r meddelandet.",
    showJavascriptValidationMessage: "Felet f\xD6rklaras mer ing\xE5ende efter det h\xE4r meddelandet.",

    showJsonValidationMessage: "Felet f\xD6rklaras mer ing\xE5ende efter det h\xE4r meddelandet.",
    showJsonValidationFormMessage: "Vi skickar dig till en webtj\xE4nst du kan ladda upp din kod till f\xD6r fels\xD6kning efter det h\xE4r meddelandet.",

    badJsonMessage: function(url, e) {
        return "JSON-filen\n  " + url + "\ninneh\xE5ller fel:\n\n" + e;
    },
    failedToLoadDataFileMessage: function(url) {
        return "Kunde inte hitta filen\n  " + url +
             "\nKontrollera att filnamnet \xE4r korrekt.";
    },

    /*
     *  Copy button and dialog box
     */
    copyButtonLabel:                "Kopiera",
    copyAllButtonLabel:             "Kopiera allt",
    copyDialogBoxCloseButtonLabel:  "St\xE4ng",
    copyDialogBoxPrompt:
        "Kopiera det h\xE4r till klippbordet precis som du skulle g\xD6ra f\xD6r annan text. Tryck ESC f\xD6r att st\xE4nga den h\xE4r dialogen.",

    /*
     *  Focusdialog box
     */
    focusDialogBoxCloseButtonLabel:  "St\xE4ng",

    /*
     *  Common exporters' labels
     */
    rdfXmlExporterLabel:            "RDF/XML",
    smwExporterLabel:               "Semantisk wikitext",
    exhibitJsonExporterLabel:       "Exhibit JSON",
    tsvExporterLabel:               "Tabseparerade v\xE4rden",

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
