var widget;

function onLoad() {
    widget = Datadust.createOrShowInstaller(
        document.getElementById("the-widget"),
        {
            sources: [
                {   url:        "examples/world/data/world-population.txt",
                    format:     "tab",
                    hasColumnHeadings: true,
                    columns: [
                        { name : "population", type: "number" },
                        { name : "area", type: "number" },
                        { name : "density", type: "number" }
                    ],
                    group: {
                        key:    "country",
                        group:  "year"
                    }
                },
                {   url:        "examples/world/data/world-literacy.txt",
                    format:     "tab",
                    hasColumnHeadings: true,
                    columns: [
                        { name : "literacy", type: "number" }
                    ],
                    join:       [ { "ours" : "country", "theirs" : "country" } ]
                }
            ],
            prepare: [
                { operation: "sort", expression: "data.year[2000].population", ascending: false }
            ],
            configs: [
                {
                    tooltip: { expression: "data.country" },
                    xAxis: {
                        expression: "default(data.year[1950].population, 0)",
                        scale: "log"
                    },
                    yAxis: {
                        expression: "default(data.year[1950].density, 0)",
                        scale: "log"
                    },
                    nodes: {
                        size: { expression: "power(data.literacy, 2)" }
                    }
                },
                {
                    tooltip: { expression: "data.country" },
                    xAxis: {
                        expression: "default(data.year[2000].population, 0)",
                        scale: "log"
                    },
                    yAxis: {
                        expression: "default(data.year[2000].density, 0)",
                        scale: "log"
                    },
                    nodes: {
                        size: { expression: "power(data.literacy, 2)" }
                    }
                },
                {
                    tooltip: { expression: "data.country" },
                    xAxis: {
                        expression: "default(data.literacy, 0)",
                        scale: "linear"
                    },
                    yAxis: {
                        expression: "default(data.year[2000].population, 0)",
                        scale: "log"
                    },
                    nodes: {
                        size: { expression: "power(data.year[2000].density, 2)" }
                    }
                }
            ]
        }
    );
}

function select(index) {
    widget.selectConfiguration(index);
}
