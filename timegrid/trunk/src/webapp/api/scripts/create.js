$(document).ready(function() {
    $('div').each(function() {
        if ($(this).attrs('tg').role == "grid") {
            if (!window.timegrids) { window.timegrids = new Array(); }
            window.timegrids.push(Timegrid.createFromDOM(this));
        }
    });
});