{
    types: {
        'State': {
            pluralLabel: 'States'
        },
        'Politican': {
            pluralLabel: 'Politicians'
        }
    },
    properties: {
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
        
        'governor': {
            valueType:              "item"
        },
        'seniorSenator': {
            valueType:              "item"
        },
        'juniorSenator': {
            valueType:              "item"
        },
        
        'bushSupport': {
            label:                  "Bush %",
            valueType:              "number"
        },
        'kerrySupport': {
            label:                  "Kerry %",
            valueType:              "number"
        },
        'supportDiff': {
            label:                  "Bush - Kerry %",
            valueType:              "number"
        },
        'houseDemocrats': {
            label:                  "House Democrats",
            valueType:              "number"
        },
        'houseRepublicans': {
            label:                  "House Republicans",
            valueType:              "number"
        },
        'majorParty': {
            label:                  "Major Party"
        }
    }
}
