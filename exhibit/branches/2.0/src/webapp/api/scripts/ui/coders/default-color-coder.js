/*==================================================
 *  Exhibit.DefaultColorCoder
 *==================================================
 */

Exhibit.DefaultColorCoder = function(uiContext) {
};

Exhibit.DefaultColorCoder._colors = [
    "#FF9000",
    "#5D7CBA",
    "#A97838",
    "#8B9BBA",
    "#FFC77F",
    "#003EBA",
    "#29447B",
    "#543C1C"
];
Exhibit.DefaultColorCoder._map = {};
Exhibit.DefaultColorCoder._mixedCase =   { label: "mixed",   color: "#fff" };
Exhibit.DefaultColorCoder._othersCase =  { label: "others",  color: "#aaa" };
Exhibit.DefaultColorCoder._missingCase = { label: "missing", color: "#888" };
Exhibit.DefaultColorCoder._nextColor = 0;

Exhibit.DefaultColorCoder.prototype.translate = function(key, flags) {
    if (key == null) {
        if (flags) flags.missing = true;
        return Exhibit.DefaultColorCoder._missingCase.color;
    } else {
        if (flags) flags.keys.add(key);
        if (key in Exhibit.DefaultColorCoder._map) {
            return Exhibit.DefaultColorCoder._map[key];
        } else {
            var color = Exhibit.DefaultColorCoder._colors[Exhibit.DefaultColorCoder._nextColor];
            Exhibit.DefaultColorCoder._nextColor = 
                (Exhibit.DefaultColorCoder._nextColor + 1) % Exhibit.DefaultColorCoder._colors.length;
                
            Exhibit.DefaultColorCoder._map[key] = color;
            return color;
        }
    }
};

Exhibit.DefaultColorCoder.prototype.translateSet = function(keys, flags) {
    var color = null;
    var self = this;
    keys.visit(function(key) {
        var color2 = self.translate(key, flags);
        if (color == null) {
            color = color2;
        } else if (color != color2) {
            color = Exhibit.DefaultColorCoder._mixedCase.color;
            flags.mixed = true;
            return true; // exit visitation
        }
        return false;
    });
    
    if (color != null) {
        return color;
    } else {
        flags.missing = true;
        return Exhibit.DefaultColorCoder._missingCase.color;
    }
};

Exhibit.DefaultColorCoder.prototype.getOthersLabel = function() {
    return Exhibit.DefaultColorCoder._othersCase.label;
};
Exhibit.DefaultColorCoder.prototype.getOthersColor = function() {
    return Exhibit.DefaultColorCoder._othersCase.color;
};

Exhibit.DefaultColorCoder.prototype.getMissingLabel = function() {
    return Exhibit.DefaultColorCoder._missingCase.label;
};
Exhibit.DefaultColorCoder.prototype.getMissingColor = function() {
    return Exhibit.DefaultColorCoder._missingCase.color;
};

Exhibit.DefaultColorCoder.prototype.getMixedLabel = function() {
    return Exhibit.DefaultColorCoder._mixedCase.label;
};
Exhibit.DefaultColorCoder.prototype.getMixedColor = function() {
    return Exhibit.DefaultColorCoder._mixedCase.color;
};
