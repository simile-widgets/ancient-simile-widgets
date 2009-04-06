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
                {   url:        "examples/world/data/continents.txt",
                    format:     "tab",
                    hasColumnHeadings: true,
                    join:       "country"
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
                    tooltip: { expression: "data.country + ' in ' + data.continent" },
                    xAxis: {
                        expression: "default(data.year[1950].population, 0)",
                        scale: "log"
                    },
                    yAxis: {
                        expression: "default(data.year[1950].density, 0)",
                        scale: "log"
                    },
                    nodes: {
                        size: { expression: "power(data.literacy, 2)" },
                        fillColor: { expression: "data.continent" }
                    }
                },
                {
                    baseConfig: 0,
                    xAxis: {
                        expression: "default(data.year[2000].population, 0)",
                        scale: "log"
                    },
                    yAxis: {
                        expression: "default(data.year[2000].density, 0)",
                        scale: "log"
                    }
                },
                {
                    baseConfig: 0,
                    xAxis: {
                        expression: "default(data.literacy, 0)",
                        scale: "linear"
                    },
                    yAxis: {
                        expression: "default(data.year[2000].population, 0)",
                        scale: "log"
                    }
                }
            ]
        }
    );
}

function select(index) {
    widget.selectConfiguration(index);
}
