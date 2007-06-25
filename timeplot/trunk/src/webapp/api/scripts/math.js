Timeplot.Math = { 
	
	// operators: these are functions that operator on an array of numerical values
	// and return a different array of numeric values with the same size. These
	// can be used as a functional parameter to the Timeplot.Filter to process
	// such values 
	// ----------------------------------------------------------------------------
	
    integral: function(f) {
        var F = f.length;
        
        var g = new Array(F);
        var sum = 0;
        
        for (var t = 0; t < F; t++) {
           sum += f[t];
           g[t] = sum;  
        }
        
        return g;
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
    },
	
	directDCT: function(x) {
	    var N = x.length;
	    var y = new Array(N);
	
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

    inverseDCT : function(y) {
	    var N = y.length;
	    var x = new Array(N);
	    
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

    // ------ Utility functions on arrays ------------------------------------------------- 
    // (but that can't be used as filtering operators directly)

    range: function(f) {
        var F = f.length;
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        
        for (var t = 0; t < F; t++) {
            var value = f[t];
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }    
        }
        
        return {
            min: min,
            max: max
        }
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

    // ------ Array generators ------------------------------------------------- 
    // Functions that generate arrays based on mathematical functions
    // Normally these are used to produce operators by convolving them with the input array

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
	    
	    return this.normalize(g);
	},

    heavyside: function(size) {
    	var f =  new Array(size);
    	var value = 1 / size;
    	for (var t = 0; t < size; t++) {
    		f[t] = value;
    	}
    	return f;
    }
    
}