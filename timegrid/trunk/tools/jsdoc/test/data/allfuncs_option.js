function _Action() {
	this._index = [];
	
	/** passthe action to another object */
	this.passTo = function(obj) {
		obj.actOn(this);
	}
	
	this._debug = function() {
		new _Debugger(this).report();
	}
	
	this.execute = function() {
		this._index.push(action);
	}
}

_Log = {
	file: "log.txt",
	dump: function(msg){
	}
};
