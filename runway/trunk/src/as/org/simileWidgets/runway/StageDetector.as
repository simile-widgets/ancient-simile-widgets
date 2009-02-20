/*
 *  Copied from http://www.moock.org/eas3/examples/moock_eas3_examples/eas3_stage_detector/src/StageDetector.as
 */
 
package org.simileWidgets.runway {
  import flash.display.*;
  import flash.events.*;
  
  // Monitors a specified display object to see when it is added to or 
  // removed from the Stage, and broadcasts the correspoding custom events 
  // StageDetector.ADDED_TO_STAGE and StageDetector.REMOVED_FROM_STAGE.
  
  // USAGE:
  // var stageDetector:StageDetector = new StageDetector(someDisplayObject);
  // stageDetector.addEventListener(StageDetector.ADDED_TO_STAGE, 
  //                                addedToStageListenerFunction);
  // stageDetector.addEventListener(StageDetector.REMOVED_FROM_STAGE,
  //                                removedFromStageListenerFunction);
  public class StageDetector extends EventDispatcher {
    // Event constants
    public static const ADDED_TO_STAGE:String = "ADDED_TO_STAGE";
    public static const REMOVED_FROM_STAGE:String = "REMOVED_FROM_STAGE";
    
    // The object for which ADDED_TO_STAGE and REMOVED_FROM_STAGE events
    // will be generated
    private var watchedObject:DisplayObject = null;
    
    // The root of the display hierarchy that contains watchedObject
    private var watchedRoot:DisplayObject = null;
    
    // Flag indicating whether watchedObject is currently on the
    // display list
    private var onStage:Boolean = false;

    // Constructor
    public function StageDetector (objectToWatch:DisplayObject) {
      // Begin monitoring the specified object
      setWatchedObject(objectToWatch);
    }

    // Begins monitoring the specified object to see when it is added to or 
    // removed from the display list
    public function setWatchedObject (objectToWatch:DisplayObject):void {
      // Store the object being monitored
      watchedObject = objectToWatch;
      
      // Note whether watchedObject is currently on the display list
      if (watchedObject.stage != null) {
        onStage = true;
      }

      // Find the root of the display hierarchy containing the 
      // watchedObject, and register with it for ADDED/REMOVED events.
      // By observing where watchedObject's root is added and removed, 
      // we'll determine whether watchedObject is on or off the 
      // display list.
      setWatchedRoot(findWatchedObjectRoot());
    }
    
    // Returns a reference to the object being monitored
    public function getWatchedObject ():DisplayObject {
      return watchedObject;
    }    

    // Frees this StageDetector object's resources. Call this method before 
    // discarding a StageDetector object.
    public function dispose ():void {
      clearWatchedRoot();
      watchedObject = null;
    }

    // Handles Event.ADDED events targeted at the root of
    // watchedObject's display hierarchy 
    private function addedListener (e:Event):void {
      // If the current watchedRoot was added...
      if (e.eventPhase == EventPhase.AT_TARGET) {
        // ...check if watchedObject is now on the display list
        if (watchedObject.stage != null) {
          // Note that watchedObject is now on the display list
          onStage = true;
          // Notify listeners that watchedObject is now 
          // on the display list
          dispatchEvent(new Event(StageDetector.ADDED_TO_STAGE));
        }
        // watchedRoot was added to another container, so there's
        // now a new root of the display hierarchy containing
        // watchedObject. Find that new root, and register with it
        // for ADDED and REMOVED events.
        setWatchedRoot(findWatchedObjectRoot());
      }
    }

    // Handles Event.REMOVED events for the root of 
    // watchedObject's display hierarchy
    private function removedListener (e:Event):void {
      // If watchedObject is on the display list...
      if (onStage) {
        // ...check if watchedObject or one of its ancestors was removed
        var wasRemoved:Boolean = false;
        var ancestor:DisplayObject = watchedObject;
        var target:DisplayObject = DisplayObject(e.target);
        while (ancestor != null) {
          if (target == ancestor) {
            wasRemoved = true;
            break;
          }
          ancestor = ancestor.parent;
        }      
        
        // If watchedObject or one of its ancestors was removed...
        if (wasRemoved) {
          // ...register for ADDED and REMOVED events from the removed
          // object (which is the new root of watchedObject's display 
          // hierarchy).
          setWatchedRoot(target);
         
          // Note that watchedObject is not on the display list anymore
          onStage = false;
         
          // Notify listeners that watchedObject was removed from the Stage
          dispatchEvent(new Event(StageDetector.REMOVED_FROM_STAGE));
        }
      }
    }
    
    // Returns the root of the display hierarchy that currently contains
    // watchedObject
    private function findWatchedObjectRoot ():DisplayObject {
      var watchedObjectRoot:DisplayObject = watchedObject;
      while (watchedObjectRoot.parent != null) {
        watchedObjectRoot = watchedObjectRoot.parent;
      }
      return watchedObjectRoot;
    }

    // Begins listening for ADDED and REMOVED events targeted at the root of
    // watchedObject's display hierarchy
    private function setWatchedRoot (newWatchedRoot:DisplayObject):void {
      clearWatchedRoot();
      watchedRoot = newWatchedRoot;
      registerListeners(watchedRoot);
    }
    
    // Removes event listeners from watchedRoot, and removes
    // this StageDetector object's reference to watchedRoot
    private function clearWatchedRoot ():void {
      if (watchedRoot != null) {
        unregisterListeners(watchedRoot);
        watchedRoot = null;
      }
    }    

    // Registers ADDED and REMOVED event listeners with watchedRoot
    private function registerListeners (target:DisplayObject):void {
      target.addEventListener(Event.ADDED, addedListener);
      target.addEventListener(Event.REMOVED, removedListener);
    }

    // Unregisters ADDED and REMOVED event listeners from watchedRoot
    private function unregisterListeners (target:DisplayObject):void {
      target.removeEventListener(Event.ADDED, addedListener);
      target.removeEventListener(Event.REMOVED, removedListener);
    }
  }
}