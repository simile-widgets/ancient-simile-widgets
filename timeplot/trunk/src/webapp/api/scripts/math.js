Timeplot.Math = new function() {
};

Timeplot.Math.prototype = { 
	
	directDCT: function(x,y) {

	    var N = x.length;
	
	    with (Math) {
	        for (var k = 0; k < N; k++) {
	            var sum = 0.0;
	            for (var n = 0; n < N; n++) {
	                var arg = PI * k * (2.0 * n + 1) / (2 * N);
	                var cosine = cos(arg);
	                var product = x[n] * cosine;
	                sum += product;
	            } 
	    
	            var alpha;
	            if (k == 0) {
	                alpha = 1.0 / sqrt(2);
	            } else {
	                alpha = 1;
	            }
	            y[k] = sum * alpha * sqrt(2.0 / N);
	        }
	    }
	    
	    return y;
	},

    inverseDCT : function(y,x) {

	    var N = y.length;
	    
	    with (Math) {
	        for (var n = 0; n < N; n++) {
	            var sum = 0.0;
	            for (var k = 0; k < N; k++) {
	                var arg = PI * k * (2.0 * n + 1) / (2 * N);
	                var cosine = cos(arg);
	                var product = y[k] * cosine;
	        
	                var alpha;
	                if (k == 0) {
	                    alpha = 1.0 / sqrt(2);
	                } else {
	                    alpha = 1;
	                }
	        
	                sum += alpha * product;
	            }
	        
	            x[n] = sum * sqrt(2.0 / N);
	        }
	    }
	    
	    return x;
	},

    convolution: function(f,g) {

	    var F = f.length;
	    var G = g.lenght;
	    
	    var c = new Array(F);
	    
	    for (var t = 0; t < F; t++) {
	        for (var k = 0; k < F; k++) {
	            var a = f[k];
	            var b = (t - k > 0 && t - k < G) ? g[t-k] : 0;
	            c[t] = a * b;
	        }
	    }
	
	    return c;
	},

    gaussian: function(variance, threshold) {
	    with (Math) {
	        var radius = sqrt(log(threshold / (variance * sqrt(PI))) / variance);
	        var size = 2 * radius;
	        var g = new Array(size);
	        for (var t = 0; t < size; t++) {
	            var l = t + radius;
	            g[t] = exp(-variance * l * l);
	        }
	    }
	    
	    return Timeplot.Math.normalize(g);
	},

    normalize: function(f) {

	    var F = f.length;
	    var sum = 0.0;
	    
	    for (var t = 0; t < F; t++) {
	        sum += f[t];
	    }
	    
	    for (var t = 0; t < F; t++) {
	        f[t] /= sum;
	    }
	    
	    return f;
	}
}