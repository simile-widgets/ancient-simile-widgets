var Record = new function() {
	var secretRecord = 1;
	
	function getSecretRecord() {
		alert("I am private.");
	}
	
	return /**@scope Record*/ {
		public_variable: 2,
		
		getRecord: function() {
			this.Reader = function() {
			
			}
			alert("I am public: "+this.public_variable+", "+secretRecord);
		}
	};
}

var File = function() {
	return /** @scope File */ {
		id: 255,
		
		getId: function() {
			alert(this.id);
		}
	};
}()

var Entry = function(subject) {
	this.subject = subject;
	this.getSubject = function(subjId) {
		alert(this.subject);
	};
	return this;
}("abc00");

dojo.declare(
	"dojo.widget.Widget",
	null, 
	/**
	 * @scope dojo.widget.Widget
	 */
	{
		initializer: function(container, args) {
			this.children = [];
			this.extraArgs = {};
			this.log = function(){
			};
		}
	}
);

Record.getRecord();
File.getId();
Entry.getSubject();