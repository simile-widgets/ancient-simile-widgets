/*==================================================
 *  Graphics Utility Functions and Constants
 *==================================================
 */

SimileAjax.Graphics = new Object();
SimileAjax.Graphics.pngIsTranslucent = (!SimileAjax.Platform.browser.isIE) || (SimileAjax.Platform.browser.majorVersion > 6);

SimileAjax.Graphics.createTranslucentImage = function(doc, url, verticalAlign) {
    var elmt;
    if (SimileAjax.Graphics.pngIsTranslucent) {
        elmt = doc.createElement("img");
        elmt.setAttribute("src", url);
    } else {
        elmt = doc.createElement("img");
        elmt.style.display = "inline";
        elmt.style.width = "1px";  // just so that IE will calculate the size property
        elmt.style.height = "1px";
        elmt.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + url +"', sizingMethod='image')";
    }
    elmt.style.verticalAlign = (verticalAlign != null) ? verticalAlign : "middle";
    return elmt;
};

SimileAjax.Graphics.setOpacity = function(elmt, opacity) {
    if (SimileAjax.Platform.browser.isIE) {
        elmt.style.filter = "progid:DXImageTransform.Microsoft.Alpha(Style=0,Opacity=" + opacity + ")";
    } else {
        var o = (opacity / 100).toString();
        elmt.style.opacity = o;
        elmt.style.MozOpacity = o;
    }
};

SimileAjax.Graphics.createAnimation = function(f, from, to, duration) {
    return new SimileAjax.Graphics._Animation(f, from, to, duration);
};

SimileAjax.Graphics._Animation = function(f, from, to, duration) {
    this.f = f;
    
    this.from = from;
    this.to = to;
    this.current = from;
    
    this.duration = duration;
    this.start = new Date().getTime();
    this.timePassed = 0;
};

SimileAjax.Graphics._Animation.prototype.run = function() {
    var a = this;
    window.setTimeout(function() { a.step(); }, 50);
};

SimileAjax.Graphics._Animation.prototype.step = function() {
    this.timePassed += 50;
    
    var timePassedFraction = this.timePassed / this.duration;
    var parameterFraction = -Math.cos(timePassedFraction * Math.PI) / 2 + 0.5;
    var current = parameterFraction * (this.to - this.from) + this.from;
    
    try {
        this.f(current, current - this.current);
    } catch (e) {
    }
    this.current = current;
    
    if (this.timePassed < this.duration) {
        this.run();
    } else {
        this.f(this.to, 0);
    }
};
