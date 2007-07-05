function dragFactory (element) {
	dragSpace.create(
	    $(element),
	    Dragger.register(
			/**@scope Dragger*/
			{
		      element:     element,
		      dropOnEmpty: false,
		      ghosting:    false,
		      scroll:      function(offset){
			  },
		      scrollSensitivity: 20,
		      scrollSpeed: 15,
		      format:      this.SERIALIZE_RULE,
			  /**@function*/ onChange:    Prototype.emptyFunction,
			  /**
			   * @name onUpdate
			   * @function
			   * @memberOf Dragger
			   */
			   onUpdate:    Prototype.emptyFunction
		    },
			arguments[1] || {}
		);

	    nifty.demote(element);
	);
}

dragFactory(this.window.getElementByName("palette"));