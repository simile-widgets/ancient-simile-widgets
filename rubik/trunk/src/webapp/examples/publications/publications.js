var rubik;
function onLoad() {
    var configuration = {
        engine: {
            facets: [
                "venue",
                "year",
                "event",
                "authors"
            ]
        },
        browsePanel: {
            properties: [
                "venue",
                "event",
                "year",
                "authors"
            ]
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
