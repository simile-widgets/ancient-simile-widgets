/*==================================================
 *  Classic Theme
 *==================================================
 */


Timegrid.ClassicTheme = new Object();

Timegrid.ClassicTheme.implementations = [];

Timegrid.ClassicTheme.create = function(locale) {
    if (locale == null) {
        locale = Timegrid.Platform.getDefaultLocale();
    }
    
    var f = Timegrid.ClassicTheme.implementations[locale];
    if (f == null) {
        f = Timegrid.ClassicTheme._Impl;
    }
    return new f();
};

Timegrid.ClassicTheme._Impl = function() {
    this.firstDayOfWeek = 0; // Sunday
    
    this.ether = {
        backgroundColors: [
            "#EEE",
            "#DDD",
            "#CCC",
            "#AAA"
        ],
        highlightColor:     "white",
        highlightOpacity:   50,
        interval: {
            line: {
                show:       true,
                color:      "#aaa",
                opacity:    25
            },
            weekend: {
                color:      "#FFFFE0",
                opacity:    30
            },
            marker: {
                hAlign:     "Bottom",
                hBottomStyler: function(elmt) {
                    elmt.className = "timeline-ether-marker-bottom";
                },
                hBottomEmphasizedStyler: function(elmt) {
                    elmt.className = "timeline-ether-marker-bottom-emphasized";
                },
                hTopStyler: function(elmt) {
                    elmt.className = "timeline-ether-marker-top";
                },
                hTopEmphasizedStyler: function(elmt) {
                    elmt.className = "timeline-ether-marker-top-emphasized";
                },
                    
                vAlign:     "Right",
                vRightStyler: function(elmt) {
                    elmt.className = "timeline-ether-marker-right";
                },
                vRightEmphasizedStyler: function(elmt) {
                    elmt.className = "timeline-ether-marker-right-emphasized";
                },
                vLeftStyler: function(elmt) {
                    elmt.className = "timeline-ether-marker-left";
                },
                vLeftEmphasizedStyler:function(elmt) {
                    elmt.className = "timeline-ether-marker-left-emphasized";
                }
            }
        }
    };
    
    this.event = {
        track: {
            offset:         0.5, // em
            height:         1.5, // em
            gap:            0.5  // em
        },
        instant: {
            icon:           Timegrid.urlPrefix + "images/dull-blue-circle.png",
            lineColor:      "#58A0DC",
            impreciseColor: "#58A0DC",
            impreciseOpacity: 20,
            showLineForNoText: true
        },
        duration: {
            color:          "#58A0DC",
            opacity:        100,
            impreciseColor: "#58A0DC",
            impreciseOpacity: 20
        },
        label: {
            insideColor:    "white",
            outsideColor:   "black",
            width:          200 // px
        },
        highlightColors: [
            "#FFFF00",
            "#FFC000",
            "#FF0000",
            "#0000FF"
        ],
        bubble: {
            width:          250, // px
            height:         125, // px
            titleStyler: function(elmt) {
                elmt.className = "timeline-event-bubble-title";
            },
            bodyStyler: function(elmt) {
                elmt.className = "timeline-event-bubble-body";
            },
            imageStyler: function(elmt) {
                elmt.className = "timeline-event-bubble-image";
            },
            wikiStyler: function(elmt) {
                elmt.className = "timeline-event-bubble-wiki";
            },
            timeStyler: function(elmt) {
                elmt.className = "timeline-event-bubble-time";
            }
        }
    };
};