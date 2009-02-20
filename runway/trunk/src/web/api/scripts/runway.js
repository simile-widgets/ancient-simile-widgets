/*======================================================================
 *  Runway
 *======================================================================
 */
 
Runway.flashVersion = {
    major: 10,
    minor: 0,
    revision: 12
};

Runway.themes = {
    "pristine" : {
        topColor: "white",
        bottomColor: "white"
    },
    "arctic" : {
        topColor: "#e8e8e8",
        bottomColor: "#e8e8ff"
    },
    "midnight" : {
        topColor: "black",
        bottomColor: "black"
    },
    "sunset" : {
        topColor: "#110022",
        bottomColor: "#220000"
    },
    "pitchblack" : {
        topColor: "black",
        bottomColor: "black"
    }
};

Runway.hasRightFlashVersion = function() {
    return Runway.Flash.hasVersionOrLater(Runway.flashVersion.major, Runway.flashVersion.minor, Runway.flashVersion.revision);
};

Runway.create = function(elmt, options) {
    return new Runway._Impl(elmt, options);
};

Runway.createOrShowInstaller = function(elmt, options) {
    if (Runway.hasRightFlashVersion()) {
        return Runway.create(elmt, options);
    } else if (Runway.Flash.canStartProductInstall()) {
        elmt.innerHTML = Runway.Flash.generateProductInstallHTML();
    } else {
        elmt.innerHTML = "Sorry, your Flash player is just too old!";
    }
    return null;
};

Runway._Impl = function(elmt, options) {
    this._elmt = elmt;
    this._options = options || {};
    this._installUI();
};

Runway._Impl.prototype._installUI = function() {
    this._flashObjectID = "runway" + new Date().getTime() + Math.floor(Math.random() * 1000000);
    
    var self = this;
    var onReady = function() {
        Runway.Dispatcher.release(arguments.callee);
        self._onReady();
    };
    
    this._elmt.innerHTML = Runway.Flash.generateObjectEmbedHTML(
        "src",                  Runway.urlPrefix + "swf/runway",
        "width",                "100%",
        "height",               "100%",
        "align",                "middle",
        "id",                   this._flashObjectID,
        "quality",              "high",
        "bgcolor",              "#ffffff",
        "name",                 "Runway",
        "allowScriptAccess",    "always",
        "type",                 "application/x-shockwave-flash",
        "pluginspage",          "http://www.adobe.com/go/getflashplayer",
        "FlashVars",            "onReady=" + Runway.Dispatcher.wrap(onReady)
    );
    
    this._flashObject = document[this._flashObjectID] || window[this._flashObjectID];
};

Runway._Impl.prototype.getID = function() {
    return this._flashObjectID;
};

Runway._Impl.prototype.setRecords = function(records) {
    this._flashObject.setRecords(records);
};

Runway._Impl.prototype.setThemeName = function(themeName) {
    this._flashObject.setThemeName(themeName);
};

Runway._Impl.prototype._onReady = function() {
    if ("onReady" in this._options) {
        this._options["onReady"]();
    }
};
