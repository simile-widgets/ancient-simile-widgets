// nested constructors
/** @constructor */
function ShapeFactory() {
	/** @constructor */
    this.SquareMaker = function(size) {
    	/** @constructor */
        this.Square = function(s) {
        	/** The size. */
            this.size = s;
            this.display = function() {
                alert("square: "+s);
            }
        }
    }
}

/** @class */
function Circle(){}
/** The radius. */
Circle.prototype.radius = 1;

/**
	@member Circle
*/
getDiameter = f1;

/**
	@memberOf Circle
*/
getCircumference = f2;

String.prototype.toWords = function() {
}

// would be called like this:
// var s = new new new ShapeFactory().SquareMaker(4).Square(2);