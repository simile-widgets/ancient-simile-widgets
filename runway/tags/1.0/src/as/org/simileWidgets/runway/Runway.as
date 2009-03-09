package org.simileWidgets.runway {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.Point;
    import flash.ui.Keyboard;
    import flash.text.TextField;
    import flash.text.TextFormat;
    import flash.text.TextFormatAlign;
    import flare.animate.*;
    
    public class Runway extends RunwayBase {
        static internal const SIDE_LEFT:int = 0;
        static internal const SIDE_RIGHT:int = 1;
        static internal const SIDE_CENTER:int = 2;
        
        static internal const MAX_BATCH_MOVEMENT:int = 10;
        
        private var _leftConveyer:Sprite;
        private var _rightConveyer:Sprite;
        private var _centerStand:Sprite;
        private var _titleText:TextField;
        private var _subtitleText:TextField;
        
        private var _selectedIndex:Number = -1;
        private var _slides:Array = [];
        private var _slideFrames:Array = [];
        
        private var _transition:Parallel = null;
        private var _mouseDownTime:Number;
        private var _mouseDownLocation:Point;
        private var _lastMouseLocation:Point;
        
        public function Runway(boundingWidth:Number, boundingHeight:Number, theme:Theme, geometry:Geometry) {
            super(boundingWidth, boundingHeight, theme, geometry);
            
            _leftConveyer = new Sprite();
            _platform.addChild(_leftConveyer);
            
            _rightConveyer = new Sprite();
            _platform.addChild(_rightConveyer);
            
            _centerStand = new Sprite();
            _platform.addChild(_centerStand);
            
            _titleText = new TextField();
            addChild(_titleText);
            
            _subtitleText = new TextField();
            addChild(_subtitleText);
            
            _selectedIndex = -1;
            
            var stageDetector:StageDetector = new StageDetector(this);
            stageDetector.addEventListener(StageDetector.ADDED_TO_STAGE, _addedToStageListener);
            stageDetector.addEventListener(StageDetector.REMOVED_FROM_STAGE, _removedFromStageListener);
        }
        
        public function clearRecords():void {
            if (_slides.length > 0) {
                if (_transition != null && _transition.running) {
                    _transition.stop();
                    _transition = null;
                }
                
                for (var i:int = 0; i < _slides.length; i++) {
                    _disposeSlide(i);
                }
                
                _slides = [];
                _slideFrames = [];
                _selectedIndex = -1;
                
                _platform.x = 0;
                _setTitleText("", "");
            }
        }
        
        public function addRecords(records:Object):void {
            var startIndex:int = _slides.length;
            for (var i:int = 0; i < records.length; i++) {
                var record:Object = records[i];
                if (!("id" in record)) {
                    record["id"] = "r" + Math.round(1000000 * Math.random());
                }
                
                var slide:Slide = new Slide(record);
                var slideFrame:SlideFrame = new SlideFrame(this, slide, startIndex + i);
                
                _slides.push(slide);
                _slideFrames.push(slideFrame);
                _rightConveyer.addChildAt(slideFrame, 0);
                
                slideFrame.setStandingPosition(SIDE_RIGHT);
                slideFrame.prepare();
            }
            
            if (startIndex == 0) {
                select(0);
            }
        }
        
        public function setRecords(records:Object):void {
            if (_slides.length == 0) {
                addRecords(records);
            } else {
                // Don't know what to do yet
            }
        }
        
        public function get selectedID():String {
            return _selectedIndex < 0 ? null : _slides[_selectedIndex].id;
        }
        
        public function get selectedIndex():int {
            return _selectedIndex;
        }
        
        public function set selectedIndex(index:int):void {
            select(index);
        }
        
        public function get slideCount():int {
            return _slides.length;
        }
        
        public function select(index:int):void {
            if (index == _selectedIndex || index < 0 || _slides.length == 0 || index >= _slides.length) {
                return;
            }
            
            if (_transition != null && _transition.running) {
                _transition.stop();
                _transition = null;
            }
            
            var i:int;
            var batch:int = Math.abs(_selectedIndex - index);
            var duration:Number = 0.3 + Math.min(batch, 5) * 0.15;
            
            var allAnimations:Parallel = new Parallel();
            allAnimations.easing = Easing.easeOutSine;
            
            var slideFrame:SlideFrame = _slideFrames[index];
            _centerStand.addChild(slideFrame);
            slideFrame.readyToMoveCenter(allAnimations, duration);
            
            if (_selectedIndex >= 0 && index < _selectedIndex) {
                // The new focus is on the left of the old focus, so things get moved to the right.
                
                i = Math.max(0, _selectedIndex);
                
                if (batch > MAX_BATCH_MOVEMENT) {
                    // Minimize the amount of animations when there is a large batch.
                    for (; i > index + MAX_BATCH_MOVEMENT; i--) {
                        slideFrame = _slideFrames[i];
                        _rightConveyer.addChild(slideFrame);
                        slideFrame.setStandingPosition(SIDE_RIGHT);
                    }
                }
                
                for (; i > index; i--) {
                    slideFrame = _slideFrames[i];
                    _rightConveyer.addChild(slideFrame);
                    slideFrame.readyToMoveSideway(allAnimations, SIDE_RIGHT, batch, i - index, duration);
                }
                
                /*
                 *  Make sure all other slides not involved in animation are
                 *  back in their proper place. They might have been involved
                 *  in the previous animation and were still in midway.
                 */
                i--; // skip the new center index
                for (;i > 0; i--) {
                    _slideFrames[i].setStandingPosition(SIDE_LEFT);
                }
                for (i = _selectedIndex + 1; i < _slideFrames.length; i++) {
                    _slideFrames[i].setStandingPosition(SIDE_RIGHT);
                }
            } else {
                // The new focus is on the right of the old focus, so things get moved to the left.
                
                i = Math.max(0, _selectedIndex);
                
                if (batch > MAX_BATCH_MOVEMENT) {
                    // Minimize the amount of animations when there is a large batch.
                    for (; i < index - MAX_BATCH_MOVEMENT; i++) {
                        slideFrame = _slideFrames[i];
                        _leftConveyer.addChild(slideFrame);
                        slideFrame.setStandingPosition(SIDE_LEFT);
                    }
                }
                
                for (; i < index; i++) {
                    slideFrame = _slideFrames[i];
                    _leftConveyer.addChild(slideFrame);
                    slideFrame.readyToMoveSideway(allAnimations, SIDE_LEFT, batch, index - i, duration);
                }
                
                /*
                 *  Make sure all other slides not involved in animation are
                 *  back in their proper place. They might have been involved
                 *  in the previous animation and were still in midway.
                 */
                i++; // skip the new center index
                for (;i < _slideFrames.length; i++) {
                    _slideFrames[i].setStandingPosition(SIDE_RIGHT);
                }
                for (i = _selectedIndex - 1; i >= 0; i--) {
                    _slideFrames[i].setStandingPosition(SIDE_LEFT);
                }
            }
            
            if (batch > MAX_BATCH_MOVEMENT) {
                /*
                 *  For large batch, don't start animating from the current selected index
                 *  as that will yield a lot of movement.
                 */
                _platform.x = -_geometry.spreadPixels * 
                    (index > _selectedIndex ? index - MAX_BATCH_MOVEMENT : index + MAX_BATCH_MOVEMENT);
            }
            allAnimations.add(
                new Tween(
                    _platform, 
                    duration, 
                    {
                        x: -_geometry.spreadPixels * index
                    }
                )
            );
            
            _selectedIndex = index;
            _setTitleText(_slides[_selectedIndex].title, _slides[_selectedIndex].subtitle);
            
            _transition = allAnimations;
            _transition.play();
            
            dispatchEvent(new Event("select"));
        }
        
        internal function onSlideFrameClick(slideFrame:SlideFrame, side:int):void {
            var i:int;
            if (side == SIDE_LEFT) {
                for (i = _selectedIndex - 1; i >= 0; i--) {
                    if (_slideFrames[i] == slideFrame) {
                        select(i);
                        return;
                    }
                }
            } else if (side == SIDE_RIGHT) {
                for (i = _selectedIndex + 1; i < _slideFrames.length; i++) {
                    if (_slideFrames[i] == slideFrame) {
                        select(i);
                        return;
                    }
                }
            } else {
                dispatchEvent(new Event("zoom"));
            }
        }
        
        protected function _addedToStageListener(e:Event):void {
            addEventListener(Event.ENTER_FRAME, _enterFrameListener);
            
            addEventListener(MouseEvent.MOUSE_DOWN, _mouseDownListener);
            addEventListener(MouseEvent.MOUSE_UP, _mouseUpListener);
            addEventListener(MouseEvent.MOUSE_OUT, _mouseOutListener);
            addEventListener(MouseEvent.MOUSE_MOVE, _mouseMoveListener);
            addEventListener(MouseEvent.MOUSE_WHEEL, _mouseWheelListener);

            stage.addEventListener(KeyboardEvent.KEY_UP, _keyUpListener);

        }
        
        protected function _removedFromStageListener(e:Event):void {
            removeEventListener(Event.ENTER_FRAME, _enterFrameListener);
            
            removeEventListener(MouseEvent.MOUSE_DOWN, _mouseDownListener);
            removeEventListener(MouseEvent.MOUSE_UP, _mouseUpListener);
            removeEventListener(MouseEvent.MOUSE_OUT, _mouseOutListener);
            removeEventListener(MouseEvent.MOUSE_MOVE, _mouseMoveListener);
            removeEventListener(MouseEvent.MOUSE_WHEEL, _mouseWheelListener);
            
            stage.removeEventListener(KeyboardEvent.KEY_UP, _keyUpListener);
        }
        
        protected function _enterFrameListener(e:Event):void {
            var rerender:Boolean = false;
            if (_ensureCleanBackground()) {
                rerender = true;
            }
            if (_ensureCleanSettings()) {
                rerender = true;
                _forceLayout();
            }
            
            if (rerender) {
                _setTitleText(
                    _selectedIndex < 0 ? "" : _slides[_selectedIndex].title, 
                    _selectedIndex < 0 ? "" : _slides[_selectedIndex].subtitle
                );
                
                for each (var slideFrame:SlideFrame in _slideFrames) {
                    slideFrame.rerender();
                }
            }
        }
        
        protected function _keyUpListener(e:KeyboardEvent):void {
            switch (e.keyCode) {
            case Keyboard.LEFT:
            case Keyboard.UP:
                if (_selectedIndex > 0) {
                    select(_selectedIndex - 1);
                }
                break;
            case Keyboard.PAGE_UP:
                select(Math.max(0, _selectedIndex - 5));
                break;
            case Keyboard.RIGHT:
            case Keyboard.DOWN:
                if (_selectedIndex < _slideFrames.length - 1) {
                    select(_selectedIndex + 1);
                }
                break;
            case Keyboard.PAGE_DOWN:
                select(Math.min(_slideFrames.length - 1, _selectedIndex + 5));
                break;
            case Keyboard.HOME:
                select(0);
                break;
            case Keyboard.END:
                select(_slideFrames.length - 1);
                break;
            case Keyboard.SPACE:
            case Keyboard.ENTER:
                dispatchEvent(new Event("zoom"));
                break;
            }
        }
        
        protected function _mouseDownListener(e:MouseEvent):void {
            _mouseDownTime = new Date().time;
            _mouseDownLocation = new Point(e.stageX, e.stageY);
        }
        
        protected function _mouseUpListener(e:MouseEvent):void {
            if (_mouseDownLocation != null) {
                _interpretMouseGesture(_mouseDownLocation, new Point(e.stageX, e.stageY), new Date().time - _mouseDownTime);
            }
            _mouseDownLocation = null;
            _lastMouseLocation = null;
        }
        
        protected function _mouseOutListener(e:MouseEvent):void {
            if (_mouseDownLocation != null && _lastMouseLocation != null) {
                _interpretMouseGesture(_mouseDownLocation, _lastMouseLocation, new Date().time - _mouseDownTime);
            }
            _mouseDownLocation = null;
            _lastMouseLocation = null;
        }
        
        protected function _mouseMoveListener(e:MouseEvent):void {
            if (_mouseDownLocation != null) {
                _lastMouseLocation = new Point(e.stageX, e.stageY);
            }
        }
        
        protected function _mouseWheelListener(e:MouseEvent):void {
        }
        
        protected function _forceLayout():void {
            if (_transition != null && _transition.running) {
                _transition.stop();
                _transition = null;
            }

            for (var i:int = 0; i < _slideFrames.length; i++) {
                _slideFrames[i].setStandingPosition(i == _selectedIndex ? SIDE_CENTER : (i < _selectedIndex ? SIDE_LEFT : SIDE_RIGHT));
            }
            
            _platform.x = -_geometry.spreadPixels * _selectedIndex;
        }
        
        protected function _setTitleText(title:String, subtitle:String):void {
            if (_theme.showTitle) {
                _titleText.visible = true;
                
                _titleText.x = 0;
                _titleText.y = _platform.y + Math.round(Math.min(boundingHeight * 0.9, _geometry.slideSizePixels * 1.2));
                _titleText.width = boundingWidth;
                _titleText.selectable = false;
                
                var format:TextFormat = new TextFormat();
                format.font = _theme.titleFontFamily;
                format.size = _theme.titleFontSize;
                format.bold = _theme.titleFontBold;
                format.align = TextFormatAlign.CENTER;
                
                _titleText.text = title;
                _titleText.setTextFormat(format);
                _titleText.textColor = _theme.titleColor;
                
                if (_theme.showSubtitle) {
                    _subtitleText.visible = true;
                    
                    _subtitleText.x = 0;
                    _subtitleText.y = _titleText.y + Math.round(_titleText.textHeight * 1.2);
                    _subtitleText.width = boundingWidth;
                    _subtitleText.selectable = false;
                    
                    format.font = _theme.subtitleFontFamily;
                    format.size = _theme.subtitleFontSize;
                    format.bold = _theme.subtitleFontBold;
                    format.align = TextFormatAlign.CENTER;
                    
                    _subtitleText.text = subtitle;
                    _subtitleText.setTextFormat(format);
                    _subtitleText.textColor = _theme.subtitleColor;
                } else {
                    _subtitleText.visible = false;
                }
            } else {
                _titleText.visible = false;
                _subtitleText.visible = false;
            }
        }
        
        protected function _interpretMouseGesture(start:Point, end:Point, duration:Number):void {
            duration = Math.max(1, duration);
            
            var distance:Number = Point.distance(start, end);
            var velocity:Number = distance / duration;
            if (duration > 10 && velocity > 0.2) {
                var diff:int = (end.x > start.x ? -1 : 1) * Math.round(velocity * 5);
                select(Math.max(0, Math.min(_slides.length - 1, _selectedIndex + diff)));
            }
        }
        
        protected function _disposeSlide(i:int):void {
            var slide:Slide = _slides[i];
            var slideFrame:SlideFrame = _slideFrames[i];
            
            slideFrame.parent.removeChild(slideFrame);
            
            slideFrame.dispose();
            slide.dispose();
            
            _slideFrames[i] = null;
            _slides[i] = null;
        }
    }
}
