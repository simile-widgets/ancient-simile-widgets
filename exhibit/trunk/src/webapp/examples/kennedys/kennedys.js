var rubik;
function onLoad() {
    rubik = Rubik.create(
        document.getElementById("control-panel"),
        document.getElementById("browse-panel"),
        document.getElementById("view-panel")
    );
    rubik.loadJSON("json.js",
        function() {
            rubik.getQueryEngine().setRootCollection(
                rubik.getDatabase().getSubjects("Person", "type")
            );
        }
    );
}
