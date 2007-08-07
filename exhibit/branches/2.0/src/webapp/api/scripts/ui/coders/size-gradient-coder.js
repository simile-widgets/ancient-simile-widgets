/*==================================================
 *  Exhibit.SizeGradientCoder
 *==================================================
 */

Exhibit.SizeGradientCoder = function(uiContext) {
    this._uiContext = uiContext;
    this._settings = {};
    
    this._gradientPoints = [];
    this._mixedCase = { label: "mixed", size: 20 };
    this._missingCase = { label: "missing", size: 20 };
    this._othersCase = { label: "others", size: 20 };
};

Exhibit.SizeGradientCoder._settingSpecs = {
};

Exhibit.SizeGradientCoder.create = function(configuration, uiContext) {
    var coder = new Exhibit.SizeGradientCoder(Exhibit.UIContext.create(configuration, uiContext));
    
    Exhibit.SizeGradientCoder._configure(coder, configuration);
    return coder;
};

Exhibit.SizeGradientCoder.createFromDOM = function(configElmt, uiContext) {
    configElmt.style.display = "none";
    
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var coder = new Exhibit.SizeGradientCoder(Exhibit.UIContext.create(configuration, uiContext));
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.SizeGradientCoder._settingSpecs, coder._settings);
    
    try {
		var gradientPoints = Exhibit.getAttribute(configElmt, "gradientPoints", ";")
		for (var i = 0; i < gradientPoints.length; i++) {
			var point = gradientPoints[i].split(',');
			coder._gradientPoints.push({ value: parseFloat(point[0]), size: parseFloat(point[1])});
		}
		
        var node = configElmt.firstChild;
        while (node != null) {
            if (node.nodeType == 1) {
                coder._addEntry(
                    Exhibit.getAttribute(node, "case"), 
                    node.firstChild.nodeValue.trim(), 
                    Exhibit.getAttribute(node, "size"));
            }
            node = node.nextSibling;
        }
    } catch (e) {
        SimileAjax.Debug.exception(e, "SizeGradientCoder: Error processing configuration of coder");
    }
    
    Exhibit.SizeGradientCoder._configure(coder, configuration);
    return coder;
};

Exhibit.SizeGradientCoder._configure = function(coder, configuration) {
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.SizeGradientCoder._settingSpecs, coder._settings);
    
    if ("entries" in configuration) {
        var entries = configuration.entries;
        for (var i = 0; i < entries.length; i++) {
            coder._addEntry(entries[i].kase, entries[i].key, entries[i].size);
        }
    }
}

Exhibit.SizeGradientCoder.prototype.dispose = function() {
    this._uiContext = null;
    this._settings = null;
};

Exhibit.SizeGradientCoder.prototype._addEntry = function(kase, key, size) {
    var entry = null;
    switch (kase) {
    case "others":  entry = this._othersCase; break;
    case "mixed":   entry = this._mixedCase; break;
    case "missing": entry = this._missingCase; break;
    }
    if (entry != null) {
        entry.label = key;
        entry.size = size;
	}
};

Exhibit.SizeGradientCoder.prototype.translate = function(key, flags) {
	var gradientPoints = this._gradientPoints;
	var getSize = function(key) {
		if (key.constructor != Number) {
			key = parseFloat(key);
		}
		for (j = 0; j < gradientPoints.length; j++) {
			if (key == gradientPoints[j].value) {
				return gradientPoints[j].size;
			} else if (gradientPoints[j+1] != null) {
				if (key < gradientPoints[j+1].value) {
					var fraction = (key - gradientPoints[j].value)/(gradientPoints[j+1].value - gradientPoints[j].value);
					var newSize = Math.floor(gradientPoints[j].size + fraction*(gradientPoints[j+1].size - gradientPoints[j].size));
					return newSize;
				}
			}
		}
	}
	
    if (key >= gradientPoints[0].value & key <= gradientPoints[gradientPoints.length-1].value) {
        if (flags) flags.keys.add(key);
        return getSize(key);
    } else if (key == null) {
        if (flags) flags.missing = true;
        return this._missingCase.size;
    } else {
        if (flags) flags.others = true;
        return this._othersCase.size;
    }
};

Exhibit.SizeGradientCoder.prototype.translateSet = function(keys, flags) {
    var size = null;
    var self = this;
    keys.visit(function(key) {
        var size2 = self.translate(key, flags);
        if (size == null) {
            size = size2;
        } else if (size != size2) {
            if (flags) flags.mixed = true;
            size = self._mixedCase.size;
            return true;
        }
        return false;
    });
    
    if (size != null) {
        return size;
    } else {
        if (flags) flags.missing = true;
        return this._missingCase.size;
    }
};

Exhibit.SizeGradientCoder.prototype.getOthersLabel = function() {
    return this._othersCase.label;
};
Exhibit.SizeGradientCoder.prototype.getOthersSize = function() {
    return this._othersCase.size;
};

Exhibit.SizeGradientCoder.prototype.getMissingLabel = function() {
    return this._missingCase.label;
};
Exhibit.SizeGradientCoder.prototype.getMissingSize = function() {
    return this._missingCase.size;
};

Exhibit.SizeGradientCoder.prototype.getMixedLabel = function() {
    return this._mixedCase.label;
};
Exhibit.SizeGradientCoder.prototype.getMixedSize = function() {
    return this._mixedCase.size;
};
