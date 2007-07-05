// combined nested object literals and functions

/** A document. */
var Site = {
	protocol: {
		Connection: function() {
			this.setTimeout = function(time){
			}
		}
	},
	/** @constructor */
	Mirror: function(page, depth) {
		/** The log report. */
		this.log = new Log();
	}
}