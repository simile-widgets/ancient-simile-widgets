{
    types: {
        'Person': {
            pluralLabel: 'People'
        },
        'Publication': {
            pluralLabel: 'Publications'
        }
    },
    properties: {
        'conferenceURL': {
            valueType: "url"
        },
        'powerpointURL': {
            valueType: "url"
        },
        'psURL': {
            valueType: "url"
        },
        'pdfURL': {
            valueType: "url"
        },
        'author': {
            label:                  "authored by",
            reverseLabel:           "author of",
            reversePluralLabel:     "authors of",
            groupingLabel:          "their authors",
            reverseGroupingLabel:   "their work",
            valueType:              "item"
        },
        'year': {
            valueType:              "date"
        }
    }
}
