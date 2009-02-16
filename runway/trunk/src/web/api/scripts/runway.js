/*======================================================================
 *  Runway
 *======================================================================
 */
 
Runway.flashVersion = {
    major: 10,
    minor: 0,
    revision: 12
};

Runway.hasRightFlashVersion = function() {
    return Runway.Flash.hasVersionOrLater(Runway.flashVersion.major, Runway.flashVersion.minor, Runway.flashVersion.revision);
};

Runway.create = function(elmt) {
    return new Runway._Impl(elmt);
};

Runway.createOrShowInstaller = function(elmt) {
    if (Runway.hasRightFlashVersion()) {
        return Runway.create(elmt);
    } else if (Runway.Flash.canStartProductInstall()) {
        elmt.innerHTML = Runway.Flash.generateProductInstallHTML();
    } else {
        elmt.innerHTML = "Sorry, your Flash player is just too old!";
    }
    return null;
};

Runway._Impl = function(elmt) {
    this._elmt = elmt;
    this._installUI();
};

Runway._Impl.prototype._installUI = function() {
    this._flashObjectID = "runway" + new Date().getTime() + Math.floor(Math.random() * 1000000);
    
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
        "pluginspage",          "http://www.adobe.com/go/getflashplayer"
    );
    
    this._flashObject = document[this._flashObjectID];
};

Runway._Impl.prototype.getID = function() {
    return this._flashObjectID;
};

Runway._Impl.prototype.setRecords = function(records) {
    this._flashObject.setRecords(records);
};
