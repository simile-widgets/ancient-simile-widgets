var rubik;
function onLoad() {
    rubik = Rubik.create(
        document.getElementById("control-panel"),
        document.getElementById("browse-panel"),
        document.getElementById("view-panel"),
        {
            engine: {
                facets: [
                    "venue",
                    "year",
                    "event",
                    "authors"
                ]
            }
        }
    );
    rubik.loadJSON("json.js",
        function() {
            rubik.getBrowsingEngine().setRootCollection(
                rubik.getDatabase().getAllItems()
            );
        }
    );
}
