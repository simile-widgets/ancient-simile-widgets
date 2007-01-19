/*==================================================
 *  Exhibit Spanish localization
 *==================================================
 */
 
Exhibit.l10n = {
    missingLabel:   "falta",
    missingSortKey: "(falta)",
    notApplicableSortKey: "(n/a)",
    itemLinkLabel:  "link",
    
    busyIndicatorMessage:       "Procesando...",
    showDocumentationMessage:   "Te enseñaremos la documentación asociada después de este mensaje.",
    showJavascriptValidationMessage: "Te explicaremos los detalles del error después de este mensaje.",
    
    showJsonValidationMessage: "Te explicaremos los detalles del error después de este mensaje.",
    showJsonValidationFormMessage: "Te redirigiremos a un servicio web donde podrás subir y verificar tu código después de este mensaje.",
    
    badJsonMessage: function(url, e) {
        return "El fichero de datos JSON\n  " + url + "\ncontiene errores:\n\n" + e;
    },
    failedToLoadDataFileMessage: function(url) {
        return "No podemos localizar el fichero de datos\n  " + url + "\nComprueba que el nombre del archivo es correcto.";
    },
    
    /*
     *  Copy button and dialog box
     */
    copyButtonLabel:                "Copiar",
    copyAllButtonLabel:             "Copiar todo",
    copyDialogBoxCloseButtonLabel:  "Cerrar",
    copyDialogBoxPrompt:            
        "Copia este código en tu clipboard como si fuera texto. Pulsa ESC para cerrar este cuadro de diálogo.",
        
    /*
     *  Focusdialog box
     */
    focusDialogBoxCloseButtonLabel:  "Cerrar",
     
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
                    s += " y ";
                } else {
                    s += ", y ";
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
                        (f.index == count - 1) ? ", y " : ", "));
                } else {
                    parentElmt.appendChild(document.createTextNode(" y "));
                }
            }
            f.index++;
        };
        f.index = 0;
        
        return f;
    }
};
