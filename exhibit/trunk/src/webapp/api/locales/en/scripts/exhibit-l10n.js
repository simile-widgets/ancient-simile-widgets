/*==================================================
 *  Exhibit Norwegian (Bokmål) localization
 *==================================================
 */

if (!("l10n" in Exhibit)) {
    Exhibit.l10n = {};
}

Exhibit.l10n.missingLabel = "mangler";
Exhibit.l10n.missingSortKey = "(mangler)";
Exhibit.l10n.notApplicableSortKey = "(n/a)";
Exhibit.l10n.itemLinkLabel = "lenke";
    
Exhibit.l10n.busyIndicatorMessage = "Jobber med saken...";
Exhibit.l10n.showDocumentationMessage = "Dokumentasjonen vil bli vist etter denne meldinga.";
Exhibit.l10n.showJavascriptValidationMessage = "Vi vil forklare detaljene i forbindelse med feilen etter denne meldinga.";
    
Exhibit.l10n.showJsonValidationMessage = "Vi vil forklare feilene i detalj etter denne meldinga.";
Exhibit.l10n.showJsonValidationFormMessage = "Vi vil undersøke med en vevtjeneste hvor du kan laste opp og sjekke koden din etter denne meldingen.";
    
Exhibit.l10n.badJsonMessage = function(url, e) {
    return "JSON-fila\n  " + url + "\ninneholder feil =\n\n" + e;
};
Exhibit.l10n.failedToLoadDataFileMessage = function(url) {
    return "Vi kan ikke finne dataene i fila\n  " + url + "\nSjekk om navnet er korrekt.";
};
    
/*
 *  Copy button and dialog box
 */
Exhibit.l10n.exportButtonLabel = "Eksporter";
Exhibit.l10n.exportAllButtonLabel = "Eksporter alle";
Exhibit.l10n.exportDialogBoxCloseButtonLabel =  "Lukk";
Exhibit.l10n.exportDialogBoxPrompt =
    "Kopier denne koden til utklippstavla di. Trykk ESCAPE-tasten for å lukke denne dialogboksen.";
        
/*
 *  Focusdialog box
 */
Exhibit.l10n.focusDialogBoxCloseButtonLabel = "Lukk";
     
/*
 *  Common exporters' labels
 */
Exhibit.l10n.rdfXmlExporterLabel =            "RDF/XML";
Exhibit.l10n.smwExporterLabel =               "Semantisk wikitekst";
Exhibit.l10n.exhibitJsonExporterLabel =       "Exhibit JSON";
Exhibit.l10n.tsvExporterLabel =               "Tabseparert tekst";
Exhibit.l10n.htmlExporterLabel =              "HTML laget fra denne visninga";
