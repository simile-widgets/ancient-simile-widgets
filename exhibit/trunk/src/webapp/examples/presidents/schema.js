{
    types: {
        'President': {
            pluralLabel: 'Presidents'
        },
        'Precidency': {
            pluralLabel: 'Presidencies'
        }
    },
    properties: {
        'imageURL': {
            valueType: "url"
        },
        'url': {
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
        
        'presidency': {
            valueType:              "item"
        },
        'term': {
            valueType:              "number"
        },
        'inDate': {
            valueType:              "date"
        },
        'outDate': {
            valueType:              "date"
        },
        'birth': {
            valueType:              "date"
        },
        'death': {
            valueType:              "date"
        }
    }
}
