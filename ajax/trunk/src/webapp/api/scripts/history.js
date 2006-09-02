/*======================================================================
 *  History
 *
 *  This is a singleton that keeps track of undoable user actions and 
 *  performs undos and redos in response to the browser's Back and 
 *  Forward buttons.
 *
 *  Call addAction(action) to register an undoable user action. action
 *  must have 4 fields:
 *
 *      perform: an argument-less function that carries out the action
 *      undo:    an argument-less function that undos the action
 *      label:   a short, user-friendly string describing the action
 *      uiLayer: the UI layer on which the action takes place
 *
 *  By default, the history keeps track of upto 10 actions. You can 
 *  configure this behavior by setting 
 *      SimileAjax.History.maxHistoryLength
 *  to a different number.
 *
 *  An iframe is inserted into the document's body element to track 
 *  onload events.
 *======================================================================
 */
 
SimileAjax.History = {
    maxHistoryLength:       10,
    
    _initialized:           false,
    _listeners:             [],
    
    _actions:               [],
    _baseIndex:             0,
    _currentIndex:          0,
    
    _plainDocumentTitle:    document.title
};

SimileAjax.History.formatHistoryEntryTitle = function(actionLabel) {
    return SimileAjax.History._plainDocumentTitle + " - " + actionLabel;
};

SimileAjax.History.initialize = function() {
    if (SimileAjax.History._initialized) {
        return;
    }
    
    var iframe = document.createElement("iframe");
    iframe.id = "simile-ajax-history";
    iframe.style.position = "absolute";
    iframe.style.width = "10px";
    iframe.style.height = "10px";
    iframe.style.top = "0px";
    iframe.style.left = "0px";
    iframe.style.visibility = "hidden";
    iframe.src = SimileAjax.urlPrefix + "content/history.html?0";
    
    document.body.appendChild(iframe);
    SimileAjax.DOM.registerEvent(iframe, "load", SimileAjax.History._handleIFrameOnLoad);
    
    SimileAjax.History._iframe = iframe;
    SimileAjax.History._initialized = true;
};

SimileAjax.History.addListener = function(listener) {
    SimileAjax.History.initialize();
    
    SimileAjax.History._listeners.push(listener);
};

SimileAjax.History.removeListener = function(listener) {
    SimileAjax.History.initialize();
    
    var listeners = SimileAjax.History._listeners;
    for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] == listener) {
            listeners.splice(i, 1);
            break;
        }
    }
};

SimileAjax.History.addAction = function(action) {
    SimileAjax.History.initialize();
    
    try {
        action.perform();
        
        SimileAjax.History._actions = SimileAjax.History._actions.slice(
            0, SimileAjax.History._currentIndex - SimileAjax.History._baseIndex);
            
        SimileAjax.History._actions.push(action);
        SimileAjax.History._currentIndex++;
        
        var diff = SimileAjax.History._actions.length - SimileAjax.History.maxHistoryLength;
        if (diff > 0) {
            SimileAjax.History._actions = SimileAjax.History._actions.slice(diff);
            SimileAjax.History._baseIndex += diff;
        }
        
        SimileAjax.History._iframe.contentWindow.location.search = 
            "?" + SimileAjax.History._currentIndex;
    } catch (e) {
        SimileAjax.Debug.exception(e);
    }
};

SimileAjax.History._handleIFrameOnLoad = function() {
    /*
     *  This function is invoked when the user herself
     *  navigates backward or forward. We need to adjust
     *  the application's state accordingly.
     */
     
    var q = SimileAjax.History._iframe.contentWindow.location.search;
    var c = (q.length == 0) ? 0 : Math.max(0, parseInt(q.substr(1)));
    
    if (c < this._currentIndex) { // need to undo
        SimileAjax.History._fire("onBeforeUndoSeveral", []);
        
        while (SimileAjax.History._currentIndex > c && 
               SimileAjax.History._currentIndex > SimileAjax.History._baseIndex) {
               
            SimileAjax.History._currentIndex--;
            
            var action = SimileAjax.History._actions[SimileAjax.History._currentIndex - SimileAjax.History._baseIndex];
            
            SimileAjax.History._fire("onBeforeUndo", [ action ]);
            try {
                action.undo();
                SimileAjax.History._fire("onAfterUndo", [ action, true ]);
            } catch (e) {
                SimileAjax.History._fire("onAfterUndo", [ action, false ]);
            }
        }
        
        SimileAjax.History._fire("onAfterUndoSeveral", []);
        
    } else if (c > SimileAjax.History._currentIndex) { // need to redo
        SimileAjax.History._fire("onBeforeRedoSeveral", []);
        
        while (SimileAjax.History._currentIndex < c && 
               SimileAjax.History._currentIndex - SimileAjax.History._baseIndex < SimileAjax.History._actions.length) {
               
            var action = SimileAjax.History._actions[this._currentIndex - this._baseIndex];
            
            SimileAjax.History._fire("onBeforeRedo", [ action ]);
            try {
                action.perform();
                SimileAjax.History._fire("onAfterRedo", [ action, true ]);
            } catch (e) {
                SimileAjax.History._fire("onAfterRedo", [ action, false ]);
            }
            
            SimileAjax.History._currentIndex++;
        }
        
        SimileAjax.History._fire("onAfterRedoSeveral", []);
    } else {
        SimileAjax.History._iframe.contentDocument.title = 
            SimileAjax.History.formatHistoryEntryTitle(
                SimileAjax.History._actions[this._currentIndex - this._baseIndex].label);
            
        return;
    }
    
    var diff = c - SimileAjax.History._currentIndex;
    SimileAjax.History._currentIndex += diff;
    SimileAjax.History._baseIndex += diff;
        
    SimileAjax.History._iframe.contentWindow.location.search = "?" + c;
};

SimileAjax.History._fire = function(handlerName, args) {
    var listeners = [].concat(SimileAjax.History._listeners);
    for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        if (handlerName in listener) {
            try {
                listener[handlerName].apply(listener, args);
            } catch (e) {
                SimileAjax.Debug.exception(e);
            }
        }
    }
};
