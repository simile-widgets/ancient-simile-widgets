/*==================================================
 *  Exhibit.ViewPanel English localization
 *==================================================
 */
 
Exhibit.ViewPanel.l10n = {
    resetFiltersLabel:  "reset",
    createSelectViewActionTitle: function(viewLabel) {
        return "selecciona " + viewLabel + " vista";
    },
    createNoResultsTemplate: function(
        countClass,
        typesClass,
        detailsClass
    ) {
        return [
            {   tag:        "span",
                className:  countClass,
                children:   [ "0" ]
            },
            {   tag:        "span",
                className:  typesClass,
                children:   [ " resultados" ]
            },
            ". ",
            {   tag:        "span",
                className:  detailsClass,
                children:   [ "Elimina algunos filtros para obtener resultados." ]
            }
        ];
    },
    createResultsSummaryTemplate: function(
        countClass,
        typesClass,
        detailsClass,
        resetActionLink
    ) {
        return [
            {   tag:        "span",
                className:  countClass,
                field:      "itemCountSpan"
            },
            {   tag:        "span",
                className:  typesClass,
                field:      "typesSpan"
            },
            {   tag:        "span",
                className:  detailsClass,
                field:      "noFilterDetailsSpan",
                style:      { display: "none" },
                children:   [ "total" ]
            },
            {   tag:        "span",
                className:  detailsClass,
                field:      "filteredDetailsSpan",
                style:      { display: "none" },
                children: [
                    " filtered from ",
                    {   tag:    "span",
                        field:  "originalCountSpan"
                    },
                    " originally (",
                    {   elmt:  resetActionLink,
                        title: "Elminar todos los filtros, ver elementos iniciales"
                    },
                    ")"
                ]
            }
        ];
    },
    
    missingViewClassMessage: "En la especificación de una de las vistas falta el campo viewClass.",
    viewClassNotFunctionMessage: function(expr) {
        return " El valor del atributo viewClass '" + expr + "' espeficicado\n" +
            "en una de las vistas no se corresponde con una función Javascript.";
    },
    badViewClassMessage: function(expr) {
        return "El valor del atributo viewClass '" + expr + "' especificado\n" +
            "en una de las vistas no es una expresión Javascript válida.";
    }
};
