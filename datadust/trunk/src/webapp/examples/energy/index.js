var widget;

function onLoad() {
    widget = Datadust.createOrShowInstaller(
        document.getElementById("the-widget"),
        {
            sources: [
                {   url:        "us-oil-import.txt",
                    format:     "tab",
                    hasColumnHeadings: false,
                    columns: [
                        { name : "date", type: "string" },
                        { name : "oil", type: "number" }
                    ]
                },
                {   url:        "gasoline-price.txt",
                    format:     "tab",
                    hasColumnHeadings: false,
                    columns: [
                        { name : "date", type: "string" },
                        { name : "gas", type: "number" }
                    ],
                    join: "date"
                }
            ],
            prepare: [
                //{ operation: "sort", expression: "data.year[2000].population", ascending: false }
                { operation: "connect", sort: "date(data.date)" }
            ],
            configs: [
                {
                    tooltip: { expression: "data.date + ' ' + date(data.date)" },
                    xAxis: {
                        expression: "data.oil",
                        scale: "linear"
                    },
                    yAxis: {
                        expression: "data.gas",
                        scale: "linear"
                    },
                    nodes: {
                        //size: { expression: "power(data.literacy, 2)" }
                    }
                },
                {
                    tooltip: { expression: "data.date" },
                    xAxis: {
                        expression: "date(data.date)",
                        scale: "linear"
                    },
                    yAxis: {
                        expression: "data.gas",
                        scale: "linear"
                    },
                    nodes: {
                        //size: { expression: "power(data.literacy, 2)" }
                    }
                }
            ]
        }
    );
}

function select(index) {
    widget.selectConfiguration(index);
}