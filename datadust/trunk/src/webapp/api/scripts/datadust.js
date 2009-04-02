/*======================================================================
 *  Datadust
 *======================================================================
 */

Datadust.swf = Datadust.urlPrefix + "swf/datadust";

Datadust.flashVersion = {
    major: 10,
    minor: 0,
    revision: 12
};

Datadust.hasRightFlashVersion = function() {
    return Datadust.Flash.hasVersionOrLater(Datadust.flashVersion.major, Datadust.flashVersion.minor, Datadust.flashVersion.revision);
};

Datadust.create = function(elmt, options) {
    return new Datadust._Impl(elmt, options);
};

Datadust.createOrShowInstaller = function(elmt, options) {
    if (Datadust.hasRightFlashVersion()) {
        return Datadust.create(elmt, options);
    } else {
        elmt.innerHTML = 
            '<div class="datadust-noflash-message">' +
                'Flash Player version ' + 
                    [Datadust.flashVersion.major, Datadust.flashVersion.minor, Datadust.flashVersion.revision].join(".") +
                    '<br/>' +
                'or later is needed to view this content.<br/>' +
                '<a href="http://get.adobe.com/flashplayer/">Download the latest Flash Player</a>.' +
            '</div>';
    }
    return null;
};

Datadust._Impl = function(elmt, options) {
    this._elmt = elmt;
    this._options = options || {};
    this._installUI();
};

Datadust._Impl.prototype._installUI = function() {
    this._flashObjectID = "datadust" + new Date().getTime() + Math.floor(Math.random() * 1000000);
    
    var self = this;
    var latentConfig = {};

    var onReady = function() {
        Datadust.Dispatcher.release(arguments.callee);
        self._flashObject.init(latentConfig);
        self._onReady();
    };
    
    var flashVars = [
        "onReady=" + Datadust.Dispatcher.wrap(onReady)
    ];
    var eventHandlerNames = {
        //"onSelect" : true
    };
    var latentInitOptionNames = {
        "source" : true,
        "sources" : true,
        "configs" : true,
        "initialConfig" : true,
        "prepare" : true
    };
    
    for (var n in eventHandlerNames) {
        if (this._options.hasOwnProperty(n)) {
            flashVars.push(n + "=" + Datadust.Dispatcher.wrap(this._options[n]));
        }
    }
    for (var n in this._options) {
        if (this._options.hasOwnProperty(n)) {
            if (n != "onReady" && !(n in eventHandlerNames)) {
                var v = this._options[n];
                if (n in latentInitOptionNames) {
                    latentConfig[n] = v;
                } else {
                    flashVars.push(n + "=" + v);
                }
            }
        }
    }
    
    this._elmt.innerHTML = Datadust.Flash.generateObjectEmbedHTML(
        "src",                  Datadust.swf,
        "width",                "100%",
        "height",               "100%",
        "align",                "middle",
        "id",                   this._flashObjectID,
        "quality",              "high",
        "bgcolor",              "#ffffff",
        "name",                 "Datadust",
        "allowScriptAccess",    "always",
        "type",                 "application/x-shockwave-flash",
        "pluginspage",          "http://www.adobe.com/go/getflashplayer",
        "FlashVars",            flashVars.join("&")
    );
    
    this._flashObject = document[this._flashObjectID] || window[this._flashObjectID];
};

Datadust._Impl.prototype.getID = function() {
    return this._flashObjectID;
};

Datadust._Impl.prototype.selectConfiguration = function(index) {
    return this._flashObject.selectConfiguration(index);
};

Datadust._Impl.prototype.getProperty = function(name) {
    return this._flashObject.getProperty(name);
};

Datadust._Impl.prototype.setProperty = function(name, value) {
    this._flashObject.setProperty(name, value);
};

Datadust._Impl.prototype._onReady = function() {
    if ("onReady" in this._options) {
        this._options["onReady"]();
    }
};
