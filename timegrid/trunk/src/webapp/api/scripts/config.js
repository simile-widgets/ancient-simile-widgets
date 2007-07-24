/**
 * @fileOverview An object to store hierarchical configuration contexts
 * @name Configuration
 */
 
/**
 * @constructor
 */
Timegrid.Configuration = function(params, parent) {
    var params = $.clone(params);
    
    this.containsInThis = function(name) {
        return name in params;
    };
    
    this.contains = function(name) {
        return this.containsInThis(name) || 
            (this.getParent() && this.getParent().contains(name));
    };
    
    this.getInThis = function(name) {
        return params[name];
    };
    
    this.set = function(name, value) {
        params[name] = value;
    };
    
    this.get = function(name) {
        if (this.containsInThis(name)) {
            return this.getInThis(name);
        } else if (this.getParent()) {
            return this.getParent().get(name);
        } else {
            return null;
        }
    };
    
    this.getParent = function() {
        return parent;
    };
    
    this.setParent = function(config) {
        parent = config;
    };
    
    this.isRoot = function() {
        return parent == null;
    };
    
    this.getRoot = function() {
        return this.getParent() ? this.getParent().getRoot() : this;
    };
    
    this.setRoot = function(config) {
        this.getRoot().setParent(config);
        console.log("setRoot called.");
        this.printTree();
        console.log("with");
        config.printTree();
    };
    
    this.printTree = function() {
        console.log(params);
        if (this.getParent()) { this.getParent().printTree(); }
    };
    
};