var rubik;
function onLoad() {
    var configuration = {
        BrowseEngine: {
            facets: [
                "type",
                "venue",
                "year",
                "event",
                "authors"
            ]
        },
        TileView: {
            properties: [
                "authors",
                "type",
                "venue",
                "event",
                "year"
            ],
            orders: [
                "type",
                { property: "year", ascending: false },
                "label"
            ],
            groupLevels: 2
        }
    };
        
    rubik = Rubik.create(
        document.getElementById("control-panel"),
        document.getElementById("browse-panel"),
        document.getElementById("view-panel"),
        configuration
    );
    rubik.loadJSON("json.js",
        function() {
            rubik.getBrowseEngine().setRootCollection(
                rubik.getDatabase().getAllItems()
            );
        }
    );
}
