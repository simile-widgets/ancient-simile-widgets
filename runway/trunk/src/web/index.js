var possibleSettings = {
    //"slideSize" : "number",
    
    "spread" : "number",
    "centerSpread" : "number",
    "recede" : "number",
    "tilt" : "number",
    "centerOffset" : "number",
    "fieldOfView" : "number",
    
    "reflectivity" : "number",
    "reflectionExtent" : "number",
    
    "backgroundGradient" : [ "none", "single", "double" ],
    "backgroundColor" : "color",
    "backgroundColorTop" : "color",
    "backgroundColorMiddle" : "color",
    "backgroundColorBottom" : "color",
    //"backgroundImageURL" : "string",
    //"backgroundImageAlign" : [ "left", "center", "right" ],
    //"backgroundImageRepeat" : [ "repeat", "norepeat" ],
    //"backgroundImageOpacity" : "number",
    
    "showTitle" : "boolean",
    "titleFontFamily" : "string",
    "titleFontSize" : "number",
    "titleFontBold" : "boolean",
    "titleColor" : "color",
    
    "showSubtitle" : "boolean",
    "subtitleFontFamily" : "string",
    "subtitleFontSize" : "number",
    "subtitleFontBold" : "boolean",
    "subtitleColor" : "color"
};

function onThemeChange(select) {
    var themeName = select.options[select.selectedIndex].value;
    var theme = Runway.themes[themeName];
    
    widget.setThemeName(themeName);
    
    document.body.style.backgroundColor = theme.topColor;
    document.body.className = "theme-" + themeName;
    document.getElementById("bottom-panel").style.backgroundColor = theme.bottomColor;
    
    generateSettingPanel();
}

function generateSettingPanel() {
    var div = document.getElementById("settings-panel");
    div.innerHTML = "";
    
    var table = document.createElement("table");
    div.appendChild(table);
    
    for (var n in possibleSettings) {
        var tr = table.insertRow(table.rows.length);
        var td0 = tr.insertCell(0);
        var td1 = tr.insertCell(1);
        
        td0.innerHTML = n;
        
        var value = widget.getProperty(n);
        var type = possibleSettings[n];
        if (typeof type == "string") {
            if (type == "boolean") {
                generateBooleanSetting(td1, n, value);
            } else {
                generateTextSetting(td1, n, value);
            }
        } else {
            generateSelectSetting(td1, n, value, type);
        }
    }
}

function generateTextSetting(container, name, value) {
    var input = document.createElement("input");
    container.appendChild(input);
    
    input.value = value;
    input.onchange = function() {
        widget.setProperty(name, input.value);
        input.value = widget.getProperty(name);
    };
}

function generateBooleanSetting(container, name, value) {
    var input = document.createElement("input");
    input.type = "checkbox";
    container.appendChild(input);
    
    input.checked = value;
    input.onclick = function() {
        widget.setProperty(name, input.checked);
        input.checked = widget.getProperty(name);
    };
}

function generateSelectSetting(container, name, value, choices) {
    var select = document.createElement("select");
    container.appendChild(select);
    
    for (var i = 0; i < choices.length; i++) {
        var option = document.createElement("option");
        option.value = choices[i];
        option.innerHTML = choices[i];
        select.appendChild(option);
    }
    
    function selectChoice(v) {
        for (var i = 0; i < choices.length; i++) {
            if (v == choices[i]) {
                select.selectedIndex = i;
                return;
            }
        }
    }
    selectChoice(value);
    
    select.onchange = function() {
        widget.setProperty(name, select.options[select.selectedIndex].value);
        selectChoice(widget.getProperty(name));
    };
}
