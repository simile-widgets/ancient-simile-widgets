Timegrid.ListenerAware = function() {
    this._listeners = [];
};

Timegrid.ListenerAware.prototype.addListener = function(listener) {
    this._listeners.push(listener);
};

Timegrid.ListenerAware.prototype.removeListener = function(listener) {
    for (var i = 0; i < this._listeners.length; i++) {
        if (this._listeners[i] == listener) {
            this._listeners.splice(i, 1);
            break;
        }
    }
};

Timegrid.ListenerAware.prototype._fire = function(handlerName, args) {
    for (var i = 0; i < this._listeners.length; i++) {
        var listener = this._listeners[i];
        if (handlerName in listener) {
            try {
                listener[handlerName].apply(listener, args);
            } catch (e) {
                Timegrid.Debug.exception(e);
            }
        }
    }
};