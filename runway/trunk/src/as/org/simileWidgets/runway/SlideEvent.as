package org.simileWidgets.runway {
    import flash.events.Event;
    
    public class SlideEvent extends Event {
        public var index:int;
        public var slide:Slide;
        
        function SlideEvent(type:String, slide:Slide, index:int) {
            super(type);
            this.slide = slide;
            this.index = index;
        }
    }
}