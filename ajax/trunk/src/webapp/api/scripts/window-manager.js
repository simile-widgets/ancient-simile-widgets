/*======================================================================
 *  WindowManager
 *
 *  This is a singleton that keeps track of UI layers (modal and 
 *  modeless) and enables/disables UI elements based on which layers
 *  they belong to. It also provides window-wide dragging 
 *  implementation.
 */
 
SimileAjax.WindowManager = {
    _initialized:       false,
    _listeners:         [],
    _draggedElement:    null,
    _lastCoords:        null,
    _layers:            []
};

SimileAjax.WindowManager.initialize = function() {
    if (SimileAjax.WindowManager._initialized) {
        return;
    }
    
    SimileAjax.DOM.registerEvent(document.body, "click",     SimileAjax.WindowManager._onBodyClick);
    SimileAjax.DOM.registerEvent(document.body, "mousemove", SimileAjax.WindowManager._onBodyMouseMove);
    SimileAjax.DOM.registerEvent(document.body, "mouseup",   SimileAjax.WindowManager._onBodyMouseUp);
    
    SimileAjax.WindowManager._layers.push({index: 0});
    
    SimileAjax.WindowManager._historyListener = {
        onBeforeUndoSeveral:    function() {},
        onAfterUndoSeveral:     function() {},
        onBeforeUndo:           function() {},
        onAfterUndo:            function() {},
        
        onBeforeRedoSeveral:    function() {},
        onAfterRedoSeveral:     function() {},
        onBeforeRedo:           function() {},
        onAfterRedo:            function() {}
    };
    SimileAjax.History.addListener(SimileAjax.WindowManager._historyListener);
    
    SimileAjax.WindowManager._initialized = true;
};

SimileAjax.WindowManager.getBaseLayer = function() {
    SimileAjax.WindowManager.initialize();
    return SimileAjax.WindowManager._layers[0];
};

SimileAjax.WindowManager.getHighestLayer = function() {
    SimileAjax.WindowManager.initialize();
    return SimileAjax.WindowManager._layers[SimileAjax.WindowManager._layers.length - 1];
};

SimileAjax.WindowManager.registerEventWithObject = function(elmt, eventName, obj, handlerName, layer) {
    SimileAjax.WindowManager.registerEvent(
        elmt, 
        eventName, 
        function(elmt2, evt, target) {
            return obj[handlerName].call(obj, elmt2, evt, target);
        },
        layer
    );
};

SimileAjax.WindowManager.registerEvent = function(elmt, eventName, handler, layer) {
    if (layer == null) {
        layer = SimileAjax.WindowManager.getBaseLayer();
    }
    
    var handler2 = function(elmt, evt, target) {
        if (SimileAjax.WindowManager._canProcessEventAtLayer(layer)) {
            SimileAjax.WindowManager._popToLayer(layer.index);
            return handler(elmt, evt, target);
        } else {
            SimileAjax.DOM.cancelEvent(evt);
            return false;
        }
    }
    
    SimileAjax.DOM.registerEvent(elmt, eventName, handler2);
};

SimileAjax.WindowManager.pushLayer = function(f, ephemeral) {
    var layer = { onPop: f, index: SimileAjax.WindowManager._layers.length, ephemeral: (ephemeral) };
    SimileAjax.WindowManager._layers.push(layer);
    
    return layer;
};

SimileAjax.WindowManager.popLayer = function(layer) {
    for (var i = 1; i < SimileAjax.WindowManager._layers.length; i++) {
        if (SimileAjax.WindowManager._layers[i] == layer) {
            SimileAjax.WindowManager._popToLayer(i - 1);
            break;
        }
    }
};

SimileAjax.WindowManager.popAllLayers = function() {
    SimileAjax.WindowManager._popToLayer(0);
};

SimileAjax.WindowManager.registerForDragging = function(elmt, callback, layer) {
    SimileAjax.WindowManager.registerEvent(
        elmt, 
        "mousedown", 
        function(elmt, evt, target) {
            SimileAjax.WindowManager._handleMouseDown(elmt, evt, callback);
        }, 
        layer
    );
};

SimileAjax.WindowManager._popToLayer = function(level) {
    while (level+1 < SimileAjax.WindowManager._layers.length) {
        try {
            var layer = SimileAjax.WindowManager._layers.pop();
            if (layer.onPop != null) {
                layer.onPop();
            }
        } catch (e) {
        }
    }
};

SimileAjax.WindowManager._canProcessEventAtLayer = function(layer) {
    if (layer.index == (SimileAjax.WindowManager._layers.length - 1)) {
        return true;
    }
    for (var i = layer.index + 1; i < SimileAjax.WindowManager._layers.length; i++) {
        if (!SimileAjax.WindowManager._layers[i].ephemeral) {
            return false;
        }
    }
    return true;
};

SimileAjax.WindowManager._cancelPopups = function() {
    var i = SimileAjax.WindowManager._layers.length - 1;
    while (i > 0 && SimileAjax.WindowManager._layers[i].ephemeral) {
        i--;
    }
    SimileAjax.WindowManager._popToLayer(i);
};

SimileAjax.WindowManager._onBodyClick = function(elmt, evt, target) {
    if (!("eventPhase" in evt) || evt.eventPhase == evt.BUBBLING_PHASE) {
        SimileAjax.WindowManager._cancelPopups();
    }
};

SimileAjax.WindowManager._handleMouseDown = function(elmt, evt, callback) {
    try {
        SimileAjax.WindowManager._draggedElement = elmt;
        SimileAjax.WindowManager._draggedElementCallback = callback;
        SimileAjax.WindowManager._lastCoords = { x: evt.clientX, y: evt.clientY };
        
        SimileAjax.WindowManager._draggedElementCallback.onDragStart();
    } catch (e) {
        SimileAjax.Debug.exception(e);
        SimileAjax.WindowManager._cancelDragging();
    }
};

SimileAjax.WindowManager._onBodyMouseMove = function(elmt, evt, target) {
    if (SimileAjax.WindowManager._draggedElement != null) {
        try {
            var lastCoords = SimileAjax.WindowManager._lastCoords;
            var diffX = evt.clientX - lastCoords.x;
            var diffY = evt.clientY - lastCoords.y;
            
            SimileAjax.WindowManager._lastCoords = { x: evt.clientX, y: evt.clientY };
            
            SimileAjax.WindowManager._draggedElementCallback.onDragBy(diffX, diffY);
        } catch (e) {
            SimileAjax.Debug.exception(e);
            SimileAjax.WindowManager._cancelDragging();
        }
    }
};

SimileAjax.WindowManager._onBodyMouseUp = function(elmt, evt, target) {
    if (SimileAjax.WindowManager._draggedElement != null) {
        try {
            SimileAjax.WindowManager._draggedElementCallback.onDragEnd();
        } finally {
            SimileAjax.WindowManager._cancelDragging();
        }
    }
};

SimileAjax.WindowManager._cancelDragging = function() {
    SimileAjax.WindowManager._draggedElement = null;
    SimileAjax.WindowManager._draggedElementCallback = null;
    SimileAjax.WindowManager._lastCoords = null;
};
