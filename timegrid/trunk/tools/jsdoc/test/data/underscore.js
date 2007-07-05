framework.Action = function() {
	this._index = [];
	
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

function _Debugger(out){}
