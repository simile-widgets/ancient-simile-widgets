/*==================================================
 *  Exhibit Swedish localization
 *==================================================
 */

Exhibit.l10n = {
    missingLabel:   "saknas",
    missingSortKey: "(saknas)",
    notApplicableSortKey: "(n/a)",
    itemLinkLabel:  "länk",

    busyIndicatorMessage:       "Arbetar...",
    showDocumentationMessage:   "Relevant dokumentation kommer visas efter det här meddelandet.",
    showJavascriptValidationMessage: "Felet förklaras mer ingående efter det här meddelandet.",

    showJsonValidationMessage: "Felet förklaras mer ingående efter det här meddelandet.",
    showJsonValidationFormMessage: "Vi skickar dig till en webtjänst du kan ladda upp din kod till för felsökning efter det här meddelandet.",

    badJsonMessage: function(url, e) {
        return "JSON-filen\n  " + url + "\ninnehåller fel:\n\n" + e;
    },
    failedToLoadDataFileMessage: function(url) {
        return "Kunde inte hitta filen\n  " + url +
             "\nKontrollera att filnamnet är korrekt.";
    },

    /*
     *  Copy button and dialog box
     */
    copyButtonLabel:                "Kopiera",
    copyAllButtonLabel:             "Kopiera allt",
    copyDialogBoxCloseButtonLabel:  "Stäng",
    copyDialogBoxPrompt:
        "Kopiera det här till klippbordet precis som du skulle göra för annan text. Tryck ESC för att stänga den här dialogen.",

    /*
     *  Focusdialog box
     */
    focusDialogBoxCloseButtonLabel:  "Stäng",

    /*
     *  Common exporters' labels
     */
    rdfXmlExporterLabel:            "RDF/XML",
    smwExporterLabel:               "Semantisk wikitext",
    exhibitJsonExporterLabel:       "Exhibit JSON",
    tsvExporterLabel:               "Tabseparerade värden",
    htmlExporterLabel:              "HTML för den här vyn",

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
