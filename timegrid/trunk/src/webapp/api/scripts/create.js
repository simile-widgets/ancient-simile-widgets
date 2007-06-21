$(document).ready(function() {
    $('div.timegrid').each(function() {
        if (!window.timegrids) { window.timegrids = new Array(); }
        window.timegrids.push(Timegrid.createFromDOM(this));
    });
});