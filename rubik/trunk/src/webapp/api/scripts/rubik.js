var g_historyLocation = 0;

function advanceHistory() {
}

function setHistoryPosition(newPosition) {
}

function showStatus(message) {
    window.scrollY = 0;
    var div = document.getElementById("status-box");
    div.innerHTML = message;
    div.style.display = "block";
}

function hideStatus() {
    document.getElementById("status-box").style.display = "none";
}

function performLongTask(f, message) {
    showStatus(message);
    setTimeout(function() {
        try { f(); } catch (e) {}
        hideStatus();
    }, 0);
}